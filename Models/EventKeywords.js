//schema for event post keywords like event types,event tags and requirements

const mongoose = require('mongoose');


const eventKeywords = mongoose.Schema({
    title: {
        type: String,
        default: null
    },
    type: {
        type: String,
        required: true
    },
});


const EventKeywords = mongoose.model('EventKeywords', eventKeywords);
module.exports = EventKeywords;