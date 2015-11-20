var tape = require('tape')

require('../lib/first-match/test')

var router = require('../')

tape('initial popstate', function (t) {
  t.plan(2)

  var r = router({
    watch: 'pathname',
    routes: [
      ['.*', any]
    ]
  })

  function any (uri) {
    r.destroy()
    t.equal(uri.init, true)
    t.equal(uri.pathname, '/')
  }
})

tape('recursive push / pop', function (t) {
  t.plan(6)

  var r = router({
    watch: 'pathname',
    routes: [
      ['.*', any]
    ]
  })

  var n = 0
  function any (uri) {
    if (n === 0) {
      t.equal(uri.init, true)
      t.equal(uri.pathname, '/')
      router.push('/a')
    } else if (n === 1) {
      t.equal(uri.init, false)
      t.equal(uri.pathname, '/a')
      router.pop()
    } else if (n === 2) {
      t.equal(uri.init, true)
      t.equal(uri.pathname, '/')
      r.destroy()
    }
    n++
  }
})

tape('nesting', function (t) {
  t.plan(4)

  router.push('/a/42')

  var r = router({
    watch: 'pathname',
    routes: [
      ['(/a)/.*', first],
      ['/',       third]
    ]
  })

  var nested = {
    watch: 'pathname',
    routes: [
      ['/42', second]
    ]
  }

  function first (uri) {
    t.equal(uri.pathname, '/a/42')
    t.equal(uri.base, '/a')
    nested.base = uri.base
    nested = router(nested)
    router.push('/')
  }

  function second (uri) {
    t.equal(uri.pathname, '/42')
  }

  function third (uri) {
    t.equal(uri.pathname, '/')
    nested.destroy()
    r.destroy()
  }
})

tape('middleware', function (t) {
  t.plan(4)

  var r = router({
    watch: 'pathname',
    routes: [
      ['/fail',   t.fail],
      ['.*', middleware1],
      ['.*', middleware2],
      ['.*',     handler],
      ['.*',      t.fail]
    ]
  })

  function middleware1 (uri, next) {
    t.pass()
    uri.x = 41
    next()
  }

  function middleware2 (uri, next) {
    t.pass()
    uri.x++
    next()
  }

  function handler (uri) {
    r.destroy()
    t.equal(uri.x, 42)
    t.equal(uri.pathname, '/')
  }
})

tape('dom outlet', function (t) {
  t.plan(2)

  var app = document.querySelector('#app')
  var r = router({
    watch: 'pathname',
    outlet: app,
    routes: [
      ['/a', View]
    ]
  })

  router.push('/a')
  t.equal(app.innerHTML, '<div id="view">42</div>')
  router.push('/')
  t.equal(app.innerHTML, '')
  r.destroy()

  function View () {
    var el = document.createElement('DIV')
    el.id = 'view'
    el.textContent = '42'
    return el
  }
})

tape('view lifecycle', function (t) {
  t.plan(4)

  var app = document.querySelector('#app')
  var r = router({
    watch: 'pathname',
    outlet: app,
    routes: [
      ['/a', View]
    ]
  })

  router.push('/a')
  t.equal(app.innerHTML, '<div id="view">42</div>')
  router.push('/')
  t.equal(app.innerHTML, '')
  r.destroy()

  function View () {
    var el = document.createElement('DIV')
    el.id = 'view'
    el.textContent = '42'
    el.show = show
    el.hide = hide
    return el
  }

  function show (uri) {
    t.equal(uri.pathname, '/a')
  }

  function hide (uri) {
    t.equal(uri.pathname, '/')
  }
})

tape('view lifecycle - async hide()', function (t) {
  t.plan(5)

  var app = document.querySelector('#app')
  var r = router({
    watch: 'pathname',
    outlet: app,
    routes: [
      ['/a', View]
    ]
  })

  router.push('/a')
  t.equal(app.innerHTML, '<div id="view">42</div>')
  router.push('/')
  t.equal(app.innerHTML, '<div id="view">42</div>')
  r.destroy()

  function View () {
    var el = document.createElement('DIV')
    el.id = 'view'
    el.textContent = '42'
    el.show = show
    el.hide = hide
    return el
  }

  function show (uri) {
    t.equal(uri.pathname, '/a')
  }

  function hide (uri, cb) {
    t.equal(uri.pathname, '/')
    setTimeout(function () {
      cb()
      t.equal(app.innerHTML, '')
    }.bind(this))
  }
})

tape('reusable views', function (t) {
  t.plan(4)

  View.reusable = true

  var app = document.querySelector('#app')
  var r = router({
    watch: 'pathname',
    outlet: app,
    routes: [
      ['(/)(.+)', View],
    ]
  })

  router.push('/a')
  t.equal(app.innerHTML, '<div id="view">a</div>')
  router.push('/b')
  t.equal(app.innerHTML, '<div id="view">b</div>')
  router.push('/')
  t.equal(app.innerHTML, '')
  r.destroy()

  function View () {
    var el = document.createElement('DIV')
    el.id = 'view'
    el.x = 0
    el.show = show
    el.hide = hide
    return el
  }

  function show (uri) {
    this.textContent = uri.params[0]
    this.x++
  }

  function hide () {
    t.equal(this.x, 2)
  }
})
