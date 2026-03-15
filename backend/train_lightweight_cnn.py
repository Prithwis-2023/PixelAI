import os
import glob
import json
import time
from typing import Callable, Optional

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from PIL import Image
from torchvision import transforms
import torchvision.transforms.functional as F

# ─── Bounding Box IoU Helper ──────────────────────────────────────────────────
def bbox_iou(box1, box2):
    """
    Calculate mean Intersection over Union (IoU) for a batch of bounding boxes.
    Expects tensor of shape [batch, 4] with format [x_center, y_center, w, h]
    """
    b1_x1, b1_x2 = box1[:, 0] - box1[:, 2] / 2, box1[:, 0] + box1[:, 2] / 2
    b1_y1, b1_y2 = box1[:, 1] - box1[:, 3] / 2, box1[:, 1] + box1[:, 3] / 2
    
    b2_x1, b2_x2 = box2[:, 0] - box2[:, 2] / 2, box2[:, 0] + box2[:, 2] / 2
    b2_y1, b2_y2 = box2[:, 1] - box2[:, 3] / 2, box2[:, 1] + box2[:, 3] / 2
    
    inter_x1 = torch.max(b1_x1, b2_x1)
    inter_y1 = torch.max(b1_y1, b2_y1)
    inter_x2 = torch.min(b1_x2, b2_x2)
    inter_y2 = torch.min(b1_y2, b2_y2)
    
    inter_area = torch.clamp(inter_x2 - inter_x1, min=0) * torch.clamp(inter_y2 - inter_y1, min=0)
    b1_area = (b1_x2 - b1_x1) * (b1_y2 - b1_y1)
    b2_area = (b2_x2 - b2_x1) * (b2_y2 - b2_y1)
    
    iou = inter_area / (b1_area + b2_area - inter_area + 1e-6)
    return iou.mean().item()

# ─── Simple BBox CNN Model ────────────────────────────────────────────────────────
class BBoxRegressor(nn.Module):
    def __init__(self):
        super(BBoxRegressor, self).__init__()
        # Input: 3 channel image (128x128)
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # 64x64

            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # 32x32

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2)   # 16x16
        )
        # 64 channels * 16 * 16 = 16384
        self.regressor = nn.Sequential(
            nn.Flatten(),
            nn.Linear(16384, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 4), # Output: [x_center, y_center, width, height]
            nn.Sigmoid()       # Since coordinates are normalized [0, 1]
        )

    def forward(self, x):
        x = self.features(x)
        x = self.regressor(x)
        return x

# ─── Dataset Loader ──────────────────────────────────────────────────────────
class YOLODataset(Dataset):
    def __init__(self, img_dir, label_dir, transform=None):
        self.img_dir = img_dir
        self.label_dir = label_dir
        self.transform = transform
        self.img_files = sorted(
            glob.glob(os.path.join(img_dir, "*.png")) + 
            glob.glob(os.path.join(img_dir, "*.jpg"))
        )

    def __len__(self):
        return len(self.img_files)

    def __getitem__(self, idx):
        img_path = self.img_files[idx]
        basename = os.path.basename(img_path)
        label_path = os.path.join(self.label_dir, os.path.splitext(basename)[0] + ".txt")

        # Load image
        img = Image.open(img_path).convert("RGB")
        if self.transform:
            img = self.transform(img)

        # Load YOLO label (class x_center y_center width height)
        # If no label file or empty, just return [0.5, 0.5, 1.0, 1.0] (full image)
        coords = [0.5, 0.5, 1.0, 1.0]
        if os.path.exists(label_path):
            with open(label_path, "r") as f:
                line = f.readline().strip()
                if line:
                    parts = line.split()
                    if len(parts) >= 5:
                        # parts[0] is class_id
                        coords = [float(p) for p in parts[1:5]]
        
        target = torch.tensor(coords, dtype=torch.float32)
        return img, target

# ─── Helpers ──────────────────────────────────────────────────────────────────
def _log(callback: Optional[Callable], level: str, msg: str):
    print(f"[{level}] {msg}")
    if callback:
        callback(level, msg)

