/*************************************/
/*** FB Messenger message builders ***/
/*************************************/

function getFbMessage (recipientId) {
    var msg = {
        "recipient": {
            "id": parseInt(recipientId)
        }
    };
    return msg;
}

function getAttachmentMessage (recipientId, payload, type) {
    var msg = getFbMessage (recipientId);
    msg.message = {
      attachment: {
        type: type,
        payload: payload
      }
    };
    return msg;
}

function getTemplateMessage (recipientId, type, elements) {
    var msg = getFbMessage (recipientId);
    msg.message = {
      attachment: {
        type: type,
        payload: [elements]
      }
    };
    return msg;
}

function getTextMessage (recipientId, text) {
    var msg = getFbMessage (recipientId);
    msg.message = {
      text: text
    };
    return msg;
}

function getImageMessage (recipientId, imageUrl) {
    return getAttachmentMessage (recipientId, {'url': imageUrl}, 'image');
}

function getFileMessage (recipientId, fileUrl) {
  return getAttachmentMessage (recipientId, {'url': fileUrl}, 'file');
}

function getGenericTemplate (recipientId, elements) {
  return getAttachmentMessage (recipientId, {
    template_type: 'generic',
    elements: elements
  }, 'template');
}

function getButtonTemplate (recipientId, text, buttons) {
  return getAttachmentMessage (recipientId, {
    template_type: 'button',
    text: text,
    buttons: buttons
  }, 'template');
}

function getQuickRepliesMessage (recipientId, text, quick_replies) {
  var msg = getTextMessage (recipientId, text);
  msg.message.quick_replies = quick_replies;
  return msg;
}

function getQuickReply (contentType, title, payload) {
  return {
    content_type: contentType,
    title: title,
    payload: payload
  };
}

function getTypingOnMessage (recipientId) {
  var msg = getFbMessage(recipientId);
  msg.sender_action = "typing_on";
  return msg;
}

function getTypingOffMessage(recipientId) {
  var msg = getFbMessage(recipientId);
  msg.sender_action = "typing_off";
  return msg;
}

/******************************************/
/*** END - Messenger message formatters ***/
/******************************************/

module.exports = {
  getFbMessage: getFbMessage,
  getAttachmentMessage: getAttachmentMessage,
  getTemplateMessage: getTemplateMessage,
  getTextMessage: getTextMessage,
  getImageMessage: getImageMessage,
  getFileMessage: getFileMessage,
  getGenericTemplate: getGenericTemplate,
  getButtonTemplate: getButtonTemplate,
  getQuickRepliesMessage: getQuickRepliesMessage,
  getQuickReply: getQuickReply,
  getTypingOnMessage: getTypingOnMessage,
  getTypingOffMessage: getTypingOffMessage
};
