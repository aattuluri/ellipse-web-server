const jwt = require('jsonwebtoken')
const UserLogin = require('../Models/User')

const auth = async(req, res, next) => {
    console.log(req.header('Authorization'));
    const token = req.header('Authorization').replace('Bearer ', '')

    try {
        const data = jwt.verify(token, process.env.JWT_KEY)
        const user = await UserLogin.findOne({ _id: data._id, 'tokens.token': token })
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