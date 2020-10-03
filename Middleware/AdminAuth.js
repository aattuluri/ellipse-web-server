const jwt = require('jsonwebtoken')
const AdminLogin = require('../Models/AdminLogin')


//Middleware for checking the user with token
const auth = async(req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '')

    try {
        const data = jwt.verify(token, process.env.JWT_KEY)
        const user = await AdminLogin.findOne({ _id: data._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }
}

module.exports = auth