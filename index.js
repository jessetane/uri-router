module.exports = Router

Router.push = push
Router.replace = replace
Router.pop = pop
Router.search = search
Router.uri = null

var hijack = require('./lib/hijack')
var matchroute = require('./lib/match-route')
var URI = require('./lib/uri')

var state = 0
var locked = false
var updateNeeded = false
var routers = []
var queue = []
var uris = []
var lastUri = Router.uri = URI(window.location)
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

function onpopstate (evt) {
  var uri = URI(window.location)
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
    uri = URI(evt.target.action)
  }
  uri = URI(uri)
  if (uri.origin !== window.location.origin) return
  evt.preventDefault()
  push(uri)
}

function push (uri, replace) {
  if (typeof uri === 'string') {
    uri = URI(uri)
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
    tmp = URI('?' + URI.encodeQuerystring(tmp))
    tmp.replace = uri.replace
    uri = tmp
  }
  if (lastUri.href === uri.href) {
    locked = false
    onchange()
    return
  }
  Router.uri = lastUri = uri
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
  var handler = match && match.handler
  uri = middlewareDidRun ? uri : URI(uri)
  uri[router.watch] = watched
  if (match) {
    uri.base = router.base + match.base
    uri.params = match.params
  }
  var last = router.current
  if (last) {
    if (last === handler || (last['uri-router-constructor'] === handler && handler.reusable)) {
      if (last.show) last.show(uri)
      return
    }
  }
  if (!handler) {
    if (last) {
      delete router.current
      hide(last, router.outlet, uri)
    }
    return
  }
  var next = null
  if (handler instanceof window.HTMLElement) {
    next = handler
  } else if (typeof handler === 'function') {
    if (handler.prototype instanceof window.HTMLElement) {
      next = new handler()
    } else {
      next = handler(uri, function () {
        routes = routes.filter(function (route) {
          return route[1] !== handler
        })
        update(router, routes, uri, true)
      })
    }
  }
  if (next) {
    if (next !== handler) {
      Object.defineProperty(next, 'uri-router-constructor', {
        value: handler
      })
    }
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
