const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema({
    camera_id: {
        type: String,
        required: true,
        unique: true
    },
    rtsp_url: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Camera = mongoose.model('Camera', cameraSchema);

module.exports = Camera;