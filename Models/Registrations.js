const mongoose = require('mongoose');


const registration = mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    event_id: {
        type: String,
        required: true
    },
    data:{
        type: Object,
    },
    status: {
        type: String,
        default: "registered"
    },
    time: {
        type: Date,
        default: Date.now
    }
});


const Registration = mongoose.model('Registration', registration);

module.exports = Registration;