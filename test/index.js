var router = require('../');
var tape = require('tape');

tape('basic', function(t) {
  t.plan(1);
  t.equal(window.location.pathname, '/');
  t.end();
});
