//schema for Reports

const mongoose = require('mongoose');


const submissions = mongoose.Schema({
    event_id: {
        type: String,
        default: null
    },
    user_id: {
        type: String,
        default: null
    },
    team_id: {
        type: String,
        default: null
    },
    // team_members : {
    //     type: Array,
    //     default: []
    // },
    submission_type: {
        type: String,
        default: 'general_event'
    },
    submission: {
        type: Object,
    },
    time: {
        type: Date,
        default: Date.now
    }
});


const Submission = mongoose.model('Submission', submissions);

module.exports = Submission;