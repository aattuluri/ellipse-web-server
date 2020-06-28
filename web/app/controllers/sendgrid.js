var logger = require("../logger").logger;
var ENV = require('../env').ENVIRONMENT;
var constants = require('../constants');

var sendgridUsers = {
	"PROD": "agentavery",
	"DEV": "agentavery"
};

var sendgridPasswords = {
	"PROD": "hello@g3nt@v3ry2015",
	"DEV": "hello@g3nt@v3ry2015"
};

var sendgrid = null;

init();

function init () {
		sendgrid = require("sendgrid")(
	   	sendgridUsers[ENV], sendgridPasswords[ENV]
		);
}

module.exports = {
		templates: {
			confirmation: "Hello {0},<br><br>Welcome to "+constants.TITLE+"!<br><br>Click the link below to " +
			"confirm your email:<br>{1}<br><br>Thanks,<br>"+constants.TITLE+".",
			user_welcome: "",
			agent_welcome: "",
			notification_agent_new_job: "Hello {0},<br><br>Great news. There’s a traveler looking for your help! Please login to your agent dashboard to help {1}<br><br>Thanks,<br>"+constants.TITLE+".",
			reset_password: "Hello {0},<br><br>To reset your password follow the link below: " +
			"<br>{1}<br><br>Thanks,<br>"+constants.TITLE+".",
			itenerary: "Hello {0},<br><br>Your itenerary put together by your agent {1}: " +
			"<br><br>{2}<br><br>Thanks,<br>"+constants.TITLE+".",
			new_user_system_notification: "Hello,<br><br>New user signed up:<br/><br/>" +
				'<b>Firstname:</b> {0}<br/><br/>' +
				'<b>Lastname:</b> {1}<br/><br/>' +
				'<b>Email:</b> {2}<br/><br/>' +
				'<b>Trip details:</b> {3}<br/><br/>' +
			"Thanks,<br>"+constants.TITLE+".",
			new_agent_system_notification: "Hello,<br><br>New agent signed up:<br/><br/>" +
				'<b>Firstname:</b> {0}<br/><br/>' +
				'<b>Lastname:</b> {1}<br/><br/>' +
				'<b>Email:</b> {2}<br/><br/>' +
			"Thanks,<br>"+constants.TITLE+"."
	  },
		sendEmail: function (from, tos, subject, html, cb) {
			var email = new sendgrid.Email({
				from: from,
				to: tos,
		  	subject: subject,
		  	html: html
			});
			email.addHeader('X-Sent-Using', 'SendGrid-API');
		  email.addHeader('X-Transport', 'web');
			sendgrid.send(email, function(err, json) {
		  		cb (err, json);
			});
		},
		/*

		Available params

		var params = {
		  smtpapi:  new sendgrid.smtpapi(),
		  to:       [],
		  toname:   [],
		  from:     '',
		  fromname: '',
		  subject:  '',
		  text:     '',
		  html:     '',
		  bcc:      [],
		  cc:       [],
		  replyto:  '',
		  date:     '',
		  files: [
		    {
		      filename:     '',           // required only if file.content is used.
		      contentType:  '',           // optional
		      cid:          '',           // optional, used to specify cid for inline content
		      path:         '',           //
		      url:          '',           // == One of these three options is required
		      content:      ('' | Buffer) //
		    }
		  ],
		  file_data:  {},
		  headers:    {}
		};

		*/
		sendAdvancedEmail: function (params, cb) {
			var email = new sendgrid.Email(params);
			sendgrid.send(email, function(err, json) {
		  		cb (err, json);
			});
		}
};
