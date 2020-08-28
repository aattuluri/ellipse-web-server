const express = require('express');
var Mongoose = require('mongoose');
const auth = require('../Middleware/Auth');
const router = express.Router();
const Events = require('../Models/Events');
const { json } = require('body-parser');
// const chatService = require('../Chat/ChatService');
const Files = require('../Models/Files');
const md5 = require('md5');
const Registration = require('../Models/Registrations');
const e = require('express');
const Colleges = require('../Models/CollegeModel');
const Announcement = require('../Models/Announcements');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const pdf = require('html-pdf');
const cron = require('node-cron');
const Notifications = require('../Models/Notifications');


router.get('/api/generatepdf', async (req, res) => {
    pdf.create('<!doctype html><html><head></head><body><h1>Lalith Reddy</h1></body></html>', {}).toFile('me.pdf', (err, result) => {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
})


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

//Retrieving announcements for a event
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

router.post('/api/events', auth, async (req, res) => {
    try {
        const event = new Events(req.body);
        // const college = await Colleges.findOne({ name: req.body.college_name });
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
            // const event = await Events.findOne({_id: eventId})
           

            res.status(200).json({
                status: 'success',
                code: 200,
                message: 'Event added successfully',
                eventId: event._id
            })

        })
        // const eventId = event._id;
        // const eventStartDate = new Date(event.start_time);
        // const day = eventStartDate.getDay();
        // const mon = eventStartDate.getMonth();
        // const date = eventStartDate.getDate();
        // const hour = eventStartDate.getHours();
        // const min = eventStartDate.getMinutes();
        // cron.schedule(`${min} ${hour} ${date - 1} ${mon + 1} ${day - 1}`, () => {
        //     console.log("hi there")
        //     Registration.find({ event_id: event._id }).then((result) => {
        //         result.forEach(value =>{
        //             const notification = new Notifications({
        //                 user_id: value.user_id,
        //                 event_id: event._id,
        //                 title: `${event.name}`+" Event Reminder",
        //                 description: "Events starts at " + eventStartDate.toDateString()+" " + eventStartDate.toLocaleTimeString(),
        //             })
        //             notification.save()
        //         })
        //     })
        // })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

});

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


router.get('/api/events', auth, async (req, res) => {
    const user = req.user;
    const finalEvents = [];
    // const registeredEvents = await Registration.find({user_id: user._id})
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
                console.log(registeredEvent);
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

router.get('/api/event', async (req, res) => {
    try {
        const event = await Events.findOne({ _id: req.query.id });
        res.status(200).json({ event });
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

})



router.post('/api/updateevent', auth, async (req, res) => {
    try {
        const user = req.user;
        const eId = req.body.eventId;
        console.log(eId);
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
            // eId.destroy();
            console.log(value)
            Events.findOne({ _id: eId }).then(event => {
                const eventStartDate = event.start_time;
                const day = eventStartDate.getDay();
                const mon = eventStartDate.getMonth();
                const date = eventStartDate.getDate();
                const hour = eventStartDate.getHours();
                const min = eventStartDate.getMinutes();
                // cron.schedule(`${min} ${hour} ${date - 1} ${mon + 1} ${day - 1}`, () => {
                //     console.log("hi there")
                //     Registration.find({ event_id: event._id }).then((result) => {
                //         result.forEach(value =>{
                //             const notification = new Notifications({
                //                 user_id: value.user_id,
                //                 event_id: event._id,
                //                 title: `${event.name}`+" Event Reminder",
                //                 description: "Events starts at " + eventStartDate.toDateString()+" " + eventStartDate.toLocaleTimeString(),
                //             })
                //             notification.save()
                //         })
                //     })
                   
                // })
                res.status(200).json({ event });

            })
        })
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message })
    }
})


module.exports = router


// const chatMessage = JSON.stringify({
        //     uid:event.user_id,
        //     message: "welcome",
        //     sent_time: Date.now(),
        // })
        // chatService.addChatMessage(event._id,"lalith",(err,value)=>{
        //     console.log(value);
        // });
        // eventsMedia.save((err)=>{
        //     event.updateOne({})
        // })







// router.route('/events')
//     .get(eventController.index)
//     .post(eventController.new)

// router.route('/event/:id')
//     .get(eventController.view)
//     .put(eventController.update)
//     .delete(eventController.delete)


//fucntion view events
// exports.view = function(req, res) {
//     Events.findById(req.params.id, function(err, event) {
//         if (err) {
//             res.json({
//                 status: 'error',
//                 code: 500,
//                 message: err
//             })
//         }
//         res.json({
//             status: 'success',
//             code: 200,
//             message: '__',
//             data: event
//         })
//     })
// }

// exports.update = function(req, res) {
//     Events.findById(req.params.id, function(err, event) {
//         if (err)
//             res.json({
//                 status: 'err',
//                 code: 500,
//                 message: err
//             })
//         event.name = req.body.name
//         event.description = req.body.description
//         event.start_time = req.body.start_time
//         event.finish_time = req.body.finish_time
//         event.save(function(err) {
//             if (err)
//                 res.json({
//                     status: 'err',
//                     code: 500,
//                     message: err
//                 })
//             res.json({
//                 status: 'success',
//                 code: 200,
//                 message: '__',
//                 data: event
//             })
//         })
//     })
// }


// exports.delete = function(req, res) {
//     Events.remove({
//         _id: req.params.id
//     }, function(err) {
//         if (err)
//             res.json({
//                 status: 'err',
//                 code: 500,
//                 message: err
//             })
//         res.json({
//             status: 'success',
//             code: 200,
//             message: '__'
//         })
//     })
// }
