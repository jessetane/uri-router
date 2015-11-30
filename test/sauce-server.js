var JSBuilder = require('build-js')
var http = require('app-server')
var request = require('hyperquest')

process.env.SAUCE = 'true'

// only update the sauce badge for commits on master
if (process.env.TRAVIS_BUILD_NUMBER &&
    process.env.TRAVIS_BRANCH === 'master' &&
    !process.TRAVIS_PULL_REQUEST) {
   process.env.UPDATE_SAUCE_BADGE = process.env.TRAVIS_BUILD_NUMBER
}

var auth = 'Basic ' + Buffer(process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY).toString('base64')
var platforms = {}

var server = http({
  root: 'test'
}, function (err) {
  if (err) throw err
  console.log('test server listening on port ' + server.port)
})

server.middleware = function (req, res, next) {
  // console.log('test server got request: ' + req.method + ' ' + req.url)
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
  var data = ''
  var body = {
    url: 'http://localhost:' + server.port,
    build: process.env.UPDATE_SAUCE_BADGE,
    framework: 'custom',
    platforms: [
      ['linux',       'googlechrome',         ''],
      ['linux',       'firefox',              ''],
      ['android',     'android',           '5.1'],
      ['android',     'android',           '4.3'],
      ['',            'iphone',            '9.1'],
      ['',            'iphone',            '5.1'],
      ['',            'safari',              '9'],
      ['',            'safari',              '6'],
      ['windows 10',  'microsoftedge',        ''],
      ['windows 10',  'internet explorer',  '11'],
      ['windows 8',   'internet explorer',  '10']
    ]
  }
  if (process.env.TRAVIS_JOB_NUMBER) {
    body.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER
  }
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
  }).end(JSON.stringify(body))
}

function checkTestStatus () {
  var self = this
  var url = 'https://saucelabs.com/rest/v1/' + process.env.SAUCE_USERNAME + '/js-tests/status'
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
    reviewTests(JSON.parse(data)['js tests'])
    setTimeout(checkTestStatus.bind(self), 10000)
  }).end(JSON.stringify(this))
}

function reviewTests (tests) {
  var complete = 0
  tests.forEach(function (test) {
    var name = test.platform.join(' ').trim()
    var status = test.status
    var result = test.result
    var platform = platforms[name]
    if (!platform) platform = platforms[name] = {}
    if (status && status !== platform.status) {
      if (status === 'test error') {
        throw new Error(JSON.stringify(test, null, 2))
      } else {
        platform.status = status
        console.log(name + ' - ' + status)
      }
    } else if (result !== undefined) {
      complete++
      if (platform.result === undefined) {
        platform.result = result.passed === result.total
        console.log(name + ' - complete - ' + result.passed + ' / ' + result.total)
      }
    }
  })
  if (complete === tests.length) {
    var success = true
    for (var name in platforms) success = platforms[name].result
    process.exit(success ? 0 : 1)
  }
}
