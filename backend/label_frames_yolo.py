import os
import shutil
import requests
import cv2
from typing import Callable, Optional
from ultralytics import YOLO
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# ─── Keyword → COCO class ID mapping ─────────────────────────────────────────
KEYWORD_TO_COCO: dict[str, int] = {
    "person":       0, "bicycle":      1, "car":          2, "motorbike":    3,
    "motorcycle":   3, "aeroplane":    4, "airplane":     4, "bus":          5,
    "train":        6, "truck":        7, "boat":         8, "cat":         15,
    "dog":         16, "horse":       17, "cow":         19, "elephant":    20,
    "bear":        21, "zebra":       22, "giraffe":     23, "backpack":    24,
    "handbag":     26, "chair":       56, "couch":       57, "sofa":        57,
    "laptop":      63, "phone":       67, "cell phone":  67,
}

MODEL_VARIANT = os.path.join(os.path.dirname(__file__), "yolov8n.pt")
if not os.path.exists(MODEL_VARIANT):
    MODEL_VARIANT = "yolov8n.pt"


def _log(callback: Optional[Callable], level: str, msg: str):
    print(f"[{level}] {msg}")
    if callback:
        callback(level, msg)


def download_frame(url: str, save_path: str) -> bool:
    try:
        response = requests.get(url, stream=True, timeout=30)
        if response.status_code == 200:
            with open(save_path, "wb") as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            return True
    except Exception as e:
        print(f"Download failed for {url}: {e}")
    return False


def run_labeling(
    keyword: str,
    base_url: str,
    num_frames: int,
    dataset_dir: str = "dataset",
    log_callback: Optional[Callable[[str, str], None]] = None,
) -> dict:
    """
    Download frames from CDN, run YOLO inference with the resolved COCO class,
    split into train/val, write data.yaml, and return a summary dict.
    Also saves frames with drawn bounded boxes for frontend display.
    """
    kw = keyword.lower().strip()
    coco_class_id: Optional[int] = KEYWORD_TO_COCO.get(kw)

    if coco_class_id is None:
        _log(log_callback, "WARN",
             f"Keyword '{keyword}' not in COCO class map. "
             f"Will label all frames as class 0 '{keyword}' without YOLO filtering.")
        use_yolo_filter = False
    else:
        _log(log_callback, "INFO", f"Keyword '{keyword}' → COCO class {coco_class_id}")
        use_yolo_filter = True

    # ─── Directory setup ───────────────────────────────────────────────────
    train_images = os.path.join(dataset_dir, "train", "images")
    train_labels = os.path.join(dataset_dir, "train", "labels")
    val_images   = os.path.join(dataset_dir, "val",   "images")
    val_labels   = os.path.join(dataset_dir, "val",   "labels")
    annotated_dir  = os.path.join(dataset_dir, "annotated") # For frontend display

    if os.path.exists(dataset_dir):
        shutil.rmtree(dataset_dir)
    for d in [train_images, train_labels, val_images, val_labels, annotated_dir]:
        os.makedirs(d, exist_ok=True)

    # ─── data.yaml ────────────────────────────────────────────────────────
    data_yaml_path = os.path.join(dataset_dir, "data.yaml")
    with open(data_yaml_path, "w") as f:
        f.write(
            f"path: {os.path.abspath(dataset_dir)}\n"
            f"train: train/images\n"
            f"val: val/images\n\n"
            f"names:\n"
            f"  0: {keyword}\n"
        )

    if use_yolo_filter:
        _log(log_callback, "INFO", f"Loading YOLO model from {MODEL_VARIANT}...")
        model = YOLO(MODEL_VARIANT)

    temp_dir = os.path.join(dataset_dir, "_temp")
    os.makedirs(temp_dir, exist_ok=True)

    labeled_frames = []
    annotated_urls = []

    for i in range(1, num_frames + 1):
        frame_name = f"frame_{i:04d}.png"
        cdn_url    = f"{base_url}{frame_name}"
        img_path   = os.path.join(temp_dir, frame_name)

        _log(log_callback, "INFO", f"[{i}/{num_frames}] Downloading {frame_name}...")
        if not download_frame(cdn_url, img_path):
            continue

        annotated_path = os.path.join(annotated_dir, frame_name)
        img_cv2 = cv2.imread(img_path)
        h, w, _ = img_cv2.shape

        if use_yolo_filter:
            results = model(img_path, verbose=False)[0]
            yolo_labels = []
            found_boxes = False
            for box in results.boxes:
                if int(box.cls[0]) == coco_class_id:
                    xywhn = box.xywhn[0].tolist()
                    yolo_labels.append(
                        f"0 {xywhn[0]:.6f} {xywhn[1]:.6f} {xywhn[2]:.6f} {xywhn[3]:.6f}"
                    )
                    # Draw box
                    x_center, y_center, width, height = xywhn
                    x1 = int((x_center - width / 2) * w)
                    y1 = int((y_center - height / 2) * h)
                    x2 = int((x_center + width / 2) * w)
                    y2 = int((y_center + height / 2) * h)
                    cv2.rectangle(img_cv2, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(img_cv2, keyword, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
                    found_boxes = True

            if yolo_labels:
                labeled_frames.append({
                    "name":      frame_name,
                    "img_path":  img_path,
                    "labels":    yolo_labels,
                })
                cv2.imwrite(annotated_path, img_cv2)
                annotated_urls.append(frame_name)
                _log(log_callback, "INFO", f"  → {len(yolo_labels)} {keyword}(s) detected.")
            else:
                os.remove(img_path)
        else:
            yolo_labels = [f"0 0.500000 0.500000 1.000000 1.000000"]
            labeled_frames.append({
                "name":     frame_name,
                "img_path": img_path,
                "labels":   yolo_labels,
            })
            # Draw a full-frame box as placeholder
            cv2.rectangle(img_cv2, (0, 0), (w, h), (0, 255, 0), 4)
            cv2.putText(img_cv2, keyword, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
            cv2.imwrite(annotated_path, img_cv2)
            annotated_urls.append(frame_name)

    # ─── Train / Val split ────────────────────────────────────────────────
    if len(labeled_frames) < 2:
        train_list = labeled_frames
        val_list   = []
    else:
        split_idx = max(int(len(labeled_frames) * 0.8), 1)
        if split_idx >= len(labeled_frames):
            split_idx = len(labeled_frames) - 1
        train_list = labeled_frames[:split_idx]
        val_list   = labeled_frames[split_idx:]

    def save_split(frames_list, img_dir, lbl_dir):
        for item in frames_list:
            shutil.move(item["img_path"], os.path.join(img_dir, item["name"]))
            label_path = os.path.join(lbl_dir, item["name"].replace(".png", ".txt"))
            with open(label_path, "w") as f:
                f.write("\n".join(item["labels"]))

    _log(log_callback, "INFO", f"Organizing: {len(train_list)} train, {len(val_list)} val...")
    save_split(train_list, train_images, train_labels)
    save_split(val_list,   val_images,   val_labels)

    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)

    return {
        "keyword":     keyword,
        "labeled":     len(labeled_frames),
        "train":       len(train_list),
        "val":         len(val_list),
        "dataset_dir": os.path.abspath(dataset_dir),
        "annotated_frames": annotated_urls,
    }
