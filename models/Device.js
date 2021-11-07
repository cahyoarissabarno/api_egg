const mongoose = require('mongoose')

const DeviceSchema = mongoose.Schema({
    user_id:{
        type: String,
        required: true
    },
    device_id:{
        type: Number,
        required: true
    },
    device_name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "inactive"
    }
})

module.exports = mongoose.model('Device', DeviceSchema )
