var async = require("async");
var bcrypt = require("bcrypt");
var shortid = require('shortid');
var moment = require('moment');
var logger = require("../logger").logger;
var pub = require('redis-connection')();

var User = require("../models/user").User;
var sendgrid = require("./sendgrid");
var emailUtils = require("./email-utils");
var utils = require("../utils");
var constants = require("../constants");

//TBD: Remove the hack below
//Hack: send a notification to hello@agentavery.com for us to manually pick an agent for them
exports.sendNewUserNotification = function (user, trip, cb) {
  var html = utils.format(sendgrid.templates.new_user_system_notification, user.firstName, user.lastName, user.email,
     trip.description);
  sendgrid.sendEmail("no-reply@agentavery.com", ["hello@agentavery.com"], "AgentAvery Notification - New User Sign Up",
      html, function (err, result) {
      cb(err, result);
  });
};

//Hack: send a notification to hello@agentavery.com for us to manually approve the agent profile
exports.sendNewAgentNotification = function (user, cb) {
  var html = utils.format(sendgrid.templates.new_agent_system_notification, user.firstName, user.lastName, user.email);
  sendgrid.sendEmail("no-reply@agentavery.com", ["hello@agentavery.com"], "AgentAvery Notification - New Agent Sign Up",
      html, function (err, result) {
      cb (err, result);
  });
};

exports.createUser = function (user, cb) {
  var newUser;
  if (!user.type) {
      user.type = User.TYPE.TRAVELER;
  } else {
      user.type = user.type;
  }
  async.series([
		//save the agent information
    function(callback) {
        User.save(user, function (err, result) {
            if (!err) {
              newUser = result;
            }
            callback(err, result);
        });
		},
    //send confirmation email
		function(callback) {
      var url = constants.BASEURL+"/confirm?email="+user.email+"&ccode=" +
            (new Buffer(user.confirmationToken)).toString('base64');
      //send account confirmation and welcome emails
      if (user.type == User.TYPE.TRAVELER) {
        async.parallel([
          function (cback) {
            emailUtils.sendUserAccountConfirmationEmail([user.email], user.firstName, url, function (err, result) {
                cback(err, result);
            });
          },
          function (cback) {
            emailUtils.sendUserWelcomeEmail([user.email], user.firstName, function (err, result) {
                cback(err, result);
            });
          }
        ],
        function (err, results){
          callback(err, results);
        });

      } else {
        async.parallel([
          function (cback) {
            emailUtils.sendAgentAccountConfirmationEmail([user.email], user.firstName, url, function (err, result) {
                cback(err, result);
            });
          },
          function (cback) {
            emailUtils.sendAgentWelcomeEmail([user.email], user.firstName, function (err, result) {
                cback(err, result);
            });
          }
        ],
        function (err, results){
          callback(err, results);
        });
      }
		}
	], function (err, results) {
		  cb (err, newUser);
	});
};

exports.createBasicUser = function (user, thirdPartyWebsite, cb) {
  var newUser;
  var firstTimeUser = false;
  async.series([
    //check if the user exists
    function(callback) {
        findSingleUser({email: user.email}, function (err, result) {
            if (!err && result) {
              newUser = result;
              firstTimeUser = false;
            }
            callback(err);
        });
		},
		//create the user
    function(callback) {
        if (!newUser) {
          if (!user.type) {
              user.type = User.TYPE.TRAVELER;
          }
          //assign a temporary password
          user.tempPassword = shortid.generate();
          user.tempPasswordTimestamp = new Date();
          user.secret = bcrypt.hashSync(user.tempPassword, constants.SALT);
          User.save(user, function (err, result) {
              if (!err) {
                newUser = result;
              }
              callback(err);
          });
        } else {
          callback(null);
        }
		},
    //send welcome and confirmation email with temporary password
		function(callback) {
      if (newUser) {
        var url = constants.BASEURL+"/userapp#/login";
        //send notification emails
        async.parallel([
          function (cback) {
            emailUtils.sendNewPluginUserEmail([newUser.email], newUser.firstName, newUser.email,
                    newUser.tempPassword, thirdPartyWebsite.name, url, function (err, result) {
                  cback(err, result);
            });
          },
          //send a welcome email for new users
          function (cback) {
            if (firstTimeUser) {
              emailUtils.sendUserWelcomeEmail([newUser.email], newUser.firstName, function (err, result) {
                  cback(err, result);
              });
            } else {
               cback(null);
            }
          }
        ],
        function (err, results){
          callback(err, results);
        });
      } else {
         callback(null);
      }
		}
	], function (err, results) {
		  cb (err, newUser);
	});
};

function userExists (email, cb) {
  User.find({email: email}, function (err, result) {
      if (!err && result && result.length > 0) cb(null, true);
      else cb (err, false);
	});
}

exports.userExists = userExists;

exports.findUser = function (query, cb) {
  User.find(query, function (err, result) {
      cb (err, result);
	});
};

