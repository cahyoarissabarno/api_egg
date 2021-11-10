const express = require('express')
const router = express.Router()

const Device = require('../models/Device')
const User = require('../models/User')
const { validateToken } = require('../configs/validation')

//get[ Admin ]
router.get('/admin', validateToken, async (req, res)=>{
    const devices = await Device.find()
    const getUser = await User.findOne({_id: req.user._id})

    if (getUser.role != "admin") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses Ditolak !'
        })
    }

    return res.json({
        devices, getUser
    })
})

//create[ Admin ]
router.post('/admin', validateToken, async (req, res)=>{
    const getDevice = await Device.findOne({device_id: req.body.device_id})
    const getUser = await User.findOne({_id: req.user._id})

    if (getUser.role != "admin") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses Ditolak !'
        })
    }

    if (getDevice) {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Device ID Telah Digunakan'
        })
    }
    const devicePost = new Device({
        device_id: req.body.device_id
    })
    try {
        const device = await devicePost.save()
        res.json(device)
    } catch (error) {
        res.json({message: error})
    }
})

//list device
router.get('/', validateToken, async (req, res)=>{
    const getUser = await User.findOne({_id: req.user._id})
    const allDevice = await Device.find({user_id: req.user._id})

    return res.json({ getUser, allDevice })
    
    // try {
    //     const device = await Device.find()
    //     res.json(device)
    // } catch (error) {
    //     res.json({message: error})
    // }
})

//get device for dashboard monitoring
router.get('/dashboard/:device_id', validateToken, async (req, res)=>{
    const getUser = await User.findOne({_id: req.user._id})
    const getDevice = await Device.find({ device_id: req.params.device_id })

    if (!getDevice) {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Device tidak ditemukan'
        })
    }

    return res.json({ getUser, getDevice })
})

//add new device
router.put('/add', validateToken, async(req, res)=>{
    const getDevice = await Device.findOne({device_id: req.body.device_id})
    if (!getDevice) {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Pastikan Device ID Benar, Silahkan Coba Kembali'
        })
    }
    if (getDevice.status == "active") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Device ID Telah Digunakan'
        })
    }
    try {
        const device = await Device.updateOne({device_id: req.body.device_id},{
            user_id: req.body.user_id,
            device_name: req.body.device_name,
            status: "active"
        })
        res.json({message: "Device behasil ditambahkan"})
    } catch (error) {
        res.json({message: err})
    }
})

//update [Admin]
// router.put('/:deviceId', validateToken, async(req, res)=>{
//     try {
//         const device = await Device.updateOne({_id: req.params.deviceId},{
//             user_id: req.body.user_id,
//             device_id: req.body.device_id,
//             device_name: req.body.device_name
//         })
//         res.json(device)
//     } catch (error) {
//         res.json({message: err})
//     }
// })

//delete
router.delete('/:deviceId', validateToken, async(req, res)=>{
    try {
        const device = await Device.deleteOne({_id: req.params.deviceId})
        res.json(device)
    } catch (error) {
        res.json({message: err})
    }
})


module.exports = router