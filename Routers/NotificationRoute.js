const express = require('express');
var Mongoose = require('mongoose');
const auth = require('../Middleware/Auth');
const Notification = require('../Models/Notifications');
const NotificationToken = require('../Models/NotificationToken');
const UserDetails = require('../Models/UserDetails');

const router = express.Router();

//route to get all the notifications for a user with user id

router.get('/api/get_notifications', auth, async (req, res) => {
    try {
        const user = req.user;
        Notification.find({ user_id: user._id }).then((result) => {
            res.status(200).json(result.reverse());
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

});

//route to make the notifications seen

router.get('/api/update_notification_status', auth, async (req, res) => {
    try {
        const user = req.user;
        Notification.updateMany({ user_id: user._id }, { $set: { 'status': 'seen' } }).then((result) => {
            res.status(200).json({ "message": "success" });
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route to get the unseen notifications count

router.get('/api/get_unseen_notifications_count', auth, async (req, res) => {
    try {
        const user = req.user;
        Notification.find({ user_id: user._id, status: 'sent' }).then((result) => {
            res.status(200).json(result.length);
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


//route to add firebase messaging token without login/signup
router.post('/api/add_firebase_notification_token', async (req, res) => {
    try {
        const not = await NotificationToken.findOne({token: req.body.token});
        if(!not){
            const notificationToken = new NotificationToken(req.body);
            await notificationToken.save();
        }
        res.status(200).json({ "message": "success" });
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


//route to add firebase messaging to a user
router.post('/api/add_firebase_notification_token_to_user',auth, async (req, res) => {
    try {
        const user = req.user;
        const token = req.body.token;
        const userDetails = await UserDetails.findOne({ user_id: user._id });
        const previousNotifications = userDetails.notification_tokens;
        var count = 0;
        previousNotifications.forEach(n => {
            if (n.token == token) {
                count++;
            }
        });
        if (count == 0) {
            userDetails.notification_tokens = userDetails.notification_tokens.concat({ token });
            await userDetails.save();
            const notificationToken = await NotificationToken.findOne({ token: req.body.token });
            if (notificationToken) {
                await NotificationToken.updateOne({ token: req.body.token }, { $set: { status: "signedin", user_id: user._id } });
            }
        }
        res.status(200).json({ "message": "success" });
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = router

// ey3-2f80SgOmcrAs_qQk2l:APA91bFt3IpBa6l4B1FjkwZ_OsGELs8k-wryAksPxQ4pW6a21ey76VCBuCZHd6d1zSjNU42nOavjwxv8j71PrOb-7-BLeiN4RAlVxmTAz6OKNz3QcmsEySHbYnD5aHi3owrg7TCHhpro