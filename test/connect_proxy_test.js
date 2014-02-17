'use strict';

var grunt = require('grunt');
var _ = require('lodash');

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

    test.equal(proxies.length, 7, 'should return seven valid proxies');
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
    test.expect(14);
    var proxies = utils.proxies();

    test.equal(proxies.length, 7, 'should return seven valid proxies');
    test.notEqual(proxies[1].server, null, 'server should be configured');
    test.equal(proxies[1].config.context, '/full', 'should have context set from config');
    test.equal(proxies[1].config.host, 'www.full.com', 'should have host set from config');
    test.equal(proxies[1].config.port, 8080, 'should have port set from config');
    test.equal(proxies[1].config.https, true, 'should have http set from config');
    test.equal(proxies[1].config.rejectUnauthorized, true, 'should have reject unauthorized set from config');
    test.equal(proxies[1].config.changeOrigin, true, 'should have change origin set from config');
    test.equal(proxies[1].config.xforward, true, 'should have xforward set from config');
    test.equal(proxies[1].config.ws, true, 'should have ws set from config');
    test.deepEqual(proxies[1].config.rewrite[0].from, new RegExp('^/full'), 'should have rewrite set from config');
    test.equal(proxies[1].config.rewrite[0].to, '/anothercontext', 'should have rewrite set from config');
    test.equal(proxies[1].config.rules.length, 1, 'rules array should have an item');
    test.deepEqual(proxies[1].config.rules[0].from, new RegExp('^/full'), 'rules object should be converted to regex');

    test.done();
  },

  two_rewrites: function(test) {
    test.expect(5);
    var config = utils.proxies()[2].config;
    test.equal(config.rules.length, 2, 'rules array should have two items');
    test.deepEqual(config.rewrite[0].from, new RegExp('^/context'), 'should have rewrite set from config');
    test.equal(config.rewrite[0].to, '/anothercontext', 'should have rewrite set from config');
    test.deepEqual(config.rewrite[1].from, new RegExp('test'), 'should have rewrite set from config');
    test.equal(config.rewrite[1].to, 'testing', 'should have rewrite set from config');

    test.done();
  },

  invalid_configs: function(test) {
    test.expect(5);
    var proxies = utils.proxies();

    test.equal(proxies.length, 7, 'should not add the 2 invalid proxies');
    test.notEqual(proxies[0].config.context, '/missinghost', 'should not have context set from config with missing host');
    test.notEqual(proxies[0].config.host, 'www.missingcontext.com', 'should not have host set from config with missing context');
    test.notEqual(proxies[1].config.context, '/missinghost', 'should not have context set from config with missing host');
    test.notEqual(proxies[1].config.host, 'www.missingcontext.com', 'should not have host set from config with missing context');
    test.done();
  },

  invalid_rewrite: function(test) {
    test.expect(3);
    var proxies = utils.proxies();
    test.equal(proxies.length, 7, 'proxies should still be valid');
    test.equal(proxies[3].config.rules.length, 1, 'rules array should have one valid item');
    test.deepEqual(proxies[3].config.rules[0].from, new RegExp('^/in'), 'rules object should be converted to regex');

    test.done();
  },

  old_rewrite_syntax: function(test) {
    test.expect(4);
    var config = utils.proxies()[5].config;
    test.equal(_.isArray(config.rewrite), false, 'should have set rewrite with old syntax');
    test.equal(config.rules.length, 1, 'should parse old context rewrite syntax');
    test.deepEqual(config.rules[0].from, new RegExp('^/context'), 'should parse old context rewrite syntax');
    test.equal(config.rules[0].to, '/oldsyntax', 'should parse old context rewrite syntax');

    test.done();
  },

  cookie_path_rewrite: function(test) {
    test.expect(2);
    var config = utils.proxies()[6].config;
    test.equal(config.rules.length, 1, 'rules array should have one valid item');
    test.equal(config.rules[0].path, '/path', 'should have cookie path rewrite config');

    test.done();
  }
};
