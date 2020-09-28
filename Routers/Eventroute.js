const express = require('express');
var Mongoose = require('mongoose');
const { json } = require('body-parser');
const md5 = require('md5');
const sgMail = require('@sendgrid/mail');
// const pdf = require('html-pdf');
// const cron = require('node-cron');


const auth = require('../Middleware/Auth');
const Events = require('../Models/Events');
const Files = require('../Models/Files');
const Registration = require('../Models/Registrations');
const Colleges = require('../Models/CollegeModel');
const Announcement = require('../Models/Announcements');
// const Notifications = require('../Models/Notifications');


const router = express.Router();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//Adding the announcement
router.post('/api/event/add_announcement', auth, async (req, res) => {
    try {
        // const event_id = req.query.id;
        const announcement = new Announcement();
        announcement.event_id = req.body.event_id;
        announcement.title = req.body.title;
        announcement.description = req.body.description
        announcement.visible_all = req.body.visible_all
        await announcement.save((err) => {
            if (err) {
                res.status(400).json({
                    status: 'error',
                    code: 500,
                    message: err
                })
            }
            res.status(200).json({
                status: 'success',
                code: 200,
                message: 'Added successfully',

            })

        })
    } catch (error) {
        res.status(400).json({
            status: 'error',
            code: 500,
            message: error.message
        })
    }
})

//Retrieving announcements for a event with event id
router.get('/api/event/get_announcements', auth, (req, res) => {
    try {

        Announcement.find({ event_id: req.query.id }).then((result) => {
            res.status(200).json(result);
        })
    }
    catch (error) {
        res.status(400).json({ 'error': error })
    }

})


//sending group mails bu entering the title,content of mail and array of email
router.post('/api/event/sendemail', auth, async (req, res) => {
    try {
        const emails = req.body.emails;
        const title = req.body.title;
        const content = req.body.content;
        emails.forEach(async e => {
            const msg = {
                to: e,
                from: 'support@ellipseapp.com', // Use the email address or domain you verified above
                subject: 'Information',
                text: 'http://staging.ellipseapp.com/home',
                html: `<h1>${title}</h1><h2>${content}</h2>`,
            };
            await sgMail.send(msg);
            res.status(200).json({ message: "success" });
        })
    }
    catch (error) {
        res.status(400).json({ error: error });
    }

})


