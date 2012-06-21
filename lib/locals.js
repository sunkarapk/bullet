module.exports = function (app) {
  app.locals.use(function (req, res) {
    res.locals.r = app.r;
  });
};
