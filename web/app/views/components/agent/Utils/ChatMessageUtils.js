module.exports = {

  convertRawMessage: function(rawMessage, currentThreadID) {
    return rawMessage;
  },

  getCreatedMessageData: function(text, chatId) {
    return {
      m: text,
      c: chatId
    };
  }

};
