require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
// const redis = require("redis");
const authRouter = require('./Routers/Authroute');
const eventRouter = require('./Routers/Eventroute');
const chatRouter = require('./Routers/ChatRoute');
const registerRouter = require('./Routers/RegistrationRoute');
// const client = redis.createClient();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./Models/User');
const auth = require('./Middleware/Auth');
const socketIO = require("socket.io");
const webSocket = require("ws");
const http = require("http");
const chatService = require('./Chat/ChatService');
const app = express();
app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
})

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const webSocketServer = new webSocket.Server({server});
webSocketServer.on('connection',(client)=>{
    // client.room = [];
    client.send(JSON.stringify({msg:"user joined"}));
    client.on('message',message =>{
        var messag=JSON.parse(message);
        const roomId = messag.room;
        const data = messag.msg;
        if(messag.join){
            // console.log(messag.join);
            // client.room.push(messag.join)
        }
        if(messag.room){
            console.log("message")
            chatService.addChatMessage(roomId,JSON.stringify(data),(value)=>{
                console.log("done");
            })
            broadcast(message);
            

        }
        // console.log(JSON.parse(mes));
        client.on('error',e=>console.log(e))
        client.on('close',(e)=>console.log('websocket closed'+e))
    })

})
function broadcast(message){

    webSocketServer.clients.forEach(client=>{
        // console.log(client);
    client.send(message)
    })
}


app.use(authRouter);
app.use(eventRouter);
app.use(chatRouter);
app.use(registerRouter);
server.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`);
});

//code for socket.io

// const io = socketIO(server);

// io.on("connection", socket => {
//     // console.log("started")
//     socket.on("initialdata", () => {
//         console.log("hello");
//       });
//       socket.on("joinroom",(id)=>{
//           socket.join(id+":room",()=>{
//             //   console.log(Object.keys(socket.rooms));
//           })
//       })
//       socket.on("newmessage",(roomid,data)=>{
//           console.log(data);
        // chatService.addChatMessage(roomid,JSON.stringify(data),(value)=>{
        //     console.log("done");
        // })
//         io.to(roomid+":room").emit("message",data) 
//       })
// })