var async = require("async");
var stripePayments = require("./stripe-payments");
var dbUserModel = require("../models/user");
var PaymentTransactionModel = require("../models/payment-transaction");
var TripPaymentModel = require("../models/trip-payment");
var logger = require("../logger").logger;
var User = require("../models/user").User;
var Trip = require("../models/trip").Trip;
var emailUtils = require("./email-utils");
var textAlertUtils = require("./text-alert-utils");
var constants = require("../constants");

var PaymentTransaction = PaymentTransactionModel.PaymentTransaction;

var TripPayment = TripPaymentModel.TripPayment;

var CHARGE_DESCRIPTOR = 'AgentAvery-Trip Charge';
exports.CHARGE_DESCRIPTOR = CHARGE_DESCRIPTOR;

exports.createTripPayment = function (feeObject, cb) {
  var trippayment;
  var trip;
  var user;
  var feeType = (feeObject.type === 0)? 'service fee' : 'trip fee';
  var action = 'created';
  async.series([
    function (callback) {
      TripPayment.save (feeObject, function(dberr, result){
        trippayment = result;
        callback (dberr, result);
      });
    },
    //send email and text notifications
    function (callback) {
      sendNewFeeNotifications (trippayment, action, feeType, function (err, results) {
        callback ();
      });
    }
  ], function (err, results) {
     cb (err, trippayment);
  });
};

function getUserPhoneEmailNotifPrefs (userId, cb) {
  User.find ({_id: userId})
  .select({email: 1, phone: 1, notificationPrefs: 1}).exec (function (err, results) {
     var user;
     if(!err && results && results.length > 0) {
       user = results[0];
     }
     cb (err, user);
  });
}

function getTripDetails (tripId, cb) {
  Trip.find ({_id: tripId})
  .select({userId: 1, agentName: 1, userName: 1}).exec (function (err, results) {
     var trip;
     if(!err && results && results.length > 0) {
       trip = results[0];
     }
     cb (err, trip);
  });
}

function sendNewFeeNotifications (trippayment, action, feeType, cb) {
  var trip;
  var user;
  async.series([
    //get trip details
    function (callback) {
      getTripDetails (trippayment.tripId, function (err, result) {
        trip = result;
        callback();
      });
    },
    //get user notif prefs
    function (callback) {
      if (!trip) {
        callback();
      } else {
        getUserPhoneEmailNotifPrefs (trip.userId, function (err, result) {
          user = result;
          callback();
        });
      }
    },
    //send email alert
    function (callback) {
      var sendEmailAlert = user.notificationPrefs.fee.email;
      if (sendEmailAlert) {
        emailUtils.sendNewFeeEmail ([user.email], trip.userName, trip.agentName, action,
          feeType, trippayment.amount, constants.ABS_USER_LOGIN_URL, function(err, result) {
            callback();
        });
      } else {
          callback();
      }
    },
    //send text alert
    function (callback) {
      var mobile = (user.phone)? user.phone.mobile : null;
      var sendTextAlert = user.notificationPrefs.fee.text;
      if (mobile && sendTextAlert) {
        textAlertUtils.sendNewFeeTextAlert (mobile, trip.agentName, action,
          feeType, trippayment.amount, constants.ABS_USER_LOGIN_URL, function(err, result) {
            callback();
        });
      } else {
        callback ();
      }
    }],
  function (err, results) {
    cb (err, results);
  });
}

exports.updateTripPayment = function (tripPaymentId, updateObject, cb) {
  updateObject.dateModified = Date.now();
  var trippayment;
  var feeType;
  var action = 'updated';
  async.series ([
    function (callback) {
      TripPayment.update ({_id: tripPaymentId}, updateObject, function(dberr, result){
        callback(dberr);
      });
    },
    //find TripPayment object
    function (callback) {
      TripPayment.find ({_id: tripPaymentId}, function(err, results) {
        if (!err && results && results.length > 0) {
          trippayment = results[0];
          feeType = (trippayment.type === 0)? 'service fee' : 'trip fee';
        }
        callback ();
      });
    },
    //send notifications
    function (callback) {
      if (trippayment) {
        sendNewFeeNotifications (trippayment, action, feeType, function(err, result) {
          callback ();
        });
      } else {
        callback ();
      }
    }
  ], function (err, result) {
    cb (err, trippayment);
  });
};

