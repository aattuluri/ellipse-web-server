// TODO(ivan): Get rid of this global AA object.
AA = {};

require('./app/server');
require('./app/routes');

AA.RegisterRoutes();
AA.Server.Start();
