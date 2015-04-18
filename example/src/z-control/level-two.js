module.exports = Two;

var Level = require('./level');
var render = require('hyperglue2');
var inherits = require('inherits');

inherits(Two, Level);

Two.zIndex = 2;  // indicate preferred stacking order to support deep linking to somewhere in the middle of the stack

function Two() {
  this.el = render(require('./level.html'), {
    h3: 'level 2',
    a: [{
      _attr: { href: window.location.pathname.replace(/\/[^\/]*$/, '') },
      _text: 'back',
    }, {
      _attr: { href: window.location.pathname + '/three' },
      _text: 'forward',
    }]
  });
}
