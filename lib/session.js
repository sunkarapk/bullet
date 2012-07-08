var connect = require('connect')
  , resourceful = require('resourceful');

module.exports = function (app) {

  var CouchStore = function (options) {
    options = options || {};
    connect.session.Store.call(this, options);

    var config = app.config.get('db');
    config.database = config.database + '-sessions';

    app.m.Session = resourceful.define('session', function () {
      this.use('couchdb', config);

      this.object('data');

      this.filter('expires', {
        map: function (doc) {
          if (doc.resource == 'Session') {
            emit(doc.data.cookie.expires, {id: doc._id });
          }
        }
      });
    });

    var that = this;
    that.db = app.m.Session.connection.connection;

    that.db.exists(function (err, exists) {
      if (!exists) {
        that.db.create(function () {
          that.db.query({ method: 'PUT', path: '_revs_limit', body: 5 }, function (){});
        });
      } else {
        that.db.query({ method: 'PUT', path: '_revs_limit', body: 5 }, function (){});
      }
    });

    this._compact = setInterval(this.compact, 300000);
    this._reap = setInterval(this.reap, 86400000);
  };

  CouchStore.prototype.__proto__ = connect.session.Store.prototype;

  /**
   * Attempt to fetch session by the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */
  CouchStore.prototype.get = function (sid, fn) {
    app.m.Session.get(sid, function (err, session) {
      if (err) {
        if (err.status == 404) err.code = 'ENOENT';
        return fn && fn(err);
      } else {
        var expires = 'string' == typeof session.data.cookie.expires
          ? new Date(session.data.cookie.expires) : session.data.cookie.expires;

        if (!session || !expires || new Date > expires) {
          return fn && fn(null, null);
        } else {
          return fn(null, session.data);
        }
      }
    });
  };

  /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   * @api public
   */
  CouchStore.prototype.set = function (sid, sess, fn) {
    fn = fn || function () {};

    app.m.Session.get(sid, function (err, session) {
      if (err) {
        session = app.m.Session.new({ id: sid, data: sess});
      } else {
        session.data = sess;
      }
      session.save(fn);
    });
  };

  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */
  CouchStore.prototype.destroy = function (sid, fn) {
    app.m.Session.destroy(sid, function (err, res) {
      if (err) return fn && fn(err);
      else fn();
    });
  };

  CouchStore.prototype.clear = function (fn) {
    var that = this;
    that.db.destroy(function (err) {
      if (err) return fn && fn(err);
      that.db.create(fn);
    });
  };

  CouchStore.prototype.length = function (fn) {
    app.m.Session.expires({ startkey: (new Date()).toISOString() }, function (err, res) {
      if (err) fn && fn(err);
      else fn && fn(null, res.length);
    });
  };

  CouchStore.prototype.compact = function () {
    this.db.query({ method: 'POST', path: '_compact', body: {} }, function (err) {
      if (err) console.log('Failed to compact -- ' + err);
    });
  };

  CouchStore.prototype.reap = function () {
    app.m.Session.expires({ endkey: (new Date()).toISOString() }, function (err, res) {
      if (err) console.log('Failed to reap (view) -- ' + err);
      resourceful.async.forEachSeries(res.map(function (r) {
        return r.id.split('/').slice(1).join('/');
      }), function (id, cb) {
        app.m.Session.destroy(id, cb);
      }, function (err) {
        if (err) console.log('Failed to reap -- ' + err);
      });
    });
  };

  app.session.store = new CouchStore(app.config.get('session:store'));
};
