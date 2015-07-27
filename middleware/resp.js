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
