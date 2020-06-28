var Handler = require('./handlers');

module.exports = [{
        path: '/google/places',
        method: 'GET',
        config: {
           auth: false,
           handler: Handler.getPlaceDetail
        }
}];
