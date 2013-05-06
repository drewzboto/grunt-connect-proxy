'use strict';
var utils = module.exports;
var httpProxy = require('http-proxy');
var proxies = [];

utils.registerProxy = function(proxy) {
    proxies.push(proxy);
};

utils.proxies = function() {
    return proxies;
}

utils.reset = function() {
    proxies = [];
}

utils.proxyRequest = function (req, res, next) {
    var proxied = false;
    proxies.forEach(function(proxy) {
        if (!proxied && req && req.url.lastIndexOf(proxy.config.context, 0) === 0) {
            proxy.server.proxyRequest(req, res);
            // proxying twice would cause the writing to a response header that is already sent. Bad config!
            proxied = true;
        }
    });
    if (!proxied) {
        next();
    }
};
