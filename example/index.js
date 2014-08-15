var fs = require('fs');
var http = require('http');
var exec = require('child_process').exec;

var port = '8080';

var server = http.createServer(function(req, res) {
  console.log(req.method + ' ' + req.url);

  var file = 'index.html';
  if (req.url === '/build.js') {
    res.setHeader('content-type', 'application/javascript');
    file = 'build.js';
  }
  else if (req.url === '/style.css') {
    res.setHeader('content-type', 'text/css');
    file = 'style.css'; 
  }
  
  res.statusCode = 200;
  res.end(fs.readFileSync(__dirname + '/' + file));
});

exec(__dirname + '/../node_modules/.bin/browserify -t txtify2 ' + __dirname + '/app.js > ' + __dirname + '/build.js', function(err) {
  if (err) throw err;
  
  server.listen(port, '::', function() {
    console.log('server listening on ' + port);
    //exec('which xdg-open && xdg-open http://localhost:' + port + ' || open http://localhost:' + port);
  });
});
