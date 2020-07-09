var shortid = require('shortid');
var db = require ("../models");
var Schema = db.Schema;
var dbConn = db.conn;

var STATUS = {"CREATED": "created", "CHAT_INITIATED": "chat_initiated",
              "CHAT_STARTED": "chat_started", "PAYMENT_PENDING": "payment_pending",
              "BOOKING_IN_PROGRESS": "booking_in_progress", "BOOKING_COMPLETE": "booking_complete",
              "REFUND_IN_PROGRESS": "refund_in_progress", "REFUND_COMPLETE": "refund_complete", "ENDED": "ended",
              "DECLINED": "declined", "SUSPENDED": "suspended", "COMPLETED": "completed"};

var MODE = {"BOT": 0, "HUMAN": 1};

var TripSchema = new Schema({
  _id : {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  initialTripDetailsId: String,
  title: String,
  mode: {type: Number, default: MODE.HUMAN},
  witAiContext: {type: Object, default: {}},
  aaContext: {type: Object, default: {}},
  status: String,
  userId: String,
  userEmail: String,
  userImage: String,
  userName: String,
  agentId: String,
  agentEmail: String,
  agentName: String,
  thirdPartyWebsite: String,
  origin: String,
  destination: String,
  people: Number,
  days: Number,
  occasion: String,
  description: String,
  agentIntroText: String,
  itenerary: String,
  declineReason: Object,
  endReason: Object,
  dateModified: { type: Date, default: Date.now },
  dateCreated: { type: Date, default: Date.now }
});

TripSchema.statics.STATUS = STATUS;

TripSchema.statics.MODE = MODE;

TripSchema.statics.save = function (trip, cb) {
	var newTrip =  new Trip(trip);
	newTrip.save(function (err, trip) {
		cb  (err, trip);
	});
};

var Trip = dbConn.model ('Trip', TripSchema);

exports.Trip = Trip;
