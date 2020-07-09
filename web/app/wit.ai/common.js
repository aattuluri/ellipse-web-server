/*

Send messages to wit.ai

*/

var logger = require("../logger").logger;
var mb = require("./message_builder");
var async = require ("async");
var pub = require('redis-connection')();
var fs = require('fs');
var uuid = require ("uuid");
var request = require("request");
var emailUtils = require("../controllers/email-utils");
var textAlertUtils = require("../controllers/text-alert-utils");
var constants = require("../constants");

var Wit = require('node-wit').Wit;
var log = require('node-wit').log;

var fbCommon = require('../messenger/common');
var fbMessageBuilder = require('../messenger/message_builder');
var chatCommon = require('../livechat/common');

var WIT_APP_ID = "5778cdde-2c5c-4926-90d0-887ec92e4018";
var WIT_TOKEN = "54FLJZRBAVFCSJYKDTHQUWXF44LS2UNZ";

var Trip = require("../models/trip").Trip;
var User = require("../models/user").User;
var UserSource = User.SOURCE;

var wit = new Wit({
  accessToken: WIT_TOKEN,
  actions: {
    send: function (request, response) {
      var sessionId = request.sessionId;
      var text = response.text;
      //get recipientId from sessionId, hard coded for now
      return new Promise(
        function (resolve, reject) {
            var recipient;
            async.series ([
              function (callback) {
                getRecipientFromSessionId (sessionId, function (err, result) {
                  recipient = result;
                  callback (err, result);
                });
              },
              function (callback) {
                if (recipient) {
                  var fbId = recipient.thirdPartyId;
                  var _fbCommon = require('../messenger/common');
                  var _chatCommon = require('../livechat/common');
                  var _fbMessageBuilder = require('../messenger/message_builder');
                  _chatCommon.saveAndPublishMessage(_fbCommon.convertFBtoAA(recipient._id, "Avery", sessionId, { text: text}));
                  var quickreplies = response.quickreplies;
                  if (quickreplies && quickreplies.length > 0) {
                    var fbQuickreplies = [];
                    for (var i in quickreplies) {
                      fbQuickreplies.push(_fbMessageBuilder.getQuickReply('text', quickreplies[i], quickreplies[i]));
                    }
                    var fbQuickreplyMsg = _fbMessageBuilder
                        .getQuickRepliesMessage(fbId, text, fbQuickreplies);
                    _fbCommon.callSendAPI(fbQuickreplyMsg);
                  } else {
                    _fbCommon.callSendAPI(_fbMessageBuilder.getTextMessage(fbId, text));
                  }
                }
                callback ();
              }
            ], function (err, results) {
                if (err) reject (err);
                else resolve ();
            });
      });
    },

    //define custom actions here
    saveEntities: function (request) {
      logger.info ("saveEntities called with request: " + JSON.stringify(request));
      var entities = request.entities;
      var sessionId = request.sessionId;
      var currentContext;
      return new Promise (
        function (resolve, reject) {
          async.series([

          //get the current session
          function (callback) {
            pub.GET(sessionId, function (err, result) {
              currentContext = result;
              callback (err);
            });
          },

          //parse the current context
          function(callback) {
            if (!currentContext) {
              currentContext = {};
            } else {
              currentContext = JSON.parse(currentContext);
            }
            callback();
          }
        ], function(err, results) {

          //extract the entities and update context
          var newContext = currentContext;
          if (!err) {
            logger.info('calling saveContext with: ' + JSON.stringify(request));
            newContext = extractAndUpdateEntities(entities, currentContext);
            logger.info('new context: ' + JSON.stringify(newContext));
            pub.SET(sessionId, JSON.stringify(newContext));
          } else {
            logger.error ("Error in saveEntities: " + err);
          }

          resolve(newContext);

        });
      });
    },

    requestTravelExpert: function(request) {
      logger.info ("requestTravelExpert called with request: " + JSON.stringify(request));
      return new Promise(
        function(resolve, reject) {
          var admin;
          var recipient;
          var sessionId = request.sessionId;
          async.series([
              function(callback) {

                // clear context
                pub.DEL(sessionId);
                callback();
              },
              function(callback) {
                getRecipientFromSessionId(sessionId, function (err, result) {
                  recipient = result;
                  callback(err, result);
                });
              },
              function(callback) {

                //hack for now, only one admin
                User.findOne({ type: User.TYPE.ADMIN}).select({ email:1, phone: 1}).exec(function(err, result) {
                  admin = result;
                  callback(err, result);
                });
              },
              function(callback) {
                if (admin) {
                  emailUtils.sendRequestTravelExpertEmailAlert([admin.email], { userName: recipient.firstName}, callback);
                } else {
                  callback();
                }
              },
              function(callback) {
                if (admin && admin.phone && admin.phone.mobile) {
                  textAlertUtils.sendRequestTravelExpertTextAlert([admin.phone.mobile], { userName: recipient.firstName}, function(err, result) {
                    if (err) {
                      logger.error ("Failed to send admin notification text alert for RequestTravelExpert");
                    }
                    callback();
                  });
                } else {
                  callback();
                }
              }],
            function(err, results) {
              if (!err) {
                resolve({});
              } else {
                reject(err);
              }
          });
        }
      );
    },

    notifySupport: function (request) {
      logger.info ("notifySupport called with request: " + JSON.stringify(request));
      var sessionId = request.sessionId;
      return new Promise(
        function(resolve, reject) {
          var results;
          async.series([
              function (callback) {
                pub.GET(sessionId, function(err, result) {
                  if (!err && result) {
                    var context = JSON.parse (result);
                    context.done = true;
                    pub.SET(sessionId, JSON.stringify(context));
                  }
                  callback();
                });
              },
              function(callback) {

                //TODO (anil) get trip details from sessionId
                callback();
              },
              function(callback) {

                //TODO (anil) get user details
                callback();
              },
              function(callback) {

                //TODO (anil) send notifications
                callback();
              }],
            function(err, results) {
              if (!err) {
                resolve({});
              } else {
                reject(err);
              }
          });
        }
      );
    },

    findOptions: function (request) {
      logger.info ("findOptions called with request: " + JSON.stringify(request));
      return new Promise (
        function (resolve, reject) {
          var results;
          var recipient;
          var sessionId = request.sessionId;
          async.series([

              //mark this context as done
              function(callback) {
                pub.GET(sessionId, function(err, result) {
                  if (!err && result) {
                    var context = JSON.parse (result);
                    context.done = true;
                    pub.SET(sessionId, JSON.stringify(context));
                  }
                  callback();
                });
              },
              function (callback) {
                getRecipientFromSessionId(sessionId, function (err, result) {
                  recipient = result;
                  callback(err, result);
                });
              },
              function(callback) {

                //sending typing_on action to indicate progress for user
                if (recipient) {
                  var fbMsg = require('../messenger/message_builder').getTypingOnMessage(recipient.thirdPartyId);
                  require('../messenger/common').callSendAPI(fbMsg);
                }
                callback();
              },
              function(callback) {

                //TODO (ivan) call cruise APIs
                callback();
              },
              function(callback) {

                //TODO (ivan) send generic message with search results
                callback();
              }],
            function(err, results) {
              if (!err) {
                resolve({});
              } else {
                reject(err);
              }
          });
        }
      );
    },

    deadEnd: function(request) {
      logger.info ("deadEnd called with request: " + JSON.stringify(request));
      return new Promise(
        function(resolve, reject) {
          var recipient;
          var sessionId = request.sessionId;
          async.series([
              function(callback) {
                pub.DEL(sessionId);
                callback();
              },
              function(callback) {
                getRecipientFromSessionId(sessionId, function (err, result) {
                  recipient = result;
                  callback(err, result);
                });
              },
              function(callback) {
                if (recipient) {
                  require('../messenger/common').sendGreetingMessage(recipient.thirdPartyId);
                }
                callback();
              }],
            function(err, results) {
              if (!err) {
                resolve({});
              } else {
                reject(err);
              }
          });
        }
      );
    }
  },
  logger: new log.Logger(log.DEBUG)
});

