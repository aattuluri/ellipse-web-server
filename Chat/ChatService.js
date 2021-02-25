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

function addUnreadChatMessageCount(chatId,userId,count,cb){
  redisClient.HSET("unread_count:"+chatId,userId,count);
}

function clearUnreadChatMessagesCount(chatId,userId,cb){
  redisClient.HSET("unread_count:"+chatId,userId,0,cb)
}

function getUnreadChatMessagesCount(chatId,userId,cb){
  redisClient.HGET("unread_count:"+chatId,userId,(err,data)=>{
    cb(err,data);
  })
}

module.exports = {
  createChatForEvent: createChatForEvent,
  getChatMessages: getChatMessages,
  addChatMessage: addChatMessage,
  addTeamChatMessage: addTeamChatMessage,
  getTeamChatMessages: getTeamChatMessages,
  deleteEventChatMessage: deleteEventChatMessage,
  deleteTeamChatMessage: deleteTeamChatMessage,
  addUnreadChatMessageCount: addUnreadChatMessageCount,
  clearUnreadChatMessagesCount: clearUnreadChatMessagesCount,
  getUnreadChatMessagesCount: getUnreadChatMessagesCount
};
