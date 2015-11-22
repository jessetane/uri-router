module.exports = function (string, routes) {
  var match = null
  var handler = null
  for (var i = 0; i < routes.length; i++) {
    var route = routes[i]
    var regex = new RegExp('^' + route[0] + '$')
    match = string.match(regex)
    if (match) {
      handler = route[1]
      break
    }
  }
  if (!match) return null
  return {
    base: match.length > 1 ? match[1] : '',
    params: match.slice(2),
    handler: handler
  }
}
