'use strict';

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/
var utils = require("../lib/utils.js");
var http = require('http');

exports.connect_proxy = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  proxied_request: function(test) {
    test.expect(2);
    http.createServer(function (req, res) {
      test.equal(req.headers["x-proxied-header"], 'added', 'headers should be added to request');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.write('request successfully proxied!');
      res.end();
    }).listen(8080);

    http.request({
      host: 'localhost',
      path: '/request',
      port: 9000
    }, function(response) {
      var data = '';
      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('end', function () {
        test.equal(data, 'request successfully proxied!', 'request should be received');
        test.done();
      });
    }).end();
  }
};
