var async = require('async');
var logger = require("../logger").logger;
var NewChatMsgNotification = require("../models/new-chat-msg-notification").NewChatMsgNotification;
var chatMessageService = require("../livechat/chat_message_service");
var notifications = require("./notifications");
var Trip = require("./trips").Trip;
var User = require("./users").User;
var TripStatus = Trip.STATUS;
var NewChatMsgNotificationType = NewChatMsgNotification.TYPE;
var NewChatMsgNotificationState = NewChatMsgNotification.STATE;

var activeCronTasks = {};

var CRON_TASK_DEFAULT_INTERVAL = 60; //seconds
var NOTIFICATION_INITIAL_DELAY = 7200; //seconds
var NOTIFICATION_DEFAULT_INITIAL_DELAY = 15; //seconds
var LAST_LOGIN_OFFSET = 600; //in seconds

var CRON_TASK_TYPE = {
  "CREATE_NEW_CHAT_MSG_NOTIFICATIONS": {
    "interval": CRON_TASK_DEFAULT_INTERVAL,
    "func": createNewChatMsgNotifications
  },
  "PROCESS_NEW_CHAT_MSG_NOTIFICATIONS": {
    "interval": CRON_TASK_DEFAULT_INTERVAL,
    "func": processNewChatMsgNotifications
  }
};

var DEFAULT_TASK_LIST = [
  CRON_TASK_TYPE.CREATE_NEW_CHAT_MSG_NOTIFICATIONS,
  CRON_TASK_TYPE.PROCESS_NEW_CHAT_MSG_NOTIFICATIONS
];

function init () {
  for (var i in DEFAULT_TASK_LIST) {
    logger.info ("Added DEFAULT_TASK: "  + i + " with params: " +
          JSON.stringify(DEFAULT_TASK_LIST[i]) + " to the cron job list.");
    var taskParams = DEFAULT_TASK_LIST[i];
    var timerTask = setInterval (taskParams.func, taskParams.interval * 1000);
    activeCronTasks[DEFAULT_TASK_LIST[i]] = timerTask;
  }
}

function start (cronTaskType) {
  if (activeCronTasks[cronTaskType] &&
      activeCronTasks[cronTaskType] !== null) {
    return;
  }
  var taskParams = CRON_TASK_TYPE[cronTaskType];
  var timerTask = setInterval (taskParams.func, taskParams.interval * 1000);
  activeCronTasks[cronTaskType] = timerTask;
}

function stop (cronTaskType) {
  if (!cronTasks[cronTaskType])
    return;
  clearInterval (activeCronTasks[cronTaskType]);
  delete activeCronTasks[cronTaskType];
}

function destroy () {
  for (var i in activeCronTasks) {
    clearInterval (activeCronTasks[i]);
    delete activeCronTasks[i];
  }
}

//the actual tasks

