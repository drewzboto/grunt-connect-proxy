'use strict';
var utils = module.exports;
var httpProxy = require('http-proxy');
var grunt = require('grunt');
var _ = require('lodash');
var proxies = [];
var rewrite = function (req, res) {
    return function (rule) {
        rule.rewrite(req, res);
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

utils.rewriteContext = function(from, to) {

    var rule = {
        from: from,
        to: to,
        rewrite: function(req, res) {
            if (rule.from.test(req.url)) {
                req.url = req.url.replace(rule.from, rule.to);
            }
        }
    };

    if (utils.validateRewrite(rule)) {
        rule.from = new RegExp(rule.from);
        return rule;
    }

    return null;
};

utils.rewriteCookiePath = function(path) {

    var rule = {
        path: path,
        rewrite: function(req, res) {
            if(res) {
                var _setHeader = res.setHeader.bind(res);
                res.setHeader = function(name, value) {
                    if (name && value && name.toLowerCase() === 'set-cookie') {
                        var fixedCookie = value.toString().replace(/Path=([^;]*)(;|$)/gi, function(match, path, end){
                            return 'Path=' + rule.path + end;
                        });
                        return _setHeader('Set-Cookie', fixedCookie);
                    } else {
                        return _setHeader(name, value);
                    }
                };
            }
        }
    };

    return rule;
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
    // Support for old context rewrite syntax
    if(!_.isArray(rewrites)) {
        var rewriteArray = [];

        Object.keys(rewrites || {}).forEach(function (from) {
            rewriteArray.push(utils.rewriteContext(from, rewrites[from]));
        });

        rewrites = rewriteArray;
    }

    return _.compact(rewrites);
};

utils.matchContext = function(context, url) {
    var positiveContexts, negativeContexts, positiveMatch, negativeMatch;
    var contexts = context;
    if (!_.isArray(contexts)) {
        contexts = [contexts];
    }
    positiveContexts = _.filter(contexts, function(c){return c.charAt(0) !== '!';});
    negativeContexts = _.filter(contexts, function(c){return c.charAt(0) === '!';});
    // Remove the '!' character from the contexts
    negativeContexts = _.map(negativeContexts, function(c){return c.slice(1);});
    negativeMatch = _.find(negativeContexts, function(c){return url.lastIndexOf(c, 0) === 0;});
    // If any context negates this url, it must not be proxied.
    if (negativeMatch) {
        return false;
    }
    positiveMatch = _.find(positiveContexts, function(c){return url.lastIndexOf(c, 0) === 0;});
    // If there is any positive match, lets proxy this url.
    return positiveMatch != null;
};

function onUpgrade(req, socket, head) {
    var proxied = false;

    proxies.forEach(function(proxy) {
        if (!proxied && req && proxy.config.ws && utils.matchContext(proxy.config.context, req.url)) {
            if (proxy.config.rules.length) {
                proxy.config.rules.forEach(rewrite(req));
            }
            proxy.server.proxyWebSocketRequest(req, socket, head);

            proxied = true;

            var source = req.url;
            var target = (proxy.server.target.https ? 'wss://' : 'ws://') + proxy.server.target.host + ':' + proxy.server.target.port + req.url;
            grunt.log.verbose.writeln('[WS] Proxied request: ' + source + ' -> ' + target + '\n' + JSON.stringify(req.headers, true, 2));
        }
    });
}

//Listen for the update event,onces. grunt-contrib-connect doesnt expose the server object, so bind after the first req
function enableWebsocket(server) {
    if (server && !server.proxyWs) {
        server.proxyWs = true;
        grunt.log.verbose.writeln('[WS] Catching upgrade event...');
        server.on('upgrade', onUpgrade);
    }
}

utils.proxyRequest = function (req, res, next) {
    var proxied = false;

    enableWebsocket(req.connection.server);

    proxies.forEach(function(proxy) {
        if (!proxied && req && utils.matchContext(proxy.config.context, req.url)) {
            if (proxy.config.rules.length) {
                proxy.config.rules.forEach(rewrite(req, res));
            }
            // Add headers present in the config object
            if (proxy.config.headers != null) {
                _.forOwn(proxy.config.headers, function(value, key) {
                    req.headers[key] = value;
                });
            }
            proxy.server.proxyRequest(req, res);
            // proxying twice would cause the writing to a response header that is already sent. Bad config!
            proxied = true;

            var source = req.originalUrl;
            var target = (proxy.server.target.https ? 'https://' : 'http://') + proxy.server.target.host + ':' + proxy.server.target.port + req.url;
            grunt.log.verbose.writeln('Proxied request: ' + source + ' -> ' + target + '\n' + JSON.stringify(req.headers, true, 2));
        }
    });
    if (!proxied) {
        next();
    }
};
