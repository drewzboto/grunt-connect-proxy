var utils = require("../lib/utils.js");

exports.server3_proxy_test = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  proxy_options_test: function(test) {
    test.expect(9);
    var proxies = utils.proxies();

    test.equal(proxies.length, 1, 'should have just one proxy');
    test.notEqual(proxies[0].server, null, 'server should be configured');
    test.equal(proxies[0].config.context, '/server3', 'should have context set from config');
    test.equal(proxies[0].config.host, 'www.server3.com', 'should have host set from config');
    test.equal(proxies[0].config.port, 8080, 'should have port 8080');
    test.equal(proxies[0].config.https, false, 'should have default http');
    test.equal(proxies[0].config.changeOrigin, true, 'should have change origin from task');
    test.equal(proxies[0].config.ws, false, 'should have ws default to false');
    test.equal(proxies[0].config.rules.length, 0, 'rules array should have zero items');

    test.done();
  }
}
