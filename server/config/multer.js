const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const createUploadDir = () => {
    const uploadDir = 'uploads/avatars/';
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
};

// Cấu hình storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = createUploadDir();
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Tạo tên file unique: avatar_timestamp_random.ext
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, 'avatar_' + uniqueSuffix + fileExtension);
    }
});

// File filter - chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
    // Kiểm tra mimetype
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ được upload file ảnh (jpg, jpeg, png, gif)!'), false);
    }
};

// Cấu hình multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Chỉ cho phép 1 file
    }
});

module.exports = upload;