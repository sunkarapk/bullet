var path = require('path')
  , fs = require('fs')
  , utile = require('utile');

var application, controllersBefore;

var Dispatch = module.exports = function (app, pwd) {
  application = app;

  app.routes = {};
  app.c = {};
  app.r = {};

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

  require(path.join(pwd, 'app/routes')).call(new Dispatch.builder(app.routes));
};

Dispatch.builder = function (scope, path) {
  var self = this
    , app = application
    , _m = Dispatch._methods
    , _a = Dispatch._action
    , _c = Dispatch._checkAction
    , _p = Dispatch._pathFunction;

  this._path = path || [''];
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
      if (options.as) {
        app.r[options.as + '_path'] = (url == '' ? _p(this._path) : _p(this._path.concat(url)));
      }
    }
  };

  this.api = function (model) {
    this.scope(model, function () {
      this.match('', model + '/index', {via: ['get'], as: 'posts'});
      this.match('', model + '/create', {via: ['post']});
      this.match(':id', model + '/show', {via: ['get'], as: 'post'});
      this.match(':id', model + '/update', {via: ['post']});
      this.match(':id', model + '/destroy', {via: ['delete']});
    });
  };

  this.resource = function (model) {
    this.scope(model, function () {
      this.match('new', model + '/new', {via: ['get'], as: 'new_post'});
      this.match(':id/edit', model + '/edit', {via: ['get'], as: 'edit_post'});
    });
    this.api(model);
  };

  this.scope = function (name, func) {
    name = '/' + name;
    this._scope[name] = this._scope[name] || {};
    func.call(new Dispatch.builder(this._scope[name], this._path.concat(name.slice(1))));
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

Dispatch._pathFunction = function (path) {
  var ret = '', c = 0;
  path.join('/').split('/').forEach(function (p) {
    if (p[0] == ':') {
      ret+='"+arguments[' + c + ']+"';
      c++;
    } else {
      ret+=p;
    }
    ret+='/';
  });
  ret = ret.slice(0,-1);

  if (c==0) return ret;
  else {
    eval('var func=function(){return "' + ret + '";};');
    return func;
  }
};

Dispatch._action = function (action) {
  var func = function () {
    var self = this
      , app = application;

    this.arguments = arguments;

    utile.async.forEachSeries(
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
        console.log('No action named ' + action[1] + ' in controller ' + action[0]);
      }
    } else {
      console.log('No controller named ' + action[0]);
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
