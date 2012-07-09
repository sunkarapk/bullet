var path = require('path')
  , fs = require('fs')
  , resourceful = require('resourceful');

module.exports = function (app, pwd) {
  resourceful.use('couchdb', app.config.get('db'));

  app.m = {};

  var dir = path.join(pwd, 'app/models');
  var files = fs.readdirSync(dir);
  var capitalize = resourceful.capitalize;

  files.forEach(function (file) {
    if (path.extname(file) == '.js') {
      file = file.replace('.js', '');

      var modelFunc = require(path.join(dir, file));
      app.m[capitalize(file)] = resourceful.define(file, modelFunc);
    }
  });
};
