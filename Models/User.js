const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var otpGenerator = require("otp-generator");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    username: {
        type: String,
        // required: true,
        // unique: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    signup_time: {
        type: String,
        default: Date.now
    },
    otp: {
        type: Number,
        default: null
    },
    is_verified: {
        type: Boolean,
        default: false
    },
})
userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateOtp = async function(){
    const otp = otpGenerator.generate(6, {upperCase: false, specialChars: false });
    console.log(otpGenerator.generate(6, { upperCase: false, specialChars: false }));
    console.log(otp);
    return otp;
}

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    console.log(email);
    const user = await User.findOne({ email} );
    console.log(user);
    if (!user) {
        throw new Error('Invalid login credentials')
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials')
    }
    return user
}

const UserLogin = mongoose.model('UserLogin', userSchema)

module.exports = UserLogin