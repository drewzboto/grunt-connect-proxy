var utils = require("../lib/utils.js");

exports.keep_proxies_on_connect = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },

  proxy_options_test: function(test) {
    test.expect(11);

    var proxies = utils.proxies();

    test.equal(proxies.length, 2, 'should return two valid proxies');

    var checkProxyConfig = function(proxy, config){
      Object.keys(config).forEach(function(property){
        test.equal(proxy[property], config[property], 'should have ' + property + ' set from config');
      });
    };

    checkProxyConfig(proxies[0].config, {
      context: '/testServer1',
      host: 'localhost',
      port: 8080,
      https: false,
      ws: false
    });

    checkProxyConfig(proxies[1].config, {
      context: '/',
      host: 'localhost',
      port: 8081,
      https: false,
      ws: false
    });

    test.done();
  }
}
