//schema for Reports

const mongoose = require('mongoose');


const teams = mongoose.Schema({
    event_id: {
        type: String,
        default: null
    },
    user_id: {
        type: String,
        default: null
    },
    team_name: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    members : {
        type: Array,
        default: []
    },
    received_requests: {
        type: Array,
        default: []
    },
    sent_requests: {
        type: Array,
        default: []
    },
    submissions: {
        type: Array,
    },
    time: {
        type: Date,
        default: Date.now
    },
    share_link: {
        type: String,
    }
});


const Team = mongoose.model('Team', teams);

module.exports = Team;