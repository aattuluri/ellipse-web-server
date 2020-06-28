var async = require('async');
var pub = require('redis-connection')();
var logger = require("../logger").logger;
var utils = require("../utils");
var constants = require("../constants");
var trips = require("../controllers/trips");
var InitialTripDetails = require("../models/initial-trip-details").InitialTripDetails;

exports.createInitialTripDetails = function (itd, cb) {
  var savedItd;
  async.series([
		//save the initial trip details
    function(callback) {
        InitialTripDetails.save(itd, function (err, result) {
            if (!err) {
              savedItd = result;
            }
            callback(err, result);
        });
		},
    //publish a USER_TRIP_NEW event to redis
    function(callback) {
      pub.publish(constants.TRIP_NEW, JSON.stringify(savedItd));
      callback ();
		}
	], function (err, results) {
      if (!err)
        logger.info ('Added the initial trip details.');
      else
        logger.error ('Failed to add the initial trip details.');
		  cb (err, results);
	});
};

function updateInitialTripDetails (criteria, updateItd, cb) {
  InitialTripDetails.update(criteria, updateItd, function (err, result) {
    return callback(err, result);
  });
}

exports.updateInitialTripDetails = updateInitialTripDetails;

exports.InitialTripDetails = InitialTripDetails;
