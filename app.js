const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const nodemailer = require('nodemailer')
const cron = require('node-cron')
const axios = require('axios')
require('dotenv/config')

const app = express()

//json parser & middleware
app.use(cors())
app.use(express.json({extended: true, limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

//import routes
const deviceRoutes = require('./routes/device')
const userRoutes = require('./routes/user')
const timelineRoutes = require('./routes/timeline')
const adminRoutes = require('./routes/admin')


//routes example
app.use('/api/device', deviceRoutes)
app.use('/api/user', userRoutes)
app.use('/api/timeline', timelineRoutes)
app.use('/api/admin', adminRoutes)

//connect to db
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
let db = mongoose.connection

db.on('error', console.error.bind(console, 'Database connect error'))
db.once('open', ()=>{ console.log('Database is Connected') })

//listen
app.listen(process.env.PORT || 80, ()=>{
    console.log(`Server running in port ${process.env.PORT}`)
})

cron.schedule('40 15 8 * * *', function(){
    console.log('running task');
    let Data = []
    axios.get(`https://api-egg.herokuapp.com/api/device/time`)
    .then(res => {
        if (res.status === 200) {
            Data = res.data.timesUp
            // console.log(Data)

            for (let x = 0; x < Data.length; x++) {
                let slots = ''
                // console.log(Data[x].slot)
                for (let y = 0; y < Data[x].slot.length; y++) {
                    let slot = Data[x].slot[y];
                    slots += '[ Slot ' + slot.toString() + ' ] '
                }
                // console.log(slots)

                let date = new Date();
                const templateEmail = {
                    from: process.env.MAIL_NAME,
                    to: Data[x].email,
                    subject: 'Pemberitahuan[TELUR MENETAS] - Egg Cracker',
                    html: `
                        <h3> Egg Cracker </h3>
                        <p>Pemberitahuan : Pada <b>${slots}</b> di Device anda telah melebihi 25 hari
                        Silahkan Cek Inkubator Anda https://eggcracker.site</p> 
                        <br>
                        <p>
                        <span>eggcrackerid@gmail.com</span><br>
                        <span>Surabaya, Indonesia</span>
                        </p>
                        ${date}
                        `,
                }
            
                let transporter = nodemailer.createTransport({
                    // service: "Gmail",
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    requireTLS: true,
                    auth: {
                      user: process.env.MAIL_NAME, // generated ethereal user
                      pass: process.env.MAIL_KEY // generated ethereal password
                    }
                });
                
                const emailSender = async()=>{
                    try {
                        await transporter.sendMail(templateEmail)
                        console.log('email terkirim')
                
                    } catch (error) {
                        console.log(error)
                    }
                }

                emailSender()
            }
        }
    },err => {
        console.log(err)
    });
})

// "bcryptjs": "^2.4.3",