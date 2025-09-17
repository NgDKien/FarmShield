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
    avatar: {
        type: String,
        default: null
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

// Virtual để tạo full URL cho avatar
userSchema.virtual('avatarUrl').get(function () {
    if (this.avatar) {
        return `${process.env.BASE_URL || 'http://localhost:5000'}/${this.avatar}`;
    }
    return null;
});

// Đảm bảo virtual fields được include khi convert to JSON
userSchema.set('toJSON', { virtuals: true });

//Export the model
module.exports = mongoose.model('User', userSchema);