var render = require('hyperglue2');

module.exports = NotFound;

function NotFound() {
  this.el = render(require('../templates/404.html'));
};

NotFound.prototype.show = function() {
  render(this.el, { p: window.location.href + ' was not found' });
};
