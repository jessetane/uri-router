var JSBuilder = require('build-js')
var http = require('app-server')
var request = require('hyperquest')

process.env.SAUCE = 'true'

var server = http({
  share: 'test'
}, function (err) {
  if (err) throw err
  console.log('test server listening on port ' + server.port)
})

server.middleware = function (req, res, next) {
  console.log('test server got request: ' + req.method + ' ' + req.url)
  next()
}

new JSBuilder({
  src: 'test/index.js',
  dest: 'test/build.js'
}).build(function (err) {
  if (err) throw err
  console.log('test rebuilt')
  runTests()
})

function runTests () {
  var url = 'https://saucelabs.com/rest/v1/' + process.env.SAUCE_USERNAME + '/js-tests'
  var auth = 'Basic ' + Buffer(process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_KEY).toString('base64')
  var data = ''
  request(url, {
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    }
  }).on('data', function (d) {
    data += d
  }).on('end', function () {
    var response = JSON.parse(data)
    if (!response['js tests']) throw new Error(data)
    setTimeout(checkTestStatus.bind(response), 2000)
  }).end(JSON.stringify({
    url: 'http://localhost:' + server.port,
    build: String(Math.random()).slice(2),
    framework: 'custom',
    platforms: [
      [ 'linux',      'googlechrome',      '' ],
      [ 'linux',      'firefox',           '' ],
      [ '',           'iphone',         '9.1' ],
      [ 'windows 10', 'microsoftedge',     '' ],
      [ 'windows 10', '',              '11.0' ],
      [ 'windows 10', '',              '10.0' ],
    ]
  }))
}

function checkTestStatus () {
  var self = this
  var url = 'https://saucelabs.com/rest/v1/' + process.env.SAUCE_USERNAME + '/js-tests/status'
  var auth = 'Basic ' + Buffer(process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_KEY).toString('base64')
  var data = ''
  request(url, {
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    }
  }).on('data', function (d) {
    data += d
  }).on('end', function () {
    data = JSON.parse(data)
    if (data.completed) {
      data['js tests'].forEach(function (test) {
        var result = test.result ? (test.result.passed + ' / ' + test.result.total) : 'incomplete'
        console.log(result + ' - ' + test.platform.join(' '))
      })
      process.exit(0)
      return
    }
    setTimeout(checkTestStatus.bind(self), 10000)
  }).end(JSON.stringify(this))
}
