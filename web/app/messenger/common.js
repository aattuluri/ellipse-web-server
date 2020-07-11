/*

i) Send messages to facebook messageer
ii) Transform messages to/from Agent Avery chat message format
iii) Handling the wit.ai stories

*/

var logger = require("../logger").logger;
var config = require('../config');
var chatMessageService = require("../livechat/chat_message_service");
var mb = require("./message_builder");
var async = require ("async");
var fs = require('fs');
var uuid = require ("uuid");
var boom = require ("boom");
var request = require("request");
var trips = require('../controllers/trips');
var Trip = require("../models/trip").Trip;
var TripMode = Trip.MODE;
var users = require('../controllers/users');
var User = require("../models/user").User;
var TripPayment = require("../models/trip-payment").TripPayment;
var UserSource = User.SOURCE;
var constants = require("../constants");

var chatCommon = require('../livechat/common');
var witAiCommon = require('../wit.ai/common');

const FB_API_URL = config.get('messenger:appUrl');
const APP_ID = config.get('messenger:appId');
const APP_SECRET = config.get('messenger:appSecret');
const PAGE_ACCESS_TOKEN = config.get('messenger:pageAccessToken');

//fb message templates
var PERSISTENT_MENU = JSON.parse(fs.readFileSync(__dirname + '/../views/messenger/persistent_menu.json', 'utf8'));

var GREETING = JSON.parse(fs.readFileSync(__dirname + '/../views/messenger/greeting.json', 'utf8'));
var ITINERARY = JSON.parse(fs.readFileSync(__dirname + '/../views/messenger/itinerary.json', 'utf8'));

var SEARCH = 'search';
var HELP = 'help';

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */

