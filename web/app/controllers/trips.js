var _ = require('lodash');
var async = require('async');
var logger = require("../logger").logger;
var sendgrid = require("./sendgrid");
var MongoTypes = require('mongoose').Types;
var emailUtils = require("./email-utils");
var textAlertUtils = require("./text-alert-utils");
var utils = require("../utils");
var constants = require("../constants");
var Trip = require("../models/trip").Trip;
var TripParticipant = require("../models/trip-participant").TripParticipant;
var User = require("../models/user").User;
var InitialTripDetails = require("../models/initial-trip-details").InitialTripDetails;
var ThirdPartyWebsite = require("../models/third-party-website").ThirdPartyWebsite;

//export these for any possible circular dependencies issues

exports.Trip = Trip;
exports.TripParticipant = TripParticipant;

var chatMessageService = require("../livechat/chat_message_service");
var fbCommon = require("../messenger/common");

var TripStatus = Trip.STATUS;
var TripParticipantRole = TripParticipant.ROLE;
var TripParticipantPermission = TripParticipant.PERMISSION;
var UserSource = User.SOURCE;

exports.getActiveFacebookTrips = function (done) {
  async.seq(

    // Find all FB users.
    function (data, cb) {
      User.find({
        type: User.TYPE.TRAVELER,
        source: User.SOURCE.FACEBOOK,
      }, cb);
    },

    // For each FB user, find a trip which doesn't have an agent assigned.
    function (users, cb) {
      async.map(users, function (user, cb) {
        Trip.findOne({
          userId: user._id,
          status: { $nin: [Trip.STATUS.ENDED, Trip.STATUS.DECLINED, Trip.STATUS.COMPLETED] },
        }, function (err, trip) {
          cb(null, err ? null : _.assign(trip, { user: user }));
        });
      }, cb);
    },

    // Filter out assigned trips.
    function (trips, cb) {
       cb(null, _.filter(trips));
    }
  )(null, done);
};

exports.createTrip = function (trip, cb, doNotSendEmail) {
  async.series([
		//save the trip
    function(callback) {
        Trip.save(trip, function (err, result) {
            callback(err, result);
        });
		},
    //send a notification to the agent
    function(callback) {
      //TBD: Remove the below email check, this is to handle jobs for which we manually assign
      // the agents, this should never be the case once we automatically pick the agent when we
      //create a job
      if (trip.agentEmail && !doNotSendEmail) {
        var html = utils.format(sendgrid.templates.notification_agent_new_job, trip.agentName, trip.userName);
        sendgrid.sendEmail("no-reply@agentavery.com", [trip.agentEmail], "AgentAvery Notification - New Job Created", html, function (err, result) {
            callback(err, result);
        });
      } else {
        callback(null, null);
      }
		}
	], function (err, results) {
      if (!err)
        console.log("Trip created!");
      else
        console.log("Failed to create the trip! " + err);
		  cb (err, results);
	});
};

exports.createTripForUserFromPlugin = function (trip, thirdPartyWebsite,
    cb, doNotSendEmail) {
  var newTrip;
  var affiliatedAgents;
  async.series([
		//save the trip
    function(callback) {
        Trip.save(trip, function (err, result) {
            newTrip = result;
            callback(err);
        });
		},
    function(callback) {
      User.find({type: User.TYPE.AGENT, thirdPartyWebsites: thirdPartyWebsite._id},
        function (err, results) {
          if (!err && results && results.length > 0) {
            affiliatedAgents = results;
          }
          callback (null);
      });
    },
    //send a notification to the agent
    function(callback) {
      //TBD: Remove the below email check, this is to handle jobs for which we manually assign
      // the agents, this should never be the case once we automatically pick the agent when we
      //create a job
      if (affiliatedAgents && !doNotSendEmail) {
        async.each(affiliatedAgents, function (aa, cback) {
          var html = utils.format(sendgrid.templates.notification_agent_new_job, aa.firstName, trip.userName);
          sendgrid.sendEmail("no-reply@agentavery.com", [aa.email], "AgentAvery Notification - New Chat", html, function (err, result) {
              cback(err);
          });
        }, function (err, result) {
          callback (null);
        });
      } else {
        callback(null);
      }
		}
	], function (err, results) {
      if (err)
        console.log("Failed to create the trip! " + err);
		  cb (err, newTrip);
	});
};

