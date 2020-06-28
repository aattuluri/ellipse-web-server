var shortid = require('shortid');
var db = require ("../models");
var Schema = db.Schema;
var dbConn = db.conn;

var TYPE = {"TRAVEL_AGENCY": "travel_agency", "TRAVEL_BLOG": "travel_blog"};
var STATUS = {"PENDING":"pending", "PENDING_APPROVAL": "pending_approval",
    "ACTIVE": "active", "INACTIVE": "inactive", "DISABLED": "disabled", "FLAGGED": "flagged"};
var DEFAULTS = {"TRAVEL_AGENCY_PROFILE_IMG": "/img/travel_agency_profile.png",
                "TRAVEL_BLOG_PROFILE_IMG": "/img/travel_blog_profile.png",
                "WELCOME_MESSAGE": "Welcome!",
                "OFFLINE_MESSAGE": "Hello! Sorry we are not online right now, please leave your information and you will receive an email to continue with chat!"};

var ThirdPartyWebsiteSchema = new Schema({
  _id : {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  adminEmail: String,
  name: String,
  apiKey: {type: String, index: {unique: true}},
  domain: [String],
  about: String,
  welcomeMessage: {type: String, default: DEFAULTS.WELCOME_MESSAGE},
  offlineMessage: {type: String, default: DEFAULTS.OFFLINE_MESSAGE},
  image: {type: String, default: DEFAULTS.TRAVEL_BLOG_PROFILE_IMG},
  type: {type: String, default: TYPE.TRAVEL_BLOG},
  status: {type: String, default: STATUS.ACTIVE},
  address: {street: String, city: String, state: String, country: String, zipcode: String},
  phone: {home: String, mobile: String},
  notificationPrefs: {
		newUsers: {
			text: {type: Boolean, default: true},
			email: {type: Boolean, default: true},
		},
    newMessages: {
			text: {type: Boolean, default: false},
			email: {type: Boolean, default: true},
		}
  },
  aRCNumber: String,
  iATANumber: String,
  cLIANumber: String,
  hostAgencyName: String,
  destinations: String,
  specialities: String,
  agreementAcceptedDate: Date,
  agreementAcceptedDetails: Object,
  dateCreated: { type: Date, default: Date.now }
});

ThirdPartyWebsiteSchema.statics.save = function (tpw, cb) {
	var newTpw =  new User(tpw);
  //set the default profile pic based on type
  if (newTpw.type === TYPE.TRAVEL_BLOG) {
    newTpw.image = DEFAULTS.TRAVEL_BLOG_PROFILE_IMG;
  }
  else if (newTpw.type === TYPE.TRAVEL_AGENCY) {
    newTpw.image = DEFAULTS.TRAVEL_AGENCY_PROFILE_IMG;
  }
	newTpw.save(function (err, newTpw) {
		cb(err, newTpw);
	});
};

ThirdPartyWebsiteSchema.statics.TYPE = TYPE;
ThirdPartyWebsiteSchema.statics.STATUS = STATUS;
ThirdPartyWebsiteSchema.statics.DEFAULTS = DEFAULTS;

var ThirdPartyWebsite = dbConn.model ('ThirdPartyWebsite', ThirdPartyWebsiteSchema);

module.exports = {
  ThirdPartyWebsite: ThirdPartyWebsite
};
