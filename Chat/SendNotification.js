const Events = require('../Models/Events');
const Registration = require('../Models/Registrations');
const UserDetails = require('../Models/UserDetails');
const https = require('https');
const Team = require('../Models/Teams');
const admin = require('../Utilities/firebase_config');

// const firebase_url = "https://us-central1-ellipse-e2428.cloudfunctions.net/sendNotification";

const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};


const sendChatMessageNotification = async (eventId,message,users) => {
    const event = await Events.findOne({_id: eventId});
    const registrations = await Registration.find({event_id: eventId});
    // console.log(registrations);
    registrations.forEach((reg)=>{
        // console.log(reg.user_id);
        UserDetails.findOne({user_id: reg.user_id}).then((value)=>{
            // console.log(value);
            if(users.includes(value.user_id)){
                //don't send notificaation
            }
            else{
                const tokens = value.notification_tokens;
                tokens.forEach((t) => {
                    // console.log(t.token);
                    
                    const notification_message = {
                        notification: {
                            title: "Message from "+event.name,
                            body: message.message,
                        }
                    }
                    admin.messaging().sendToDevice(t.token,notification_message,notification_options).then(reponse=>{
                        //do nothing
                    })
                    .catch(error => {
                        console.log(error);
                    });
                    // https.get(`${process.env.FIREBASE_NOTIFICATIONS_URL}?token=${t.token}&imageUrl=https://ellipseapp.com/api/image?id=${event.poster_url}&title=${"Message from "+event.name}&message=${message.message}`, (resp) => {
                    // }).on("error", (err) => {
                    //     console.log("Error: " + err.message);
                    // });
                })
            }
        })
        
    })

}

const sendTeamChatMessageNotification = async (teamId,message,users) => {
    const team = await Team.findOne({_id: teamId});
    team.members.forEach(member=>{
        UserDetails.findOne({user_id: member}).then((value)=>{
            if(users.includes(value.user_id)){
                //don't send message
            }
            else{
                const tokens = value.notification_tokens;
                tokens.forEach((t) => {
                    // console.log(t.token);
                    const notification_message = {
                        notification: {
                            title: "Message from "+team.team_name,
                            body: message.message,
                        }
                    }
                    admin.messaging().sendToDevice(t.token,notification_message,notification_options).then(reponse=>{
                        //do nothing
                    })
                    .catch(error => {
                        console.log(error);
                    });
                    // https.get(`${process.env.FIREBASE_NOTIFICATIONS_URL}?token=${t.token}&title=${"Message from "+team.team_name}&message=${message.message}`, (resp) => {
                    // }).on("error", (err) => {
                    //     console.log("Error: " + err.message);
                    // });
                })
            }
        })
    })
}

module.exports = {
    sendChatMessageNotification: sendChatMessageNotification,
    sendTeamChatMessageNotification: sendTeamChatMessageNotification
}