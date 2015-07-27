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
  return function(req, res, next){

    res.render = function (view, options, callback) {
      var app = this.req.app;
      var done = callback;
      var opts = options || {};
      var req = this.req;
      var self = this;
      this.streamResponse = opts.streamResponse || false;

      // support callback function as second arg
      if (typeof options === 'function') {
        done = options;
        opts = {};
      }

      // merge res.locals
      opts._locals = self.locals;

      // default callback to respond
      done = done || function (err, str) {
        if (err) return req.next(err);
        self.send(str);
      };

      // render
      app.render(view, opts, done);
    };
    
    res.send = function (body) {
      var chunk = body;
      var encoding;
      var len;
      var req = this.req;
      var type;

      // settings
      var app = this.app;

      // allow status / body
      if (arguments.length === 2) {
        // res.send(body, status) backwards compat
        if (typeof arguments[0] !== 'number' && typeof arguments[1] === 'number') {
          deprecate('res.send(body, status): Use res.status(status).send(body) instead');
          this.statusCode = arguments[1];
        } else {
          deprecate('res.send(status, body): Use res.status(status).send(body) instead');
          this.statusCode = arguments[0];
          chunk = arguments[1];
        }
      }

      // disambiguate res.send(status) and res.send(status, num)
      if (typeof chunk === 'number' && arguments.length === 1) {
        // res.send(status) will set status message as text string
        if (!this.get('Content-Type')) {
          this.type('txt');
        }

        deprecate('res.send(status): Use res.sendStatus(status) instead');
        this.statusCode = chunk;
        chunk = statusCodes[chunk];
      }

      switch (typeof chunk) {
        // string defaulting to html
        case 'string':
          if (!this.get('Content-Type')) {
            this.type('html');
          }
          break;
        case 'boolean':
        case 'number':
        case 'object':
          if (chunk === null) {
            chunk = '';
          } else if (Buffer.isBuffer(chunk)) {
            if (!this.get('Content-Type')) {
              this.type('bin');
            }
          } else {
            return this.json(chunk);
          }
          break;
      }

      // write strings in utf-8
      // if (typeof chunk === 'string') {
      //   encoding = 'utf8';
      //   type = this.get('Content-Type');

      //   // reflect this in content-type
      //   if (typeof type === 'string' && !this.streamResponse) {
      //     this.set('Content-Type', setCharset(type, 'utf-8'));
      //   }
      // }

      // populate Content-Length
      // if (chunk !== undefined  && !this.streamResponse) {
      //   if (!Buffer.isBuffer(chunk)) {
      //     // convert chunk to Buffer; saves later double conversions
      //     chunk = new Buffer(chunk, encoding);
      //     encoding = undefined;
      //   }

      //   len = chunk.length;
      //   this.set('Content-Length', len);
      // }

      // populate ETag
      // var etag;
      // var generateETag = len !== undefined && app.get('etag fn');
      // if (typeof generateETag === 'function' && !this.get('ETag')  && !this.streamResponse) {
      //   if ((etag = generateETag(chunk, encoding))) {
      //     this.set('ETag', etag);
      //   }
      // }

      // freshness
      if (req.fresh) this.statusCode = 304;

      // strip irrelevant headers
      if (204 == this.statusCode || 304 == this.statusCode) {
        this.removeHeader('Content-Type');
        this.removeHeader('Content-Length');
        this.removeHeader('Transfer-Encoding');
        chunk = '';
      }

      if (req.method === 'HEAD') {
        // skip body for HEAD
        if(!this.streamResponse){
          this.end();
        }
      } else {
        // respond
        if(!this.streamResponse){
          this.end(chunk, encoding);
        }
        else{
          this.write(chunk, encoding);
        }
      }

      return this;
    };

    res.render('stream-header', {streamResponse: true});

    next();
  }
}
