'use strict';
var utils = module.exports;
var httpProxy = require('http-proxy');
var _ = require('lodash');
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
};

utils.reset = function() {
    proxies = [];
};

utils.validateRewrite = function (rule) {
    if (!rule ||
        typeof rule.from === 'undefined' ||
        typeof rule.to === 'undefined' ||
        typeof rule.from !== 'string' ||
        typeof rule.to !== 'string') {
        return false;
    }
    return true;
};

utils.processRewrites = function (rewrites) {
    var rules = [];

    Object.keys(rewrites || {}).forEach(function (from) {
        var rule = {
            from: from,
            to: rewrites[from]
        };

        if (utils.validateRewrite(rule)) {
            rule.from = new RegExp(rule.from);
            rules.push(rule);
            utils.log.writeln('Rewrite rule created for: [' + rule.from + ' -> ' + rule.to + '].');
        } else {
            utils.log.error('Invalid rule');
        }
    });

    return rules;
};

utils.matchContext = function(context, url) {
    var contexts = context;
    var matched = false;
    if (!_.isArray(contexts)) {
        contexts = [contexts];
    }
    contexts.forEach(function(testContext) {
        if (url.lastIndexOf(testContext, 0) === 0) {
            matched = true;
        }
    });
    return matched;
};

utils.proxyRequest = function (req, res, next) {
    var proxied = false;

    proxies.forEach(function(proxy) {
        if (!proxied && req && utils.matchContext(proxy.config.context, req.url)) {
            if (proxy.config.rules.length) {
                proxy.config.rules.forEach(rewrite(req));
            }

            if(proxy.config.rewriteCookiePath) {
                var _setHeader = res.setHeader.bind(res);
                res.setHeader = function(name, value) {
                    if (name && value && name.toLowerCase() === 'set-cookie') {
                        var fixedCookie = value.toString().replace(/Path=([^;]*)(;|$)/gi, function(match, path, end){
                            return 'Path=' + proxy.config.rewriteCookiePath + end;
                        });
                        return _setHeader('Set-Cookie', fixedCookie);
                    } else {
                        return _setHeader(name, value);
                    }
                };
            }

            proxy.server.proxyRequest(req, res);
            // proxying twice would cause the writing to a response header that is already sent. Bad config!
            proxied = true;

            var source = req.originalUrl;
            var target = (proxy.server.target.https ? 'https://' : 'http://') + proxy.server.target.host + ':' + proxy.server.target.port + req.url;
            utils.log.verbose.writeln('Proxied request: ' + source + ' -> ' + target + '\n' + JSON.stringify(req.headers, true, 2));
        }
    });
    if (!proxied) {
        next();
    }
};
