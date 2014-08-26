module.exports = function(route, routes) {
  var best = {};

  if (typeof route !== 'string') {
    return best;
  }

  for (var key in routes) {
    var regex = new RegExp('^' + key + '$');
    var match = route.match(regex);
    if (match) {
      if (best.match && best.match.length > match.length) continue;
      best.match = match;
      best.value = routes[key];
    }
  }

  if (best.match) {
    match = best.match.reverse();
    best.match = match.pop();
    for (var i=0; i<match.length; i++) {
      best.match = best.match.replace(new RegExp(match[i] + '$'), '');
    }
  }

  return best;
};
