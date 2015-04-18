module.exports = One;

var Level = require('./level');
var render = require('hyperglue2');
var inherits = require('inherits');

inherits(One, Level);

function One() {
  this.el = render(require('./level.html'), {
    h3: 'level 1',
    a: [{
      _attr: { href: window.location.pathname + '/two' },
      _text: 'forward',
    }]
  });
}
