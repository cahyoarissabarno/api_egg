const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
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

cron.schedule('40 48 23 * * *', function(){
    console.log('running task');
    let Data = ''
    axios.get(`https://api-egg.herokuapp.com/api/device/time`)
    .then(res => {
        if (res.status === 200) {
            Data = res.data
            console.log(Data)

            for (let x = 0; x < Data.length; x++) {
                console.log('for1')
                let slots = ''
                for (let y = 0; Data < array.length; y++) {
                    console.log('for2')
                    let slot = Data[x].slot[y];
                    slots += toString(slot) + ', '
                }
                console.log(slots)
                console.log('end')
                // const templateEmail = {
                //     from: process.env.MAIL_NAME,
                //     to: Data[x].email,
                //     subject: 'Reset Password - Egg Cracker',
                //     html: `
                //         <h3> Egg Cracker </h3>
                //         <p>Slot ${slots} selesai</p> 
                //         <br>
                //         <p>
                //         <span>eggcrackerid@gmail.com</span><br>
                //         <span>Surabaya, Indonesia</span>
                //         </p>
                //         ${date}
                //         `,
                // }
            
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
                
                // try {
                //     const sendEmail = await transporter.sendMail(templateEmail)
                //     res.json({sendEmail, message:"Silahkan cek email anda"})
            
                // } catch (error) {
                //     console.log(error)
                //     res.status(400).json({
                //         status: res.statusCode,
                //         message: 'Reset password gagal'
                //     })
                // }
            }
        }
    },err => {
        console.log(err)
    });
})

// "bcryptjs": "^2.4.3",