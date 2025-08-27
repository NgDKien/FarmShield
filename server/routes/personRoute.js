const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
// import {upload} from '../config/multer'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'people/avatars');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Multer upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
    }
});

// 'avatar' name of the field in the form data
router.post('/register', upload.single('avatar'), personController.registerPerson);
router.get('/quarantine', personController.getAllInQuarantine);
router.post('/facility/sanitize/enter', personController.enterSanitizeFacility);
router.post('/facility/quarantine/start', personController.startQuarantine);
router.get('/:personId', personController.getPersonDetails);



module.exports = router;