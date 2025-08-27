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

# --- Centralized Camera Management ---
class Camera:
    def __init__(self, rtsp_url):
        self.rtsp_url = rtsp_url
        self.cap = None
        self.latest_frame = None
        self.lock = Lock()
        self.is_running = False
        self.thread = None
        self.start()

    def start(self):
        if self.is_running:
            print(f"[Camera {self.rtsp_url}] Camera thread is already running.")
            return
        self.is_running = True
        self.thread = Thread(target=self._update_loop, daemon=True)
        self.thread.start()
        print(f"[Camera {self.rtsp_url}] Started background thread for RTSP stream.")

    def _update_loop(self):
        while self.is_running:
            if self.cap is None or not self.cap.isOpened():
                print(f"[Camera {self.rtsp_url}] Attempting to connect to RTSP stream...")
                self.cap = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
                if not self.cap.isOpened():
                    print(f"[Camera {self.rtsp_url}] Could not open RTSP stream. Retrying in 5s...")
                    self.cap.release()
                    self.cap = None
                    time.sleep(5)
                    continue
                print(f"[Camera {self.rtsp_url}] Successfully connected to RTSP stream.")

            ret, frame = self.cap.read()
            if ret:
                with self.lock:
                    self.latest_frame = frame
            else:
                print(f"[Camera {self.rtsp_url}] Lost connection. Reconnecting...")
                self.cap.release()
                self.cap = None
                time.sleep(1)

            time.sleep(0.01)

    def get_frame(self):
        with self.lock:
            if self.latest_frame is None:
                return None
            return self.latest_frame.copy()

    def stop(self):
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=5)
            if self.thread.is_alive():
                print(f"[Camera {self.rtsp_url}] Warning: Thread did not stop gracefully.")
        if self.cap:
            self.cap.release()
        print(f"[Camera {self.rtsp_url}] Stopped and resources released.")

# --- Camera Manager ---
class CameraManager:
    def __init__(self):
        self.cameras = {}
        self.lock = Lock()

    def get_or_create_camera(self, camera_id, rtsp_url):
        with self.lock:
            if camera_id not in self.cameras:
                print(f"[Manager] Creating new camera '{camera_id}' with URL: {rtsp_url}")
                if not rtsp_url:
                    print(f"[Manager] No RTSP URL for '{camera_id}'. Cannot create.")
                    return None
                self.cameras[camera_id] = Camera(rtsp_url)
            # else:
            #     #print(f"[Manager] Reusing camera for '{camera_id}'")
            return self.cameras[camera_id]

    def stop_camera(self, camera_id):
        with self.lock:
            if camera_id in self.cameras:
                print(f"[Manager] Stopping camera '{camera_id}'")
                self.cameras[camera_id].stop()
                del self.cameras[camera_id]

    def stop_all_cameras(self):
        with self.lock:
            print("[Manager] Stopping all cameras...")
            for camera_id, camera in list(self.cameras.items()):
                camera.stop()
                del self.cameras[camera_id]
            self.cameras.clear()
            print("[Manager] All cameras stopped.")

# --- Flask App Initialization ---
app = Flask(__name__)
KNOWN_FACES_DIR = "known_faces"
os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
camera_manager = CameraManager()

# --- Face Encoding Functions ---
def save_face_encoding(name, encoding):
    path = os.path.join(KNOWN_FACES_DIR, f"{name}.pkl")
    with open(path, "wb") as f:
        pickle.dump(encoding, f)

def load_known_faces():
    known_faces, known_names = [], []
    for filename in os.listdir(KNOWN_FACES_DIR):
        if filename.endswith(".pkl"):
            name = os.path.splitext(filename)[0]
            with open(os.path.join(KNOWN_FACES_DIR, filename), "rb") as f:
                encoding = pickle.load(f)
                known_faces.append(encoding)
                known_names.append(name)
    return known_faces, known_names

