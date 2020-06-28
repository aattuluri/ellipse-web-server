$( document ).ready(function() {

  var ENTER_KEY_CODE = 13;

  var socket = io(); // initialise socket.io connection

  var chatId;
  var img;
  var userName;
  var userEmail;
  var lastReceivedMsg;

  init ();

  function init () {

     $.get( "/userinfo", function( data ) {

       socket.userName = userName = data.name;
       socket.userEmail = userEmail = data.email;
       socket.img = img = data.img;

       getChatId ();

       //load all the current images
       $.get('/loadChat/'+chatId, function(data){
         data.map(function(msg){
           msg = JSON.parse(msg);
           renderMessage(msg);
           lastReceivedMsg = msg;
         });
         scrollToBottom();
       });

       //subscribe to get the latest messages
       socket.on('io:msg:latest', function(msg) {
         console.log(msg);
         console.log(msg.u + " sent: " + msg.m);
         renderMessage (msg);
         lastReceivedMsg = msg;
         scrollToBottom();
       });

       //on socket error
       socket.on('error', function(err) {
         //TBD: Handle errors
       });

       //on connect errors
       socket.on('connect_error', function(err) {
         var errMsg = "Server offline.";
         console.log(err);
       });

       window.socket = socket;

     });
  }

  function clearMessages () {
    $('#messages').html('');
  }

  function loadMessages () {
    $.get('/loadChat/'+chatId, function(data){
      data.map(function(msg){
        msg = JSON.parse(msg);
        renderMessage(msg);
        lastReceivedMsg = msg;
      });
      scrollToBottom();
    });
  }

  $('#switch-chat').click(function(evt) {
    //leave the current chat
    var oldChatId = chatId;
    getChatId ();
    if (chatId && oldChatId && oldChatId !== chatId) {
      socket.emit('io:leave', {c: oldChatId});
      clearMessages ();
      loadMessages ();
    }
  });

  function getChatId () {
    chatId = window.prompt("Enter the chat ID:");
    Cookies.set('chatid', chatId);
    socket.emit('io:join', {c: chatId, u: userName, e: userEmail});
  }

  function leadZero(number) {
    return (number < 10) ? '0'+number : number;
  }

  function getTime(timestamp) {
    var t, h, m, s, time;
    t = new Date(timestamp);
    h = leadZero(t.getHours());
    m = leadZero(t.getMinutes());
    s = leadZero(t.getSeconds());
    return '' + h  + ':' + m + ':' + s;
  }

  /**
   * renders messages to the DOM
   * nothing fancy
   */
  function renderMessage(msg) {
    var html = "<li class='row'>";
    html += "<small class='time'>" + getTime(msg.t)  + " </small>";
    html += "<span class='name'>" + msg.u + ": </span>";
    if (msg.m) {
      html += "<span class='msg'>"  + msg.m + "</span>";
    } else if (msg.f) {
      html += "<span class='msg'>Files were sent!</span>";
    } else if (msg.p) {
      html += "<span class='msg'>Payment option was sent!</span>";
    }
    html += "</li>";
    $('#messages').append(html);  // append to list
    return;
  }

  $( "#m" ).keyup(function(e) {
      if (e.keyCode != ENTER_KEY_CODE) {
        if (!chatId) {
          getChatId ();
        }
        socket.emit('io:typing', {c: chatId, u: userName});
      }
  });

  $('form').submit(function() {

    //if input is empty or white space do not send message
    if($('#m').val().match(/^[\s]*$/) !== null) {
      $('#m').val('');
      $('#m').attr('placeholder', 'please enter your message here');
      return false;
    }

    if(!Cookies.get('chatid') || Cookies.get('chatid').length < 1 || Cookies.get('chatid') === 'null') {
      getChatId();
      return false;
    } else {
      var msg  = $('#m').val();
      socket.emit('io:msg', {c: chatId, m: msg});
      $('#m').val(''); // clear message form ready for next/new message
      $('#m').attr('placeholder', ''); //clears placeholder once a msg is successfully sent
      return false;
    }
  });

  // keeps latest message at the bottom of the screen
  // http://stackoverflow.com/a/11910887/2870306
  function scrollToBottom () {
    $(window).scrollTop($('#messages').height());
  }

  window.onresize = function(){
    scrollToBottom();
  };

  socket.on('io:msg:latest', function(msg) {
    console.log(">> " +msg);
    renderMessage(msg);
    scrollToBottom();
  });

});
