const express = require('express');
var Mongoose = require('mongoose');
const auth = require('../Middleware/Auth');
const router = express.Router();
const Events = require('../Models/Events');
// const Registrations = require('../Models/Registrations');
const Registration = require('../Models/Registrations');




router.post('/api/event/register', auth, async (req, res) => {
    try {
        const user = req.user;
        const { data } = req.body;
        const eventId = req.query.id;
        console.log(data);
        console.log(eventId);
        console.log(user._id);
        const registration = new Registration({
            user_id: user._id,
            event_id: eventId,
            data: data
        })
        await registration.save((err) => {
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

router.get('/api/event/registeredEvents', auth, (req, res) => {
    try {
        const user = req.user;
        console.log("skmc")
        console.log(req.query.id);
        // userid = "5f19663a44165e1d501bf9c9"
        Registration.find({ event_id: req.query.id }).then((result) => {
            // console.log(result);
            res.status(200).json(result);
        })
    }
    catch (error) {
        res.status(400).json({ 'error': error })
    }

})



module.exports = router