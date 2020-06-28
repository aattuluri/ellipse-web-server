//Add all the routes related to Auth Plugin here.
var Handler = require('./handlers');
var users = require("../controllers/users");
var authConstants = require("./auth_constants");

module.exports = [{
    path: authConstants.ROUTE_FB_AUTH,
    method: "GET",
    config: {
        auth: 'facebook',
        handler: Handler.sessionManagement
    }

}, {
    path: authConstants.ROUTE_GOOGLE_AUTH,
    method: "GET",
    config: {
        auth: 'google',
        handler: Handler.sessionManagement
    }
}, {
    path: authConstants.ROUTE_AA_AUTH,
    method: "POST",
    config: {
      auth: {
        strategies: ["aa-auth"],
        payload: 'required'
      },
      handler: Handler.sessionManagement
    }
}, {
    path: authConstants.ROUTE_LOGOUT,
    method: "GET",
    config: {
        auth: 'session',
        handler: function(request, reply) {
            var redirectPath = authConstants.ROUTE_DEFAULT_LOGIN;
            var user = request.auth.credentials;
            if (user &&
                user.type === users.User.TYPE.TRAVELER) {
              redirectPath = authConstants.ROUTE_USERAPP_LOGIN;
            }
            request.auth.session.clear();
            return reply.redirect(redirectPath);
        }
    }
}];
