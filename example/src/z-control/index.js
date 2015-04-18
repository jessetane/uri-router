module.exports = ZControl;

var router = require('../../../');
var render = require('hyperglue2');
var inherits = require('inherits');

function ZControl() {
  this.el = render(require('./index.html'));
};

ZControl.prototype.show = function(r) {
  if (this.router) return;

  this.router = router({
    root: r.route,
    watch: 'pathname',
    outlet: this.el.querySelector('.levels'),
    routes: {
      '': require('./level-one'),
      '/two': require('./level-two'),
      '/two/three': require('./level-three'),
    }
  });
};

ZControl.prototype.destroy = function() {
  this.router.destroy();
};