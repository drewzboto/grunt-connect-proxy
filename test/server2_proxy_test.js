var utils = require("../lib/utils.js");

exports.server2_proxy_test = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  proxy_options_test: function(test) {
    test.expect(11);
    var proxies = utils.proxies();

    test.equal(proxies.length, 6, 'should return six valid proxies');
    test.notEqual(proxies[0].server, null, 'server should be configured');
    test.equal(proxies[0].config.context, '/defaults', 'should have context set from config');
    test.equal(proxies[0].config.host, 'www.defaults.com', 'should have host set from config');
    test.equal(proxies[5].config.context, '/', 'should have context set from config');
    test.equal(proxies[5].config.host, 'www.server2.com', 'should have host set from config');
    test.equal(proxies[0].config.port, 80, 'should have default port 80');
    test.equal(proxies[0].config.https, false, 'should have default http');
    test.equal(proxies[0].config.changeOrigin, false, 'should have default change origin');
    test.equal(proxies[0].config.ws, false, 'should have default ws to false');
    test.equal(proxies[0].config.rules.length, 0, 'rules array should have zero items');

    test.done();
  }
}
