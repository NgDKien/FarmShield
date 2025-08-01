const userRouter = require('./user')
const cameraRouter = require('./cameraRoute')


const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/camera', cameraRouter)
}

module.exports = initRoutes