function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    logger.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference#auth
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger'
  // plugin.
  var passThroughParam = event.optin.ref;

  logger.info("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam,
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  callSendAPI(mb.getTextMessage(senderID, "Authentication successful"));
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. Read
 * more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#postback
 *
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  logger.info("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful

  //convert postback to text message
  event.message = { text: payload};
  receivedMessage (event);

}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message'
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#received_message
 *
 * For this example, we're going to echo any text that we get. If we get some
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've
 * created. If we receive a message with an attachment (image, video, audio),
 * then we'll simply confirm that we've received the attachment.
 *
 */
function receivedMessage(event) {

  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  //skip this message if it was echoed and sent by this app
  if (senderID === APP_ID) {
    return;
  }

  var messageText = message.text;
  var messageAttachments = message.attachments;

  logger.info("Received message for user %d and page %d:",
    senderID, recipientID);

  var trip;
  var user;

  var isNewUser = false;

  async.series ([
    // find the user
    function (callback) {
      createUserIfNotExists (senderID, function (err, result) {
        if (!err) {
          isNewUser = result.isNewUser;
          user = result.user;
        }
        callback (err);
      });
    },
    // find a trip by senderID aka userid
    function (callback) {
      if (!user) {
        callback ("FB user not found or created!");
      } else {
        Trip.findOne ({userId: user._id}).select({_id: 1, mode: 1, agentId: 1, witAiContext: 1, aaContext: 1})
            .exec(function (err, result) {
           if (!err) {
             trip = result;
           }
           callback (err);
        });
      }
    },

    //create the trip if it doesn't exists
    function (callback) {
      if (!trip) {
        Trip.save({
          userId: user._id,
          userName: user.firstName,
          status: trips.Trip.STATUS.CREATED,
          mode: TripMode.BOT
        }, function (err, result) {
          if (!err) {
            trip = result;
          }
          callback (err);
        });
      } else {
        callback ();
      }
    },

    //send the message to wit.ai, if the trip is in BOT mode
    function (callback) {
      if (user && trip && (!trip.mode ||
            trip.mode === TripMode.BOT)) {
        logger.info("Sending message to Wit.Ai");
        witAiCommon.runActions (trip._id, messageText, trip.witAiContext, function (err, result) {
            callback (err);
        });
      } else {
        callback ();
      }
    },

    //save and publish the FB message
    function (callback) {
      if (user && trip) {
        const aaMessage = convertFBtoAA(
          user._id,
          user.firstName,
          trip._id,
          message
        );
        chatCommon.saveAndPublishMessage(aaMessage);
      }
      callback ();
    },

    //send agent't OOO message if agent has been assgined to this chat and he/she is not available right now
    function (callback) {
      var now = Date.now();
      if (trip.agentId && trip.mode === TripMode.HUMAN) {
        tryAndSendAgentOOOMessage(senderID, trip, function (err, result) {
          callback(err);
        });
      } else {
        callback();
      }
    }
  ], function (err, result) {
    if (isNewUser) {
      sendGreetingMessage(senderID);
    } else if (messageAttachments) {
      callSendAPI(mb.getTextMessage(senderID, "Sorry, I am not yet able to parse attachments!"));
    }
  });

}

function tryAndSendAgentOOOMessage(fbUserId, trip, cback) {
  //set defaults
  var proceed = false;
  var agentAvailability = {
    available: true,
    message: constants.DEFAULT_AGENT_OOO_MESSAGE
  };
  var agentLastOOOMsgTime;
  async.series([

    //check if similar message was sent in last x mins
    function (callback) {
      var aaContext = trip.aaContext;
      var epochIntervalBackInTime = (Date.now() - constants.AGENT_OOO_MSG_INTERVAL);
      if (!aaContext || !aaContext.agentLastOOOMsgTime ||
        aaContext.agentLastOOOMsgTime < epochIntervalBackInTime) {
          proceed = true;
      }
      callback();
    },

    //check agent's availability
    function (callback) {
      if (proceed) {
        User.checkAgentAvailability(trip.agentId, function (err, result) {
          if (!err && result) {
            agentAvailability = result;
          }
          callback(err);
        });
      } else {
        callback();
      }
    },

    //send agent's OOO message if required
    function (callback) {
      if (!agentAvailability.available) {
        agentLastOOOMsgTime = Date.now();

        //faking message as AA chat msg and calling convertAAtoFB to get agent's name prefix for this message
        convertAAtoFB(fbUserId, {
              c: trip._id,
              uid: trip.agentId,
              m: agentAvailability.message
            }, function (err, result) {
          if (!err) {
            callSendAPI(result);
          }
          callback(err);
        });
      } else {
        callback();
      }
    },

    //update aacontext on trip with last sent agent's OOO message to prevent spam
    function (callback) {
      if (agentLastOOOMsgTime) {
        var aaContext = trip.aaContext;

        //account for old trips with null aaContext
        if (!aaContext) {
          aaContext = {};
        }
        aaContext.agentLastOOOMsgTime = agentLastOOOMsgTime;
        Trip.update({_id: trip._id}, {aaContext: aaContext}, function (err, result) {
          callback(err);
        });
      } else {
        callback();
      }
    }
  ], function (err, result) {
    if (err)
      logger.error(err);
    cback(err);
  });
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference#message_delivery
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      logger.info("Received delivery confirmation for message ID: %s",
        messageID);
    });
  }

  logger.info("All message before %d were delivered.", watermark);
}

function callSendAPI(messageData) {
  request({
    uri: FB_API_URL + '/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;
      return {
        recipientId: body.recipient_id,
        messageId: body.message_id
      };
    } else {
      logger.error("Unable to send message to USER_ID: " + messageData.recipient.id, error);
      return {
        error: "Unable to send message to USER_ID: " + messageData.recipient.id
      };
    }
  });
}

