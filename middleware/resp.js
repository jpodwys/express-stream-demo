var fs = require('fs');

var exports = module.exports;

// exports.write = function(){
//   return function(req, res, next){
//     res._write = res.write;
//     res.write = function(content, encoding, assets){
//       if(assets){
//         res._write('<html><head>' + assets + '</head><body><header style="background-color:#00FFFF">This is a header</header>');
//       }
//       else{
//         res._write(content, encoding);
//       }
//     }
//     next();
//   }
// }

exports.write = function(path, encoding){
  return function(req, res, next){
    var headerFile = fs.readFileSync(path, encoding);
    res.write(headerFile);
    next();
  }
}

exports.stream = function(){
  return function (req, res, next){

    function setCharset(){}

    function generateETag(){}

    res.set = function(){}

    res._render = res.render;
    res.render = function (view, options, callback) {
      this.isFinalChunk = true;
      this._render(view, options, callback);
    }

    res.stream = function (view, options, callback) {
      this.isFinalChunk = false;
      this._render(view, options, callback);
    }

    res._end = res.end;
    res.end = function (chunk, encoding) {
      this.write(chunk, encoding);
      if(this.isFinalChunk){
        //this.render('layout-stream-post-body');
        this._end();
      }
    }

    res.stream('stream-header');

    next();
  }
}