function getNumActiveChats (initialTripDetailsId, cb) {
  Trip.find ({initialTripDetailsId: initialTripDetailsId,
      $or: [{status: TripStatus.CHAT_INITIATED},
        {status: TripStatus.CHAT_STARTED}, {status: TripStatus.COMPLETED}]}, function (err, results) {
    if (!err) {
      return cb (err, results.length);
    }
    cb (err, null);
  });
}

exports.getNumActiveChats = getNumActiveChats;

exports.startTripChat = function (email, id, introText, cb) {
  var isInitiatedFromPlugin = false;
  var trip;
  var user;
  var agent;
  var origTripStatus;

  async.series([
    // Find the chat by id.
    function(callback) {
      Trip.find({_id: id}, function (err, results) {
        if (!err && results && results.length === 0) {
          err = "Not found";
        }

        if (!err) {
          trip = results[0];
          origTripStatus = trip.status;
        }

        callback(err, null);
      });
    },

    // Validate the trip by agentEmail or thirdPartyWebsite.
    function(callback) {
      if (trip) {
        if (trip.agentEmail && trip.agentEmail === email) {
          User.findOne({email: email, type: User.TYPE.AGENT})
            .select({_id: 1, email: 1, firstName: 1})
            .exec(function (err, result) {
              if (!err && result) {
                agent = result;
              }

              callback();
            });
        } else if (trip.thirdPartyWebsite) {
          User.findOne({
            email: email,
            type: User.TYPE.AGENT,
            thirdPartyWebsites: trip.thirdPartyWebsite,
          })
            .select({_id: 1, email: 1, firstName: 1})
            .exec(function (err, result) {
              if (!err && result) {
                isInitiatedFromPlugin = true;
                agent = result;
                callback();
              } else {
                callback('Not found');
              }
            });
        } else {
          callback('Not found');
        }
      } else {
        callback(null);
      }
    },

    // Update the trip.
    function(callback) {
      var updateObj = {};
      updateObj.status = Trip.STATUS.CHAT_INITIATED;

      // Assign the agent if the chat was initiated from the plugin and put it
      // chat_started since it has already started from user's side.
      if (isInitiatedFromPlugin) {
        updateObj.status = Trip.STATUS.CHAT_STARTED;
        updateObj.agentId = agent._id;
        updateObj.agentEmail = agent.email;
        updateObj.agentName = agent.firstName;
      }

      if (introText && introText !== '') {
        updateObj.agentIntroText = introText;
      }

      Trip.update({
        _id: id,
        status: Trip.STATUS.CREATED,
      }, updateObj, function (err, numAffected) {
        // Update the local object if there was no error.
        if (!err && numAffected > 0) {
          trip.status = updateObj.status;
        }

        callback(err, null);
      });
    },

    // Add introText as the first chat message.
    function(callback) {
      if (introText && introText !== '' && origTripStatus == TripStatus.CREATED) {
        var newMsg = {
          c: id,
          t: new Date().getTime(),
          u: trip.agentName,
          uid: agent._id,
          m: introText,
        };
        chatMessageService.addChatMessage(id, JSON.stringify(newMsg));
      }

      callback();
    },

    // Check currently active chats, if there are 2 or more then suspend all other jobs.
    function(callback) {
      // Skip if chat was InitiatedFromPlugin.
      if (isInitiatedFromPlugin) {
        return callback();
      }

      if (trip && origTripStatus == TripStatus.CREATED) {
        getNumActiveChats(trip.initialTripDetailsId, function (err, count) {
          console.log("Num active chats: " + count);
          if (!err && count >= constants.MAX_CONCURRENT_TRIP_CHATS) {
            console.log("Num active chats >= " + constants.MAX_CONCURRENT_TRIP_CHATS);
            Trip.update({
              initialTripDetailsId: trip.initialTripDetailsId,
              status: TripStatus.CREATED,
            }, {
              status: TripStatus.SUSPENDED,
            }, {
              multi: true
            }, function (err, result) {
              console.log('Jobs marked as suspended: ' + result);
              callback(err, result);
            });
          } else {
            callback(err, null);
          }
        });
      } else {
        callback();
      }
    },

    // Fetch the user notificationPrefs.
    function(callback) {
      // Skip if chat was InitiatedFromPlugin.
      if (isInitiatedFromPlugin) {
        return callback();
      }

      // Send notifications if this is the first time the agent is starting the chat.
      if (trip && origTripStatus == TripStatus.CREATED) {
        getUserPhoneEmailNotifPrefs(trip.userId, function (err, _user) {
          user = _user;
          callback();
        });
      } else {
        callback();
      }
    },

    // Send email and text alerts.
    function(callback) {
      // Skip if chat was InitiatedFromPlugin.
      if (isInitiatedFromPlugin) {
        return callback();
      }

      if (!user) {
        callback();
      } else {
        var mobile = (user.phone)? user.phone.mobile : null;
        var sendTextAlert = user.notificationPrefs.agentsFound.text;
        var sendEmailAlert = user.notificationPrefs.agentsFound.email;

        // Fire notifications and forget.
        setTimeout(function () {
          sendNewAgentFoundNotifications(
            trip, mobile, user.email, sendTextAlert, sendEmailAlert
          );
        });

        callback();
      }
    }
  ], function (err, results) {
    cb(err, trip);
  });
};

