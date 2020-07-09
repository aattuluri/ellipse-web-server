var shortid = require('shortid');
var db = require ("../models");
var Schema = db.Schema;
var dbConn = db.conn;

var STATUS = {"CREATED": 0, "COMPLETED": 1};

var InitialTripDetailsSchema = new Schema({
  _id : {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  userId: String,
  userEmail: String,
  userName: String,
  status: { type: Number, default: STATUS.CREATED },
  type: String,
  occasion: String,
  origin: String,
  destination: String,
  people: Number,
  activeChats: { type: Number, default: 0 },
  chats: Array,
  declines: Array,
  days: Number,
  startDate: String,
  description: String,
  dateProcessed: Date,
  dateCreated: { type: Date, default: Date.now }
});

InitialTripDetailsSchema.statics.STATUS = STATUS;

InitialTripDetailsSchema.statics.save = function (itd, cb) {
	var initialTripDetails =  new InitialTripDetails(itd);
	initialTripDetails.save(function (err, nitd) {
		cb(err, nitd);
	});
};

var InitialTripDetails = dbConn.model ('InitialTripDetails', InitialTripDetailsSchema);

exports.InitialTripDetails = InitialTripDetails;
