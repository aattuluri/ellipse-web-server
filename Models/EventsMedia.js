const mongoose = require('mongoose');


const imagesSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    image_data: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        default: Date.now
    }
});


const EventsMedia = mongoose.model('EventsMedia', imagesSchema);

module.exports = EventsMedia;