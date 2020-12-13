const express = require('express');
const auth = require('../Middleware/Auth');
const router = express.Router();
const chatService = require('../Chat/ChatService');

//route for loading the past chat messages 
router.get('/api/chat/load_messages',auth, (req, res) => {
    try {
        chatService.getChatMessages(req.query.id, function (data) {
            const parsedData = [];
            data.forEach(element => {
                parsedData.push(JSON.parse(element))
            });
            res.send(parsedData)
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/api/chat/load_team_chat_messages',auth, (req, res) => {
    try {
        chatService.getTeamChatMessages(req.query.id, function (data) {
            const parsedData = [];
            data.forEach(element => {
                parsedData.push(JSON.parse(element))
            });
            res.send(parsedData)
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})


module.exports = router