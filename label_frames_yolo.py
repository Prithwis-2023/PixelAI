import os
import cv2
import requests
import json
from ultralytics import YOLO
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_TABLE = os.getenv("SUPABASE_TABLE", "video_storage")

# YOLO configuration
MODEL_VARIANT = "yolov8n.pt" # Using nano model for speed
TARGET_CLASS_NAME = "train" 
# In COCO dataset, 'train' is usually index 6
COCO_TRAIN_CLASS_ID = 6

# Local storage configuration
DATASET_DIR = "dataset"
IMAGES_DIR = os.path.join(DATASET_DIR, "images")
LABELS_DIR = os.path.join(DATASET_DIR, "labels")

# Init Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def download_frame(url, save_path):
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        return True
    return False

def run_labeling():
    # 1. Fetch metadata from Supabase
    # Getting the latest processed video
    print("Fetching metadata from Supabase...")
    response = supabase.table(SUPABASE_TABLE).select("*").order("created_at", desc=True).limit(1).execute()
    
    if not response.data:
        print("No video records found in Supabase.")
        return

    record = response.data[0]
    base_url = record['base_url']
    num_frames = record['number_of_frames']
    repo_name = record['repo_name']
    
    print(f"Processing Repo: {repo_name}")
    print(f"Base CDN URL: {base_url}")
    print(f"Number of frames to labels: {num_frames}")

    # 2. Setup Directories
    os.makedirs(IMAGES_DIR, exist_ok=True)
    os.makedirs(LABELS_DIR, exist_ok=True)

    # 3. Load YOLO Model
    print(f"Loading YOLO model: {MODEL_VARIANT}...")
    model = YOLO(MODEL_VARIANT)

    # 4. Download and Label
    for i in range(1, num_frames + 1):
        frame_name = f"frame_{i:04d}.png"
        cdn_url = f"{base_url}{frame_name}"
        img_path = os.path.join(IMAGES_DIR, frame_name)
        label_path = os.path.join(LABELS_DIR, frame_name.replace(".png", ".txt"))

        print(f"[{i}/{num_frames}] Downloading {frame_name}...")
        if not download_frame(cdn_url, img_path):
            print(f"Failed to download {frame_name}")
            continue

        # Inference
        results = model(img_path, verbose=False)[0]
        
        # Filter and save labels in YOLO format
        yolo_labels = []
        img_h, img_w = results.orig_shape

        for box in results.boxes:
            class_id = int(box.cls[0])
            
            # We only want the "train" class
            if class_id == COCO_TRAIN_CLASS_ID:
                # box.xywhn returns normalized [x_center, y_center, width, height]
                xywhn = box.xywhn[0].tolist()
                label_line = f"0 {xywhn[0]:.6f} {xywhn[1]:.6f} {xywhn[2]:.6f} {xywhn[3]:.6f}"
                yolo_labels.append(label_line)

        # Write to .txt file
        with open(label_path, "w") as f:
            f.write("\n".join(yolo_labels))

        print(f"Labeled {frame_name}: Found {len(yolo_labels)} {TARGET_CLASS_NAME}(s)")

    print(f"\nLabeling complete! Dataset organized in '{DATASET_DIR}/'")

if __name__ == "__main__":
    run_labeling()
