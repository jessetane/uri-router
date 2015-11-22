# uri-router [![npm](http://img.shields.io/npm/v/uri-router.svg?style=flat-square)](http://www.npmjs.org/uri-router) [![tests](https://img.shields.io/travis/jessetane/uri-router.svg?style=flat-square&branch=master)](https://travis-ci.org/jessetane/uri-router)
A small framework for building URI driven DOM applications.

[![saucelabs](https://saucelabs.com/browser-matrix/uri-router.svg)](https://saucelabs.com/u/uri-router)

## Why
Views that require knowlege of the outside DOM aren't very flexible. uri-router lets you use self contained web components as views by taking over the responsibility of creating, attaching and removing elements from the DOM.

## How
* Optionally handles adding and removing elements from the DOM automatically.
* Captures and prevents default link-click and form-submit behaviors.
* Pushes the history for _any_ location change, hashes are not special.
* Provides an optional callback mechanism to support transitions.
* Queues recursive updates properly (window.history.back runs in next tick, but disregards succeeding pushState calls).
* Nestable!

## Example
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
    <div id="pages"></div>
    <div id="modals"></div>
  </body>
  <script type="text/javascript" src="/app.js"></script>
</html>
```

app.js
``` js
var router = require('uri-router')
var home = require('./home')
var about = require('./about')
var signup = require('./signup')

router({
  watch: 'pathname',
  outlet: document.querySelector('#pages'),
  routes: [
    ['/',       home],
    ['/about', about]
  ]
})

router({
  watch: 'hash',
  routes: [
    ['#sign-up', signup]
  ]
})
```

home.js (a plain DOM element as a view)
``` js
module.exports = function () {
  var el = document.createElement('H1')
  el.innerHTML = 'Home'
  return el
}
```

about.js (a web component as a view)
``` js
module.exports = function () {
  return document.createElement('about-component')
}

var inherits = require('inherits')

inherits(About, HTMLElement)

function About () {}

About.prototype.createdCallback = function () {
  var shadow = this.createShadowRoot()
  shadow.innerHTML = '<h1>About</h1>'
}

document.registerElement('about-component', About)
```

signup.js (a view that handles adding and removing itself from the DOM)
``` js
module.exports = Signup

function Signup () {
  var el = document.createElement('H1')
  el.innerHTML = 'Sign up'
  el.show = show
  el.hide = hide
  return el
}

function show () {
  if (!this.parentNode) {
    document.querySelector('#modals').appendChild(this)
  }
}

function hide () {
  this.parentNode.removeChild(this)
}
```

The code above is pretty basic, check out [the example app](https://github.com/jessetane/uri-router/tree/master/example) for fancier things:

``` shell
$ npm install
$ npm run example
```

## Test
``` shell
$ npm run test-local
$ SAUCE_USERNAME=x SAUCE_ACCESS_KEY=y npm run test
```

## Require

#### `var Router = require('uri-router')`
Returns a constructor function for creating routers. The first time `uri-router` is required, it will globally hijack all link clicks and form submissions targeting the origin and start listening for the `popstate` event.

## Static methods
It's critical you do not use `window.history.{pushState,replaceState,go,back}()` directly! Use the static methods listed here instead.

#### `Router.push(location, [replace])`  
Update `window.location`.
  * `location` String
  * `replace` Boolean; indicates to use replaceState instead of pushState

#### `Router.replace(location)`
Shortcut for `Router.push(location, true)`.

#### `Router.pop()`
Like `window.history.back()`.

#### `Router.search(query, [replace])`  
Update `window.location.search` without clobbering existing parameters.
> example: assuming the search string is set to `?a=1`, calling `Router.search({ b: 2 })` would change it to `?a=1&b=2`.

## Instance methods

#### `var r = Router(opts)`
The constructor function. `opts` is augmented, tracked and returned as `r`. see [properties](#properties) for more details.

#### `r.destroy()`
Hide any active views and stop the instance from updating on `{push,replace,pop}state`.

## Instance properties

#### `r.watch`
Should be set to the name of a property on `window.location`, generally "pathname" or "hash"

#### `r.routes`
An array of regex / handler pairs like: `['regex', handler]`. The handler signature is `(uri, next)`. Handlers that call `next` are treated as middleware and fall through to succeeding routes. Handlers that return a value are treated as view constructors.
> views returned by route handlers can optionally define `show()` and `hide()` methods, see [delegated events](#delegated-events) for more details.

#### `r.outlet`
An optional DOM element. If an outlet is specified, handlers that return a view will trigger the removal of any existing view and the appending of the new view. If the same handler is matched more than once in a row, and `handler.reusable === true`, the existing view will simply get a delegated `show()` event rather than being replaced.

#### `r.base`
An optional prefix to ignore for `r.watch`. Useful for building modular views with nested routers.

## Delegated events
Any time `window.location` changes, all active views should expect to receive one or more of the following (optional) hooks:

#### `view.show(uri)`
Called on all active views when `window.location` changes. See [URI](#URI) for properties available on `uri`.

#### `view.hide(uri, cb)`
Called after a view becomes inactive, but just before it is removed from the DOM. If the hide implementation accepts a callback, the router will defer removal from the DOM until the callback is executed.

## URI properties
`URI` objects are passed to route handlers and [delegated event](#delegated-events) hooks. They define most of the properties described in the `URL` [spec](https://url.spec.whatwg.org) and some `Router` specific properties described here:

#### `init`
True when `history.state` is the same as when the page initially loaded.

#### `back`
True when the browser's back button has been clicked or `Router.pop()` was called.

#### `replace`
True when `Router.replace` initiated the location change.

#### `base`
If there are any capture groups in the route regex, this will be set to the value of the first group. You can use this to set `r.base` on nested routers.

#### `params`
An array of the capture group values from the route regex, excepting the first group, which is considered the `base` - see above.

#### `query`
A parsed querystring object.

## Releases
* [1.x](https://github.com/jessetane/uri-router/releases)
  * Complete rewrite, November 2015 after a year+ of use in production.
* [0.x](https://github.com/jessetane/uri-router/releases)
  * Initial prototype, August 2015.

## License
Copyright © 2014 Jesse Tane <jesse.tane@gmail.com>

This work is free. You can redistribute it and/or modify it under the
terms of the [WTFPL](http://www.wtfpl.net/txt/copying).

No Warranty. The Software is provided "as is" without warranty of any kind, either express or implied, including without limitation any implied warranties of condition, uninterrupted use, merchantability, fitness for a particular purpose, or non-infringement.