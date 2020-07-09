var should = require('should');
var dbUser = require('../../models/user');
var PaymentTransaction = require('../../models/payment-transaction').PaymentTransaction;

describe('Model: PaymentTransaction tests', function() {

  before(function(done) {
		done()
  })

  beforeEach(function(done) {
		done()
  })

  it('save', function(done) {
	var stripeObject = {
	  "id": "ch_17Do4wLYc341FKxGBoVDZcuu",
	  "object": "charge",
	  "amount": 50,
	  "amount_refunded": 0,
	  "application_fee": null,
	  "balance_transaction": "txn_17Do3YLYc341FKxGfK9sk7eC",
	  "captured": true,
	  "created": 1449114502,
	  "currency": "usd",
	  "customer": null,
	  "description": "Testing charge (email: anilcs0405@gmail.com)",
	  "destination": null,
	  "dispute": null,
	  "failure_code": null,
	  "failure_message": null,
	  "fraud_details": {
	  },
	  "invoice": null,
	  "livemode": false,
	  "metadata": {
	  },
	  "paid": true,
	  "receipt_email": null,
	  "receipt_number": null,
	  "refunded": false,
	  "refunds": {
		"object": "list",
		"data": [

		],
		"has_more": false,
		"total_count": 0,
		"url": "/v1/charges/ch_17Do4wLYc341FKxGBoVDZcuu/refunds"
	  },
	  "shipping": null,
	  "source": {
		"id": "card_17Do4vLYc341FKxGEgmdNYGi",
		"object": "card",
		"address_city": null,
		"address_country": null,
		"address_line1": null,
		"address_line1_check": null,
		"address_line2": null,
		"address_state": null,
		"address_zip": null,
		"address_zip_check": null,
		"brand": "Visa",
		"country": "US",
		"customer": null,
		"cvc_check": "pass",
		"dynamic_last4": null,
		"exp_month": 12,
		"exp_year": 2016,
		"funding": "credit",
		"last4": "4242",
		"metadata": {
		},
		"name": null,
		"tokenization_method": null
	  },
	  "statement_descriptor": null,
	  "status": "succeeded"
	};
	PaymentTransaction.save ({
		userEmail: 'anilcs0405@gmail.com',
		agentEmail: 'agent@gmail.com',
		stripeId: stripeObject.id,
		tripId: 'trip123',
		status: PaymentTransaction.STATUS.SUCCEEDED,
		ptype: PaymentTransaction.PAYMENT_TYPE.CHARGE,
		amount: 5000,
		currency: 'usd',
		itemization: [{"title": "flight", "amount": 4000},
		          {"title": "hotel", "refundable": true, "amount": 1000}],
		stripeResponse: stripeObject}, function(err, token) {
		if (err) throw err;
		done()
	});
  })

  it('find', function(done) {
	var stripeObject = {
	  "id": "ch_17Do4wLYc341FKxGBoVDZcuu",
	  "object": "charge",
	  "amount": 50,
	  "source": {
		"id": "card_17Do4vLYc341FKxGEgmdNYGi",
		"object": "card"
	  },
	  "status": "succeeded"
	};
	PaymentTransaction.save ({
		userEmail: 'anilcs0405@gmail.com',
		agentEmail: 'agent@gmail.com',
		stripeId: stripeObject.id,
		tripId: 'trip123',
		status: PaymentTransaction.STATUS.SUCCEEDED,
		ptype: PaymentTransaction.PAYMENT_TYPE.CHARGE,
		amount: 5000,
		currency: 'usd',
		itemization: [{"title": "flight", "refundable": false, "amount": 4000},
		          {"title": "hotel", "refundable": true, "amount": 1000}],
		stripeResponse: stripeObject}, function(err, token) {
			PaymentTransaction.find ({"userEmail":'anilcs0405@gmail.com', "tripId": "trip123",
        "ptype": PaymentTransaction.PAYMENT_TYPE.CHARGE }, function(err, result) {
			if (err) throw err;
			done()
		});
	});
  })

})
