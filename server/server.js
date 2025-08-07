const express = require("express")
require("dotenv").config()
const dbConnect = require('./config/dbconnect')
const initRoutes = require('./routes')
const cookieParser = require('cookie-parser')
const cors = require("cors")
const { initializeWebSocketServer } = require('./manager/websocketManager');
const { sendEvent } = require('./manager/sseManager');

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

initRoutes(app);

const httpServer = app.listen(port, () => {
    console.log("🟢 HTTP Server is running on port:", port);
    initializeWebSocketServer(httpServer, { sendEvent });
});