# ─── Main Training Function ──────────────────────────────────────────────────
def run_training(
    dataset_dir: str,
    epochs: int = 10,
    batch_size: int = 4,
    log_callback: Optional[Callable[[str, str], None]] = None,
) -> dict:
    
    _log(log_callback, "INFO", "Initializing lightweight CNN model...")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = BBoxRegressor().to(device)
    
    criterion = nn.MSELoss()
    # Decreased learning rate to help with overfitting, added weight decay
    optimizer = optim.Adam(model.parameters(), lr=0.0005, weight_decay=1e-4)

    # Added non-spatial data augmentations to prevent overfitting
    train_transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        transforms.ToTensor(),
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ToTensor(),
    ])

    train_img_dir = os.path.join(dataset_dir, "train", "images")
    train_lbl_dir = os.path.join(dataset_dir, "train", "labels")
    val_img_dir = os.path.join(dataset_dir, "val", "images")
    val_lbl_dir = os.path.join(dataset_dir, "val", "labels")

    train_dataset = YOLODataset(train_img_dir, train_lbl_dir, transform=train_transform)
    val_dataset = YOLODataset(val_img_dir, val_lbl_dir, transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    _log(log_callback, "INFO", f"Train size: {len(train_dataset)} | Val size: {len(val_dataset)}")
    _log(log_callback, "INFO", f"Starting training for {epochs} epochs on {device}...")

    metrics = {
        "epochs": [],
        "train_loss": [],
        "val_loss": [],
        "train_iou": [],
        "val_iou": [],
        "time_per_epoch": []
    }

    start_time = time.time()

    for epoch in range(epochs):
        epoch_start = time.time()

        # Training phase
        model.train()
        running_train_loss = 0.0
        running_train_iou = 0.0
        for images, targets in train_loader:
            images, targets = images.to(device), targets.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            
            running_train_loss += loss.item() * images.size(0)
            running_train_iou += bbox_iou(outputs.detach(), targets) * images.size(0)

        epoch_train_loss = running_train_loss / max(len(train_dataset), 1)
        epoch_train_iou = running_train_iou / max(len(train_dataset), 1)

        # Validation phase
        model.eval()
        running_val_loss = 0.0
        running_val_iou = 0.0
        with torch.no_grad():
            for images, targets in val_loader:
                images, targets = images.to(device), targets.to(device)
                outputs = model(images)
                loss = criterion(outputs, targets)
                
                running_val_loss += loss.item() * images.size(0)
                running_val_iou += bbox_iou(outputs, targets) * images.size(0)

        epoch_val_loss = running_val_loss / max(len(val_dataset), 1)
        epoch_val_iou = running_val_iou / max(len(val_dataset), 1)
        epoch_time = time.time() - epoch_start
        
        metrics["epochs"].append(epoch + 1)
        metrics["train_loss"].append(round(epoch_train_loss, 4))
        metrics["val_loss"].append(round(epoch_val_loss, 4))
        metrics["train_iou"].append(round(epoch_train_iou, 4))
        metrics["val_iou"].append(round(epoch_val_iou, 4))
        metrics["time_per_epoch"].append(round(epoch_time, 2))

        _log(log_callback, "INFO", f"Epoch [{epoch+1}/{epochs}] - Train Loss: {epoch_train_loss:.4f} - Val Loss: {epoch_val_loss:.4f} - Val IoU: {epoch_val_iou:.4f}")

    total_time = time.time() - start_time
    _log(log_callback, "SUCCESS", f"Training completed in {total_time:.2f} seconds!")

    # Save model
    model_path = os.path.join(dataset_dir, "model_weights.pth")
    torch.save(model.state_dict(), model_path)
    _log(log_callback, "INFO", f"Saved model weights to {model_path}")

    # Save metrics JSON
    metrics_path = os.path.join(dataset_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=4)
    _log(log_callback, "INFO", f"Saved metrics to {metrics_path}")

    return {
        "final_train_loss": metrics["train_loss"][-1] if metrics["train_loss"] else 0,
        "final_val_loss": metrics["val_loss"][-1] if metrics["val_loss"] else 0,
        "metrics_file": metrics_path,
        "model_file": model_path
    }

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python train_lightweight_cnn.py <dataset_dir>")
        sys.exit(1)
    
    dir_path = sys.argv[1]
    res = run_training(dir_path)
    print("Done.", res)
