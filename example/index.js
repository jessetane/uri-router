var router = require('../')

router({
  watch: 'pathname',
  outlet: document.querySelector('.pages'),
  routes: [
    ['/',                                 require('./src/home')],
    ['/hash',                             require('./src/hash')],
    ['/search',                         require('./src/search')],
    ['(/transitions)(?:/(.+))?',   require('./src/transitions')],
    ['(/redirecting)(?:/(.+))?',   require('./src/redirecting')],
    ['/web-components',          require('./src/web-component')],
    ['.*',                                 require('./src/404')]
  ]
})
