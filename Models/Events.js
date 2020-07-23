let mongoose = require('mongoose');

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
    o_allowed: {
        type: String,
    },
    posterUrl: {
        type: String,
    },
    feesType:{
        type: String,
        required: true
    },
    fees: {
        type: String,
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
    },
    regFields: {
        type: Array
    },
    regMode: {
        type: String
    },
    participantsType:{
        type: String
    }

});


let Events = module.exports = mongoose.model('Events', eventShema);

module.exports.get = function(callback, limit) {
    Events.find(callback).limit(limit);
}