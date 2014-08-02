var router = require('../../');
var render = require('hyperglue2');

var user = null;

module.exports = Redirecting;

function Redirecting() {
  this.el = render('<div>\
                      <h1>redirecting</h1>\
                      <p>using programmatic navigation to achieve redirect-like functionality</p>\
                      <form action="/redirecting/protected">\
                        <button class="show-protected" type="submit">show protected area</button>\
                      </form>\
                      <div class="outlet"></div>\
                    </div>');
};

Redirecting.prototype.show = function(r) {
  render(this.el, { '.show-protected': { _attr: { disabled: window.location.pathname === r.route ? null : 'disabled' }}});

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
  this.el = render('<div>\
                      <h2>protected area</h2>\
                      <p></p>\
                      <form>\
                        <button type="submit">sign out</button>\
                      </form>\
                    </div>');

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
  this.el = render('<div>\
                      <h2>sign in</h2>\
                      <p>please sign in to see the protected area</p>\
                      <form>\
                        <input placeholder="name">\
                        <button type="submit">sign in</button>\
                      </form>\
                    </div>');

  this.el.addEventListener('submit', function(evt) {
    user = evt.target.elements[0].value;
    self.router.pop(true);
  });
}

Signin.prototype.show = function(router) {
  this.router = router;
};
