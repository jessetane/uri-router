var router = require('../../../');
var render = require('hyperglue2');
var inherits = require('inherits');
var template = require('./index.html');
var templateview = require('./transition.html');
var model = require('./model');

module.exports = TransitionsView;

function TransitionsView() {
  this.el = render(template);
  this.router = router({
    watch: 'pathname',
    outlet: this.el.querySelector('.outlet'),
    routes: {
      '/transitions/.*': Transition,
    }
  });

  this.deselect = deselect.bind(this);
  document.addEventListener('click', this.deselect);
};

TransitionsView.prototype.hide = function() {
  this.router.destroy();
  document.removeEventListener('click', this.deselect);
};

function deselect(evt) {
  if (evt.target.nodeName !== 'A') {
    router.push('/transitions');
  }
}

function Transition() {
  var id = window.location.pathname.replace(/.*\//, '');
  var m = model[id];
  this.el = render(templateview, {
    _attr: { style: 'background:' + m.color + ';' },
    h3: m.title,
  });
}

Transition.prototype.show = function() {
  var self = this;
  window.getComputedStyle(self.el).opacity; // need to do this or the transition doesn't get applied
  self.el.style.opacity = '1';
};

Transition.prototype.hide = function(r, cb) {  // if hide() accepts a callback the router will wait before removing the element
  var self = this;
  this.el.style.opacity = '0';
  this.el.addEventListener('transitionend', cb);
};
