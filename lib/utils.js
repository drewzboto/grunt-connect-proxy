'use strict';
var utils = module.exports;
var httpProxy = require('http-proxy');
var proxies = [];
var rewrite = function (req) {
    return function (rule) {
        if (rule.from.test(req.url)) {
            req.url = req.url.replace(rule.from, rule.to);
        }
    };
};

utils.registerProxy = function(proxy) {
    proxies.push(proxy);
};

utils.proxies = function() {
    return proxies;
}

utils.reset = function() {
    proxies = [];
}

utils.validateRewrite = function (rule) {
    if (!rule || 
        typeof rule.from === 'undefined' ||
        typeof rule.to === 'undefined' ||
        typeof rule.from !== 'string' ||
        typeof rule.to !== 'string') {
        return false;
    }
    return true;
}

utils.processRewrites = function (rewrites, gruntlog) {
    var rules = [];

    Object.keys(rewrites || {}).forEach(function (from) {
        var rule = {
            from: from,
            to: rewrites[from]
        };

        if (utils.validateRewrite(rule)) {
            rule.from = new RegExp(rule.from);
            rules.push(rule);
            gruntlog.writeln('Rewrite rule created for: [' + rule.from + ' -> ' + rule.to + '].');
        } else {
            gruntlog.error('Invalid rule');
        }
    });

    return rules;
};

utils.proxyRequest = function (req, res, next) {
    var proxied = false;

    proxies.forEach(function(proxy) {
        if (!proxied && req && req.url.lastIndexOf(proxy.config.context, 0) === 0) {
            if (proxy.config.rules.length) {
                proxy.config.rules.forEach(rewrite(req));
            }
            proxy.server.proxyRequest(req, res);
            // proxying twice would cause the writing to a response header that is already sent. Bad config!
            proxied = true;
        }
    });
    if (!proxied) {
        next();
    }
};
