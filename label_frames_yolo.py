import os
import cv2
import requests
import json
import shutil
from ultralytics import YOLO
from supabase import create_client, Client
from dotenv import load_dotenv
from train_yolo import train_model

load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_TABLE = os.getenv("SUPABASE_TABLE", "video_storage")

# YOLO configuration
MODEL_VARIANT = "yolov8n.pt" 
COCO_TRAIN_CLASS_ID = 6

# Local storage configuration
DATASET_DIR = "dataset"
TRAIN_IMAGES = os.path.join(DATASET_DIR, "train", "images")
TRAIN_LABELS = os.path.join(DATASET_DIR, "train", "labels")
VAL_IMAGES = os.path.join(DATASET_DIR, "val", "images")
VAL_LABELS = os.path.join(DATASET_DIR, "val", "labels")

# Init Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def setup_directories():
    for d in [TRAIN_IMAGES, TRAIN_LABELS, VAL_IMAGES, VAL_LABELS]:
        os.makedirs(d, exist_ok=True)

def generate_data_yaml():
    yaml_content = f"""path: {os.path.abspath(DATASET_DIR)}
train: train/images
val: val/images

names:
  0: train
"""
    with open(os.path.join(DATASET_DIR, "data.yaml"), "w") as f:
        f.write(yaml_content)

def download_frame(url, save_path):
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        return True
    return False

def run_labeling_and_train():
    # 1. Fetch metadata from Supabase
    print("Fetching metadata from Supabase...")
    response = supabase.table(SUPABASE_TABLE).select("*").order("created_at", desc=True).limit(1).execute()
    
    if not response.data:
        print("No video records found in Supabase.")
        return

    record = response.data[0]
    base_url = record['base_url']
    num_frames = record['number_of_frames']
    
    print(f"Base CDN URL: {base_url}")
    print(f"Number of frames: {num_frames}")

    # 2. Setup
    if os.path.exists(DATASET_DIR):
        shutil.rmtree(DATASET_DIR)
    setup_directories()
    generate_data_yaml()

    # 3. Load YOLO Model
    print(f"Loading YOLO model: {MODEL_VARIANT}...")
    model = YOLO(MODEL_VARIANT)

    # 4. Download and Label
    labeled_frames = [] # Store pairs of (img_path, labels_list)
    
    # Temporary directory for initial collection
    temp_dir = "temp_dataset"
    os.makedirs(temp_dir, exist_ok=True)

    for i in range(1, num_frames + 1):
        frame_name = f"frame_{i:04d}.png"
        cdn_url = f"{base_url}{frame_name}"
        img_path = os.path.join(temp_dir, frame_name)

        print(f"[{i}/{num_frames}] Downloading and analyzing {frame_name}...")
        if not download_frame(cdn_url, img_path):
            continue

        # Inference
        results = model(img_path, verbose=False)[0]
        yolo_labels = []
        for box in results.boxes:
            if int(box.cls[0]) == COCO_TRAIN_CLASS_ID:
                xywhn = box.xywhn[0].tolist()
                yolo_labels.append(f"0 {xywhn[0]:.6f} {xywhn[1]:.6f} {xywhn[2]:.6f} {xywhn[3]:.6f}")

        if len(yolo_labels) > 0:
            labeled_frames.append({
                "name": frame_name,
                "img_path": img_path,
                "labels": yolo_labels
            })
            print(f"  -> Found {len(yolo_labels)} train(s). Added to collection.")
        else:
            print(f"  -> No train found. Skipping.")
            os.remove(img_path) # Clean up unlabeled frames

    print(f"\nLabeling complete! Total labeled images: {len(labeled_frames)}")

    # 5. Split and Organize
    if len(labeled_frames) < 2:
        print("Warning: Not enough labeled frames to split into train and val. All will go to train.")
        train_list = labeled_frames
        val_list = []
    else:
        # Split: 80% train, 20% val (at least 1 in val)
        split_idx = max(int(len(labeled_frames) * 0.8), 1)
        # Handle case where 80% might be all frames
        if split_idx >= len(labeled_frames):
            split_idx = len(labeled_frames) - 1
            
        train_list = labeled_frames[:split_idx]
        val_list = labeled_frames[split_idx:]

    def save_split(frames_list, img_dir, lbl_dir):
        for item in frames_list:
            shutil.move(item["img_path"], os.path.join(img_dir, item["name"]))
            label_path = os.path.join(lbl_dir, item["name"].replace(".png", ".txt"))
            with open(label_path, "w") as f:
                f.write("\n".join(item["labels"]))

    print(f"Organizing dataset: {len(train_list)} train, {len(val_list)} val...")
    save_split(train_list, TRAIN_IMAGES, TRAIN_LABELS)
    save_split(val_list, VAL_IMAGES, VAL_LABELS)
    
    # Cleanup temp dir
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)

    # 6. Trigger Training
    print("\n--- Starting Automated Fine-tuning ---")
    train_model()

if __name__ == "__main__":
    run_labeling_and_train()
