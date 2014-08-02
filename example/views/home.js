var render = require('hyperglue2');

module.exports = function() {
  this.el = render('<div>\
                      <h1>home</h1>\
                      <p>browse the demos by clicking the links above</p>\
                    </div>');
};
