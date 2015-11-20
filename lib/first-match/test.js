var tape = require('tape')
var firstmatch = require('./')

var routes = [
  ['/a',             'a'],
  ['(/b/)([^\/]+)', 'b+'],
  ['(/b)/?',         'b'],
  ['/c',             'c'],
  ['.*',           'any']
]

tape('basic', function (t) {
  t.plan(3)

  var match = firstmatch('/c', routes)
  t.equal(match.id, '/c')
  t.equal(match.data, 'c')
  t.deepEqual(match.capture, [])
})

tape('catch all', function (t) {
  t.plan(3)

  var match = firstmatch('/d', routes)
  t.equal(match.id, '/d')
  t.equal(match.data, 'any')
  t.deepEqual(match.capture, [])
})

tape('optional', function (t) {
  t.plan(6)

  var match = firstmatch('/b/', routes)
  t.equal(match.id, '/b')
  t.equal(match.data, 'b')
  t.deepEqual(match.capture, [])

  match = firstmatch('/b', routes)
  t.equal(match.id, '/b')
  t.equal(match.data, 'b')
  t.deepEqual(match.capture, [])
})

tape('capture', function (t) {
  t.plan(3)

  var match = firstmatch('/b/42', routes)
  t.equal(match.id, '/b/')
  t.equal(match.data, 'b+')
  t.deepEqual(match.capture, [ '42' ])
})