function createUserIfNotExists(fbUserId, cback) {
  var user;
  var isNewUser = false;
  async.series([
    //find user by fb id
    function (callback) {
      User.findOne ({thirdPartyId: fbUserId, source: UserSource.FACEBOOK})
        .select({_id: 1, firstName: 1})
        .exec(function (err, result) {
          if (!err) {
            user = result;
          }
          callback (err);
      });
    },
    //get fb profile information
    function (callback) {
      if (!user) {
        request({
          uri: FB_API_URL + '/' + fbUserId,
          qs: { fields: 'first_name,last_name', access_token: PAGE_ACCESS_TOKEN },
          method: 'GET'
        }, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            var fbUserProfile = JSON.parse(body);
            logger.info(JSON.stringify(fbUserProfile));
            logger.info(fbUserProfile.profile_pic);
            user = {
              thirdPartyId: fbUserId,
              firstName: fbUserProfile.first_name,
              lastName: fbUserProfile.last_name,
              source: UserSource.FACEBOOK
            };
          } else {
            logger.error(response);
            logger.error(error);
          }
          callback ();
        });
      } else {
        callback ();
      }
    },
    //create user if new
    function (callback) {
      if (user && !user._id) {
          isNewUser = true;
          logger.info ("Creating new user account for fb user id: " + user);
          User.save (user, function (err, result) {
              if (err) {
                logger.error ("Failed to create a user from facebook!");
              } else {
                user = result;
              }
              callback (err);
          });
      } else {
        callback ();
      }
    }
  ], function (err, results) {
    if (err) {
      logger.error ("Error in createUserIfNotExists: " + err);
    }
    cback (err, {isNewUser: isNewUser, user: user});
  });

}

function setPersistentMenu () {
  request({
    uri: FB_API_URL + '/me/thread_settings',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: PERSISTENT_MENU
  }, function (error, response, body) {
    if (!error &&
        response.statusCode === 200) {
      logger.info("Successfully set fb messenger persistent menu.");
    } else {
      logger.error("Failed to set fb messenger persistent menu.");
      logger.error(response);
      logger.error(error);
    }
  });
}

function sendGreetingMessage(recipientId) {
  var greetingCard = JSON.parse(JSON.stringify(GREETING));
  var messageData = mb.getGenericTemplate (recipientId, [greetingCard]);
  callSendAPI(messageData);
}

function sendItineraryMessage(recipientId, tripId) {
  var itineraryCard = JSON.parse(JSON.stringify(ITINERARY));
  itineraryCard.buttons[0].url = constants.BASEURL + "/trip/" + tripId + "/itinerary/download";
  itineraryCard.buttons[1].url = constants.BASEURL + "/trip/" + tripId + "/share";
  var messageData = mb.getGenericTemplate (recipientId, [itineraryCard]);
  callSendAPI(messageData);
}

function handlePostbacks (recepientId, payload) {

  var allActions = payload.split ('.');
  var category = allActions[0];
  var action = allActions[1];
  if (category === SEARCH) {
    handleSearchInit (recepientId, category);
  } else if (category === HELP) {
    handleHelp (recepientId, category);
  } else {
    callSendAPI (mb.getTextMessage (recepientId, 'This is not supported!'));
  }

}

function handleSearchInit (recepientId, action) {

  var msg = 'Where are you going?';
  if (action === 'cruises') {
    msg = 'Where are you going?';
  } else if (action === 'activities') {
    msg = 'What do you want to do?';
  } else if (action === 'experts') {
    msg = 'What speciality are you looking for?';
  }

  callSendAPI (mb.getTextMessage (recepientId, msg));

  //TODO start wit.ai story

}

function handleHelp (recepientId, action) {

  var msg = 'Sure, I can help you!';
  if (action === 'talktosupport') {
    msg = 'Glad to help you, a support assistant will be with you shortly!';
  }
  callSendAPI (mb.getTextMessage (recepientId, msg));

}

//transforms and sends AA text/attachment messages into facebook messenger text/generic messages

