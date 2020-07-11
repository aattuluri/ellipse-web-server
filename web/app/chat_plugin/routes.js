var Handler = require('./handlers');

var corsOprions = {
  "origin": ['*'],
  "headers": ['Accept', 'Content-Type', 'apikey']
};

module.exports = [{
      path: '/p/user',
      method: 'PUT',
      config: {
         auth: false,
         cors: corsOprions,
         handler: Handler.createPluginUser
      }
  },
  {
      path: '/p/loadChat/{chatid}',
      method: 'GET',
      config: {
         auth: false,
         cors: corsOprions,
         handler: Handler.loadPluginChat
      }
  }
  //,{
  //     path: '/p/endChat/{chatid}',
  //     method: 'GET',
  //     config: {
  //        auth: false,
  //        cors: corsOprions,
  //        handler: Handler.endPluginChat
  //     }
  // }
];
