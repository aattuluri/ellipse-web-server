var ENV = require('./env').ENVIRONMENT;

exports.JSON = "application/json";
exports.SALT = 10;
exports.TITLE = "Agent Avery";
var BASEURL = (!ENV || ENV=="PROD")? "https://agentavery.com" : "http://localhost:3001";
exports.BASEURL = BASEURL;
var USER_BASE_PATH = "/userapp#";
exports.USER_BASE_PATH = USER_BASE_PATH;
var USER_BASE_URL = BASEURL + USER_BASE_PATH;
exports.USER_BASE_URL = USER_BASE_URL;
var USER_SIGNUP_URL = USER_BASE_PATH + "/signup";
exports.USER_SIGNUP_URL = USER_SIGNUP_URL;
var USER_SHORT_SIGNUP_URL = USER_BASE_PATH + "/shortsignup";
exports.USER_SHORT_SIGNUP_URL = USER_SHORT_SIGNUP_URL;
var USER_LOGIN_URL = USER_BASE_PATH + "/login";
exports.USER_LOGIN_URL = USER_LOGIN_URL;
exports.ABS_USER_SIGNUP_URL = BASEURL + USER_SIGNUP_URL;
exports.ABS_USER_SHORT_SIGNUP_URL = BASEURL + USER_SHORT_SIGNUP_URL;
exports.ABS_USER_LOGIN_URL = BASEURL + USER_LOGIN_URL;
var AGENT_LOGIN_URL = "/login";
exports.ABS_AGENT_LOGIN_URL = BASEURL + AGENT_LOGIN_URL;

//bitly URLs
exports.BITLY_USER_LOGIN_URL = "http://bit.ly/297cHpS";
exports.BITLY_AGENT_LOGIN_URL = "http://bit.ly/298hvLD";

//redis pub sub channels
exports.TRIP_NEW = "trip:new";
exports.TRIP_UPDATE = "trip:update";
exports.TRIP_CANCEL = "trip:cancel";
exports.TRIP_ADD_FOR_AGENT = "trip:add:agent";



//numbers
exports.MAX_CONCURRENT_TRIP_CHATS = 3;

//misc
exports.DEFAULT_AGENT_OOO_MESSAGE = "Hi, I am currently out of my work hours and will respond as soon as possible. Please email hello@agentavery.com if you need urgent help.";
exports.AGENT_OOO_MSG_INTERVAL = 5 * 60 * 1000;
exports.DEFAULT_AGENT_TIMEZONE = "America/Los_Angeles";
