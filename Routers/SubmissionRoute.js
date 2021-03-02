const express = require('express');
const Teams = require('../Models/Teams');
const auth = require('../Middleware/Auth');
const Registration = require('../Models/Registrations');
const UserDetails = require('../Models/UserDetails');
const https = require('https');
const Events = require('../Models/Events');

const router = express.Router();

router.post('/api/event/team/add_submission', auth, async (req, res) => {
    try {
        const user = req.user;
        if (req.body.is_teamed) {
            const team = await Teams.findOne({ _id: req.body.team_id });
            var sub = team.submissions;
            var updatedSubs = [];
            sub.forEach((s, index) => {
                if (req.body.event_round === s.title) {
                    updatedSubs.push({ 'title': s.title, is_submitted: true, submission_access: s.submission_access, submission_form: req.body.submission })
                }
                else {
                    updatedSubs.push(s);
                }
                if (index + 1 === sub.length) {
                    Teams.updateOne({ _id: req.body.team_id }, { $set: { submissions: updatedSubs } }).then((value) => {
                        res.status(200).json({ "message": "success" });
                    })

                }
            });

        }
        else {
            const registration = await Registration.findOne({_id: req.body.reg_id});
            var sub = registration.submissions;
            var updatedSubs = [];
            sub.forEach((s, index) => {
                if (req.body.event_round == s.title) {
                    updatedSubs.push({ 'title': s.title, is_submitted: true, submission_access: s.submission_access, submission_form: req.body.submission })
                }
                else {
                    updatedSubs.push(s);
                }
                if (index + 1 == sub.length) {
                    Registration.updateOne({ _id: req.body.reg_id }, { $set: { submissions: updatedSubs } }).then((value) => {
                        res.status(200).json({ "message": "success" });
                    })
                }
            });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


//get submission without auth
router.get('/api/event/get_submission',async (req,res)=>{
    try{
        const team_submission = await Teams.findOne({_id: req.query.id});
        const reg_submission = await Registration.findOne({_id: req.query.id});
        if(team_submission){
            const event = await Events.findOne({_id: team_submission.event_id},{rounds: 1,name: 1, isTeamed: 1,poster_url: 1});
            const users = await UserDetails.find({user_id:{$in:team_submission.members}},{name: 1, college_name: 1,profile_pic: 1});
            res.status(200).json({submission:team_submission,rounds_info: event.rounds,event: event,users: users});
        }
        else if(reg_submission){
            const event = await Events.findOne({_id:reg_submission.event_id},{rounds: 1,name: 1, isTeamed: 1,poster_url: 1});
            const users = await UserDetails.find({user_id: reg_submission.user_id},{name: 1, college_name: 1,profile_pic: 1});
            res.status(200).json({submission: reg_submission,rounds_info: event.rounds,event: event,users: users});
        }
        else{
            res.status(201).json({"message":"not found"});
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


//route to give access to user for particular round
router.post('/api/event/give_access_round', auth, async (req, res) => {
    try {
        const user = req.user;
        const updatedReg = [];
        if(req.body.is_teamed){
            const team = await Teams.findOne({_id: req.body.team_id});
            team.submissions.forEach((value,index)=>{
                if(value.title === req.body.round_title){
                    updatedReg.push({...value,submission_access: true})
                }
                else{
                    updatedReg.push(value);
                }

                if(index === team.submissions.length - 1){
                    Teams.updateOne({_id: req.body.team_id},{$set:{submissions: updatedReg}}).then(()=>{
                        res.status(200).json({"message": "success"})
                    })
                }
            })

        }
        else{
            const reg = await Registration.findOne({event_id: req.body.event_id,user_id: req.body.user_id});
            const updatedReg = [];
            reg.submissions.forEach((value,index)=>{
                if(value.title === req.body.round_title){
                    updatedReg.push({...value,submission_access: true})
                }
                else{
                    updatedReg.push(value);
                }
                if(index === reg.submissions.length - 1){
                    Registration.updateOne({event_id: req.body.event_id,user_id: req.body.user_id},{$set:{submissions: updatedReg}}).then(()=>{
                        res.status(200).json({"message": "success"})
                    })
                    
                }
            })
        }
        
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


//remove access to user for particular round
router.post('/api/event/remove_access_round', auth, async (req, res) => {
    try {
        const user = req.user;
        const updatedReg = [];
        if(req.body.is_teamed){
            const team = await Teams.findOne({_id: req.body.team_id});
            team.submissions.forEach((value,index)=>{
                if(value.title === req.body.round_title){
                    updatedReg.push({...value,submission_access: false})
                }
                else{
                    updatedReg.push(value);
                }

                if(index === team.submissions.length - 1){
                    Teams.updateOne({_id: req.body.team_id},{$set:{submissions: updatedReg}}).then(()=>{
                        res.status(200).json({"message": "success"})
                    })
                }
            })
        }
        else{
            const reg = await Registration.findOne({event_id: req.body.event_id,user_id: req.body.user_id});
            const updatedReg = [];
            reg.submissions.forEach((value,index)=>{
                if(value.title === req.body.round_title){
                    updatedReg.push({...value,submission_access: false})
                }
                else{
                    updatedReg.push(value);
                }
                if(index === reg.submissions.length - 1){
                    Registration.updateOne({event_id: req.body.event_id,user_id: req.body.user_id},{$set:{submissions: updatedReg}}).then(()=>{
                        res.status(200).json({"message": "success"})
                    })
                    
                }
            })
        }
        
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = router