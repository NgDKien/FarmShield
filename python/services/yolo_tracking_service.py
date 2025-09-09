import cv2
import numpy as np
from ultralytics import YOLO
from threading import Thread, Lock
import time
from collections import defaultdict
import os

class YOLOTrackingService:
    def __init__(self):
        # Load the YOLOv8 model (using a pre-trained model)
        # You can specify different models like 'yolov8n.pt', 'yolov8s.pt', etc.
        self.model = YOLO('yolov8n.pt')  # nano model for faster inference
        self.tracker = None
        self.lock = Lock()
        self.is_tracking = False
        self.tracking_thread = None
        self.camera = None
        self.last_detection_time = defaultdict(float)
        self.detection_cooldown = 2.0  # seconds between detections for same person
        
        # For cloth change detection
        self.person_clothing_features = {}  # Store clothing features for each person
        self.cloth_change_threshold = 0.7  # Threshold for detecting cloth change
        
        # For hand washing detection
        self.hand_washing_actions = {}  # Track hand washing actions
        self.hand_washing_threshold = 15  # Minimum frames for hand washing action
        self.hand_positions = defaultdict(list)  # Track hand positions over time
        self.last_hand_check = defaultdict(float)
        self.hand_check_interval = 1.0  # Check hands every second
        
        # For tracking person states
        self.person_states = defaultdict(dict)
        
        # For visualization
        self.annotated_frame = None
        self.events = []  # Store recent events for visualization
        
    def start_tracking(self, camera):
        """Start the tracking process on the given camera"""
        if self.is_tracking:
            print("[YOLO] Tracking already running")
            return
            
        self.camera = camera
        self.is_tracking = True
        self.tracking_thread = Thread(target=self._tracking_loop, daemon=True)
        self.tracking_thread.start()
        print("[YOLO] Started tracking thread")
        
    def stop_tracking(self):
        """Stop the tracking process"""
        self.is_tracking = False
        if self.tracking_thread and self.tracking_thread.is_alive():
            self.tracking_thread.join(timeout=5)
        self.annotated_frame = None
        print("[YOLO] Stopped tracking")
        
    def get_annotated_frame(self):
        """Get the latest annotated frame"""
        return self.annotated_frame
        
    def _tracking_loop(self):
        """Main tracking loop"""
        while self.is_tracking:
            try:
                frame = self.camera.get_frame()
                if frame is None:
                    time.sleep(0.03)  # Small delay to prevent busy waiting
                    continue
                    
                # Run YOLOv8 detection and tracking
                results = self.model.track(frame, persist=True, classes=[0])  # Class 0 is 'person'
                
                # Process results
                self._process_detections(frame, results)
                
                # Store annotated frame for visualization
                if results and len(results) > 0:
                    self.annotated_frame = results[0].plot()
                    # Add event annotations to the frame
                    self._draw_event_annotations()
                else:
                    self.annotated_frame = frame.copy()
                    # Add event annotations to the frame
                    self._draw_event_annotations()
                
                time.sleep(0.03)  # Control frame rate
            except Exception as e:
                print(f"[YOLO] Error in tracking loop: {e}")
                time.sleep(1)
                
    def _process_detections(self, frame, results):
        """Process detection results"""
        if not results or len(results) == 0:
            return
            
        result = results[0]  # Get first result
        if not hasattr(result, 'boxes') or result.boxes is None:
            return
            
        # Extract bounding boxes, confidences, and class IDs
        boxes = result.boxes.xyxy.cpu().numpy()  # Bounding boxes
        confidences = result.boxes.conf.cpu().numpy()  # Confidence scores
        class_ids = result.boxes.cls.cpu().numpy()  # Class IDs
        track_ids = result.boxes.id.cpu().numpy() if result.boxes.id is not None else [None] * len(boxes)
        
        current_time = time.time()
        
        # Process each detected person
        for i, (box, confidence, class_id, track_id) in enumerate(zip(boxes, confidences, class_ids, track_ids)):
            if class_id == 0 and confidence > 0.5:  # Person detected with good confidence
                x1, y1, x2, y2 = map(int, box)
                person_id = int(track_id) if track_id is not None else i
                
                # Check if we should process this detection (cooldown)
                if current_time - self.last_detection_time[person_id] > self.detection_cooldown:
                    self.last_detection_time[person_id] = current_time
                    
                    # Extract person region
                    person_img = frame[y1:y2, x1:x2]
                    
                    # Check for cloth change
                    self._check_cloth_change(person_id, person_img)
                    
                    # Check for hand washing (periodically)
                    if current_time - self.last_hand_check[person_id] > self.hand_check_interval:
                        self.last_hand_check[person_id] = current_time
                        self._check_hand_washing(person_id, frame, box)
                    
    def _check_cloth_change(self, person_id, person_img):
        """Check if the person has changed clothes"""
        if person_img.size == 0:
            return
            
        # Extract color histogram as a simple clothing feature
        hist = cv2.calcHist([person_img], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        hist = cv2.normalize(hist, hist).flatten()
        
        if person_id in self.person_clothing_features:
            # Compare with previous clothing features
            prev_hist = self.person_clothing_features[person_id]
            similarity = cv2.compareHist(hist, prev_hist, cv2.HISTCMP_CORREL)
            
            if similarity < self.cloth_change_threshold:
                print(f"[YOLO] Cloth change detected for person {person_id} (similarity: {similarity:.2f})")
                # Here you would trigger your cloth change event/action
                self._on_cloth_change_detected(person_id)
                
        # Update clothing features
        self.person_clothing_features[person_id] = hist
        
    def _check_hand_washing(self, person_id, frame, box):
        """Check if the person is washing hands"""
        # Extract person region
        x1, y1, x2, y2 = map(int, box)
        
        # Run additional detection for hands and other relevant objects
        # We'll use YOLO to detect hands and sinks in the person's region
        person_region = frame[y1:y2, x1:x2]
        
        if person_region.size == 0:
            return
            
        # Run YOLO on the person region to detect hands and sinks
        # Note: This is a simplified approach - in practice you might want to use a specialized hand detector
        hand_results = self.model(person_region, classes=[0])  # Simplified - detecting people within people
        
        # Check if person is in the lower part of frame (near sink area)
        frame_height = frame.shape[0]
        
        # More sophisticated hand washing detection
        if y2 > frame_height * 0.6:  # Person is in lower 40% of frame (near sinks)
            # Update person state
            if 'in_sink_area' not in self.person_states[person_id]:
                self.person_states[person_id]['in_sink_area'] = 0
            self.person_states[person_id]['in_sink_area'] += 1
            
            # Check for repetitive hand movements
            if person_id not in self.hand_washing_actions:
                self.hand_washing_actions[person_id] = 0
                
            # If person has been in sink area for a while, consider it hand washing
            if self.person_states[person_id]['in_sink_area'] > 5:
                self.hand_washing_actions[person_id] += 1
                
                if self.hand_washing_actions[person_id] > self.hand_washing_threshold:
                    print(f"[YOLO] Hand washing detected for person {person_id}")
                    # Here you would trigger your hand washing event/action
                    self._on_hand_washing_detected(person_id)
                    # Reset counters after detection
                    self.hand_washing_actions[person_id] = 0
                    self.person_states[person_id]['in_sink_area'] = 0
        else:
            # Reset counters if person moves away from sink area
            if person_id in self.hand_washing_actions:
                self.hand_washing_actions[person_id] = 0
            if 'in_sink_area' in self.person_states[person_id]:
                self.person_states[person_id]['in_sink_area'] = 0
                
    def _on_cloth_change_detected(self, person_id):
        """Callback when cloth change is detected"""
        # This is where you would integrate with your system
        # For example, send a notification or update a database
        print(f"[YOLO] Cloth change event for person {person_id}")
        # Add event for visualization
        self.events.append({
            'type': 'cloth_change',
            'person_id': person_id,
            'time': time.time()
        })
        # Keep only recent events (last 10 seconds)
        self.events = [e for e in self.events if time.time() - e['time'] < 10]
        # TODO: Integrate with your system (e.g., API call to backend)
        
    def _on_hand_washing_detected(self, person_id):
        """Callback when hand washing is detected"""
        # This is where you would integrate with your system
        # For example, send a notification or update a database
        print(f"[YOLO] Hand washing event for person {person_id}")
        # Add event for visualization
        self.events.append({
            'type': 'hand_washing',
            'person_id': person_id,
            'time': time.time()
        })
        # Keep only recent events (last 10 seconds)
        self.events = [e for e in self.events if time.time() - e['time'] < 10]
        # TODO: Integrate with your system (e.g., API call to backend)
        
    def _draw_event_annotations(self):
        """Draw event annotations on the frame"""
        if self.annotated_frame is None:
            return
            
        current_time = time.time()
        # Filter events to only show recent ones (last 5 seconds)
        recent_events = [e for e in self.events if current_time - e['time'] < 5]
        
        for event in recent_events:
            # Display event notification at the top of the frame
            y_pos = 30 + (recent_events.index(event) * 30)
            if event['type'] == 'cloth_change':
                text = f"Cloth Change Detected for Person {event['person_id']}!"
                color = (0, 165, 255)  # Orange
            elif event['type'] == 'hand_washing':
                text = f"Hand Washing Detected for Person {event['person_id']}!"
                color = (255, 0, 0)  # Blue
            
            cv2.putText(self.annotated_frame, text, (10, y_pos), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
    def _on_hand_washing_detected(self, person_id):
        """Callback when hand washing is detected"""
        # This is where you would integrate with your system
        # For example, send a notification or update a database
        print(f"[YOLO] Hand washing event for person {person_id}")
        # TODO: Integrate with your system (e.g., API call to backend)