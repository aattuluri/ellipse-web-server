const jwt = require('jsonwebtoken')
const UserLogin = require('../Models/User')

const auth = async(req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '')

    try {
        console.log(token);
        const data = jwt.verify(token, process.env.JWT_KEY)
        // console.log("ghhh")
        const user = await UserLogin.findOne({ _id: data._id, 'tokens.token': token })
        // console.log(user);
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