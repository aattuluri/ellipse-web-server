
$( document ).ready(function() {
  var SESSION_EXPIRED_POPUP_SELECTOR = "#session-expired-popup";
  var USERAPP = "userapp";
  var USERAPP_LOGIN_PATH = "/userapp#/login";
  var DEFAULT_LOGIN_PATH = "/login";

  var currentLocation = window.location + "";

  var loginPath = DEFAULT_LOGIN_PATH;

  if (currentLocation &&
      currentLocation.indexOf (USERAPP) >= 0) {
    loginPath = USERAPP_LOGIN_PATH;
  }

  sessionExpiredCheck ();

  var sessionExpiredCheckTask = setInterval (sessionExpiredCheck, 15000);

  $(SESSION_EXPIRED_POPUP_SELECTOR).modal({ show: false});

  function sessionExpiredCheck () {
    var basePath = "/wassup";
    $.ajax({
      url: basePath,
      type: "GET",
      success: function(response, textStatus, jqXHR) {
        if (response == 1) {
          $(SESSION_EXPIRED_POPUP_SELECTOR).modal({
            backdrop: 'static',
            keyboard: false
          });
          $(SESSION_EXPIRED_POPUP_SELECTOR).modal('show');
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        //do nothing
      }
    });
  }

  $('.session-expired-btn-ok').on('click', function (evt) {
    window.location = loginPath;
  });

});