# --- WebSocket Registration Logic ---
import api.api_caller as api_caller
import uuid
async def perform_registration(websocket, name, camera_id, rtsp_url):
    # await websocket.send(json.dumps({"status": "info", "message": f"Starting registration for {name} on camera '{camera_id}'..."}))
    camera = camera_manager.get_or_create_camera(camera_id, rtsp_url)
    if camera is None:
        await websocket.send(json.dumps({
            "camera_id": camera_id,
            "status": "error", 
            "message": f"Failed to initialize camera '{camera_id}'"}))
        return

    global is_face_registering
    collected_encodings = []
    required_encodings =  1
    max_attempts = 60
    distinct_threshold = 0.34
    known_encodings, known_names = load_known_faces()
    
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
                if known_encodings and True in face_recognition.compare_faces(known_encodings, encoding, tolerance=0.4):
                    matched_face_distances = face_recognition.face_distance(known_encodings, encoding)
                    matched_faceId = known_names[np.argmin(matched_face_distances)]
                    print(f"[DEBUG] During registration for '{name}', current encoding matched '{matched_faceId}' (from known faces).")
                    print(f"[DEBUG] Face distances to known faces: {matched_face_distances}")
                    await websocket.send(json.dumps({
                        "camera_id": camera_id,
                        "status": "error", 
                        "message": f"Face already registered for {matched_faceId}"}))
                    api_caller.updateEntryLogSanitizeFacility(matched_faceId)
                    is_face_registering = False
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
                            save_face_encoding(facial_scan_id_uuid, avg_encoding)
                            await websocket.send(json.dumps({
                                "camera_id": camera_id,
                                "status": "success", 
                                "message": f"Face registered for {facial_scan_id_uuid}"}))
                            is_face_registering = False
                            return
                        else:
                            await websocket.send(json.dumps({
                                "camera_id": camera_id,
                                "status": "error", 
                                "message": "Failed to register person with the backend."}))
                            is_face_registering = False
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
            is_face_registering = False
        else:
            await websocket.send(json.dumps({
                "camera_id": camera_id,
                "status": "error", 
                "message": f"Only {len(collected_encodings)} angles captured."}))
            is_face_registering = False
    except Exception as e:
        print(f"[Registration Error] {e}")
        is_face_registering = False
        await websocket.send(json.dumps({
            "camera_id": camera_id,
            "status": "error", 
            "message": str(e)}))
        
 
is_face_registering = False
face_check_running = False
stop_checking = False

async def check_face_to_register(websocket,camera_id,rtsp_url, name):
    global face_check_running, stop_checking, is_face_registering
    
    if face_check_running:
        # await websocket.send(json.dumps({"status": "info", "message": "Face check already running."}))
        await asyncio.sleep(1)
        return 
    
    face_check_running = True
    try:
        while True:
            if stop_checking:  # Check the stop flag
                await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "info", 
                    "message": "Stopping face checking."}))
                break 
            
            while is_face_registering: 
                if is_face_registering is False:
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
                            "message": f"Face Detected, please stand still to register."
                        }))
                        time.sleep(1) #wait 1 second before save inital still face posistion
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
                                        "camera_id": camera_id,"status": "success", "message": f"Please Hold Still."}))
                                await asyncio.sleep(1)
                                if (time.time() - still_start_time) >= hold_still_duration:
                                    await websocket.send(json.dumps({
                                        "camera_id": camera_id,
                                        "status": "success", 
                                        "message": f"Start perform_registration"}))
                                    is_face_registering = True
                                    await asyncio.create_task(perform_registration(websocket, name, camera_id, rtsp_url))
                                    time.sleep(4)
                                    break
                            else:
                                still_start_time = None
                                initial_face_location = None
                                await websocket.send(json.dumps({
                                        "camera_id": camera_id,
                                        "status": "error", 
                                        "message": f"Moving from original point, please stand still."}))
                                time.sleep(4)
                                
                                
                    else:
                        #more than face in the frame or no face
                        still_start_time = None
                        initial_face_location = None
                        
                    time.sleep(0.1)
                #await websocket.send(json.dumps({"status": "info", "message": f"check_face_to_register loop"}))
                await websocket.send(json.dumps({
                    "camera_id": camera_id,
                    "status": "error", 
                    "message": f"Unsuccessfully, re-running check face."}))
            finally:
                time.sleep(2)
                await websocket.send(json.dumps({
                            "camera_id": camera_id,
                            "status": "success",
                            "message": f"Looking for face ..."
                        }))
    finally:
        face_check_running = False





