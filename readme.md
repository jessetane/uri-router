# uri-router
***
a small framework for building URI driven DOM applications.

## why
some loose ideas for a better pushState router:
* push the history for _all_ URI changes unless explicitly told otherwise
* capture and prevent default link-click and form-submit behaviors
* be nestable and have an adjustable root to maximize module-pattern compatibility
* be zIndex aware to support deep linking into "stacks" of views
* optionally handle adding and removing views from the DOM automatically
* have a simple, optional callback mechanism to support transitions
* allow web-components or backbone-style classes to be used as views

1.0.0 is a first pass at exploring these ideas. As of this writing it's only been used to make the example app, so there are probably tons of bugs and inefficiencies :)

## how
index.html
``` html
<!doctype html>
<html>
  <body>
    <nav>
      <a href="/">home</a> |
      <a href="/about">about</a> |
      <a href="#signup">signup</a>
    </nav>
    <div class="page-outlet"></div>
    <div class="modal-outlet"></div>
  </body>
  <script type="text/javascript" src="/app.js"></script>
</html>
```

app.js
``` js
var router = require('uri-router');
var home = require('./home');
var about = require('./about');
var signup = require('./signup');

router({
  watch: 'pathname',
  outlet: '.page-outlet',
  routes: {
    '/': home,
    '/about': about
  }
});

router({
  watch: 'hash',
  routes: {
    '#sign-up': signup
  }
});
```

home.js (a backbone style view)
``` js
var domify = require('domify');

module.exports = function() {
  this.el = domify('<h1>home</h1>');
};
```

about.js (web component style)
``` js
var inherits = require('inherits');

module.exports = 'about-component';

function About() {}
inherits(About, HTMLElement);

About.prototype.createdCallback = function() {
  var shadow = this.createShadowRoot();
  shadow.innerHTML = '<h1>about</h1>';
};

document.registerElement(module.exports, About);
```

signup.js (for routers with no `outlet`)
``` js
var domify = require('domify');

module.exports = Signup;

function Signup() {
  this.el = domify('<h1>sign up</h1>');
}

Signup.prototype.show = function() {
  if (!this.el.parentNode) {
    document.querySelector('.modal-outlet').appendChild(this.el);
  }
};

Signup.prototype.hide = function() {
  this.el.parentNode.removeChild(this.el);
};
```
the example above is super basic, do `node example` to see fancier stuff `uri-router` can do.

## install
`git clone https://github.com/jessetane/uri-router`  

## API

### require

* ### `var Router = require('uri-router')`
returns a constructor function for creating routers. the first time `uri-router` is required, it will globally hijack all link clicks and form submissions targeting the origin domain and start listening for the `window.history.onpopstate` event.

### static methods

* ### `Router.push(location, [replace])`
update `window.location`.
  * `location` href string
  * `replace` boolean; indicates to use replaceState instead of pushState

* ### `Router.pop()`
alias of `window.history.back()`.

* ### `Router.search(params, [replace])`
update `window.location.search` without clobbering existing parameters.
> example: assuming the search string is set to `?a=1`, calling `Router.search({ b: 2 })` would change it to `?a=1&b=2`.

### instance methods

* ### `var r = new Router([opts])`
the constructor function. `opts` is a hash that gets merged with the router instance `r`. see [properties](#properties) for more details.

* ### `r.push(locationComponent, [replace, [stack]])`
a wrapper around `Router.push` that will only update `window.location[r.watch]`. 
> example: assuming `window.location.href` is "/some/path?a=b#one", and `r.watch` is "hash", `r.push('#two')` would update the href to "/some/path?a=b#two"
 
 * `locationComponent` href component string (e.g. '#some-hash')
 * `replace` boolean; use replaceState
 * `stack` boolean; do not remove current view even if the instance has an outlet

* ### `r.pop([replace])`
like pressing the back button, but only for the component of the url the instance is watching.

* ### `r.destroy()`
stop the instance from updating on the `popstate` event

### properties

* ### `r.watch`
should be set to the name of a property on `window.location`, generally "pathname" or "hash"

* ### `r.routes`
a hash like `{ 'regex': view }`. where views can either be web components or backbone-style (newable javascript class where the instance has an `el` property). 
> views can optionally define `show()` and `hide()` methods, see [delegated events](#delegated events) for more details.

* ### `r.outlet`
a DOM element. if an outlet is specified, whenever a new view in `routes` is matched, the old view will be removed and the new one appended to the outlet.

* ### `r.stack`
boolean. defaults to false. if true, it will be assumed (even if you have specified an `outlet`), that previously matched views should not be removed from the DOM unless moving backwards in history.

* ### `r.root`
prefix to ignore for `r.watch`. useful for building modular views with nested routers.

* ### `r.route`
readonly string; useful for determining what `root` to use for nested routers.

* ### `r.notFoundView`
a view to use as a fallback when no matching routes are found.

### delegated events
any time `window.location` changes, all active views should expect to receive one or more of the following (optional) hooks:

* ### `view.show(r)`
called on all active views when `window.location` changes - a handle to the router making the call is passed as the first argument.

* ### `view.hide(cb)`
called after a view becomes inactive, but just before it is removed from the DOM. if the hide implementation accepts a callback, the router will defer removal from the DOM until the callback is executed.

* ### `view.destroy()`
called when a view is no longer being referenced by a router. usually this will fire right after `hide()`, but may happen before removal from the DOM if `hide(cb)` accepted a callback.

## notes
do not use `window.history.pushState()` directly! there is no `onpushstate` event so if you do, `Router` instances won't be able see your location changes.

## license
WTFPL
