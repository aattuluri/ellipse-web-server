const mongoose = require('mongoose');
const { bool } = require('sharp');


const reports = mongoose.Schema({
    event_id: {
        type: String,
        default: null
    },
    user_id: {
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
    time: {
        type: Date,
        default: Date.now
    }
});


const Report = mongoose.model('Report', reports);

module.exports = Report;