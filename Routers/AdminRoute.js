const express = require('express');
// const md5 = require('md5');
// var otpGenerator = require("otp-generator");
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

const AdminLogin = require('../Models/AdminLogin');
const Events = require('../Models/Events');
const adminAuth = require('../Middleware/AdminAuth');
const UserDetails = require('../Models/UserDetails');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const router = express.Router();


//user only when user is required to be created 

// router.post('/api/admin/signup', async (req, res) => {
//     try {
//         const adminLogin = new AdminLogin(req.body);
//         await adminLogin.save();
//         res.status(200).json({ "message": "success" })
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// })


//Signing in of the admin

router.post('/api/admin/signin', async (req, res) => {
    try {
        const { username, password } = req.body
        const admin = await AdminLogin.findOne({ username });
        if (!admin) {
            throw new Error('Invalid login credentials')
        }
        const isPasswordMatch = await bcrypt.compare(password, admin.password)

        if (!isPasswordMatch) {
            throw new Error('Invalid login credentials')
        }
        if (!admin) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
        }
        const token = await admin.generateAuthToken();

        res.status(200).json({ username, token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route for logout
router.post('/api/admin/logout', adminAuth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.status(200).json({message: "success"});
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.get('/api/admin/get_all_events',adminAuth, async (req, res) => {
    try {
        Events.get((err, events) => {
            console.log(events)
            res.status(200).json(events)
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/api/admin/update_event_status',adminAuth, async (req, res) => {
    try {
        const eventId = req.body.eventId;
        await Events.updateOne({_id:eventId},{$set:{status:req.body.status}})
        res.status(200).json({"message": "success"});
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/api/admin/event/sendemail', adminAuth, async (req, res) => {
    try {
        const userId = req.body.user_id;
        const userDetails = await UserDetails.findOne({use_id: userId});
        const email = userDetails.email;
        const title = req.body.title;
        const content = req.body.content;
        const msg = {
            to: email,
            from: 'support@ellipseapp.com', // Use the email address or domain you verified above
            subject: 'Information',
            text: 'http://staging.ellipseapp.com/home',
            html: `<h1>${title}</h1><h2>${content}</h2>`,
        };
        await sgMail.send(msg);
        res.status(200).json({ message: "success" });
    }
    catch (error) {
        res.status(400).json({ error: error });
    }

})



module.exports = router