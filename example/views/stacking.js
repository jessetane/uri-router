var router = require('../../');
var render = require('hyperglue2');
var inherits = require('inherits');

module.exports = Stacks;

function Stacks() {
  this.el = render('<div>\
                      <h1>stacks</h1>\
                      <p>you can stack views ala iOS\'s navigation controller</p>\
                      <div class="levels"></div>\
                    </div>');
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
  this.el = render('<div class="stack-level">\
                      <h3>level 1</h3>\
                      <a href="' + pathname().current + '/two">forward</a>\
                    </div>');
}
inherits(One, Level);

function Two() {
  this.el = render('<div class="stack-level">\
                      <h3>level 2</h3>\
                      <a href="' + pathname().prev + '">back</a> |\
                      <a href="' + pathname().current + '/three">forward</a>\
                    </div>');
}
Two.zIndex = 2;  // indicate preferred stacking order to support deep linking to somewhere in the middle of the stack
inherits(Two, Level);

function Three() {
  this.el = render('<div class="stack-level">\
                      <h3>level 3</h3>\
                      <a href="' + pathname().prev + '">back</a>\
                    </div>');
}
Three.zIndex = 3;
inherits(Three, Level);

function pathname() {
  return {
    current: window.location.pathname,
    prev: window.location.pathname.replace(/\/[^\/]*$/, ''),
  };
}
