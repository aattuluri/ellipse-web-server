const express = require('express');
const auth = require('../Middleware/Auth');
const router = express.Router();
// const Events = require('../Models/Events');
const chatService = require('../Chat/ChatService');

router.post('/api/chat/create',auth,(req,res)=>{
    console.log(req.body);
    
});

router.post('/api/chat/join',auth,(req,res)=>{

})



module.exports = router