function extractAndUpdateEntities(entities, context) {

  //delete greetings and end of chats from previous chat message to not get stuck in greeting stage
  context = deleteOneTimeKeys(context);
  context = parseGreeting(entities, context);
  context = parseEnd(entities, context);
  context = parseRequestType(entities, context);
  context = parseLocation(entities, context);
  context = parseDatetime(entities, context);
  context = parseTimePeriod(entities, context);
  context = parseTimeOfDay(entities, context);
  context = parseOccasion(entities, context);

  //if we don't have valuable entities then declare as garbage
  context = checkAndMarkContextAsGarbage(context);
  console.log("Updated context: " + JSON.stringify(context));
  return context;
}

function parseGreeting(entities, context) {
  var greeting = entities.greeting;
  if (greeting && greeting.length > 0) {
    context.greeting = greeting[0].value;
  }
  return context;
}

function parseEnd(entities, context) {
  var end = entities.end;
  if (end && end.length > 0) {
    context.end = end[0].value;
  }
  return context;
}

function parseTimePeriod(entities, context) {
  var time_period = entities.time_period;
  if (time_period && time_period.length > 0) {
    context.time_period = time_period[0].value;
  }
  return context;
}

function parseTimeOfDay(entities, context) {
  var time_of_day = entities.time_of_day;
  if (time_of_day && time_of_day.length > 0) {
    context.time_of_day = time_of_day[0].value;
  }
  return context;
}

