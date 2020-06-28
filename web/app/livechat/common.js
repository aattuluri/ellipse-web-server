var pub = require('redis-connection')();
var logger = require('../logger').logger;

function sanitise(txt) {
  if(txt.indexOf("<") > -1  ||
      txt.indexOf(">") > -1) {
    txt = txt.replace(/</g, "&lt").replace(/>/g, "&gt");
  }
  return txt;
}

function saveAndPublishMessage (data) {
  if (!data.u && !data.uid ) {
    data.u = "AgentAvery";
  }
  var newMsg = {
    c: data.c,
    t: new Date().getTime(),
    u: data.u,
    uid: data.uid
  };
  //add files or text message to the chat message
  if (data.f) {
    newMsg.f = data.f;
  }
  else if (data.p) {
    newMsg.p = data.p;
  }
  else if (data.m) {
    newMsg.m = sanitise (data.m);
  }

  var newMsgStr = JSON.stringify(newMsg);
  pub.RPUSH(data.c + ":messages", newMsgStr);  // chat history
  pub.publish("io:msg:latest", newMsgStr);  // latest message
  //increment unread count for messages for all other users
  pub.HKEYS ("unread_count:" + data.c, function (err, results) {
    if (!err && results && results.length > 0) {
      results.map(function (uid) {
        if (uid !== data.uid) {
          pub.HINCRBY ("unread_count:" + data.c, uid, 1);
          pub.HGET ("unread_count:" + data.c, uid, function (err, result) {
            //console.log(e + "'s counter val for chat "+data.c+" : " + result);
          });
        }
      });
    }
  });

}

module.exports = {
  saveAndPublishMessage: saveAndPublishMessage
};
