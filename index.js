module.exports = Router

Router.push = push // window.history.pushState() does not dispatch an event, so use Router.push() instead
Router.pop = pop   // just an alias for window.history.back()
Router.replace = replace

var hijack = require('./lib/hijack')
var firstmatch = require('./lib/first-match')
var qs = require('querystring/decode')

var historyStart = window.history.length
var historyLength = historyStart
var updateNeeded = false
var locked = false
var routers = []
var queue = []
var uris = []
var lastUri = Uri(window.location)
lastUri.init = true

// hijack link clicks and form submissions
hijack(window, 'a', 'click', onclick)
hijack(window, 'form', 'submit', onclick)

// handle back / forward buttons
window.addEventListener('popstate', onpopstate)

// replace initial state
window.history.replaceState(
  historyLength,
  null,
  window.location.href
)

function Uri (uri) {
  if (typeof uri === 'string') {
    var a = document.createElement('A')
    a.href = uri.href || uri
    uri = a
  }
  uri = {
    // https://url.spec.whatwg.org/
    href: uri.href,
    origin: uri.origin,
    protocol: uri.protocol,
    hostname: uri.hostname,
    port: uri.port,
    pathname: uri.pathname,
    search: uri.search,
    hash: uri.hash,
    host: uri.host,
    // non-standard
    init: uri.init,
    back: uri.back,
    replace: uri.replace,
    base: uri.base,
    params: uri.params,
    query: uri.query
  }
  if (!uri.query && uri.search) {
    uri.query = qs(uri.search.slice(1))
  }
  return uri
}

function onpopstate (evt) {
  var uri = Uri(window.location)
  uri.popstate = evt.state
  uris.push(uri)
  onchange()
}

function onclick (evt, target) {
  var uri = target
  if (evt.target.nodeName === 'FORM') {
    if (!evt.target.action) {
      evt.preventDefault()
      return
    }
    uri = Uri(evt.target.action)
  }
  uri = Uri(uri)
  if (uri.origin !== window.location.origin) return
  evt.preventDefault()
  push(uri)
}

function push (uri, replace) {
  if (typeof uri === 'string') {
    uri = Uri(uri)
  }
  uri.replace = replace
  uris.push(uri)
  onchange()
}

function pop () {
  window.history.back()
}

function replace (uri) {
  push(uri, true)
}

function Router (opts) {
  var router = opts
  router.destroy = destroy
  queue.push(router)
  if (updateNeeded || locked) return router
  updateNeeded = setTimeout(function () {
    updateNeeded = false
    locked = true
    serviceQueue()
    locked = false
    onchange()
  })
  return router
}

function destroy () {
  var router = this
  routers = routers.filter(function (r) {
    return r !== router
  })
  if (router.current) {
    hide(router.current, lastUri)
  }
}

function onchange () {
  if (locked) return
  var uri = uris.shift()
  if (!uri) return
  if (lastUri && lastUri.href === uri.href) return
  lastUri = uri
  locked = true
  if (uri.popstate) {
    if (!isNaN(uri.popstate)) {
      uri.back = historyLength >= uri.popstate
      historyLength = uri.popstate
    }
  } else {
    if (uri.replace) {
      window.history.replaceState(historyLength, null, uri.href)
    } else {
      window.history.pushState(++historyLength, null, uri.href)
    }
  }
  uri.init = historyLength === historyStart
  routers.slice().forEach(function (router) {
    update(router, router.routes, uri)
  })
  serviceQueue()
  locked = false
  onchange()
}

function serviceQueue () {
  var q = queue.slice()
  queue = []
  while (q.length) {
    var router = q.shift()
    routers.push(router)
    update(router, router.routes, lastUri)
  }
  if (queue.length) {
    serviceQueue()
  }
}

function update (router, routes, uri, middleware) {
  var watched = uri[router.watch]
  if (router.base && !middleware) {
    if (watched.indexOf(router.base) === 0) {
      watched = watched.slice(router.base.length)
    }
  }
  var match = firstmatch(watched, routes)
  var constructor = match && match.data
  uri = middleware ? uri : Uri(uri)
  uri[router.watch] = watched
  if (match) {
    uri.base = match.id
    uri.params = match.capture
  }
  var last = router.current
  if (last) {
    if (last._constructor === constructor && constructor.reusable) {
      if (last.show) last.show(uri)
      return
    }
  }
  if (!constructor) return
  var next = constructor(uri, function () {
    routes = routes.filter(function (route) {
      return route[1] !== constructor
    })
    update(router, routes, uri, true)
  })
  if (next) {
    next._constructor = constructor
    router.current = next
    if (last && uri.back) {
      router.outlet.insertBefore(next, last)
    } else {
      router.outlet.appendChild(next)
    }
    if (last) hide(last, uri)
    if (next.show) next.show(uri)
  }
}

function hide (el, uri) {
  if (el.hide) {
    if (el.hide.length > 1) {
      el.hide(uri, function () {
        el.parentNode.removeChild(el)
      })
    } else {
      el.hide(uri)
      el.parentNode.removeChild(el)
    }
  } else {
    el.parentNode.removeChild(el)
  }
}
