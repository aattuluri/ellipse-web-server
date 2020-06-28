var ChatServerActions = require('../Actions/ChatServerActions');
var SocketIOUtils = require('../Actions/SocketIOUtils');
module.exports = {

  init : function () {
    //TBD: Initilize socket IO?
    SocketIOUtils.init();
  },

  getAllMessages: function(chatId) {
    // get all messages in this chat group
    var rawMessages = [];
    $.get('/loadChat/' + chatId, function(data){
      console.log(data);
      rawMessages = JSON.parse(data);
      ChatServerActions.receiveAll(rawMessages);
    });

  },

  createMessage: function(message, chatId) {
    var createdMessage = {
      c: chatId,
      m: message
    };
    SocketIOUtils.sendMessage(createdMessage);
  },

  typing: function(chatId) {
    var typingActionMsg = {
      c: chatId
    };
    SocketIOUtils.typing(typingActionMsg);
  },

  joinGroup: function(userName, userEmail, chatId) {
    var joinGroupMsg = {
      u: userName,
      e: userEmail,
      c: chatId
    };
    SocketIOUtils.joinGroup(joinGroupMsg);
  },

  leaveGroup: function(chatId) {
    var leaveGroupMsg = {
      c: chatId
    };
    SocketIOUtils.leaveGroup(leaveGroupMsg);
  }

};
