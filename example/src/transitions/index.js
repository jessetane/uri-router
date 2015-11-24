module.exports = TransitionsView

var router = require('../../../')
var render = require('hyperglue2')
var template = require('./index.html')
var templateview = require('./transition.html')
var model = require('./model')

TransitionsView.reusable = true

function TransitionsView () {
  var el = render(template)
  el.hide = hide
  el.router = router({
    watch: 'pathname',
    outlet: el.querySelector('.outlet'),
    routes: [
      ['/transitions/.*', Transition]
    ]
  })
  el.deselect = deselect.bind(el)
  document.addEventListener('click', el.deselect)
  return el
}

function hide () {
  document.removeEventListener('click', this.deselect)
  this.router.destroy()
}

function deselect (evt) {
  if (evt.target.nodeName !== 'A') {
    router.push('/transitions')
  }
}

function Transition () {
  var id = window.location.pathname.replace(/.*\//, '')
  var m = model[id]
  var el = render(templateview, {
    _attr: {
      style: 'background:' + m.color + ';'
    },
    h3: m.title
  })
  el.show = showTransition
  el.hide = hideTransition
  return el
}

function showTransition () {
  window.getComputedStyle(this).opacity
  this.style.opacity = '1'
}

function hideTransition (uri, cb) {
  this.style.opacity = '0'
  this.addEventListener('transitionend', cb)
}
