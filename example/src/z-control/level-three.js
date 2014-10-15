var Level = require('./level');
var render = require('hyperglue2');
var inherits = require('inherits');

module.exports = Three;

function Three() {
  this.el = render(require('./level.html'), {
    h3: 'level 3',
    a: [{
      _attr: { href: window.location.pathname.replace(/\/[^\/]*$/, '') },
      _text: 'back',
    }]
  });
}
Three.zIndex = 3;
inherits(Three, Level);