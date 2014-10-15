module.exports = Level;

function Level() {}

Level.prototype.show = function() {
  this.el.style.pointerEvents = '';
  this.el.style.opacity = '';
};

Level.prototype.hide = function() {
  this.el.style.pointerEvents = 'none';
  this.el.style.opacity = '0.35';
};
