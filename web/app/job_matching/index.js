var async = require ('async');
var reds = require ('reds');
var pub = require('redis-connection') ();
var sub = require('redis-connection')('subscriber');
var logger = require("../logger").logger;
var users = require("../controllers/users");
var trips = require("../controllers/trips");
var initialTripDetails = require("../controllers/initial-trip-details");
var constants = require ("../constants");
var InitialTripDetails = initialTripDetails.InitialTripDetails;
var User = users.User;

var TripStatus = trips.Trip.STATUS;

var io;

var MAX_CONCURRENT_AGENT_JOBS = 10;

// REDIS_SUBSCRIPTION_CHANNELS


var AGENT_CURRENT_JOBS = "agent:current:jobs";

var ENV = require('../env').ENVIRONMENT;

if (ENV == "PROD") {
  //TBD: do the redis auth
}

//Reds searches
var agentSpecialitiesSearch = reds.createSearch('agentSpecialities');
var agentDestinationsSearch = reds.createSearch('agentDestinations');

//initialize
initJobMatchingEngine ();

function initJobMatchingEngine () {

  //create search index all agents
  indexAllAgents ();

  //subscribe to new user trips
  sub.subscribe(constants.TRIP_NEW, constants.TRIP_UPDATE, constants.TRIP_CANCEL,
    constants.TRIP_ADD_FOR_AGENT);

  //add actions for each subscription
  sub.on("message", function (channel, message) {
       message = JSON.parse(message);
       if (channel == constants.TRIP_NEW &&
          !message._id) {
         logger.error ('No trip id found for channel: ' + channel);
         return;
       }
       //handle a new trip
       if (channel == constants.TRIP_NEW) {
         matchWithAgents (message);
       }

       //handle a trip update
       if (channel == constants.TRIP_UPDATE) {
         updateTrip (message);
       }

       //handle a trip add for a given agent
       if (channel == constants.TRIP_ADD_FOR_AGENT) {
         addTripsForAgent (message);
       }
  });
}

/**
Indexes all agents on start up
*/

function indexAllAgents () {
  users.getAllActiveAgents (function (err, results) {
    if (!err) {
      results.forEach (function(result, i) {
        indexAgent (result);
      });
    }
  });
}

/**
--Specialities & Destinations for now, also it loads all agents and no updates are made
--Expose indexAgent method so that new agents and modifications to agent profiles can be reindexed.
*/
function indexAgent (agent) {
  agentSpecialitiesSearch.index(agent.specialities, agent._id);
  agentDestinationsSearch.index(agent.destinations, agent._id);
}

exports.indexAgent = indexAgent;

/**
* Match the agent based on criteria
*/

function matchWithAgents (criteria) {

  async.parallel ([
      //TBD: match active agents, use agent's calendar
      function (callback) {
        callback ();
      },
      //TBD: filter agents with MAX_CONCURRENT_AGENT_JOBS agents
      function (callback) {
        callback ();
      },
      //TBD: filter agents with custom settings
      function (callback) {
        callback ();
      },
      //match specialities
      function (callback) {
        /*
        agentSpecialitiesSearch.
          query(query = criteria.type).
          type('or').
          end(function(err, ids){
            if (!err) {
              logger.info('Search results for "%s":', query);
              logger.info('SpecialitiesSearch Ids: ', ids);
            }
            callback (err, ids);
          });
        */
        callback ();
      },
      //match destinations
      function (callback) {
        /*
        agentDestinationsSearch.
          query(query = criteria.destination).
          type('or').
          end(function(err, ids){
            if (!err) {
              logger.info('Search results for "%s":', query);
              logger.info('DestinationsSearch Ids: ', ids);
            }
            callback (err, ids);
          });
        */
        callback ();
      }
    ],
    function (err, results) {
      //TBD: sort results
      //TBD: filter duplicates
      //TBD: create jobs
      //TBD: Remove the hack below to create chat for all agents once we start matching the agents
      users.getAllActiveAgents (function (err, results) {
        if (!err) {
          results.forEach (function(result, i) {
            createNewTrip (criteria, result, null, false);
          });
        } else {
          console.log("Failed to fetch all the agents.");
        }
      });
    }
  );
  //match specialities
  //
}

function addTripsForAgent (message) {
  var agentId = message._id;
  var agent;
  var itdList = [];
  var alreadyExistingItdIdsList;
  async.series([
    //Find agent
    function (callback) {
      User.find ({_id: agentId}, function(err, results) {
        if (!err && results && results.length > 0) {
          agent = results[0];
        }
        callback (null);
      });
    },
    //Find list of initialTripDetailsIds for already created trips
    function (callback) {
      trips.Trip.find ({agentEmail: agent.email}).select({initialTripDetailsId: 1}).exec(function(err, results) {
        if (!err) {
           alreadyExistingItdIdsList = [];
           for (var i in results) {
              var itdId = results[i];
              alreadyExistingItdIdsList.push(itdId.initialTripDetailsId);
           }
           callback (null);
        } else {
          callback (err);
        }
      });
    },
    //Find new trip detatails not in
    function (callback) {
      var date = new Date();
      date.setDate(date.getDate() - 5);
      console.log('alreadyExistingItdIdsList: ', alreadyExistingItdIdsList);
      console.log('Date: ', date.toLocaleString());
      if (!alreadyExistingItdIdsList) {
        callback (null);
      } else {
        InitialTripDetails.find ({$and: [
              {_id: {$nin: alreadyExistingItdIdsList}},
              {dateCreated: {$gte: date}},
              {status: {$nin: [InitialTripDetails.STATUS.COMPLETED]}}
          ]}, function(err, results) {
          if (!err) {
            console.log('Found initial trips with no trip for this agent: ', results);
            itdList = results;
          }
          callback (null);
        });
      }
    },
    //iterate over all initial trip details and create trip for each
    function (callback) {
      if (itdList.length > 0 ) {
        async.each(itdList,
          function (itd, cback) {
            var tripStatus = TripStatus.CREATED;
            //decide on the trip status based on current active chats
            trips.getNumActiveChats (itd._id, function (err, count) {
              if (!err && count >= constants.MAX_CONCURRENT_TRIP_CHATS) {
                tripStatus = TripStatus.SUSPENDED;
              }
              if (!err) {
                createNewTrip (itd, agent, tripStatus, true);
              }
              cback (null);
            });
          },
        function (err, results) {
          callback (err);
        });
      } else {
        callback (null);
      }
    }
  ], function (err, results) {
     if (err) {
       console.log("Failed to add trip for agent: ", err);
     }
  });
}

function createNewTrip (criteria, agent, tripStatus, doNotSendEmail) {
   var newTrip = {
     initialTripDetailsId: criteria._id,
     userId: criteria.userId,
     userEmail: criteria.userEmail,
     userName: criteria.userName,
     agentId: agent._id,
     agentEmail: agent.email,
     agentName: agent.firstName,
     days: criteria.days,
     people: criteria.people,
     origin: criteria.origin,
     destination: criteria.destination,
     occasion: criteria.occasion,
     description: criteria.description,
     status: (!tripStatus)? trips.Trip.STATUS.CREATED : tripStatus
   };
   trips.createTrip (newTrip, function (err, result) {
      console.log ("Trip created for agent: " + agent.email +
          ", for user : " + criteria.userEmail);
   }, doNotSendEmail);
}
