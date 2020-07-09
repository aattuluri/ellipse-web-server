
var logger = require("../logger").logger;
var boom = require ("boom");
var common = require("./common");


function init ()
{
   //set persistent menu for messenger chat
   common.setPersistentMenu ();
}

init ();


function handleFacebookMessages(request, reply) {

  var data = request.payload;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          common.receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          common.receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          common.receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          common.receivedPostback(messagingEvent);
        } else {
          logger.info ("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    reply({statusCode: 200});
  }
}

module.exports = {
  handleFacebookMessages: handleFacebookMessages
};
