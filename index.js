var qs = require('querystring');
var url = require('url');
var xtend = require('xtend/mutable');
var clickjack = require('./lib/clickjack');
var bestmatch = require('./lib/bestmatch');

var lasthref = null;
var historyPosition = window.history.length; // for telling the difference between back / forward buttons
var routers = [];
var queue = [];
var lock = false;

// hijack link clicks and form submissions
clickjack(window, 'a', 'click', onclick);
clickjack(window, 'form', 'submit', onclick);

// handle back / forward buttons
window.addEventListener('popstate', onpopstate);

// replace initial state
window.history.replaceState(historyPosition, null, window.location.href);

module.exports = Router;

Router.push = function(location, replace, stack) {
  push(location, replace, stack);
};

Router.pop = function() {
  window.history.back();
};

Router.search = function(params, replace) {
  var search = qs.parse(window.location.search.slice(1));
  xtend(search, params);
  for (var i in search) {
    if (!search[i]) {
      delete search[i];
    }
  }
  search = qs.stringify(search);
  search = search ? '?' + search : '';
  push(window.location.pathname + search + window.location.hash, replace);
};

function Router(props) {
  if (!(this instanceof Router))
    return new Router(props);

  this.root = '';
  this.views = [];
  xtend(this, props);

  routers.push(this);
  update.call(this, mklocation());
}

Object.defineProperty(Router.prototype, 'outlet', {
  get: function() {
    return this._outlet;
  },
  set: function(outlet) {
    this._outlet = typeof outlet === 'string' ? document.querySelector(outlet) : outlet;
  }
});

Router.prototype.push = function(locationComponent, replace, stack) {
  var locationString = mklocationString(this.watch, locationComponent, this.root);
  push(locationString, replace, false, stack);
};

Router.prototype.pop = function(replace) {
  var locationComponent = '';
  var root = this.root;
  if (this.views.length > 1) {
    var next = this.views.slice(-2)[0];
    locationComponent = next.location[this.watch];
    root = '';
  }
  var locationString = mklocationString(this.watch, locationComponent, root);
  push(locationString, replace, true);
};

Router.prototype.destroy = function() {
  var self = this;
  this.destroyed = true;
  while (this.views.length) {
    var v = this.views.pop();
    v.view.hide && v.view.hide();
  }
  routers = routers.filter(function(r) { return r !== self });
};

function push(location, replace, back, stack) {
  location = mklocation(location);
  if (location.href === lasthref) return;

  if (replace) {
    window.history.replaceState(historyPosition, null, location.href);
  }
  else {
    window.history.pushState(++historyPosition, null, location.href);
  }

  updateAll(location, back, stack);
  lasthref = location.href;
}

function update(location, back, stack) {
  if (lock) return queue.push(update.bind(this, location, back, stack));
  else lock = true;

  var route = location[this.watch];
  var last = this.last = this.views.slice(-1)[0];
  var next = null;

  // respect root
  if (this.root) {
    route = route.replace(new RegExp('^' + this.root), '');
  }

  // expose direction for views
  this.back = back;

  // window.location should match by now, but we make this property
  // accessible for conveniently accessing a parsed querystring object
  this.location = location;

  var match = bestmatch(route, this.routes);

  // nested routers may want to access this on their parent to determine a suitable `root` value
  this.route = match.match;

  if (last) {

    if (this.route === this.lastroute) {
      last.view.show && last.view.show(this);
      return unlock();
    }

    if (stack) {
      last.stacked = true;
    }

    // respect ordering
    if (this.stack && match.value) {
      back = this.back = (last.zIndex || 0) > (match.value.zIndex || 0);
    }

    var hide = last.view.hide && last.view.hide.bind(last.view);
    if (this._outlet) {
      if ((!this.stack && !last.stacked) || back) {
        var el = last.view instanceof HTMLElement ? last.view : last.view.el;
        if (hide && hide.length) {  // hide.length check to determine if hide accepts a callback
          hide(removeElement.bind(null, el));
        }
        else {
          hide && hide();
          removeElement(el);
        }
        hide = null;
      }
    }
    
    hide && hide();

    if ((!this.stack && !last.stacked) || back) {
      this.views.pop();
      last.view.destroy && last.view.destroy();
    }
  }

  if (back) {
    next = this.views.slice(-1)[0];
    if (next) {
      this.lastroute = this.route;
      update.apply(this, arguments);
      return unlock();
    }
  }

  if (!next) {
    next = match.value || this.notFound;
    if (next) {
      next = {
        view: typeof next === 'string' ? document.createElement(next) : new next(),
        zIndex: next.zIndex,
        location: location,
      };
      this.lastroute = this.route;
      this.views.push(next);
    }
    else if (route) {
      return unlock();
    }
  }

  if (next) {
    if (this._outlet) {
      var el = next.view instanceof HTMLElement ? next.view : next.view.el;
      if (el && !el.parentNode) {
        if (back) {
          this._outlet.insertBefore(el, this._outlet.firstChild);
        }
        else {
          this._outlet.appendChild(el);
        }
      }
    }
  }

  next && next.view.show && next.view.show(this);
  unlock();
}

function updateAll(location, back, stack) {
  var r = routers.slice();
  for (var i in r) {
    var router = r[i];
    if (router && !router.destroyed) {
      update.call(router, location, back, stack);
    }
  }
}

function onpopstate(evt) {
  var back = true;
  var location = mklocation();

  if (historyPosition < evt.state) {
    back = false;
  }

  if (!isNaN(evt.state)) {
    historyPosition = evt.state;
  }

  updateAll(location, back);
  lasthref = location.href;
}

function onclick(evt, target) {
  var location = target;
  if (evt.target.nodeName === 'FORM') {
    if (!evt.target.action) return;
    location = evt.target.action;
  }
  if (location.host !== window.location.host) return;
  evt.preventDefault();
  push(mklocation(location));
}

function mklocation(location) {
  if (!location) location = window.location;
  if (typeof location === 'object') location = (location.protocol || window.location.protocol) + '//' + 
                                               (location.host || window.location.host) + 
                                               (location.pathname || '') + 
                                               (location.search || '') + 
                                               (location.hash || '');
  location = url.parse(location, true);
  location.hash = location.hash || '';      // annoying, shouldn't these come back empty strings instead of null?
  location.search = location.search || '';
  location.query = location.query || {};
  return location;
}

function mklocationString(componentName, componentValue, root) {
  var components = [ 'pathname', 'search', 'hash' ];
  var locationString = '';
  for (var i in components) {
    var component = components[i];
    locationString += component === componentName ? root + componentValue : window.location[component];
  }
  return locationString;
}

function removeElement(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

function unlock() {
  lock = false;
  if (queue.length) queue.shift()();
}
