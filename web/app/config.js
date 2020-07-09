const nconf = require('nconf');
const path = require('path');

const environmentConfig = {
  production: {},
  staging: {},
  development: {},
};

const defaultConfig = {
  auth: {
    providers: {
      facebook: {
        provider: 'facebook',
        password: 'hapiauth',
        clientId: '158715191180432',
        clientSecret: '3fd44b40566e95c47417f51834051918',
        isSecure: false,
      },
      google: {
        provider: 'google',
        password: 'hapiauth',
        clientId: "1007253405961-56uprmcs9h5tp2o4u17p3fu1kjeasluq.apps.googleusercontent.com",
        clientSecret: 'h1vjMF_dL8RlTTxJkSP4O8pp',
        isSecure: false,
      },
    },
  },

  messenger: {
    appUrl: 'https://graph.facebook.com/v2.6',
    appId: '158715191180432',
    appSecret: '3fd44b40566e95c47417f51834051918',
    pageAccessToken: 'EAACQWcKXPJABAKwAqQVDqW4nt54K6ZA91du1LlOPMx94ubEKx6uWUd6QCQw9z6DUtssFGc75rDGRYZCNqnIZAx1JazlZBJQBhDsZCpKPlIo5lXq1ZAhvqZAEkq6GSPwccHaj6h2bYBn8BUYIjcKPWxedCZAQsmX2mkP56pPuQZB4skAZDZD',
  },

  sysVars: {
    host: 'localhost',
    port: '3001',
  },
};

nconf.argv()
  .env()
  .file({ file: 'localConfig.json' })
  .add('environment', {
    type: 'literal',
    store: environmentConfig[process.env.NODE_ENV],
  })
  .defaults(defaultConfig);

module.exports = nconf;
