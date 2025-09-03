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
from camera_manager import *

# --- Flask App Initialization ---
app = Flask(__name__)
KNOWN_FACES_DIR = "known_faces"
os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
camera_manager = CameraManager()

# --- Face Encoding Functions ---
from services.face_services import *
stop_checking = False
face_services = face_services()
face_encooding = face_encooding()



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
                                asyncio.create_task(face_services.perform_registration(websocket, name, camera_id, rtsp_url))
                            else:
                                await websocket.send(json.dumps({"status": "error", "message": "Missing fields"}))
                        elif cmd.get("type") == "check_face_and_regis":
                            camera_id = cmd.get("camera_id")
                            rtsp_url = cmd.get("rtsp_url")
                            name = cmd.get("name")
                            if camera_id and rtsp_url:
                                face_services.stop_check(False)
                                asyncio.create_task(face_services.check_face_to_register(websocket, camera_id, rtsp_url, name))
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
                            face_services.stop_check(True)
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
