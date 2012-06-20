var app = require('../../../../lib/bullet').app;

module.exports = {
  _before: [],

  index: function () {
    this.res.render('index', { title: 'bullet' });
  }
};
