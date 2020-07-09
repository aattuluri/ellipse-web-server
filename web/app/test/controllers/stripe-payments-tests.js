var should = require('should');
var stripePayments = require('../../controllers/stripe-payments');

var stripChargeReq = {
	metadata: {"tripId": "trip123"},
	receipt_email: "anilcs0405@gmail.com",
	amount: 10000,
	statement_descriptor: "AgentAvery:Trip Charge",
	currency: "usd",
	description: "Dummy charge"
};

var stripeRefundReq = {
	amount: 40,
	reason: "requested_by_customer",
	metadata: {tripId: "trip123"}
};

describe('Stripe payment tests', function() {

  before(function(done) {
		done()
  })

  beforeEach(function(done) {
		done()
  })

  it('createCardToken', function(done) {
    stripePayments.createCardToken ('4242424242424242', 12, 2016, '123', function(err, token) {
	    if (err) throw err;
		done()
	});
  })
  
  it('createBankToken', function(done) {
    stripePayments.createBankToken ('US', 'usd', '314977405', '000123456789', function(err, token) {
		if (err) throw err;
		done()
	});
  })

  it('createCharge', function(done) {  
	stripePayments.createCardToken ('4242424242424242', 12, 2016, '123', function(err, token) {
		if (err) throw err;
		stripChargeReq["source"] = token.id;
		stripePayments.createCharge (stripChargeReq, function(err, charge) {
			if (err) throw err;
			done()
		});
	});    
  }) 

  it('createBitcoinReceiver', function(done) {  
	stripePayments.createBitcoinReceiver (50, 'usd', 'Anil Attuluri', 'anilcs0405@gmail.com', function(err, receiver) {
		if (err) throw err;
		done()
	});    
  }) 
  
  it('createRefund', function(done) {  
	stripePayments.createCardToken ('4242424242424242', 12, 2016, '123', function(err, token) {
		if (err) throw err;
		stripChargeReq["source"] = token.id;
		stripePayments.createCharge (stripChargeReq, function(err, charge) {
			if (err) throw err;
			stripeRefundReq["charge"] = charge.id;
			stripePayments.createRefund (stripeRefundReq, function(err, charge) {
				if (err) throw err;
				done()
			});
		});
	}); 
  })
  
  it('createCustomer', function(done) {  
	stripePayments.createCustomer ({email: 'anilcs0405@gmail.com'}, function(err, customer) {
		if (err) throw err;
		stripePayments.createCardToken ('4242424242424242', 12, 2016, '123', function(err, token) {
			if (err) throw err;
			stripePayments.addSourceToCustomer (customer.id, token.id, function(err, card) {
				if (err) throw err;
				stripChargeReq["customer"] = customer.id;
				delete stripChargeReq.source;
				stripePayments.createCharge (stripChargeReq, function(err, charge) {
					if (err) throw err;
					done();
				});
			});
		});
	});
  })
  
})