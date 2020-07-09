var ChatServerActions = require('../Actions/ChatServerActions');
var socket;

module.exports = {

  init: function () {
    //connect
    socket = io();

    //subscribe to all the events and generate the corresponding actions
    socket.on('io:msg:latest', function(msg) {
      console.log(msg);
      console.log(msg.u + " sent: " + msg.m);
      ChatServerActions.receiveNewMessage(msg);
    });

    socket.on('io:join', function(msg) {
      console.log(msg);
      console.log(msg.u + " has joined the chat: " + msg.c);
      ChatServerActions.receiveJoinMessage(msg);
    });

    socket.on('io:typing', function(msg) {
      console.log(msg);
      console.log(msg.u + " is typing...");
      ChatServerActions.receiveTypingAction(msg);
    });

    socket.on('io:leave', function(msg) {
      console.log(msg);
      console.log(msg.u + " has left the chat: " + msg.c);
      ChatServerActions.receiveLeaveMessage(msg);
    });
  },
  joinGroup: function (userName, userEmail, chatId) {
    socket.emit('io:join', {u: userName, e: userEmail, c: chatId});
  },
  leaveGroup: function (chatId) {
    socket.emit('io:leave', {c: chatId});
  },
  sendMessage: function (message) {
    socket.emit('io:msg', message);
  },
  typing: function (chatId) {
    socket.emit('io:typing', {c: chatId});
  }
};
