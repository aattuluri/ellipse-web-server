var shortid = require('shortid');
var db = require("../models");
var constants = require("../constants");
var async = require('async');

var momentTimezone = require("moment-timezone");
var Schema = db.Schema;
var dbConn = db.conn;

var DEFAULT_PROFILE_IMAGE = '/img/user_profile.png';

var TYPE = {"TRAVELER": "traveler", "AGENT": "agent", "ADMIN": "admin"};
var STATUS = {"PENDING":"pending", "PENDING_APPROVAL": "pending_approval",
    "ACTIVE": "active", "INACTIVE": "inactive", "DISABLED": "disabled", "FLAGGED": "flagged"};
var DEFAULTS = {"USER_PROFILE_IMG": "/img/user_profile.png", "AGENT_PROFILE_IMG": "/img/agent_profile.png"};
var SOURCE = {"AA": 0, "FACEBOOK": 1, "GOOGLE": 2};


var UserSchema = new Schema({
  _id : {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  email: {type: String, index: {sparse: true, unique: true}},
  thirdPartyId: String,
  source: {type: Number, default: SOURCE.AA},
  firstName: String,
  lastName: String,
  aboutMe: String,
  aboutMeVideoId: String,
  image: {type: String, default: DEFAULT_PROFILE_IMAGE},
  tempPassword: String,
  tempPasswordTimestamp: Date,
  secret: String,
  type: {type: String, default: TYPE.TRAVELER},
  status: {type: String, default: STATUS.PENDING},
  address: {street: String, city: String, state: String, country: String, zipcode: String},
  phone: {home: String, mobile: String},
  stripeCustomer: Object,
  notificationPrefs: {
    enabled: {type: Boolean, default: true},
		agentsFound: {
			text: {type: Boolean, default: true},
			email: {type: Boolean, default: true},
		},
    itinerary: {
			text: {type: Boolean, default: true},
		},
    newMessages: {
			text: {type: Boolean, default: false},
			email: {type: Boolean, default: true},
		},
    fee: {
			text: {type: Boolean, default: false},
			email: {type: Boolean, default: true},
		},
		tripSuggestions: {
			text: {type: Boolean, default: false},
			email: {type: Boolean, default: true},
		},
    sounds: {
			new_message: {type: Boolean, default: false}
    }
  },
  aRCNumber: String,
  iATANumber: String,
  cLIANumber: String,
  thirdPartyWebsites: [String],
  referer: {type: String, default: 'AA'},
  destinations: String,
  specialities: String,
  confirmationToken: String,
  passwordResetToken: String,
  passwordResetExpiryTime: Date,
  invalidLoginAttempts: {type: Number, default: 0},
  lastInvalidLogin: Date,
  lastLogin: {type: Date, default: Date.now},
  agreementAcceptedDate: Date,
  agreementAcceptedDetails: Object,
  dateCreated: { type: Date, default: Date.now },
  dateModified: { type: Date, default: Date.now },
  timeZone: String,
  availability: {
    enabled: {type: Boolean, default: false},
    oooMessage: String,
    Monday: {
      start: String,
      end: String
    },
    Tuesday: {
      start: String,
      end: String
    },
    Wednesday: {
      start: String,
      end: String
    },
    Thursday: {
      start: String,
      end: String
    },
    Friday: {
      start: String,
      end: String
    },
    Saturday: {
      start: String,
      end: String
    },
    Sunday: {
      start: String,
      end: String
    }
  }
});

UserSchema.statics.save = function (user, cb) {
	var newUser =  new User(user);
  //set the default profile pic based on user type
  if (newUser.type === TYPE.AGENT) {
    newUser.image = DEFAULTS.AGENT_PROFILE_IMG;
  }
  else if (newUser.type === TYPE.TRAVELER) {
    newUser.image = DEFAULTS.USER_PROFILE_IMG;
  }
	newUser.save(function (err, newUser) {
		cb(err, newUser);
	});
};

UserSchema.statics.checkAgentAvailability = function (id, cb) {
  var availability;
  var timeZone = constants.DEFAULT_AGENT_TIMEZONE;
  var finalAvailability = {
    available: true,
    message: constants.DEFAULT_AGENT_OOO_MESSAGE
  };
  async.series([
    function(callback) {
      User.findOne({_id: id, type: User.TYPE.AGENT}).select({timeZone: 1, availability: 1}).exec(
        function (err, result) {
          if (!err && result) {
            availability = result.availability;
            timeZone = (!result.timeZone)? timeZone : result.timeZone;
            finalAvailability.message = (!availability.oooMessage)? finalAvailability.message : availability.oooMessage;
          }
          callback (err);
      });
    },

    //calculate if agent is available right now
    function(callback) {
      if (availability && availability.enabled) {
        var current = momentTimezone.tz (Date.now(), timeZone);
        var day = current.format('dddd');

        //check if agent in available for the day
        if (!availability[day]) {
          finalAvailability.available = false;
        } else {

          //now check hours
          if (!availability[day].start || !availability[day].end) {
            finalAvailability.available = false;
          } else {
            var startTime = momentTimezone(availability[day].start, 'h:m a');
            var endTime = momentTimezone(availability[day].end, 'h:m a');
            if (!(current.isBetween(startTime, endTime) || current.isSame(startTime) ||
                current.isSame(endTime))) {
              finalAvailability.available = false;
            }
          }
        }
      }
      callback();
    }
  ], function(err, result) {
      if (err) {
        logger.error ('Error in User.checkAgentAvailability: ' + err);
      }
      cb (err, finalAvailability);
  });
};

UserSchema.statics.TYPE = TYPE;
UserSchema.statics.STATUS = STATUS;
UserSchema.statics.DEFAULTS = DEFAULTS;
UserSchema.statics.SOURCE = SOURCE;

var User = dbConn.model('User', UserSchema);

module.exports = {
  User: User
};
