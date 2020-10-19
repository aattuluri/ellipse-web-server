var Mongoose = require('mongoose');
// var Shortid = require('shortid')
// var Async = require('async');
// var Grid = require('gridfs-stream');
// const fs = require('fs');
const stream = require('stream');
const conn = Mongoose.connection;
var gridFSBucket
conn.on('open', () => {
    // console.log("open")
    gridFSBucket = new Mongoose.mongo.GridFSBucket(conn.db);
})


async function getFileById(fileId, res, cb) {

    const db = conn.db;
    const collection = db.collection('fs.files');
    collection.findOne({ filename: fileId }).then((result) => {
        if (!result) {
            //Do Nothing
        }
        else {
            res.header('Content-Type', result.metadata.contentType)
            gridFSBucket.openDownloadStreamByName(fileId).
                pipe(res).
                on('error', function (error) {
                    res.status(201).json({"error":"not found"})
                    cb(error, fileId)
                }).
                on('finish', function () {
                    // console.log('done!');
                });
        }
    })

}


async function saveFile(rs, fileName, userId, purpose, cb) {

    // var filename = Shortid.generate();
    var contentType = rs.mimetype;
    var origFilename = rs.name;
    var bufferStream = new stream.PassThrough();
    bufferStream.end(Buffer.from(rs.data));

    var ws = await gridFSBucket.openUploadStream(fileName,
        { "metadata": { "contentType": contentType, "origFilename": origFilename, "userId": userId, "purpose": purpose } });
    await bufferStream.pipe(ws).on('error', function (error) {
        cb(error, { "message": "fail" });
    }).
        on('finish', function () {
            cb(null, { "message": "success" });
        });

}

async function saveCertifiate(stream, fileName, userId, purpose, cb) {

    var ws = await gridFSBucket.openUploadStream(fileName,
        { "metadata": { "contentType": "application/pdf", "userId": userId, "purpose": purpose } });
    await stream.pipe(ws).on('error', function (error) {
        cb(error, { "message": "fail" });
    }).
        on('finish', function () {
            cb(null, { "message": "success" });
        });

}

function deleteFileById(fileId, cb) {
    const db = conn.db;
    const collection = db.collection('fs.files');
    collection.findOne({ filename: fileId }).then((result) => {
        if (!result) {
            //Do Nothing
            cb(null, { "message": "failure" })
        }
        else {
            gridFSBucket.delete(result._id).then(() => {
                cb(null, { "message": "success" })
            })

        }
    })
    // const db = conn.db;
    // gridFSBucket.delete(fileId).on('finish',()=>{
    //     cb(null,{"message": "success"})
    // })
    // gfs.remove({
    //     filename: fileId
    // }, function (err) {
    //     if (err) return cb(err);
    //     cb(null);
    // });
}

// function deleteUserFileById(fileId, userId, cb) {
//     gfs.remove({
//         filename: fileId,
//         "metadata.userId": userId,
//     }, function (err) {
//         if (err) return cb(err);
//         cb(null);
//     });
// }

module.exports = {
    getFile: getFileById,
    saveFile: saveFile,
    deleteFile: deleteFileById,
    saveCertificate: saveCertifiate,
};