# --- Flask Routes ---
@app.route("/recognize_face/<camera_id>", methods=["GET"])
def recognize_face(camera_id):
    rtsp_url = request.args.get('url')
    if not rtsp_url:
        return jsonify({"error": "Missing RTSP URL"}), 400
    camera = camera_manager.get_or_create_camera(camera_id, rtsp_url)
    if camera is None:
        return jsonify({"recognized": "Error: Stream unavailable"}), 503

    for _ in range(30):
        frame = camera.get_frame()
        if frame is not None:
            break
        time.sleep(0.1)
    else:
        return jsonify({"recognized": "Error: No frame"}), 500

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    locations = face_recognition.face_locations(rgb)
    encodings = face_recognition.face_encodings(rgb, locations)
    known_encodings, known_names = load_known_faces()

    for encoding in encodings:
        if known_encodings:
            matches = face_recognition.compare_faces(known_encodings, encoding)
            if True in matches:
                distances = face_recognition.face_distance(known_encodings, encoding)
                best_match = np.argmin(distances)
                if matches[best_match]:
                    return jsonify({"recognized": known_names[best_match], "camera_id": camera_id}), 200
    return jsonify({"recognized": "Unknown", "camera_id": camera_id}), 200

@app.route("/video_feed/<camera_id>")
def video_feed(camera_id):
    rtsp_url = request.args.get('url')
    if not rtsp_url:
        return "Missing RTSP URL", 400
    camera = camera_manager.get_or_create_camera(camera_id, rtsp_url)
    if camera is None:
        return f"Cannot initialize camera '{camera_id}'", 503

    def gen_frames(cam_instance):
        while True:
            frame = cam_instance.get_frame()
            if frame is None:
                placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(placeholder, f"Connecting to {camera_id}...", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                ret, buffer = cv2.imencode('.jpg', placeholder)
            else:
                ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
            if not ret:
                continue
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.03)

    return Response(gen_frames(camera), mimetype='multipart/x-mixed-replace; boundary=frame')

# @app.route("/check_face_to_register/<camera_id>")
# def check_face_to_register_old(camera_id):
#     rtsp_url = request.args.get('url')
#     if not rtsp_url:
#         return jsonify({"error": "Missing RTSP URL"}), 400
#     camera = camera_manager.get_or_create_camera(camera_id, rtsp_url)
#     if camera is None:
#         return jsonify({"error": f"Cannot initialize camera '{camera_id}'"}), 503


#     still_start_time = None
#     initial_face_location = None
#     stillness_threshold_pixels = 15
#     max_duration_check = 8
#     hold_still_duration = 3
#     start_request_time = time.time()
    
    
#     while time.time() - start_request_time < max_duration_check:
#         for _ in range(5):
#             frame = camera.get_frame()
#             if frame is not None:
#                 break
#             time.sleep(0.2)
#         else:
#             return jsonify({"recognized": "Error: No frame"}), 500
        
