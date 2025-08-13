const userRouter = require('./user')
const cameraRouter = require('./cameraRoute')
const faceDetectionRoute = require('./faceDectectionRoute');

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/camera', cameraRouter)
    app.use('/api/face_detection', faceDetectionRoute)
}

module.exports = initRoutes