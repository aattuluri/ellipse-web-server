//methods for gridfs file saving extracting and deleting


var Mongoose = require('mongoose');
const stream = require('stream');
const conn = Mongoose.connection;
var gridFSBucket
conn.on('open', () => {
    // console.log("open")
    gridFSBucket = new Mongoose.mongo.GridFSBucket(conn.db);
})


//method to get file by id
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

//method to save file
async function saveFile(rs, fileName, userId, purpose, cb) {

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

//method to save certificate
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


//method to delete file by id
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
}



module.exports = {
    getFile: getFileById,
    saveFile: saveFile,
    deleteFile: deleteFileById,
    saveCertificate: saveCertifiate,
};