const axios = require('axios')
const { sendCommandToEdgeDevice } = require('../manager/websocketManager'); // Import function to send commands to Python
const { setupSSEConnection, sendEvent } = require('../manager//sseManager'); // Import SSE functions
const Camera = require('../models/camera');

const PYTHON_FLASK_URL = "http://localhost:5001";

async function recognizeFaceFromPython(req, res) {
    const { camera_id } = req.params;
    const { url: rtsp_url } = req.query;

    if (!rtsp_url) {
        return res.status(400).json({ error: "Missing RTSP URL" });
    }

    try {
        const pythonResponse = await axios.get(`${PYTHON_FLASK_URL}/recognize_face/${camera_id}?url=${encodeURIComponent(rtsp_url)}`);
        res.status(pythonResponse.status).json(pythonResponse.data);
    } catch (error) {
        console.error("Error calling Python /recognize_face:", error.message);
        res.status(500).json({ recognized: "Error contacting face detection service" });
    }
}

async function streamVideoFeedFromPython(req, res) {
    const { camera_id } = req.params;
    const { url: rtsp_url } = req.query;

    if (!rtsp_url) {
        return res.status(400).send("Missing RTSP URL");
    }

    try {
        const pythonStreamResponse = await axios.get(
            `${PYTHON_FLASK_URL}/video_feed/${camera_id}?url=${encodeURIComponent(rtsp_url)}`,
            { responseType: 'stream' }
        );
        res.writeHead(pythonStreamResponse.status, pythonStreamResponse.headers);
        pythonStreamResponse.data.pipe(res);
    } catch (error) {
        console.error("Error streaming from Python /video_feed:", error.message);
        res.status(500).send("Error streaming video feed.");
    }
}


async function getRegistrationEvents(req, res, next) {
    setupSSEConnection(req, res, next);
}

async function startFaceRegistration(req, res) {
    const { name, camera_id } = req.body;

    if (!name || !camera_id) {
        return res.status(400).json({ success: false, message: "Missing 'name' or 'camera_id'." });
    }

    try {
        // Fetch the RTSP URL from your database using camera_id
        const camera = await Camera.findOne({ camera_id: camera_id });
        if (!camera) {
            return res.status(404).json({ success: false, message: "Camera not found in database." });
        }
        const rtsp_url = camera.rtsp_url;
        const targetEdgeDeviceId = "house_server_alpha_001";

        const command = {
            type: "start_registration",
            name: name,
            camera_id: camera_id,
            rtsp_url: rtsp_url
        };

        const result = sendCommandToEdgeDevice(targetEdgeDeviceId, command);

        if (result.status === "success") {
            res.status(202).json({ success: true, message: "Registration command sent to edge device.", data: command });
            sendEvent({ status: "info", message: `Registration requested for ${name} on ${camera_id}` });
        } else {
            res.status(503).json({ success: false, message: result.message });
        }

    } catch (error) {
        console.error("Error initiating face registration:", error);
        res.status(500).json({ success: false, message: "Server error initiating registration." });
    }
}


async function stopCamera(req, res) {
    const { camera_id } = req.body;

    if (!camera_id) {
        return res.status(400).json({ success: false, message: "Missing 'camera_id'." });
    }


    const targetEdgeDeviceId = "house_server_alpha_001";
    const command = {
        type: "stop_camera",
        camera_id: camera_id,
    };

    const result = sendCommandToEdgeDevice(targetEdgeDeviceId, command);

    if (result.status === "success") {
        res.status(200).json({ success: true, message: `Stop camera command sent for ${camera_id}.` });
        sendEvent({ status: "info", message: `Stop camera command sent for ${camera_id}.` });
    } else {
        res.status(503).json({ success: false, message: result.message });
    }
}

module.exports = {
    recognizeFaceFromPython,
    streamVideoFeedFromPython,
    getRegistrationEvents,
    startFaceRegistration,
    stopCamera
};