var utils = require("../lib/utils.js");

exports.utils_test = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  match_context_test: function(test) {
    var singleContext, arrayContext, url, match;
    test.expect(6);

    singleContext = '/api';
    url = '/api/mock?suchrequest=1';
    match = utils.matchContext(singleContext, url);
    test.equal(match, true, 'should match single context with matching start');

    url = '/notapi/mock?suchrequest=1';
    match = utils.matchContext(singleContext, url);
    test.equal(match, false, 'should not match single context with different start');

    arrayContext = ['/api', '/superapi'];
    url = '/superapi/mock?suchrequest=1';
    match = utils.matchContext(arrayContext, url);
    test.equal(match, true, 'should match array context with matching start');

    singleContext = '/api';
    url = '/api/mock/api';
    match = utils.matchContext(singleContext, url);
    test.equal(match, true, 'should match array context with matching start if same pattern is found later');

    arrayContext = ['/api', '/superapi', '!/superapi/not'];
    url = '/superapi/not/mock?suchrequest=1';
    match = utils.matchContext(arrayContext, url);
    test.equal(match, false, 'should not match array context with negative context');

    arrayContext = ['/api', '/superapi', '!/superapi/not'];
    url = '/superapi/yep/mock?suchrequest=1';
    match = utils.matchContext(arrayContext, url);
    test.equal(match, true, 'should match array context with different negative context');

    test.done();
  },

  get_target_url_test: function(test){
    var proxyOptions = {
        host: 'foo.com',
        https: true,
        port: 443,
        ws: false
    };

    test.expect(6);
    test.equal(utils.getTargetUrl(proxyOptions), 'https://foo.com');

    proxyOptions.https = false;
    proxyOptions.port = 80;
    test.equal(utils.getTargetUrl(proxyOptions), 'http://foo.com');

    proxyOptions.ws = true;
    test.equal(utils.getTargetUrl(proxyOptions), 'ws://foo.com');

    proxyOptions.https = true;
    proxyOptions.port = 443
    test.equal(utils.getTargetUrl(proxyOptions), 'wss://foo.com');

    proxyOptions.port = 8080;
    proxyOptions.ws = false;
    proxyOptions.https = false;
    test.equal(utils.getTargetUrl(proxyOptions), 'http://foo.com:8080');

    proxyOptions.port = 445;
    proxyOptions.ws = false;
    proxyOptions.https = true;
    test.equal(utils.getTargetUrl(proxyOptions), 'https://foo.com:445');

    test.done();
  }
};
