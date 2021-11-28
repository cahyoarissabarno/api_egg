const mongoose = require('mongoose')

const DeviceSchema = mongoose.Schema({
    user_id:{
        type: String
    },
    device_id:{
        type: Number,
        required: true
    },
    device_name: {
        type: String
    },
    status: {
        type: String,
        default: "inactive"
    },
    lamp1: {
        type: String,
        default: "on"
    },
    lamp2: {
        type: String,
        default: "on"
    },
    motor: {
        type: String,
        default: "on"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    slot: []
})

module.exports = mongoose.model('Device', DeviceSchema )
