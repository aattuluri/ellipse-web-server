var async = require ("async");
var trips = require ("../../controllers/trips");
var Trip = trips.Trip;
var users = require ("../../controllers/users");
var User = users.User;
var UserSource = User.SOURCE;
var fbCommon = require ("../../messenger/common");

var FB_USER_ID = 1040960522607288;
var TRIP_ID = 'VJx9FKczd';

createAndAssociateFbUserToATrip ();

function createAndAssociateFbUserToATrip () {
  var user;
  async.series ([
    function (callback) {
      fbCommon.createUserIfNotExists (FB_USER_ID, function (err, result) {
        if (!err) {
          if (result.isNewUser) {
            console.log("User created Successfully!");
          } else {
            console.log("User already exists!!");
          }
          user = result.user;
        } else {
          console.log(err);
        }
        callback (err);
      });
    },
    function (callback) {
      if (user) {
        Trip.update({_id: TRIP_ID}, {userId: user._id}, function (err, result) {
          if (!err) {
           if (result > 0) {
             console.log('Trip updated with FB user!');
           } else {
             console.log('No updates for trip!');
           }
          }
          callback (err);
        });
      } else {
        callback ('User not found');
      }
    }
  ], function (err, results) {
    if (!err) {
      console.log('Success');
    } else {
      console.log('Failed');
    }
  });
}
