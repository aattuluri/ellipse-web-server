var async = require('async');
var logger = require("../logger").logger;
var constants = require("../constants");
var emailUtils = require("./email-utils");
var textAlertUtils = require("./text-alert-utils");
var NewChatMsgNotification = require("../models/new-chat-msg-notification").NewChatMsgNotification;
var User = require("../models/user").User;
var chatMessageService = require("../livechat/chat_message_service");

var NewChatMsgNotificationState = NewChatMsgNotification.STATE;
var NewChatMsgNotificationType = NewChatMsgNotification.TYPE;
var UserType = User.TYPE;

var NEW_CHAT_MESSAGES_NOTIFICATION_INTERVAL = 43200; //seconds (12 hours)

function sendNewChatMsgNotification(chatNotification, cback) {
  var user;
  var now = new Date ();
  var userId = chatNotification.userId;
  var chatId = chatNotification.chatId;
  var oldUnreadMsgCount = chatNotification.unreadMessageCount;
  var newUnreadMsgCount = 0;
  async.series([
    //get user info
    function (callback) {
      User.find({_id: userId})
      .select({type: 1, firstName: 1, email: 1,
        phone: 1, notificationPrefs: 1, lastLogin: 1}).exec (function (err, results) {
         if(!err && results && results.length > 0) {
           user = results[0];
         }
         callback(err);
      });
    },
    //get latest unread chat message count
    function (callback) {
      chatMessageService.getUnreadMessageCount(chatId, userId, function (err, result) {
          if (!err)
            newUnreadMsgCount = result;
          callback(err);
      });
    },
    //send notifications
    function (callback) {
      if (user) {
         //TODO check notification prefs for user
         sendNewMsgNotification(chatNotification, user, newUnreadMsgCount, function (err, result) {
           callback(err);
         });
      } else {
        callback("No user found");
      }
    }
  ], function (err, results) {
    if (err) {
      logger.error("sendNewMsgNotification FAILED: " + err);
    }
    cback(err);
  });
}

function sendNewMsgNotification(chatNotification, user, newUnreadMsgCount, cback) {

  var loginUrl = constants.ABS_USER_LOGIN_URL;
  if (user.type === UserType.AGENT) {
    loginUrl = constants.ABS_AGENT_LOGIN_URL;
  }
  var now = new Date ();
  var notificationState = chatNotification.state;
  var userType = user.type;
  var alertType = chatNotification.type;

  var nextState;
  var scheduledAt;

  async.series([
     function (icback) {
       var alertType = chatNotification.type;
       if (alertType === NewChatMsgNotificationType.EMAIL) {
         if (user.email) {
           var emailAlertFuncStr = getEmailAlertFuncStr(user.type, chatNotification.state);
           emailUtils[emailAlertFuncStr](
                [user.email], user.firstName, loginUrl, function (err) {
              if (err) {
                logger.error("sendEmailAlert FAILED");
              }
              icback(err);
           });
         } else {
           //logger.info ("sendEmailAlert skipped - no email available");
           icback(null);
         }
       } else if (alertType === NewChatMsgNotificationType.TEXT) {
         if (user.phone.mobile) {
           var textAlertFuncStr = getTextAlertFuncStr(user.type, chatNotification.state);
           textAlertUtils[textAlertFuncStr](
                [user.phone.mobile], loginUrl, function (err) {
              if (err) {
                logger.error("sendTextAlert FAILED, textAlertFuncStr: " +
                  textAlertFuncStr);
              }
              //we don't want to keep retrying the text alerts
              icback(null);
           });
         } else {
           logger.info("sendTextAlert skipped - no mobile number available");
           icback(null);
         }
       } else {
         icback(null);
       }
     },
     //update the notification for next iteration
     function (icback) {
       if ((userType === UserType.TRAVELER &&
            alertType === NewChatMsgNotificationType.TEXT) ||
              notificationState === NewChatMsgNotificationState.FINAL) {
         nextState = NewChatMsgNotificationState.DEAD;
       } else {
         nextState = getNewChatMsgNotificationState(chatNotification.state);
       }
       scheduledAt = getScheduledAt(user.type, chatNotification.state, now);
       icback(null);
     }
  ], function (err, results) {
    if (!err) {
      //updating the NewChatMsgNotification
      var criteria = {_id: chatNotification._id};
      if (!newUnreadMsgCount ||
          isNaN(newUnreadMsgCount)) {
        newUnreadMsgCount = 0;
      }
      var updateObj = {
         state: nextState,
         lastSentAt: now,
         scheduledTime: scheduledAt,
         unreadMessageCount: parseInt(newUnreadMsgCount)
      };
      NewChatMsgNotification.update(criteria, updateObj, function (err, result) {
           if (err) {
             logger.error("failed to update NewChatMsgNotification: " + err);
           }
           cback(err);
       });
    } else {
        logger.error("Error in sending NewChatMsgNotification: " + JSON.stringify(err));
        cback(err);
    }
  });
}

function getEmailAlertFuncStr(userType, cnState) {
    return getAlertFuncStr(userType, cnState) + "Email";
}

function getTextAlertFuncStr(userType, cnState) {
    return getAlertFuncStr(userType, cnState) + "TextAlert";
}

function getAlertFuncStr(userType, cnState) {
  var funcName = "send";
  if (userType === UserType.TRAVELER) {
    funcName = funcName + "User";
  } else if (userType === UserType.AGENT) {
    funcName = funcName + "Agent";
  }
  funcName = funcName + "NewChatMessages";
  if (cnState === NewChatMsgNotificationState.FIRST) {
    funcName = funcName + "Reminder1";
  } else if (cnState === NewChatMsgNotificationState.SECOND) {
    funcName = funcName + "Reminder2";
  } else if (cnState === NewChatMsgNotificationState.FINAL) {
    funcName = funcName + "ReminderFinal";
  }
  return funcName;
}

function getNewChatMsgNotificationState(currentState) {
  return (currentState === NewChatMsgNotificationState.DEAD)? NewChatMsgNotificationState.DEAD : (currentState + 1);
}

function getScheduledAt(userType, cNMNState, current) {
  return new Date(current.getTime() + (NEW_CHAT_MESSAGES_NOTIFICATION_INTERVAL * 1000));
}

module.exports = {
  sendNewChatMsgNotification: sendNewChatMsgNotification
};
