const express = require('express');
var Mongoose = require('mongoose');
const auth = require('../Middleware/Auth');
// const Events = require('../Models/Events');
// const Report = require('../Models/Reports');
const FeedBack = require('../Models/FeedBack');
const router = express.Router();


//post the feedback for the application

router.post('/api/event/send_feedback', auth, async (req, res) => {
    try {
        const user = req.user;
        const { description } = req.body;
        const feedback = new FeedBack({
            user_id: user._id,
            description: description,
        })
        await feedback.save((err) => {
            if (err) {
                res.status(400).json({ error: err.message })
            }
            res.status(200).json({ message: "success" })
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

});

module.exports = router