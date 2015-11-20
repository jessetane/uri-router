module.exports = hijack

var matches = Element.prototype.matches ||
              Element.prototype.matchesSelector ||
              Element.prototype.mozMatchesSelector ||
              Element.prototype.webkitMatchesSelector ||
              Element.prototype.msMatchesSelector

function hijack (ctx, selector, event, cb) {
  if (!matches) return

  var ctx = ctx || window
  ctx.addEventListener(event, function (evt) {
    if (evt.metaKey || evt.defaultPrevented) return

    var target = evt.target
    while (target !== document && !matches.call(target, selector)) {
      target = target.parentNode || document
    }

    if (target !== document) {
      cb(evt, target)
    }
  })
}
