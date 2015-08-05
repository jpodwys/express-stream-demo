var express = require('express');
var fs = require('fs');
var superagent = require('superagent');
var ejs = require('ejs');
var app = express();
var stream = require('express-stream');
app.set('views', './views');
app.set('view engine', 'ejs');

var PORT = process.env.PORT || 3000;

app.get('/data', function (req, res) {
  setTimeout(function(){
    res.sendStatus(200);
  }, 1000);
});

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/no-stream', function (req, res) {
  superagent
    .get('http://localhost:' + PORT + '/data')
    .end(function (err, response){
      res.render('no-stream');
    }
  );
});

app.get('/stream', function (req, res){
  var headerFile = fs.readFileSync(__dirname + '/views/stream-header.ejs', {encoding: 'utf-8'});
  res.write(headerFile);
  var template = ejs.compile(fs.readFileSync(__dirname + '/views/stream-body.ejs', 'utf8'));
  superagent
    .get('http://localhost:' + PORT + '/data')
    .end(function (err, response){
      var html = template({});
      res.write(html);
      res.end();
    }
  );
});

stream.streamBefore('stream-header');
stream.closeHeadOpenBody('stream-body');
stream.streamAfter('stream-body');

app.get('/stream2', stream.stream('stream-body'), function (req, res){
  superagent
    .get('http://localhost:' + PORT + '/data')
    .end(function (err, response){
      res.render('stream-body');
    }
  );
});

var server = app.listen(PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
});
