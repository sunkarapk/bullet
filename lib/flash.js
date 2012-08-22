module.exports = function (app) {

  app.flash = function (type, msg) {
    var msgs = this.session.flash = this.session.flash || [];

    if (type && msg) {
      msgs.push({ type: type, msg: msg });
    } else if (type) {
      msgs.push({ type: 'info', msg: type });
    } else {
      this.session.flash = [];
    }

    return msgs;
  };

};
