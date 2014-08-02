window.router = require('../');

router({
  watch: 'pathname',
  outlet: '.pages',
  routes: {
    '/': require('./views/home'),
    '/hash': require('./views/hash'),
    '/search': require('./views/search'),
    '/transitions(/.*)?': require('./views/transitions'),
    '/stacking(/.*)?': require('./views/stacking'),
    '/redirecting(/.*)?': require('./views/redirecting'),
    '/web-components': require('./views/web-component'),
  },
  notFound: require('./views/404'),
});
