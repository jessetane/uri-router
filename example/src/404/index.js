var render = require('hyperglue2');

module.exports = NotFound;

function NotFound() {
  this.el = render(require('./index.html'));
};

NotFound.prototype.show = function() {
  render(this.el, { p: window.location.href + ' was not found' });
};
