const joi = require('joi')
const jwt = require('jsonwebtoken')

const registerValidation = (data)=>{
    const schema = joi.object({
        username: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        device_id: joi.number().required()
    })

    return schema.validate(data)
}

const loginValidation = (data)=>{
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    })

    return schema.validate(data)
}

const validateToken = (req, res, next)=>{
    const token = req.header('auth-token')
    if(!token) return res.status(400).json({
        status: res.statusCode,
        message: 'Akses Ditolak !'
    })
    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY)
        req.user = verified
        next()

    } catch (error) {
        res.status(400).json({
            status: res.statusCode,
            message: "Invalid token !"
        })
    }
}

module.exports.loginValidation = loginValidation
module.exports.registerValidation = registerValidation
module.exports.validateToken = validateToken
