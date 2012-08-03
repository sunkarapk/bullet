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
        emit(doc._id, doc);
      }
    }
  });

  this.before('save', function (obj) {
    obj.id = obj.title;
    return true;
  });
};
