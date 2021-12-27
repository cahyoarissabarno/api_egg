const express = require('express')
const router = express.Router()

const Device = require('../models/Device')
const User = require('../models/User')
const { validateToken } = require('../configs/validation')

//list device [USER]
router.get('/', validateToken, async (req, res)=>{
    const getUser = await User.findOne({_id: req.user._id})
    const allDevice = await Device.find({user_id: req.user._id})

    return res.json({ getUser, allDevice })
})

//get device for dashboard monitoring [USER]
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

//add new device [USER]
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
            status: "active",
            lamp1: "on",
            lamp2: "on",
            motor: "on",
            slot: [
                { slot_no : 1, status : "Tidak Digunakan", egg_sum : "--", started_at : "--"},
                { slot_no : 2, status : "Tidak Digunakan", egg_sum : "--", started_at : "--"},
                { slot_no : 3, status : "Tidak Digunakan", egg_sum : "--", started_at : "--"},
                { slot_no : 4, status : "Tidak Digunakan", egg_sum : "--", started_at : "--"},
                { slot_no : 5, status : "Tidak Digunakan", egg_sum : "--", started_at : "--"},
                { slot_no : 6, status : "Tidak Digunakan", egg_sum : "--", started_at : "--"},
                { slot_no : 7, status : "Tidak Digunakan", egg_sum : "--", started_at : "--"}
            ] 
        })
        res.json({message: "Device behasil ditambahkan"})
    } catch (error) {
        res.json({message: error})
    }
})

//control lampu1
router.get('/lamp1/:device_id', async(req, res)=>{
    const getDevice = await Device.findOne({device_id: req.params.device_id})
    return res.send(getDevice.lamp1)
})

router.put('/lamp1', validateToken, async(req, res)=>{
    const getDevice = await Device.findOne({device_id: req.body.device_id})
    if (!getDevice) {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Pastikan Device ID Benar, Silahkan Coba Kembali'
        })
    }
    try {
        const device = await Device.updateOne({device_id: req.body.device_id},{
            lamp1: req.body.lamp1,
        })
        if(req.body.lamp1 == "off"){ res.json({message: "Lampu 1 Berhasil Dimatikan"}) }
        if(req.body.lamp1 == "on"){ res.json({message: "Lampu 1 Berhasil Dinyalakan"}) }        
    } catch (error) {
        res.json({message: error})
    }
})

//control lampu2
router.get('/lamp2/:device_id', async(req, res)=>{
    const getDevice = await Device.findOne({device_id: req.params.device_id})
    return res.send(getDevice.lamp2)
})
router.put('/lamp2', validateToken, async(req, res)=>{
    const getDevice = await Device.findOne({device_id: req.body.device_id})
    if (!getDevice) {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Pastikan Device ID Benar, Silahkan Coba Kembali'
        })
    }
    try {
        const device = await Device.updateOne({device_id: req.body.device_id},{
            lamp2: req.body.lamp2,
        })
        if(req.body.lamp2 == "off"){ res.json({message: "Lampu 2 Berhasil Dimatikan"}) }
        if(req.body.lamp2 == "on"){ res.json({message: "Lampu 2 Berhasil Dinyalakan"}) }  
    } catch (error) {
        res.json({message: error})
    }
})

//motor
router.get('/motor/:device_id', async(req, res)=>{
    const getDevice = await Device.findOne({device_id: req.params.device_id})
    return res.send(getDevice.motor)
})

router.put('/motor', validateToken, async(req, res)=>{
    const getDevice = await Device.findOne({device_id: req.body.device_id})
    if (!getDevice) {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Pastikan Device ID Benar, Silahkan Coba Kembali'
        })
    }
    try {
        const device = await Device.updateOne({device_id: req.body.device_id},{
            motor: req.body.motor
        })
        if(req.body.motor == "off"){ res.json({message: "Motor Berhasil Dimatikan"}) }
        if(req.body.motor == "on"){ res.json({message: "Motor Berhasil Dinyalakan"}) }  
    } catch (error) {
        res.json({message: error})
    }
})

//check limit timeline
router.get('/time', async(req,res)=>{
    const getDevice = await Device.find({status: "active"})
    let timesUp =[]
    let getSlot = []
    for (let x = 0; x < getDevice.length; x++) {
        let device = getDevice[x];
        for (let y = 0; y < device.slot.length; y++) {
            let devSlot = device.slot[y]
            if (devSlot.started_at != "--") {
                let dateTokens = devSlot.started_at.split("-")
                let milDate = new Date(dateTokens[0], dateTokens[1]-1, dateTokens[2]).getTime()
                let time = Math.abs(new Date().getTime() - milDate)
                let result = Math.ceil(time / (1000*60*60*24))
                if (result>=25) {
                    getSlot.push(devSlot.slot_no)
                }
            }
        }
        if (getSlot.length > 0) {
            const getUser = await User.findOne({_id: device.user_id})
            timesUp.push({
                user_id: device.user_id,
                email: getUser.email,
                device_id: device.device_id,
                slot: getSlot
            })
        }
        getSlot = []
    }
    return res.json({timesUp})
})

module.exports = router