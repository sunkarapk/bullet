module.exports = function () {

  this.string('name', {
    required: true,
    minLength: 5
  });

  this.string('title', {
    required: true,
    minLength: 5
  });

  this.string('content');

  this.timestamps();

  this.filter('all', {
    map: function (doc) {
      if (doc.resource === 'Post') {
        var x = doc._id;
        doc._id = doc._id.split('/').slice(1).join('/');
        emit(x, doc);
      }
    }
  });

  this.before('save', function (obj) {
    obj.id = obj.title;
    return true;
  });
};
