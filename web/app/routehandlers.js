var async = require ("async");
var shortid = require('shortid');
var pub = require('redis-connection')();
var bcrypt = require("bcrypt");
var Hapi = require('hapi');
var users = require("./controllers/users");
var trips = require("./controllers/trips");
var TripStatus = trips.Trip.STATUS;
var initialTripDetails = require("./controllers/initial-trip-details");
var payments = require("./controllers/payments");
var constants = require("./constants");
var UIConstants = require("./views/UIConstants");
var utils = require("./utils");
var logger = require("./logger");
var files = require("./controllers/files");
var jobMatching = require("./job_matching/");
var boom = require ("boom");
var chatMessageService = require("./livechat/chat_message_service");
var pdf = require('html-pdf');

var logger = require ("./logger").logger;

//common util functions
function replyStatusFailed (reply) {
  reply({status: 'failed'}).type(constants.JSON);
}

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

function createUserAccount (request, reply) {

  var payload = request.payload;
  var tempPassword;
  var tempPasswordTimestamp;

  //generate a temporary password if there is no password from form
  if (!payload.password) {
    payload.password = shortid.generate();
    tempPassword = payload.password;
    tempPasswordTimestamp = new Date();
  }

  var finalPassword = payload.password || "100tempPasswordTimestamp001";

  var passwordHash = bcrypt.hashSync(finalPassword, constants.SALT);
  var user = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      secret: passwordHash,
      type: payload.type,
      destinations: payload.destinations,
      specialities: payload.specialities,
      aRCNumber: payload.aRCNumber,
      iATANumber: payload.iATANumber,
      cLIANumber: payload.cLIANumber,
      tempPassword: tempPassword,
      tempPasswordTimestamp: tempPasswordTimestamp,
      hostAgencyName: payload.hostAgencyName,
      confirmationToken: bcrypt.hashSync(passwordHash, constants.SALT),
      phone: {home: payload.homeNumber, mobile: payload.mobileNumber},
      address: {street: payload.street, city: payload.city,
                state: payload.state, country: payload.country, zipcode: payload.zipcode}
  };
  users.createUser(user, function (err, result) {
      if (!err) {
          //TBD: Remove the hack below
          //Hack to create a trip/job from user sign up screen
          if (result.type === users.User.TYPE.TRAVELER) {
            var agents;
            async.parallel([
                function (callback) {
                  //TBD: Remove the hack below which captures the trip details from user signup
                  if (payload.tripDetails) {
                    initialTripDetails.createInitialTripDetails ({
                      userId: result._id,
                      userEmail: result.email,
                      userName: result.firstName,
                      origin: payload.city,
                      destination: payload.destination,
                      occasion: payload.occasion,
                      description: payload.tripDetails
                    }, function (err, result) {
                      console.log("InitialTripDetails created!");
                      callback (err, result);
                    });
                  } else {
                    callback (null);
                  }
                },
                function (callback) {
                  users.sendNewUserNotification(payload, {description: payload.tripDetails},
                      function (err, result) {
                    callback(err, result);
                  });
                }
              ],
            function (err, results) {
              //TBD: Remove hack below
              //Hack: navigate to welcome page after a user sign-up since we
              //dont have the user app yet
              return userWelcomePage(reply, payload.firstName);
            });
          } else {
            //navigate to sign in page
            users.sendNewAgentNotification(user,
                function (err, result) {
              reply().redirect('/all-login').permanent();
            });
          }
      } else {
          //navigate to signup
          var redirectPath = '/user-signup';
          if (payload.type && payload.type === users.User.TYPE.AGENT) {
            redirectPath = '/agent-signup';
          }
          reply().redirect(redirectPath).permanent();
      }
  });
}

function getUserChats (request, reply, type) {
  var user = request.auth.credentials;
  trips.getUserChats (user.email, type, function(err, result) {
    if (err) {
      return reply(new Error(""));
    }
    return reply(result).type(constants.JSON);
  });
}

function notifySupport (request, reply, reason) {
  var user = request.auth.credentials;
  users.notifySupport(user, reason, function (err, result) {
      if (!err) {
          reply({success: true});
      } else {
          reply({success: false, message: "Failed to notify support. Please try again later."});
      }
  });
}

