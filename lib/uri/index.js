module.exports = URI

var qs = require('querystring')

URI.decodeQuerystring = qs.parse
URI.encodeQuerystring = qs.stringify

var parser = document.createElement('A')

function URI (uri) {
  if (typeof uri === 'string') {
    parser.href = uri.href || uri
    uri = parser
  }
  uri = {
    // https://url.spec.whatwg.org
    href: uri.href,
    origin: uri.origin,
    protocol: uri.protocol,
    hostname: uri.hostname,
    port: uri.port,
    pathname: uri.pathname,
    search: uri.search,
    hash: uri.hash,
    host: uri.host,
    // non-standard, see readme
    init: uri.init,
    back: uri.back,
    replace: uri.replace,
    base: uri.base,
    query: uri.query,
    params: uri.params
  }
  // https://connect.microsoft.com/IE/feedbackdetail/view/1002846
  if (uri.pathname.indexOf('/') !== 0) {
    uri.pathname = '/' + uri.pathname
  }
  if (!uri.query) {
    uri.query = URI.decodeQuerystring(uri.search.slice(1))
  }
  return uri
}
