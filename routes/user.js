const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const Device = require('../models/Device')
const { registerValidation } = require('../configs/validation')

//Register
router.post('/register', async (req,res)=>{
    
    // validasi
    const { error } = registerValidation(req.body)
    if (error) return res.status(400).json({
        status: res.statusCode,
        message: error.details[0].message
    })

    //check device id
    const deviceExist = await Device.findOne({device_id: req.body.device_id})
    if (!deviceExist) {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Pastikan Device ID Benar, Silahkan Coba Kembali'
        })
    }
    if (deviceExist.status == "active") {
        return res.status(400).json({
            status: res.statusCode,
            message: 'Device ID Telah Digunakan'
        })
    }

    //check email
    const emailExist = await User.findOne({email: req.body.email})
    if(emailExist) return res.status(400).json({
        status: res.statusCode,
        message: 'Email sudah digunakan'
    })

    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword
    })
    
    try {
        const saveUser = await user.save()
        const device_up = await Device.updateOne({device_id: req.body.device_id},{
            user_id: saveUser._id,
            status: "active"
        })
        res.json({saveUser, device_up})
    } catch (error) {
        res.status(400).json({
            status: res.statusCode,
            message: 'Gagal Membuat user baru'
        })
    }
})

//Login
router.post('/login', async(req,res)=>{
    //check email
    const user = await User.findOne({email: req.body.email})
    if(!user) return res.status(400).json({
        status: res.statusCode,
        message: 'Email anda salah'
    })

    //check password
    const validPwd = await bcrypt.compare(req.body.password, user.password)
    if(!validPwd) return res.status(400).json({
        status: res.statusCode,
        message: 'Password anda salah'
    })

    //membuat token jwt
    const token = jwt.sign({_id:user._id}, process.env.SECRET_KEY)
    res.header('auth-token' ,token).json({
        token: token
    })
})

module.exports = router