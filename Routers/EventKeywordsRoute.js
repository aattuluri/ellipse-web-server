const express = require('express');
var Mongoose = require('mongoose');
const auth = require('../Middleware/Auth');
const Events = require('../Models/Events');
const EventKeywords = require('../Models/EventKeywords');
const router = express.Router();



//route for getting all keywords
router.get('/api/event/get_event_keywords',auth, async (req, res) => {
    try {
        EventKeywords.find().then(eventKeywords=>{
            res.status(200).json(eventKeywords)
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
});

//route for getting onlu event types in event keywords
router.get('/api/event/get_event_types',auth, async (req, res) => {
    try {
        EventKeywords.find({type:"EventTypes"}).then(eventKeywords=>{
            res.status(200).json(eventKeywords)
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
});


module.exports = router