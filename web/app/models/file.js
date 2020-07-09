var Mongoose = require('mongoose');
var Shortid = require('shortid');
var Async = require('async');
var Grid = require('gridfs-stream');
Grid.mongo = Mongoose.mongo;

var db = require ("../models");

var logger = require ("../logger").logger;

var Schema = db.Schema;
var dbConn = db.conn;

var gfs = Grid (dbConn.db);

function getFileById (fileId, cb) {
  //TBD: check if the file exists
  var fileObj = {};
  Async.parallel([
		//get the filestream
    function(callback) {
      fileObj.readstream = gfs.createReadStream({
         filename: fileId
      });
      callback (null);
		},
    function(callback) {
      gfs.files.find({ filename: fileId }).toArray(function (err, files) {
        if (!err && files.length > 0) {
          fileObj.contentType = files[0].metadata.contentType;
        }
        callback (err);
      });
		}
	], function (err, results) {
      cb (err, fileObj);
	});
}

function saveFile (rs, payload, userId, cb) {
  var filename = Shortid.generate();
  var contentType = rs.hapi.headers["content-type"];
  var origFilename = rs.hapi.filename;
  var ws = gfs.createWriteStream ({
    filename: filename,
    metadata: {
      description: payload.description,
      link: payload.link,
      contentType: contentType,
      userId: userId,
      origFilename: origFilename
    }
  });
  rs.pipe(ws);
  ws.on('close', function (file) {
    //the file type of image is 0 and other file types is 1
    var fileType = (contentType.indexOf("image") >= 0)? 0 : 1;
    cb (null, {
      ty: fileType,
      id: filename,
      n: origFilename,
      title: payload.description
    });
  });
  ws.on('error', function (err) {
    console.log('Error in writing to DB: ' + err);
    cb (err, null);
  });
}

function deleteFileById (fileId, cb) {
  gfs.remove({
    filename: fileId
  }, function (err) {
    if (err) return cb (err);
    cb (null);
  });
}

function deleteUserFileById (fileId, userId, cb) {
  gfs.remove({
    filename: fileId,
    "metadata.userId": userId,
  }, function (err) {
    if (err) return cb (err);
    cb (null);
  });
}

module.exports = {
  getFile: getFileById,
  saveFile: saveFile,
  deleteFile: deleteFileById,
  deleteUserFile: deleteUserFileById
};
