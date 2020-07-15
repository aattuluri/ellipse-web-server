const express = require('express');
const auth = require('../Middleware/Auth');
const router = express.Router();
const Events = require('../Models/Events');
// const chatService = require('../Chat/ChatService');
const { json } = require('body-parser');
const EventsMedia = require('../Models/EventsMedia');

router.post('/api/events',auth,(req,res)=>{
    console.log(req.body);
    let event = new Events(req.body)
    let eventsMedia = new EventsMedia();
    // event.user_id = req.body.user_id
    // console.log(req.body.user_id);
    // event.name = req.body.name;
    // event.description = req.body.description;
    // event.start_time = req.body.start_time;
    // event.finish_time = req.body.finish_time;
    // event.eventType = req.body.eventType;
    // event.eventMode = req.body.eventMode;
    // event.tags = req.body.tags;
    // event.poster = req.body.poster;
    // event.registrationEndTime = req.body.registrationEndTime;
    event.save(function(err) {
        if (err) {
            res.status(400).json({
                status: 'error',
                code: 500,
                message: err
            })
        }
        
        eventsMedia.image_data = req.body.image_data;
        eventsMedia.user_id = event._id;
        eventsMedia.type = req.body.type;
        // console.log(event._id);
        eventsMedia.save((err) =>{
            if (err) {
                res.status(400).json({
                    status: 'error',
                    code: 500,
                    message: err
                })
            }
            // console.log()
            Events.updateOne({_id:event._id},{$set:{'posterUrl':eventsMedia._id}}).then((value)=>{
                res.status(200).json({
                    status: 'success',
                    code: 200,
                    message: 'Event added successfully',
                    data: event
                })
            })
            
        })
        
    })
});

router.get('/api/events',auth,(req,res)=>{
    Events.get((err, event) => {
        if (err) {
            res.json({
                status: 'error',
                code: 500,
                message: err
            });
        }
        event.forEach(e => {
            e.posterUrl = ""
        });
        res.json(event)
    })
});

router.get('/api/event',auth,async (req,res)=>{
    try{
        const event = await Events.findOne({_id: req.query.id});
        res.status(200).json({event}); 
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
    
})

router.get('/api/event/image',auth,async (req,res)=>{
    try{
        const image = await EventsMedia.findOne({_id: req.query.id});
        res.status(200).json({image}); 
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
    
})

router.post('/api/updateevent',auth, async (req,res)=>{
    try{
         const eId = req.body.eventId;
         Events.updateOne({_id: eId},{$set:{
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
             'college': req.body.college
         }}).then(value =>{
             Events.findOne({_id: eId}).then(event =>{
                res.status(200).json({event});
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