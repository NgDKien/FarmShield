const express = require('express');
const router = express.Router();
const faceDetectionService = require('../services/faceDetectionService');


router.get('/recognize/:camera_id', faceDetectionService.recognizeFaceFromPython);
router.get('/video_feed/:camera_id', faceDetectionService.streamVideoFeedFromPython);
router.get('/registration_events', faceDetectionService.getRegistrationEvents);
router.post('/start_registration', faceDetectionService.startFaceRegistration);
router.post('/stop_camera', faceDetectionService.stopCamera);
router.post('/check-face-and-regis', faceDetectionService.checkFaceAndRegis);
router.post('/stop_check_face', faceDetectionService.stopFaceRegistration);

module.exports = router;