function sendAAMessage (msg, cback) {

  logger.info("sendAAMessage: " +
    JSON.stringify(msg));

  //transform AA text/attachment messages into facebook messenger text/generic messages
  var trip;
  var user;
  async.series([
      //find trip
      function (callback) {
        logger.info("UserSource: ", UserSource);
        Trip.findOne({_id: msg.c}).select({userId: 1}).exec(function (err, result) {
            if (!err) {
              trip = result;
            }
            callback ();
        });
      },
      //find user
      function (callback) {
        if (trip) {
          User.findOne({_id: trip.userId}).select({thirdPartyId: 1, source: UserSource.FACEBOOK}).exec(function (err, result) {
              if (!err) {
                user = result;
              }
              callback ();
          });
        } else {
          callback ();
        }
      },
      //send FB message if its a FB user
      function (callback) {
        //send msg to fb messenger, if this is a fb user
        if (user && user.thirdPartyId &&
          user.source === UserSource.FACEBOOK) {
            var fbUserId = user.thirdPartyId;
            convertAAtoFB(fbUserId, msg, function (err, fbMsg) {
              if (fbMsg) {
                callSendAPI(fbMsg);
              }
              callback(err);
            });
        } else {
          logger.info("Ignored as this is not an FB user's message: " +
            JSON.stringify(user));
          callback ();
        }
      }
  ], function (err, result) {
    cback (err);
  });

}

function convertAAtoFB (fbUserId, msg, cback) {
  var fbMsg;
  var msgPrefix = "";
  async.series ([
    function (callback) {
      User.findOne({_id: msg.uid}).select({firstName: 1}).exec(function (err, result) {
        if (!err) {
          msgPrefix = result.firstName + ": ";
        }
        callback(err);
      });
    },
    function (callback) {
      if (msg.m) {
        fbMsg = mb.getTextMessage (fbUserId, msgPrefix + msg.m);
      } else if (msg.f) {
        //add generic message with file attachments
        var files = msg.f;
        if (files.length > 1) {
          //send horizontally scrollable message for multiple images in the same message
          var elements = [];
          for (var i=0; i < files.length; i++) {
            var file = files[i];
            //right now support only multiple images at one go
            if (file.ty === 0) {
              elements.push ({
                title: (!file.title)? '' : file.title,
                image_url: constants.BASEURL + '/file/' + file.id
              });
            }
          }
          fbMsg = mb.getGenericTemplate (fbUserId, elements);
        } else {
          var tFile = files[0];
          //send a image attachment/pdf file
          var filePath = constants.BASEURL + '/file/' + tFile.id;
          if (tFile.ty === 0) {
            fbMsg = mb.getImageMessage (fbUserId, filePath);
          } else {
            fbMsg = mb.getFileMessage (fbUserId, filePath);
          }
        }
      } else if (msg.p) {
        //add generic message for agent's fee charges
        var paymentFee = msg.p;
        var amount = paymentFee.a;
        var type = TripPayment.getFeeTypeAsString(paymentFee.type);
        if (amount && type && type !== "") {
          var textMessage = msgPrefix + type + ' fee: $' + amount;
          fbMsg = mb.getTextMessage (fbUserId, textMessage);
        } else {
          fbMsg = mb.getTextMessage (fbUserId, 'Fee generated!');
        }
      } else {
        fbMsg = mb.getTextMessage (fbUserId, 'Unsupported message!');
      }
      callback();
    }
  ], function (err, result) {
    cback(err, fbMsg);
  });

}

function convertFBtoAA (uid, userName, chatId, msg) {
  //TODO, parse non text messages
  return {
    c: chatId,
    uid: uid,
    m: msg.text,
    u: userName,
  };
}

module.exports = {
  convertAAtoFB: convertAAtoFB,
  convertFBtoAA: convertFBtoAA,
  callSendAPI: callSendAPI,
  setPersistentMenu: setPersistentMenu,
  receivedAuthentication: receivedAuthentication,
  receivedMessage: receivedMessage,
  receivedDeliveryConfirmation: receivedDeliveryConfirmation,
  receivedPostback: receivedPostback,
  sendAAMessage: sendAAMessage,
  sendItineraryMessage: sendItineraryMessage,
  sendGreetingMessage: sendGreetingMessage,
  createUserIfNotExists: createUserIfNotExists
};
