
/**
 * Module dependencies
 */

var path = require('path')
  , nconf = require('nconf');

var application;

module.exports = function (app, pwd) {
  application = app;

  app.env = process.env.NODE_ENV || 'development';

  app.config = new nconf.Provider();
  app.config.use('file', { file: path.join(pwd, 'config', app.env + '.json') });

  require('./lib/models')(app, pwd);
  require('./lib/controllers')(app, pwd);
  require('./lib/director')(app);

  return app;
};

module.exports.app = application;
