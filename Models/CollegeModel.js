//schema for colleges

let mongoose = require('mongoose')

let collegeShema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
    },
    city: {
        type: String
    },
    state: {
        type: String,
    },
    pin_code: {
        type: String,
    },
    address: {
        type: String,
    },
    college_type: {
        type: String,
    }
});


let Colleges = module.exports = mongoose.model('Colleges', collegeShema);

module.exports.get = function(callback, limit) {
    Colleges.find(callback).limit(limit);
}