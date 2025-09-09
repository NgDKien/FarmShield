import os
from ultralytics import YOLO

def download_yolo_model():
    """Download YOLOv8 model if not present"""
    try:
        # This will automatically download the model if not present
        model = YOLO('yolov8n.pt')
        print("YOLOv8 model is ready!")
        return True
    except Exception as e:
        print(f"Error downloading YOLOv8 model: {e}")
        return False

if __name__ == "__main__":
    download_yolo_model()