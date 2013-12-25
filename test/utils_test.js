var utils = require("../lib/utils.js");

exports.utils_test = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  match_context_test: function(test) {
    var singleContext, url, match;
    test.expect(1);

    singleContext = '/api';
    url = '/api/mock?suchrequest=1';
    match = utils.matchContext(singleContext, url);
    test.equal(match, true, 'should match single context with matching start');

    test.done();
  }
}
