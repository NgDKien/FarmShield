import axios from 'axios';
const API_FACE_DETECTION_URL = import.meta.env.VITE_API_FACE_DETECTION_URL;
const VITE_API_URI = import.meta.env.VITE_API_URI;

if (!API_FACE_DETECTION_URL) {
    throw new Error("API_FACE_DETECTION_URL is not defined in the environment variables.");
}

const streamVideoFeed = (cameraId, rtspUrl) => {
    const encodedRtspUrl = encodeURIComponent(rtspUrl);
    return `${API_FACE_DETECTION_URL}/video_feed/${cameraId}?url=${encodedRtspUrl}`;
};

const handleCheckFaceToRegister = async (cameraId, rtspUrl) => {
    try {
        const response = await fetch(`${API_FACE_DETECTION_URL}/check-face-and-regis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ camera_id: cameraId, rtsp_url: rtspUrl }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to send check face command');
        }
        return data;
    } catch (error) {
        console.error("Error checking face for registration:", error);
        throw error;
    }
};

const handleStopCheckFaceToRegister = async (cameraId, rtspUrl) => {
    try {
        const response = await axios.post(`${API_FACE_DETECTION_URL}/stop_check_face`, {
            camera_id: cameraId,
            rtsp_url: rtspUrl,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data; // Axios automatically parses the JSON response
    } catch (error) {
        console.error("Error checking face for registration:", error.response ? error.response.data : error.message);
        throw error;
    }
};

const fetchQuarantineData = async () => {
    try {
        const response = await axios.get(`${VITE_API_URI}/person/quarantine`);
        return response.data; 
    } catch (error) {
        console.error('Error fetching quarantine data:', error);
        throw error;
    }
};


export { streamVideoFeed, handleCheckFaceToRegister, handleStopCheckFaceToRegister, fetchQuarantineData };