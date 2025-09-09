#!/usr/bin/env python3
"""
Test script for YOLO tracking service
This script tests the YOLO tracking service with a sample video or camera feed
"""

import cv2
import sys
import os
import time

# Add the python directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from services.yolo_tracking_service import YOLOTrackingService
from camera_manager import Camera, CameraManager

def test_yolo_tracking(rtsp_url="0"):  # Default to webcam
    """Test the YOLO tracking service"""
    print("Starting YOLO tracking test...")
    
    # Create camera manager and camera
    camera_manager = CameraManager()
    
    # For webcam testing
    if rtsp_url == "0":
        camera = Camera(0)  # Use webcam
    else:
        camera = camera_manager.get_or_create_camera("test_camera", rtsp_url)
    
    if camera is None:
        print("Failed to initialize camera")
        return
    
    # Create YOLO tracking service
    yolo_service = YOLOTrackingService()
    
    # Start tracking
    yolo_service.start_tracking(camera)
    
    print("Tracking started. Press 'q' to quit.")
    
    try:
        # Show the camera feed with tracking
        while True:
            frame = camera.get_frame()
            if frame is not None:
                # Display the frame
                cv2.imshow("YOLO Tracking", frame)
                
                # Break on 'q' key press
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                    
            time.sleep(0.03)
    except KeyboardInterrupt:
        print("Interrupted by user")
    finally:
        # Stop tracking and cleanup
        yolo_service.stop_tracking()
        camera_manager.stop_all_cameras()
        cv2.destroyAllWindows()
        print("Test completed.")

if __name__ == "__main__":
    # Check if RTSP URL is provided as command line argument
    #rtsp_url = sys.argv[1] if len(sys.argv) > 1 else "0"
    rtsp_url = "rtsp://localhost:8554/webcam"
    test_yolo_tracking(rtsp_url)