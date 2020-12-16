
//dependencies
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cron = require('node-cron');
const http = require("http");
const https = require('https');
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
const feedBackRouter = require('./Routers/FeedBackRoute');
const EventKeywordsRouter = require('./Routers/EventKeywordsRoute');
const CertificateRouter = require('./Routers/CertificateRoute');
const teamRoute = require('./Routers/TeamRoute');

//Database models
const Events = require('./Models/Events');
const Notifications = require('./Models/Notifications');
const User = require('./Models/User');
const Registration = require('./Models/Registrations');
const UserDetails = require('./Models/UserDetails');

//importing functions for adding and deleting in redis chat
const chatService = require('./Chat/ChatService');
const { Console } = require('console');
const app = express();
const PORT = process.env.PORT || 4000;


app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json({ limit: "400mb" }));
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
var rooms = [];
webSocketServer.on('connection', (webSocketClient) => {
    // webSocketClient.on('close',(m,b)=>{
    //     console.log(m);
    //     console.log(b);
    // })
    webSocketClient.on('message', (message) => {
        let data = JSON.parse(message);
        const uu_id = data.msg.user_id;
        switch (data.action) {

            case 'join_event_room':
                if (!rooms[data.event_id + ":eventroom"]) {
                    rooms[data.event_id + ":eventroom"] = {};
                }
                rooms[data.event_id + ":eventroom"][uu_id] = webSocketClient;
                break;

            case 'join_team_room':
                if (!rooms[data.team_id + ":teamroom"]) {
                    rooms[data.team_id + ":teamroom"] = {};
                }
                rooms[data.team_id + ":teamroom"][uu_id] = webSocketClient;
                break;

            case 'send_message':

                const uid = data.msg.user_id;
                chatService.addChatMessage(data.event_id, JSON.stringify(data.msg), (value) => {
                    // console.log("done");
                })
                if (!rooms[data.event_id + ":eventroom"]) {
                    rooms[data.event_id + ":eventroom"] = {};
                }
                // if(!rooms[data.event_id+":eventroom"][uid]){
                rooms[data.event_id + ":eventroom"][uid] = webSocketClient
                // }

                Object.entries(rooms[data.event_id + ":eventroom"]).forEach(([, client]) => {
                    client.send(JSON.stringify({
                        action: "receive_message",
                        event_id: data.event_id,
                        msg: data.msg
                    }))

                });
                break;
            case 'send_team_message':

                chatService.addTeamChatMessage(data.team_id, JSON.stringify(data.msg), (value) => {
                    // console.log("done");
                })

                if (!rooms[data.team_id + ":teamroom"]) {
                    rooms[data.team_id + ":teamroom"] = {};
                }
                rooms[data.team_id + ":teamroom"][uu_id] = webSocketClient;

                Object.entries(rooms[data.team_id + ":teamroom"]).forEach(([, client]) => {
                    client.send(JSON.stringify({
                        action: "receive_team_message",
                        team_id: data.team_id,
                        msg: data.msg
                    }))

                });
                break;
            case 'delete_event_chat_message':
                chatService.deleteEventChatMessage(data.event_id, JSON.stringify(data.msg), (err, data) => {
                    //do nothing
                    console.log(err);
                })
                break;
            case 'delete_team_chat_message':
                chatService.deleteTeamChatMessage(data.team_id, JSON.stringify(data.msg), (err, data) => {
                    //do nothing
                    console.log(err);
                })
                break;
            case 'team_status_update_message':
                chatService.addTeamChatMessage(data.team_id, JSON.stringify(data.msg), (value) => {
                    // console.log("done");
                })

                if (!rooms[data.team_id + ":teamroom"]) {
                    rooms[data.team_id + ":teamroom"] = {};
                }
                rooms[data.team_id + ":teamroom"][uu_id] = webSocketClient;

                Object.entries(rooms[data.team_id + ":teamroom"]).forEach(([, client]) => {
                    client.send(JSON.stringify({
                        action: "receive_team_status_message",
                        team_id: data.team_id,
                        msg: data.msg
                    }))
                });
                
                break;

            case 'close_socket':
                const uuid = data.user_id;
                if (!rooms[data.event_id + ":eventroom"][uuid]) {
                    // rooms[data.event_id+":eventroom"][uid] = webSocketClient
                }
                else {
                    if (Object.keys(rooms[data.event_id + ":eventroom"]).length === 1) {
                        delete rooms[data.event_id + ":eventroom"];
                    }
                    else {
                        delete rooms[data.event_id + ":eventroom"][uuid];
                    }
                }
                break;

        }
    });
})





//CRON TASKS FOR NOTIFICATIONS

const firebase_url = "https://us-central1-ellipse-e2428.cloudfunctions.net/sendNotification";


cron.schedule('00 08 * * *', () => {
    const presentDate = new Date();
    var newDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const todayEvents = Events.find({
        start_time: {
            $gte: presentDate.toDateString(),
            $lt: newDate.toDateString()
        }
    }).then((result) => {
        // console.log(result);
        result.forEach((e) => {
            Registration.find({ event_id: e._id }).then((res) => {
                res.forEach((r) => {
                    const notification = new Notifications();
                    notification.user_id = r.user_id;
                    notification.event_id = r.event_id;
                    notification.title = e.name;
                    // {endDate.toDateString()}{" "+endDate.toLocaleTimeString()}
                    notification.description = "Starts at " + e.start_time.toDateString() + " " + e.start_time.toLocaleTimeString() + " IST"
                    notification.save();
                    UserDetails.findOne({ user_id: r.user_id }).then((v) => {
                        const tokens = v.notification_tokens;
                        tokens.forEach((t) => {
                            // console.log(t.token);
                            https.get(`${firebase_url}?token=${t.token}&imageUrl=https://ellipseapp.com/api/image?id=${e.poster_url}&title=${e.name}&message=Starts at ${e.start_time.toDateString()} ${e.start_time.toLocaleTimeString()} IST`, (resp) => {
                            }).on("error", (err) => {
                                console.log("Error: " + err.message);
                            });
                        })
                    })
                })
            })
        })

    })
})



//Routers initialization
app.use('/files', express.static(__dirname + '/files'))
app.use(authRouter);
app.use(eventRouter);
app.use(chatRouter);
app.use(registerRouter);
app.use(reportRouter);
app.use(notificationRouter);
app.use(adminRouter);
app.use(feedBackRouter);
app.use(EventKeywordsRouter);
app.use(CertificateRouter);
app.use(teamRoute);


server.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`);
});

//Code for chat with socket.io
// const server = http.createServer(app);
// var io = require('socket.io')(server, {
//     path: '/w',
//     cors: {
//         origin: '*',
//       }
// });
// io.on('connection', (socket) => {
//     console.log('a user connected');
//     socket.on('initial_room', (room_id) => {
//         console.log(room_id);
//         socket.join(room_id + ":eventroom");
//     })
//     // io.emit('news',"hjsk");
//     socket.on('chatmessage', (message) => {
//         let data = JSON.parse(message);
//         console.log(data.event_id);
//         chatService.addChatMessage(data.event_id, JSON.stringify(data.msg), (value) => {
//             // console.log("done");
//         })
//         io.in(data.event_id + ":eventroom").emit('chatmessage', JSON.stringify({
//             action: "receive_message",
//             event_id: data.event_id,
//             msg: data.msg
//         }));
//     })
//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//     });
// });


// webSocketServer
                    //     .clients
                    //     .forEach(client => {
                    //         client.send(JSON.stringify({
                    //             action: "receive_message",
                    //             event_id: data.event_id,
                    //             msg: data.msg
                    //         }))

                    //     });