module.exports = hijack

var matches = window.Element.prototype.matches ||
              window.Element.prototype.matchesSelector ||
              window.Element.prototype.mozMatchesSelector ||
              window.Element.prototype.webkitMatchesSelector ||
              window.Element.prototype.msMatchesSelector

function hijack (ctx, selector, event, cb) {
  if (!matches) return
  ctx = ctx || window
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
