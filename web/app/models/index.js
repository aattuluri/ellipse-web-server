var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ENV = require('../env').ENVIRONMENT;

var dbConn = null;

var dbUrl = {
	"PROD": "mongodb://10.134.161.222:27017/aa",
	"DEV": "mongodb://localhost:27017/aa"
};

var dbOptions= {
	"PROD":  {
		server: { poolSize: 5 }
	},
	"DEV": {
		db: { native_parser: true },
		server: { poolSize: 2 }
	}
};

init();

function init () {

	dbConn = mongoose.createConnection(dbUrl[ENV], dbOptions[ENV]);
	exports.conn = dbConn;
	exports.Schema = Schema;

}
