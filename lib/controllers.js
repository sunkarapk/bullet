var path = require('path')
  , fs = require('fs')
  , async = require('async');

var application, controllersBefore;

var Dispatch = module.exports = function (app, pwd) {
  application = app;

  app.routes = {};
  app.c = {};

  controllersBefore = {};

  var dir = path.join(pwd, 'app/controllers');
  var files = fs.readdirSync(dir);

  files.forEach(function (file) {
    if (path.extname(file) == '.js') {
      file = file.replace('.js', '');
      app.c[file] = require(path.join(dir, file));
    }
  });

  for (var i in app.c) {
    var actions = {};
    controllersBefore[i] = {};

    for (var j in app.c[i]) {
      if (j[0] != '_') {
        actions[j] = true;
        controllersBefore[i][j] = [];
      }
    }

    if (app.c[i]._before) {
      app.c[i]._before.forEach(function (before) {
        if (before.only) {
          before.only.forEach(function (action) {
            controllersBefore[i][action].push(before.exec);
          });
        } else {
          if (before.except) {
            before.except.forEach(function (action) {
              actions[action] = false;
            });
          }

          for (var j in actions) {
            if (actions[j]) {
              controllersBefore[i][j].push(before.exec);
            } else {
              actions[j] = true;
            }
          }
        }
      });
    }
  }

  require(path.join(pwd, '../app/routes')).call(new Dispatch.builder(app.routes));
};

Dispatch.builder = function (scope) {
  var self = this
    , _m = Dispatch._methods
    , _a = Dispatch._action
    , _c = Dispatch._checkAction;

  this._scope = scope;

  this.root = function (action, options) {
    options = options || {};
    action = action.split('/');
    if (_c(action)) {
      this._scope['/'] = _m(this.scope['/'] || {}, _a(action), options.via);
    }
  };

  this.match = function (url, action, options) {
    options = options || {};
    action = action.split('/');
    if (_c(action)) {
      this._scope['/' + url] = _m(this._scope['/' + url] || {}, _a(action), options.via);
    }
  };

  this.api = function (model) {
    this.scope(model, function () {
      this.match('', model + '/index', {via: ['get']});
      this.match('', model + '/create', {via: ['post']});
      this.match(':id', model + '/show', {via: ['get']});
      this.match(':id', model + '/update', {via: ['post']});
      this.match(':id', model + '/destroy', {via: ['delete']});
    });
  };

  this.resource = function (model) {
    this.scope(model, function () {
      this.match('new', model + '/new', {via: ['get']});
      this.match(':id/edit', model + '/edit', {via: ['get']});
    });
    this.api(model);
  };

  this.scope = function (name, func) {
    name = '/' + name;
    this._scope[name] = this._scope[name] || {};
    func.call(new Dispatch.builder(this._scope[name]));
  };

  ['get', 'post', 'put', 'delete'].forEach(function (method) {
    self[method] = function (url, action) {
      action = action.split('/');
      if (_c(action)) {
        var name = '/' + url;
        self._scope[name] = self._scope[name] || {};
        self._scope[name][method] = _a(action);
      }
    };
  });
};

Dispatch._action = function (action) {
  var func = function () {
    var self = this
      , app = application;

    this.arguments = arguments;

    async.forEachSeries(
      controllersBefore[action[0]][action[1]], function (exec, callback) {
        if (exec.indexOf('/') > 0) {
          exec = exec.split('/');
        } else {
          exec = [action[0], exec];
        }

        if (app.c[exec[0]][exec[1]]) {
          app.c[exec[0]][exec[1]].apply(self, [callback].concat(self.arguments));
        } else {
          callback();
        }
      }, function (err) {
        app.c[action[0]][action[1]].apply(self, self.arguments);
      }
    );
  };

  func.stream = true;
  return func;
};

Dispatch._checkAction = function (action) {
  var app = application;

  if (action.length == 2) {
    if (app.c[action[0]]) {
      if (app.c[action[0]][action[1]]) {
        if (action[1][0] == '_') {
          console.log('Action name can not start with _ in ' + action.join('/'));
        } else {
          return true;
        }
      } else {
        console.log('No action named ' + action[1] + ' in presenter ' + action[0]);
      }
    } else {
      console.log('No presenter named ' + action[0]);
    }
  } else {
    console.log('Wrong action format ' + action.join('/'));
  }
  return false;
};

Dispatch._methods = function (ret, func, via) {
  via = via || ['get', 'post', 'put', 'delete'];
  via.forEach(function (method) {
    ret[method] = func;
  });
  return ret;
};
