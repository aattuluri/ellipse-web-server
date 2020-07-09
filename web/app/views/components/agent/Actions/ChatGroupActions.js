var ChatDispatcher = require('../Dispatcher/ChatDispatcher');
var ChatConstants = require('../Constants/ChatConstants');

var ActionTypes = ChatConstants.ActionTypes;

module.exports = {

  clickThread: function(chatId) {
    ChatDispatcher.dispatch({
      type: ActionTypes.CLICK_CHAT_GROUP,
      chatId: chatId
    });
  }

};
