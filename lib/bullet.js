
/**
 * Module dependencies
 */

var path = require('path')
  , nconf = require('nconf');

var _app;

var bullet = module.exports;

bullet.init = function (app, pwd) {
  _app = app;

  app.env = process.env.NODE_ENV || 'development';

  app.config = new nconf.Provider();
  app.config.use('file', { file: path.join(pwd, 'config', app.env + '.json') });

  require('./models')(app, pwd);
  require('./controllers')(app, pwd);
  require('./director')(app);
  require('./locals')(app);
  require('./error')(app);

  return app;
};

bullet.__defineGetter__('app', function () {
  return _app;
});
