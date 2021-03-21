let mongoose = require('mongoose');


//mongoose schema for event

let eventShema = mongoose.Schema({
    user_id: {
        type: String,
        default: null
        // required: true,
    },
    name: {
        type: String,
        default: null,
        // required: true,
    },
    description: {
        type: String,
        default: null
        // required: true,
    },
    start_time: {
        type: Date,
        default: null
        // required: true,
    },
    finish_time: {
        type: Date,
        default: null
        // required: true,
    },
    event_type: {
        type: String,
        default: null
        // required: true
    },
    //Online,Offline
    event_mode: {
        type: String,
        default: null
        // required: true
    },
    tags: {
        type: Array,
        default: null
    },
    o_allowed: {
        type: Boolean,
        default: null
    },
    poster_url: {
        type: String,
        default: null
    },
    fee_type:{
        type: String,
        default: null
        // required: true
    },
    fee: {
        type: String,
        default: null
        // required: true,
    },
    registration_end_time: {
        type: Date,
        default: null
        // required: true
    },
    reg_link: {
        type: String,
        default: null
    },
    moderators: {
        type: Array,
        default: []
    },
    about: {
        type: String,
        // required: true,
        default: null
    },
    requirements: {
        type: Array,
        default: null
    },
    // college,other
    venue_type: {
        type: String,
        default: null
    },
    venue: {
        type: String,
        default: null
    },
    venue_college: {
        type: String,
        default: null
    },
    college_id: {
        type: String,
        default: null
    },
    college_name: {
        type: String,
        default: null
    },
    //title,field,options  
    //short_text,long_desc,dropdown,date,checkbox,radiobutton,date,link
    reg_fields: {
        type: Array,
        default: null
    },
    //link,form
    reg_mode: {
        type: String,
        default: null
    },
    platform_details: {
        type: String,
        default: null
    },
    registered: {
        type: Boolean,
    },
    status: {
        type: String,
        default: "pending"
    },
    share_link: {
        type: String,
    },
    posted_on: {
        type: Date,
        default: Date.now()
    },
    certificate:{
        type: Object,
    },
    isTeamed: {
        type: Boolean,
        default: false
    },
    team_size: {
        type: Object
    },
    rounds: {
        type: Array,
        default: [],
    },
    chat_blocked_users: {
        type: Array,
        default: [],
    },
    attachments: {
        type: Array,
        default: []
    },
    rules: {
        type: String,
        default: null
    },
    prizes: {
        type: Array,
        default: []
    },
    socialMediaLinks: {
        type: Array,
        default: []
    },
    themes: {
        type: String
    },
    socialMediaLinks: {
        type: Array,
        default: []
    },
});


let Events = module.exports = mongoose.model('Events', eventShema);

module.exports.get = function(callback, limit) {
    Events.find(callback).limit(limit);
}
