from ultralytics import YOLO
import os

def train_model():
    # Load a pretrained YOLOv8n model
    model = YOLO('yolov8n.pt')

    # Define paths
    data_yaml = os.path.join(os.getcwd(), 'dataset', 'data.yaml')

    print(f"Starting fine-tuning using {data_yaml}...")

    # Train the model
    # We use a small number of epochs and small batch size due to the very small dataset
    results = model.train(
        data=data_yaml,
        epochs=10,
        imgsz=640,
        batch=2,
        project=os.getcwd(), # Ensure runs are in the project root
        name='runs'
    )

    print("\nTraining complete!")
    print(f"Results saved to: {results.save_dir}")

if __name__ == "__main__":
    train_model()
