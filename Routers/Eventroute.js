const express = require('express');
var Mongoose = require('mongoose');
const { json } = require('body-parser');
const md5 = require('md5');
const sgMail = require('@sendgrid/mail');
const pdf = require('html-pdf');
const https = require('https');


const auth = require('../Middleware/Auth');
const Events = require('../Models/Events');
const Files = require('../Models/Files');
const Registration = require('../Models/Registrations');
const Colleges = require('../Models/CollegeModel');
const Announcement = require('../Models/Announcements');
const template = require('../certificatetemplate');
const UserDetails = require('../Models/UserDetails');

const admin = require('../Utilities/firebase_config');

// const firebase_url = "https://us-central1-ellipse-e2428.cloudfunctions.net/sendNotification";

const router = express.Router();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// router.post('/api/generate_certificate', async (req, res) => {
//     pdf.create(template("Title","Organizer_name","Participant _name","12/20/2020","Event name","scfjdsvn","host_college"), { width: "2000px", height: "1200px" }).toFile('rezultati.pdf', (err) => {
//         if (err) {
//             return console.log('error');
//         }
//         res.send(Promise.resolve())
//     });
// })


//Adding the announcement
router.post('/api/event/add_announcement', auth, async (req, res) => {
    try {
        // const event_id = req.query.id;
        const event = await Events.findOne({_id: req.body.event_id})
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
        const regs = await Registration.find({ event_id: req.body.event_id });
        regs.forEach(r => {
            UserDetails.findOne({ user_id: r.user_id }).then((v) => {
                const tokens = v.notification_tokens;
                tokens.forEach((t) => {
                    const notification_options = {
                        priority: "high",
                        timeToLive: 60 * 60 * 24
                    };
                    const notification_message = {
                        notification: {
                            title: event.name + " Announcement",
                            body: req.body.title + " - " +req.body.description,
                        }
                    }
                    admin.messaging().sendToDevice(t.token,notification_message,notification_options).then(reponse=>{
                        //do nothing
                    })
                    .catch(error => {
                        console.log(error);
                    });
                    // console.log(t.token);
                    // https.get(`${process.env.FIREBASE_NOTIFICATIONS_URL}?token=${t.token}&imageUrl=https://ellipseapp.com/api/image?id=${req.body.title}&title=${event.name + " Announcement"}&message=${req.body.title + " - " +req.body.description}`, (resp) => {
                    // }).on("error", (err) => {
                    //     console.log("Error: " + err.message);
                    // });
                })
            })
        })
        // tok = "eoIghG_qQiKoIXjc6qE23-:APA91bElnC-I3rwFOeF0LKViBoW57nfhdDz-uUn9-i8f6Y4swJLDBd0k8jXO2kB-vOx9pRQdOkB7fS2880OwWxZBZJS9RXw7vHehbpLkTYmsavrS20fggHjpkZDTclsMp_ftviiv2jwU"
        // https.get(`${firebase_url}?token=${tok}&imageUrl=https://ellipseapp.com/api/image?id=${req.body.title}&title=${event.name + " Announcement"}&message=${req.body.title + " - " +req.body.description}`, (resp) => {
        // }).on("error", (err) => {
        //     console.log("Error: " + err.message);
        // });
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
            res.status(200).json(result.reverse());
        })
    }
    catch (error) {
        res.status(400).json({ 'error': error })
    }

})

