'use strict';

var utils = require("../lib/utils.js");

exports.server4_proxy_test = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  proxy_options_test: function(test) {
    test.expect(4);
    var proxies = utils.proxies();

    test.equal(proxies.length, 1, 'should have just one proxy');
    test.notEqual(proxies[0].server, null, 'server should be configured');
    test.deepEqual(proxies[0].config.context, {'alternate.localhost': '/'}, 'should have context domain:url object set from config');
    test.equal(proxies[0].config.host, 'www.server4.com', 'should have host set from config');

    test.done();
  },

  subdomain_proxy: function(test) {
    test.expect(2);

    var proxies = utils.proxies();
    var req = {
      headers: {
        host: 'alternate.localhost.com'
      },
      url: '/some/url'
    };
    var res = {};
    var next = function () {};

    var origProxyRequest = proxies[0].server.proxyRequest;
    proxies[0].server.proxyRequest = function (req, res) {
      test.equal(this.target.host, 'www.server4.com');
      test.equal(req.url, '/some/url');
      test.done();
    };
    utils.proxyRequest(req, res, next);

    proxies[0].server.proxyRequest = origProxyRequest;
  },

  subdomain_doesnt_match: function(test) {
    test.expect(0);

    var req = {
      headers: {
        host: 'localhost'
      },
      url: '/some/url'
    };
    var res = {};
    var next = function () {
      test.done();
    };

    utils.proxyRequest(req, res, next);
  }
};
