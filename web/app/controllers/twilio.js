var logger = require("../logger").logger;
var ENV = require('../env').ENVIRONMENT;
var RateLimiter = require('limiter').RateLimiter;
var phone = require('phone');

var limiter = new RateLimiter(1, 'second');

var LOCAL_NUMBER_LIST = [
	"+13109058704"
];

var twilioAccountSIDs = {
	"PROD": "AC19c6bc42eff20316491df82a4b6e19c4",
	"DEV": "AC28bb9b6581d074e4f0d824d9365bc48b"
};

var twilioAuthTokens = {
	"PROD": "41b3a428fc35063efba6058ee29e059d",
	"DEV": "87bee77b6a4a83bd5c78baa97a1ba126"
};

var twilio = require("twilio");

var client = new twilio.RestClient(twilioAccountSIDs[ENV], twilioAuthTokens[ENV]);

exports.sendSms = function (to, body, cb) {
	limiter.removeTokens(1, function(err, remainingRequests) {
		//TBD: find the closest local number, right now we have only one
		if (!err) {
			client.sendSms({
		    to: phone(to),
		    from: LOCAL_NUMBER_LIST[0],
		    body: body
			}, function(err, msg) {
				console.log("SMS results!", err, msg);
				cb (err, msg);
			});
		} else {
			console.log("SMS rate exceeded!");
			cb (err);
		}
	});
};
