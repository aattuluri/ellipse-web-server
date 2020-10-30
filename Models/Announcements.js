//schema for announcements

const mongoose = require('mongoose');


const announcement = mongoose.Schema({
    event_id: {
        type: String,
        default: null
    },
    title: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    visible_all: {
        type: Boolean,
        default: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});


const Announcement = mongoose.model('Announcement', announcement);

module.exports = Announcement;