//TBD: Remove the function below
//Hack, this is a temporary hack to redirect new users to welcome page!
function userWelcomePage (reply, userName) {
  return reply.view('user_welcome.html', {title: 'Welcome to ' + UIConstants.TITLE + '!', userName: userName}, {layout: 'layout'}).state('userName', userName);
}

function validateAdminRole (user, cback) {
   if (user.type === users.User.TYPE.ADMIN) {
     cback(null);
   } else {
     cback("Not an admin");
   }
}

AA.routeHandlers = {
    index: function (request, reply) {
        // var userAgent = AA.UserAgent.parse(request.headers['user-agent']);

        // if (userAgent.os.family === 'iOS' || userAgent.os.family === 'Android' || userAgent.os.family === 'Windows Phone') {
        //     //return reply.view('user-app.html', {title: UIConstants.MOBILE_LANDING_PAGE_TITLE}, {layout: 'layout-mobile'});
        //     var source = request.query.s;
        //     var sourceParam = "";
        //     if (source) {
        //       sourceParam = "?s=" + source;
        //     }
        //     return reply.redirect ("/userapp" + sourceParam + "#/landing");
        // } else {
        //     return reply.view('index.html', {title: UIConstants.LANDING_PAGE_TITLE}, {layout: 'layout'});
        // }

        return reply.view('index.html', {title: UIConstants.LANDING_PAGE_TITLE}, {layout: 'layout'});
    },

    userapp: function (request, reply) {
      return reply.view('user-app.html');
    },

    // shareOption
    share_old: function(request, reply) {
      return reply.view('agentavery-app.html');
    },
    // share
    share: function(request, reply) {
      // future: retrieve any trip details
      return reply.view('agentavery-app.html');
    },
    // download
    download: function(request, reply) {
      trips.getItineraryNoAuth(request.params.tripid, function(err, result) {
        if (!err) {
          // convert to pdf
          var options = {
            "format": 'Letter',
            "phantomPath": "./node_modules/phantomjs/bin/phantomjs",
            "phantomArgs": [],
            "timeout": 30000
          };
          pdf.create(result, options).toBuffer(function(err, buffer) {
            if ( Buffer.isBuffer(buffer) ) {
              return reply(buffer).header('Content-Type', buffer.contentType)
                .header('Content-Disposition', 'attachment; filename=itinerary.pdf');
              }
              else {
                replyFailed(reply);
              }
          });
        }
        else {
          replyFailed(reply);
        }
      });
      // return reply.view('agentavery-app.html');
    },
    getAgentForTrip: function(request, reply) {
      trips.getAgentNoAuth(request.params.tripid, function(err, result) {
        if (!err) {
          return reply({ agentId: result }).type(constants.JSON);
        }
        else {
          replyFailed(reply);
        }
      });
    },

    about: function (request, reply) {
        return reply.view('about.html', {title: 'About - ' + UIConstants.TITLE}, {layout: 'layout'});
    },

    profile: function (request, reply) {
        return reply.view('profile.html', {title: 'Profile - ' + UIConstants.TITLE}, {layout: 'layout'});
    },

    privacy: function (request, reply) {
        return reply.view('privacy.html', {title: 'Privacy Policy - ' + UIConstants.TITLE}, {layout: 'layout'});
    },

    signup: function (request, reply) {
      if (request.method === 'get') {
        return reply.view('signup.html', {title: 'Agent Sign Up - ' + UIConstants.TITLE}, {layout: 'layout-login'});
      } else {
        createUserAccount (request, reply);
      }
    },
    userSignup: function (request, reply) {
      if (request.method === 'get') {
        //check the cookie to see if the user already created an account, if so show the welcome page
        if (request.state && request.state.userName) {
            return userWelcomePage(reply, request.state.userName);
        }
        return reply.redirect("/userapp#/signup");
      } else {
        request.payload.type = users.User.TYPE.TRAVELER;
        createUserAccount (request, reply);
      }
    },
    agentAgreement: function (request, reply) {
      if (request.method === 'get') {
        return reply.view('agent_agreement.html', {title: 'Agent Agreement - ' + UIConstants.TITLE,
                userName: request.query.u, userId: request.query.ui},
            {layout: 'layout'});
      } else {
        users.processAgentTermsAndAgreement (request, function (err, results) {
          if (!err) {
            reply.redirect ("/all-login");
          } else {
            reply.redirect ("/not-found");
          }
        });
      }
    },
    notFound: function (request, reply) {
      return reply.view('not-found.html', {title: 'Agent Agreement - ' + UIConstants.TITLE},
          {layout: 'layout'});
    },
    verified: function (request, reply) {
      return reply.view('verified.html', {title: 'Verified user - ' + UIConstants.TITLE},
          {layout: 'layout'});
    },
    chatPluginDemo: function (request, reply) {
      return reply.view('chat_plugin_demo.html', {title: 'Chat Plugin Demo - ' + UIConstants.TITLE},
          {layout: 'layout'});
    },
    addInitialTripDetails: function (request, reply) {
      initialTripDetails.addInitialTripDetails (request.payload, function (err, results) {
         var result = {result: 'failed'};
         if (!err) {
           result = {result: 'success'};
         } else {
           logger.error ("Error while adding initial-trip-details: " + err);
         }
         reply(result).type (constants.JSON);
      });
    },
    home: function (request, reply) {
        var user = request.auth.credentials;
        if (user.type === users.User.TYPE.AGENT) {
            async.parallel([
              //get affiliate jobs
              function (callback) {
                trips.getAgentAffiliateJobs(user.email, request.query.s, function(err, result){
                  callback (err, result);
                });
              },
              //get jobs
              function (callback) {
                trips.getAgentJobs(user.email, request.query.s, function(err, result){
                  callback (err, result);
                });
              },
              //get active client jobs
              function (callback) {
                trips.getAgentActiveClients(user.email, function(err, result){
                  callback (err, result);
                });
              }
            ],

            function (err, results) {

                if (err) return reply(new Error(""));

                return reply.view("components/agent/JobBoard/JobBoard.jsx", {
                  pageTitle: UIConstants.TITLE + " -  Home",
                  meta: {
                    author: 'AgentAvery, Inc.',
                    description: 'Customized vacation planning - as easy as texting a friend.',
                    keywords: 'AgentAvery, Agent Avery, plan a trip, plan my trip, customized vacation planning, honeymoon planning, cruise booking, activity planning',
                  },
                  title: UIConstants.TITLE,
                  userName: user.firstName + ' ' + user.lastName,
                  activeTab: 'home',
                  affiliateJobs: results[0],
                  jobs: results[1],
                  activeClients: results[2]
                });
            });

        } else if (user.type === users.User.TYPE.TRAVELER) {
            return userWelcomePage(reply, user.firstName);
        } else if (user.type === users.User.TYPE.ADMIN)  {
          var paAgentsList;
          var allAgentsList;
          var facebookTrips;
          async.parallel([
            //get agents with status 'approval pending'
            function (callback) {
              users.getAgentsByStatus(users.User.STATUS.PENDING_APPROVAL, function(err, result) {
                if (!err) {
                  paAgentsList = result;
                }
                callback (err);
              });
            },
            //get all agents
            function (callback) {
              users.getAllAgents(function(err, result){
                if (!err) {
                  allAgentsList = result;
                }
                callback (err);
              });
            },
            // Get facebook trips.
            function (callback) {
              trips.getActiveFacebookTrips(function (err, trips) {
                if (!err) {
                  facebookTrips = trips;
                }
                callback(err);
              });
            },
          ],

          function (err, results) {
              if (err) return reply(new Error(""));

              return reply.view("components/admin/Home/Home.jsx", {
                pageTitle: UIConstants.TITLE + " -  Admin",
                meta: {
                  author: 'AgentAvery, Inc.',
                  description: 'Customized vacation planning - as easy as texting a friend.',
                  keywords: 'AgentAvery, Agent Avery, plan a trip, plan my trip, customized vacation planning, honeymoon planning, cruise booking, activity planning',
                },
                title: UIConstants.TITLE + " -  Admin",
                pendingApprovalAgents: paAgentsList,
                allAgents: allAgentsList,
                facebookTrips: facebookTrips
              });
          });
        } else {
          if (err) return reply(new Error(""));
        }
    },
    loginHtml: function (request, reply) {
      return reply.view('login.html', {title: 'Agent Login - ' + UIConstants.TITLE},
        {layout: 'layout-login'});
    },
    login: function (request, reply) {
      if (request.auth.credentials) {
        return reply().redirect("/home");
      } else {
        return reply.view('login.html', {title: 'Agent Login - ' + UIConstants.TITLE},
          {layout: 'layout-login'});
      }
    },
    agentAccountUpdate: function (request, reply) {
      var user = request.auth.credentials;
      users.agentAccountUpdate(user, request.payload, function (err, result) {
          if (!err) {
              reply({success: true});
          } else {
              reply({success: false, message: "Failed to update agent account."});
          }
      });
    },
    getAgentProfilePublic: function (request, reply) {
      users.getAgentProfile({_id: request.params.userId}, function (err, result) {
          if (!err && result) {
              reply(result);
          } else {
              reply({success: false, message: "Failed to get agent profile."});
          }
      });
    },
    getAgentProfile: function (request, reply) {
      users.getAgentProfile(request.auth.credentials, function (err, result) {
          if (!err && result) {
              reply(result);
          } else {
              reply({success: false, message: "Failed to get agent profile."});
          }
      });
    },
    //generic user operations
    deactivateAccount: function (request, reply) {
      var user = request.auth.credentials;
      users.deactivateAccount(user, function (err, result) {
          if (!err) {
              reply({success: true});
          } else {
              reply({success: false, message: "Failed to deactivate the account."});
          }
      });
    },
    activateAccount: function (request, reply) {
      var user = request.auth.credentials;
      users.activateAccount(user, function (err, result) {
          if (!err) {
              reply({success: true});
          } else {
              reply({success: false, message: "Failed to activate the account."});
          }
      });
    },
    resendConfirmationEmail: function (request, reply) {
      var user = request.auth.credentials;
      users.resendConfirmationEmail(user, function (err, result) {
          if (!err) {
              reply({success: true});
          } else {
              reply({success: false, message: "Failed to resend confirmation email."});
          }
      });
    },
    resendAgentAgreementEmail: function (request, reply) {
      var user = request.auth.credentials;
      validateAdminRole (user, function (err) {
        if (!err) {
          users.resendAgentAgreementEmail(request.params.agentId, function (err, result) {
              if (!err) {
                  replySuccess(reply);
              } else {
                  replyFailed(reply, "Failed to resend agent agreement email.");
              }
          });
        } else {
          replyFailed(reply);
        }
      });
    },
    notifySupportForAgentAccountApproval: function (request, reply) {
      var user = request.auth.credentials;
      users.notifySupport(user, "Agent account approval not completed", function (err, result) {
          if (!err) {
              reply({success: true});
          } else {
              reply({success: false, message: "Failed to notify support. Please try again later."});
          }
      });
    },
    getAgentJobs: function (request, reply) {
      var user = request.auth.credentials;
      trips.getAgentJobs(user.email, function(err, result) {
        if (err) {
          return reply(new Error(""));
        }
        return reply(result).type(constants.JSON);
      });
    },
    updateAgentAccount: function (request, reply) {
      var user = request.auth.credentials;
      users.updateAgentAccount(user, request.payload, function(err, result) {
        if (!err) {
          return replySuccess(reply);
        }
        return replyFailed(reply);
      });
    },
    approveAgent: function (request, reply) {
      var user = request.auth.credentials;
      validateAdminRole (user, function (err) {
        if (!err) {
          users.approveAgent(request.params.agentId, function(err, result) {
            if (!err) {
              return replySuccess(reply);
            }
            return replyFailed(reply);
          });
        } else {
          replyFailed(reply);
        }
      });
    },
    getAgentActiveClients: function (request, reply) {
      var user = request.auth.credentials;
      trips.getAgentActiveClients(user.email, function(err, result) {
        if (err) {
          return reply(new Error(""));
        }
        return reply(result).type(constants.JSON);
      });
    },
    //user app apis
    getNewChats: function (request, reply) {
      getUserChats(request, reply, TripStatus.CHAT_INITIATED);
    },
    getActiveChats: function (request, reply) {
      getUserChats(request, reply, TripStatus.CHAT_STARTED);
    },
    getInvitedChats: function (request, reply) {
      var user = request.auth.credentials;
      trips.getInvitedUserChats(user.email, function(err, result) {
        if (!err) {
          return reply(result).type(constants.JSON);
        }
        return replyFailed(reply);
      });
    },
    account: function (request, reply) {
        var user = request.auth.credentials;
        if (user.type === users.User.TYPE.AGENT) {
            async.parallel([
              //get active client jobs
              function (callback) {
                trips.getAgentActiveClients(user.email, function(err, result){
                  callback (err, result);
                });
              },
              //get latest user
              function (callback) {
                users.findSingleUser({_id: user._id}, function(err, dbuser){
                  user = dbuser;
                  callback (err);
                });
              }
            ],
            function (err, results) {

                if (err) return reply(new Error(""));

                return reply.view("components/agent/Account/Account.jsx", {
                  pageTitle: UIConstants.TITLE + " -  Account",
                  title: UIConstants.TITLE,
                  userName: user.firstName + ' ' + user.lastName,
                  activeTab: 'account',
                  user: user,
                  activeClients: results[0]
                });
            });

        } else {
            return reply().redirect("/");
        }
    },
    numActiveChatsForTrip : function (request, reply) {
      var user = request.auth.credentials;
      trips.findTrip(request.params.tripid, user.email, function(err, result) {
        if (!err && result.length > 0) {
          trips.getNumActiveChats (result[0].initialTripDetailsId, function (err, num) {
            if (!err) {
              reply(num);
            } else {
              replyStatusFailed (reply);
            }
          });
        } else {
          replyStatusFailed (reply);
        }
      });
    },
    findTrip: function (request, reply) {
      var user = request.auth.credentials;
      trips.findTrip(request.params.tripid, user.email, function(err, result) {
        if (!err && result.length > 0) {
          return reply(result[0]).type(constants.JSON);
        }
        reply({status: 'failed'}).type(constants.JSON);
      });
    },
    updateTrip: function (request, reply) {
      var user = request.auth.credentials;
      function callback(err, result) {
        if (!err) {
          return reply({status: 'success'}).type(constants.JSON);
        }
        reply({status: 'failed'}).type(constants.JSON);
      }

      validateAdminRole(user, function (err) {
        if (err) {
          trips.updateTrip(request.params.tripId, user.email, request.payload, callback);
        } else {
          console.log('Admin trip update: ', request.params.tripId, request.payload);
          trips.updateTripUnsafe(request.params.tripId, request.payload, callback);
        }
      });
    },
    updateItenerary: function (request, reply) {
      var user = request.auth.credentials;
      trips.updateTrip(request.params.tripid, user.email, request.payload, function(err, result) {
        if (!err) {
          return reply({status: 'success'}).type(constants.JSON);
        }
        reply({status: 'failed'}).type(constants.JSON);
      });
    },
    emailItenerary: function (request, reply) {
      var user = request.auth.credentials;
      trips.sendItinerary(request.params.tripid, user.email, function(err, result) {
        if (!err) {
          return reply({status: 'success'}).type(constants.JSON);
        }
        reply({status: 'failed'}).type(constants.JSON);
      });
    },
    shareItenerary: function (request, reply) {
      var user = request.auth.credentials;
      trips.shareItenerary(request.params.tripid, user.email,
          request.payload, function(err, result) {
        if (!err) {
          return reply({status: 'success'}).type(constants.JSON);
        }
        console.log(err);
        reply({status: 'failed'}).type(constants.JSON);
      });
    },
    getItinerary: function (request, reply) {
      var user = request.auth.credentials;
      trips.getItinerary(request.params.tripid, user.email, function(err, result) {
        if (!err) {
          return reply({success: true, itinerary: result}).type(constants.JSON);
        }
        replyFailed(reply);
      });
    },
    inviteToTrip: function (request, reply) {
      var user = request.auth.credentials;
      trips.inviteToTrip(user, request.params.tripid,
          request.payload, null, null, function(err, result) {
        if (!err) {
          return replySuccess(reply);
        }
        console.log(err);
        replyFailed(reply);
      });
    },
    isOwnerOfTrip: function (request, reply) {
      var user = request.auth.credentials;
      trips.isOwnerOfTrip(user, request.params.tripid,
          function(err, result) {
        if (!err) {
          if (result) {
            return replySuccess(reply);
          } else {
            return replyFailed(reply);
          }
        }
        replyFailed(reply);
      });
    },
    createTripPayment: function (request, reply) {
      var user = request.auth.credentials;
      payments.createTripPayment(request.payload, function(err, result) {
        if (!err) {
          return reply({status: 'success', id: result._id, amount: result.amount}).type(constants.JSON);
        }
        reply({status: 'failed'}).type(constants.JSON);
      });
    },
    getTripPayment: function (request, reply) {
      payments.getTripPayment(request.params.trippaymentid, function(err, results) {
        if (!err && results.length > 0) {
          return reply({status: 'success', trippayment: results[0]}).type(constants.JSON);
        }
        reply({status: 'failed'}).type(constants.JSON);
      });
    },
    //gets trip payment details without itemization
    getTripPaymentShort: function (request, reply) {
      payments.getTripPayment(request.params.trippaymentid, function(err, results) {
        if (!err && results.length > 0) {
          var tp = results[0];
          delete tp.itemization;
          return reply({status: 'success', trippayment: tp,}).type(constants.JSON);
        }
        reply({status: 'failed'}).type(constants.JSON);
      });
    },
    updateTripPayment: function (request, reply) {
      var user = request.auth.credentials;
      payments.updateTripPayment(request.params.trippaymentid, request.payload, function(err, result) {
        if (!err) {
          return reply({status: 'success', id: result._id, amount: result.amount}).type(constants.JSON);
        }
        reply({status: 'failed'}).type(constants.JSON);
      });
    },
    //files
    getFile: function (request, reply) {
      files.getFile (request.params.id, function (err, result) {
        if (!err) {
          return reply(result.readstream).header('Content-Type', result.contentType);
        }
        console.log(err);
        reply(new Error("Failed to find a file."));
      });
    },
    uploadFile: function (request, reply) {
      var user = request.auth.credentials;
      files.saveFile (request.payload.file, request.payload, user._id, function (err, result) {
        if (!err) {
          return reply(result).type(constants.JSON);
        }
        console.log(err);
        reply(new Error("Failed to save file."));
      });
    },
    deleteFile: function (request, reply) {
      var user = request.auth.credentials;
      files.deleteUserFile (request.params.id, user._id, function (err, result) {
        if (!err) {
          return replySuccess(reply);
        }
        console.log(err);
        return replyFailed(reply);
      });
    },
    uploadCKEditorImage: function (request, reply) {
      var user = request.auth.credentials;
      files.saveFile (request.payload.upload, request.payload, user._id, function (err, result) {
        if (!err) {
          return reply({uploaded: 1, fileName: result.n, url: constants.BASEURL + '/file/' + result.id});
        }
        reply({uploaded: 0, error: {message: "Failed to upload the image to server. Please try later."}}).type(constants.JSON);
      });
    },
    chat: function (request, reply) {
      var user = request.auth.credentials;

      if (user.type === users.User.TYPE.AGENT) {
        var context = {
          pageTitle: UIConstants.TITLE + ' -  Chat',
          title: UIConstants.TITLE,
          name: user.firstName,
          activeChat: request.query.id
        };

        async.series([
          // Get chat.
          function (callback) {
            trips.startTripChat(
              user.email, request.query.id, request.query.introText, function (err, result) {
                if (!err) {
                  context.trip = result;
                }
                callback(err, result);
              }
            );
          },

          // Get active client jobs.
          function (callback) {
            trips.getAgentActiveClients(user.email, function (err, result) {
              if (!err) {
                context.activeClients = result;
              }
              callback(err);
            });
          }
        ], function (err, results) {
          if (!err) {
            return reply.view('components/agent/Chat/Chat.jsx', context);
          }
          console.log(err);
          return reply(new Error(''));
        });
      } else if (user.type === users.User.TYPE.ADMIN) {
        trips.getTripChat(request.query.id, function (err, result) {
          if (!err) {
            return reply.view('components/admin/Chat/Chat.jsx', result);
          }
          console.log(err);
          return reply(new Error(''));
        });
      } else {
        return reply().redirect('/');
      }
    },
    chatUnreadMessageCount : function (request, reply) {
       var user = request.auth.credentials;
       var chatId = request.params.chatid;
       chatMessageService.getUnreadMessageCount(chatId, user._id, function(err, result) {
         if (!err) {
           return reply ({success: true, count: parseInt(result)});
         } else {
           return replyFailed(reply);
         }
       });
    },
    chatClearUnreadMessages : function (request, reply) {
       var user = request.auth.credentials;
       var chatId = request.params.chatid;
       chatMessageService.clearUnreadMessages(chatId, user._id, function(err, result) {
         if (!err) {
           return replySuccess(reply);
         } else {
           return replyFailed(reply);
         }
       });
    },
    declineChat : function (request, reply) {
       var user = request.auth.credentials;
       var chatId = request.params.chatid;
       trips.declineChat (user.email, chatId, request.payload, function (err, result) {
          if (!err) {
            return reply ({status: 'success'});
          }
          reply ({status: 'failed'});
       });
    },
    endChat : function (request, reply) {
       var user = request.auth.credentials;
       var chatId = request.params.chatid;
       trips.endChat (user.email, chatId, request.payload, function (err, result) {
          if (!err) {
            return reply ({status: 'success'});
          }
          reply ({status: 'failed'});
       });
    },
    markChatAsSuccess : function (request, reply) {
       var user = request.auth.credentials;
       var chatId = request.params.chatid;
       trips.markChatAsSuccess (user.email, chatId, function (err, result) {
          if (!err) {
            return replySuccess(reply);
          }
          replyFailed (reply);
       });
    },
    startChat : function (request, reply) {
       var user = request.auth.credentials;
       var chatId = request.params.chatid;
       trips.startChat (user.email, chatId, function (err, result) {
          if (!err) {
            return reply ({status: 'success'});
          }
          reply ({status: 'failed'});
       });
    },
    clearChat : function (request, reply) {
       var user = request.auth.credentials;
       var chatId = request.params.chatid;
       validateAdminRole (user, function (err) {
         if (!err) {
           chatMessageService.clearChat(chatId, function (err) {
             if (!err) {
               replySuccess (reply);
             } else {
               console.log("Clearing the chat error: ", err);
               replyError (reply);
             }
           });
         } else {
           replyFailed (reply);
         }
       });
    },
    userinfo: function (request, reply) {
        var user = request.auth.credentials;
        users.findSingleUser({_id: user._id}, function (err, dbuser) {
          if (!err && dbuser) {
            reply ({id: dbuser._id, email: dbuser.email, name: dbuser.firstName, img: dbuser.image,
              newMessageSoundEnabled: (dbuser.notificationPrefs && dbuser.notificationPrefs.sounds)?
                    dbuser.notificationPrefs.sounds.new_message : false});
          } else {
            reply ({});
          }
        });
    },
    isSessionTimedout: function (request, reply) {
        var user = request.auth.credentials;
        if (user) {
          reply (0);
        } else {
          reply (1);
        }
    },
    //utility checks
    confirm: function (request, reply) {
        users.confirmEmail(request.query.email, request.query.ccode, function (err, result) {
            var redirectPath = "/not-found";
            if (!err || (err && err.verified)) {
                //go to welcome page for users if verified for first time else the login
                if (result && result.type === users.User.TYPE.TRAVELER) {
                  if (err && err.verified) {
                    redirectPath = "/userapp#/verified";
                  } else {
                    //return userWelcomePage(reply, result.firstName);
                    redirectPath = "/userapp#/welcome?u=" + result.firstName;
                  }
                }
                else if (result && result.type === users.User.TYPE.AGENT) {
                  //redirect to agent agreement if verified for first time else the login
                  if (err && err.verified) {
                    redirectPath = "/verified";
                  } else {
                    redirectPath = "/agent-agreement?u="+result.firstName+"&ui="+result._id;
                  }
                }
            }
            reply.redirect(redirectPath);
        });
    },
    forgotPassword: function (request, reply) {
      if (request.method === 'get') {
        return reply.view('forgot-password.html', {title: 'Forgot Password - ' + UIConstants.TITLE}, {layout: 'layout-login'});
      } else {
        users.forgotPassword(request.payload.email, function (err, result) {
            if (!err) {
                reply({success: true, message: "Email has been sent to '" + request.payload.email +
                      "' to reset your password."});
            } else {
                reply({success: false, message: "Sorry, doesn't look like '" + request.payload.email +
                      "' is registered with " + constants.TITLE + "."});
            }
        });
      }
    },
    resetPassword: function (request, reply) {
        //check if get/post
        if (request.method === 'get') {
           users.validateResetPassword (request.query.email, request.query.rpcode, function (err, result) {
              if (!err && result) {
                  var hidden_field = "<input type=\"hidden\" name=\"{0}\" value=\"{1}\"/>";
                  return reply.view('reset-password.html', {title: 'Reset Password - ' + UIConstants.TITLE,
                  hidden_fields: utils.format(hidden_field, 'email', request.query.email) +
                    utils.format(hidden_field, 'token', request.query.rpcode)}, {layout: 'layout-login'});
              } else {
                  return reply({statusCode: 404});
              }
           });
        }
        else {
          users.resetPassword(request.payload.email, request.payload.password,
              request.payload.token, function (err, result) {
              if (!err) {
                  var redirect = "/login";
                  if (result &&
                      result.type === users.User.TYPE.TRAVELER) {
                    redirect = "userapp#/login";
                  }
                  return reply({success: true, message: "Password has been reset for '" + request.payload.email +
                        "'. You will be redirected to Login shortly.", redirect: redirect});
              } else {
                  return reply({success: false, message: "Sorry, password reset failed for '" +
                        request.payload.email + "."});
              }
          });
        }
    },
    checkDuplicateEmail: function (request, reply) {
        users.userExists(request.query.email, function (err, result) {
            var response = {statusCode: 200};
            if (!err && result) {
                response = new Error({statusCode: 404});
            }
            return reply(response);
        });
    },
    getAgentInfoByTripId: function (request, reply) {
        var response = {};
        var agentEmail;
        async.series ([
          //find the trip
          function (callback) {
              trips.Trip.find ({_id: request.params.chatid})
                .select({agentEmail: 1}).exec(function (err, result) {
                if (!err && result && result.length > 0) {
                  agentEmail = result[0].agentEmail;
                }
                callback();
              });
          },
          //get the user info
          function (callback) {
            if (!agentEmail) {
              callback();
            } else {
              users.User.find ({email: agentEmail}).select({
                  email: 1, image: 1, firstName: 1
              }).exec(function (err, result) {
                  console.log(err, result);
                  if (!err && result && result.length > 0) {
                    response = {
                      name: result[0].firstName,
                      image: result[0].image,
                      email: result[0].email
                    };
                  } else {
                    response = {status: "failed"};
                  }
                  callback();
              });
            }
          }
        ], function (err, results) {
            reply(response).type(constants.JSON);
        });
    },

    updateProfilePicture: function (request, reply) {
      var user = request.auth.credentials;
      var newProfilePictureFile = request.payload.file;
      users.updateProfilePicture (user, newProfilePictureFile, function (err, result) {
        if (!err) {
          //update the session object to reflect the changed profile picture
          request.auth.credentials.image = newProfilePictureFile;
          replySuccess (reply);
        } else {
          replyFailed (reply);
        }
      });
    },

    fbMessengerWebhookVerify: function (request, reply) {
      console.log(request);
      if (request.query['hub.mode'] === 'subscribe' &&
          request.query['hub.verify_token'] === '941985') {
        console.log("Validating webhook");
        reply(request.query['hub.challenge']);
      } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        reply(boom.forbidden('Failed validation'));
      }
    }
};
