//schema for Reports

const mongoose = require('mongoose');


const loginActivity = mongoose.Schema({
    
    user_id: {
        type: String,
        default: null
    },
    ip_address: {
        type: String,
        default: null
    },
    type: {
        type: String,
        default: null
    },
    browser_name: {
        type: String,
        default: null
    },
    device_name: {
        type: String,
        default: null
    },
    device_os: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: null
    },
    time: {
        type: Date,
        default: Date.now
    }
});


const LoginActivity = mongoose.model('LoginActivity', loginActivity);

module.exports = LoginActivity;