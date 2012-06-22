var app = require('../../../lib/bullet').app;

module.exports = {
  _before: [
    { exec: '_get', except: ['index', 'new', 'create'] }
  ],

  index: function () {
    var self = this;
    app.m.Post.all(function (err, posts) {
      if (err) throw err;
      self.res.render('posts/index', {posts: posts});
    });
  },

  new: function () {
    this.res.render('posts/new', {post: app.m.Post.new({}), errs: {}});
  },

  create: function () {
    var self = this
      , post = app.m.Post.new(this.req.body.post);

    post.save(function (err, data) {
      if (err) {
        self.res.render('posts/new', {post: post, errs: app.modErr(err)});
      } else {
        self.res.redirect(app.r.post_path(data.id));
      }
    });
  },

  show: function (id) {
    this.res.render('posts/show', {post: this.post});
  },

  edit: function (id) {
    this.res.render('posts/edit', {post: this.post, errs: {}});
  },

  update: function (id) {
    var self = this;

    this.post.update(this.req.body.post, function (err, data) {
      if (err) {
        self.req.body.post.isNewRecord = false;
        self.res.render('posts/edit', {post: self.req.body.post, errs: app.modErr(err)});
      } else {
        self.res.redirect(app.r.post_path(data.id));
      }
    });
  },

  destroy: function (id) {
    var self = this;
    this.post.destroy(function (err, data) {
      if (err) {
        self.res.json(500);
      } else {
        self.res.json(204);
      }
    });
  },

  _get: function (cb, args) {
    var self = this;
    app.m.Post.get(args[0], function (err, data) {
      if (err) {
        self.res.redirect(app.r.posts_path);
      } else {
        self.post = data; cb();
      }
    });
  }
};

