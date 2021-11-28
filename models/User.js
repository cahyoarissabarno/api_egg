const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        max: 255
    },
    email: {
        type: String,
        required: true,
        max: 100
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    role: {
        type: String,
        default: "user"
    },
    reset_token: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', userSchema)