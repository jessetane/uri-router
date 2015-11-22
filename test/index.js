var tape = require('tape')

if (process.env.SAUCE) {
  require('./sauce-tape')(tape)
}

require('../lib/match-route/test')

var router = require('../')

tape('initial', function (t) {
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

tape('synchronous navigation order is correct', function (t) {
  t.plan(1)

  var r = router({
    watch: 'pathname',
    routes: [
      ['.*', any]
    ]
  })

  var n = 0
  var pathnames = []

  router.push('/a')
  router.push('/b')
  router.pop()
  router.push('/')

  function any () {
    pathnames.push(window.location.pathname)
    if (++n === 5) {
      r.destroy()
      t.deepEqual(pathnames, [
        '/',
        '/a',
        '/b',
        '/a',
        '/'
      ])
    }
  }
})

tape('back and forward buttons order is correct', function (t) {
  t.plan(1)

  var r = router({
    watch: 'pathname',
    routes: [
      ['.*', any]
    ]
  })

  var n = 0
  var pathnames = []
  var ops = [
    'back',
    'forward',
    'back'
  ]

  router.push('/a')
  window.addEventListener('popstate', onpopstate)
  setTimeout(onpopstate)

  function onpopstate () {
    var op = ops.shift()
    op && window.history[op]()
  }

  function any () {
    pathnames.push(window.location.pathname)
    if (++n === 5) {
      r.destroy()
      window.removeEventListener('popstate', onpopstate)
      t.deepEqual(pathnames, [
        '/',
        '/a',
        '/',
        '/a',
        '/'
      ])
    }
  }
})

tape('replace', function (t) {
  t.plan(1)

  var r = router({
    watch: 'pathname',
    routes: [
      ['.*', any]
    ]
  })

  var n = 0
  var pathnames = []

  router.push('/a')
  router.replace('/b')
  router.pop()

  function any () {
    pathnames.push(window.location.pathname)
    if (++n === 4) {
      r.destroy()
      t.deepEqual(pathnames, [
        '/',
        '/a',
        '/b',
        '/'
      ])
    }
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
      ['/fail',      t.fail],
      ['.*',    middleware1],
      ['.*',    middleware2],
      ['.*',        handler],
      ['.*',         t.fail]
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

tape('view lifecycle without dom outlet', function (t) {
  t.plan(2)

  var app = document.querySelector('#app')
  var r = router({
    watch: 'pathname',
    routes: [
      ['/a', createView]
    ]
  })

  router.push('/a')
  t.equal(app.innerHTML, '42')
  router.push('/')
  t.equal(app.innerHTML, '')
  r.destroy()

  function createView () {
    var el = app
    el.show = show
    el.hide = hide
    return el
  }

  function show (uri) {
    this.textContent = '42'
  }

  function hide (uri) {
    this.textContent = ''
  }
})

tape('view lifecycle - async hide()', function (t) {
  t.plan(5)

  var app = document.querySelector('#app')
  var r = router({
    watch: 'pathname',
    outlet: app,
    routes: [
      ['/a', createView]
    ]
  })

  router.push('/a')
  t.equal(app.innerHTML, '<div id="view">42</div>')
  router.push('/')
  t.equal(app.innerHTML, '<div id="view">42</div>')
  r.destroy()

  function createView () {
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
    })
  }
})

tape('reusable views', function (t) {
  t.plan(4)

  var app = document.querySelector('#app')

  var r = router({
    watch: 'pathname',
    outlet: app,
    routes: [
      ['(/)(.+)', createView]
    ]
  })

  createView.reusable = true

  router.push('/a')
  t.equal(app.innerHTML, '<div id="view">a</div>')
  router.push('/b')
  t.equal(app.innerHTML, '<div id="view">b</div>')
  router.push('/')
  t.equal(app.innerHTML, '')
  r.destroy()

  function createView () {
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

tape('search', function (t) {
  t.plan(1)

  var r = router({
    watch: 'pathname',
    routes: [
      ['.*', any]
    ]
  })

  var n = 0
  var queries = []

  router.search({ a: '41' })
  router.search({ b: '42' })
  router.pop()
  router.search({ a: null })

  function any (uri) {
    queries.push(uri.query)
    if (++n === 5) {
      r.destroy()
      t.deepEqual(queries, [
        {},
        { a: '41' },
        { a: '41', b: '42' },
        { a: '41' },
        {}
      ])
    }
  }
})
