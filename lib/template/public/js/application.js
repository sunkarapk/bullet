$(document).ready(function () {
  $('.apiDestroy').apiDestroy();
});

(function ($) {
  $.fn.extend({
    apiDestroy: function () {
      return this.each(function () {
        var href = this.href;
        this.href = '#';

        $(this).click(function () {
          if (confirm("Are you sure?")) {
            $.ajax({
              type: "DELETE",
              url: href
            }).done(function () {
              window.location.reload();
            });
          }

          return false;
        });
      });
    }
  });
})(jQuery);
