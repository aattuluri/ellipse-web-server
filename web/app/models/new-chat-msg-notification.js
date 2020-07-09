var shortid = require('shortid');
var db = require ("../models");
var Schema = db.Schema;
var dbConn = db.conn;

var STATE = {"START": 0, "FIRST": 1, "SECOND": 2, "FINAL": 3, "DEAD": 4};
var TYPE = {"EMAIL": 0, "TEXT": 1};

var NewChatMsgNotificationSchema = new Schema({
  _id : {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  chatId: String,
  userId: String,
  unreadMessageCount: Number,
  state: { type: Number, default: STATE.START },
  type: { type: Number, default: TYPE.EMAIL },
  lastSentAt: Date,
  scheduledTime: Date,
  dateCreated: { type: Date, default: Date.now }
});

NewChatMsgNotificationSchema.index({chatId: 1, userId: 1, type: 1}, {unique: true});

NewChatMsgNotificationSchema.statics.STATE = STATE;

NewChatMsgNotificationSchema.statics.TYPE = TYPE;

NewChatMsgNotificationSchema.statics.save = function (newChatMsgNotification, cb) {
	var newNewChatMsgNotification =  new NewChatMsgNotification(newChatMsgNotification);
	newNewChatMsgNotification.save(function (err, _newChatMsgNotification) {
		cb  (err, _newChatMsgNotification);
	});
};

var NewChatMsgNotification = dbConn.model ('NewChatMsgNotification', NewChatMsgNotificationSchema);

exports.NewChatMsgNotification =  NewChatMsgNotification;
