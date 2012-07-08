
/**
 * Module dependencies.
 */

var express = require('express')
  , bullet = require('../lib/bullet')
  , http = require('http');

var app = express();

bullet.init(app, __dirname);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', app.views);
  app.set('view engine', 'jade');

  app.use(express.favicon(app.favicon, app.config.get('cache')));
  app.use(express.responseTime());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session(app.session));
  app.use(app.router);
  app.use(express.static(app.static, app.config.get('cache')));
});

app.configure('development', function(){
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.use(express.logger('default'));
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
