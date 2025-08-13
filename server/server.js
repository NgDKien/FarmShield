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
        origin: process.env.CLIENT_URL,
        methods: ["POST", "PUT", "GET", "DELETE"],
        credentials: true,
    })
)
app.use(cookieParser())
const port = process.env.PORT || 8888

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
