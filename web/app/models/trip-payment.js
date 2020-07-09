var shortid = require ('shortid');
var db = require ("../models");
var Schema = db.Schema;
var dbConn = db.conn;

var STATUS  = {CREATED: 0, COMPLETED : 1, CANCELLED: 2};

var TYPE = {SERVICE_FEE: 0, TRIP_FEE: 1, REFUND: 2};

var TripPaymentItem = new Schema({
    title: String,
    hours: String,
    hourlyFee: String,
    description: String,
    amount: String
});

var TripPaymentSchema = new Schema({
  _id : {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  tripId: String,
  type: { type: Number, default: TYPE.SERVICE_FEE },
  status: { type: Number, default: STATUS.CREATED },
	currency: String,
	amount: String,
  description: String,
	itemization: [TripPaymentItem],
  dateModified: { type: Number, default: Date.now },
	dateCreated: { type: Number, default: Date.now }
});

TripPaymentSchema.statics.save = function (tp, cb){
	var ntp = new TripPayment(tp);
	ntp.save(function (err, ctp) {
		cb(err, ctp);
	});
};

TripPaymentSchema.statics.STATUS = STATUS;

TripPaymentSchema.statics.TYPE = TYPE;

TripPaymentSchema.statics.getFeeTypeAsString = function (feeType) {
  var feeTypeStr = "";
  if (feeType === TYPE.SERVICE_FEE) {
    feeTypeStr = "Service";
  }
  else if (feeType === TYPE.TRIP_FEE) {
    feeTypeStr = "Trip";
  }
  return feeTypeStr;
};

//create the model
var TripPayment = dbConn.model ('TripPayment', TripPaymentSchema);

//export the model
exports.TripPayment = TripPayment;
