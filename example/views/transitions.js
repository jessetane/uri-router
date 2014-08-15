var router = require('../../');
var render = require('hyperglue2');
var inherits = require('inherits');
var template = require('../templates/transitions.html');
var templateview = require('../templates/transitions-view.html');

module.exports = TransitionsView;

function TransitionsView() {
  this.el = render(template);
  this.router = router({
    watch: 'pathname',
    outlet: this.el.querySelector('.outlet'),
    routes: {
      '/transitions/red': Red,
      '/transitions/green': Green,
      '/transitions/blue': Blue,
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

function Transition() {}

Transition.prototype.show = function() {
  var self = this;
  window.getComputedStyle(self.el).opacity; // need to do this in nextTick otherwise the transition won't be applied
  self.el.style.opacity = '1';
};

Transition.prototype.hide = function(cb) {  // if hide() accepts a callback the router will wait before removing the element
  var self = this;
  this.el.style.opacity = '0';
  this.el.addEventListener('transitionend', cb);
};

function Red() {
  this.el = render(templateview, {
    _attr: { style: 'background:#FAA;' }, 
    h3: 'red',
  });
}
inherits(Red, Transition);

function Green() {
  this.el = render(templateview, {
    _attr: { style: 'background:#AFA;' }, 
    h3: 'green',
  });
}
inherits(Green, Transition);

function Blue() {
  this.el = render(templateview, {
    _attr: { style: 'background:#AAF;' }, 
    h3: 'blue',
  });
}
inherits(Blue, Transition);
