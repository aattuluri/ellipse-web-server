var async = require('async');
var should = require('should');

var trips = require ("../../controllers/trips");

var TripModel = trips.Trip;

var trip = {
  userEmail: "lisaa@gmail.com",
  userName: "Lisa Avery",
  agentEmail: "hello@agentavery.com",
  agentId: "test01",
  origin: "San Diego",
  destination: "San Francisco",
  people: 2,
  days: 2,
  description: "Honeymoon trip",
  dateCreated: new Date(),
  itenerary: "<p>test itinerary</p>"
};
var trip2 = {
  userEmail: "john@home.com",
  userName: "John Date",
  agentEmail: "agent21@agentavery.com",
  agentId: "test21",
  dateCreated: new Date()
};

describe('Model: Trip tests', function() {

  before(function(done) {
    async.series([
      function (callback) {
          trip.status = TripModel.STATUS.CREATED;
          trips.createTrip(trip, function (err, result) {
              callback(err, result);
          });
      },
      function (callback) {
          trip.status = TripModel.STATUS.BOOKING_COMPLETE;
          trips.createTrip(trip, function (err, result) {
              callback(err, result);
          });
      },
      function (callback) {
          trip.status = TripModel.STATUS.CHAT_STARTED;
          trips.createTrip(trip, function (err, result) {
              callback(err, result);
          });
      },
      function (callback) {
          trip2.status = TripModel.STATUS.CHAT_STARTED;
          trips.createTrip(trip2, function (err, result) {
              callback(err, result);
          });
      },
    ],
    function (err, results) {
       if (err) throw err;
       done();
    });
  });

  it('getAgentActiveClients', function(done) {
    trips.getAgentActiveClients ('hello@agentavery.com', function (err, result) {
      if (err) throw err;
      done();
    });
  });

  it('getAgentJobs', function(done) {
    trips.getAgentJobs ('hello@agentavery.com', undefined, function (err, result) {
      if (err) throw err;
      done();
    });
  });

  it('getAgentPastClients', function(done) {
    trips.getAgentPastClients ('hello@agentavery.com', function (err, result) {
      if (err) throw err;
      done();
    });
  });

  describe('#getItineraryNoAuth()', function() {
    it('should return undefined if trip not found', function(done) {
      var tripid = "non_existent";
      trips.getItineraryNoAuth(tripid, function(err, result) {
        should(result).equal(undefined)
        if (err) throw err;
          done();
      });
    });
    it('should return undefined if no itinerary', function(done) {
      var tripid;
      var a = trips.getAgentActiveClients ('agent21@agentavery.com', function(err, result) {
          tripid = result[0]._id;
          trips.getItineraryNoAuth(tripid, function(err, result) {
            should(result).equal(undefined)
            if (err) throw err;
            done();
          });
          if (err) throw err;
      });
    });
    it('should return an itinerary', function(done) {
      var tripid;
      var a = trips.getAgentActiveClients ('hello@agentavery.com', function(err, result) {
          tripid = result[0]._id;
          trips.getItineraryNoAuth(tripid, function(err, result) {
            should(result).equal('<p>test itinerary</p>')
            if (err) throw err;
            done();
          });
          if (err) throw err;
      });
    });
  })

  describe('#getItineraryNoAuth()', function() {
    it('should return undefined if trip not found', function(done) {
      var tripid = "non_existent";
      trips.getAgentNoAuth(tripid, function(err, result) {
        should(result).equal(undefined);
        if (err) throw err;
        done();
      });
    });
    it('should return an agent', function(done) {
      var tripid;
      var a = trips.getAgentActiveClients ('hello@agentavery.com', function(err, result) {
        tripid = result[0]._id;
        trips.getAgentNoAuth(tripid, function(err, result) {
          should(result).equal("test01");
          if (err) throw err;
          done();
        });

        if (err) throw err;
      });
    });
  });

});
