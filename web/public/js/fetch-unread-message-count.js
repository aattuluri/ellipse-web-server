$( document ).ready(function() {
  //set up a timer task to get the unread messages
  //get all chat ids
  var chatIds = [];
  $(".active-clients li a").each(function( index ) {
    var href = $(this).attr('href');
    if (href) {
      chatIds.push(href.split("=")[1]);
    }
  });

  unreadMessageCountTask ();

  var unreadMessageCountTimerTask = setInterval (unreadMessageCountTask, 10000);

  function unreadMessageCountTask () {
    chatIds.map(function( chatId ) {
      var basePath = "/chat/" + chatId + "/unread-count";
      $.ajax({
        url: basePath,
        type: "GET",
        success: function(response, textStatus, jqXHR) {
          //send a chat message
          if (response.success) {
            var activeChatLink = '.active-clients li a[href$="'+chatId+'"]';
            var notificationSearch = $(activeChatLink).find('.notification');
            if (response.count > 0) {
              //add/update the unread count
              if (notificationSearch.length > 0) {
                notificationSearch.first().text(response.count);
              } else {
                $(activeChatLink).append('<span class="notification"> '+response.count+' </span>');
              }
            } else {
              //remove existing unread count if any
              if (notificationSearch.length > 0) {
                notificationSearch.first().remove();
              }
            }
          } else {
              //do nothing
          }
        },
        error: function(jqXHR, textStatus, errorThrown){
          //do nothing
        }
      });
    });
  }
});
