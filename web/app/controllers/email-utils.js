var async = require('async');
var logger = require("../logger").logger;
var utils = require("../utils");
var fs = require('fs');
var sendgrid = require("./sendgrid");
var format = require('string-format');

var commonSubjects = JSON.parse(fs.readFileSync(__dirname + "/../views/email-templates/subjects.json", "utf8"));
var userSubjects = JSON.parse(fs.readFileSync(__dirname + "/../views/email-templates/user/subjects.json", "utf8"));
var agentSubjects = JSON.parse(fs.readFileSync(__dirname + "/../views/email-templates/agent/subjects.json", "utf8"));

//user types
var TRAVELER = 0;
var AGENT = 1;

var ADMIN_EMAIL = "hello@agentavery.com";

var FROM_EMAIL = "no-reply@agentavery.com";

var BASE_EMAIL_TEMPLATE_PATH = __dirname + "/../views/email-templates";

var HEADER_NONAME_TEMPLATE = fs.readFileSync(__dirname + "/../views/email-templates/header_noname.html", 'utf8');
var HEADER_TEMPLATE = fs.readFileSync(__dirname + "/../views/email-templates/header.html", 'utf8');
var FOOTER_TEMPLATE = fs.readFileSync(__dirname + "/../views/email-templates/footer.html", 'utf8');

//keys to identify different email types
var CONFIRMATION = 'confirmation';
var WELCOME = 'welcome';
var PASSWORD_RESET = 'password_reset';
var ITINERARY = "itinerary";
var SHARE_ITINERARY = "share_itinerary";
var NEW_AGENT_FOUND = 'new_agent_found';
var NEW_FEE = 'new_fee';
var ACCOUNT_DEACTIVATED = "account_deactivated";
var NOTIFY_SUPPORT = "notify_support";
var ACCOUNT_APPROVED = "account_approved";
var AGENT_AGREEMENT = "agent_agreement";
var INVITE_TO_CHAT = "invite_to_chat";
var NEW_PLUGIN_USER = "new_plugin_user";
var NEW_CHAT_MESSAGES = "new_chat_messages";
var NEW_CHAT_MESSAGES_REMINDER_1 = "new_chat_messages_reminder_1";
var NEW_CHAT_MESSAGES_REMINDER_2 = "new_chat_messages_reminder_2";
var NEW_CHAT_MESSAGES_REMINDER_FINAL = "new_chat_messages_reminder_final";
var REQUEST_TRAVEL_EXPERT = "request_travel_expert";

