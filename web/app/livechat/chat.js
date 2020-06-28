var async = require('async');
var pub = require('redis-connection')();
var sub = require('redis-connection')('subscriber');
var statehood = require('statehood');
var trips = require('../controllers/trips');
var Trip = trips.Trip;
var users = require('../controllers/users');
var User = users.User;

var chatCommon = require('./common');
var fbCommon = require('../messenger/common');

var SocketIO = require('socket.io')({
  'transports': ['websocket', 'flashsocket','htmlfile','xhr-polling','jsonp-polling']
});
//var logger = require("../logger").logger;
var io;

var ENV = require('../env').ENVIRONMENT;

if (ENV == "PROD") {
  //TBD do the auth
}

/**
  Handles the new chat connections and sets up the socket for handling the SocketIO events
  */
function chatHandler (socket) {

  socket.on('io:join', function (data) {
    //Validate
    if (!data.c || !data.u || !data.uid) {
      console.error("Error for io:join - chat or user or email or user id  is not specified. " + JSON.stringify(data));
      return;
    }
    //TBD: Authorization
    pub.HSET("user", socket.client.conn.id, data.u);
    pub.HSET("uid", socket.client.conn.id, data.uid);
    socket.join(data.c);

    //TODO, send fb message that user has joined

    //TBD: set up a unread message counter for this user if it doesn't already exist
    pub.HSETNX ("unread_count:" + data.c, data.uid, 0);
    pub.publish("io:join", JSON.stringify(data));
    sendAllTripUsersInfo (data.c);
  });

  socket.on('io:typing', function (data) {
    //Validate
    if (!data.c) {
      console.error("Error for io:typing - chat not specified. " + JSON.stringify(data));
      return;
    }
    //TBD: Authorization
    pub.HGET("uid", socket.client.conn.id, function (err, uid) {
      if (!err) {
        var typing = JSON.stringify({
        	c: data.c,
        	uid: uid
        });

        //TODO, call fb messenger handler

        pub.publish("io:typing", typing);
      } else {
        console.error("Error for io:msg - " + err);
      }
    });
  });

  socket.on('io:leave', function (data) {
    //Validate
    if (!data.c) {
      console.error("Error for io:leave - chat not specified. " + JSON.stringify(data));
      return;
    }
    //TBD: Authorization
    pub.HGET("uid", socket.client.conn.id, function (err, uid) {
      if (!err) {
        var leave = JSON.stringify({
        	c: data.c,
        	uid: uid
        });
        socket.leave(data.c);

        //TODO, call fb messenger handler

        pub.publish("io:leave", leave);
      } else {
        console.error("Error for io:msg - " + err);
      }
    });
  });

  socket.on('io:msg', function (data) {
    //Validate
    if (!data.c || (!data.m && !data.f &&
                      !data.p)) {
      console.error("Error for io:msg - chat or message or files or service fee are not specified. " +
        JSON.stringify(data));
      return;
    }
    //TBD: Authorization
    async.parallel([
      function (callback) {
        pub.HGET("uid", socket.client.conn.id, function (err, uid) {
          if (!err) {
            data.uid = uid;
          }
          callback (err);
        });
      },
      function (callback) {
        pub.HGET("user", socket.client.conn.id, function (err, user) {
          if (!err) {
            data.u = user;
          }
          callback (err);
        });
      },

      //TODO call fb messenger handler
      function (callback) {
        callback ();
      }

    ], function (err, results) {
      if (!err) {

        chatCommon.saveAndPublishMessage (data);

        //call fb messenger handler
        fbCommon.sendAAMessage (data, function (err, result) {
          if (err) {
            logger.error ("Failed to send message to fb messenger: " + err);
          }
        });

      } else {
        console.error("Error for io:msg - " + err);
      }
    });

  });

  socket.on('error', function (err) {
    console.error(err.stack);
  });

}

function sendAllTripUsersInfo (chatId) {
  var chatUsersInfo;
  async.series ([
    //collect all user emails in the chat
    function (callback) {
      trips.getAllTripUsersInfo (chatId, function (err, result) {
        if (!err) {
          chatUsersInfo = result;
        }
        callback (err);
      });
    }
  ], function (err, result) {
      if (!err && chatUsersInfo) {
        var usersInfoMsg = {
          c: chatId,
          usersinfo: chatUsersInfo
        };
        pub.publish ("io:usersinfo", JSON.stringify (usersInfoMsg));
      }
  });
}

/**
  Initialization of SocketIO for chat
*/
function init (listener, callback) {

  //subscribe to the events to be relayed
  sub.subscribe("io:msg:latest", "io:join", "io:typing", "io:leave", "io:usersinfo");

  // now start the socket.io
  io = SocketIO.listen(listener);

  // use hapi auth cookie/session for authentication on socket io
  var def = new statehood.Definitions({
      encoding: 'iron',
      password: 'aa-auth-passwd'
  });

  io.set('authorization', function (handshakeData, accept) {
      if (handshakeData.headers.cookie) {
          def.parse(handshakeData.headers.cookie, function (err, state, failed) {

              return accept(null, true);

              if (!err && state &&
                  state.aa_auth) {
                var session = state.aa_auth.sid;
                if (session) {
                    // TBD: validate session information with information in database.
                    logger.info("SocketIO: session identified!");
                    //return accept(null, true);
                } else {
                    logger.error ("SocketIO: Session not found!");
                    //return accept(null, false);
                }
              } else {
                logger.error ("SocketIO: Failed to parse the cookie: " + err);
                //return accept(null, false);
              }

          });
      } else {
          //logger.error ("SocketIO: Cookie not transmitted!");
          return accept('No cookie transmitted.', false);
      }
      accept(null, false);
  });

  //assign the connection handler
  io.on('connection', chatHandler);

  //relay the messages to the respective chats
  sub.on("message", function (channel, message) {
       message = JSON.parse(message);
       if (!message.c) {
         //logger.error("No chatid found for msg: " + JSON.stringify(message));
       } else {
         io.to(message.c).emit(channel, message);
       }
  });

  //allow for socket to boot up
  setTimeout(function(){ callback(); }, 250);
}

module.exports = {
  init: init,
  pub: pub,
  sub: sub
};
