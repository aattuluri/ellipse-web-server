var logger = require("../logger").logger;
var ENV = require('../env').ENVIRONMENT;

var stripeApiKeys = {
	"PROD": "sk_live_KngeVPYdZh03vS7NjNWxZXwE",
	"DEV": "sk_test_3SbKBllSGa14Hr2vobIgbuXm"
};

var stripe = null;

init();

function init () {
    stripe = require("stripe")(
	   stripeApiKeys[ENV]
	);
}

//processes the stripe response for error is any and transforms the error to a human readable message
function processStripeResult (err, result, cb) {
	var stripeError;
	if (err) {
		logger.error(JSON.stringify(err.type + ": " + err.message));
		stripeError = err.type;
		switch (err.type) {
		  case 'StripeCardError':
		    // A declined card error
		    err.message; // => e.g. "Your card's expiration year is invalid."
		    break;
		  case 'RateLimitError':
		    logger.error('Stripe RateLimitError');
		    break;
		  case 'StripeInvalidRequestError':
		    // Invalid parameters were supplied to Stripe's API
		    break;
		  case 'StripeAPIError':
		    // An error occurred internally with Stripe's API
		    break;
		  case 'StripeConnectionError':
		    // Some kind of error occurred during the HTTPS communication
		    break;
		  case 'StripeAuthenticationError':
		    // You probably used an incorrect API key
		    break;
		  default:
		    // Handle any other types of unexpected errors
		    break;
		}
	}
	cb (stripeError, result);
}

exports.createCustomer = function(stripeCustomerReq, cb) {
	stripe.customers.create(stripeCustomerReq, function(err, customer) {
		processStripeResult (err, customer, cb);
	});
};

exports.addSourceToCustomer = function(customerId, source, cb) {
	stripe.customers.createSource(
	  customerId,
	  {source: source},
	  function(err, s) {
		  processStripeResult (err, s, cb);
	  }
	);
};

exports.createCharge = function(stripeChargeReq, cb) {
	stripe.charges.create(stripeChargeReq, function(err, charge) {
		processStripeResult (err, charge, cb);
	});
};

exports.createCardToken = function(number, exp_month, exp_year, cvc, cb) {
	stripe.tokens.create({
	  card: {
		"number": number,
		"exp_month": exp_month,
		"exp_year": exp_year,
		"cvc": cvc
	  }
	}, function(err, token) {
		processStripeResult (err, token, cb);
	});
}

exports.createBankToken = function(country, currency, routing_number, account_number, cb) {
	stripe.tokens.create({
	  bank_account: {
		country: country,
		currency: currency,
		routing_number: routing_number,
		account_number: account_number
	  }
	}, function(err, token) {
		processStripeResult (err, token, cb);
	});
}

exports.createBitcoinReceiver = function(amount, currency, userName, userEmail, cb) {
	stripe.bitcoinReceivers.create({
		amount: amount,
		currency: currency,
		description: "Receiver for " + userName,
		email: userEmail
	}, function(err, receiver) {
		processStripeResult (err, receiver, cb);
	});
}

exports.createRefund = function(refundReq, cb) {
    stripe.refunds.create(refundReq, function(err, refund) {
		processStripeResult (err, refund, cb);
	});
}
