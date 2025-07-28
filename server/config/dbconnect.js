const { default: mongoose } = require('mongoose')

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, { dbName: "farmshield" })
        if (conn.connection.readyState === 1) console.log('🟢 Connected to MongoDB Atlas via Mongoose!')
        else console.log('Database connecting ...');
    } catch (error) {
        console.log('🔴 MongoDB connection failed !')
        throw new Error(error)
    }
}

module.exports = dbConnect