function parseOccasion(entities, context) {
  var occasion = entities.occasion;
  if (occasion && occasion.length > 0) {
    context.occasion = occasion[0].value;
  }
  return context;
}

function parseRequestType(entities, context) {
  var request_type = entities.request_type;
  if (request_type && request_type.length > 0) {

    //clear other request types
    context = clearRequestTypes(context);
    context[request_type[0].value] = request_type[0].value;
  }
  return context;
}

function parseLocation(entities, context) {
  var location = entities.location;
  if (location && location.length > 0) {
    if (!context.destination || (context.destination && context.origin)) {
      context.destination = location[0].value;
    } else {
      context.origin = location[0].value;
    }
  }
  return context;
}

function parseDatetime(entities, context) {
  var datetime = entities.datetime;
  if (datetime && datetime.length > 0) {
    if (datetime[0].value) {
      context.from = datetime[0].value;
      context.fromGrain = datetime[0].grain;
    }
    if (datetime[0].from) {
      context.from = datetime[0].from.value;
      context.fromGrain = datetime[0].from.grain;
    }
    if (datetime[0].to) {
      context.to = datetime[0].to.value;
      context.toGrain = datetime[0].to.grain;
    }
  }
  return context;
}

function checkAndMarkContextAsGarbage(context) {
  if (!context.done && !context.greeting && !context.end &&
        !context.cruises && !context.agents && !context.activities &&
          !context.destination && !context.from && !context.to) {
    context.garbage = true;
  }
  return context;
}

function deleteOneTimeKeys(context) {
  delete context.greeting;
  delete context.end;
  delete context.garbage;
  return context;
}

function clearRequestTypes(context) {
  delete context.cruises;
  delete context.agents;
  delete context.activities;
  return context;
}

function getRecipientFromSessionId (sessionId, cback) {
  var trip;
  var recipient;
  async.series ([
    function (callback) {
      Trip.findOne({_id: sessionId}).select({userId: 1}).exec(function (err, result) {
        if (err) {
          logger.error ("Failed to find a trip from wit.ai session id: " + err);
        }
        trip = result;
        callback (err);
      });
    },
    function (callback) {
      if (trip) {
        User.findOne({_id: trip.userId}).select({_id: 1, thirdPartyId: 1}).exec(function (err, result) {
          if (result) {
            recipient = result;
          }
          callback (err);
        });
      } else {
        callback ('No trip found from wit.ai session id.');
      }
    }
  ], function (err, results) {
      if (err) {
        logger.error ("Failed to find FB userId from wit.ai session id: " + err);
        throw err;
      }
      cback (err, recipient);
  });
}

//invoked when a text is received from fb messenger
function runActions (sessionId, text, context, cback) {
  logger.info('Running actions with: ' + JSON.stringify({sessionId:sessionId, text: text, context: context}));
  wit.runActions(
    sessionId,
    text,
    context
  ).then(function (context) {
    // Our bot did everything it has to do.
    // Now it's waiting for further messages to proceed.
    logger.info('All bot actions done, current context: ' + JSON.stringify(context));

    if (context.origin && context.destination && context.from && context.to) {
      //TODO (anil) account for special cases like time_period time_of_day etc. to adjust from/to
      //TODO (anil) invoke cruise API
      console.log("Invoke cruise API here");
    }

    cback (null, context);
  })
  .catch(function (err) {
    logger.error ('Oops! Got an error from Wit: ', err.stack || err);
    cback ('Got an error from Wit');
  });
}

module.exports = {
  runActions: runActions
};