function getTripChat(id, done) {
  async.parallel([
    // Find the trip.
    function (cb) {
      Trip.findOne({ _id: id }, cb);
    },

    // Get messages history.
    function (cb) {
      chatMessageService.getChatMessages(id, function (err, strings) {
        if (!err) {
          cb(null, _.map(strings, JSON.parse));
        } else {
          cb(err, null);
        }
      });
    },
  ], function(err, results) {
    if (err) {
      done(err, null);
    } else {
      done(null, { trip: results[0], chat: results[1] });
    }
  });
}
exports.getTripChat = getTripChat;

function getThirdPartyUserDetails (userId, cb) {
  User.find ({_id: userId})
  .select({firstName: 1, email: 1, thirdPartyId: 1, source: 1}).exec (function (err, results) {
     var user;
     if(!err && results && results.length > 0) {
       user = results[0];
     }
     cb (err, user);
  });
}

function getUserPhoneEmailNotifPrefs (userId, cb) {
  User.find ({_id: userId})
  .select({email: 1, phone: 1, notificationPrefs: 1}).exec (function (err, results) {
     var user;
     if(!err && results && results.length > 0) {
       user = results[0];
     }
     cb (err, user);
  });
}

function sendNewAgentFoundNotifications (trip, mobile, email, sendTextAlert, sendEmailAlert, cb) {
  async.parallel([
    //send text alert
    function (callback) {
      if (mobile && sendTextAlert) {
         textAlertUtils.sendNewAgentFoundTextAlert (mobile, trip.agentName,
           constants.BITLY_USER_LOGIN_URL, function (err, result) {
            if (err) {
              console.log(err);
            }
            callback ();
         });
      } else {
        callback ();
      }
    },
    //send email alert
    function (callback) {
      if (mobile && sendEmailAlert) {
        emailUtils.sendNewAgentFoundEmail ([email], trip.userName, trip.agentName,
            constants.ABS_USER_LOGIN_URL, function(err, result) {
          callback ();
        });
      } else {
        callback ();
      }
    }
  ], function (err, results) {
    cb (err, results);
  });
}

exports.declineChat = function (email, chatId, payload, cb) {
  Trip.update ({agentEmail: email, _id: chatId},
        {declineReason: {reason: payload.reason, description: payload.description},
          status: TripStatus.DECLINED}, function (err, result) {
    cb (err, result);
  });
};

exports.endChat = function (email, chatId, payload, cb) {
  var initialTripDetailsId;
  var initialTripDetails;
  var ItdStatus = InitialTripDetails.STATUS;
  async.series([
    //find the trip
    function(callback) {
      Trip.update ({$or: [{agentEmail: email}, {userEmail: email}], _id: chatId},
            {endReason: {by: email, reason: payload.reason, description: payload.description},
              status: TripStatus.ENDED, dateModified: Date.now()}, function (err, result) {
        //TBD: send an email to admin
        callback (err, result);
      });
		},
    //get the initial trip details id
    function(callback) {
      Trip.find ({$or: [{agentEmail: email}, {userEmail: email}], _id: chatId}, function (err, results) {
        if (!err && results && results.length > 0) {
          initialTripDetailsId = results[0].initialTripDetailsId;
        }
        callback (err, null);
      });
		},
    //get initial trip details
    function(callback) {
      if (!initialTripDetailsId) {
        callback (null);
      } else {
        InitialTripDetails.find ({_id: initialTripDetailsId},
            function (err, results) {
          if (!err && results && results.length > 0) {
            initialTripDetails = results[0];
          }
          callback (err);
        });
      }
		},
    //un suspend the jobs for other agents in case the initial trip is not already successfully cloded
    function(callback) {
      if (!initialTripDetails) {
        callback (null);
      } else {
        if (initialTripDetails.status === ItdStatus.CREATED) {
          Trip.update ({initialTripDetailsId: initialTripDetailsId, status: TripStatus.SUSPENDED},
                {status: TripStatus.CREATED}, {multi: true}, function (err, result) {
            callback (err, result);
          });
        } else {
          callback (null);
        }
      }
		},
    //clear the unread message counters for this chat
    function (callback) {
      chatMessageService.deleteUnreadMessageCounters (chatId, function (err, result) {
          callback (null);
      });
    }
	], function (err, results) {
      cb (err, results);
	});
};

