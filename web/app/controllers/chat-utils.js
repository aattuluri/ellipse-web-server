var async = require('async');
var logger = require("../logger").logger;
var utils = require("../utils");
var chat = require('../livechat/chat');

/**
@params
files - an array of files with each file in the format: {id: <id>, e: [png|jpeg|jpg|pdf], t: <title>}
*/
exports.addFilesToChat = function (files, chatId, userName) {
    var msg;
    if (fileType === "image") {
      msg = utils.format(IMAGE_MSG_TEMPLATE, fileId, title);
    } else {
      msg = utils.format(FILE_MSG_TEMPLATE, fileId, title);
    }
    addMsgToChat ({
      c: chatId,
      f: files,
      u: userName
    });
};

function addMsgToChat (msg) {
    chat.saveAndPublishMessage (msg);
}

exports.addMsgToChat = addMsgToChat;
