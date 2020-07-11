
var ENTER_KEY_CODE = 13;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getCurrentBaseUrl () {
    var url = [location.protocol, '//', location.host].join('');
    return url;
}

function getCurrentUrlWithOutQueryString () {
    var url = [location.protocol, '//', location.host, location.pathname].join('');
    return url;
}

function getFormattedDateTime (epochMillis) {
  var m = moment (epochMillis);
  return m.format("MMM Do HH:mm:ss A z");
}
