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
        self.registration_lock = Lock()  # Dedicated lock for registration process
        self._is_async_task_running = False
        self.stop_checking = False
        self.is_face_registering = False
        self.current_registration_id = None  # Track current registration to prevent duplicates
        self.face_encoding = face_encoding()
        # Define registration guide circle parameters
        self.guide_circle_radius = 100  # Reduced to 2/3 of original size (150 * 2/3 = 100)
        self.guide_circle_center = None  # Will be set based on frame dimensions
        
    def _is_face_already_registered(self, encoding):
        """
        Check if a face encoding is already registered in the system.
        
        Args:
            encoding (array): Face encoding to check
            
        Returns:
            tuple: (is_registered, matched_faceId) where is_registered is a boolean
                   and matched_faceId is the identifier of the matched face (if any)
        """
        known_encodings, known_names = self.face_encoding.load_known_faces()
        if not known_encodings:
            return False, None
            
        # Use a more lenient tolerance for face comparison to handle different angles
        matches = face_recognition.compare_faces(known_encodings, encoding, tolerance=0.6)
        if True in matches:
            matched_face_distances = face_recognition.face_distance(known_encodings, encoding)
            # Find the minimum distance and check if it's below our threshold
            min_distance = np.min(matched_face_distances)
            # Use a more lenient threshold for distance comparison to handle different angles
            distance_threshold = 0.6
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
        """
        Check if multiple faces are detected and handle appropriately.
        
        Args:
            face_locations (list): List of face locations detected
            
        Returns:
            bool: True if multiple faces detected, False otherwise
        """
        return len(face_locations) > 1
        
    def _initialize_guide_circle(self, frame_shape):
        """
        Initialize the guide circle position based on frame dimensions.
        
        Args:
            frame_shape (tuple): Shape of the frame (height, width, channels)
        """
        height, width = frame_shape[:2]
        self.guide_circle_center = (width // 2, height // 2)
        
    def _draw_guide_circle(self, frame):
        """
        Draw a guide circle on the frame that users should position their face within.
        
        Args:
            frame (numpy.ndarray): The frame to draw on
            
        Returns:
            numpy.ndarray: The frame with the guide circle drawn
        """
        if self.guide_circle_center is None:
            self._initialize_guide_circle(frame.shape)
            
        # Draw the guide circle
        cv2.circle(frame, self.guide_circle_center, self.guide_circle_radius, (0, 255, 0), 2)
        cv2.putText(frame, "Position your face within the circle", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        return frame
        
    def _is_face_in_circle(self, face_location):
        """
        Check if the face is positioned within the guide circle.
        
        Args:
            face_location (tuple): Face location (top, right, bottom, left)
            
        Returns:
            bool: True if face is within the circle, False otherwise
        """
        if self.guide_circle_center is None:
            return False
            
        # Calculate the center of the face bounding box
        top, right, bottom, left = face_location
        face_center_x = (left + right) // 2
        face_center_y = (top + bottom) // 2
        
        # Calculate distance from face center to guide circle center
        distance = np.sqrt((face_center_x - self.guide_circle_center[0])**2 + 
                          (face_center_y - self.guide_circle_center[1])**2)
        
        # Check if the distance is less than the radius
        return distance <= self.guide_circle_radius
        
    def _check_face_orientation(self, frame, face_location):
        """
        Check if the face is looking directly at the camera.
        
        Args:
            frame (numpy.ndarray): The frame containing the face
            face_location (tuple): Face location (top, right, bottom, left)
            
        Returns:
            bool: True if face is looking directly at the camera, False otherwise
        """
        # Convert to RGB for face_recognition
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Get face landmarks
        face_landmarks_list = face_recognition.face_landmarks(rgb, [face_location])
        
        if not face_landmarks_list:
            return False
            
        face_landmarks = face_landmarks_list[0]
        
        # Get key facial points
        left_eye = face_landmarks['left_eye']
        right_eye = face_landmarks['right_eye']
        nose_tip = face_landmarks['nose_tip'][0] if face_landmarks['nose_tip'] else None
        
        if not left_eye or not right_eye or not nose_tip:
            return False
            
        # Calculate eye centers
        left_eye_center = np.mean(left_eye, axis=0)
        right_eye_center = np.mean(right_eye, axis=0)
        
        # Calculate the angle between the eyes (should be roughly horizontal for front-facing)
        eye_angle = np.arctan2(right_eye_center[1] - left_eye_center[1], 
                              right_eye_center[0] - left_eye_center[0])
        eye_angle_deg = np.degrees(eye_angle)
        
        # Check if eyes are roughly level (face is not tilted too much)
        # Allow for some variation (±15 degrees)
        if abs(eye_angle_deg) > 10:
            return False
            
        # Calculate the position of the nose relative to the eyes
        # For a front-facing face, the nose should be centered between the eyes
        eye_center_x = (left_eye_center[0] + right_eye_center[0]) / 2
        nose_deviation = abs(nose_tip[0] - eye_center_x)
        
        # Allow for some deviation based on face size
        face_width = face_location[1] - face_location[3]  # right - left
        max_deviation = face_width * 0.10  # 15% of face width
        
        return nose_deviation <= max_deviation
        
    def is_running(self) -> bool:
        return self._is_async_task_running
    
    def stop_check(self, is_stop_checking: bool):
        self.stop_checking = is_stop_checking
    
    def reset_registration_state(self):
        """Reset all registration-related state flags."""
        self.is_face_registering = False
        self.current_registration_id = None
        # Note: We don't release the registration_lock here as it should only be released by the thread that acquired it
    
    
    # --- WebSocket Registration Logic ---
    async def _perform_registration_with_callback(self, websocket, name, camera_id, rtsp_url, callback):
        """Wrapper for perform_registration that calls a callback when complete."""
        try:
            await self.perform_registration(websocket, name, camera_id, rtsp_url)
        finally:
            # Ensure callback is called even if an exception occurs
            if callback:
                callback()
    
    async def perform_registration(self, websocket, name, camera_id, rtsp_url):
        # Use registration lock to prevent double registration
        if not self.registration_lock.acquire(blocking=False):
            await websocket.send(json.dumps({
                "camera_id": camera_id,
                "status": "error", 
                "message": "Registration already in progress. Please wait."}))
            return
            
        try:
            # Check if this exact registration is already running
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
            required_encodings = 5  # Increased to collect multiple angles
            max_attempts = 100  # Increased attempts to allow for more movement
            # Use a more relaxed threshold for determining if encodings are distinct
            distinct_threshold = 0.3  # Decreased to allow more similar angles
            known_encodings, known_names = self.face_encoding.load_known_faces()
            
            # Pre-check: Verify if any face is already registered before starting
            # Capture a frame for initial check
            frame = None
            for _ in range(10):  # Try up to 10 times to get a frame
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
                
            # Check if there's a face in the initial frame
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb)
            
            # Check for multiple faces
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
                
            # Check if the face in the initial frame is already registered
            encoding = face_recognition.face_encodings(rgb, face_locations)[0]
            print(f"[DEBUG] Checking initial face encoding for registration of {name}")
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

                    # Encode the face image to JPEG bytes
                    is_success, buffer = cv2.imencode(".jpg", face_image)
                    current_frame_avatar_bytes = io.BytesIO(buffer).read() if is_success else None
                    
                    if not collected_encodings and current_frame_avatar_bytes:
                        initial_avatar_bytes = current_frame_avatar_bytes
                        print("[DEBUG] Captured initial avatar bytes for registration.")
                    
                    encoding = face_recognition.face_encodings(rgb, face_locations)[0]
                    # Double-check if face is already registered during the process
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
                            # Use the first encoding as the representative one for saving
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
                                    # Save all encodings for better recognition
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
                await asyncio.sleep(0.3)  # Reduced sleep time to capture more angles quickly

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
            # Clean up registration state
            self.current_registration_id = None
            self.registration_lock.release()
            
    

    async def check_face_to_register(self, websocket, camera_id, rtsp_url, name):
        # Remove global variable references that don't exist
        if self._is_async_task_running:
            await websocket.send(json.dumps({"status": "info", "message": "Face check already running."}))
            await asyncio.sleep(1)
            return 
        
        self._is_async_task_running = True
        registration_completed_event = asyncio.Event()
        
        # Callback to reset registration state
        def on_registration_complete():
            self.is_face_registering = False
            registration_completed_event.set()
        
        try:
            while True:
                if self.stop_checking:  # Check the stop flag
                    await websocket.send(json.dumps({
                        "camera_id": camera_id,
                        "status": "info", 
                        "message": "Stopping face checking."}))
                    break 
                
                # Wait if face registration is already in progress
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
                        # Get frame with retry logic
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
                        
                        # Initialize guide circle if not already done
                        if self.guide_circle_center is None:
                            self._initialize_guide_circle(frame.shape)
                        
                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # color for face_recognition
                        locations = face_recognition.face_locations(rgb)
                        
                        if self._check_multiple_faces(locations):
                            await websocket.send(json.dumps({
                                "camera_id": camera_id,
                                "status": "error",
                                "message": "More than one face is detected. Only one person can be registered at a time. Please ensure only one person is in the frame."
                            }))
                            # Reset tracking variables when multiple faces detected
                            still_start_time = None
                            initial_face_location = None
                            await asyncio.sleep(2)
                            continue  # Continue checking rather than breaking
                        elif len(locations) == 1:
                            current_face_location = locations[0]
                            
                            # Check if face is within the guide circle
                            if not self._is_face_in_circle(current_face_location):
                                await websocket.send(json.dumps({
                                    "camera_id": camera_id,
                                    "status": "error",
                                    "message": "Please position your face within the circle."
                                }))
                                await asyncio.sleep(0.5)
                                continue
                            
                            # Check if face is looking directly at the camera
                            if not self._check_face_orientation(frame, current_face_location):
                                await websocket.send(json.dumps({
                                    "camera_id": camera_id,
                                    "status": "error",
                                    "message": "Please look directly at the camera."
                                }))
                                await asyncio.sleep(0.5)
                                continue
                            
                            # Face is in the circle and looking at the camera, proceed with registration
                            await websocket.send(json.dumps({
                                "camera_id": camera_id,
                                "status": "success",
                                "message": "Face Detected, Please Hold still to register."
                            }))
                            await asyncio.sleep(0.2)  # Wait before saving initial still face position
                            
                            if still_start_time is None:
                                still_start_time = time.time()
                                initial_face_location = current_face_location
                            else:
                                # Check for movement
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
                                        # Run registration in background without waiting for it to complete
                                        asyncio.create_task(self._perform_registration_with_callback(websocket, name, camera_id, rtsp_url, on_registration_complete))
                                        # Break inner loop but continue outer loop
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
                            # No face detected
                            still_start_time = None
                            initial_face_location = None
                            await asyncio.sleep(0.1)
                            
                    # If we've initiated registration, wait for it to complete before continuing
                    if registration_initiated:
                        # Wait for registration to complete
                        try:
                            await asyncio.wait_for(registration_completed_event.wait(), timeout=30.0)
                        except asyncio.TimeoutError:
                            print(f"[WARNING] Registration timeout for {name} on camera {camera_id}")
                            self.is_face_registering = False
                        # Reset the start time to continue checking for new faces
                        start_request_time = time.time()
                        registration_initiated = False
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "info",
                            "message": "Registration completed. Looking for next face ..."
                        }))
                    # If we've reached here, we've timed out without initiating registration
                    elif not self.is_face_registering:
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "error", 
                            "message": "Registration timeout. Please try again."}))
                except Exception as e:
                    print(f"[Check Face Error] {e}")
                    # Ensure we reset the registration flag on error
                    self.is_face_registering = False
                    await websocket.send(json.dumps({
                        "camera_id": camera_id,
                        "status": "error",
                        "message": f"Error during face checking: {str(e)}"}))
                finally:
                    # Only send this message if we're not registering and haven't initiated registration
                    if not self.is_face_registering and not registration_initiated:
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "info",
                            "message": "Looking for face ..."
                        }))
                    await asyncio.sleep(1)
        finally:
            self._is_async_task_running = False


