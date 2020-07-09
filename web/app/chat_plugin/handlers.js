var chatMessageService = require("../livechat/chat_message_service");
var users = require("../controllers/users");
var trips = require("../controllers/trips");
var thirdPartyWebsites = require("../controllers/third-party-websites");
var logger = require("../logger").logger;
var async = require ("async");
var uuid = require ("uuid");
var boom = require ("boom");
var constants = require("../constants");

//common util functions
function replySuccess (reply) {
  reply({success: true}).type(constants.JSON);
}

function replyFailed (reply, message) {
  var response = {success: false};
  if (message) {
    response.message = message;
  }
  reply(response).type(constants.JSON);
}

function createPluginUser (request, reply) {
  var notAuthorized = false;
  var user;
  var trip;
  var thirdPartyWebsite;
  var apiKey = request.headers.apikey;
  var origin = request.headers.origin;
  var response = {};
  async.series([
      //get 3rd party website details from the api key
      function (callback) {
        thirdPartyWebsites.getByApiKeyAndOrigin (apiKey, origin, function (err, result) {
            if (!err) {
              thirdPartyWebsite = result;
            }
            callback (err);
        });
      },
      //create a user (if one doesn't exist) and
      // send an email with temporary password
      function (callback) {
        if (thirdPartyWebsite) {
          var newUser = {
            email: request.payload.email,
            firstName: request.payload.firstName,
            lastName: request.payload.lastName
          };
          users.createBasicUser (newUser, thirdPartyWebsite,
                function (err, result) {
              if (!err) {
                user = result;
                response.userId = result._id;
              }
              callback (err);
          });
        } else {
          notAuthorized = true;
          callback ("Invalid API Key!");
        }
      },
      //find if there is a chat already in created state, if so return that id
      function (callback) {
        if (user) {
          trips.findOngoingByUserAndThirdPartyWebsite (user.email, thirdPartyWebsite._id,
                  function (err, result) {
              if (!err && result) {
                trip = result;
                response.chatId = result._id;
              }
              callback (err);
          }, false);
        } else {
          callback ();
        }
      },
      //create a new chat if required
      function (callback) {
        if (user && !trip) {
          var newTrip = {
            userId: user._id,
            userEmail: user.email,
            userName: user.firstName + " " + user.lastName,
            thirdPartyWebsite: thirdPartyWebsite._id,
            status: trips.Trip.STATUS.CREATED,
            agentIntroText: thirdPartyWebsite.welcomeMessage
          };
          trips.createTripForUserFromPlugin (newTrip, thirdPartyWebsite,
                  function (err, result) {
              if (!err) {
                trip = result;
                response.chatId = result._id;
              }
              callback (err);
          }, false);
        } else {
          callback (null);
        }
      }
  ], function (err, results) {
    if (!err && response && response.chatId) {
      response.success = true;
      reply(response).type(constants.JSON);
    } else {
      if (notAuthorized === true) {
        reply(boom.unauthorized());
      } else {
        reply(boom.badImplementation());
      }
    }
  });
}

function loadPluginChat (request, reply) {
  var thirdPartyWebsite;
  var chatId = request.params.chatid;
  var apiKey = request.headers.apikey;
  var origin = request.headers.origin;
  console.log(origin);
  //make sure that API key + origin are authorized for this chat
  async.series([
      //get 3rd party website details from the api key
      function (callback) {
        isValidApiKeyAndOrigin (apiKey, origin, function (err, result) {
            if (!err) {
              thirdPartyWebsite = result;
            }
            callback (err);
        });
      },
      function (callback) {
        isAuthorizedForChat (thirdPartyWebsite._id, chatId, function (err, result) {
            callback (err);
        });
      }
  ], function (err, results) {
    if (!err) {
      chatMessageService.loadChat(request, reply);
    } else {
      reply(boom.unauthorized());
    }
  });
}

//
// function endPluginChat (request, reply) {
//   var thirdPartyWebsite;
//   var chatId = request.params.chatid;
//   var apiKey = request.headers.apikey;
//   var origin = request.headers.origin;
//   console.log(origin);
//   async.series([
//     function (callback) {
//       isValidApiKeyAndOrigin (apiKey, origin, function (err, result) {
//           if (!err) {
//             thirdPartyWebsite = result;
//           }
//           callback (err);
//       });
//     },
//     function (callback) {
//       isAuthorizedForChat (thirdPartyWebsite._id, chatId, function (err, result) {
//           callback (err, result);
//       });
//     }
//   ], function (err, result) {
//     if (!err) {
//       trips.endChat (chatId, function (err, result) {
//         if (!err) {
//           replySuccess (reply);
//         } else {
//           reply(boom.badImplementation());
//         }
//       });
//     } else {
//       reply(boom.unauthorized());
//     }
//   });
// }

function isValidApiKeyAndOrigin (apiKey, origin, cback) {
  thirdPartyWebsites.getByApiKeyAndOrigin (apiKey, origin, function (err, result) {
      if (!err && result) {
        cback (null, result);
      } else {
        cback ("Not authorized.");
      }
  });
}

function isAuthorizedForChat (thirdPartyWebsiteId, chatId, cback) {
  trips.validateByThirdPartyWebsiteAndId (thirdPartyWebsiteId, chatId,
    function (err, result) {
      if (!err && result) {
        cback (null, result);
      } else {
        cback ("Not authorized.");
      }
  });
}

module.exports = {
  createPluginUser: createPluginUser,
  loadPluginChat: loadPluginChat//,
  //endPluginChat: endPluginChat
};