#         rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) #color for face_recongition
#         locations = face_recognition.face_locations(rgb)
        
        
#         if len(locations)==1 :
#             current_face_location = locations[0]
#             if still_start_time is None:
#                 still_start_time = time.time()
#                 initial_face_location = current_face_location
#             else:
#                 #check for movement
#                 top_diff = abs(current_face_location[0] - initial_face_location[0])
#                 right_diff = abs(current_face_location[1] - initial_face_location[1])
#                 bottom_diff = abs(current_face_location[2] - initial_face_location[2])
#                 left_diff = abs(current_face_location[3] - initial_face_location[3])
#                 if max(top_diff, right_diff, bottom_diff, left_diff) <= stillness_threshold_pixels:
#                     if (time.time() - still_start_time) <= hold_still_duration:
#                         return jsonify({"recognized": True})
#                 else:
#                     still_start_time = None
#                     initial_face_location = None
                
#         else:
#             #more than face in the frame
#             still_start_time = None
#             initial_face_location = None
#             return jsonify({"recognized more than two face"})
    
#         time.sleep(0.1)
#     return jsonify({"recognized": False})

# --- WebSocket Client ---
async def connect_to_central_server():
    CENTRAL_SERVER_WS_URL = "ws://localhost:5000/edge_ws"
    HOUSE_SERVER_ID = "house_server_alpha_001"
    global stop_checking
    
    while True:
        try:
            print(f"[{HOUSE_SERVER_ID}] Connecting to {CENTRAL_SERVER_WS_URL}?id={HOUSE_SERVER_ID}...")
            async with websockets.connect(f"{CENTRAL_SERVER_WS_URL}?id={HOUSE_SERVER_ID}") as websocket:
                print(f"[{HOUSE_SERVER_ID}] Connected. Waiting for commands...")
                while True:
                    message = await websocket.recv()
                    try:
                        cmd = json.loads(message)
                        if cmd.get("type") == "start_registration":
                            name = cmd.get("name")
                            camera_id = cmd.get("camera_id")
                            rtsp_url = cmd.get("rtsp_url")
                            if name and camera_id and rtsp_url:
                                asyncio.create_task(perform_registration(websocket, name, camera_id, rtsp_url))
                            else:
                                await websocket.send(json.dumps({"status": "error", "message": "Missing fields"}))
                        elif cmd.get("type") == "check_face_and_regis":
                            camera_id = cmd.get("camera_id")
                            rtsp_url = cmd.get("rtsp_url")
                            name = cmd.get("name")
                            if camera_id and rtsp_url:
                                stop_checking = False
                                asyncio.create_task(check_face_to_register(websocket, camera_id, rtsp_url, name))
                            else:
                                await websocket.send(json.dumps({"status": "error", "message": "Missing camera_id or rtsp_url"}))
                        elif cmd.get("type") == "stop_camera":
                            cid = cmd.get("camera_id")
                            if cid:
                                camera_manager.stop_camera(cid)
                                await websocket.send(json.dumps({"status": "info", "message": f"Stopped camera '{cid}'."}))
                            else:
                                await websocket.send(json.dumps({"status": "error", "message": "Missing camera_id"}))
                        elif cmd.get("type") == "stop_check_face":
                            stop_checking = True
                            camera_id = cmd.get("camera_id")
                            await websocket.send(json.dumps({"status": "info", "message": f"Stopping face checking for camera {camera_id}"}))
                            
                    except json.JSONDecodeError:
                        print(f"[{HOUSE_SERVER_ID}] Invalid JSON: {message}")
                    except Exception as e:
                        print(f"[{HOUSE_SERVER_ID}] Command error: {e}")
        except Exception as e:
            print(f"[{HOUSE_SERVER_ID}] Connection failed: {e}. Retrying...")
        await asyncio.sleep(5)

# --- Runner ---
if __name__ == "__main__":
    import nest_asyncio
    nest_asyncio.apply()

    flask_thread = Thread(target=lambda: app.run(host="0.0.0.0", port=5001, debug=False, use_reloader=False))
    flask_thread.daemon = True
    flask_thread.start()
    print("Flask app started on port 5001.")

    try:
        asyncio.run(connect_to_central_server())
    except KeyboardInterrupt:
        print("Shutdown signal received.")
    finally:
        camera_manager.stop_all_cameras()
        print("Application shutting down.")
