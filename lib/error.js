module.exports = function (app) {

  app.modErr = function (err) {
    if (err) {
      var ret = {};

      if (err.validate && err.validate.errors) {
        err = err.validate.errors;
      }

      if (err instanceof Array) {
        err.forEach(function (e) {
          ret[e.property] = e.message;
        });
      }

      return ret;
    } else return {};
  };

};
