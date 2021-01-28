const express = require('express');
var mongoose = require('mongoose');
const Teams = require('../Models/Teams');
const auth = require('../Middleware/Auth');
const Registration = require('../Models/Registrations');
const UserDetails = require('../Models/UserDetails');
const Events = require('../Models/Events');

const router = express.Router();

router.post('/api/event/create_team', auth, async (req, res) => {
    try {
        const user = req.user;
        const team = new Teams();
        team.team_name = req.body.team_name;
        team.event_id = req.body.event_id;
        team.user_id = user._id;
        team.description = req.body.desc;
        team.members.push(user._id);

        const event = await Events.findOne({ _id: req.body.event_id });
        if (event.rounds.length === 0) {
            await team.save();
            await Registration.updateOne({
                user_id: user._id,
                event_id: req.body.event_id
            }, { $set: { 'teamed_up': true, 'team_id': team._id } });
            res.status(200).json(team);
        }
        else {
            team.submissions = [];
            event.rounds.forEach(async (round, index) => {
                if (index === 0) {
                    team.submissions.push({ 'title': round.title, 'type': round.action, is_submitted: false, submission_access: true, submission_id: null });
                }
                else {
                    team.submissions.push({ 'title': round.title, 'type': round.action, is_submitted: false, submission_access: false, submission_id: null });
                }

                if (event.rounds.length === index + 1) {
                    console.log(index);
                    await team.save();
                    await Registration.updateOne({
                        user_id: user._id,
                        event_id: req.body.event_id
                    }, { $set: { 'teamed_up': true, 'team_id': team._id } });
                    res.status(200).json(team);
                }
            });
        }

    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/api/event/get_user_registration', auth, async (req, res) => {
    try {
        const user = req.user;
        Registration.find({ user_id: user._id, event_id: req.query.id }).then((result) => {
            res.status(200).json(result);
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


router.get('/api/event/get_team_details', auth, async (req, res) => {
    try {
        const user = req.user;
        if (req.query.id != null) {
            Teams.find({ _id: req.query.id }).then((result) => {
                res.status(200).json(result);
            })
        } else {
            res.status(400).json({ "message": "not_found" })
        }

    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/api/event/get_team_member_details', auth, async (req, res) => {
    try {
        const user = req.user;
        // Teams.find({_id: req.query.id}).then((result)=>{
        //     res.status(200).json(result);
        // })
        UserDetails.find({ user_id: req.query.id }).then((result) => {

            var member = {};
            member.name = result[0].name;
            member.college = result[0].college_name;
            member.username = result[0].username;
            member.user_pic = result[0].profile_pic;
            res.status(200).json(member);
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/api/event/get_all_teams', auth, async (req, res) => {
    try {
        const user = req.user;
        Teams.find({ event_id: req.query.id }).then((result) => {
            res.status(200).json(result);
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/api/event/user_teamup_request', auth, async (req, res) => {
    try {
        const user = req.user;
        const team = Teams.findOne({ _id: req.body.team_id });
        if (team) {
            await Registration.updateOne({ event_id: req.body.event_id, user_id: user._id }, { $push: { 'sent_requests': req.body.team_id } })
            Teams.updateOne({ _id: req.body.team_id }, { $push: { "received_requests": user._id } }).then((r) => {
                res.status(200).json({ message: "success" });
            })
        }
        else {
            res.status(400).json({ message: "no team found" });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/api/event/user_teamwithdraw_request', auth, async (req, res) => {
    try {
        const user = req.user;
        const team = Teams.findOne({ _id: req.body.team_id });
        if (team) {
            await Registration.updateOne({ event_id: req.body.event_id, user_id: user._id }, { $pull: { 'sent_requests': req.body.team_id } })
            Teams.updateOne({ _id: req.body.team_id }, { $pull: { "received_requests": user._id } }).then((r) => {
                res.status(200).json({ message: "success" });
            })
        }
        else {
            res.status(400).json({ message: "no team found" });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/api/event/get_all_user_sent_requests', auth, async (req, res) => {
    try {
        const user = req.user;
        Teams.find().then((result) => {
            res.status(200).json(result);
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/api/event/accept_user_teamup_request', auth, async (req, res) => {
    try {
        const user = req.user;
        const team = await Teams.findOne({ _id: req.body.team_id });
        const userRegistartion = await Registration.findOne({ event_id: req.body.event_id, user_id: req.body.user_id });
        const event = await Events.findOne({ _id: req.body.event_id });
        const uid = req.body.user_id;
        if (team) {
            if (event.team_size.max_team_size <= team.members.length) {
                res.status(201).json({ message: "Team size exceeded" });
            }
            else {
                if (userRegistartion.teamed_up) {
                    res.status(201).json({ message: "User has already joined some other team" });
                } 
                else {
                    const r = await Registration.updateOne({ event_id: req.body.event_id, user_id: req.body.user_id }, { $set: { 'teamed_up': true, 'team_id': req.body.team_id } })
                    // console.log(r);
                    Teams.updateOne({ _id: req.body.team_id }, { $pull: { "received_requests": mongoose.Types.ObjectId(uid) }, $push: { "members": mongoose.Types.ObjectId(uid) } }).then((r) => {
                        // console.log(r);
                        res.status(200).json({ message: "success", updated_user_id: uid });
                    })
                }
            }

        }
        else {
            res.status(400).json({ message: "no team found" });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/api/event/remove_user_from_team', auth, async (req, res) => {
    try {
        const user = req.user;
        const team = Teams.findOne({ _id: req.body.team_id });
        const uid = req.body.user_id;
        if (team) {
            const r = await Registration.updateOne(
                { event_id: req.body.event_id, user_id: req.body.user_id },
                { $set: { 'teamed_up': false, 'team_id': null } })
            Teams.updateOne({ _id: req.body.team_id },
                {
                    $push: { "received_requests": mongoose.Types.ObjectId(uid) },
                    $pull: { "members": mongoose.Types.ObjectId(uid) }
                }).then((r) => {
                    // console.log(r);
                    res.status(200).json({ message: "success" });
                })
        }
        else {
            res.status(400).json({ message: "no team found" });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/api/event/edit_team', auth, async (req, res) => {
    try {
        const user = req.user;
        Teams.updateOne({ _id: req.body.team_id }, {
            $set: {
                'description': req.body.desc
            }
        }).then(() => {
            res.status(200).json({ message: "success" });
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


router.post('/api/event/delete_team', auth, async (req, res) => {
    try {
        const user = req.user;
        const team = await Teams.findOne({ _id: req.body.team_id });
        // const members = team.members;
        await Registration.updateMany(
            { team_id: req.body.team_id },
            { $set: { 'teamed_up': false, 'team_id': null } });
        // await Registration.updateMany({sent_requests})
        Teams.deleteOne({ _id: req.body.team_id }).then(() => {
            res.status(200).json({ message: "success" });
        })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/api/event/leave_team', auth, async (req, res) => {
    try {
        const user = req.user;
        const uid = user._id;
        await Registration.updateOne(
            { event_id: req.body.event_id, user_id: uid },
            { $set: { 'teamed_up': false, 'team_id': null }, $pull: { 'sent_requests': req.body.team_id } })
        Teams.updateOne({ _id: req.body.team_id },
            {
                $pull: { "members": mongoose.Types.ObjectId(uid) }
            }).then((r) => {
                // console.log(r);
                res.status(200).json({ message: "success" });
            })
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})


router.get('/api/user/get_all_teams', auth, async (req, res) => {
    try {
        const user = req.user;
        const teams = await Teams.find({ members: user._id });
        res.status(200).json(teams);
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
})



module.exports = router