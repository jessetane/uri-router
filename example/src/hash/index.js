module.exports = HashView

var router = require('../../../')
var render = require('hyperglue2')

HashView.reusable = true

function HashView () {
  var el = render(require('./index.html'))
  el.hide = hide
  el.router = router({
    watch: 'hash',
    outlet: el.querySelector('.outlet'),
    routes: [
      ['#one',     One],
      ['#two',     Two],
      ['#three', Three]
    ]
  })
  el.deselect = deselect.bind(el)
  document.addEventListener('click', el.deselect)
  return el
}

function hide () {
  document.removeEventListener('click', this.deselect)
  this.router.destroy()
};

function deselect (evt) {
  if (evt.target.nodeName !== 'A') {
    router.push('/hash')
  }
}

function One () { return render('<h3 class="center">1</h3>') }
function Two () { return render('<h3 class="center">2</h3>') }
function Three () { return render('<h3 class="center">3</h3>') }
