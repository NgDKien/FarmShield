const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');


router.get('/getall', cameraController.getCameras);
router.get('/getbyid/:id', cameraController.getCameraById);
router.post('/create', cameraController.createCamera);
router.put('/update/:id', cameraController.updateCamera);
router.delete('/delete/:id', cameraController.deleteCamera);

module.exports = router;
