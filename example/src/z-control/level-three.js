module.exports = Three;

var Level = require('./level');
var render = require('hyperglue2');
var inherits = require('inherits');

inherits(Three, Level);

Three.zIndex = 3;

function Three() {
  this.el = render(require('./level.html'), {
    h3: 'level 3',
    a: [{
      _attr: { href: window.location.pathname.replace(/\/[^\/]*$/, '') },
      _text: 'back',
    }]
  });
}
