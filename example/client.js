window.router = require('../');

router({
  watch: 'pathname',
  outlet: '.pages',
  routes: {
    '/': require('./src/home'),
    '/hash': require('./src/hash'),
    '/search': require('./src/search'),
    '/transitions(/.*)?': require('./src/transitions'),
    '/z-control(/.*)?': require('./src/z-control'),
    '/stacking(/.*)?': require('./src/stacking'),
    '/redirecting(/.*)?': require('./src/redirect'),
    '/web-components': require('./src/web-component'),
  },
  notFound: require('./src/404'),
});
