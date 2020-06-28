var should = require('should');
var sendgridEmailSender = require('../../controllers/sendgrid');

var email = {
	from: ["hello@agentavery.com"],
	to: ["hello@agentavery.com"],
	cc: ["hello@agentavery.com"],
	bcc: ["hello@agentavery.com"],
	subject: "Unit Test Email",
	html: "<b>Unit Test Email Content.<b> \n\nThanks,\nUnit Testing."
};

describe('Sendgrid tests', function() {

  before(function(done) {
		done()
  })

  beforeEach(function(done) {
		done()
  })

  it('sendSimpleEmail', function(done) {
    sendgridEmailSender.sendEmail (email.from, email.to,
					email.subject, email.html, function(err, json) {
	    if (err) throw err;
				done()
		});
  })

  it('sendAdvancedEmail', function(done) {
    sendgridEmailSender.sendAdvancedEmail (email, function(err, json) {
			if (err) throw err;
				done()
			});
  })

})
