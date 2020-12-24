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

        }


    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


module.exports = router