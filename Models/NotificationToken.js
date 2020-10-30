//schema for notification token in mobile app

const mongoose = require('mongoose');


const notificationToken = mongoose.Schema({
    token: {
        type: String,
    },
    user_id: {
        type: String,
        default: null,
    },
    time: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "notsignedin"
    }
});


const NotificationToken = mongoose.model('NotificationToken', notificationToken);

module.exports = NotificationToken;