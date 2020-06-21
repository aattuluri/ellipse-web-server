const express = require('express');
const auth = require('../Middleware/auth');
const router = express.Router();
const Events = require('../Models/Events');

router.post('/api/events',(req,res)=>{
    let event = new Events()
    event.user_id = req.body.user_id
    event.name = req.body.name
    event.description = req.body.description
    event.start_time = req.body.start_time
    event.finish_time = req.body.finish_time
    event.save(function(err) {
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
            data: event
        })
    })
});

router.get('/events',(req,res)=>{
    Events.get((err, event) => {
        if (err) {
            res.json({
                status: 'error',
                code: 500,
                message: err
            });
        }

        res.json(event)
    })
})

module.exports = router


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