//create the new notifications
function createNewChatMsgNotifications () {
  var trips;
  var userIds;
  var now = new Date();
  async.series([
    //for all chat_initiated/chat_started trips
    function (callback) {
      Trip.find ({$or: [{status: TripStatus.CHAT_INITIATED},
          {status: TripStatus.CHAT_STARTED}]}).
          select({_id: 1, agentEmail: 1, userEmail: 1}).exec(function (err, result) {
          if (!err)
            trips = result;
          callback(err);
      });
    },
    function (callback) {
      if (trips) {
        async.each(trips, function (trip, cback) {
            async.series([
              //for each trip get the user ids of user/agent
              function (callback) {
                  User.find({email: {$in: [trip.userEmail, trip.agentEmail]}}).select({_id: 1, email: 1, lastLogin: 1}).exec(
                    function (err, _userIds) {
                      userIds = _userIds;
                      callback(err);
                  });
              },
              function (callback) {
                //for each user create a notification if the unread msg count is > 0
                async.each(userIds, function (userId, innerCback) {
                    var notificationScheduledTime = new Date (now.getTime() +
                          (NOTIFICATION_INITIAL_DELAY * 1000));

                    //if user is not logged in LAST_LOGIN_OFFSET secs then send the alert right away
                    if (userId.lastLogin &&
                          userId.lastLogin.getTime() < (now.getTime() - (LAST_LOGIN_OFFSET * 1000))) {
                      notificationScheduledTime = new Date (now.getTime() +
                            (NOTIFICATION_DEFAULT_INITIAL_DELAY * 1000));
                    }

                    chatMessageService.getUnreadMessageCount(trip._id, userId._id, function (err, count) {
                        if (!err && count > 0) {
                          var newChatMsgNotification = {
                              chatId: trip._id,
                              userId: userId._id,
                              unreadMessageCount: count,
                              type: NewChatMsgNotificationType.EMAIL,
                              scheduledTime: notificationScheduledTime,
                          };
                          var activeEmailNotification;
                          var activeTextNotification;
                          async.parallel([
                              //create email notification
                              function (iicback) {
                                addOrUpdateNotification(newChatMsgNotification, iicback);
                              },
                              //create text notification
                              function (iicback) {
                                var nNewChatMsgNotification = JSON.parse(JSON.stringify(newChatMsgNotification));
                                nNewChatMsgNotification.type = NewChatMsgNotificationType.TEXT;
                                addOrUpdateNotification(newChatMsgNotification, iicback);
                              }
                          ], function (err, results) {
                            innerCback(err);
                          });
                        } else {
                          innerCback(err);
                        }
                    });
                }, function (err) {
                    if (err) {
                      logger.error("createNewChatMsgNotifications - Error while all users processed: " + err);
                    }
                    callback(err, null);
                });
              }
            ], function (err, results) {
                cback(err, results);
            });
        }, function (err) {
            callback(null);
        });
      } else {
        callback(null);
      }
    }
  ], function (err, results) {
      if (err) {
          logger.error("Error in createNewChatMsgNotifications: " + err);
      }
  });
}

function addOrUpdateNotification(notification, cback) {
  var activeNotification;
  async.series([
    function (callback) {
      NewChatMsgNotification.findOne({
          chatId: notification.chatId,
          userId: notification.userId,
          type: notification.type
        }).select({
          _id: 1,
          unreadMessageCount: 1
        }).exec(
          function(err, result){
            if(!err) {
              activeNotification = result;
            }
        });
    },
    function (callback) {

      //if we have more unread messages than last created notification then reset notification state and time
      if(activeNotification &&
          activeNotification.unreadMessageCount > notification.unreadMessageCount) {
        var updateObj = {
          state: NewChatMsgNotificationState.START,
          scheduledTime: notification.scheduledTime,
          unreadMessageCount: notification.unreadMessageCount
        };
        NewChatMsgNotification.update({
          _id: activeNotification._id
        }, updateObj, callback);
      } else {
        NewChatMsgNotification.save(notification, callback);
      }
    }
  ], function (err, result) {
    cback(err);
  });
}

//process existing notification queue
function processNewChatMsgNotifications () {
  //for all NewChatMsgNotifications with scheduledTime past due
  NewChatMsgNotification.find({ scheduledTime: {$lt: new Date()}, state: {$ne: NewChatMsgNotificationState.DEAD}},
    function (err, results) {
     //logger.info("Started processNewChatMsgNotifications at: " + new Date());
     if (!err) {
       //logger.info("NewChatMsgNotification results: " + JSON.stringify(results));
       if (results && results.length > 0) {
            async.each(results, function (newChatMsgNotification, cback) {
              notifications.sendNewChatMsgNotification (newChatMsgNotification, function (err, result) {
                cback (err, result);
              });
            }, function(err) {
                //log the error
                if (err)
                  logger.error ("Error in processNewChatMsgNotifications: " + err);
            });
        } else {
            //logger.info("Completed processNewChatMsgNotifications at: " + new Date());
        }
     } else {
       logger.error("Error in processNewChatMsgNotifications: " + err);
     }
  });
}

module.exports = {
    init: init,
    start: start,
    stop: stop,
    destroy: destroy,
    CRON_TASK_TYPE: CRON_TASK_TYPE
};
