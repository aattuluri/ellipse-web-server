const mongoose = require('mongoose');


const notification = mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    event_id: {
        type: String,
        required: true
    },
    title:{
        type: String,
    },
    description: {
        type: String,
    },
    time: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "sent"
    }
});


const Notification = mongoose.model('Notification', notification);

module.exports = Notification;