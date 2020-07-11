var async = require('async');
var logger = require("../logger").logger;
var utils = require("../utils");
var fs = require('fs');
var twilio = require("./twilio");
var phone = require('phone');
var format = require('string-format');

var SUPPORTED_COUNTRIES = {
  "USA": 1
};

//user types
var TRAVELER = 0;
var AGENT = 1;

var BASE_TEXT_ALERT_TEMPLATE_PATH = __dirname + "/../views/text-alert-templates";

//keys to identify different text alerts
var NEW_AGENT_FOUND = 'new_agent_found';
var NEW_ITINERARY = 'new_itinerary';
var NEW_FEE = "new_fee";
var AGENT_NEW_CHAT_MESSAGES = "agent_new_chat_messages";
var AGENT_NEW_CHAT_MESSAGES_REMINDER_1 = "agent_new_chat_messages_reminder_1";
var AGENT_NEW_CHAT_MESSAGES_REMINDER_2 = "agent_new_chat_messages_reminder_2";
var AGENT_NEW_CHAT_MESSAGES_REMINDER_FINAL = "agent_new_chat_messages_reminder_final";
var USER_NEW_CHAT_MESSAGES = "user_new_chat_messages";
var ADMIN_REQUEST_TRAVEL_EXPERT = "admin_request_travel_expert";

exports.sendNewAgentFoundTextAlert = function (to, agentName, link, cb) {
  var textBody = utils.format(getTextAlertTemplate (NEW_AGENT_FOUND), agentName, link);
  sendSms (to, textBody, function (err, result) {
    cb (err, result);
  });
};

exports.sendNewItinenraryTextAlert = function (to, agentName, email, cb) {
  var textBody = utils.format(getTextAlertTemplate (NEW_ITINERARY), agentName, email);
  sendSms (to, textBody, function (err, result) {
    cb (err, result);
  });
};

exports.sendNewFeeTextAlert = function (to, agentName, action, type, amount, link, cb) {
  var textBody = utils.format(getTextAlertTemplate (NEW_FEE), agentName, action, type, amount, link);
  sendSms (to, textBody, function (err, result) {
    cb (err, result);
  });
};

exports.sendUserNewChatMessagesTextAlert = function (to, link, cb) {
  var textBody = utils.format(getTextAlertTemplate (USER_NEW_CHAT_MESSAGES), link);
  sendSms (to, textBody, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentNewChatMessagesTextAlert = function (to, loginUrl, cb) {
  var textBody = utils.format(getTextAlertTemplate (AGENT_NEW_CHAT_MESSAGES));
  sendSms (to, textBody, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentNewChatMessagesReminder1TextAlert = function (to, loginUrl, cb) {
  var textBody = utils.format(getTextAlertTemplate (AGENT_NEW_CHAT_MESSAGES_REMINDER_1));
  sendSms (to, textBody, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentNewChatMessagesReminder2TextAlert = function (to, loginUrl, cb) {
  var textBody = utils.format(getTextAlertTemplate (AGENT_NEW_CHAT_MESSAGES_REMINDER_2));
  sendSms (to, textBody, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentNewChatMessagesReminderFinalTextAlert = function (to, loginUrl, cb) {
  var textBody = utils.format(getTextAlertTemplate (AGENT_NEW_CHAT_MESSAGES_REMINDER_FINAL));
  sendSms (to, textBody, function (err, result) {
    cb (err, result);
  });
};

exports.sendRequestTravelExpertTextAlert = function(to, data, cb) {
  var textBody = format(getTextAlertTemplate(ADMIN_REQUEST_TRAVEL_EXPERT), data);
  sendSms(to, textBody, cb);
};

function getTextAlertTemplate(key) {
  var textAlertFile = "/" + key + ".html";
  var textAlertFilePath = BASE_TEXT_ALERT_TEMPLATE_PATH;
  textAlertFilePath += textAlertFile;
  var textAlert = fs.readFileSync(textAlertFilePath, "utf8");
  return textAlert;
}

function sendSms(to, text, cb) {

  //we always send SMS only to one number at once so ok to use [0]
  var result = validateAndConvertToE164(to[0]);
  if (result.error) {
    logger.error(result.error);
  } else {
    twilio.sendSms(result.E164PhoneNumber, text, function(err, result) {
        cb (err, result);
    });
  }
}

function validateAndConvertToE164(phoneNum) {
  var phoneConverted = phone(phoneNum);
  var error;
  var E164PhoneNumber;
  if (phoneConverted &&
      phoneConverted.length === 2) {
    //make sure the country is supported for outgoing SMS
    if (SUPPORTED_COUNTRIES[phoneConverted[1]]) {
      E164PhoneNumber = phoneConverted[0];
    } else {
      error = 'Unsupported outgoing SMS country: ' + phoneConverted[1];
    }
  } else {
    error = 'Invalid mobile number: ' + phoneNum;
  }
  return {
    error: error,
    E164PhoneNumber: E164PhoneNumber
  };
}

exports.validateAndConvertToE164 = validateAndConvertToE164;
