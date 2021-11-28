const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const Device = require('../models/Device')
const { validateToken } = require('../configs/validation')

//Is Admin [USER]
router.get('/validate', validateToken, async (req, res)=>{
    const getUser = await User.findOne({_id: req.user._id})

    if (getUser.role != "admin") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses Ditolak !'
        })
    }

    return res.status(200).json({
        status: res.statusCode
    })
})

//Get User [USER]
router.get('/user', validateToken, async (req, res)=>{
    const allUser = await User.find()
    const getUser = await User.findOne({_id: req.user._id})

    if (getUser.role != "admin") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses Ditolak !'
        })
    }

    return res.json({
        allUser
    })
})

//Edit [USER]
router.get('/user/:user_id', validateToken, async (req, res)=>{
    const getUser = await User.findOne({_id: req.params.user_id})
    const user = await User.findOne({_id: req.user._id})

    if (user.role != "admin") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses Ditolak !'
        })
    }

    return res.json({
        getUser
    })
})

//Update [USER]
router.put('/user/:user_id', validateToken, async(req, res)=>{
    const getUser = await User.findOne({device_id: req.params.user_id})
    const user = await User.findOne({_id: req.user._id})

    if (user.role != "admin") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses Ditolak !'
        })
    }
    
    try {
        const upUser = await User.updateOne({_id: req.params.user_id},{
            username: req.body.username,
            email: req.body.email
        })
        res.json({message: "User berhasil diupdate"})
    } catch (error) {
        res.json({message: err})
    }
})

//Delete [USER]
router.delete('/user/:user_id', validateToken, async(req, res)=>{
    const user = await User.findOne({_id: req.user._id})

    if (user.role != "admin") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses Ditolak !'
        })
    }
    
    try {
        const getUser = await User.deleteOne({_id: req.params.user_id})
        res.json(getUser)

    } catch (error) {
        res.json({message: err})
    }
})

//get[DEVICE]
router.get('/device', validateToken, async (req, res)=>{
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

//create[DEVICE]
router.post('/device', validateToken, async (req, res)=>{
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

// update [DEVICE]
router.put('/device/:deviceId', validateToken, async(req, res)=>{
    const getUser = await User.findOne({_id: req.user._id})

    if (getUser.role != "admin") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses Ditolak !'
        })
    }

    try {
        const device = await Device.updateOne({_id: req.params.deviceId},{
            user_id: req.body.user_id,
            device_id: req.body.device_id,
            device_name: req.body.device_name
        })
        res.json(device)
    } catch (error) {
        res.json({message: err})
    }
})

// edit [DEVICE]
router.get('/device/:deviceId', validateToken, async(req, res)=>{
    const getUser = await User.findOne({_id: req.user._id})

    if (getUser.role != "admin") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses Ditolak !'
        })
    }

    try {
        const device = await Device.findOne({_id: req.params.deviceId})
        res.json(device)
    } catch (error) {
        res.json({message: err})
    }
})

//delete [DEVICE]
router.delete('/device/:deviceId', validateToken, async(req, res)=>{
    const getUser = await User.findOne({_id: req.user._id})

    if (getUser.role != "admin") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses Ditolak !'
        })
    }
    
    try {
        const device = await Device.deleteOne({_id: req.params.deviceId})
        res.json(device)
    } catch (error) {
        res.json({message: err})
    }
})

module.exports = router