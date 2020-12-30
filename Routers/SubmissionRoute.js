const express = require('express');
var mongoose = require('mongoose');
const Teams = require('../Models/Teams');
const Submission = require('../Models/Submissions');
const auth = require('../Middleware/Auth');
const Registration = require('../Models/Registrations');
const UserDetails = require('../Models/UserDetails');

const router = express.Router();

router.post('/api/event/team/add_submission', auth, async (req, res) => {
    try {
        const user = req.user;
        const submission = new Submission();
        submission.user_id = user._id;
        submission.event_id = req.body.event_id;
        submission.team_id = req.body.team_id;
        submission.submission = req.body.submission;

        await submission.save();
        if (req.body.is_teamed) {
            const team = await Teams.findOne({ _id: req.body.team_id });
            var sub = team.submissions;
            var updatedSubs = [];
            sub.forEach((s, index) => {
                if (req.body.event_round === s.title) {
                    updatedSubs.push({ 'title': s.title, 'type': s.type, is_submitted: true, submission_access: s.submission_access, submission_id: submission._id })
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
                console.log(s);
                if (req.body.event_round == s.title) {
                    updatedSubs.push({ 'title': s.title, 'type': s.type, is_submitted: true, submission_access: s.submission_access, submission_id: submission._id })
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


router.post('/api/event/team/edit_submission', auth, async (req, res) => {
    try {
        const user = req.user;
        await Submission.updateOne({_id: req.body.sub_id},{$set:{submission:req.body.submission}});
        res.status(200).json({"message": "success"})
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//get submission
router.get('/api/event/get_submission',auth,async (req,res)=>{
    try{
        const submission = await Submission.findOne({_id: req.query.id});
        if(submission){
            res.status(200).json(submission);
        }
        else{
            res.status(400).json({message: "not_found"})
        }
        

    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


//get submissions for the event
router.get('/api/event/get_all_event_submission',auth,async (req,res)=>{
    try{
        const submissions = await Submission.find({event_id: req.query.id});
        if(submissions){
            res.status(200).json(submissions);
        }
        else{
            res.status(400).json({message: "not_found"})
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


router.post('/api/event/give_access_round', auth, async (req, res) => {
    try {
        const user = req.user;
        console.log(req.body.event_id);
        console.log(req.body.user_id);
        if(req.body.is_teamed){

        }
        else{
            const reg = await Registration.findOne({event_id: req.body.event_id,user_id: req.body.user_id});
            console.log(reg);
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



module.exports = router