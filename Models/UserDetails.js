const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    uid: {
        type: String,
    },
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
    phno: {
        type: String,
    },
    college: {

    },
    gender: {
        type: String,
    },
    bio: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    status:{
        type: Boolean,
    },
    lastseen: {
        type: String,
        default: Date.now
    }
})