exports.sendUserAccountConfirmationEmail = function (toList, userName, link, cb) {
  var html = utils.format(getEmailTemplate(TRAVELER, CONFIRMATION), userName, link);
  sendEmail(null, toList, userSubjects[CONFIRMATION], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentAccountConfirmationEmail = function (toList, userName, link, cb) {
  var html = utils.format(getEmailTemplate (AGENT, CONFIRMATION), userName, link);
  sendEmail (null, toList, userSubjects[CONFIRMATION], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendUserWelcomeEmail = function (toList, userName, cb) {
  var html = utils.format(getEmailTemplate (TRAVELER, WELCOME), userName);
  sendEmail (null, toList, userSubjects[WELCOME], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendUserItineraryEmail = function (toList, userName, agentName, itinerary, cb) {
  var html = utils.format(getEmailTemplate (TRAVELER, ITINERARY), userName, agentName, itinerary);
  sendEmail (null, toList, userSubjects[ITINERARY], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentShareItineraryEmail = function (toList, agentName, notes, itinerary, cb) {
  var html = utils.format(getEmailTemplate (AGENT, SHARE_ITINERARY, HEADER_NONAME_TEMPLATE), agentName, notes, itinerary);
  sendEmail (null, toList, agentSubjects[SHARE_ITINERARY], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentWelcomeEmail = function (toList, userName, cb) {
  var html = utils.format(getEmailTemplate (AGENT, WELCOME), userName);
  sendEmail (null, toList, userSubjects[WELCOME], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendPasswordResetEmail = function (toList, userName, link, cb) {
  var html = utils.format(getEmailTemplate (null, PASSWORD_RESET), userName, link);
  sendEmail (null, toList, commonSubjects[PASSWORD_RESET], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendNewAgentFoundEmail = function (toList, userName, agentName, link, cb) {
  var html = utils.format(getEmailTemplate (TRAVELER, NEW_AGENT_FOUND), userName, agentName, link);
  sendEmail (null, toList, userSubjects[NEW_AGENT_FOUND], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendNewFeeEmail = function (toList, userName, agentName, action, type, amount, link, cb) {
  var html = utils.format(getEmailTemplate (TRAVELER, NEW_FEE), userName, agentName, action, type, amount, link);
  sendEmail (null, toList, userSubjects[NEW_FEE], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentAccountDeactivatedEmail = function (toList, agentName, cb) {
  var html = utils.format(getEmailTemplate (AGENT, ACCOUNT_DEACTIVATED), agentName);
  sendEmail (null, toList, agentSubjects[ACCOUNT_DEACTIVATED], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentAccountApprovedEmail = function (toList, agentName, cb) {
  var html = utils.format(getEmailTemplate (AGENT, ACCOUNT_APPROVED), agentName);
  sendEmail (null, toList, agentSubjects[ACCOUNT_APPROVED], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentAgreementEmail = function (toList, agentName, url, cb) {
  var html = utils.format(getEmailTemplate (AGENT, AGENT_AGREEMENT), agentName, url);
  sendEmail (null, toList, agentSubjects[AGENT_AGREEMENT], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendNotifySupportEmail = function (email, name, reason, cb) {
  var html = utils.format(getEmailTemplate (null, NOTIFY_SUPPORT), email, name, reason);
  sendEmail (null, [ADMIN_EMAIL], commonSubjects[NOTIFY_SUPPORT], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendInviteToChatEmail = function (toList, name, inviteText, link, cb) {
  var html = utils.format(getEmailTemplate (null, INVITE_TO_CHAT), name, name, inviteText, name, link);
  sendEmail (null, toList, commonSubjects[INVITE_TO_CHAT], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendNewPluginUserEmail = function (toList, name, email, tempPassword, thirdPartyWebsite, link, cb) {
  var html = utils.format(getEmailTemplate (TRAVELER, NEW_PLUGIN_USER), name, thirdPartyWebsite, thirdPartyWebsite,
      link, email, tempPassword);
  sendEmail (null, toList, userSubjects[NEW_PLUGIN_USER], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendUserNewChatMessagesEmail = function (toList, userName, link, cb) {
  var html = utils.format(getEmailTemplate (TRAVELER, NEW_CHAT_MESSAGES), userName, link);
  sendEmail (null, toList, userSubjects[NEW_CHAT_MESSAGES], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendUserNewChatMessagesReminder1Email = function (toList, userName, link, cb) {
  var html = utils.format(getEmailTemplate (TRAVELER, NEW_CHAT_MESSAGES_REMINDER_1), userName, link);
  sendEmail (null, toList, userSubjects[NEW_CHAT_MESSAGES_REMINDER_1], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendUserNewChatMessagesReminder2Email = function (toList, userName, link, cb) {
  var html = utils.format(getEmailTemplate (TRAVELER, NEW_CHAT_MESSAGES_REMINDER_2), userName, link);
  sendEmail (null, toList, userSubjects[NEW_CHAT_MESSAGES_REMINDER_2], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendUserNewChatMessagesReminderFinalEmail = function (toList, userName, link, cb) {
  var html = utils.format(getEmailTemplate (TRAVELER, NEW_CHAT_MESSAGES_REMINDER_FINAL), userName, link);
  sendEmail (null, toList, userSubjects[NEW_CHAT_MESSAGES_REMINDER_FINAL], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentNewChatMessagesEmail = function (toList, agentName, link, cb) {
  var html = utils.format(getEmailTemplate (AGENT, NEW_CHAT_MESSAGES), agentName, link);
  sendEmail (null, toList, agentSubjects[NEW_CHAT_MESSAGES], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentNewChatMessagesReminder1Email = function (toList, agentName, link, cb) {
  var html = utils.format(getEmailTemplate (AGENT, NEW_CHAT_MESSAGES_REMINDER_1), agentName, link);
  sendEmail (null, toList, agentSubjects[NEW_CHAT_MESSAGES_REMINDER_1], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentNewChatMessagesReminder2Email = function (toList, agentName, link, cb) {
  var html = utils.format(getEmailTemplate (AGENT, NEW_CHAT_MESSAGES_REMINDER_2), agentName, link);
  sendEmail (null, toList, agentSubjects[NEW_CHAT_MESSAGES_REMINDER_2], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendAgentNewChatMessagesReminderFinalEmail = function (toList, agentName, link, cb) {
  var html = utils.format(getEmailTemplate (AGENT, NEW_CHAT_MESSAGES_REMINDER_FINAL), agentName, link);
  sendEmail (null, toList, agentSubjects[NEW_CHAT_MESSAGES_REMINDER_FINAL], html, function (err, result) {
    cb (err, result);
  });
};

exports.sendRequestTravelExpertEmailAlert = function(toList, data, cb) {
  var html = format(getEmailTemplate(null, REQUEST_TRAVEL_EXPERT), data);
  sendEmail(null, toList, commonSubjects[REQUEST_TRAVEL_EXPERT], html, function(err, result) {
    cb(err, result);
  });
};

function getEmailTemplate (userType, key, headerTemplate) {
  var emailBodyFile = "/" + key + ".html";
  var emailBodyPath = BASE_EMAIL_TEMPLATE_PATH;
  if (userType === TRAVELER) {
    emailBodyPath += "/user";
  }
  else if (userType === AGENT) {
    emailBodyPath += "/agent";
  }
  emailBodyPath += emailBodyFile;
  var body = fs.readFileSync(emailBodyPath, "utf8");
  var hTemplate = (!headerTemplate)? HEADER_TEMPLATE : headerTemplate;
  var emailTemplate = hTemplate + body + FOOTER_TEMPLATE;
  return emailTemplate;
}

function sendEmail (fromEmail, toList, subject, emailHtml, cb) {
  var _fromEmail = (!fromEmail)? FROM_EMAIL: fromEmail;
  sendgrid.sendEmail(_fromEmail, toList, subject,
      emailHtml, function (err, result) {
      cb (err, result);
  });
}
