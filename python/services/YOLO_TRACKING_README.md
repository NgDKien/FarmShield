# YOLOv8 Human Tracking Service

This service provides human tracking capabilities using YOLOv8 for detecting hand washing and cloth changes.

## Features

1. **Human Detection and Tracking**: Uses YOLOv8 to detect and track people in video streams
2. **Cloth Change Detection**: Detects when a person changes their clothes using color histogram comparison
3. **Hand Washing Detection**: Detects hand washing actions based on movement patterns and location

## Installation

1. Install the required packages:
   ```bash
   pip install ultralytics
   ```

2. The service will automatically download the YOLOv8 model on first run.

## Integration with Face Recognition System

The YOLO tracking service has been integrated with the existing face recognition system through WebSocket commands:

- `start_tracking`: Starts the YOLO tracking on a specified camera
- `stop_tracking`: Stops the YOLO tracking

## Usage

### WebSocket Commands

To control the tracking service via WebSocket, send JSON commands with the following format:

```json
{
  "type": "start_tracking",
  "camera_id": "cam_001",
  "rtsp_url": "rtsp://example.com/stream"
}
```

```json
{
  "type": "stop_tracking",
  "camera_id": "cam_001"
}
```

### Direct Usage

You can also use the service directly in your Python code:

```python
from services.yolo_tracking_service import YOLOTrackingService
from camera_manager import Camera

# Create camera and tracking service
camera = Camera("rtsp://example.com/stream")
tracker = YOLOTrackingService()

# Start tracking
tracker.start_tracking(camera)

# ... do other work ...

# Stop tracking
tracker.stop_tracking()
```

## Detection Logic

### Cloth Change Detection

The service uses color histogram comparison to detect cloth changes:
1. Captures a color histogram of a person's clothing
2. Compares it with previous histograms
3. If the similarity falls below a threshold (0.7), a cloth change is detected

### Hand Washing Detection

The service detects hand washing through:
1. Monitoring if a person is in the lower part of the frame (near sinks)
2. Tracking repetitive movements in that area
3. If sufficient movement is detected, hand washing is identified

## Configuration

You can adjust the following parameters in the `YOLOTrackingService` class:

- `cloth_change_threshold`: Threshold for cloth change detection (default: 0.7)
- `hand_washing_threshold`: Minimum frames for hand washing detection (default: 15)
- `detection_cooldown`: Seconds between detections for the same person (default: 2.0)

## API Integration

To integrate with your backend system, modify the following methods:
- `_on_cloth_change_detected()`: Called when a cloth change is detected
- `_on_hand_washing_detected()`: Called when hand washing is detected

These methods currently just print to the console but can be modified to make API calls to your backend.