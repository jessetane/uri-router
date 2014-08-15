var router = require('../../');
var render = require('hyperglue2');
var inherits = require('inherits');
var template = require('../templates/stacking.html');
var templateview = require('../templates/stacking-view.html');

module.exports = Stacks;

function Stacks() {
  this.el = render(template);
};

Stacks.prototype.show = function(r) {
  if (this.router) return;

  this.router = router({
    root: r.route,
    watch: 'pathname',
    outlet: this.el.querySelector('.levels'),
    stack: true,
    routes: {
      '': One,
      '/two': Two,
      '/two/three': Three,
    }
  });
};

Stacks.prototype.destroy = function() {
  this.router.destroy();
};

// superclass that disables pointer events / opacity when not hidden
function Level() {}

Level.prototype.show = function() {
  this.el.style.pointerEvents = '';
  this.el.style.opacity = '';
};

Level.prototype.hide = function() {
  this.el.style.pointerEvents = 'none';
  this.el.style.opacity = '0.35';
};

function One() {
  this.el = render(templateview, {
    h3: 'level 1',
    a: [{
      _attr: { href: pathname().current + '/two' },
      _text: 'forward',
    }]
  });
}
inherits(One, Level);

function Two() {
  this.el = render(templateview, {
    h3: 'level 2',
    a: [{
      _attr: { href: pathname().prev },
      _text: 'back',
    }, {
      _attr: { href: pathname().current + '/three' },
      _text: 'forward',
    }]
  });
}
Two.zIndex = 2;  // indicate preferred stacking order to support deep linking to somewhere in the middle of the stack
inherits(Two, Level);

function Three() {
  this.el = render(templateview, {
    h3: 'level 3',
    a: [{
      _attr: { href: pathname().prev },
      _text: 'back',
    }]
  });
}
Three.zIndex = 3;
inherits(Three, Level);

function pathname() {
  return {
    current: window.location.pathname,
    prev: window.location.pathname.replace(/\/[^\/]*$/, ''),
  };
}
