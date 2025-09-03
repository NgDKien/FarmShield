import asyncio
import websockets
import json
from flask import Flask, Response, request, jsonify
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
class face_encooding:
    
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
        self._is_async_task_running = False
        self.stop_checking = False
        self.face_encooding = face_encooding()
        
    def is_running(self) -> bool:
        return self._is_async_task_running
    
    def stop_check(self, is_stop_checking: bool):
        self.stop_checking = is_stop_checking
    
    
    # --- WebSocket Registration Logic ---
    async def perform_registration(self,websocket, name, camera_id, rtsp_url):
        # await websocket.send(json.dumps({"status": "info", "message": f"Starting registration for {name} on camera '{camera_id}'..."}))
        camera = camera_manager.get_or_create_camera(camera_id, rtsp_url)
        if camera is None:
            await websocket.send(json.dumps({
                "camera_id": camera_id,
                "status": "error", 
                "message": f"Failed to initialize camera '{camera_id}'"}))
            return

        
        collected_encodings = []
        required_encodings =  1
        max_attempts = 60
        distinct_threshold = 0.34
        known_encodings, known_names = self.face_encooding.load_known_faces()
        
        try:
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
                    if known_encodings and True in face_recognition.compare_faces(known_encodings, encoding):
                        matched_face_distances = face_recognition.face_distance(known_encodings, encoding)
                        matched_faceId = known_names[np.argmin(matched_face_distances)]
                        print(f"[DEBUG] During registration for '{name}', current encoding matched '{matched_faceId}' (from known faces).")
                        print(f"[DEBUG] Face distances to known faces: {matched_face_distances}")
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "error", 
                            "message": f"Face already registered for {matched_faceId}"}))
                        api_caller.updateEntryLogSanitizeFacility(matched_faceId)
                        # is_face_registering = False
                        return

                    is_distinct = True
                    if collected_encodings:
                        distances = face_recognition.face_distance(collected_encodings, encoding)
                        if np.min(distances) < distinct_threshold:
                            is_distinct = False

                    if is_distinct:
                        collected_encodings.append(encoding)
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "progress",
                            "collected": len(collected_encodings),
                            "required": required_encodings,
                            "message": "Please move your head slightly."
                        }))
                        if len(collected_encodings) >= required_encodings:
                            avg_encoding = np.mean(collected_encodings, axis=0)
                            facial_scan_id_uuid = str(uuid.uuid4())
                            try:
                                person_id = api_caller.register_and_get_person_id(name, facial_scan_id_uuid ,avatar_file = initial_avatar_bytes)
                            except Exception as e:
                                print(f"[Registration at calling to nodejs] {e}")
                                person_id = None
                            if person_id:
                                api_caller.updateEntryLogSanitizeFacility(facial_scan_id_uuid)
                                self.face_encooding.save_face_encoding(facial_scan_id_uuid, avg_encoding)
                                await websocket.send(json.dumps({
                                    "camera_id": camera_id,
                                    "status": "success", 
                                    "message": f"Face registered for {facial_scan_id_uuid}"}))
                                # is_face_registering = False
                                return
                            else:
                                await websocket.send(json.dumps({
                                    "camera_id": camera_id,
                                    "status": "error", 
                                    "message": "Failed to register person with the backend."}))
                                # is_face_registering = False
                                return
                    else:
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "prompt_move",
                            "message": "Change head position for a different angle."
                        }))
                attempt_count += 1
                await asyncio.sleep(0.5)

            if not collected_encodings:
                await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "error", 
                    "message": "No face detected."}))
                # is_face_registering = False
            else:
                await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "error", 
                    "message": f"Only {len(collected_encodings)} angles captured."}))
                # is_face_registering = False
        except Exception as e:
            print(f"[Registration Error] {e}")
            # is_face_registering = False
            await websocket.send(json.dumps({
                "camera_id": camera_id,
                "status": "error", 
                "message": str(e)}))
            
    

    async def check_face_to_register(self, websocket,camera_id,rtsp_url, name):
        global face_check_running, stop_checking
        
        if self._is_async_task_running:
            # await websocket.send(json.dumps({"status": "info", "message": "Face check already running."}))
            await asyncio.sleep(1)
            return 
        
        self._is_async_task_running = True
        try:
            while True:
                if self.stop_checking:  # Check the stop flag
                    await websocket.send(json.dumps({
                        "camera_id": camera_id,
                        "status": "info", 
                        "message": "Stopping face checking."}))
                    break 
                
                # while is_face_registering: 
                #     if is_face_registering is False:
                #         break
                    
                try: 
                    await websocket.send(json.dumps({
                        "camera_id": camera_id,
                        "status": "info", 
                        "message": f"Starting registration check on camera '{camera_id}'..."}))
                    if not rtsp_url:
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "error", 
                            "message": f"Failed to initialize camera cause by no RTSP url"}))
                    camera = camera_manager.get_or_create_camera(camera_id, rtsp_url)
                    if camera is None:
                        await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "error", 
                            "message": f"Failed to initialize camera '{camera_id}'"}))

                    still_start_time = None
                    initial_face_location = None
                    stillness_threshold_pixels = 35
                    max_duration_check = 14
                    hold_still_duration = 3
                    start_request_time = time.time()
                    
                    
                    while time.time() - start_request_time < max_duration_check:
                        while True:
                            frame = camera.get_frame()
                            if frame is not None:
                                break
                            time.sleep(1)
                        
                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) #color for face_recongition
                        locations = face_recognition.face_locations(rgb)
                        
                        if len(locations)==2:
                            await websocket.send(json.dumps({
                                "camera_id": camera_id,
                                "status": "error",
                                "message": f"More than one face is deteced, Only one is allowed."
                            }))
                            time.sleep(2)
                            break
                        
                        if len(locations)==1 :
                            await websocket.send(json.dumps({
                                "camera_id": camera_id,
                                "status": "success",
                                "message": f"Face Detected, Please Hold still to register."
                            }))
                            time.sleep(0.2) #wait 1 second before save inital still face posistion
                            current_face_location = locations[0]
                            
                            if still_start_time is None:
                                still_start_time = time.time()
                                initial_face_location = current_face_location
                            else:
                                #check for movement
                                top_diff = abs(current_face_location[0] - initial_face_location[0])
                                right_diff = abs(current_face_location[1] - initial_face_location[1])
                                bottom_diff = abs(current_face_location[2] - initial_face_location[2])
                                left_diff = abs(current_face_location[3] - initial_face_location[3])
                                if max(top_diff, right_diff, bottom_diff, left_diff) <= stillness_threshold_pixels:
                                    await websocket.send(json.dumps({
                                            "camera_id": camera_id,"status": "success", "message": f"Wait..."}))
                                    await asyncio.sleep(0.2)
                                    if (time.time() - still_start_time) >= hold_still_duration:
                                        await websocket.send(json.dumps({
                                            "camera_id": camera_id,
                                            "status": "success", 
                                            "message": f"Start perform_registration"}))
                                        # is_face_registering = True
                                        await asyncio.create_task(self.perform_registration(websocket, name, camera_id, rtsp_url))
                                        time.sleep(1)
                                        break
                                else:
                                    still_start_time = None
                                    initial_face_location = None
                                    await websocket.send(json.dumps({
                                            "camera_id": camera_id,
                                            "status": "error", 
                                            "message": f"Moving from original point, please stand still."}))
                                    time.sleep(1)
                                    
                                    
                        else:
                            #more than face in the frame or no face
                            still_start_time = None
                            initial_face_location = None
                            
                        time.sleep(0.1)
                    #await websocket.send(json.dumps({"status": "info", "message": f"check_face_to_register loop"}))
                    await websocket.send(json.dumps({
                        "camera_id": camera_id,
                        "status": "error", 
                        "message": f"Re-running check face."}))
                finally:
                    await websocket.send(json.dumps({
                                "camera_id": camera_id,
                                "status": "success",
                                "message": f"Looking for face ..."
                            }))
                    time.sleep(1)
        finally:
            self._is_async_task_running = False


