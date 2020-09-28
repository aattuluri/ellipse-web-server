const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var otpGenerator = require("otp-generator");

const adminLoginSchema = mongoose.Schema({
    
    username: {
        type: String,
        // required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    signup_time: {
        type: String,
        default: Date.now()
    },
})
adminLoginSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


adminLoginSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
    // user.tokens = user.tokens.concat({token})
    // await user.save()
    return token
}

const AdminLogin = mongoose.model('AdminLogin', adminLoginSchema)

module.exports = AdminLogin