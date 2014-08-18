var http = require('http');
var statics = require('ecstatic')(__dirname);

var server = http.createServer(function(req, res) {
  if (!/\.[^\/]*$/.test(req.url)) {
    req.url = '/';
  }
  console.log(req.url);
  statics(req, res);
});

server.listen(9000, '::', function() {
  console.log('server listening on ' + 9000);
});
