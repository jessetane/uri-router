module.exports = Redirecting

var router = require('../../../')
var render = require('hyperglue2')
var template = require('./index.html')
var templateProtected = require('./protected.html')
var templateSignin = require('./signin.html')

var user = null

Redirecting.reusable = true

function Redirecting (uri) {
  var el = render(template)
  el.show = show
  el.hide = hide
  el.router = router({
    base: uri.base,
    watch: 'pathname',
    outlet: el.querySelector('#outlet'),
    routes: [
      ['/protected', Protected],
      ['/sign-in',      Signin]
    ]
  })
  return el
}

function show (uri) {
  render(this, {
    '#show-protected': { 
      _attr: {
        disabled: uri.pathname === uri.base ? null : 'disabled'
      }
    }
  })
}

function hide () {
  this.router.destroy()
}

function Protected (uri) {
  var el = render(templateProtected)
  el.show = showProtected
  el.hide = hideProtected
  el.addEventListener('submit', function (evt) {
    user = null
    router.push(uri.base)
  })
  return el
}

function showProtected (uri) {
  this.style.display = ''
  if (!user) {
    router.replace(uri.base + '/sign-in')
  } else {
    render(this, {
      p: 'welcome to the protected area ' + user
    })
  }
};

function hideProtected () {
  this.style.display = 'none'
}

function Signin (uri) {
  var el = render(templateSignin)
  el.addEventListener('submit', function (evt) {
    user = evt.target.elements[0].value
    if (!user) return
    router.replace(uri.base + '/protected')
  })
  return el
}
