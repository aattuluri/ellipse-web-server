import cookie from 'react-cookie';

function getDateByAddHours(hours) {
  let d = new Date();
  return new Date(d.setTime(d.getTime() + hours*60*60*1000));
}

export function getParameterByName (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export function setCookie(name, value, expires, path='/') {
  cookie.save(name, value, {expires: getDateByAddHours(expires), path: path});
}