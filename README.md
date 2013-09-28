# grunt-connect-proxy

> Provides a http proxy as middleware for the grunt-contrib-connect plugin. 

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-connect-proxy --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-connect-proxy');
```

## Adapting the  "connect" task

### Overview

#### Proxy Configuration
In your project's Gruntfile, add a section named `proxies` to your existing connect definition.

```js
grunt.initConfig({
    connect: {
            options: {
                port: 9000,
                hostname: 'localhost'
            },
            proxies: [
                {
                    context: '/cortex',
                    host: '10.10.2.202',
                    port: 8080,
                    https: false,
                    changeOrigin: false,
                    xforward: false
                }
            ]
        }
})
```
#### Adding the middleware

##### With Livereload
Expose the proxy function to use in the middleware, at the top of the Gruntfile:
```js
var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;
```

Add the middleware call from the connect option middleware hook
```js
        connect: {
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            proxySnippet
                        ];
                    }
                }
            }
        }
```

##### Without Livereload

It is possible to add the proxy middleware without Livereload as follows:

```js
   // server
    connect: {
      server: {
        options: {
          port: 8000,
          base: 'public',
          logger: 'dev',
          hostname: 'localhost',
          middleware: function (connect, options) {
             var config = [ // Serve static files.
                                 connect.static(options.base),
                                 // Make empty directories browsable.
                                 connect.directory(options.base)
                             ];
            var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
            config.unshift(proxy);
            return config;
          }
        }
      }
	  // ...
```

### Adding the configureProxy task to the server task
For the server task, add the configureProxies task before the connect task
```js
    grunt.registerTask('server', function (target) {
        grunt.task.run([
            'clean:server',
            'compass:server',
            'configureProxies',
            'livereload-start',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });
```


### Options
The available configuration options from a given proxy are generally the same as what is provided by the underlying [httpproxy](https://github.com/nodejitsu/node-http-proxy) library

#### options.context
Type: `String` or `Array`

The context(s) to match requests against. Matching requests will be proxied. Should start with /. Should not end with /
Multiple contexts can be matched for the same proxy rule via an array such as:
context: ['/api', 'otherapi'] 

#### options.host
Type: `String`

The host to proxy to. Should not start with the http/https protocol.

#### options.port
Type: `Number`
Default: 80

The port to proxy to. 

#### options.https
Type: `Boolean`
Default: false

Whether to proxy with https

#### options.changeOrigin
Type: `Boolean`
Default: false

Whether to change the origin on the request to the proxy, or keep the original origin.

#### options.rejectUnauthorized: 
Type: `Boolean`
Default: false

Whether to reject self-signed certificates when https: true is set. Defaults to accept self-signed certs since proxy is meant for development environments.

#### options.xforward: 
Type: `Boolean`
Default: false

Whether to add x-forward headers to the proxy request, such as
  "x-forwarded-for": "127.0.0.1",
  "x-forwarded-port": 50892,
  "x-forwarded-proto": "http"


#### options.appendProxies
Type: `Boolean`
Default: true

Set to false to isolate multi-task configuration proxy options from parent level instead of appending them.

#### options.rewrite
Type: `Object`

Allows rewrites of url (including context) when proxying. The object's keys serve as the regex used in the replacement operation. As an example the following proxy configuration will remove the context when proxying:

```js
proxies: [
    context: '/context',
    host: 'host',
    port: 8080,
    rewrite: {
        '^/removingcontext': '',
        '^/changingcontext': '/anothercontext'
    }
]
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

#### Multi-server proxy configuration

grunt-contrib-connect multi-server configuration is supported. You can define _proxies_ blocks in per-server options and refer to those blocks in task invocation.

```js
grunt.initConfig({
    connect: {
            options: {
                port: 9000,
                hostname: 'localhost'
            },
            server2: {
                proxies: [
                    {
                        context: '/cortex',
                        host: '10.10.2.202',
                        port: 8080,
                        https: false,
                        changeOrigin: false
                    }
                ]
            },
            server3: {
                appendProxies: false,
                proxies: [
                    {
                        context: '/api',
                        host: 'example.org'
                    }
                ]
            }
        }
})

grunt.registerTask('e2etest', function (target) {
    grunt.task.run([
        'configureProxies:server2',
        'open',
        'karma'
    ]);
});
```


## Release History
* 0.1.0 Initial release
* 0.1.1 Fix changeOrigin
* 0.1.2 Support multiple server definitions, bumped to grunt 0.4.1 (thanks to @lauripiispanen)
* 0.1.3 Bumped http-proxy dependency to 0.10.2
* 0.1.4 Added proxy rewrite support (thanks to @slawrence)
* 0.1.5 Default rejectUnauthorized to false to allow self-signed certificates over SSL
* 0.1.6 Add xforward option, added support for context arrays, added debug logging
