var admin = require("firebase-admin");

var serviceAccount = require(process.env.FIREBASE_KEY_PATH);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})

module.exports = admin