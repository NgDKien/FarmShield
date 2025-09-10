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
from collections import defaultdict

# --- Centralized Camera Management ---
from camera_manager import *

# --- Flask App Initialization ---
app = Flask(__name__)
KNOWN_FACES_DIR = "known_faces"
os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
camera_manager = CameraManager()

# --- Face Encoding Functions ---
from services.face_services import *
# --- YOLO Tracking Service ---
from services.yolo_tracking_service import YOLOTrackingService

stop_checking = False
face_services = face_services()
face_encooding = face_encoding()
yolo_tracking_service = YOLOTrackingService()

# --- Annotation State Management ---
active_annotations = defaultdict(dict)  # Track active annotations per camera




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
    known_encodings, known_names = face_encooding.load_known_faces()

    for encoding in encodings:
        if known_encodings:
            matches = face_recognition.compare_faces(known_encodings, encoding)
            if True in matches:
                distances = face_recognition.face_distance(known_encodings, encoding)
                best_match = np.argmin(distances)
                if matches[best_match]:
                    return jsonify({"recognized": known_names[best_match], "camera_id": camera_id}), 200
    return jsonify({"recognized": "Unknown", "camera_id": camera_id}), 200

def draw_face_annotations(frame, face_locations, color=(0, 255, 0), label="Face"):
    """Draw rectangles around detected faces with optional label"""
    for (top, right, bottom, left) in face_locations:
        top = max(0, top - 20)
        left = max(0, left - 20)
        bottom = min(frame.shape[0], bottom + 20)
        right = min(frame.shape[1], right + 20)
        
        # Draw a rectangle around the face
        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
        # Draw a label with a background
        cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(frame, label, (left + 6, bottom - 6), font, 0.6, (255, 255, 255), 1)
    return frame

