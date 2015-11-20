module.exports = function (string, items) {
  var match = null
  var data = null
  for (var i = 0; i < items.length; i++) {
    var item = items[i]
    var regex = new RegExp('^' + item[0] + '$')
    match = string.match(regex)
    if (match) {
      data = item[1]
      break
    }
  }
  if (!match) return null
  return {
    id: match[1] !== undefined ? match[1] : match.input,
    data: data,
    capture: match.slice(2)
  }
}
