var router = require('../../');
var render = require('hyperglue2');
var inherits = require('inherits');

module.exports = TransitionsView;

function TransitionsView() {
  this.el = render('<div>\
                      <h1>transitions</h1>\
                      <p>transitions</p>\
                      <ul style="display:inline-block; vertical-align:middle;">\
                        <li><a href="/transitions/red">red</a></li>\
                        <li><a href="/transitions/green">green</a></li>\
                        <li><a href="/transitions/blue">blue</a></li>\
                      </ul>\
                      <div class="outlet box"></div>\
                    </div>');

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
  setTimeout(function() {
    self.el.style.opacity = '1';  // need to do this in nextTick otherwise the transition won't be applied
  }, 100);
};

Transition.prototype.hide = function(cb) {  // if hide() accepts a callback the router will wait before removing the element
  var self = this;
  this.el.style.opacity = '0';
  this.el.addEventListener('transitionend', cb);
};

function Red() {
  this.el = render('<div class="transition-bg" style="background:#FAA;"><h3 class="center">red</h3></div>');
}
inherits(Red, Transition);

function Green() {
  this.el = render('<div class="transition-bg" style="background:#AFA;"><h3 class="center">green</h3></div>');
}
inherits(Green, Transition);

function Blue() {
  this.el = render('<div class="transition-bg" style="background:#AAF;"><h3 class="center">blue</h3></div>');
}
inherits(Blue, Transition);
