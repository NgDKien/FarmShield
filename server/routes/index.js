const userRouter = require('./user')
const cameraRouter = require('./cameraRoute')
const faceDetectionRoute = require('./faceDectectionRoute');
const personRouter = require('./personRoute');
<<<<<<< HEAD
=======
const trackingRouter = require('./trackingRoute');
>>>>>>> origin/yolo_tracking


const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/camera', cameraRouter)
    app.use('/api/face_detection', faceDetectionRoute)
    app.use('/api/person',personRouter )
<<<<<<< HEAD
=======
    app.use('/api/tracking', trackingRouter)
>>>>>>> origin/yolo_tracking
}

module.exports = initRoutes