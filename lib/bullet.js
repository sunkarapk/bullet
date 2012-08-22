
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

  app.favicon = path.join(pwd, 'public', 'favicon.ico');
  app.static = path.join(pwd, 'public');
  app.views = path.join(pwd, 'app', 'views');

  app.session = app.config.get('session');
  app.flash   = require('./flash');

  require('./error')(app);
  require('./model')(app, pwd);
  require('./controller')(app, pwd);
  require('./director')(app);
  require('./helper')(app, pwd);
  require('./session')(app);

  return app;
};

bullet.__defineGetter__('app', function () {
  return _app;
});
