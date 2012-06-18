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
};
