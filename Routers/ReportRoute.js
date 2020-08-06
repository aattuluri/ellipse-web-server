const express = require('express');
var Mongoose = require('mongoose');
const auth = require('../Middleware/Auth');
const router = express.Router();
const Events = require('../Models/Events');
const Report = require('../Models/Reports');



//register the event

router.post('/api/event/report', auth, async (req, res) => {
    try {
        const user = req.user;
        const { event_id,title,description } = req.body;
        console.log(event_id);
        // const eventId = req.query.id;
        // console.log(data);
        // console.log(eventId);
        // console.log(user._id);
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



//get all registered events for a user
// router.get('/api/user/registeredEvents', auth, (req, res) => {
//     try {
//         const user = req.user;
//         Registration.find({ user_id: req.query.id }).then((result) => {
//             res.status(200).json(result);
//         })
//     }
//     catch (error) {
//         res.status(400).json({ 'error': error })
//     }

// })



// get all registration for the event with event id
// router.get('/api/event/registeredEvents', auth, (req, res) => {
//     try {
//         const user = req.user;
//         console.log(req.query.id);
//         Registration.find({ event_id: req.query.id }).then((result) => {
//             res.status(200).json(result);
//         })
//     }
//     catch (error) {
//         res.status(400).json({ 'error': error })
//     }

// })



module.exports = router