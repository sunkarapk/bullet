var utile = require('utile');

module.exports = function (app) {

  var form = function (model, mName) {
    var id = function (key) {
      return '"' + mName + '_' + key + '"';
    };

    var name = function (key) {
      return '"' + mName + '[' + key + ']"';
    };

    var layout = function (key, err, inp) {
      var ret = '';
      ret+= '<div class="control-group' + (err?' error':'') + '">';
      ret+= '<label class="control-label" for=' + id(key) + '>';
      ret+= utile.inflect.titleize(key) + '</label><div class="controls">';
      ret+= inp + (err?'<span class="help-inline">' + err + '</span>':'');
      ret+= '</div></div>';
      return ret;
    };

    return {
      text: function (key, err) {
        return layout(key, err, '<input type="text" class="input-xlarge" id=' + id(key) + ' name=' + name(key) + ' value="' + (model[key]?model[key]:'') + '"/>');
      },
      textarea: function (key, err) {
        return layout(key, err, '<textarea class="input-xxlarge" rows="10" id=' + id(key) + ' name=' + name(key) + '>' + (model[key]?model[key]:'') + '</textarea>');
      },
      select: function (key, err, vals, names) {
        var opt = '';
        names = names || vals;
        for(i=0;i<vals.length;i++) {
          var s = ((model[key] && model[key]==vals[i])?'" selected="selected"':'"');
          opt+= '<option value="' + vals[i] + s + '>' + names[i] + '</option>';
        };
        return layout(key, err, '<select class="input-xlarge" id=' + id(key) + 'name=' + name(key) + '>' + opt + '</select>');
      },
      checkbox: function (key, err, vals, names, inline) {
        var opt = '';
        inline = (inline?' inline':'');
        names = names || vals;
        for(i=0;i<vals.length;i++) {
          var c = ((model[key] && model[key]==vals[i])?'" checked="checked"':'"');
          opt+= '<label class="checkbox' + inline + '"><input type="checkbox" name=' + name(key) + ' value="' + vals[i] + c + '/>' + names[i] + '</label>';
        }
        return opt;
      },
      radio: function (key, err, vals, names, inline) {
        var opt = '';
        inline = (inline?' inline':'');
        names = names || vals;
        for(i=0;i<vals.length;i++) {
          var c = ((model[key] && model[key]==vals[i])?'" checked="checked"':'"');
          opt+= '<label class="radio' + inline + '"><input type="radio" name=' + name(key) + ' value="' + vals[i] + c + '/>' + names[i] + '</label>';
        }
        return opt;
      },
    };
  };

  app.locals.use(function (req, res) {
    res.locals.r = app.r;
    res.locals.form = form;
  });
};