function findSingleUser (query, cb) {
  User.find(query, function (err, result) {
      if (!err && result && result.length > 0) {
        return cb (err, result[0]);
      }
      cb (err, null);
	});
}

exports.findSingleUser = findSingleUser;

exports.forgotPassword = function (email, cb) {
  User.find({email: email}, function (err, result) {
    if (!err && result && result.length > 0) {
      var user = result[0];
      var passwordResetToken = bcrypt.hashSync(email, constants.SALT);
      var resetExpiryTime = new Date();
      resetExpiryTime.setTime(resetExpiryTime.getTime() + 3600000);
      async.series([
        //update the user with token information
        function(callback) {
            User.update({email: email}, {passwordResetToken: passwordResetToken, passwordResetExpiryTime:
                resetExpiryTime},
              function (err, result) {
                callback(err, result);
            });
        },
        //send password reset email
        function(callback) {
          var url = constants.BASEURL+"/reset_password?email="+user.email+"&rpcode=" + passwordResetToken;
          emailUtils.sendPasswordResetEmail([user.email], user.firstName, url, function (err, result) {
              callback(err, result);
          });
        }
      ], function (err, results) {
          if (err) {
            console.log(err);
          }
          cb (err, results);
      });
    } else {
        cb ('User not found.', null);
    }
	});
};

exports.validateResetPassword = function (email, token, cb) {
  User.find({email: email, passwordResetToken: token}, function (err, result) {
      if (!err && result && result.length > 0) {
         var expTime = result[0].passwordResetExpiryTime;
         var date = new Date();
         if (date.getTime() > expTime.getTime()) {
            return cb ("Token expired", false);
         } else {
            return cb (null, true);
         }
      } else {
         return cb ("User not found", false);
      }
	});
};

exports.resetPassword = function (email, password, token, cb) {
  var user;
  async.series([
    //reset the password
    function(callback) {
      User.update({email: email, passwordResetToken: token}, {secret: bcrypt.hashSync(password, constants.SALT),
        passwordResetToken: null, passwordResetExpiryTime: null}, function (err, result) {
          callback (err);
      });
    },
    //fetch the user
    function(callback) {
      User.find({email: email}, function (err, results) {
        if (!err && results && results.length > 0) {
          user = results[0];
        }
        callback (null);
      });
    }
  ], function (err, results) {
      if (err) {
        console.log(err);
      }
      cb (err, user);
  });
};

exports.confirmEmail = function (email, token, cb) {
  var user;
  User.find({email: email}, function (err, result) {
    	if (!err && result && result.length > 0) {
         user = result[0];
         var status = User.STATUS.ACTIVE;
         if (User.TYPE.AGENT === user.type) {
           status = User.STATUS.PENDING_APPROVAL;
         }
         var decodedToken = (new Buffer(token, 'base64')).toString('ascii');
         if (user.confirmationToken === decodedToken ||
              user.confirmationToken === token //this is for backword compatibility
            ) {
           User.update({email: email}, {status: status, confirmationToken: ""},
                function (err, result) {
              cb (err, user);
           });
         } else {
           cb ({verified: true}, null);
         }
      }
      else {
         cb (err, null);
      }
	});
};

exports.getAllActiveAgents = function (cb) {
  User.find({type: User.TYPE.AGENT, status: User.STATUS.ACTIVE}, function (err, results) {
    	cb (err, results);
	});
};

exports.getAllAgents = function (cb) {
  User.find({type: User.TYPE.AGENT}, function (err, results) {
    	cb (err, results);
	});
};

exports.getAgentsByStatus = function (status, cb) {
  User.find({type: User.TYPE.AGENT, status: status}, function (err, results) {
    	cb (err, results);
	});
};

exports.processAgentTermsAndAgreement = function (request, cb) {
  var payload = request.payload;
  var userId = payload.userId;
  User.update({_id: userId}, {agreementAcceptedDate: new Date(), agreementAcceptedDetails: payload}, function (err, results) {
    cb (err, results);
	});
};

exports.updateProfilePicture = function (user, file, cb) {
  User.update({_id: user._id}, {image: file}, function (err, result) {
    cb (err, result);
	});
};

exports.agentAccountUpdate = function (user, payload, cb) {
  //make sure we delete the _id
  if (!payload) {
    return cb ("No payload");
  }
  var updateCount = 0;
  delete payload._id;
  payload.dateModified = new Date();
  async.series([
    function (callback) {
      //match id and user type, since its only for agents
      User.update({_id: user._id, type: TYPE.AGENT},
          payload, function (err, result) {
        updateCount = result;
        callback (err);
    	});
    },
    //if email is being updated then make sure its changed in trips (for backward compatibility)
    function (callback) {
      if (payload.email) {
        Trip.update({agentId: user._id},
            {agentEmail: payload.email}, function (err, result) {
          updateCount = result;
          callback (err);
      	});
      } else {
        callback ();
      }
    },
    function (callback) {
      //TODO send email if user account was changed
      if (updateCount > 0) {
        callback (null);
      } else {
        callback (null);
      }
    }
  ], function (err, results) {
    cb (err, results);
  });
};

