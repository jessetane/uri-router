var JSBuilder = require('build-js')
var http = require('app-server')

var js = new JSBuilder({
  src: 'example/index.js',
  dest: 'example/share/build.js'
})
js.watch(function (err) {
  if (err) console.log(err.message)
  else console.log('example rebuilt')
})

var server = http({
  root: 'example/share'
}, function (err) {
  if (err) throw err
  console.log('example server listening on port ' + server.port)
})

server.middleware = function (req, res, next) {
  console.log('example server got request: ' + req.method + ' ' + req.url)
  next()
}
