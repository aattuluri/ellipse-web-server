const express = require('express');
var Mongoose = require('mongoose');
const auth = require('../Middleware/Auth');
const router = express.Router();
const Events = require('../Models/Events');
const { json } = require('body-parser');
// const EventsMedia = require('../Models/EventsMedia');
const chatService = require('../Chat/ChatService');
const Files = require('../Models/Files');
const md5 = require('md5');
const Registration = require('../Models/Registrations');
const e = require('express');



router.post('/api/events', auth, async (req, res) => {
    const event = new Events(req.body);
    const user = req.user;
    await event.save(function (err) {
        if (err) {
            res.status(400).json({
                status: 'error',
                code: 500,
                message: err
            })
        }
        const mes = JSON.stringify({
            'id': req.body.user_id,
            'message': 'welcome',
            'time': Date.now()
        });
        // chatService.createChatForEvent(event._id, mes, (value) => {
        res.status(200).json({
            status: 'success',
            code: 200,
            message: 'Event added successfully',
            eventId: event._id
        })
        // })

    })

});

router.post('/api/post_event', auth, async (req, res) => {
    let event = new Events()
    event.posterUrl = req.body.posterUrl
    event.user_id = req.body.user_id
    event.college = req.body.college
    event.name = req.body.name
    event.description = req.body.description
    event.about = req.body.description
    event.eventType = req.body.eventType
    event.eventMode = req.body.eventMode
    event.feesType = req.body.feesType
    event.addressType = req.body.addressType
    event.fees = req.body.fees
    //event.platform_link = req.body.platform_link
    event.o_allowed = req.body.o_allowed
    event.start_time = req.body.start_time
    event.finish_time = req.body.finish_time
    event.registrationEndTime = req.body.registrationEndTime
    event.regLink = req.body.regLink
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




router.post('/api/event/uploadimage', auth, (req, res) => {
    const user = req.user;
    const eventId = req.query.id;
    const fileName = eventId + md5(Date.now())
    // console.log(eventId);
    Files.saveFile(req.files.image, fileName, user._id, "eventposter", function (err, result) {
        if (!err) {
            console.log("aaxd")
            Events.updateOne({ _id: eventId }, { $set: { 'posterUrl': fileName } }).then((value) => {
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


router.get('/api/events', auth, (req, res) => {
    const user = req.user;
    try {
        Events.get((err, events) => {
            if (err) {
                res.json({
                    status: 'error',
                    code: 500,
                    message: err
                });
            }
            events.forEach((e,index,array) => {
                Registration.findOne({ user_id: user._id, event_id: e._id }).then(value => {
                    // console.log(value);
                    if (value != null) {
                        e.registered = true; 
                    }
                    else{
                        e.registered = false;
                    }
                    if(index == array.length - 1){
                        res.status(200).json(events)
                    }

                })

            })


        })
    }
    catch (error) {
        res.status(400).json({ 'error': error });
    }

});

router.get('/api/event', auth, async (req, res) => {
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
        const eId = req.body.eventId;
        Events.updateOne({ _id: eId }, {
            $set: {
                'name': req.body.name,
                'description': req.body.description,
                'start_time': req.body.start_time,
                'finish_time': req.body.finish_time,
                'registrationEndTime': req.body.registrationEndTime,
                'eventMode': req.body.eventMode,
                'eventType': req.body.eventType,
                'regLink': req.body.regLink,
                'fees': req.body.fees,
                'about': req.body.about,
                'feesType': req.body.feesType,
                'college': req.body.college,
                'participantsType': req.body.participantsType
            }
        }).then(value => {
            Events.findOne({ _id: eId }).then(event => {
                res.status(200).json({ event });
            })
        })
    }
    catch (error) {
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