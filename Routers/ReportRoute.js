const express = require('express');
var Mongoose = require('mongoose');
const auth = require('../Middleware/Auth');
const Events = require('../Models/Events');
const Report = require('../Models/Reports');
const router = express.Router();


//post the report for the event

router.post('/api/event/report', auth, async (req, res) => {
    try {
        const user = req.user;
        const { event_id,title,description } = req.body;
        const report = new Report({
            user_id: user._id,
            event_id: event_id,
            title: title,
            description: description,
        })
        await report.save((err) => {
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