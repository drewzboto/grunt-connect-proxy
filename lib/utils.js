'use strict';
var utils = module.exports;
var httpProxy = require('http-proxy');
var grunt = require('grunt');
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
        (typeof rule.to !== 'string' && typeof rule.to !== 'function')) {
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
            grunt.log.writeln('Rewrite rule created for: [' + rule.from + ' -> ' + rule.to + '].');
        } else {
            grunt.log.error('Invalid rule');
        }
    });

    return rules;
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

utils.matchContextAndProxyContext = function(proxy, req){
    var positiveMatch = req && utils.matchContext(proxy.config.context, req.url);

    if(typeof proxy.config.matchContext === 'function'){
        positiveMatch = positiveMatch && proxy.config.matchContext(req);
    }

    return positiveMatch;
};

utils.getTargetUrl = function(options){
    var protocol = options.ws ? 'ws' : 'http';
    if(options.https) {
        protocol += 's';
    }

    var target = protocol + '://' + options.host;
    var standardPort = (options.port === 80 && !options.https) || (options.port === 443 && options.https);

    if(!standardPort){
        target += ':' + options.port;
    }
    return target;
};

function onUpgrade(req, socket, head) {
    var proxied = false;

    proxies.forEach(function(proxy) {
        if (!proxied && proxy.config.ws && utils.matchContextAndProxyContext(proxy, req)) {
            if (proxy.config.rules.length) {
                proxy.config.rules.forEach(rewrite(req));
            }
            proxy.server.ws(req, socket, head);

            proxied = true;

            var source = req.url;
            var target = utils.getTargetUrl(proxy.config) + req.url;
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

function removeHiddenHeaders(proxy) {
    var hiddenHeaders = proxy.config.hideHeaders;

    if(hiddenHeaders && hiddenHeaders.length > 0) {
        hiddenHeaders = hiddenHeaders.map(function(header) {
          return header.toLowerCase();
        });

        proxy.server.on('proxyRes', function(proxyRes) {
            var headers = proxyRes.headers;
            hiddenHeaders.forEach(function(header) {
                if(header in headers) {
                    delete headers[header];
                }
            });
        });
    }
}

utils.proxyRequest = function (req, res, next) {
    var proxied = false;

    enableWebsocket(req.connection.server);

    proxies.forEach(function(proxy) {
        if (!proxied && utils.matchContextAndProxyContext(proxy, req)) {
            if (proxy.config.rules.length) {
                proxy.config.rules.forEach(rewrite(req));
            }
            // Add headers present in the config object
            if (proxy.config.headers != null) {
                _.forOwn(proxy.config.headers, function(value, key) {
                    req.headers[key] = value;
                });
            }

            proxy.server.proxyRequest(req, res, proxy.server, function(err) {
                if (proxy.config.errorHandler) {
                    grunt.log.verbose.writeln('Request failed. Skipping to next midleware.');
                    proxy.config.errorHandler(req, res, next, err);
                }
            });
            removeHiddenHeaders(proxy);

            // proxying twice would cause the writing to a response header that is already sent. Bad config!
            proxied = true;

            var source = req.originalUrl;
            var target = utils.getTargetUrl(proxy.config) + req.url;
            grunt.log.verbose.writeln('Proxied request: ' + source + ' -> ' + target + '\n' + JSON.stringify(req.headers, true, 2));
        }
    });
    if (!proxied) {
        next();
    }
};
