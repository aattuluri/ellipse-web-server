
//dependencies
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cron = require('node-cron');
const http = require("http");
const webSocket = require("ws");
const mongoose = require('mongoose');

//Routers imports
const authRouter = require('./Routers/Authroute');
const eventRouter = require('./Routers/Eventroute');
const chatRouter = require('./Routers/ChatRoute');
const registerRouter = require('./Routers/RegistrationRoute');
const reportRouter = require('./Routers/ReportRoute');
const notificationRouter = require('./Routers/NotificationRoute');
const adminRouter = require('./Routers/AdminRoute');

//Database models
const Events = require('./Models/Events');
const Notifications = require('./Models/Notifications');
const User = require('./Models/User');
const Registration = require('./Models/Registrations');

//importing functions for adding and deleting in redis chat
const chatService = require('./Chat/ChatService');
const app = express();
const PORT = process.env.PORT || 4000;


app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json({ limit: "40mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
})



//Code for chat with web sockets
const server = http.createServer(app);
const webSocketServer = new webSocket.Server({ server });
webSocketServer.on('connection', (webSocketClient) => {
    webSocketClient.on('message', (message) => {
        let data = JSON.parse(message);
        chatService.addChatMessage(data.event_id,JSON.stringify(data.msg),(value)=>{
            // console.log("done");
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


//CRON TASKS FOR NOTIFICATIONS

cron.schedule('00 9 * * *',()=>{
    const presentDate = new Date();
    var newDate = new Date(Date.now() + 2 * 24*60*60*1000);
    const todayEvents = Events.find({
        start_time: {
            $gte:presentDate.toDateString(),
            $lt: newDate.toDateString()
        }
    }).then((result)=>{
        console.log(result);
        result.forEach((e)=>{
            Registration.find({ event_id: e._id}).then((res) => {
                res.forEach((r)=>{
                    const notification = new Notifications();
                    notification.user_id = r.user_id;
                    notification.event_id = r.event_id;
                    notification.title = e.name;
                    notification.description = "Starts at "+ e.start_time.toDateString()
                    notification.save();
                })
            })
        })
        
    })
})



//Routers initialization
app.use('/files',express.static(__dirname +'/files'))
app.use(authRouter);
app.use(eventRouter);
app.use(chatRouter);
app.use(registerRouter);
app.use(reportRouter);
app.use(notificationRouter);
app.use(adminRouter);


server.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`);
});







