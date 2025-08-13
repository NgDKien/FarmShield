const userRouter = require('./user')
const cameraRouter = require('./cameraRoute')
const faceDetectionRoute = require('./faceDectectionRoute');
const personRouter = require('./personRoute');


const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/camera', cameraRouter)
    app.use('/api/face_detection', faceDetectionRoute)
    app.use('/api/person',personRouter )
}

module.exports = initRoutes