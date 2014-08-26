module.exports = function(route, routes) {
  var first = {};

  if (typeof route !== 'string') {
    return first;
  }

  for (var key in routes) {
    var regex = new RegExp('^' + key + '$');
    var match = route.match(regex);
    if (match) {
      first.match = match;
      first.value = routes[key];
      break;
    }
  }

  if (first.match) {
    match = first.match.reverse();
    first.match = match.pop();
    for (var i=0; i<match.length; i++) {
      first.match = first.match.replace(new RegExp(match[i] + '$'), '');
    }
  }

  return first;
};