exports.markChatAsSuccess = function (email, chatId, cb) {
  var initialTripDetailsId;
  var ItdStatus = InitialTripDetails.STATUS;
  async.series([
    //find the trip
    function(callback) {
      Trip.update ({agentEmail: email, _id: chatId},
            {status: TripStatus.COMPLETED, dateModified: Date.now()}, function (err, result) {
        //TBD: send an email to admin
        callback (err, result);
      });
		},
    //get the initial trip details id
    function(callback) {
      Trip.find ({agentEmail: email, _id: chatId}, function (err, results) {
        if (!err && results && results.length > 0) {
          initialTripDetailsId = results[0].initialTripDetailsId;
        }
        callback (err, null);
      });
		},
    //update initial trip details as COMPLETED
    function(callback) {
      if (!initialTripDetailsId) {
        callback (null);
      } else {
        InitialTripDetails.update ({_id: initialTripDetailsId, status: ItdStatus.CREATED},
              {status: ItdStatus.COMPLETED}, function (err, result) {
          callback (err, result);
        });
      }
		},
    //update all other trips in created state
    function(callback) {
      if (!initialTripDetailsId) {
        callback (null);
      } else {
        Trip.update ({initialTripDetailsId: initialTripDetailsId, status: TripStatus.CREATED},
              {status: TripStatus.SUSPENDED}, function (err, result) {
          callback (err, result);
        });
      }
		}
	], function (err, results) {
      cb (err, results);
	});
};

exports.startChat = function (email, chatId, cb) {
  Trip.update ({userEmail: email, _id: chatId},
        {status: TripStatus.CHAT_STARTED}, function (err, result) {
    cb (err, result);
  });
};

exports.getAgentActiveClients = function (email, cb) {
  Trip.find ({agentEmail: email,
        $and: [{status: {$ne: Trip.STATUS.CREATED}},
              {status: {$ne: Trip.STATUS.BOOKING_COMPLETE}},
              {status: {$ne: Trip.STATUS.REFUND_COMPLETE}},
              {status: {$ne: Trip.STATUS.DECLINED}},
              {status: {$ne: Trip.STATUS.ENDED}},
              {status: {$ne: Trip.STATUS.SUSPENDED}
            }
            ]})
        .sort({dateCreated: 1})
        .exec(function (err, results) {
      cb (err, results);
  });
};

exports.getAgentJobs = function (email, sText, cb) {
  var searchCriteria = {
      $and: [
        {agentEmail: email},
        {status: Trip.STATUS.CREATED}
      ]
  };
  //if we have search text add regex to match the text on appropriate fields
  if (sText) {
    var stRegex = new RegExp('(' + sText.split(" ").join("|") + ")", "i");
    var searchRegex = {$or: [
        {title: stRegex},
        {description: stRegex},
        {origin: stRegex},
        {destination: stRegex}
      ]
    };
    searchCriteria["$and"].push(searchRegex);
  }
  Trip.find (searchCriteria)
      .sort({dateCreated: 1})
      .exec (function (err, results) {
      //now inject number of active chats for each job
      if (!err) {
        var finalResults = [];
        async.eachSeries (results, function (result, callback) {
          getNumActiveChats (result.initialTripDetailsId, function (err, num) {
            if (!err) {
              result.activeChats = num;
            }
            finalResults.push(result);
            callback ();
          });
        }, function done () {
          cb (err, finalResults);
        });

      } else {
        cb (err, results);
      }
  });
};

