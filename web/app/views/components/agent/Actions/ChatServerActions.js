var ChatDispatcher = require('../Dispatcher/ChatDispatcher');
var ChatConstants = require('../Constants/ChatConstants');

var ActionTypes = ChatConstants.ActionTypes;

module.exports = {

  receiveAll: function(rawMessages) {
    ChatDispatcher.dispatch({
      type: ActionTypes.RECEIVE_MESSAGES,
      rawMessages: rawMessages
    });
  },

  receiveNewMessage: function(createdMessage) {
    ChatDispatcher.dispatch({
      type: ActionTypes.RECEIVE_NEW_MESSAGE,
      rawMessage: createdMessage
    });
  },

  receiveJoinMessage: function(joinMessage) {
    ChatDispatcher.dispatch({
      type: ActionTypes.RECEIVE_JOIN_MESSAGE,
      joinMessage: joinMessage
    });
  },

  receiveTypingAction: function(typingAction) {
    ChatDispatcher.dispatch({
      type: ActionTypes.RECEIVE_TYPING_ACTION,
      typingAction: typingAction
    });
  },

  receiveLeaveMessage: function(leaveMessage) {
    ChatDispatcher.dispatch({
      type: ActionTypes.RECEIVE_LEAVE_MESSAGE,
      leaveMessage: leaveMessage
    });
  }

};
