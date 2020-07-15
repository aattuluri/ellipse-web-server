// var NewChatMsgNotification = require("../models/new-chat-msg-notification").NewChatMsgNotification;

var redisClient = require('redis-connection')();
// var ENV = require('../env').ENVIRONMENT;

// if (ENV == "PROD") {
  //TBD: do the auth
// }

function getChatMessages(chatId, callback) {
  redisClient.lrange(chatId + ":messages", 0, -1, callback);
}

function loadChatMessages(req, reply) {
  getChatMessages(req.params.chatid, function (err, data) {
    reply(data);
  });
}

function clearChatMessages (chatId, cback) {
  redisClient.del(chatId + ":messages", function (err) {
    cback(err);
  });
}

function addChatMessage (chatId, msg, cback) {
    // console.log("strated")
  redisClient.RPUSH(chatId + ":messages", msg,(err,value)=>{
      cback(err,value);
  });
}

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

function deleteUnreadMessageCounters (chatId, cback) {
  redisClient.DEL("unread_count:" + chatId, function (err) {
    cback (err);
  });
}

module.exports = {
  getChatMessages: getChatMessages,
  loadChat: loadChatMessages,
  clearChat: clearChatMessages,
  addChatMessage: addChatMessage,
//   getUnreadMessageCount: getUnreadMessageCount,
//   clearUnreadMessages: clearUnreadMessages,
  deleteUnreadMessageCounters: deleteUnreadMessageCounters
};