exports.getAgentAffiliateJobs = function (email, sText, cb) {
  var thirdPartyWebsites = [];
  var finalResults = [];
  var thirdPartyWebsitesMap = {};
  async.series ([
    //find all the affiliations of the agent
    function (callback) {
      User.findOne ({email: email}).select({_id: 1, thirdPartyWebsites: 1}).exec(function (err, result) {
          console.log(err, result);
          if (!err && result) {
            thirdPartyWebsites = result.thirdPartyWebsites;
          }
          callback (null);
      });
    },
    //collect details of the thirdPartyWebsites
    function (callback) {
      console.log(email);
      ThirdPartyWebsite.find ({_id: {$in: thirdPartyWebsites}}).
            select({_id: 1, name: 1}).
            exec(function (err, result) {
          if (!err && result && result.length > 0) {
            for (var i=0; i<result.length; i++) {
              thirdPartyWebsitesMap[result[i]._id] = result[i];
            }
          }
          callback (null);
      });
    },
    //find the trips
    function (callback) {
      if (thirdPartyWebsites.length > 0) {
        var searchCriteria = {
            $and: [
              {thirdPartyWebsite: {$in: thirdPartyWebsites}},
              {status: Trip.STATUS.CREATED}
            ]
        };
        //if we have search text add regex to match the text on appropriate fields
        if (sText) {
          var stRegex = new RegExp('(' + sText.split(" ").join("|") + ")", "i");
          var searchRegex = {$or: [
              {description: stRegex}
            ]
          };
          searchCriteria["$and"].push(searchRegex);
        }
        Trip.find (searchCriteria)
            .sort({dateCreated: 1})
            .exec (function (err, results) {
            //now inject number of active chats for each job
            if (!err) {
              async.eachSeries (results, function (result, cback) {
                result.website = thirdPartyWebsitesMap[result.thirdPartyWebsite].name;
                getNumActiveChats (result.initialTripDetailsId, function (err, num) {
                  if (!err) {
                    result.activeChats = num;
                  }
                  finalResults.push(result);
                  cback (null);
                });
              }, function done () {
                callback (null);
              });
            } else {
              callback (err);
            }
        });
      } else {
        callback (null);
      }
    }
  ], function (err, results) {
    cb (err, finalResults);
  });

};

exports.getAgentPastClients = function (email, cb) {
  Trip.find ({agentEmail: email,
              $or: [{status: Trip.STATUS.COMPLETED}]})
      .sort({dateCreated: 1})
      .exec(function (err, results) {
        cb (err, results);
    }
  );
};

function findTrip (tripId, email, cb) {
  Trip.find ({$or: [{agentEmail: email}, {userEmail: email}], _id: tripId},
    function (err, results) {
        cb (err, results);
    }
  );
}
exports.findTrip = findTrip;

exports.updateTrip = function (tripId, email, payload, cb) {
  Trip.update ({ $or: [{agentEmail: email}], _id: tripId},
    payload,
    function (err, results) {
      cb (err, results);
    }
  );
};

exports.updateTripUnsafe = function (tripId, payload, cb) {
  Trip.update({ _id: tripId }, payload, cb);
};

function sendItinerary (tripId, email, cb) {
  var trip;
  var user;
  var tpUser;
  async.series([
		//find the trip
    function(callback) {
      Trip.find ({agentEmail: email, _id: tripId}, function (err, results) {
        if (!err && results.length === 0) {
          err = "Not found";
        }
        if (!err) {
          trip = results[0];
        }
        callback (err, null);
      });
		},
    //find user notification prefs
    function (callback) {
      getUserPhoneEmailNotifPrefs(trip.userId, function (err, _user) {
         user = _user;
         callback();
      });
    },
    //email the itenerary
    function(callback) {
      if (trip.userEmail) {
        emailUtils.sendUserItineraryEmail([trip.userEmail], trip.userName,
          trip.agentName, trip.itenerary, function (err, result) {
            callback(err, result);
        });
      } else {
        callback();
      }
		},
    //send email and text alerts
    function (callback) {
      if (!user) {
        callback ();
      } else {
        var mobile = (user.phone)? user.phone.mobile : null;
        var sendTextAlert = (user.notificationPrefs &&
                user.notificationPrefs.itinerary)?
              user.notificationPrefs.itinerary.text : null;
        if (mobile && sendTextAlert) {
          textAlertUtils.sendNewItinenraryTextAlert (mobile, trip.agentName,
              trip.userEmail, function (err, result) {
            callback ();
          });
        } else {
          callback ();
        }
      }
    },
    //send the itinerary to facebook messenger if the chat came thru facebook
    function (callback) {
      getThirdPartyUserDetails(trip.userId, function (err, _tpUser) {
         tpUser = _tpUser;
         callback();
      });
    },
    //send the itinerary to facebook messenger if the chat came thru facebook
    function (callback) {
      if (tpUser && tpUser.thirdPartyId &&
          tpUser.source === UserSource.FACEBOOK) {
        //send itinerary card to fb messenger
        fbCommon.sendItineraryMessage (tpUser.thirdPartyId, tripId);
        callback();
      } else {
        callback();
      }
    }

	], function (err, results) {
      cb (err, results);
	});
}

