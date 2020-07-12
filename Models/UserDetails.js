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
        
    },
    userid: {
        type: String,
        default: null
    },
    username:{
        type: String,
        
    },
    phno: {
        type: String,
        default: null
    },
    collegeId:{
        type: String,
        default: null
    },
    collegeName: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    imageUrl: {
        type: String,
        default: null
    },
    status:{
        type: Boolean,
        default: false
    },
    lastseen: {
        type: String,
        default: Date.now,
        default: null
    },
    designation: {
        type: String,
        default: null
    },
    verified: {
        type: Boolean,
        default: false  
    },
    otp: {
        type: String,
        default: "000000"  
    }
})
// userSchema.pre('save', async function (next) {
//     // Hash the password before saving the user model
//     const user = this
//     if (user.isModified('password')) {
//         user.password = await bcrypt.hash(user.password, 8)
//     }
//     next()
// })

// userSchema.methods.generateOtp = async function(){
//     const otp = otpGenerator.generate(6, {upperCase: false, specialChars: false });
//     console.log(otpGenerator.generate(6, { upperCase: false, specialChars: false }));
//     console.log(otp);
//     return otp;
// }

// userSchema.methods.generateAuthToken = async function() {
//     // Generate an auth token for the user
//     const user = this
//     const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
//     user.tokens = user.tokens.concat({token})
//     await user.save()
//     return token
// }

// userSchema.statics.findByCredentials = async (email, password) => {
//     // Search for a user by email and password.
//     console.log(email);
//     const user = await User.findOne({ email} );
//     console.log(user);
//     if (!user) {
//         throw new Error('Invalid login credentials')
//     }
//     const isPasswordMatch = await bcrypt.compare(password, user.password)
//     if (!isPasswordMatch) {
//         throw new Error('Invalid login credentials')
//     }
//     return user
// }

const UserDetails = mongoose.model('UserDetails', userSchema)

module.exports = UserDetails