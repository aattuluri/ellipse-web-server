//schema for feedback of application

const mongoose = require('mongoose');


const feedback = mongoose.Schema({
    user_id: {
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


const Feedback = mongoose.model('Feedback', feedback);

module.exports = Feedback;