//route for posting the event with the details provided and model is in Events.js
router.post('/api/events', auth, async (req, res) => {
    try {
        const event = new Events(req.body);
        event.status="pending"
        const college = await Colleges.findOne({ _id: req.body.college_id });
        event.college_name = college.name;
        const user = req.user;
        await event.save(function (err) {
            if (err) {
                res.status(400).json({
                    status: 'error',
                    code: 500,
                    message: err
                })
            }
            res.status(200).json({
                status: 'success',
                code: 200,
                message: 'Event added successfully',
                eventId: event._id
            })

        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

});

//route for posting the event and it is used for flutter app and will be removed soon
router.post('/api/post_event', auth, async (req, res) => {
    let event = new Events()
    const college = await Colleges.findOne({ name: req.body.college });
    event.poster_url = req.body.posterUrl
    event.user_id = req.body.user_id
    event.college = req.body.college
    event.name = req.body.name
    event.description = req.body.description
    event.about = req.body.description
    event.event_type = req.body.eventType
    event.event_mode = req.body.eventMode
    event.fee_type = req.body.feesType
    event.venue_type = req.body.addressType
    event.fee = req.body.fees
    event.o_allowed = req.body.o_allowed
    event.start_time = req.body.start_time
    event.finish_time = req.body.finish_time
    event.registration_end_time = req.body.registrationEndTime
    event.reg_link = req.body.regLink
    event.college_id = college._id
    event.venue = req.body.venue
    event.platform_details = req.body.platform_details
    event.save(function (err) {
        if (err) {
            res.json({
                status: 'error',
                code: 500,
                message: err
            })
        }
        res.json({
            status: 'success',
            code: 200,
            message: 'added event successfully',
            eventId: event._id
        })
    })
});



//route to add or update the event poster in mongodb gridfs
router.post('/api/event/uploadimage', auth, async (req, res) => {
    const user = req.user;
    const eventId = req.query.id;
    const fileName = eventId + md5(Date.now())
    const event = await Events.findOne({ _id: eventId })
    if (event.poster_url != null) {
         Files.deleteFile(event.poster_url, (result) => {
            Files.saveFile(req.files.image, fileName, user._id, "eventposter", function (err, result) {
                if (!err) {
                    Events.updateOne({ _id: eventId }, { $set: { 'poster_url': fileName } }).then((value) => {
                        res.status(200).json({
                            status: 'success',
                            code: 200,
                            message: 'image added successfully',
                        })
                    })
                }
                else {
                    res.status(400).json({
                        status: 'error',
                        code: 500,
                        message: err
                    })
                }
            });
        })
       

    }
    else {
        const fileName = eventId + md5(Date.now())
        Files.saveFile(req.files.image, fileName, user._id, "eventposter", function (err, result) {
            if (!err) {
                // console.log("aaxd")
                Events.updateOne({ _id: eventId }, { $set: { 'poster_url': fileName } }).then((value) => {
                    res.status(200).json({
                        status: 'success',
                        code: 200,
                        message: 'image added successfully',
                    })
                })
            }
            else {
                res.status(400).json({
                    status: 'error',
                    code: 500,
                    message: err
                })
            }
        });
    }

})


//route to retrive the poster from db with file name
router.get('/api/image', (req, res) => {
    try {
        Files.getFile(req.query.id, res, function (err, result) {
            if (!err) {
                //Do Nothing
            }
            console.log(err);
            res.send(new Error("Failed to find a file."));
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
});

//route to get all the events 
router.get('/api/events', auth, async (req, res) => {
    const user = req.user;
    const finalEvents = [];
    try {
        Events.get((err, events) => {
            if (err) {
                res.json({
                    status: 'error',
                    code: 500,
                    message: err
                });
            }
            var count = 0;
            var len = events.length;
            events.forEach(async (e, index, array) => {
                const registeredEvent = await Registration.find({ user_id: user._id, event_id: e._id })
                // console.log(registeredEvent);
                if (registeredEvent.length === 0) {
                    e.registered = false;
                    finalEvents.push(e);
                    count = count + 1;
                }
                else {
                    e.registered = true;
                    finalEvents.push(e);
                    count = count + 1;
                }
                if (count === len) {
                    res.status(200).json(finalEvents)
                }
            })
        })
    }
    catch (error) {
        res.status(400).json({ 'error': error });
    }

});


//route to get the particular event with event id
router.get('/api/event', async (req, res) => {
    try {
        const event = await Events.findOne({ _id: req.query.id });
        res.status(200).json({ event });
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

})


//route for updating the event details but not event poster
router.post('/api/updateevent', auth, async (req, res) => {
    try {
        const user = req.user;
        const eId = req.body.eventId;
        Events.updateOne({ _id: eId }, {
            $set: {
                'name': req.body.name,
                'description': req.body.description,
                'start_time': req.body.start_time,
                'finish_time': req.body.finish_time,
                'registration_end_time': req.body.registration_end_time,
                'event_mode': req.body.event_mode,
                'event_type': req.body.event_type,
                'reg_link': req.body.reg_link,
                'fee': req.body.fee,
                'about': req.body.about,
                'fee_type': req.body.fee_type,
                // 'college': req.body.college,
                'o_allowed': req.body.o_allowed,
                'requirements': req.body.requirements,
                'tags': req.body.tags,
                'venue_type': req.body.venue_type,
                'venue': req.body.venue,
                'venue_college': req.body.venue_college
            }
        }).then(value => {
                res.status(200).json({ event });
        })
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message })
    }
})



//route for generating the pdf
// router.get('/api/generatepdf', async (req, res) => {
//     pdf.create('<!doctype html><html><head></head><body><h1>Lalith Reddy</h1></body></html>', {}).toFile('me.pdf', (err, result) => {
//         if (err) {
//             console.log(err);
//         }
//         res.send(result);
//     })
// })


module.exports = router






