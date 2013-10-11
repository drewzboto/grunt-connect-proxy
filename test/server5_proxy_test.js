'use strict';

var utils = require("../lib/utils.js");

exports.server5_proxy_test = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  proxy_options_test: function(test) {
    test.expect(3);
    var proxies = utils.proxies();

    test.notEqual(proxies[0].server, null, 'server should be configured');
    test.deepEqual(proxies[0].config.context, {'alternate.localhost': '/'},
      'should have context domain set from server setting');
    test.equal(proxies[0].config.host, 'www.server5.com', 'should have host set from config');

    test.done();
  }
};
