const express = require('express');
const auth = require('../Middleware/Auth');
const router = express.Router();
// const Events = require('../Models/Events');
const chatService = require('../Chat/ChatService');

router.post('/api/chat/create',auth,(req,res)=>{
    console.log(req.body);
    
});

router.get('/api/chat/getMessages',(req,res)=>{
    const mes = JSON.stringify({
        'id': "5f0ed73d9633fe43bddac78f",
        'message': 'welcome',
        'time': Date.now()
    });
    // chatService.createChatForEvent(req.query.id,mes,(value)=>{
    //     // console.log(value);
        
    // })
    chatService.getChatMessages(req.query.id,function(data){
        console.log(data);
        const parsedDate = [];
        data.forEach(element => {
            parsedDate.push(JSON.parse(element))
        });
        console.log(parsedDate);
        res.send(parsedDate)
    })
})



module.exports = router




