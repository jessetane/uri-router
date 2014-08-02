var render = require('hyperglue2');

module.exports = NotFound;

function NotFound() {
  this.el = render('<div>\
                      <h1>404</h1>\
                      <p></p>\
                    </div>');
};

NotFound.prototype.show = function() {
  render(this.el, { p: window.location.href + ' was not found' });
};
