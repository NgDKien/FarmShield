const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    account: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["GSV", "Admin"],
        default: "GSV",
    },
    refreshToken: {
        type: String,
    },
});

userSchema.methods = {
    isCorrectPassword: async function (password) {
        return await password === this.password;
    },
};

//Export the model
module.exports = mongoose.model('User', userSchema);