var matches = Element.prototype.matches ||
              Element.prototype.matchesSelector ||
              Element.prototype.mozMatchesSelector ||
              Element.prototype.webkitMatchesSelector ||
              Element.prototype.msMatchesSelector;

module.exports = function(ctx, selector, event, cb) {
  if (!matches) return;

  var ctx = ctx || window;
  ctx.addEventListener(event, function(evt) {
    if (evt.defaultPrevented) return;
    var target = evt.target;
    while (target !== document && !matches.call(target, selector)) {
      target = target.parentNode;
    }
    if (target !== document) {
      cb(evt, target);
    }
  });
};
