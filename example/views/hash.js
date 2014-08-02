var router = require('../../');
var render = require('hyperglue2');

module.exports = HashView;

function HashView() {
  this.el = render('<div>\
                      <h1>hash</h1>\
                      <p>simple hash routing</p>\
                      <ul style="display:inline-block; vertical-align:middle;">\
                        <li><a href="#one">one</a></li>\
                        <li><a href="#two">two</a></li>\
                        <li><a href="#three">three</a></li>\
                      </ul>\
                      <div class="outlet box"></div>\
                    </div>');

  this.router = router({
    watch: 'hash',
    outlet: this.el.querySelector('.outlet'),
    routes: {
      '#one': One,
      '#two': Two,
      '#three': Three
    }
  });

  this.deselect = deselect.bind(this);
  document.addEventListener('click', this.deselect);
};

HashView.prototype.hide = function() {
  this.router.destroy();
  document.removeEventListener('click', this.deselect);
};

function deselect(evt) {
  if (evt.target.nodeName !== 'A') {
    this.router.push('');
  }
}

function One() { this.el = render('<h3 class="center">1</h3>') }
function Two() { this.el = render('<h3 class="center">2</h3>') }
function Three() { this.el = render('<h3 class="center">3</h3>') }
