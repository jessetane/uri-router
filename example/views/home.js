var render = require('hyperglue2');

module.exports = function() {
  this.el = render(require('../templates/home.html'));
};
