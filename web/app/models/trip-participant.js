var shortid = require ('shortid');
var db = require ("../models");
var Schema = db.Schema;
var dbConn = db.conn;

var PERMISSION  = {READ: 0, READ_WRITE : 1, READ_WRITE_MODIFY: 2};

var ROLE = {"TRAVELER": "traveler", "AGENT": "agent", "ADMIN": "admin"};

var TripParticipantSchema = new Schema({
  _id : {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  tripId: String,
  userEmail: String,
  invitedBy: String,
  message: String,
  permission: { type: Number, default: PERMISSION.READ_WRITE },
  role: { type: String, default: ROLE.TRAVELER },
	dateModified: { type: Number, default: Date.now },
	dateCreated: { type: Number, default: Date.now }
});

//define tripId + userEmail uniqueness
TripParticipantSchema.index({ tripId: 1, userEmail: -1 }, { unique: true });

TripParticipantSchema.statics.save = function (tp, cb){
	var ntp = new TripParticipant(tp);
	ntp.save(function (err, ctp) {
		cb(err, ctp);
	});
};

TripParticipantSchema.statics.PERMISSION = PERMISSION;

TripParticipantSchema.statics.ROLE = ROLE;

//create the model
var TripParticipant = dbConn.model ('TripParticipant', TripParticipantSchema);

//export the model
exports.TripParticipant = TripParticipant;
