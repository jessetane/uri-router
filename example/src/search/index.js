module.exports = Search

var router = require('../../../')
var render = require('hyperglue2')
var robots = require('./model')

Search.reusable = true

function Search () {
  var el = render(require('./index.html'))
  el.show = show
  el.input = el.querySelector('input')
  el.input.addEventListener('keyup', function (evt) {
    router.search({
      filter: evt.target.value
    })
  })
  return el
}

function show (uri) {
  var data = robots
  var query = uri.query
  var filter = new RegExp(query.filter, 'i')
  if (filter) {
    data = robots.filter(function (r) {
      return r.match(filter)
    })
  }
  data = { 'li': data }
  if (this.input.value !== query.filter) {
    data.input = {
      _attr: {
        value: query.filter
      }
    }
  }
  render(this, data)
}
