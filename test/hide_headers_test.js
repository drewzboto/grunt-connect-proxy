'use strict';

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
      res.writeHead(200, {
        'x-hidden-header-1': 'this header should be removed',
        'x-hidden-header-2': 'this header should also be removed'
      });
      res.end();
    }).listen(8081);

    http.request({
      host: 'localhost',
      path: '/hideHeaders',
      port: 9000
    }, function(response) {

      test.equal(response.headers['x-hidden-header-1'], undefined, 'hidden header should be hidden');
      test.equal(response.headers['x-hidden-header-2'], undefined, 'header hiding is case insensitive');
      test.done();
    }).end();
  }
};