exports.sendItinerary = sendItinerary;

function shareItenerary (tripId, email, payload, cb) {
  var trip;
  async.series([
		//find the trip
    function(callback) {
      Trip.find ({agentEmail: email, _id: tripId}, function (err, results) {
        if (!err && results.length === 0) {
          err = "Not found";
        }
        if (!err) {
          trip = results[0];
        }
        callback (err, null);
      });
		},
    //share the itenerary
    function (callback) {
      var allEmailAddresses = payload.email;
      var splitEmails = allEmailAddresses.split(",");
      async.each(splitEmails, function (emailAddr, cback) {
        emailAddr = emailAddr.trim();
        if (emailAddr !== "") {
          emailUtils.sendAgentShareItineraryEmail([emailAddr.trim()], trip.agentName,
            payload.notes, trip.itenerary, function (err, result) {
              cback(err, result);
          });
        }
      }, function(err, results){
          callback (err, results);
      });
		}
	], function (err, results) {
      cb (err, results);
	});
}

function checkIfUserIsAuthorized (tripId, email, cb) {
  var userAuthorized = false;
  async.parallel([
		//find the trip
    function(callback) {
      Trip.find ({$or: [{agentEmail: email}, {userEmail: email}], _id: tripId}).select({_id: 1})
          .exec(function (err, result) {
        if (!err && result && result.length > 0) {
          userAuthorized = true;
        }
        callback (err);
      });
		},
    //check if the user is a trip participant
    function (callback) {
      TripParticipant.find ({userEmail: email, tripId: tripId}).select({_id: 1})
          .exec(function (err, result) {
        if (!err && result && result.length > 0) {
          userAuthorized = true;
        }
        callback (err);
      });
		}
	], function (err, results) {
      cb (err, userAuthorized);
	});
}

function getItinerary (tripId, email, cb) {
  var trip;
  var itineraryHtml;
  var userAuthorized = false;
  async.series([
		//check if the user is authorized for the trip
    function(callback) {
      checkIfUserIsAuthorized (tripId, email, function (err, result) {
        if (!err) {
          userAuthorized = result;
        }
        callback (err);
      });
		},
    //if the user is a trip participant then get the itinerary by id
    function (callback) {
      if (userAuthorized) {
        Trip.find ({_id: tripId}).select({itenerary: 1}).exec(function (err, result) {
          if (!err && result && result.length > 0) {
            trip = result [0];
          }
          callback (err);
        });
      } else {
        callback ();
      }
		}
	], function (err, results) {
      if (trip) {
        itineraryHtml = trip.itenerary;
      }
      cb (err, itineraryHtml);
	});
}

exports.getItinerary = getItinerary;

function getItineraryNoAuth (tripId, cb) {
  var trip;
  var itineraryHtml;
  async.series([
    function (callback) {
      Trip.find ({_id: tripId}).select({itenerary: 1}).exec(function (err, result) {
        if (!err && result && result.length > 0) {
          trip = result [0];
        }
        callback (err);
      });
		}
	], function (err, results) {
      if (trip) {
        itineraryHtml = trip.itenerary;
      }
      cb (err, itineraryHtml);
	});
}

exports.getItineraryNoAuth = getItineraryNoAuth;

function getAgentNoAuth (tripId, cb) {
  var trip;
  var agentId;
  async.series([
    function (callback) {
      Trip.find ({_id: tripId}).select({agentId: 1}).exec(function (err, result) {
        if (!err && result && result.length > 0) {
          trip = result [0];
        }
        callback (err);
      });
		}
	], function (err, results) {
    if ( trip )
      agentId = trip.agentId;
    cb (err, agentId);
	});
}

