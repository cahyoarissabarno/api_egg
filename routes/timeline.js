const express = require('express')
const router = express.Router()

const Device = require('../models/Device')
const User = require('../models/User')
const { validateToken } = require('../configs/validation')

//Create
// router.put('/add', validateToken, async(req, res)=>{
//     const getDevice = await Device.findOne({_id: req.body.device_id})

//     if (!getDevice) {
//         res.status(400).json({
//             status: res.statusCode,
//             message: "Device not founnd"
//         })
//     }
    
//     for (let i = 0; i < 4; i++) {
//         if (!getDevice.slot[i]) {
//             try {
//                 const device = await Device.updateOne({_id: req.body.device_id},{
//                     $push: {
//                         slot: {
//                             slot_no : i + 1,
//                             status : "enable",
//                             egg_sum : req.body.egg_sum,
//                             started_at : req.body.started_at
//                         }
//                     }
//                 })
//                 return res.json({message: "Slot behasil ditambahkan", device})

//             } catch (error) {
//                 return res.json({message: error})
//             }
//         }
//     }

//     return res.json({message: "Slot telah penuh"})
// })


//Enable 
router.get('/edit/:slot_no', validateToken, async (req, res)=>{
    const getDevice = await Device.findOne({_id: req.body.device_id})

    if (!getDevice) {
        res.status(400).json({
            status: res.statusCode,
            message: "Device not founnd"
        })
    }
    
    const getSlot = getDevice.slot[req.params.slot_no - 1]
    
    if (getSlot) {
        return res.json(getSlot)
    }
    
    return res.json({message: "Slot Tidak Ditemukan"})
})

//Up Enable
router.put('/update', validateToken, async(req, res)=>{
    const getDevice = await Device.findOne({_id: req.body.device_id})

    if (!getDevice) {
        res.status(400).json({
            status: res.statusCode,
            message: "Device not founnd"
        })
    }

    const getSlot = getDevice.slot[req.body.slot_no - 1]

    if (getSlot) {
        try {
            const updSlot = await Device.updateOne(
                { 
                    _id: req.body.device_id,
                    "slot.slot_no": req.body.slot_no
                },
                {
                    $set: {
                        "slot.$.egg_sum" : req.body.egg_sum,
                        "slot.$.started_at" : req.body.started_at,
                        "slot.$.status" : "Berjalan"
                    }
                }
            )
            return res.json({message: "Slot behasil Dijalankan", updSlot})

        } catch (error) {
            return res.json({message: error})
        }
    }

    return res.json({message: "Menjalankan Slot Gagal"})
})

//Disabled
router.put('/delete', validateToken, async(req, res)=>{
    const getDevice = await Device.findOne({_id: req.body.device_id})

    if (!getDevice) {
        res.status(400).json({
            status: res.statusCode,
            message: "Device not founnd"
        })
    }

    const getSlot = getDevice.slot[req.body.slot_no - 1]

    if (getSlot) {
        try {
            const device = await Device.updateOne(
                { 
                    _id: req.body.device_id,
                    "slot.slot_no": req.body.slot_no
                },
                {
                    $set: {
                        "slot.$.egg_sum" : "--",
                        "slot.$.started_at" : "--",
                        "slot.$.status" : "Tidak Digunakan"
                    }
                }
            )
            return res.json({message: "Slot Dihentikan", device})

        } catch (error) {
            return res.json({message: error})
        }
    }

    return res.json({message: "Hentikan Slot Gagal"})
})


module.exports = router