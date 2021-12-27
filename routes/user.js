const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
// const bcrypt = require('bcryptjs') //only on localhost
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

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
    // const deviceExist = await Device.findOne({device_id: req.body.device_id})
    // if (!deviceExist) {
    //     return res.status(400).json({
    //         status: res.statusCode,
    //         message: 'Pastikan Device ID Benar, Silahkan Coba Kembali'
    //     })
    // }
    // if (deviceExist.status == "active") {
    //     return res.status(400).json({
    //         status: res.statusCode,
    //         message: 'Device ID Telah Digunakan'
    //     })
    // }

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
        // const device_up = await Device.updateOne({device_id: req.body.device_id},{
        //     user_id: saveUser._id,
        //     status: "active"
        // })
        res.json({ message: "Register Berhasil" })
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
        token: token,
        role: user.role
    })
})

//Reset Password
router.put('/reset-password', async(req,res)=>{
    const user = await User.findOne({email: req.body.email})
    if(!user) return res.status(400).json({
        status: res.statusCode,
        message: 'Email anda salah'
    })

    //membuat token jwt
    const token = jwt.sign({_id:user._id}, process.env.SECRET_KEY)
    
    await user.updateOne({reset_token: token})
    let date = new Date();
    const templateEmail = {
        from: process.env.MAIL_NAME,
        to: req.body.email,
        subject: 'Reset Password - Egg Cracker',
        html: `
            <h3> Egg Cracker </h3>
            <p> Berikut Link Reset Password Anda. Silahkan Klik Untuk Melanjutkan Reset Password </p> 
            <a href="${process.env.CLIENT_URL}/reset-password/${token}">
                <button> Lanjutkan Reset Password </button>
            </a>
            <p><span> Terimakasih </span></p>
            <br>
            <p>
            <span>eggcrackerid@gmail.com</span><br>
            <span>Surabaya, Indonesia</span>
            </p>
            ${date}
            `,
    }

    // let transporter = nodemailer.createTransport({
    //     // service: "Gmail",
    //     host: "smtp.gmail.com",
    //     port: 587,
    //     secure: false, // true for 465, false for other ports
    //     requireTLS: true,
    //     auth: {
    //       user: process.env.MAIL_NAME, // generated ethereal user
    //       pass: process.env.MAIL_KEY // generated ethereal password
    //     }
    // });

    const createTransporter = async () => {
        const oauth2Client = new OAuth2(
          process.env.CLIENT_ID,
          process.env.CLIENT_SECRET,
          "https://developers.google.com/oauthplayground"
        );
      
        oauth2Client.setCredentials({
          refresh_token: process.env.REFRESH_TOKEN
        });
      
        const accessToken = await new Promise((resolve, reject) => {
          oauth2Client.getAccessToken((err, token) => {
            if (err) {
              reject();
            }
            resolve(token);
          });
        });
      
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: process.env.EMAIL,
            accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN
          }
        });
      
        return transporter;
    }

    const sendEmail = async (emailOptions) => {
        try {
            // const sendEmail = await transporter.sendMail(templateEmail)
            //emailOptions - who sends what to whom
            let emailTransporter = await createTransporter();
            await emailTransporter.sendMail(emailOptions);
            
            res.json({sendEmail, message:"Silahkan cek email anda"})
    
        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: res.statusCode,
                message: 'Reset password gagal'
            })
        }
    };
    
    sendEmail({
        subject: "Test",
        text: "I am sending an email from nodemailer!",
        to: "put_email_of_the_recipient",
        from: process.env.EMAIL
    });
}),

//Set New Password
router.put('/reset-password/:token', async(req,res)=>{
    const user = await User.findOne({reset_token: req.params.token})
    if(!user) return res.status(400).json({
        status: res.statusCode,
        message: 'Token tidak ditemukan'
    })

    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    
    try {
        await user.updateOne({
            password: hashPassword,
            reset_token: ''
        })
        res.json({ message: "Reset Password Berhasil" })
    } catch (error) {
        res.status(400).json({
            status: res.statusCode,
            message: 'Gagal Reset Password'
        })
    }

    
})

module.exports = router