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
    test.expect(10);
    var proxies = utils.proxies();

    test.equal(proxies.length, 5, 'should return five valid proxies');
    test.notEqual(proxies[0].server, null, 'server should be configured');
    test.equal(proxies[0].config.context, '/defaults', 'should have context set from config');
    test.equal(proxies[0].config.host, 'www.defaults.com', 'should have host set from config');
    test.equal(proxies[0].config.port, 80, 'should have default port 80');
    test.equal(proxies[0].config.https, false, 'should have default http');
    test.equal(proxies[0].config.rejectUnauthorized, false, 'should have reject unauthorized default to false');
    test.equal(proxies[0].config.changeOrigin, false, 'should have default change origin');
    test.equal(proxies[0].config.xforward, false, 'should have default xforward');
    test.equal(proxies[0].config.ws, false, 'should have default ws to false');

    test.done();
  },
  full_options: function(test) {
    test.expect(13);
    var proxies = utils.proxies();

    test.equal(proxies.length, 5, 'should return five valid proxies');
    test.notEqual(proxies[1].server, null, 'server should be configured');
    test.equal(proxies[1].config.context, '/full', 'should have context set from config');
    test.equal(proxies[1].config.host, 'www.full.com', 'should have host set from config');
    test.equal(proxies[1].config.port, 8080, 'should have port set from config');
    test.equal(proxies[1].config.https, true, 'should have http set from config');
    test.equal(proxies[1].config.rejectUnauthorized, true, 'should have reject unauthorized set from config');
    test.equal(proxies[1].config.changeOrigin, true, 'should have change origin set from config');
    test.equal(proxies[1].config.xforward, true, 'should have xforward set from config');
    test.equal(proxies[1].config.ws, true, 'should have ws set from config');
    test.deepEqual(proxies[1].config.rewrite, { '^/full': '/anothercontext' }, 'should have rewrite set from config');
    test.equal(proxies[1].config.rules.length, 1, 'rules array should have an item');
    test.deepEqual(proxies[1].config.rules[0], { from: new RegExp('^/full'), to: '/anothercontext'}, 'rules object should be converted to regex');

    test.done();
  },

  two_rewrites: function(test) {
    test.expect(2);
    var config = utils.proxies()[2].config;
    test.equal(config.rules.length, 2, 'rules array should have two items');
    test.deepEqual(config.rewrite, { '^/context': '/anothercontext', 'test': 'testing' }, 'should have rewrite set from config');

    test.done();
  },

  invalid_configs: function(test) {
    test.expect(5);
    var proxies = utils.proxies();

    test.equal(proxies.length, 5, 'should not add the 2 invalid proxies');
    test.notEqual(proxies[0].config.context, '/missinghost', 'should not have context set from config with missing host');
    test.notEqual(proxies[0].config.host, 'www.missingcontext.com', 'should not have host set from config with missing context');
    test.notEqual(proxies[1].config.context, '/missinghost', 'should not have context set from config with missing host');
    test.notEqual(proxies[1].config.host, 'www.missingcontext.com', 'should not have host set from config with missing context');
    test.done();
  },

  invalid_rewrite: function(test) {
    test.expect(3);
    var proxies = utils.proxies();
    test.equal(proxies.length, 5, 'proxies should still be valid');
    test.equal(proxies[3].config.rules.length, 1, 'rules array should have one valid item');
    test.deepEqual(proxies[3].config.rules[0], { from: new RegExp('^/in'), to: '/thisis'}, 'rules object should be converted to regex');

    test.done();
  }
};
