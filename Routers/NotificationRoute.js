const express = require('express');
var Mongoose = require('mongoose');
const auth = require('../Middleware/Auth');
const router = express.Router();
// const Events = require('../Models/Events');
const Notification = require('../Models/Notifications');



//register the event

router.get('/api/get_notifications', auth, async (req, res) => {
    try {
        const user = req.user;
        Notification.find({user_id: user._id}).then((result)=>{
            res.status(200).json(result);
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

});

module.exports = router