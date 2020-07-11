var Handler = require('./handlers');

module.exports = [{
        path: '/fb/messenger',
        method: 'POST',
        config: {
           auth: false,
           handler: Handler.handleFacebookMessages
        }
}];
