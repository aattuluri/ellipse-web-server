let mongoose = require('mongoose')

let collegeShema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
});


let Colleges = module.exports = mongoose.model('Colleges', collegeShema);

module.exports.get = function(callback, limit) {
    Colleges.find(callback).limit(limit);
}