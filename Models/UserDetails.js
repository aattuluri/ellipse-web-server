const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        // required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        
    },
    user_id: {
        type: String,
        default: null
    },
    username:{
        type: String,
        default: null
    },
    phone_no: {
        type: String,
        default: null
    },
    college_id:{
        type: String,
        default: null
    },
    college_name: {
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
    profile_pic: {
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


const UserDetails = mongoose.model('UserDetails', userSchema)

module.exports = UserDetails