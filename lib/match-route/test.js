var tape = require('tape')
var matchroute = require('./')

var routes = [
  ['/a',            'a'],
  ['/b',            'b'],
  ['/c/?',          'c'],
  ['(/c)/([^/]+)', 'c+'],
  ['.*',          'any']
]

tape('basic', function (t) {
  t.plan(3)

  var route = matchroute('/a', routes)
  t.equal(route.base, '')
  t.equal(route.handler, 'a')
  t.deepEqual(route.params, [])
})

tape('catch all', function (t) {
  t.plan(3)

  var route = matchroute('/d', routes)
  t.equal(route.base, '')
  t.equal(route.handler, 'any')
  t.deepEqual(route.params, [])
})

tape('optional', function (t) {
  t.plan(6)

  var route = matchroute('/c/', routes)
  t.equal(route.base, '')
  t.equal(route.handler, 'c')
  t.deepEqual(route.params, [])

  route = matchroute('/c', routes)
  t.equal(route.base, '')
  t.equal(route.handler, 'c')
  t.deepEqual(route.params, [])
})

tape('params', function (t) {
  t.plan(3)

  var route = matchroute('/c/42', routes)
  t.equal(route.base, '/c')
  t.equal(route.handler, 'c+')
  t.deepEqual(route.params, [ '42' ])
})
