const express = require('express')
const router = express.Router()

const Device = require('../models/Device')
const { validateToken } = require('../configs/validation')

//create
router.post('/', validateToken, async (req, res)=>{
    const devicePost = new Device({
        user_id: req.body.user_id,
        device_id: req.body.device_id,
        device_name: req.body.device_name
    })
    try {
        const device = await devicePost.save()
        res.json(device)
    } catch (error) {
        res.json({message: err})
    }
})

//read
router.get('/', validateToken, async (req, res)=>{
    try {
        const device = await Device.find()
        res.json(device)
    } catch (error) {
        res.json({message: error})
    }
})

//update
router.put('/:deviceId', validateToken, async(req, res)=>{
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