module.exports = NotFound

var render = require('hyperglue2')

function NotFound () {
  var el = render(require('./index.html'))
  el.show = show
  return el
}

function show () {
  render(this, {
    p: window.location.href + ' was not found'
  })
}
