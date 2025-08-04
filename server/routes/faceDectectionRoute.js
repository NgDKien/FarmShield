const express = require('express');
const router = express.Router();
const faceDetectionService = require('../services/faceDetectionService');

router.get('/recognize/:camera_id', faceDetectionService.recognizeFaceFromPython);
router.get('/video_feed/:camera_id', faceDetectionService.streamVideoFeedFromPython);

module.exports = router;