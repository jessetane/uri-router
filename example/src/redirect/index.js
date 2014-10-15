var router = require('../../../');
var render = require('hyperglue2');
var template = require('./index.html');
var templateprotected = require('./protected.html');
var templatesignin = require('./signin.html');

var user = null;

module.exports = Redirecting;

function Redirecting() {
  this.el = render(template);
};

Redirecting.prototype.show = function(r) {
  render(this.el, {
    '.show-protected': { 
      _attr: { disabled: window.location.pathname === r.route ? null : 'disabled' }
    }
  });

  if (this.router) return;

  this.router = router({
    root: r.route,
    watch: 'pathname',
    outlet: this.el.querySelector('.outlet'),
    routes: {
      '/protected': Protected,
      '/sign-in': Signin,
    }
  });
};

Redirecting.prototype.hide = function() {
  this.router.destroy();
};

function Protected() {
  var self = this;
  this.el = render(templateprotected);
  this.el.addEventListener('submit', function(evt) {
    user = null;
    self.router.pop();
  });
}

Protected.prototype.show = function(router) {
  this.router = router;
  this.el.style.display = '';
  if (!user) {
    router.push('/sign-in', true, true);  // redirect to /sign-in, replace state, and stack
  }
  else {
    render(this.el, { p: 'welcome to the protected area ' + user });
  }
};

Protected.prototype.hide = function() {
  this.el.style.display = 'none';
};

function Signin() {
  var self = this;
  this.el = render(templatesignin);
  this.el.addEventListener('submit', function(evt) {
    user = evt.target.elements[0].value;
    if (!user) return;
    self.router.pop(true);
  });
}

Signin.prototype.show = function(router) {
  this.router = router;
};
