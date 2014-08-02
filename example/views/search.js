var router = require('../../');
var render = require('hyperglue2');
var robots = require('../fixture/robots');

module.exports = Search;

function Search() {
  this.el = render('<div>\
                      <h1>search</h1>\
                      <p>use location.search to filter a list of robots (courtesy wikipedia)</p>\
                      <input type="search">\
                      <ul><li></li></ul>\
                    </div>');

  this.input = this.el.querySelector('input');
  this.input.addEventListener('keyup', function(evt) {
    router.search({ filter: evt.target.value });
  });
};

Search.prototype.show = function(router) {
  var data = robots;
  var query = router.location.query;
  var filter = new RegExp(query.filter, 'i');

  if (filter) {
    data = robots.filter(function(r) {
      return r.match(filter);
    });
  }
  
  data = { 'li': data };
  if (this.input.value !== query.filter) {
    data.input = { _attr: { value: query.filter }};
  }

  render(this.el, data);
};
