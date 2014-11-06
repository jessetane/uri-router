var qs = require('querystring');
var url = require('url');
var xtend = require('xtend/mutable');
var clickjack = require('./lib/clickjack');
var firstmatch = require('./lib/firstmatch');

var init = true;
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

  if (init && routers.length === 1) {
    setTimeout(function() {
      init = false;
    });
  }
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
    hideview.call(this, v);
  }
  routers = routers.filter(function(r) { return r !== self });
};

function push(location, replace, back, stack) {
  if (lock) return queue.push(push.bind(null, location, replace, back, stack));
  else lock = true;

  location = mklocation(location);
  if (location.href === lasthref) return unlock();

  if (replace) {
    window.history.replaceState(historyPosition, null, location.href);
  }
  else {
    window.history.pushState(++historyPosition, null, location.href);
  }

  updateAll(location, back, stack);
  lasthref = location.href;
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

function update(location, back, stack) {
  if (lock) return queue.push(update.bind(this, location, back, stack));
  else lock = true;

  // if destroyed, do not continue
  if (this.destroyed) return unlock();

  // for distiguishing between the very first popstate and and any others, useful for custom init behaviors
  this.init = init;

  // window.location should match by now, but we make this property
  // accessible for conveniently accessing a parsed querystring object
  this.location = location;

  // get route but respect root if there is one
  var route = location[this.watch];
  if (this.root) {
    route = route.replace(new RegExp('^' + this.root), '');
  }

  // try to match the route
  var match = firstmatch(route, this.routes);

  // this is the "true" route - it should be the same as the actual route, but with any regex capture groups removed
  // nested routers can access this on their parent to determine a suitable `root` value
  this.route = match.match;

  // look for a matching next route in the existing views
  var next = null;
  for (var i=0; i<this.views.length; i++) {
    var view = this.views[i];
    if (view.route === this.route) {
      this.back = back = true;
      next = view;
      break;
    }
  }

  // if we found the next view in the stack hide 
  // everything after it, show it, and be done
  if (next) {
    for (var n=this.views.length-1; n>i; n--) {
      hideview.call(this, this.views[n], true);
    }
    next.view.show && next.view.show(this);
    return unlock();
  }

  // if this.stack is a string, use it to split the route up into chunks
  if (this.stack && this.stack !== true) {
    var base = route.slice(0, 1);
    var debasedroute = route.slice(1);
    var parts = (debasedroute ? this.stack + debasedroute : '').split(this.stack);
    var stackedroutes = parts.slice(0, -1);

    // first remove any excess views from the stack
    while (this.views.length > stackedroutes.length) {
      hideview.call(this, this.views.slice(-1)[0], true);
    }

    // if there are missing views from the stack, fill them in before updating the current route
    if (parts.length > 1 && this.views.length < (parts.length - 1)) {
      for (var i=0; i<stackedroutes.length; i++) {
        var depth = stackedroutes.length - i;
        var pre = this.views.slice(-depth)[0];
        if (!pre) {
          var preroute = stackedroutes.slice(0, i+1).join(this.stack);
          var prelocation = {};
          prelocation[this.watch] = preroute;
          update.call(this, mklocation(prelocation), back, stack);
        }
      }
      update.call(this, location, back, stack);
      return unlock();
    }
  }

  // hide the last view if there is one
  var last = this.views.slice(-1)[0];
  if (last) {

    // respect zIndex
    if (this.stack && match.value) {
      back = this.back = (last.zIndex || 0) > (match.value.zIndex || 0);
    }

    hideview.call(this, last, back, this.stack || stack);
  }

  // match route with a view constructor
  next = match.value || this.notFound;
  if (next) {

    // create and store the view meta object
    next = {
      view: typeof next === 'string' ? document.createElement(next) : new next(),
      location: location,
      zIndex: next.zIndex,
      route: this.route,
    };
    this.views.push(next);

    // put things on the dom
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

    next.view.show && next.view.show(this);
  }
  
  unlock();
}

function hideview(meta, back, stacked) {
  var el = meta.view instanceof HTMLElement ? meta.view : meta.view.el;
  if (back || !stacked) {
    if (meta.view.hide) {
      if (meta.view.hide.length) {
        meta.view.hide(removeElement.bind(null, el));
      }
      else {
        meta.view.hide();
        removeElement(el);
      }
    }
    else {
      removeElement(el);
    }

    this.views.pop();
    meta.view.destroy && meta.view.destroy();
  }
  else {
    if (meta.view.hide) {
      if (meta.view.hide.length) {
        meta.view.hide(function() {});
      }
      else {
        meta.view.hide();
      }
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
    if (!evt.target.action) {
      evt.preventDefault();
      return;
    }
    location = evt.target.action;
  }
  location = mklocation(location);
  if (location.host !== window.location.host) return;
  evt.preventDefault();
  push(location);
}

function mklocation(location) {
  if (!location && typeof location !== 'string') location = window.location;
  if (typeof location === 'object') location = (location.protocol || window.location.protocol) + '//' + 
                                               (location.host || window.location.host) + 
                                               (location.pathname || '') + 
                                               (location.search || '') + 
                                               (location.hash || '');
  location = url.parse(location, true);
  location.pathname = location.pathname || '';  // annoying, shouldn't these come back empty strings instead of null?
  location.hash = location.hash || '';      
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
