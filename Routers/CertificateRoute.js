const express = require('express');
var Mongoose = require('mongoose');
const auth = require('../Middleware/Auth');
const Events = require('../Models/Events');
const pdf = require('html-pdf');
const router = express.Router();
const template = require('../certificatetemplate');
const Files = require('../Models/Files');
const md5 = require('md5');
const randomstring = require('randomstring');
const Registrations = require('../Models/Registrations');
const UserDetails = require('../Models/UserDetails');


//post the report for the event

router.post('/api/event/generate_certificates', async (req, res) => {
    try {
        const user = req.user;
        const event_id = req.body.eventId;
        const participants = req.body.participants;
        console.log(event_id);
        console.log(participants);
        const event = await Events.findOne({_id:event_id});
        const adminUser = await UserDetails.findOne({user_id:event.user_id});
        var count = 0;
        participants.forEach(async part => {
            count++;
            const participantUser = await UserDetails.findOne({email: part});
            const fileName = randomstring.generate(6) + md5(Date.now())
            await pdf.create(template(adminUser.name, participantUser.name, '12/10/2020', event.name), { width: "2000px", height: "1200px" }).toStream(async (err, stream) => {
                if (err) {
                    return console.log('error');
                }
                await Files.saveCertificate(stream, fileName, participantUser.user_id, "participation_certificate",async function (err, result) {
                    if (!err) {
                        await Registrations.updateOne(
                            {event_id:event_id,user_id:participantUser.user_id},
                            {$set:{certificate_status:"generated",certificate_url:fileName}})
                    }
                    else {
                        res.status(400).json({
                            status: 'error',
                            code: 500,
                            message: err
                        })
                    }
                })
                // res.send(Promise.resolve())
            });
            if(count === participants.length){
                res.send(200).json({message:"success"})
            }
        });

    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }

});

//route for getting certificates of all registered events

router.get('/api/user/get_certificates',auth,async (req,res)=>{
    try {
        const user = req.user;
        Registrations.find({user_id:user._id}).then(result=>{
            res.status(200).json(result);
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//route for showing the certificate from files

router.get('/api/user/certificate',async (req,res)=>{
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
})



//route to get the event name
router.get('/api/event/get_event_name',(req,res)=>{
    try {
        const user = req.user;
        const eventId = req.query.eventId;
        Events.findOne({_id: eventId}).then(result=>{
            res.status(200).json(result.name);
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = router