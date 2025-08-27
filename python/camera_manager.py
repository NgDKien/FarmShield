import time
import cv2
from threading import Thread, Lock

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