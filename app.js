var express = require('express');
var fs = require('fs');
var superagent = require('superagent');
var ejs = require('ejs');
var app = express();
var stream = require('express-stream');
var compression = require('compression');
app.use(compression({threshold: '2kb'}));
app.use(function (req, res, next) {
  res.setHeader('Content-Type', 'text/html');
  next();
});
app.use(function cache(req, res, next) {
  res.setHeader('Cache-Control', 'public, max-age=5000');
  next();
});
app.set('views', './views');
app.set('view engine', 'ejs');
var PORT = process.env.PORT || 3000;





app.get('/data', function (req, res) {
  setTimeout(function(){
    res.sendStatus(200);
  }, 1000);
});





app.get('/name', function (req, res) {
  setTimeout(function(){
    res.send({name: 'Joe Podwys'});
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





app.get('/manual-stream', function (req, res){
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





//One-time, app-wide express-stream config
stream.openHtmlOpenHead(true);
stream.closeHeadOpenBody('stream-close-head-open-body');
stream.closeBodyCloseHtml(true);
stream.streamBefore('stream-head');

//Route using express-stream
app.get('/express-stream', stream.stream(), function (req, res){
  superagent
    .get('http://localhost:' + PORT + '/data')
    .end(function (err, response){
      res.stream('stream-body');
      res.end();
    }
  );
});





// stream.wrapJavascript(true);

// app.get('/express-stream-pipe', stream.pipe, function (req, res){
//   res.stream('pipe');
//   superagent
//     .get('http://localhost:' + PORT + '/name')
//     .end(function (err, response){
//       res.pipe("$('.font21.serif').html('Joe Podwys');");
//       res.end();
//     }
//   );
// });





app.get('/express-stream-pipe-view', stream.pipe, function (req, res){
  res.stream('pipe');
  superagent
    .get('http://localhost:' + PORT + '/name')
    .end(function (err, response){
      res.stream('pipe-view', {name: response.body.name});
      res.end();
    }
  );
});





var server = app.listen(PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
});
