const redis = require("redis");
const redisClient = redis.createClient();


redisClient.on('connect',()=>{
  console.log("rdis client connected")
})

redisClient.on('error',(err)=>{
  console.log(err);
})


//function for creating chat which is not used now
function createChatForEvent(eventId,message,cb){
  redisClient.LPUSH(eventId+":messages",message,cb);
}

//function for getting chat messages
function getChatMessages(chatId,callback){
  redisClient.lrange(chatId + ":messages", 0, -1, (error,data)=>{
    callback(data);
  });
}

//function for getting chat messages
function getTeamChatMessages(chatId,callback){
  redisClient.lrange(chatId + ":team_messages", 0, -1, (error,data)=>{
    callback(data);
  });
}


//function for adding chat message
function addChatMessage(eventId,message,cb){
  redisClient.RPUSH(eventId+":messages",message,cb);
}

function addTeamChatMessage(teamId,message,cb){
  redisClient.RPUSH(teamId+":team_messages",message,cb);
}

function deleteEventChatMessage(eventId,message,cb){
  redisClient.LREM(eventId+":messages",1,message,cb)
}

function deleteTeamChatMessage(teamId,message,cb){
  redisClient.LREM(teamId+":team_messages",1,message,cb)
}

module.exports = {
  createChatForEvent: createChatForEvent,
  getChatMessages: getChatMessages,
  addChatMessage: addChatMessage,
  addTeamChatMessage: addTeamChatMessage,
  getTeamChatMessages: getTeamChatMessages,
  deleteEventChatMessage: deleteEventChatMessage,
  deleteTeamChatMessage: deleteTeamChatMessage
};


  // loadChat: loadChatMessages,
  // clearChat: clearChatMessages,
  // addChatMessage: addChatMessage,
//   getUnreadMessageCount: getUnreadMessageCount,
//   clearUnreadMessages: clearUnreadMessages,
  // deleteUnreadMessageCounters: deleteUnreadMessageCounters
// function getChatMessages(chatId, callback) {
//   redisClient.lrange(chatId + ":messages", 0, -1, callback);
// }

// function loadChatMessages(req, reply) {
//   getChatMessages(req.params.chatid, function (err, data) {
//     reply(data);
//   });
// }

// function clearChatMessages (chatId, cback) {
//   redisClient.del(chatId + ":messages", function (err) {
//     cback(err);
//   });
// }

// function addChatMessage (chatId, msg, cback) {
//     // console.log("strated")
//   redisClient.RPUSH(chatId + ":messages", msg,(err,value)=>{
//       cback(err,value);
//   });
// }

// function getUnreadMessageCount (chatId, userId, cback) {
//   redisClient.HGET("unread_count:" + chatId, userId, function (err, count) {
//     cback (err, count);
//   });
// }

// function clearUnreadMessages (chatId, userId, cback) {
//   redisClient.HSET("unread_count:" + chatId, userId, 0);
//   //clear any unread msg notifications created for the user
//   NewChatMsgNotification.find ({chatId: chatId, userId: userId}).remove (function (err, result) {
//       if (!err) {
//         //DO NOTHING
//       } else {
//         logger.error ("Failed to delete a NewChatMsgNotification: " + err);
//       }
//       cback (null);
//   });

// }

// function deleteUnreadMessageCounters (chatId, cback) {
//   redisClient.DEL("unread_count:" + chatId, function (err) {
//     cback (err);
//   });
// }





