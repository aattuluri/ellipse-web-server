var Hoek = require('hoek');
var Bcrypt = require ('bcrypt');
var config = require('../config');
var Routes = require('./routes');
var logger = require('../logger');
var users = require ('../controllers/users');
var uuid = require ('uuid');

var User = require('../models/user').User;

const Providers = config.get('auth:providers');

exports.register = function(plugin, options, next) {

    //app cache to store user information once logged in.
    var cache = plugin.cache({
        expiresIn: 1 * 24 * 60 * 60 * 1000,
        cache: 'redisSessionCache'
    });
    plugin.app.cache = cache;

    //Bind the object to the plugin to be accessible in handlers
    plugin.bind({
        cache: plugin.app.cache
    });

    //Add Multiple strategies here and we have used confidence to pick up the configuration.
    plugin.auth.strategy('facebook', 'bell', Providers.facebook);

    plugin.auth.strategy('google', 'bell', Providers.google);

    plugin.auth.scheme('aa-auth', function (server, options) {

        var settings = Hoek.clone(options);

        var scheme =  {

            authenticate: function (request, reply) {
              // authentication doesn't anything, we just keep it
              // cause it's a required function?
              return reply.continue({
                credentials: {}
              });
            },
            payload: function (request, reply) {

              var email = request.payload.email;
              var password = request.payload.password;

              settings.validateFunc(request, email, password, function (err, isValid, credentials) {

                  credentials = credentials || null;

                  if (!err && isValid) {
                      request.auth.credentials = credentials;
                      request.auth.isAuthenticated = true;
                  } else {
                      return reply({success: false, statusCode: 422, message: "Invalid email or password"});
                  }
                  return reply.continue({ credentials: credentials });
              });
            },
            options: {
              payload: true
            }
        };
        return scheme;
    });

    plugin.auth.strategy('aa-auth', 'aa-auth', {
        validateFunc: function (request, email, password, callback) {
          users.findUser({email: email}, function (err, results) {
              if (!results || results.length === 0) {
                  console.log("No user found with email: " + email);
                  return callback ("Bad username/password", false);
              }
              var user = results[0];
              Bcrypt.compare(password, user.secret, function (err, isValid) {
                  if (!err && isValid) {
                        var sid = uuid.v4();
                        delete user.secret;
                        user.id = sid;
                        User.update({email: email}, {invalidLoginAttempts: 0,
                          lastLogin: new Date()},
                          function (err, result) {
                            return callback (null, true, user);
                        });
                  } else {
                      var invalidLoginAttempts = user.invalidLoginAttempts + 1;
                      User.update({email: email}, {lastInvalidLogin: new Date(), invalidLoginAttempts: invalidLoginAttempts},
                        function (err, result) {
                           return callback ("Bad username/password", false);
                      });
                  }
              });
          });
        }
    });

    plugin.auth.strategy('session', 'cookie', {
        password: 'aa-auth-passwd',
        cookie: 'aa_auth',
        redirectTo: '/login',
        isSecure: false,
        validateFunc: function(request, session, callback) {
	        cache.get(session.sid, function(err, cached) {
                if (err) {
                    return callback(err, false);
                }

                if (!cached) {
                    return callback(null, false);
                }

               	return callback(null, true, cached.account);
		      });
        },
        clearInvalid: true
    });
    //Added a separate file for just routes.
    plugin.route(Routes);
    next();
};

exports.register.attributes = {
    pkg: require("./package.json")
};
