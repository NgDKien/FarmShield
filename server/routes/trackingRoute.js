const express = require('express');
const router = express.Router();
const trackingService = require('../services/trackingService');

router.post('/start', trackingService.startTracking);
router.post('/stop', trackingService.stopTracking);
router.get('/events/cloth-change', trackingService.getClothChangeEvent);
router.get('/events/hand-washing', trackingService.getHandWashingEvent);
router.get('/events/tracking', trackingService.getTrackingEvents);

module.exports = router;