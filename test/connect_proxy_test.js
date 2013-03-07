'use strict';

var grunt = require('grunt');

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

exports.connect_proxy = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default_options: function(test) {
    test.expect(7);
    var proxies = utils.proxies();

    test.equal(proxies.length, 2, 'should return two valid proxies');
    test.notEqual(proxies[0].server, null, 'server should be configured');
    test.equal(proxies[0].config.context, '/defaults', 'should have context set from config');
    test.equal(proxies[0].config.host, 'www.defaults.com', 'should have host set from config');
    test.equal(proxies[0].config.port, 80, 'should have default port 80');
    test.equal(proxies[0].config.https, false, 'should have default http');
    test.equal(proxies[0].config.changeOrigin, false, 'should have default change origin');

    test.done();
  },
  full_options: function(test) {
    test.expect(7);
    var proxies = utils.proxies();

    test.equal(proxies.length, 2, 'should return two valid proxies');
    test.notEqual(proxies[1].server, null, 'server should be configured');
    test.equal(proxies[1].config.context, '/full', 'should have context set from config');
    test.equal(proxies[1].config.host, 'www.full.com', 'should have host set from config');
    test.equal(proxies[1].config.port, 8080, 'should have port set from config');
    test.equal(proxies[1].config.https, true, 'should have http set from config');
    test.equal(proxies[1].config.changeOrigin, true, 'should have change origin set from config');

    test.done();
  }
};