exports.getTripPayment = function (tripPaymentId, cb) {
  TripPayment.find ({_id: tripPaymentId}, function(dberr, results){
    cb(dberr, results);
  });
};

exports.getAllTripPayments = function (tripId, cb) {
  TripPayment.find ({tripId: tripId}, function(dberr, results){
    cb(dberr, results);
  });
};

exports.createCharge = function (user, agent, tripId, chargeDescription, itemization, amount, currency, stripeToken, cb) {
    async.waterfall([
		//create stripe transaction
		function(callback) {
			var stripChargeReq = {
				metadata: {"tripId": tripId},
				receipt_email: user.email,
				amount: amount,
				statement_descriptor: CHARGE_DESCRIPTOR,
				currency: currency,
				source: stripeToken,
				description: chargeDescription
			};
			stripePayments.createCharge (stripChargeReq, function(err, stripeCharge) {
				callback(null, err, stripeCharge);
			});
		},
		//record the stripe transaction
		function(serr, stripeCharge, callback) {
			var status = (!serr)? PaymentTransaction.STATUS.SUCCEEDED : PaymentTransaction.STATUS.FAILED;
			var stripeId = (!stripeCharge)?  null: stripeCharge.id;
			PaymentTransaction.save ({
				userEmail: user.email,
				agentEmail: agent.email,
				stripeId: stripeId,
				amount: amount,
				tripId: tripId,
				currency: currency,
				itemization: itemization,
				ptype: PaymentTransaction.PAYMENT_TYPE.CHARGE,
				status: status,
				error: serr,
				stripeResponse: stripeCharge}, function(dberr, result){
				callback((serr)? serr : dberr, stripeCharge);
			});
		}
	], function (err, result) {
    	logger.info("Stripe charge done!");
		cb (err, result);
	});
}

exports.createRefund = function (user, chargeId, reason, tripId, amount, itemization, cb) {
    async.waterfall([
	    //find the stripe transaction of type charge for the given tripId and user email
		function(callback) {
			PaymentTransaction.find ({"userEmail": user.email, "tripId": tripId,
			"stripeId": chargeId}, function(err, stArray) {
				if (!err) {
					if (stArray !== null && stArray.length > 0) {
						callback(null, stArray[0]);
					}
					else {
						callback('Failed to find the trip transaction to refund.', null);
					}
				} else {
					callback ('Error occured while finding the trip transaction to refund.', null);
				}
			});
		},
		//create stripe refund
		function(st, callback) {
			var refundReq = {
				amount: amount,
				reason: reason,
				charge: chargeId,
				metadata: {tripId: tripId}
			};
			stripePayments.createRefund (refundReq, function(err, stripeRefund) {
					callback(null, err, st.stripeResponse, stripeRefund);
			});
		},
		//record the stripe refund transaction
		function(serr, stripeCharge, stripeRefund, callback) {
			var status = (!serr)? PaymentTransaction.STATUS.SUCCEEDED : PaymentTransaction.STATUS.FAILED;
			var stripeId = (!stripeRefund)? null : stripeRefund.id;
			PaymentTransaction.save ({
				userEmail: user.email,
				amount: amount,
				stripeId: stripeId,
				tripId: tripId,
				itemization: itemization,
				currency: stripeCharge.currency,
				ptype: PaymentTransaction.PAYMENT_TYPE.REFUND,
				status: status,
				error: serr,
				stripeResponse: stripeRefund}, function(dberr, result){
				callback((serr)? serr : dberr, stripeRefund);
			});
		}
	], function (err, result) {
		cb (err, result);
	});
};

/**
 * returns a cursor with trip's charge and refund totals
 */
exports.tripPaymentsTotal = function (tripId, cb) {
	PaymentTransaction.tripPaymentsTotal (tripId, function(dberr, result){
		cb(dberr, result);
	});
};
