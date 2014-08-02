var matches = Element.prototype.matches ||
              Element.prototype.matchesSelector ||
              Element.prototype.mozMatchesSelector ||
              Element.prototype.webkitMatchesSelector ||
              Element.prototype.msMatchesSelector;

module.exports = function(ctx, selector, event, cb) {
  var ctx = ctx || window;
  ctx.addEventListener(event, function(evt) {
    if (evt.defaultPrevented || !matches) return;
    if (matches.call(evt.target, selector)) {
      cb(evt);
    }
  });
};
