var UserModel = require("../../models/user").User;
var should = require('should');
var async = require('async');
var constants = require('../../constants');

var testOOOMsg = 'Hey there!, I am currently OOO';

describe('Model: User tests', function() {

  var agent;

  before(function(done) {
    UserModel.save({
      email: 'test@test.com',
      firstName: 'Anil',
      type: UserModel.TYPE.AGENT,
      timeZone: constants.DEFAULT_AGENT_TIMEZONE,
      availability: {
        enabled: true,
        oooMessage: testOOOMsg,
        availability: {

        }
      }
    }, function(err, result){
      if (err) throw err;
      agent = result;
      done();
    });
  });

  beforeEach(function(done) {
    done();
  });

  it('findUserById', function(done) {
		UserModel.find({ id: agent._id}, function(err, result){
			if (err) throw err;
      should.exist(result);
			done();
		});
  });

  it('testAgentAvailabilityNegative', function(done) {
		UserModel.checkAgentAvailability(agent._id, function(err, result){
			if (err) throw err;
      should.exist(result);
      should.exist(result.message);
      result.message.should.containEql(testOOOMsg);
      result.available.should.equal(false);
			done();
		});
  });

  after(function(done) {
    UserModel.remove({ _id: agent._id}, function(err, result){
      if (err) throw err;
      done();
    });
  });
});
