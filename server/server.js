const express = require("express")
require("dotenv").config()
const dbConnect = require('./config/dbconnect')
const initRoutes = require('./routes')
const cookieParser = require('cookie-parser')
const cors = require("cors")
const { initializeWebSocketServer } = require('./manager/websocketManager');
const { sendEvent } = require('./manager/sseManager');
const path = require('path');

const app = express()
app.use(
    cors({
<<<<<<< HEAD
        origin: process.env.CLIENT_URL,
=======
        // origin: process.env.CLIENT_URL,
        origin: true,
>>>>>>> origin/yolo_tracking
        methods: ["POST", "PUT", "GET", "DELETE"],
        allowedHeaders: [
        'Origin',
        'X-Requested-With', 
        'Content-Type', 
        'Accept', 
        'Authorization',
        'Cache-Control'
        ],
        credentials: true,
    })
)
app.use(cookieParser())
const port = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

dbConnect()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: "File upload error: " + error.message
        });
    }

    res.status(500).json({
        success: false,
        message: "Server error: " + error.message
    });
});

initRoutes(app);

const httpServer = app.listen(port, () => {
    console.log("🟢 HTTP Server is running on port:", port);
    initializeWebSocketServer(httpServer, { sendEvent });
});
