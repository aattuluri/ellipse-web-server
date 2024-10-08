const express = require('express');
var Mongoose = require('mongoose');
const md5 = require('md5');

const auth = require('../Middleware/Auth');
const Events = require('../Models/Events');
const Registration = require('../Models/Registrations');
const randomstring = require('randomstring');

const router = express.Router();
const Files = require('../Models/Files');
const https = require('https');

//register the event

router.post('/api/event/register', auth, async (req, res) => {
    try {
        const user = req.user;
        const { data } = req.body;
        const eventId = req.query.id;
        const shareId = randomstring.generate(10);
        const aRegisteration = await Registration.findOne({ event_id: eventId, user_id: user._id });
        if (aRegisteration) {
            res.status(201).json({ message: "already registered" })
        }
        else {
            const registration = new Registration({
                user_id: user._id,
                event_id: eventId,
                data: data,
                share_id: shareId
            })
            const event = await Events.findOne({ _id: eventId });
            if (event.isTeamed) {
                registration.save((err) => {
                    if (err) {
                        res.status(400).json({ error: err.message })
                    }
                    else {
                        res.status(200).json({ message: "success" })
                    }

                })
            }
            else {
                if (event.rounds.length === 0) {
                    registration.save((err) => {
                        if (err) {
                            res.status(400).json({ error: err.message })
                        }
                        else {
                            res.status(200).json({ message: "success" })
                        }

                    })
                }
                else {
                    const options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                    const data = JSON.stringify({
                        "dynamicLinkInfo": {
                            "domainUriPrefix": "https://ellipseapp.page.link",
                            "link": `https://ellipseapp.com/submission/${registration._id}`,
                            "androidInfo": {
                                "androidPackageName": "com.ellipse.ellipseapp"
                            },
                        }
                    });
                    const r = https.request(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.FIREBASE_DLINKS_API_KEY}`, options, (result) => {
                        result.setEncoding('utf8');
                        result.on('data', (d) => {
                            const parsedData = JSON.parse(d);
                            registration.share_link = parsedData.shortLink;
                            registration.save()
                        })
                    })
                    r.on('error', (error) => {
                        console.error(error)
                    })
                    r.write(data)
                    r.end()
                    registration.submissions = [];
                    event.rounds.forEach((round, index) => {
                        if (index === 0) {
                            registration.submissions.push({ 'title': round.title, is_submitted: false, submission_access: true, submission_form: null });
                        }
                        else {
                            registration.submissions.push({ 'title': round.title, is_submitted: false, submission_access: false, submission_form: null });
                        }

                        if (index === event.rounds.length - 1) {
                            registration.save((err) => {
                                if (err) {
                                    res.status(400).json({ error: err.message })
                                }
                                else {
                                    res.status(200).json({ message: "success" })
                                }

                            })
                        }
                    });
                }
            }


        }


    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

});

router.post('/api/event/register/upload_file', auth, async (req, res) => {
    try {
        const user = req.user;
        const eventId = req.query.id;
        const fileName = eventId + md5(Date.now());
        Files.saveFile(req.files.uploaded_file, fileName, user._id, "file", function (err, result) {
            if (!err) {
                // console.log(fileName)
                res.status(200).send({ 'file_name': fileName });
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
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})



//get all registered events for a user
router.get('/api/user/registeredEvents', auth, (req, res) => {
    try {
        const user = req.user;
        Registration.find({ user_id: user._id }).then((result) => {
            res.status(200).json(result);
        })
    }
    catch (error) {
        res.status(400).json({ 'error': error })
    }

})



// get all registration for the event with event id
router.get('/api/event/registeredEvents', auth, (req, res) => {
    try {
        const user = req.user;
        // console.log(req.query.id);
        Registration.find({ event_id: req.query.id }).then((result) => {
            res.status(200).json(result);
        })
    }
    catch (error) {
        res.status(400).json({ 'error': error })
    }

})

//certificate for certificate verification page with share url
router.get('/api/event/registration/get_file', async (req, res) => {
    try {
        const id = req.query.id;
        Files.getFile(id, res, function (err, result) {
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
})



module.exports = router