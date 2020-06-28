var shortid = require ('shortid');
var db = require ("../models");
var Schema = db.Schema;
var dbConn = db.conn;

var Item = new Schema({
    title: String,
    refundable: { type: Boolean, default: false },
    refundable_percent:  Number,
    refundable_amount: Number,
    amount: Number
});

var PaymentTransactionSchema = new Schema({
  _id : {
    type: String,
    unique: true,
    'default': shortid.generate
  },
	userEmail:  String,
	agentEmail: String,
	stripeId: String,
	ptype: String,
	currency: String,
	tripId: String,
	amount: Number,
	status: String,
	error: String,
	itemization: [Item],
	stripeResponse: Object,
	date: { type: Date, default: Date.now }
});

PaymentTransactionSchema.statics.save = function (st, cb){
	var nst = new PaymentTransaction(st);
	nst.save(function (err) {
		cb(err, null);
	});
}

PaymentTransactionSchema.statics.tripPaymentsTotal = function (tripId, cb) {
	var match = {
			"tripId": tripId,
			"status": "succeeded",
			$or: [	{"ptype": "charge"},
			      	{"ptype": "refund" }]
	};

	PaymentTransaction.aggregate([
	     {
	    	 $match : match
	     },
	     {
	    	 $group : {
	    		 _id: "$ptype",
	    		 total: { $sum: "$amount" }
	    	 }
	     }
	    ],
		function(err, result) {
		    cb (err, result);
	});
}

PaymentTransactionSchema.statics.STATUS = {"SUCCEEDED":"succeeded", "FAILED":"failed"};
PaymentTransactionSchema.statics.PAYMENT_TYPE = {"CHARGE":"charge", "REFUND":"refund"};


//create the model
var PaymentTransaction = dbConn.model ('PaymentTransaction', PaymentTransactionSchema);
//export the model
module.exports = {
	PaymentTransaction
};
