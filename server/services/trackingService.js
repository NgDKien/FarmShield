const axios = require('axios')
const { sendCommandToEdgeDevice } = require('../manager/websocketManager'); // Import function to send commands to Python
const { setupSSEConnection, sendEvent } = require('../manager/sseManager'); // Import SSE functions
const Camera = require('../models/camera');

async function startTracking(req, res) {
    const { camera_id } = req.body;
    
    if (!camera_id) {
        return res.status(400).json({ success: false, message: "Missing 'camera_id'." });
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
            type: "start_tracking",
            camera_id: camera_id,
            rtsp_url: rtsp_url
        };

        const result = sendCommandToEdgeDevice(targetEdgeDeviceId, command);

        if (result.status === "success") {
            res.status(202).json({ success: true, message: "Tracking command sent to edge device.", data: command });
            sendEvent({ status: "info", message: `Tracking started on ${camera_id}` });
        } else {
            res.status(503).json({ success: false, message: result.message });
        }

    } catch (error) {
        console.error("Error initiating tracking:", error);
        res.status(500).json({ success: false, message: "Server error initiating tracking." });
    }
}

async function stopTracking(req, res) {
    const { camera_id } = req.body;

    if (!camera_id) {
        return res.status(400).json({ success: false, message: "Missing 'camera_id'." });
    }

    const targetEdgeDeviceId = "house_server_alpha_001";
    const command = {
        type: "stop_tracking",
        camera_id: camera_id,
    };

    const result = sendCommandToEdgeDevice(targetEdgeDeviceId, command);

    if (result.status === "success") {
        res.status(200).json({ success: true, message: `Stop tracking command sent for ${camera_id}.` });
        sendEvent({ status: "info", message: `Stop tracking command sent for ${camera_id}.` });
    } else {
        res.status(503).json({ success: false, message: result.message });
    }
}

async function getClothChangeEvent(req, res, next) {
    setupSSEConnection(req, res, next);
}

async function getHandWashingEvent(req, res, next) {
    setupSSEConnection(req, res, next);
}

async function getTrackingEvents(req, res, next) {
    setupSSEConnection(req, res, next);
}

// Functions to handle events from Python service
function handleClothChangeEvent(data) {
    console.log(`[Tracking Service] Cloth change detected for person ${data.person_id}`);
    // Send SSE event to frontend
    sendEvent({ 
        type: "cloth_change", 
        person_id: data.person_id, 
        timestamp: new Date().toISOString(),
        message: `Cloth change detected for person ${data.person_id}`
    });
}

function handleHandWashingEvent(data) {
    console.log(`[Tracking Service] Hand washing detected for person ${data.person_id}`);
    // Send SSE event to frontend
    sendEvent({ 
        type: "hand_washing", 
        person_id: data.person_id, 
        timestamp: new Date().toISOString(),
        message: `Hand washing detected for person ${data.person_id}`
    });
}

module.exports = {
    startTracking,
    stopTracking,
    getClothChangeEvent,
    getHandWashingEvent,
    getTrackingEvents,
    handleClothChangeEvent,
    handleHandWashingEvent
};