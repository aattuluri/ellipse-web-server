var users = require("../controllers/users");
var logger = require("../logger").logger;
var async = require("async");
var uuid = require ("uuid");

var USER_APP_PATH = "/userapp#";

//Handler functions used by the routes.
function sessionManagement(request, reply) {

    /*session management using hapi-cookie*/

    var account = request.auth.credentials;
    var sid = null;
    var sm = this;
    async.series ([
      //parse account information and create/retrieve account if needed
      function (callback) {
        //agent avery login
        if (!account.profile) {
            sid = account.id;
            callback (null);
        }
        //facebook/google login
        else {
            //create the user if new, else just return the user from db
            verifyAndCreateUserIfNew (account, function (err, newUser) {
                if (!err) {
                  account = newUser;
                  sid = uuid.v4();
                }
                callback (err);
            });
        }
      },
      //set the session cache
      function (callback) {
        sm.cache.set(sid, {
            account: account
        }, 0, function(err) {
            if (!err) {
                request.auth.session.set({
                  sid: sid
                });
            }
            callback (err);
        });
      }
    ], function (err, results) {
        //upon successful login redirect based on user type
        console.log(account.provider);
        if (!err) {
          // if (account.provider == "google" ||
          //         account.provider == "facebook") {
          //   return reply({success: true, redirect: "/home"});
          // } else {
            return reply({success: true, redirect: "/home"});
          //}
        }
        logger.error ("Login failed with error: " + err);
        //upon failure redirect based on authentication type
        if (account.provider == "google" ||
              account.provider == "facebook" ) {
           return reply.redirect(USER_APP_PATH + '/login?e=1');
        }
        //this is for aa login which will be used via ajax
        reply({success: false, message: "Login failed."});

    });
}

function verifyAndCreateUserIfNew (account, cb) {
    var user;
    var parsed;
    async.series ([
        //parse social login response
        function (callback) {
          parsed = parseSocialLoginResponse (account);
          callback (null);
        },
        //find user
        function (callback) {
          users.findUser ({email: parsed.email}, function (err, result) {
            if (!err && result && result.length > 0) {
              user = result[0];
            }
            callback (err);
          });
        },
        //add user if required
        function (callback) {
          if (!user) {
            users.createUser (parsed, function (err, result) {
              if (!err) {
                 user = result;
              }
              callback (err, result);
            });
          } else {
            //user has signed up using AA
            if (user.secret) {
                callback ("Duplicate email. " +
                    "Looks like you signed up with this email on agentAvery.com. Use the login below.");
            } else {
                callback (null);
            }
          }
        }
    ], function (err, results) {
       //inject provider into the user session object
       user.provider = account.provider;
       cb (err, user);
    });
}

exports.sessionManagement = sessionManagement;

function parseSocialLoginResponse (account) {

  var parsed = {};
  var profile = account.profile;

  if (account.provider == "google") {
    parsed.email = profile.emails[0].value;
    parsed.firstName = profile.name.givenName;
    parsed.lastName = profile.name.familyName;
  }

  if (account.provider == "facebook") {
    parsed.email = profile.email;
    parsed.firstName = profile.name.first;
    parsed.lastName = profile.name.last;
  }

  return parsed;

}

//google oauth response object
/*

{ provider: 'google',
  token: 'ya29.mAIfD_RpShJ0O1HqEHOXJsj3I-rE31sbochJk6YuEctuSGZGVbQNib4BIhG8-S2hKw',
  refreshToken: undefined,
  expiresIn: 3600,
  query: {},
  profile:
   { id: '107966143920942594146',
     displayName: 'Anil Kumar Attuluri',
     name: { familyName: 'Attuluri', givenName: 'Anil Kumar' },
     emails: [ [Object] ],
     raw:
      { kind: 'plus#person',
        etag: '"4OZ_Kt6ujOh1jaML_U6RM6APqoE/GvcmZkjEGFKRQiqTBC1EuGr7zb8"',
        gender: 'male',
        emails: [Object],
        urls: [Object],
        objectType: 'person',
        id: '107966143920942594146',
        displayName: 'Anil Kumar Attuluri',
        name: [Object],
        url: 'https://plus.google.com/107966143920942594146',
        image: [Object],
        isPlusUser: true,
        language: 'en',
        circledByCount: 181,
        verified: false } } }
160229/221051.264, [response], http://localhost:3001: get /auth/google {"state":"NxKxXM46GGCO_jqQ5H6_yP","code":"4/uTxXahn-coHpHUe_cOEPcnmjrzLIKA7lCU2rotvQtIM"
}

*/

//facebook oauth response object
/*
{ provider: 'facebook',
  token: 'CAACQWcKXPJABABrzOybV6yPZCXl81u5Rq9AnYaYZAQF6eQsEtZAj9ynk3ozrVBhH8nyxZAZBPXA03vKGZCGgZBJdBcFQZAE6dSj88Na5DjI14pLGekyFQZBkgzKzw2Bc4TgelEWXZCqBpg40sNQQ0YLyFIU0H0usC76QAZBRP6aEEG7NsROEaL5chzmDY9ZAfWRt3XyKjwqVOZBgpsAZDZD',
  refreshToken: undefined,
  expiresIn: 5184000,
  query: {},
  profile:
   { id: '10153266765191924',
     username: undefined,
     displayName: 'Anil Kumar Attuluri',
     name: { first: 'Anil', last: 'Attuluri', middle: 'Kumar' },
     email: 'anilcs0405@gmail.com',
     raw:
      { id: '10153266765191924',
        name: 'Anil Kumar Attuluri',
        email: 'anilcs0405@gmail.com',
        first_name: 'Anil',
        last_name: 'Attuluri',
        middle_name: 'Kumar',
        gender: 'male',
        link: 'https://www.facebook.com/app_scoped_user_id/10153266765191924/',
        locale: 'en_US',
        timezone: -8,
        updated_time: '2015-08-01T19:31:45+0000',
        verified: true } } }
160229/221115.267, [response], http://localhost:3001: get /auth/facebook {"code":"AQB996s6FLDp227q2yUP0L6-oCpw8QFzd81ohSKeyFKpeVgAM40Om9GWaxP2qmwGIjIt4pdnMhre8z5PaKmugyjZrR_yoHFAUXm-l6wQ2bzyMCSZTb-6bTxN7WBR5irxiJQ9NiWhsQ8NVbIeJhTNtP67drB7LAPBT_o4dPjbK8Ui9mT1R5bemWI2shpos2cKRAIARDHJ2SWMVoGuXo3-8f7qN5NZ1QxHUV_KdyV6Y-Uf3JLxE4k2-i1A2Dl2pjb1sX75HBOZG8UM-oCGh3oQ61HoaIbHKDcPpJxbKHjImJtxEvKvtZeIwsXzGIX7i4VL_iEhgEWyd6Rd47rwFSGH6jWKnLstzbNjC4rwlyAM5T05gQ","state":"9gmR-mCxug2tVdlh13ZLsO"
}
*/
