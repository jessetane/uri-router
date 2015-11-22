module.exports = Router

Router.push = push
Router.replace = replace
Router.pop = pop
Router.search = search

var hijack = require('./lib/hijack')
var matchroute = require('./lib/match-route')
var qs = require('querystring')

var state = 0
var locked = false
var updateNeeded = false
var routers = []
var queue = []
var uris = []
var uriParser = document.createElement('A')
var lastUri = Uri(window.location)
lastUri.init = true

// hijack link clicks and form submissions
hijack(window, 'a', 'click', onclick)
hijack(window, 'form', 'submit', onclick)

// handle back / forward buttons
window.addEventListener('popstate', onpopstate)

// replace initial state
window.history.replaceState(
  state,
  null,
  window.location.href
)

function Uri (uri) {
  if (typeof uri === 'string') {
    uriParser.href = uri.href || uri
    uri = uriParser
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
    // non-standard, see readme
    init: uri.init,
    back: uri.back,
    replace: uri.replace,
    base: uri.base,
    query: uri.query,
    params: uri.params
  }
  if (!uri.query) {
    uri.query = qs.parse(uri.search.slice(1))
  }
  return uri
}

function onpopstate (evt) {
  var uri = Uri(window.location)
  uri.popstate = evt.state
  if (uri.popstate < state) {
    uris.unshift(uri)
    locked = false
    onchange()
  } else {
    uris.push(uri)
    onchange()
  }
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

function replace (uri) {
  push(uri, true)
}

function pop () {
  uris.push({
    actionRequired: 'back'
  })
  onchange()
}

function search (query, replace) {
  uris.push({
    actionRequired: 'search',
    query: query,
    replace: replace
  })
  onchange()
}

function Router (opts) {
  var router = opts
  router.base = opts.base || ''
  router.destroy = destroy
  queue.push(router)
  if (updateNeeded !== false || locked) return router
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
  router.destroyed = true
  routers = routers.filter(function (r) {
    return r !== router
  })
  if (router.current) {
    hide(router.current, router.outlet, lastUri)
  }
}

function onchange () {
  if (locked) return
  if (!uris.length) return
  locked = true
  if (updateNeeded !== false) {
    clearTimeout(updateNeeded)
    updateNeeded = false
    serviceQueue()
  }
  var uri = uris.shift()
  if (uri.actionRequired === 'back') {
    window.history.back()
    return
  } else if (uri.actionRequired === 'search') {
    var tmp = {}
    for (var key in lastUri.query) {
      tmp[key] = lastUri.query[key]
    }
    for (key in uri.query) {
      var value = uri.query[key]
      if (!value) delete tmp[key]
      else tmp[key] = value
    }
    tmp = Uri('?' + qs.stringify(tmp))
    tmp.replace = uri.replace
    uri = tmp
  }
  if (lastUri.href === uri.href) {
    locked = false
    onchange()
    return
  }
  lastUri = uri
  if (uri.popstate !== undefined) {
    uri.back = uri.popstate < state
    state = uri.popstate
  } else {
    if (uri.replace) {
      window.history.replaceState(state, null, uri.href)
    } else {
      window.history.pushState(++state, null, uri.href)
    }
  }
  uri.init = state === 0
  routers.forEach(function (router) {
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

function update (router, routes, uri, middlewareDidRun) {
  if (router.destroyed) return
  var watched = uri[router.watch]
  if (router.base && !middlewareDidRun) {
    watched = watched.slice(router.base.length)
  }
  var match = matchroute(watched, routes)
  var constructor = match && match.handler
  uri = middlewareDidRun ? uri : Uri(uri)
  uri[router.watch] = watched
  if (match) {
    uri.base = router.base + match.base
    uri.params = match.params
  }
  var last = router.current
  if (last) {
    if (last._constructor === constructor && constructor.reusable) {
      if (last.show) last.show(uri)
      return
    }
  }
  if (!constructor) {
    if (last) {
      delete router.current
      hide(last, router.outlet, uri)
    }
    return
  }
  var next = constructor(uri, function () {
    routes = routes.filter(function (route) {
      return route[1] !== constructor
    })
    update(router, routes, uri, true)
  })
  if (next) {
    next._constructor = constructor
    router.current = next
    if (router.outlet) {
      if (last && uri.back) {
        router.outlet.insertBefore(next, last)
      } else {
        router.outlet.appendChild(next)
      }
    }
    if (last) hide(last, router.outlet, uri)
    if (next.show) next.show(uri)
  }
}

function hide (el, outlet, uri) {
  if (el.hide) {
    if (el.hide.length > 1) {
      el.hide(uri, function () {
        outlet && outlet.removeChild(el)
      })
    } else {
      el.hide(uri)
      outlet && outlet.removeChild(el)
    }
  } else {
    outlet && outlet.removeChild(el)
  }
}
