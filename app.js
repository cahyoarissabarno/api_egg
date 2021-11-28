const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv/config')

const app = express()

//json parser & middleware
app.use(express.json({extended: true, limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors())

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
app.listen(process.env.PORT, ()=>{
    console.log(`Server running in port ${process.env.PORT}`)
})