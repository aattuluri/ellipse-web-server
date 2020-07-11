var should = require('should');
var async = require ('async');
var payments = require('../../controllers/payments');
var stripePayments = require('../../controllers/stripe-payments');
var PaymentTransaction = require("../../models/payment-transaction").PaymentTransaction;

describe('Payment tests', function() {

  before(function(done) {
		done()
  })

  beforeEach(function(done) {
	  	PaymentTransaction.remove ({}, function(err, result){
			done()
		});		
  })

  it('createCharge', function(done) {
		stripePayments.createCardToken ('4242424242424242', 12, 2016, '123', function(err, token) {
			if (err) throw err;	
			var user = {
				email: "anilcs0405@gmail.com"
			};
			var agent = {
					email: "agent@gmail.com"
			};
			payments.createCharge (user, agent, "trip123", "Payments test", 
					[{"title": "flight", "refundable": false, "amount": 4000}, 
				          {"title": "hotel", "refundable": true, "amount": 1000}],
					5000, "usd", token.id, function(err, charge) {
				should.not.exist(err);
				done()
			});
		});
  })
  
  it('createRefund', function(done) {
		stripePayments.createCardToken ('4242424242424242', 12, 2016, '123', function(err, token) {
			if (err) throw err;	
			var user = {
				email: "anilcs0405@gmail.com"
			};
			var agent = {
					email: "agent@gmail.com"
			};
			payments.createCharge (user, agent, "trip123", "Payments test",
					[{"title": "flight", "refundable": false, "amount": 4000}, 
				          {"title": "hotel", "refundable": true, "amount": 1000}],
					 5000, "usd", token.id, function(err, charge) {
				if (err) throw err;
				payments.createRefund (user, charge.id, "requested_by_customer", "trip123", 40, 
						[{"title": "flight", "amount": 3000}, 
				          {"title": "hotel", "amount": 800}], function(err, refund) {
					should.not.exist(err);
					done()
				});
			});
		});
  })  
  
  it('tripPaymentsTotal', function(done) {
	  var testTrip = "testTrip"
	  async.parallel([
	       function (callback) {
	    	   stripePayments.createCardToken ('4242424242424242', 12, 2016, '123', function(err, token) {
	   			if (err) throw err;	
	   			var user = {
	   				email: "anilcs0405@gmail.com"
	   			};
	   			var agent = {
						email: "agent@gmail.com"
				};
	   			payments.createCharge (user, agent, testTrip, "Payments test", 
	   					[{"title": "flight", "refundable": false, "amount": 4000}, 
					          {"title": "hotel", "refundable": true, "amount": 1000}],
	   					10000, "usd", token.id, function(err, charge) {
	   				if (err) throw err;
	   				callback (null, null);
	   			});
	   		});
	       },
	       function (callback) {
	    	   stripePayments.createCardToken ('4242424242424242', 12, 2016, '123', function(err, token) {
	   			if (err) throw err;	
	   			var user = {
	   				email: "anilcs0405@gmail.com"
	   			};
	   			var agent = {
						email: "agent@gmail.com"
				};
	   			payments.createCharge (user, agent, testTrip, "Payments test", 
	   					[{"title": "flight", "refundable": false, "amount": 4000}, 
	   					          {"title": "hotel", "refundable": true, "amount": 1000}],
	   					15000, "usd", token.id, function(err, charge) {
	   				if (err) throw err;
	   				payments.createRefund (user, charge.id, "requested_by_customer", testTrip, 40, 
	   						[{"title": "flight", "amount": 3000}, 
					          {"title": "hotel", "amount": 800}], function(err, refund) {
						if (err) throw err;
						callback (null, null);
					});
	   			});
	   		});
	       }
	  ], function (err, results) {
		  payments.tripPaymentsTotal (testTrip, function (err, result) {
			  should.not.exist(err);
			  should.exist(result);
			  result.length.should.equal(2);
			  done()
		  })
	  });
  })
})