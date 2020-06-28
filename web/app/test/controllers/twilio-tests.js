var should = require('should');
var twilioSmsSender = require('../../controllers/twilio');

var sms = {
	from: "+15005550006",
	to: "+15129231642",
	body: "Hello from AgentAvery!"
};

describe('Twilio tests', function() {

  before(function(done) {
		done()
  })

  beforeEach(function(done) {
		done()
  })

  it('sendSms', function(done) {
    twilioSmsSender.sendSms (sms.from, sms.to, sms.body, function(err, json) {
	    if (err) throw err;
				done()
		});
  })

})
