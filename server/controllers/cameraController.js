const Camera = require('../models/camera');

// Get all cameras
async function getCameras(req, res) {
    try {
        const cameras = await Camera.find();
        res.status(200).json(cameras);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get a camera by ID
async function getCameraById(req, res) {
    try {
        const camera = await Camera.findById(req.params.id);
        if (!camera) {
            return res.status(404).json({ message: 'Camera not found' });
        }
        res.status(200).json(camera);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Create a new camera
async function createCamera(req, res) {
    const camera = new Camera({
        camera_id: req.body.camera_id,
        rtsp_url: req.body.rtsp_url,
        location: req.body.location,
        status: req.body.status
    });

    try {
        const savedCamera = await camera.save();
        res.status(201).json(savedCamera);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Update an existing camera
async function updateCamera(req, res) {
    try {
        const camera = await Camera.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!camera) {
            return res.status(404).json({ message: 'Camera not found' });
        }
        res.status(200).json(camera);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Delete a camera
async function deleteCamera(req, res) {
    try {
        const camera = await Camera.findByIdAndDelete(req.params.id);
        if (!camera) {
            return res.status(404).json({ message: 'Camera not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getCameras,
    getCameraById,
    createCamera,
    updateCamera,
    deleteCamera
};
