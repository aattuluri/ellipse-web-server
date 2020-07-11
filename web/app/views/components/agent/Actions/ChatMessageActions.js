var ChatDispatcher = require('../Dispatchers/ChatDispatcher');
var ChatConstants = require('../Constants/ChatConstants');
var ChatWebAPIUtils = require('../Utils/ChatWebUtils');
var ChatMessageUtils = require('../Utils/ChatMessageUtils');

var ActionTypes = ChatConstants.ActionTypes;

module.exports = {

  createMessage: function(text, chatId) {
    ChatDispatcher.dispatch({
      type: ActionTypes.CREATE_MESSAGE,
      m: text,
      c: chatId
    });
    var message = ChatMessageUtils.getCreatedMessageData(text, chatId);
    ChatWebAPIUtils.createMessage(message);
  }

};