exports.getAgentProfile = function (user, cb) {
  User.findOne({_id: user._id, type: User.TYPE.AGENT}).select({
        email: 1, firstName: 1, lastName: 1, aboutMe: 1, specialities: 1, destinations: 1,
        phone: 1, aRCNumber: 1, iATANumber: 1, cLIANumber: 1, address: 1,  status: 1,
        availability: 1, timeZone: 1, image: 1
      }).exec(function (err, result) {
    cb (err, result);
  });
};


exports.deactivateAccount = function (user, cb) {
  var updateCount = 0;
  async.series([
    function (callback) {
      User.update({_id: user._id, status: User.STATUS.ACTIVE},
          {status: User.STATUS.INACTIVE}, function (err, result) {
        updateCount = result;
        callback (err);
    	});
    },
    function (callback) {
      //send email if the status was affected
      if (updateCount > 0) {
        if (user.type == User.TYPE.AGENT) {
          emailUtils.sendAgentAccountDeactivatedEmail ([user.email], user.firstName, function (err, result) {
            callback (err);
          });
        } else {
          callback (null);
        }
      } else {
        callback (null);
      }
    }
  ], function (err, results) {
    cb (err, results);
  });
};

exports.activateAccount = function (user, cb) {
  User.update({_id: user._id}, {status: User.STATUS.ACTIVE}, function (err, result) {
    if (!err) {
      pub.publish(constants.TRIP_ADD_FOR_AGENT, JSON.stringify(user));
    }
    cb (err, result);
	});
};

exports.approveAgent = function (agentId, cb) {
  var agent;
  var updateCount = 0;
  async.series([
    function (callback) {
      User.find({_id: agentId}, function (err, results) {
        if (!err && results && results.length > 0) {
          agent = results[0];
        }
        callback (null);
    	});
    },
    function (callback) {
      if (agent && agent.type == User.TYPE.AGENT) {
        User.update({_id: agentId, status: User.STATUS.PENDING_APPROVAL},
          {status: User.STATUS.ACTIVE}, function (err, uCount) {
          if (!err) {
            updateCount = uCount;
          }
          callback (err);
      	});
      } else {
        callback (null);
      }
    },
    //send email
    function (callback) {
      emailUtils.sendAgentAccountApprovedEmail ([agent.email], agent.firstName, function (err, result) {
        callback (null);
      });
    },
    //publish event on redis for the new jobs to be created for the new agent
    function (callback) {
      if (updateCount && updateCount > 0) {
        pub.publish(constants.TRIP_ADD_FOR_AGENT, JSON.stringify(agent));
      }
      callback (null);
    }
  ], function (err, results) {
    cb (err, results);
  });
};

exports.resendConfirmationEmail = function (user, cb) {
  var confirmationToken = bcrypt.hashSync(user.secret, constants.SALT);
  async.series([
    //update the user with token information
    function(callback) {
        User.update({email: user.email}, {confirmationToken: confirmationToken},
          function (err, result) {
            callback(err, result);
        });
    },
    //send confirmation email with new code
    function(callback) {
      var url = constants.BASEURL+"/confirm?email="+user.email+"&ccode=" + (new Buffer(confirmationToken)).toString('base64');
      if (user.type == User.TYPE.TRAVELER) {
        emailUtils.sendUserAccountConfirmationEmail([user.email], user.firstName, url, function (err, result) {
            callback(err, result);
        });
      } else if (user.type == User.TYPE.AGENT) {
        emailUtils.sendAgentAccountConfirmationEmail([user.email], user.firstName, url, function (err, result) {
            callback(err, result);
        });
      } else {
        callback (null);
      }
    }
  ], function (err, results) {
      if (err) {
        console.log(err);
      }
      cb (err, results);
  });
};

exports.resendAgentAgreementEmail = function (agentId, cb) {
  var agent;
  async.series([
    //update the user with token information
    function(callback) {
        User.find({_id: agentId},
          function (err, results) {
            if (!err && results && results.length > 0) {
              agent = results[0];
            }
            callback(err);
        });
    },
    //send the email
    function(callback) {
      if (!agent) {
        callback("Agent not found");
      } else {
        var url = constants.BASEURL+"/agent-agreement?u="+agent.firstName+"&ui=" + agent._id;
        emailUtils.sendAgentAgreementEmail([agent.email], agent.firstName, url, function (err, result) {
            callback(err);
        });
      }
    }
  ], function (err, results) {
      if (err) {
        console.log(err);
      }
      cb (err, results);
  });
};

exports.notifySupport = function (user, reason, cb) {
  //send account problem email
  emailUtils.sendNotifySupportEmail(user.email, user.firstName, reason, function (err, result) {
    cb (err);
  });
};

exports.updateAgentAccount = function (user, updateObj, cb) {
  User.update({_id: user._id}, {$set: updateObj},
    function (err, result) {
      cb(err, result);
  });
};

exports.User = User;
