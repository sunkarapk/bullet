module.exports = function (app) {

  app.modErr = function (err) {
    if (err && err.validate && err.validate.errors) {
      err = err.validate.errors;
      var ret = {};

      err.forEach(function (e) {
        ret[e.property] = e.message;
      });

      return ret;
    } else return {};
  };

};
