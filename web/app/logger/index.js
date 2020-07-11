var winston = require('winston');

var DEBUG = process.env.DEBUG;

var logLevel = 'info';
var maxFiles = 5;
var maxsize = 100000;

if (DEBUG) {
	logLevel = 'debug';
}

var logger = new (winston.Logger)({
    transports: [
      new winston.transports.File({
    	  filename: 'all.log',
    	  level: logLevel,
    	  maxsize: maxsize,
          maxFiles: maxFiles,
          json: false
      })
    ],
    exceptionHandlers: [
      new winston.transports.File({
    	  filename: 'exceptions.log',
    	  level: logLevel,
    	  maxsize: maxsize,
          maxFiles: maxFiles,
          json: false
      })
    ],
    exitOnError: false
});

/*  DISABLED the modified methods which print the file and line numbers

var logger_info_old = logger.info;
logger.info = function(msg) {
  var fileAndLine = traceCaller(1);
  return logger_info_old.call(this, fileAndLine + ":" + msg);
};

var logger_error_old = logger.error;
logger.error = function(msg) {
  var fileAndLine = traceCaller(1);
  return logger_error_old.call(this, fileAndLine + ":" + msg);
};
*/

/**
* examines the call stack and returns a string indicating
* the file and line number of the n'th previous ancestor call.
* this works in chrome, and should work in nodejs as well.
*
* @param n : int (default: n=1) - the number of calls to trace up the
*   stack from the current call.  `n=0` gives you your current file/line.
*  `n=1` gives the file/line that called you.
*/

function traceCaller(n) {
  if( isNaN(n) || n<0) n=1;
  n+=1;
  var s = (new Error()).stack, a=s.indexOf('\n',5);
  while(n--) {
    a=s.indexOf('\n',a+1);
    if( a<0 ) { a=s.lastIndexOf('\n',s.length); break;}
  }
  b=s.indexOf('\n',a+1); if( b<0 ) b=s.length;
  a=Math.max(s.lastIndexOf(' ',b), s.lastIndexOf('/',b));
  b=s.lastIndexOf(':',b);
  s=s.substring(a+1,b);
  return s;
}

exports.logger = logger;