def draw_registration_guide(frame):
    """
    Draw a guide circle on the frame that users should position their face within.
    
    Args:
        frame (numpy.ndarray): The frame to draw on
        
    Returns:
        numpy.ndarray: The frame with the guide circle drawn
    """
    height, width = frame.shape[:2]
    center = (width // 2, height // 2)
    radius = 100  # Reduced to 2/3 of original size (150 * 2/3 = 100)
    
    # Draw the guide circle
    cv2.circle(frame, center, radius, (0, 255, 0), 2)
    cv2.putText(frame, "Position your face within the circle", (10, 30), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    return frame

def draw_tracking_annotations(frame, results):
    """Draw YOLO tracking annotations on frame"""
    if not results or len(results) == 0:
        return frame
        
    result = results[0]  # Get first result
    if not hasattr(result, 'boxes') or result.boxes is None:
        return frame
        
    # Extract bounding boxes, confidences, and track IDs
    boxes = result.boxes.xyxy.cpu().numpy()  # Bounding boxes
    confidences = result.boxes.conf.cpu().numpy()  # Confidence scores
    class_ids = result.boxes.cls.cpu().numpy()  # Class IDs
    track_ids = result.boxes.id.cpu().numpy() if result.boxes.id is not None else [None] * len(boxes)
    
    # Process each detected person
    for i, (box, confidence, class_id, track_id) in enumerate(zip(boxes, confidences, class_ids, track_ids)):
        if class_id == 0 and confidence > 0.5:  # Person detected with good confidence
            x1, y1, x2, y2 = map(int, box)
            person_id = int(track_id) if track_id is not None else i
            
            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            
            # Draw label with person ID
            label = f"Person {person_id}"
            cv2.rectangle(frame, (x1, y1 - 20), (x1 + len(label) * 10, y1), (255, 0, 0), cv2.FILLED)
            cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
    return frame

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
                # Check if we need to add annotations
                if camera_id in active_annotations:
                    annotation_type = active_annotations[camera_id].get('type')
                    
                    if annotation_type == "face_registration":
                        # Add registration guide circle and face detection annotations
                        frame = draw_registration_guide(frame)
                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        face_locations = face_recognition.face_locations(rgb)
                        frame = draw_face_annotations(frame, face_locations, (0, 255, 0), "Registering")
                        
                    elif annotation_type == "face_checking":
                        # Add registration guide circle and face detection annotations for checking
                        frame = draw_registration_guide(frame)
                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        face_locations = face_recognition.face_locations(rgb)
                        frame = draw_face_annotations(frame, face_locations, (255, 255, 0), "Checking")
                        
                    elif annotation_type == "tracking":
                        # Add YOLO tracking annotations
                        # Get annotated frame from YOLO tracking service
                        annotated_frame = yolo_tracking_service.get_annotated_frame()
                        if annotated_frame is not None:
                            frame = annotated_frame

                ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
            if not ret:
                continue
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.01)

    return Response(gen_frames(camera), mimetype='multipart/x-mixed-replace; boundary=frame')


# --- WebSocket Client ---
async def connect_to_central_server():
    CENTRAL_SERVER_WS_URL = "ws://localhost:5000/edge_ws"
    HOUSE_SERVER_ID = "house_server_alpha_001"
    
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
                                # Set annotation state for face registration
                                active_annotations[camera_id] = {'type': 'face_registration', 'name': name}
                                asyncio.create_task(face_services.perform_registration(websocket, name, camera_id, rtsp_url))
                            else:
                                await websocket.send(json.dumps({"status": "error", "message": "Missing fields"}))
                        elif cmd.get("type") == "check_face_and_regis":
                            camera_id = cmd.get("camera_id")
                            rtsp_url = cmd.get("rtsp_url")
                            name = cmd.get("name")
                            if camera_id and rtsp_url:
                                # Set annotation state for face checking
                                active_annotations[camera_id] = {'type': 'face_checking', 'name': name}
                                face_services.stop_check(False)
                                # Pass a default name if none is provided
                                if not name:
                                    name = "Unknown Person"
                                asyncio.create_task(face_services.check_face_to_register(websocket, camera_id, rtsp_url, name))
                            else:
                                await websocket.send(json.dumps({"status": "error", "message": "Missing camera_id or rtsp_url"}))
                        elif cmd.get("type") == "start_tracking":
                            camera_id = cmd.get("camera_id")
                            rtsp_url = cmd.get("rtsp_url")
                            if camera_id and rtsp_url:
                                camera = camera_manager.get_or_create_camera(camera_id, rtsp_url)
                                if camera is not None:
                                    # Set annotation state for tracking
                                    active_annotations[camera_id] = {'type': 'tracking'}
                                    yolo_tracking_service.start_tracking(camera)
                                    await websocket.send(json.dumps({"status": "info", "message": f"Started tracking on camera '{camera_id}'."}))
                                else:
                                    await websocket.send(json.dumps({"status": "error", "message": f"Failed to initialize camera '{camera_id}'"}))
                            else:
                                await websocket.send(json.dumps({"status": "error", "message": "Missing camera_id or rtsp_url"}))
                        elif cmd.get("type") == "stop_tracking":
                            yolo_tracking_service.stop_tracking()
                            camera_id = cmd.get("camera_id")
                            # Remove annotation state
                            if camera_id in active_annotations:
                                del active_annotations[camera_id]
                            await websocket.send(json.dumps({"status": "info", "message": f"Stopped tracking on camera {camera_id}"}))
                        elif cmd.get("type") == "stop_camera":
                            cid = cmd.get("camera_id")
                            if cid:
                                camera_manager.stop_camera(cid)
                                # Remove annotation state
                                if cid in active_annotations:
                                    del active_annotations[cid]
                                await websocket.send(json.dumps({"status": "info", "message": f"Stopped camera '{cid}'."}))
                            else:
                                await websocket.send(json.dumps({"status": "error", "message": "Missing camera_id"}))
                        elif cmd.get("type") == "stop_check_face":
                            face_services.stop_check(True)
                            camera_id = cmd.get("camera_id")
                            # Remove annotation state
                            if camera_id in active_annotations:
                                del active_annotations[camera_id]
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
        yolo_tracking_service.stop_tracking()
        camera_manager.stop_all_cameras()
        print("Application shutting down.")
