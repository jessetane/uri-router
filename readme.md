# uri-router
A small framework for building URI driven DOM applications.

* This project is under active development and as such there are no releases tagged. Use at your own risk.

## Why
Exploring ideas for a better pushState router:

* push the history for _all_ URI changes unless explicitly told otherwise
* capture and prevent default link-click and form-submit behaviors
* be nestable and have an adjustable root to maximize module-pattern compatibility
* be zIndex aware to support deep linking into "stacks" of views
* optionally handle adding and removing views from the DOM automatically
* have a simple, optional callback mechanism to support transitions
* allow web-components or backbone-style classes to be used as views

## How
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
The example above is super basic, see the example for fancier stuff `uri-router` can do.

## Example
``` bash
git clone https://github.com/jessetane/uri-router
cd uri-router
npm install
npm run example
```

## Require

#### `var Router = require('uri-router')`
returns a constructor function for creating routers. the first time `uri-router` is required, it will globally hijack all link clicks and form submissions targeting the origin domain and start listening for the `window.history.onpopstate` event.

## Static methods

#### `Router.push(location, [replace])`  
Update `window.location`.
  * `location` href string
  * `replace` boolean; indicates to use replaceState instead of pushState

#### `Router.pop()`
Alias of `window.history.back()`.

#### `Router.search(params, [replace])`  
Update `window.location.search` without clobbering existing parameters.
> example: assuming the search string is set to `?a=1`, calling `Router.search({ b: 2 })` would change it to `?a=1&b=2`.

## Instance methods

#### `var r = new Router([opts])`
The constructor function. `opts` is a hash that gets merged with the router instance `r`. see [properties](#properties) for more details.

#### `r.push(locationComponent, [replace, [stack]])`
A wrapper around `Router.push` that will only update `window.location[r.watch]`.
  
  * `locationComponent` href component string (e.g. '#some-hash')
  * `replace` boolean; use replaceState
  * `stack` boolean; do not remove current view even if the instance has an outlet

> Example: assuming `window.location.href` is "/some/path?a=b#one", and `r.watch` is "hash", `r.push('#two')` would update the href to "/some/path?a=b#two"

#### `r.pop([replace])`
Like pressing the back button, but only for the component of the url the instance is watching.

#### `r.destroy()`
Stop the instance from updating on the `popstate` event

## Instance properties

#### `r.watch`
Should be set to the name of a property on `window.location`, generally "pathname" or "hash"

#### `r.routes`
A hash like `{ 'regex': view }`. Where views can either be web components or backbone-style (newable javascript class where the instance has an `el` property). 
> Views can optionally define `show()` and `hide()` methods, see [delegated events](#delegated-events) for more details.

#### `r.outlet`
A DOM element. if an outlet is specified, whenever a new view in `routes` is matched, the old view will be removed and the new one appended to the outlet.

#### `r.stack`
Boolean. Defaults to false. If true, it will be assumed (even if you have specified an `outlet`), that previously matched views should not be removed from the DOM unless moving backwards in history.

#### `r.root`
Prefix to ignore for `r.watch`. Useful for building modular views with nested routers.

#### `r.route`
Readonly string; useful for determining what `root` to use for nested routers.

#### `r.notFoundView`
A view to use as a fallback when no matching routes are found.

## Delegated events
Any time `window.location` changes, all active views should expect to receive one or more of the following (optional) hooks:

#### `view.show(r)`
Called on all active views when `window.location` changes - a handle to the router making the call is passed as the first argument.

#### `view.hide(cb)`
Called after a view becomes inactive, but just before it is removed from the DOM. If the hide implementation accepts a callback, the router will defer removal from the DOM until the callback is executed.

#### `view.destroy()`
Called when a view is no longer being referenced by a router. Usually this will fire right after `hide()`, but may happen before removal from the DOM if `hide(cb)` accepted a callback.

## Notes
Do not use `window.history.pushState()` directly! There is no `onpushstate` event so if you do, `Router` instances won't be able see your location changes.

## Releases
None yet - still in a prototype / experimental state.

## License
Copyright © 2014 Jesse Tane <jesse.tane@gmail.com>

This work is free. You can redistribute it and/or modify it under the
terms of the [WTFPL](http://www.wtfpl.net/txt/copying).

No Warranty. The Software is provided "as is" without warranty of any kind, either express or implied, including without limitation any implied warranties of condition, uninterrupted use, merchantability, fitness for a particular purpose, or non-infringement.