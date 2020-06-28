var async = require('async');
var logger = require("../logger").logger;
var utils = require("../utils");

var file = require("../models/file");


function getFile (fileId, cb) {
  return file.getFile (fileId, cb);
}

function saveFile (fis, payload, userId, cb) {
  return file.saveFile (fis, payload, userId, cb);
}

function deleteFile (fileId, cb) {
  return file.deleteFile (fileId, cb);
}

function deleteUserFile (fileId, userId, cb) {
  return file.deleteUserFile (fileId, userId, cb);
}

module.exports = {
  getFile: getFile,
  saveFile: saveFile,
  deleteFile: deleteFile,
  deleteUserFile: deleteUserFile
};