exports.getAgentNoAuth = getAgentNoAuth;

exports.getUserChats = function (email, type, cb) {
  var trips = [];
  var convertedTrips = [];
  async.series([
  		//get all the active chats
      function(callback) {
        Trip.find ({userEmail: email, status: type})
          .select({
            _id: 1, agentIntroText: 1, agentImage: 1, agentName: 1,
            agentEmail: 1
          }).exec (function (err, results) {
            if (!err) {
              trips = results;
            }
            callback (err);
        });
      },
      //inject agent image/name
      function(callback) {
        async.each(trips, function (t, cback) {
          var convertedTrip = {
            id: t._id,
            message: t.agentIntroText
          };
          User.find({email: t.agentEmail}).select({firstName: 1, lastName: 1, image: 1}).
              exec(function (err, result) {
            if (!err && result && result.length > 0) {
              convertedTrip.image = result[0].image;
              convertedTrip.firstName = result[0].firstName;
              convertedTrip.lastName = result[0].lastName;
            }
            convertedTrips.push(convertedTrip);
            cback (err);
          });
        }, function (err, results) {
            callback (err);
        });
      }],
    function (err, results) {
      cb (err, convertedTrips);
    });
};

exports.getInvitedUserChats = function (email, cb) {
  var invitedChats = [];
  var tempInvitedChats = [];
  var userAuthorized = false;
  async.series([
		//get all the trips this user has been invited to
    function(callback) {
      TripParticipant.find ({userEmail: email}, function (err, result) {
        if (!err) {
          tempInvitedChats = result;
        }
        callback (err);
      });
		},
    //TBD: filter in only the active (CHAT_STARTED) trips
    // & get the user info (name & image)
    function (callback) {
      async.each(tempInvitedChats, function (tic, cback) {
        var trip;
        var invitedTripInfo;
        async.series([
      		//check if the trip is active
          function(icallback) {
            Trip.find ({_id: tic.tripId, status: Trip.STATUS.CHAT_STARTED}).select({_id: 1}).
                exec (function (err, result) {
              if (!err && result && result.length > 0) {
                trip = result[0];
                invitedTripInfo = {
                  id: tic.tripId,
                  message: tic.message
                };
              }
              icallback (err);
            });
      		},
          //add user info if the trip is present
          function (icallback) {
            if (invitedTripInfo) {
              User.find({email: tic.invitedBy}).select({firstName: 1, lastName: 1, image: 1}).
                exec(function (err, result) {
                  if (!err && result && result.length > 0) {
                    invitedTripInfo.image = result[0].image;
                    invitedTripInfo.firstName = result[0].firstName;
                    invitedTripInfo.lastName = result[0].lastName;
                  }
                  icallback (err);
                });
            } else {
              icallback ();
            }
      		}
      	], function (err, results) {
            if (invitedTripInfo) {
              invitedChats.push(invitedTripInfo);
            }
            cback (err);
      	});
      }, function (err, results) {
          callback (err);
      });
		}
	], function (err, results) {
      cb (err, invitedChats);
	});
};

exports.isOwnerOfTrip = function (user, tripId, cb) {
  Trip.find({$or: [{agentEmail: user.email}, {userEmail: user.email}], _id: tripId},
    function(err, result) {
      if (!err && result && result.length > 0) {
        return cb (null, true);
      }
      return cb (err, false);
  });
};

