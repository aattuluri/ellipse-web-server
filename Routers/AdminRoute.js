const express = require('express');
// const md5 = require('md5');
// var otpGenerator = require("otp-generator");
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

const AdminLogin = require('../Models/AdminLogin');
const Events = require('../Models/Events');
const adminAuth = require('../Middleware/AdminAuth');
const UserDetails = require('../Models/UserDetails');
const Reports = require('../Models/Reports');
const FeedBack = require('../Models/FeedBack');
const EventKeywords = require('../Models/EventKeywords');
const Colleges = require('../Models/CollegeModel');

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
        res.status(200).json({ message: "success" });
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//rroute forr getting all events
router.get('/api/admin/get_all_events', adminAuth, async (req, res) => {
    try {
        Events.get((err, events) => {
            // console.log(events)
            res.status(200).json(events)
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route for updating event status
router.post('/api/admin/update_event_status', adminAuth, async (req, res) => {
    try {
        const eventId = req.body.eventId;
        await Events.updateOne({ _id: eventId }, { $set: { status: req.body.status } })
        res.status(200).json({ "message": "success" });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route fo sending email to admin
router.post('/api/admin/event/sendemail', adminAuth, async (req, res) => {
    try {
        const userId = req.body.userId;
        const userDetails = await UserDetails.findOne({ user_id: userId });
        const email = userDetails.email;
        const title = req.body.title;
        const content = req.body.content;
        const event_name = req.body.event_name;
        const msg = {
            to: email,
            from: { "email": 'support@ellipseapp.com', 'name': "Ellipse Support" }, // Use the email address or domain you verified above
            // subject: 'Information',
            // text: 'https://staging.ellipseapp.com/home',
            // html: `<h1>${title}</h1><h2>${content}</h2>`,
            templateId: 'd-c3456f977aca444cb52e0ad002d737d8',
            dynamic_template_data: {
                subject: event_name,
                pre_header: "Regarding you event",
                title: title,
                content: content,
            },
        };
        await sgMail.send(msg);
        res.status(200).json({ message: "success" });
    }
    catch (error) {
        res.status(400).json({ error: error });
    }

})

//route for all users
router.get('/api/admin/get_all_users', adminAuth, async (req, res) => {
    try {
        UserDetails.find().then(users => {
            res.status(200).json(users)
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route for reports

router.get('/api/admin/reports', adminAuth, async (req, res) => {
    try {
        Reports.find().then(reports => {
            res.status(200).json(reports)
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route for feeedback
router.get('/api/admin/feedback', adminAuth, async (req, res) => {
    try {
        FeedBack.find().then(feedbacks => {
            res.status(200).json(feedbacks)
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route for adding event types and tags

router.post('/api/admin/add_event_tags', adminAuth, async (req, res) => {
    try {
        const eventKeywords = new EventKeywords(req.body);
        await eventKeywords.save()
        EventKeywords.find().then(eventKeywords => {
            res.status(200).json(eventKeywords)
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route for getting all keywords
router.get('/api/admin/event/get_event_keywords', adminAuth, async (req, res) => {
    try {
        EventKeywords.find().then(eventKeywords => {
            res.status(200).json(eventKeywords)
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
});

//route for adding event types and tags

router.post('/api/admin/delete_event_keywords', adminAuth, async (req, res) => {
    try {
        const id = req.body.id;
        EventKeywords.deleteOne({ _id: id }).then(r => {
            EventKeywords.find().then(eventKeywords => {
                res.status(200).json(eventKeywords)
            })
        })

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route to add new college to database
router.post('/api/admin/add_college', adminAuth, async (req, res) => {
    try {
        const college = new Colleges(req.body);
        await college.save();
        Colleges.find().then(value => {
            res.status(200).json(value);
        })


    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route to delete college from data base
router.post('/api/admin/delete_college', adminAuth, async (req, res) => {
    try {
        const id = req.body.id;
        Colleges.deleteOne({ _id: id }).then(r => {
            Colleges.find().then(value => {
                res.status(200).json(value);
            })
        })

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route to get all colleges
router.get('/api/admin/get_all_colleges', adminAuth, async (req, res) => {
    try {
        Colleges.find().then(value => {
            res.status(200).json(value);
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route to get organizer details for event details page
router.get('/api/admin/event/get_organizer_details', adminAuth, async (req, res) => {
    try {
        const event_id = await req.query.eventId;
        const user_id = req.query.userId;
        const event = await Events.findOne({ _id: event_id });
        if (event.user_id === user_id) {
            UserDetails.findOne({ user_id: user_id }).then(value => {
                res.status(200).json({ name: value.name, profile_pic: value.profile_pic, college_name: value.college_name });
            })
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


module.exports = router