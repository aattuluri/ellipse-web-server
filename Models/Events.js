let mongoose = require('mongoose')

let eventShema = mongoose.Schema({
    user_id: {
        type: String,
    },
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    start_time: {
        type: String,
    },
    finish_time: {
        type: String,
    },
});


let Events = module.exports = mongoose.model('Events', eventShema);

module.exports.get = function(callback, limit) {
    Events.find(callback).limit(limit);
}