exports.inviteToTrip = function (user, tripId, payload, permission, role, cb) {
  var trip;
  var tripParticipantAdded = false;
  var newUserEmail = payload.email;
  var userEmail = user.email;
  if (!newUserEmail) {
    return cb ('email missing');
  }
  var userExists = true;
  var invitationMsg = payload.message;
  var inviteText = (!invitationMsg)? 'Hey, I would like you to join my trip planning chat On Agent Avery!' : invitationMsg;
  async.series ([
    function (callback) {
      Trip.find({$or: [{agentEmail: userEmail}, {userEmail: userEmail}], _id: tripId},
        function(err, result) {
          if (!err && result && result.length > 0) {
            trip = result[0];
          }
          callback (err);
      });
    },
    //add new user as trip participant if the new user is not an agent/the user who created the trip
    function (callback) {
      if (trip && trip.agentEmail !== newUserEmail &&
            trip.userEmail !== newUserEmail) {
        addTripParticipant(tripId, userEmail,
            newUserEmail, inviteText, permission, role, function(err, result) {
            if (!err) {
              tripParticipantAdded = true;
            }
            callback ();
        });
      } else {
        callback ();
      }
    },
    //check if user is already present on AgentAvery
    function (callback) {
      User.find ({email: newUserEmail}).select({_id: 1}).exec(function (err, result) {
        if (!err && result && result.length > 0) {
          userExists = true;
        }
        callback (err);
      });
    },
    function (callback) {
      if (trip && tripParticipantAdded) {
        var link = constants.ABS_USER_SIGNUP_URL;
        if (userExists) {
          link = constants.ABS_USER_LOGIN_URL;
        }
        emailUtils.sendInviteToChatEmail([newUserEmail], user.firstName + " " + user.lastName, inviteText,
          link, function(err, result) {
            callback ();
        });
      } else {
        callback ();
      }
    },
    //add invite chat history entry in database
    function (callback) {
      if (trip && tripParticipantAdded) {
        //TBD:
      }
      callback();
    }],
  function (err, results) {
    cb (err, results);
  });
};

function addTripParticipant (tripId, email, newUserEmail, message, permission, role, cb) {
  var participant = {
    tripId: tripId,
    userEmail: newUserEmail,
    invitedby: email,
    message: message
  };
  if (permission) {
    participant.permission = permission;
  }
  if (role) {
    participant.role = role;
  }
  TripParticipant.save(participant, function (err, result) {
    cb (err);
  });
}

function getAllTripUsersInfo (tripId, cb) {
  var tripUsersInfo;
  var emails = [];
  var userIds = [];
  async.series ([
      //get all trip user emails
      function (callback) {
        Trip.find ({_id: tripId}).select ({userId: 1, agentId: 1, agentEmail: 1, userEmail: 1}).
            exec (function (err, result) {
          if (!err && result && result.length > 0) {
            //either push IDs or Emails because we might not always have the email of a user if
            // he/she signed up with thirdparty website
            if (!result[0].userId) {
              userIds.push (result[0].userId);
            } else if (result[0].userEmail) {
              emails.push (result[0].userEmail);
            }
            if (result[0].agentEmail) {
              emails.push (result[0].agentEmail);
            } else if (result[0].agentId) {
              userIds.push (result[0].userId);
            }
          }
          callback (err);
        });
      },
      function (callback) {
        TripParticipant.find ({tripId: tripId}).select ({userEmail: 1}).
            exec (function (err, result) {
          if (!err && result && result.length > 0) {
            for (var i = 0; i < result.length; i++) {
              emails.push (result[i].userEmail);
            }
          }
          callback (err);
        });
      },
      //get the user info
      function (callback) {
        User.find ({$or: [
          {email: {$in: emails}},
          {_id: {$in: userIds}}
        ]}).select ({_id: 1, firstName: 1, lastName: 1, image: 1}).
          exec (function (err, result) {
            if (!err && result && result.length > 0) {
              tripUsersInfo = result;
            }
            callback (err);
        });
      }
    ],
    function (err, results) {
      cb (err, tripUsersInfo);
  });
}

exports.validateByThirdPartyWebsiteAndId = function (thirdPartyWebsiteId, chatId, cback) {
  Trip.find ({_id: chatId, thirdPartyWebsite: thirdPartyWebsiteId}).
      select ({_id: 1}).exec (function (err, result) {
    if (!err && result && result.length > 0) {
      cback (null, result[0]);
    } else {
      cback ("Not found");
    }
  });
};

exports.findOngoingByUserAndThirdPartyWebsite = function (userEmail, thirdPartyWebsiteId, cback) {
  Trip.findOne ({userEmail: userEmail, thirdPartyWebsite: thirdPartyWebsiteId,
    $or: [{status: TripStatus.CHAT_INITIATED},
      {status: TripStatus.CHAT_STARTED}, {status: TripStatus.CREATED}]}).
      select ({_id: 1}).exec (function (err, result) {
    cback (err, result);
  });
};

exports.getAllTripUsersInfo = getAllTripUsersInfo;

exports.shareItenerary = shareItenerary;

exports.TripParticipant = TripParticipant;
