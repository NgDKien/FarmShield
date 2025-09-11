import axios from 'axios';
const API_FACE_DETECTION_URL = import.meta.env.VITE_API_FACE_DETECTION_URL;
const VITE_API_URI = import.meta.env.VITE_API_URI;

if (!API_FACE_DETECTION_URL) {
    throw new Error("API_FACE_DETECTION_URL is not defined in the environment variables.");
};

const handleStartTracking = async (camera_id, rtsp_url) => {
    try {
        const response = await axios.post(`${VITE_API_URI}/tracking/start`, {
            camera_id: camera_id,
            rtsp_url: rtsp_url
        });
        return response.data;
    } catch (error) {
        console.error("Error starting tracking:", error);
        throw error;
    }
};

const handleStopTracking = async (camera_id) => {
    try {
        const response = await axios.post(`${VITE_API_URI}/tracking/stop`, {
            camera_id: camera_id
        });
        return response.data;
    } catch (error) {
        console.error("Error stopping tracking:", error);
        throw error;
    }
};  

export { handleStartTracking , handleStopTracking };