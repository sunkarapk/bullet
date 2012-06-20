var director = require('director');

module.exports = function (app) {
  delete app.router;
  app.route = new director.http.Router(app.routes).configure({
    async: true
  });

  app.router = function (req, res, next) {
    app.route.dispatch(req, res, function (err) {
      if (err == undefined || err) next();
    });
  };

  director.http.methods.forEach(function (method) {
    app[method] = function (path, route) {
      if ('get' == method && !route) return app.set(path);
      route.stream = true;
      return app.route.on(method, path, route);
    }
  });
};
