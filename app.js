require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
// const redis = require("redis");
const authRouter = require('./Routers/Authroute');
const eventRouter = require('./Routers/Eventroute');
const chatRouter = require('./Routers/ChatRoute');
const registerRouter = require('./Routers/RegistrationRoute');
const reportRouter = require('./Routers/ReportRoute');
// const client = redis.createClient();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./Models/User');
// const auth = require('./Middleware/Auth');
// const socketIO = require("socket.io");
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
const webSocketServer = new webSocket.Server({ server });
webSocketServer.on('connection', (webSocketClient) => {
    // client.room = [];
    webSocketClient.on('message', (message) => {
        console.log(message)
        let data = JSON.parse(message);
        console.log(data);
        chatService.addChatMessage(data.event_id,JSON.stringify(data.msg),(value)=>{
            console.log("done");
        })
        switch (data.action) {
            case 'send_message':
                webSocketServer
                    .clients
                    .forEach(client => {
                        client.send(JSON.stringify({
                            action: "receive_message",
                            event_id: data.event_id,
                            msg: data.msg
                        }))

                    });
                break;
        }
    });
})


app.use(authRouter);
app.use(eventRouter);
app.use(chatRouter);
app.use(registerRouter);
app.use(reportRouter);
server.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`);
});



// client.send(JSON.stringify({
                        //     "action": "receive_message",
                        //     "sender_type": data.sender_type,
                        //     "event_id": data.event_id,
                        //     "sender_id": data.sender_id,
                        //     "message": data.message,
                        //     "time": data.time
                        // }));





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