var express = require('express');
var fs = require('fs');
var superagent = require('superagent');
var ejs = require('ejs');
var app = express();
app.set('views', './views');
app.set('view engine', 'ejs');


app.get('/data', function (req, res) {
  setTimeout(function(){
    res.sendStatus(200);
  }, 1000);
});

app.get('/no-stream', function (req, res) {
  superagent
    .get('http://localhost:3000/data')
    .end(function (err, response){
      res.render('no-stream', {layout: 'layout/no-stream'});
    }
  );
});

app.get('/stream', function(req, res){
    var headerFile = fs.readFileSync(__dirname + '/views/stream-header.ejs', {encoding: 'utf-8'});
    res.write(headerFile);
    var template = ejs.compile(fs.readFileSync(__dirname + '/views/stream-body.ejs', 'utf8'));
    superagent
      .get('http://localhost:3000/data')
      .end(function (err, response){
        var html = template({});
        res.write(html);
        res.end();
      }
    );
  });

app.get('/stream', function (req, res) {
  res.render('hello');
});

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;
});
