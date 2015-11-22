// https://wiki.saucelabs.com/display/DOCS/Reporting+JavaScript+Unit+Test+Results+to+Sauce+Labs+Using+a+Custom+Framework

module.exports = function (tape) {
  var results = []
  var startTime = +new Date()
  tape.createStream({
    objectMode: true
  }).on('data', function (result) {
    if (result.type === 'assert') {
      results.push({
        name: result.name,
        result: result.ok,
        message: result.operator,
        duration: 1
      })
    }
  }).on('end', function () {
    var passed = results.reduce(function (p, n) { return n.result ? p + 1 : p }, 0)
    window.global_test_results = {
      passed: passed,
      failed: results.length - passed,
      total: results.length,
      duration: +new Date() - startTime,
      tests: results
    }
  })
}
