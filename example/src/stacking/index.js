module.exports = Stacks;

var router = require('../../../');
var render = require('hyperglue2');
var model = require('./model');

function Stacks() {
  this.el = render(require('./index.html'));
};

Stacks.prototype.show = function(r) {
  if (this.router) return;

  this.router = router({
    root: r.route,
    watch: 'pathname',
    outlet: this.el.querySelector('.folders'),
    stack: '/',
    routes: {
      '.*': Folder
    }
  });
};

Stacks.prototype.destroy = function() {
  this.router.destroy();
};

//////

function Folder() {
  this.el = render(require('./folder.html'));
}

Folder.prototype.show = function(r) {
  var route = r.route;
  var title = route || '/';
  var parts = title.split('/').slice(1);
  var folders = model;
  var error = null;
  var editor = null;

  for (var i in parts) {
    var part = parts[i];
    folders = part ? folders[part] : folders;
    if (!folders) {
      error = 'Not Found';
      break;
    }
  }

  if (typeof folders === 'object') {
    folders = Object.keys(folders).map(function(item) {
      return {
        'a': {
          _text: item,
          _attr: { href: r.root + (title === '/' ? title : title + '/') + item },
        }
      };
    });
  }
  else if (folders) {
    editor = folders;
    folders = null;
  }

  render(this.el, {
    'h3 a': {
      _text: title, 
      _attr: { href: r.root + (title === '/' ? '' : title) },
    },
    '.error': error,
    '.editor': editor,
    'li': folders || [],
  });
};
