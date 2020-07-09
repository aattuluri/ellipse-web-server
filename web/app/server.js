const hapi = require('hapi');
const config = require('./config');

AA.Server = (function () {

    require('babel-core/register')({
      presets: ['react', 'es2015']
    });

    var server = new hapi.Server({
      cache: [{
           name: 'redisSessionCache',
           engine: require('catbox-redis')
       }]
    });
    server.connection({
        host: config.get('sysVars:host'),
        port: config.get('sysVars:port'),
    });
    //enable cors
    server.ext('onPreResponse', require('hapi-cors-headers'));
    server.register([
      { register: require('vision')},
      { register: require('bell')},
      { register: require('lout') },
      { register: require('inert') },
      { register: require('vision') },
      { register: require('hapi-auth-cookie') },
      { register: require('./auth')},
      { register: require('./chat_plugin')},
      { register: require('./messenger')},
      { register: require('good'),
        options: {
          reporters: [{
            reporter: require('good-console'),
            events: {
              response: '*',
              log: '*'
            }
          }]
        }
      }
    ], function (err) {
      if (err) throw err;
      server.views({
        engines: {
          html: require('handlebars'),
          jsx:{
            module: require('hapi-react-views'),
            compileMode: 'sync',
            compileOptions: {
              isCached: false
            }
          }
        },
        relativeTo: __dirname,
        path: 'views',
        partialsPath: 'views/templates'
      });
      // TODO: Define mongo cache for user sessions.
    });
    server.Start = function () {
      server.start(function (err) {
        if (err) console.log(err);
        console.log('Server running at ' + server.info.uri);
        require('./livechat/chat').init(server.listener, function(){});
        //notifications
        var notificationCron = require('./controllers/notification-cron');
        notificationCron.init();
      });
    };
    return server;
})();
