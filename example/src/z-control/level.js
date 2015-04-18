module.exports = Level;

function Level() {}

Level.prototype.hide = function(r, cb) {
  setTimeout(cb, 500)
};
