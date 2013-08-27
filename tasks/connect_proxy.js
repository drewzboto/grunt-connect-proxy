/*
 * grunt-connect-proxy
 * https://github.com/drewzboto/grunt-connect-proxy
 *
 * Copyright (c) 2013 Drewz
 * Licensed under the MIT license.
 */

'use strict';
var utils = require('../lib/utils');

module.exports = function(grunt) {
  grunt.registerTask('configureProxies', 'Configure any specified connect proxies.', function(config) {
    // setup proxy
    var _ = grunt.util._;
    var httpProxy = require('http-proxy');
    var proxyOption;
    var proxyOptions = [];
    utils.reset();
    if (config) {
        var connectOptions = grunt.config('connect.'+config) || [];
        if (typeof connectOptions.appendProxies === 'undefined' || connectOptions.appendProxies) {
            proxyOptions = proxyOptions.concat(grunt.config('connect.proxies') || []);
        }
        proxyOptions = proxyOptions.concat(connectOptions.proxies || []);
    } else {
        proxyOptions = proxyOptions.concat(grunt.config('connect.proxies') || []);
    }
    proxyOptions.forEach(function(proxy) {
        proxyOption = _.defaults(proxy,  {
            port: 80,
            https: false,
            changeOrigin: false,
            rejectUnauthorized: false,
            rules: []
        });
        if (_.isUndefined(proxyOption.host) || _.isUndefined(proxyOption.context)) {
            grunt.log.error('Proxy missing host or context configuration');
        } else {
            proxyOption.rules = utils.processRewrites(proxyOption.rewrite, grunt.log);
            utils.registerProxy({
              server: new httpProxy.HttpProxy({
                target: proxyOption,
                changeOrigin: proxyOption.changeOrigin
              }),
              config: proxyOption
            });
            grunt.log.writeln('Proxy created for: ' +  proxyOption.context);
            grunt.log.writeln('Proxy created to:  ' +  proxyOption.host + ':' + proxyOption.port);
        }
    });
  });
};
