let mongoose = require('mongoose')

let eventShema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    start_time: {
        type: Date,
        required: true,
    },
    finish_time: {
        type: Date,
        required: true,
    },
    eventType: {
        type: String,
        required: true
    },
    eventMode: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
    },
    poster: {
        type: String,
        // required: true,
    },
    feesType:{
        type: String,
    },
    fees: {
        type: Number,
        // required: true,
    },
    registrationEndTime: {
        type: Date,
        required: true
    },
    regLink: {
        type: String
    },
    organizer: {
        type: String,
    },
    about: {
        type: String,
        required: true
    },
    requirements: {
        type: Array,
    },
    addressType: {
        type: String,
    },
    college: {
        type: String,
    }

});


let Events = module.exports = mongoose.model('Events', eventShema);

module.exports.get = function(callback, limit) {
    Events.find(callback).limit(limit);
}