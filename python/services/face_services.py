import asyncio
import websockets
import json
import cv2
import face_recognition
import numpy as np
import os
import time
import pickle
from PIL import Image
import io
from threading import Thread, Lock
import api.api_caller as api_caller
import uuid
from camera_manager import *

KNOWN_FACES_DIR = "known_faces"
camera_manager = CameraManager()

class face_encoding:
    
    def save_face_encoding(self, name, encoding):
        path = os.path.join(KNOWN_FACES_DIR, f"{name}.pkl")
        with open(path, "wb") as f:
            pickle.dump(encoding, f)

    def load_known_faces(self):
        known_faces, known_names = [], []
        for filename in os.listdir(KNOWN_FACES_DIR):
            if filename.endswith(".pkl"):
                name = os.path.splitext(filename)[0]
                with open(os.path.join(KNOWN_FACES_DIR, filename), "rb") as f:
                    encoding = pickle.load(f)
                    known_faces.append(encoding)
                    known_names.append(name)
        return known_faces, known_names


class face_services:
    def __init__(self):
        self.lock = Lock()
        self.registration_lock = Lock()
        self._is_async_task_running = False
        self.stop_checking = False
        self.is_face_registering = False
        self.current_registration_id = None
        self.face_encoding = face_encoding()
        self.guide_circle_radius = 100
        self.guide_circle_center = None
        
    def _is_face_already_registered(self, encoding):
        known_encodings, known_names = self.face_encoding.load_known_faces()
        if not known_encodings:
            return False, None
            
        matches = face_recognition.compare_faces(known_encodings, encoding, tolerance=0.6)
        if True in matches:
            matched_face_distances = face_recognition.face_distance(known_encodings, encoding)
            min_distance = np.min(matched_face_distances)
            distance_threshold = 0.4
            if min_distance < distance_threshold:
                matched_faceId = known_names[np.argmin(matched_face_distances)]
                print(f"[DEBUG] Face match found: {matched_faceId} with distance: {min_distance:.4f} (threshold: {distance_threshold})")
                return True, matched_faceId
            else:
                print(f"[DEBUG] Potential match rejected due to distance: {min_distance:.4f} >= {distance_threshold}")
        else:
            print(f"[DEBUG] No matches found in face comparison")
        return False, None
        
    def _check_multiple_faces(self, face_locations):
        return len(face_locations) > 1
        
    def _initialize_guide_circle(self, frame_shape):
        height, width = frame_shape[:2]
        self.guide_circle_center = (width // 2, height // 2)
        
    def _draw_guide_circle(self, frame):
        if self.guide_circle_center is None:
            self._initialize_guide_circle(frame.shape)
            
        cv2.circle(frame, self.guide_circle_center, self.guide_circle_radius, (0, 255, 0), 2)
        cv2.putText(frame, "Position your face within the circle", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        return frame
        
    def _is_face_in_circle(self, face_location):
        if self.guide_circle_center is None:
            return False
            
        top, right, bottom, left = face_location
        face_center_x = (left + right) // 2
        face_center_y = (top + bottom) // 2
        
        distance = np.sqrt((face_center_x - self.guide_circle_center[0])**2 + 
                          (face_center_y - self.guide_circle_center[1])**2)
        
        return distance <= (self.guide_circle_radius - 50)
        
    def _check_face_orientation(self, frame, face_location):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        face_landmarks_list = face_recognition.face_landmarks(rgb, [face_location])
        
        if not face_landmarks_list:
            return False
            
        face_landmarks = face_landmarks_list[0]
        
        left_eye = face_landmarks['left_eye']
        right_eye = face_landmarks['right_eye']
        nose_tip = face_landmarks['nose_tip']
        top_lip = face_landmarks['top_lip']
        
        if not left_eye or not right_eye or (not nose_tip and not top_lip):
            return False
            
        left_eye_center = np.mean(left_eye, axis=0)
        right_eye_center = np.mean(right_eye, axis=0)
        
        eye_angle = np.arctan2(right_eye_center[1] - left_eye_center[1], 
                              right_eye_center[0] - left_eye_center[0])
        eye_angle_deg = abs(np.degrees(eye_angle))
        
        if eye_angle_deg > 15:
            print(f"Eye angle too large: {eye_angle_deg} degrees")
            return False
            
        if nose_tip:
            nose_center = np.mean(nose_tip, axis=0)
            face_center_x = nose_center[0]
        elif top_lip:
            mouth_center = np.mean(top_lip, axis=0)
            face_center_x = mouth_center[0]
        else:
            return False
            
        left_eye_distance = abs(left_eye_center[0] - face_center_x)
        right_eye_distance = abs(right_eye_center[0] - face_center_x)
        
        if left_eye_distance > 0 and right_eye_distance > 0:
            distance_ratio = min(left_eye_distance, right_eye_distance) / max(left_eye_distance, right_eye_distance)
            if distance_ratio < 0.7:
                return False
        
        eye_height_diff = abs(left_eye_center[1] - right_eye_center[1])
        face_height = face_location[2] - face_location[0]
        
        if eye_height_diff > face_height * 0.1:
            print(f"Eye height difference too large: {eye_height_diff} pixels, face height: {face_height}")
            return False
        
        return True
        
    def is_running(self) -> bool:
        return self._is_async_task_running
    
    def stop_check(self, is_stop_checking: bool):
        self.stop_checking = is_stop_checking
    
    def reset_registration_state(self):
        self.is_face_registering = False
        self.current_registration_id = None
    
    
    async def _perform_registration_with_callback(self, websocket, name, camera_id, rtsp_url, callback):
        try:
            await self.perform_registration(websocket, name, camera_id, rtsp_url)
        finally:
            if callback:
                callback()
    
    async def perform_registration(self, websocket, name, camera_id, rtsp_url):
        if not self.registration_lock.acquire(blocking=False):
            await websocket.send(json.dumps({
                "camera_id": camera_id,
                "status": "error", 
                "message": "Registration already in progress. Please wait."}))
            return
            
        try:
            registration_id = f"{name}_{camera_id}"
            if self.current_registration_id == registration_id:
                await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "error", 
                    "message": f"Registration for {name} on camera {camera_id} is already in progress."}))
                return
                
            self.current_registration_id = registration_id
            
            await websocket.send(json.dumps({"status": "info", "message": f"Starting registration for {name} on camera '{camera_id}'..."}))
            camera = camera_manager.get_or_create_camera(camera_id, rtsp_url)
            if camera is None:
                await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "error", 
                    "message": f"Failed to initialize camera '{camera_id}'"}))
                return

            
            collected_encodings = []
            required_encodings = 5
            max_attempts = 100
            distinct_threshold = 0.3
            known_encodings, known_names = self.face_encoding.load_known_faces()
            
            frame = None
            for _ in range(10):
                frame = camera.get_frame()
                if frame is not None:
                    break
                await asyncio.sleep(0.1)
                
            if frame is None:
                await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "error", 
                    "message": "Failed to capture frame for initial check."}))
                return
                
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb)
            
            if self._check_multiple_faces(face_locations):
                await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "error", 
                    "message": "Multiple faces detected in initial check. Please ensure only one person is in the frame."
                }))
                return
                
            if not face_locations:
                await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "error", 
                    "message": "No face detected in initial check."}))
                return
                
            encoding = face_recognition.face_encodings(rgb, face_locations)[0]
            print(f"[DEBUG] Checking initial face encoding for registration of {name}")
            is_registered, matched_faceId = self._is_face_already_registered(encoding)
            if is_registered:
                try:
                    respone = api_caller.updateEntryLogSanitizeFacility(matched_faceId)
                    await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "error", 
                    "message": f"Face already registered for {matched_faceId} and {respone}"}))
                except Exception as e:
                    print(f"[ERROR] Failed to update entry log: {e}")
                return
            
            attempt_count = 0
            while attempt_count < max_attempts:
                frame = camera.get_frame()
                if frame is None:
                    attempt_count += 1
                    await asyncio.sleep(0.1)
                    continue

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                face_locations = face_recognition.face_locations(rgb)

                if face_locations:
                    
                    top, right, bottom, left = face_locations[0]
                    face_image = frame[top-100:bottom+100, left-100:right+100]

                    is_success, buffer = cv2.imencode(".jpg", face_image)
                    current_frame_avatar_bytes = io.BytesIO(buffer).read() if is_success else None
                    
                    if not collected_encodings and current_frame_avatar_bytes:
                        initial_avatar_bytes = current_frame_avatar_bytes
                        print("[DEBUG] Captured initial avatar bytes for registration.")
                    
                    encoding = face_recognition.face_encodings(rgb, face_locations)[0]
                    print(f"[DEBUG] Checking face encoding during collection process for {name}")
                    is_registered, matched_faceId = self._is_face_already_registered(encoding)
                    if is_registered:
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "error", 
                            "message": f"Face already registered for {matched_faceId}"}))
                        try:
                            api_caller.updateEntryLogSanitizeFacility(matched_faceId)
                        except Exception as e:
                            print(f"[ERROR] Failed to update entry log: {e}")
                        return

                    is_distinct = True
                    if collected_encodings:
                        distances = face_recognition.face_distance(collected_encodings, encoding)
                        min_distance = np.min(distances)
                        print(f"[DEBUG] Distance to collected encodings: {min_distance:.4f} (threshold: {distinct_threshold})")
                        if min_distance < distinct_threshold:
                            is_distinct = False
                            print(f"[DEBUG] Encoding not distinct, distance {min_distance:.4f} < threshold {distinct_threshold}")

                    if is_distinct:
                        collected_encodings.append(encoding)
                        print(f"[DEBUG] Collected {len(collected_encodings)} distinct encodings")
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "progress",
                            "collected": len(collected_encodings),
                            "required": required_encodings,
                            "message": f"Please move your head slightly. ({len(collected_encodings)}/{required_encodings} angles captured)"
                        }))
                        if len(collected_encodings) >= required_encodings:
                            avg_encoding = np.mean(collected_encodings, axis=0)
                            facial_scan_id_uuid = str(uuid.uuid4())
                            try:
                                person_id = api_caller.register_and_get_person_id(name, facial_scan_id_uuid, avatar_file=initial_avatar_bytes)
                            except Exception as e:
                                print(f"[Registration at calling to nodejs] {e}")
                                person_id = None
                            if person_id:
                                try:
                                    api_caller.updateEntryLogSanitizeFacility(facial_scan_id_uuid)
                                    self.face_encoding.save_face_encoding(facial_scan_id_uuid, avg_encoding)
                                    await websocket.send(json.dumps({
                                        "camera_id": camera_id,
                                        "status": "success", 
                                        "message": f"Face registered for {facial_scan_id_uuid}"}))
                                except Exception as e:
                                    print(f"[ERROR] Failed to complete registration: {e}")
                                    await websocket.send(json.dumps({
                                        "camera_id": camera_id,
                                        "status": "error", 
                                        "message": "Failed to complete registration process."}))
                                return
                            else:
                                await websocket.send(json.dumps({
                                    "camera_id": camera_id,
                                    "status": "error", 
                                    "message": "Failed to register person with the backend."}))
                                return
                    else:
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "prompt_move",
                            "message": "Change head position for a different angle."
                        }))
                attempt_count += 1
                await asyncio.sleep(0.3)

            if not collected_encodings:
                await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "error", 
                    "message": "No face detected."}))
            else:
                await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "error", 
                    "message": f"Only {len(collected_encodings)} angles captured."}))
        except Exception as e:
            print(f"[Registration Error] {e}")
            await websocket.send(json.dumps({
                "camera_id": camera_id,
                "status": "error", 
                "message": f"Registration failed: {str(e)}"}))
        finally:
            self.current_registration_id = None
            self.registration_lock.release()
            
    

    async def check_face_to_register(self, websocket, camera_id, rtsp_url, name):
        if self._is_async_task_running:
            await websocket.send(json.dumps({"status": "info", "message": "Face check already running."}))
            await asyncio.sleep(1)
            return 
        
        self._is_async_task_running = True
        registration_completed_event = asyncio.Event()
        
        def on_registration_complete():
            self.is_face_registering = False
            registration_completed_event.set()
        
        try:
            while True:
                if self.stop_checking:
                    await websocket.send(json.dumps({
                        "camera_id": camera_id,
                        "status": "info", 
                        "message": "Stopping face checking."}))
                    break 
                
                while self.is_face_registering: 
                    await asyncio.sleep(0.5)
                    if not self.is_face_registering:
                        break
                    
                try: 
                    await websocket.send(json.dumps({
                        "camera_id": camera_id,
                        "status": "info", 
                        "message": f"Starting registration check on camera '{camera_id}'..."}))
                    if not rtsp_url:
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "error", 
                            "message": "Failed to initialize camera due to missing RTSP URL"}))
                        return
                    camera = camera_manager.get_or_create_camera(camera_id, rtsp_url)
                    if camera is None:
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "error", 
                            "message": f"Failed to initialize camera '{camera_id}'"}))
                        return

                    still_start_time = None
                    initial_face_location = None
                    stillness_threshold_pixels = 35
                    max_duration_check = 14
                    hold_still_duration = 1
                    start_request_time = time.time()
                    registration_initiated = False
                    
                    while time.time() - start_request_time < max_duration_check:
                        frame = None
                        retry_count = 0
                        while retry_count < 5 and frame is None:
                            frame = camera.get_frame()
                            if frame is None:
                                await asyncio.sleep(0.2)
                                retry_count += 1
                        
                        if frame is None:
                            await websocket.send(json.dumps({
                                "camera_id": camera_id,
                                "status": "error", 
                                "message": "Failed to capture frame from camera."}))
                            break
                        
                        if self.guide_circle_center is None:
                            self._initialize_guide_circle(frame.shape)
                        
                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        locations = face_recognition.face_locations(rgb)
                        
                        if self._check_multiple_faces(locations):
                            await websocket.send(json.dumps({
                                "camera_id": camera_id,
                                "status": "error",
                                "message": "More than one face is detected. Only one person can be registered at a time. Please ensure only one person is in the frame."
                            }))
                            still_start_time = None
                            initial_face_location = None
                            await asyncio.sleep(2)
                            continue
                        elif len(locations) == 1:
                            current_face_location = locations[0]
                            
                            if not self._is_face_in_circle(current_face_location):
                                await websocket.send(json.dumps({
                                    "camera_id": camera_id,
                                    "status": "error",
                                    "message": "Please position your face within the circle."
                                }))
                                await asyncio.sleep(0.5)
                                continue
                            
                            if not self._check_face_orientation(frame, current_face_location):
                                await websocket.send(json.dumps({
                                    "camera_id": camera_id,
                                    "status": "error",
                                    "message": "Please look directly at the camera."
                                }))
                                await asyncio.sleep(0.5)
                                continue
                            
                            await websocket.send(json.dumps({
                                "camera_id": camera_id,
                                "status": "success",
                                "message": "Face Detected, Please Hold still to register."
                            }))
                            await asyncio.sleep(0.2)
                            
                            if still_start_time is None:
                                still_start_time = time.time()
                                initial_face_location = current_face_location
                            else:
                                top_diff = abs(current_face_location[0] - initial_face_location[0])
                                right_diff = abs(current_face_location[1] - initial_face_location[1])
                                bottom_diff = abs(current_face_location[2] - initial_face_location[2])
                                left_diff = abs(current_face_location[3] - initial_face_location[3])
                                if max(top_diff, right_diff, bottom_diff, left_diff) <= stillness_threshold_pixels:
                                    await websocket.send(json.dumps({
                                        "camera_id": camera_id,
                                        "status": "success", 
                                        "message": "Wait..."
                                    }))
                                    await asyncio.sleep(0.2)
                                    if (time.time() - still_start_time) >= hold_still_duration:
                                        await websocket.send(json.dumps({
                                            "camera_id": camera_id,
                                            "status": "success", 
                                            "message": "Start perform_registration"}))
                                        self.is_face_registering = True
                                        registration_initiated = True
                                        registration_completed_event.clear()
                                        asyncio.create_task(self._perform_registration_with_callback(websocket, name, camera_id, rtsp_url, on_registration_complete))
                                        break
                                else:
                                    still_start_time = None
                                    initial_face_location = None
                                    await websocket.send(json.dumps({
                                        "camera_id": camera_id,
                                        "status": "error", 
                                        "message": "Moving from original point, please stand still."}))
                                    await asyncio.sleep(1)
                        else:
                            still_start_time = None
                            initial_face_location = None
                            await asyncio.sleep(0.1)
                            
                    if registration_initiated:
                        try:
                            await asyncio.wait_for(registration_completed_event.wait(), timeout=30.0)
                        except asyncio.TimeoutError:
                            print(f"[WARNING] Registration timeout for {name} on camera {camera_id}")
                            self.is_face_registering = False
                        start_request_time = time.time()
                        registration_initiated = False
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "info",
                            "message": "Registration completed. Looking for next face ..."
                        }))
                    elif not self.is_face_registering:
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "error", 
                            "message": "Registration timeout. Please try again."}))
                except Exception as e:
                    print(f"[Check Face Error] {e}")
                    self.is_face_registering = False
                    await websocket.send(json.dumps({
                        "camera_id": camera_id,
                        "status": "error",
                        "message": f"Error during face checking: {str(e)}"}))
                finally:
                    if not self.is_face_registering and not registration_initiated:
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "info",
                            "message": "Looking for face ..."
                        }))
                    await asyncio.sleep(1)
        finally:
            self._is_async_task_running = False


