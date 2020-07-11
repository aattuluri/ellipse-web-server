$( document ).ready(function() {

  var ENTER_KEY_CODE = 13;

  function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  var usersInfoMap;

  var userId;

  var userName;

  var userEmail;

  var socket; // initialise socket.io connection

  var chatId;

  var img;

  var otherUserImg;

  var lastReceivedMsg;

  function getFormattedTime(t) {

      var m = moment(t);
      return m.format("HH:mm:ss A");

  }

  function getDayHeaderVal (currDate) {
      var now = new Date();
      var day = now.getDate() - currDate.getDate();
      var dayStr;
      switch (day) {
        case 0:
          dayStr = 'TODAY';
          break;
        case 1:
          dayStr = 'YESTERDAY';
          break;
        default:
          dayStr = moment(currDate).format('MMMM Do');
          break;
      }
      return dayStr;
  }

  function linkify(inputText) {
      var replacedText, replacePattern1, replacePattern2, replacePattern3;

      //URLs starting with http://, https://, or ftp://
      replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

      //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
      replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

      //Change email addresses to mailto:: links.
      replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
      replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

      return replacedText;
  }

  /**
   * renders messages to the DOM
   * nothing fancy
   */
  function renderMessage (msg) {
    //add day header if required
    var lmd;
    if (lastReceivedMsg) {
      lmd = new Date(lastReceivedMsg.t);
    }
    var nmd = new Date(msg.t);
    var html = '';
    if (!lmd || nmd.getDay() != lmd.getDay()) {
      html += '<div class="hr-divider m-t-md m-b">';
        html += '<h3 class="hr-divider-content hr-divider-heading">'+getDayHeaderVal(nmd)+'</h3>';
      html += '</div>';
    }
    //add the chat message
    var msgHtml = '';
    //check if we have files instead of text messages
    var mp = '';
    var ms = '';
    if (msg.f) {
      var files = msg.f;
      // files.map(function(file) {
      //   console.log(file.title)
      //   if (file.ty === 0) {
      //     msgHtml = mp + '<div><img class="chat-inline-image" src="/file/'+file.id+'"/><br/>'+file.title+'</div>' + ms;
      //   } else {
      //     msgHtml = mp + '<div><a target="_blank" href="/file/'+file.id+'">'+file.n+'</a></div>' + ms;
      //   }
      // });
      if (files.length !== 1) {
        // Carousel with Bootstrap
        mp = '<div id="carousel-message-images'+ msg.t+'" class="carousel slide chat-message-images" data-ride="carousel">';
        ms = '</div>';
        msgHtml = '<div class="carousel-inner" role="listbox">'
        files.map(function(file, index) {
          var isActive = index === 0 ? "active" : "";
          var title = (file.title === undefined ? "" : file.title);
          if (file.ty === 0) {
            msgHtml = msgHtml + '<div class="item '+ isActive +'"> \
                  <img class="chat-inline-image" src="/file/'+file.id+'"/>'+title
                  +'</div>';
          }
        });
        var leftControls = '<a class="left carousel-control" href="#carousel-message-images'+ msg.t+'" role="button" data-slide="prev"><span class="ti-angle-left" aria-hidden="true"></span><span class="sr-only">Previous</span></a>';
        var rightControls =  '<a class="right carousel-control" href="#carousel-message-images'+ msg.t+'" role="button" data-slide="next"><span class="ti-angle-right" aria-hidden="true"></span><span class="sr-only">Next</span></a>';

        msgHtml = mp + msgHtml + ms + leftControls + rightControls + '</div>';
      } else {
        mp = '<div class="chat-message">';
        ms = '</div>';
        var title = (files[0].title === undefined ? "" : files[0].title);
        msgHtml = mp + '<div><img class="chat-inline-image" src="/file/'+files[0].id+'"/><br/>'+title+'</div>' + ms;
      }
    }
    else if (msg.p) {
      //create payment msg
      var p = msg.p;
      var title = 'Service Fee';
      var btnClass = 'service-fee-edit-btn';
      var sfmp = '<div class="chat-message agent-fee">';
      switch (p.type) {
        case 0:
          title = 'Service Fee';
          btnClass = 'service-fee-edit-btn';
          break;
        case 1:
          title = 'Trip Fee';
          btnClass = 'trip-fee-edit-btn';
          break;
        case 2:
          title = 'Refund';
          btnClass = 'refund-edit-btn';
          break;
        default:
          break;
      }
      msgHtml = sfmp + title + ': <span class="bold fee-amount"> $' + p.a + ' </span>&nbsp;&nbsp;&nbsp;<a class="'+btnClass+'" sfid="' + p.id + '">edit</a>' + ms;
    }
    else if (msg.m) {
      if (msg.m.indexOf("div") > 0) {
        msgHtml = mp + $('<div/>').html(linkify(msg.m)).text() + ms;
      } else {
        msgHtml = mp + linkify(msg.m) + ms;
      }
    }

    //TBD: Remove the hack below
    //hack hardcode the image URL
    var msgImg = img;
    if (msg.uid && usersInfoMap[msg.uid]) {
      msgImg = usersInfoMap[msg.uid].image;
      msg.u = usersInfoMap[msg.uid].firstName;
    }
    else if (msg.u !== userName) {
      msgImg = otherUserImg;
    }

    html += '<div class="chat-item">';
    html += '<span><img class="chat-image" src="' + msgImg + '"></span>';
    html += '<span class="user-name"> ' + msg.u + ' </span>';
    html += '<span> '+ getFormattedTime (msg.t) +' </span>';
    html += '<div class="chat-message">'+ msgHtml +'</div>';
    html += '</div>';

    $('.chat').append(html);  // append to list
    $('.carousel').carousel()

    return;
  }

  $( "#chatbox" ).keyup(function(e) {
      if (e.keyCode != ENTER_KEY_CODE) {
        socket.emit('io:typing', {c: chatId, u: userName});
      }
  });

  $('#chatbox').keypress(function(e) {
    if (e.keyCode == ENTER_KEY_CODE) {
      //if input is empty or white space do not send message
      if($('#chatbox').val().match(/^[\s]*$/) !== null) {
        $('#chatbox').val('');
        $('#chatbox').attr('placeholder', 'Type a message...');
        return;
      }
      var text  = $('#chatbox').val();
      socket.emit('io:msg', {c: chatId, m: text});
      $('#chatbox').val(''); // clear message form ready for next/new message
      $('#chatbox').attr('placeholder', 'Type a message...'); //clears placeholder once a msg is successfully sent
    }
  });

  // keeps latest message at the bottom of the screen
  // http://stackoverflow.com/a/11910887/2870306
  function scrollToBottom () {
    $(window).scrollTop($('.chat').height());
  }

  window.onresize = function(){
    scrollToBottom();
  };

  function showSocketIOError (errMsg) {
    $('#typing').show();
    $('#typing').addClass('aa-failed-text');
    $('#typing').html(errMsg);
  }

  function clearSocketIOError () {
    $('#typing').hide();
    $('#typing').html('');
    $('#typing').removeClass('aa-failed-text');
  }

  function init() {

    socket = io ();

    window.socket = socket;

    chatId = getParameterByName ('id');
    img = 'default_profile.png';

    $.get( "/userinfo", function( data ) {
      socket.userId = userId = data.id;
      socket.userName = userName = data.name;
      socket.userEmail = userEmail = data.email;
      socket.img = img = data.img;
      window.newMessageSoundEnabled = (data.newMessageSoundEnabled !== null)?
                data.newMessageSoundEnabled: false;

      //assign the label for enabling/disabling the sound notifications for new messages
      var enableDisableSoundsLabel;
      if (window.newMessageSoundEnabled) {
        enableDisableSoundsLabel = "Disable sound for new messages";
      } else {
        enableDisableSoundsLabel = "Enable sound for new messages";
      }
      $(".enable-or-disable-sound").text(enableDisableSoundsLabel);

      //TBD: remove the hack below
      //Hack to display the other user's image
      if (img === "img/user_profile.png") {
        otherUserImg = "img/agent_profile.png";
      } else {
        otherUserImg = "img/user_profile.png";
      }

      socket.on('connect', function () {
        //clear error messages
        clearSocketIOError();
        //now join the chat
        socket.emit('io:join', {c: chatId, u: userName, e: userEmail, uid: userId});
      });

      //subscribe to get the latest messages
      socket.on('io:msg:latest', function(msg) {
        renderMessage (msg);
        //play notification sound for messages from other party
        if (msg.u !== userName && window.newMessageSoundEnabled) {
          $("#new-message-notification").get(0).play();
        }
        lastReceivedMsg = msg;
        scrollToBottom();
        //now that the user has seen this message clear the unread message count on server
        clearUnreadMessageCount();
      });

      //subscribe to the user typing event
      socket.on('io:typing', function(msg) {
        var newMsgUser = msg.u;
        if (msg.uid) {
          newMsgUser = usersInfoMap["" + msg.uid].firstName;
        }
        var text = newMsgUser + " is typing...";
        if (newMsgUser != userName) {
          $('#typing').show();
          $('#typing').removeClass('aa-failed-text');
          $('#typing').html(text);
          $('#typing').delay(1000).fadeOut(100);
        }
      });

      socket.on('io:usersinfo', function(msg) {
        var origUsersInfoMap = usersInfoMap;
        usersInfoMap = {};
        if (msg && msg.usersinfo) {
          var usersinfo = msg.usersinfo;
          for (var i = 0; i < usersinfo.length; i++) {
            var userinfo = usersinfo[i];
            var uid = userinfo._id;
            usersInfoMap["" + uid] = userinfo;
          }
        }
        //load the chat history once we have the user info for the very first time
        if (!origUsersInfoMap) {
          $.get('/loadChat/'+chatId, function(data){
            data.map(function(msg){
              msg = JSON.parse(msg);
              renderMessage(msg);
              lastReceivedMsg = msg;
            });
            origUsersInfoMap = usersInfoMap;
            //now that we rendered all the chat history clear the unread message
            // count for this user for this chat on the server
            clearUnreadMessageCount ();
            scrollToBottom();
          });
        }
      });

      //on socket error
      socket.on('error', function(err) {
        //TBD: Handle errors
      });

      //on connect errors
      socket.on('connect_error', function(err) {
        var errMsg = "Server offline.";
        showSocketIOError (errMsg);
      });

      window.socket = socket;

    });

  }

  init ();

	function clearUnreadMessageCount () {
  		var basePath = "/chat/" + chatId + "/clear-unread";
  		$.ajax({
  			url: basePath,
  			type: "DELETE",
  			success: function(response, textStatus, jqXHR) {
  				//do nothing
  			},
  			error: function(jqXHR, textStatus, errorThrown){
  				//do nothing
  			}
  		});
	}

});