//deleting announcement
router.post('/api/event/delete_announcement', auth, (req, res) => {
    try {
        Announcement.deleteOne({ _id: req.query.id }).then((result) => {
            Announcement.find({ event_id: req.query.event_id }).then((response) => {
                res.status(200).json(response);
            })
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
        event.status = "pending"
        const college = await Colleges.findOne({ _id: req.body.college_id });
        event.college_name = college.name;
        const user = req.user;
        event.certificate = { "title": req.body.name }
        await event.save(function (err) {
            if (err) {
                res.status(400).json({
                    status: 'error',
                    code: 500,
                    message: err
                })
            }
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
            const data = JSON.stringify({
                "dynamicLinkInfo": {
                    "domainUriPrefix": "https://ellipseapp.page.link",
                    "link": `https://ellipseapp.com/un/event/${event._id}`,
                    "androidInfo": {
                        "androidPackageName": "com.ellipse.ellipseapp"
                    },
                }
            });
            const r = https.request(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.FIREBASE_DLINKS_API_KEY}`, options, (result) => {
                result.setEncoding('utf8');
                result.on('data', (d) => {
                    const parsedData = JSON.parse(d);
                    event.share_link = parsedData.shortLink;
                    event.save();
                })
            })
            r.on('error', (error) => {
                console.error(error)
            })
            r.write(data)
            r.end()
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
    event.themes = req.body.themes
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
        if (event.user_id == user._id) {
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
        if (req.query.id == 'undefined') {
            res.send(new Error("Failed to find a file."));
        }
        else {
            Files.getFile(req.query.id, res, function (err, result) {
                if (!err) {
                    //Do Nothing
                }
                console.log(err);
                res.send(new Error("Failed to find a file."));
            });
        }

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
            if (events.length === 0) {
                // console.log(events)
                res.status(200).json(events)
            } else {
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
                        // console.log(finalEvents)
                        res.status(200).json(finalEvents)
                    }
                })
            }

        })
    }
    catch (error) {
        res.status(400).json({ 'error': error });
    }

});


//route to get all the events for website home page without login
router.get('/api/get_events', async (req, res) => {
    // const user = req.user;
    console.log("dshvc")
    // const finalEvents = [];
    try {
        Events.get((err, events) => {
            // console.log(events)
            if (err) {
                res.json({
                    status: 'error',
                    code: 500,
                    message: err
                });
            }
            res.status(200).json(events);
        })
    }
    catch (error) {
        res.status(400).json({ 'error': error });
    }

});



//route to get the particular event with event id for unregisterd users
router.get('/api/unregistered/event', async (req, res) => {
    try {
        const event = await Events.findOne({ _id: req.query.id });
        res.status(200).json({ event });
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

})

//route to get the particular event with event id
router.get('/api/event', auth, async (req, res) => {
    try {
        const user = req.user;
        const event = await Events.findOne({ _id: req.query.id });
        const registeredEvent = await Registration.find({ user_id: user._id, event_id: event._id });
        if (registeredEvent.length === 0) {
            event.registered = false;
        }
        else {
            event.registered = true;
        }
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
        const event = await Events.findOne({ _id: eId });

        if (event.user_id == user._id) {
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
                    'venue_college': req.body.venue_college,
                    'platform_details': req.body.platform_details,
                    'rounds': req.body.rounds,
                    'rules': req.body.rules,
                    'prizes': req.body.prizes,
                    'themes': req.body.themes
                }
            }).then(value => {
                Events.findOne({ _id: eId }).then((event) => {
                    res.status(200).json({ event });
                })

            })
        }
        else {
            res.status(401).json({ error: "not authorized" })
        }

    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message })
    }
})

//route for getting organizer details with event id
router.get('/api/event/get_organizer_details', auth, async (req, res) => {
    try {
        const user = req.user;
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
        // console.log(error);
        res.status(400).json({ error: error.message })
    }
})

router.post('/api/event/add_moderator', auth, async (req, res) => {
    try {
        const user = req.user;
        const eId = req.body.event_id;
        const event = await Events.findOne({ _id: eId })
        if (event.user_id == user._id) {
            Events.updateOne({ _id: eId }, {
                $push: {
                    "moderators": req.body.moderator_id
                }
            }).then(value => {
                Events.findOne({ _id: eId }).then((event) => {
                    res.status(200).json({ event });
                })

            })
        }
        else {
            res.status(401).json({ error: "not authorized" })
        }

    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message })
    }
})

router.get('/api/event/get_all_users', auth, async (req, res) => {
    try {
        const user = req.user;
        const userDetails = await UserDetails.find({ user_id: { $ne: user._id } }, { name: 1, username: 1, email: 1, user_id: 1 });
        // console.log(userDetails);
        res.status(200).json(userDetails);
    }
    catch (error) {
        // console.log(error);
        res.status(400).json({ error: error.message })
    }
})

router.post('/api/event/remove_moderator', auth, async (req, res) => {
    try {
        const user = req.user;
        const eId = req.body.event_id;
        const event = await Events.findOne({ _id: eId })
        if (event.user_id == user._id) {
            Events.updateOne({ _id: eId }, {
                $pull: {
                    "moderators": req.body.moderator_id
                }
            }).then(value => {
                Events.findOne({ _id: eId }).then((event) => {
                    res.status(200).json({ event });
                })

            })
        }
        else {
            res.status(401).json({ error: "not authorized" })
        }

    }
    catch (error) {
        console.log(error);
    }
})

router.post('/api/event/block_chat_for_user', auth, async (req, res) => {
    try {
        const user = req.user;
        const eId = req.body.event_id;
        const event = await Events.findOne({ _id: eId })
        if (event.user_id == user._id) {
            Events.updateOne({ _id: eId }, {
                $push: {
                    "chat_blocked_users": req.body.blocked_user_id
                }
            }).then(value => {
                Events.findOne({ _id: eId }).then((event) => {
                    res.status(200).json({ event });
                })

            })
        }
        else {
            res.status(401).json({ error: "not authorized" })
        }

    }
    catch (error) {
        console.log(error);
    }
})

router.post('/api/event/unblock_chat_for_user', auth, async (req, res) => {
    try {
        const user = req.user;
        const eId = req.body.event_id;
        const event = await Events.findOne({ _id: eId })
        if (event.user_id == user._id) {
            Events.updateOne({ _id: eId }, {
                $pull: {
                    "chat_blocked_users": req.body.blocked_user_id
                }
            }).then(value => {
                Events.findOne({ _id: eId }).then((event) => {
                    res.status(200).json({ event });
                })

            })
        }
        else {
            res.status(401).json({ error: "not authorized" })
        }

    }
    catch (error) {
        console.log(error);
    }
})

router.get('/api/event/get_reg_users_for_blocking', auth, async (req, res) => {
    try {
        const user = req.user;
        const regUsers = await Registration.find({ event_id: req.query.id }, { user_id: 1 });
        const resUserIds = regUsers.map((u) => { return u.user_id });
        const userDetails = await UserDetails.find({ user_id: { $in: resUserIds } }, { name: 1, username: 1, email: 1, user_id: 1 });
        res.status(200).json(userDetails);
    }
    catch (error) {
        // console.log(error);
        res.status(400).json({ error: error.message })
    }
})


module.exports = router






