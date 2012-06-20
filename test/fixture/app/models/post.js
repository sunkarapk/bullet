module.exports = function () {

  this.string('name', { required: true });

  this.string('title', {
    required: true,
    minLength: 5
  });

  this.string('content');

  this.timestamps();

  this.filter('all', { include_docs: true }, {
    map: function (doc) {
      if (doc.resource === 'Post') {
        emit(doc._id, { _id: doc._id });
      }
    }
  });

  this.before('save', function (obj) {
    obj._id = obj.title;
    return true;
  });
};
