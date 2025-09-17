import cv2
import numpy as np
from ultralytics import YOLO
from threading import Thread, Lock
import time
from collections import defaultdict
import os
import api.api_caller as api_caller
from datetime import datetime

class YOLOTrackingService:
    def __init__(self):
        self.model = YOLO('yolov8n.pt')
        self.pose_model = YOLO('yolov8n-pose.pt')
        self.cloth_model = YOLO('ManUnitedShirt_model.pt')
        self.tracker = None
        self.lock = Lock()
        self.is_tracking = False
        self.tracking_thread = None
        self.camera = None
        self.last_detection_time = defaultdict(float)
        self.detection_cooldown = 2.0

        self.person_cloth_state = {}
        self.target_cloth = 'Manchester United red shirts'

        self.hand_washing_threshold = 10
        self.last_hand_check = defaultdict(float)
        self.hand_check_interval = 0.2

        self.person_states = defaultdict(lambda: {
            'is_washing': False,
            'washing_start_time': None,
            'last_hand_position': None,
            'motion_detected': False
        })
        self.HAND_MOTION_THRESHOLD = 10

        self.annotated_frame = None
        self.events = []
        self.person_cloth_info = {}
        self.person_boxes = {}

        self.sink_locations = []
        self.predefined_sink_locations = [(100, 200, 300, 400)]

        self.HAND_KEYPOINT_INDICES = [5, 6, 7, 8, 9, 10]
        self.WRIST_KEYPOINT_INDICES = [9, 10]
        self.HAND_LIMB_CONNECTIONS = [
            (5, 7),
            (7, 9),
            (6, 8),
            (8, 10)
        ]

        self.person_id_mapping = {}
        self.person_detection_times = {}
        self.last_person_count = 0
        self.last_fetch_time = 0
        self.min_fetch_interval = 0.5

        self.lost_person_timestamps = {}
        self.person_lost_delay = 5

    def start_tracking(self, camera):
        if self.is_tracking:
            print("[YOLO] Tracking already running")
            return

        self.camera = camera
        self.is_tracking = True
        self.tracking_thread = Thread(target=self._tracking_loop, daemon=True)
        self.tracking_thread.start()
        print("[YOLO] Started tracking thread")

    def stop_tracking(self):
        self.is_tracking = False
        if self.tracking_thread and self.tracking_thread.is_alive():
            self.tracking_thread.join(timeout=5)
        self.annotated_frame = None
        print("[YOLO] Stopped tracking")

    def get_annotated_frame(self):
        return self.annotated_frame

    def _tracking_loop(self):
        while self.is_tracking:
            try:
                frame = self.camera.get_frame()
                if frame is None:
                    time.sleep(0.03)
                    continue

                object_results = self.model(frame, classes=[71], verbose=False, device='0')

                pose_results = self.pose_model.track(frame, persist=True, classes=[0], verbose=False, device='0')

                self._process_sinks(frame, object_results)

                self._process_people(frame, pose_results)

                if pose_results and len(pose_results) > 0:
                    self.annotated_frame = self._draw_custom_pose_annotations(frame.copy(), pose_results)

                    if object_results and len(object_results) > 0:
                        self.annotated_frame = object_results[0].plot(conf=False, labels=False, img=self.annotated_frame)
                elif object_results and len(object_results) > 0:
                    self.annotated_frame = object_results[0].plot()
                else:
                    self.annotated_frame = frame.copy()

                self._draw_event_annotations()
                self._draw_sinks_annotations()

                time.sleep(0.03)
            except Exception as e:
                print(f"[YOLO] Error in tracking loop: {e}")
                time.sleep(1)

    def set_predefined_sinks(self, sinks_list):
        self.predefined_sink_locations = sinks_list
        print(f"[YOLO] Pre-defined sinks set: {self.predefined_sink_locations}")

    def _process_sinks(self, frame, results):
        current_sink_locations = list(self.predefined_sink_locations)

        if not results or len(results) == 0:
            self.sink_locations = current_sink_locations
            return

        result = results[0]
        if not hasattr(result, 'boxes') or result.boxes is None:
            self.sink_locations = current_sink_locations
            return

        boxes = result.boxes.xyxy.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()
        class_ids = result.boxes.cls.cpu().numpy()

        for box, confidence, class_id in zip(boxes, confidences, class_ids):
            if class_id == 71 and confidence > 0.5:
                x1, y1, x2, y2 = map(int, box)
                current_sink_locations.append((x1, y1, x2, y2))

        self.sink_locations = current_sink_locations

    def _process_people(self, frame, results):
        current_time = time.time()
        current_frame_tracking_ids = set()
        new_persons_detected = False

        if not results or len(results) == 0 or not hasattr(results[0], 'boxes') or results[0].boxes is None:
            all_known_tracking_ids = set(self.person_detection_times.keys())
            self._handle_lost_persons(all_known_tracking_ids, current_time)
            return

        result = results[0]
        boxes = result.boxes.xyxy.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()
        class_ids = result.boxes.cls.cpu().numpy()
        track_ids = result.boxes.id.cpu().numpy() if result.boxes.id is not None else [None] * len(boxes)
        keypoints_data = result.keypoints.xy.cpu().numpy() if hasattr(result, 'keypoints') and result.keypoints is not None else []
        keypoints_conf = result.keypoints.conf.cpu().numpy() if hasattr(result, 'keypoints') and result.keypoints is not None else []

        for i, (box, confidence, class_id, track_id) in enumerate(zip(boxes, confidences, class_ids, track_ids)):
            if class_id == 0 and confidence > 0.7 and track_id is not None:
                tracking_id = int(track_id)
                current_frame_tracking_ids.add(tracking_id)
                
                if tracking_id not in self.person_detection_times:
                    self.person_detection_times[tracking_id] = current_time
                    new_persons_detected = True

                person_id = self.person_id_mapping.get(tracking_id)
                
                if person_id is not None:
                    self.lost_person_timestamps[person_id] = current_time
                    
                    x1, y1, x2, y2 = map(int, box)
                    self.person_boxes[person_id] = (x1, y1, x2, y2)
                    person_img = frame[y1:y2, x1:x2]

                    self._check_cloth_change(person_id, person_img, (x1, y1, x2, y2))

                    if current_time - self.last_detection_time.get(person_id, 0) > self.detection_cooldown:
                        self.last_detection_time[person_id] = current_time
                        if current_time - self.last_hand_check.get(person_id, 0) > self.hand_check_interval:
                            self.last_hand_check[person_id] = current_time
                            if i < len(keypoints_data):
                                person_keypoints = keypoints_data[i]
                                person_keypoints_conf = keypoints_conf[i]
                                self._check_hand_washing(person_id, person_keypoints, person_keypoints_conf)
                            
        all_known_tracking_ids = set(self.person_detection_times.keys())
        lost_tracking_ids = all_known_tracking_ids - current_frame_tracking_ids
        self._handle_lost_persons(lost_tracking_ids, current_time)
                
        if new_persons_detected:
            self._update_person_id_mapping_if_needed()

    def _handle_lost_persons(self, lost_tracking_ids, current_time):
        truly_lost_tracking_ids = set()

        for tracking_id in lost_tracking_ids:
            person_id = self.person_id_mapping.get(tracking_id)
            if person_id:
                time_since_last_seen = current_time - self.lost_person_timestamps.get(person_id, 0)
                if time_since_last_seen >= self.person_lost_delay:
                    truly_lost_tracking_ids.add(tracking_id)

        for tracking_id in truly_lost_tracking_ids:
            person_id = self.person_id_mapping.get(tracking_id)
            if person_id:
                print(f"[YOLO] Person {person_id} (Tracking ID: {tracking_id}) is lost. Cleaning up.")
                
                api_caller.exitSanitizeFacility(person_id)
                api_caller.startQuarantine(person_id)
                
                if person_id in self.person_states:
                    del self.person_states[person_id]
                if person_id in self.person_boxes:
                    del self.person_boxes[person_id]
                if person_id in self.person_cloth_state:
                    del self.person_cloth_state[person_id]
                if person_id in self.person_cloth_info:
                    del self.person_cloth_info[person_id]
                if person_id in self.lost_person_timestamps:
                    del self.lost_person_timestamps[person_id]
            
            if tracking_id in self.person_detection_times:
                del self.person_detection_times[tracking_id]
            if tracking_id in self.person_id_mapping:
                del self.person_id_mapping[tracking_id]

    def _check_cloth_change(self, person_id, person_img, person_box):
        if person_img.size == 0:
            return

        db_person_id = self.person_id_mapping.get(person_id, person_id)
        
        if any(e['type'] == 'cloth_change' and e['person_id'] == db_person_id for e in self.events):
            return

        cloth_results = self.cloth_model(person_img, verbose=False, device='0')

        detected_cloth = None
        confidence = 0.0
        cloth_box = None

        if cloth_results and len(cloth_results) > 0:
            result = cloth_results[0]
            if hasattr(result, 'boxes') and result.boxes is not None and len(result.boxes) > 0:
                confidences = result.boxes.conf.cpu().numpy()
                class_ids = result.boxes.cls.cpu().numpy()
                boxes = result.boxes.xyxy.cpu().numpy()

                if len(confidences) > 0:
                    best_idx = np.argmax(confidences)
                    confidence = confidences[best_idx]
                    best_class_id = int(class_ids[best_idx])
                    cloth_box = boxes[best_idx]

                    if confidence > 0.7 and best_class_id == 0:
                        detected_cloth = self.target_cloth

                        if db_person_id not in self.person_cloth_state:
                            self.person_cloth_state[person_id] = False
                            if detected_cloth == self.target_cloth:
                                print(f"[YOLO] Person {db_person_id} wearing {detected_cloth} (initial detection)")
                                self._on_cloth_change_detected(db_person_id)
                                self.person_cloth_state[db_person_id] = True
                        else:
                            had_target_cloth = self.person_cloth_state[person_id]
                            if not had_target_cloth and detected_cloth == self.target_cloth:
                                print(f"[YOLO] Cloth change detected for person {db_person_id} to {detected_cloth}")
                                self._on_cloth_change_detected(db_person_id)
                                self.person_cloth_state[db_person_id] = True
                            elif had_target_cloth and detected_cloth != self.target_cloth:
                                self.person_cloth_state[db_person_id] = False

        if detected_cloth is not None and cloth_box is not None:
            px1, py1, _, _ = person_box
            tx1, ty1, tx2, ty2 = cloth_box
            abs_tx1 = int(px1 + tx1)
            abs_ty1 = int(py1 + ty1)
            abs_tx2 = int(px1 + tx2)
            abs_ty2 = int(py1 + ty2)

            self.person_cloth_info[person_id] = {
                'cloth': detected_cloth,
                'confidence': confidence,
                'box': (abs_tx1, abs_ty1, abs_tx2, abs_ty2),
                'time': time.time()
            }
        elif db_person_id in self.person_cloth_info:
            if time.time() - self.person_cloth_info[person_id]['time'] > 5:
                del self.person_cloth_info[person_id]

    def _check_hand_washing(self, person_id, keypoints, confidences):
        db_person_id = self.person_id_mapping.get(person_id, person_id)
        
        if any(e['type'] == 'hand_washing_complete' and e['person_id'] == db_person_id for e in self.events):
            return
        
        state = self.person_states[person_id] 
        left_wrist_idx, right_wrist_idx = self.WRIST_KEYPOINT_INDICES
        hands_over_sink = False
        current_hand_pos = None

        if confidences[left_wrist_idx] > 0.5 or confidences[right_wrist_idx] > 0.5:
            for sx1, sy1, sx2, sy2 in self.sink_locations:
                if confidences[left_wrist_idx] > 0.5:
                    lx, ly = keypoints[left_wrist_idx]
                    if sx1 < lx < sx2 and sy1 < ly < sy2:
                        hands_over_sink = True
                        current_hand_pos = (lx, ly)
                        break
                
                if confidences[right_wrist_idx] > 0.5:
                    rx, ry = keypoints[right_wrist_idx]
                    if sx1 < rx < sx2 and sy1 < ry < sy2:
                        hands_over_sink = True
                        current_hand_pos = (rx, ry)
                        break

        if hands_over_sink:
            if not state['is_washing']:
                state['is_washing'] = True
                state['washing_start_time'] = time.time()
                state['last_hand_position'] = current_hand_pos
                state['motion_detected'] = False
                self._on_washing_start(db_person_id)
            else:
                if state['last_hand_position'] is not None and current_hand_pos is not None:
                    dist = np.linalg.norm(np.array(current_hand_pos) - np.array(state['last_hand_position']))
                    if dist > self.HAND_MOTION_THRESHOLD:
                        state['motion_detected'] = True

                state['last_hand_position'] = current_hand_pos
                
                duration = time.time() - state['washing_start_time']
                if duration >= self.hand_washing_threshold and state['motion_detected']:
                    self._on_hand_washing_complete(db_person_id)
                    state['is_washing'] = False
                    state['washing_start_time'] = None
                    state['motion_detected'] = False
        else:
            if state['is_washing']:
                state['is_washing'] = False
                state['washing_start_time'] = None
                state['motion_detected'] = False
                print(f"[YOLO] Person {db_person_id} stopped washing hands.")

    def _on_cloth_change_detected(self, person_id):
        print(f"[YOLO] Cloth change event for person {person_id}")
        self.events.append({
            'type': 'cloth_change',
            'person_id': person_id,
            'time': time.time()
        })
        api_caller.updateClothChangeStatus(person_id, True)
        self.events = [e for e in self.events if time.time() - e['time'] < 10]

    def _on_washing_start(self, person_id):
        print(f"[YOLO] Person {person_id} started washing hands.")
        self.events.append({
            'type': 'washing_start',
            'person_id': person_id,
            'time': time.time()
        })
        self.events = [e for e in self.events if time.time() - e['time'] < self.hand_washing_threshold + 2]

    def _on_hand_washing_complete(self, person_id):
        print(f"[YOLO] Hand washing complete event for person {person_id}")
        self.events = [e for e in self.events if not (e['type'] == 'washing_start' and e['person_id'] == person_id)]
        
        self.events.append({
            'type': 'hand_washing_complete',
            'person_id': person_id,
            'time': time.time()
        })
        api_caller.updateHandWashingStatus(person_id, True)
        self.events = [e for e in self.events if time.time() - e['time'] < 10]

    def _draw_event_annotations(self):
        if self.annotated_frame is None:
            return

        current_time = time.time()

        for person_id, state in self.person_states.items():
            if state['is_washing'] and person_id in self.person_boxes:
                x1, y1, x2, y2 = self.person_boxes[person_id]
                elapsed_time = current_time - state['washing_start_time']
                progress = min(elapsed_time / self.hand_washing_threshold, 1.0)
                bar_width = (x2 - x1)
                bar_height = 10
                bar_x = x1
                bar_y = y1 - bar_height - 5
                back_color = (70, 70, 70)
                front_color = (0, 255, 0)
                border_color = (255, 255, 255)
                cv2.rectangle(self.annotated_frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), back_color, -1)
                progress_width = int(bar_width * progress)
                cv2.rectangle(self.annotated_frame, (bar_x, bar_y), (bar_x + progress_width, bar_y + bar_height), front_color, -1)
                cv2.rectangle(self.annotated_frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), border_color, 1)

        for person_id, cloth_info in self.person_cloth_info.items():
            if current_time - cloth_info['time'] < 5 and person_id in self.person_boxes:
                x1, y1, x2, y2 = cloth_info['box']
                label = f"Cloth: {cloth_info['cloth']} ({cloth_info['confidence']:.2f})"
                box_color = (0, 0, 255)
                text_color = (255, 255, 255)
                cv2.rectangle(self.annotated_frame, (x1, y1), (x2, y2), box_color, 1)
                (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                cv2.rectangle(self.annotated_frame, (x1, y1 - text_height - 10), (x1 + text_width, y1), box_color, -1)
                cv2.putText(self.annotated_frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.7, text_color, 2)

        recent_events = [e for e in self.events if current_time - e['time'] < 10]

        for i, event in enumerate(recent_events):
            y_pos = 30 + (i * 30)
            text = ""
            color = (0, 0, 0)
            
            person_id_from_event = event['person_id']

            if event['type'] == 'cloth_change':
                text = f"Cloth Change Detected for Person {person_id_from_event}!"
                color = (0, 0, 255)
            elif event['type'] == 'washing_start':
                pass
            elif event['type'] == 'hand_washing_complete':
                text = f"Hand Washing Complete for Person {person_id_from_event}!"
                color = (0, 255, 0)

            if text:
                cv2.putText(self.annotated_frame, text, (10, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

    def _draw_custom_pose_annotations(self, frame, pose_results):
        annotated_frame = frame.copy()

        if pose_results and len(pose_results) > 0:
            result = pose_results[0]
            if hasattr(result, 'keypoints') and result.keypoints is not None and hasattr(result, 'boxes') and result.boxes is not None:
                for person_idx in range(len(result.keypoints.xy)):
                    keypoints = result.keypoints.xy[person_idx].cpu().numpy()
                    confidences = result.keypoints.conf[person_idx].cpu().numpy()

                    box = result.boxes.xyxy[person_idx].cpu().numpy()
                    x1_box, y1_box, _, _ = map(int, box)

                    for kp_idx in self.HAND_KEYPOINT_INDICES:
                        if kp_idx < len(keypoints) and confidences[kp_idx] > 0.7:
                            x, y = map(int, keypoints[kp_idx])
                            cv2.circle(annotated_frame, (x, y), 5, (0, 255, 0), -1)

                    for start_kp_idx, end_kp_idx in self.HAND_LIMB_CONNECTIONS:
                        if start_kp_idx < len(keypoints) and end_kp_idx < len(keypoints) \
                           and confidences[start_kp_idx] > 0.7 and confidences[end_kp_idx] > 0.7:
                            x_start, y_start = map(int, keypoints[start_kp_idx])
                            x_end, y_end = map(int, keypoints[end_kp_idx])
                            cv2.line(annotated_frame, (x_start, y_start), (x_end, y_end), (255, 0, 0), 2)
                            cv2.putText(annotated_frame,confidences[start_kp_idx].__str__(),(x_start, y_start - 10),cv2.FONT_HERSHEY_SIMPLEX, 0.2, (0, 0, 0), 2)
                            
                    track_id = int(result.boxes.id[person_idx]) if result.boxes.id is not None else None
                    person_id = self.person_id_mapping.get(track_id, f"Tracking ID:{track_id}")

                    if person_id:
                        label = f"Person: {person_id}"
                        (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                        
                        cv2.rectangle(annotated_frame, (x1_box, y1_box - text_height - 10), (x1_box + text_width, y1_box), (255, 255, 0), -1)
                        cv2.putText(annotated_frame, label, (x1_box, y1_box - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
                        
        return annotated_frame

    def _draw_sinks_annotations(self):
        if self.annotated_frame is None:
            return

        for sx1, sy1, sx2, sy2 in self.sink_locations:
            cv2.rectangle(self.annotated_frame, (sx1, sy1), (sx2, sy2), (0, 255, 255), 2)
            cv2.putText(self.annotated_frame, "Sink", (sx1, sy1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)

    def _update_person_id_mapping_if_needed(self):
        current_time = time.time()
        
        if current_time - self.last_fetch_time < self.min_fetch_interval:
            return
            
        self.last_fetch_time = current_time
        
        pre_quarantine_persons = api_caller.get_all_pre_quarantine_persons()
        if pre_quarantine_persons is None:
            print("[YOLO] Failed to fetch Pre-Quarantine persons")
            return
            
        current_person_count = len(pre_quarantine_persons)
        persons_changed = current_person_count != self.last_person_count
        
        sorted_persons = list(reversed(pre_quarantine_persons))
        available_person_ids = [p.get('personId') for p in sorted_persons if p.get('personId')]
        
        detected_tracking_ids = sorted(self.person_detection_times.keys(), 
                                      key=lambda x: self.person_detection_times[x])
        
        if persons_changed or len(self.person_id_mapping) < len(detected_tracking_ids):
            previous_mapping = self.person_id_mapping.copy()
            self.person_id_mapping.clear()
            
            for i, tracking_id in enumerate(detected_tracking_ids):
                if i < len(available_person_ids):
                    self.person_id_mapping[tracking_id] = available_person_ids[i]
            
            if self.person_id_mapping != previous_mapping:
                print(f"[YOLO] Updated person ID mapping. Current mapping: {self.person_id_mapping}")

        self.last_person_count = current_person_count