/**
 * Created by Anton on 02.01.2017.
 */
"use strict";
require.config({
    baseUrl: './js',
    paths: {
        jquery: './min/jquery-3.1.1.min'
    }
});
require(['./min/promise.min'], function (Promise) {
    (function (runCode) {
        var Transport = function (transport) {
            var emptyFn = function () {
            };
            var onceFn = function (cb, scope) {
                return function () {
                    if (cb) {
                        var context = scope || this;
                        cb.apply(context, arguments);
                        cb = null;
                    }
                };
            };

            var callbackId = 0;
            var callbackIdCallback = {};

            this.onMessage = function (cb) {
                transport.onMessage(function (msg) {
                    if (msg.responseId) {
                        return callbackIdCallback[msg.responseId](msg.message);
                    }

                    var response;
                    if (msg.callbackId) {
                        response = onceFn(function (message) {
                            transport.sendMessage({
                                responseId: msg.callbackId,
                                message: message
                            });
                        });
                    } else {
                        response = emptyFn;
                    }
                    var result = cb(msg.message, response);
                    if (result !== true) {
                        response();
                    }
                });
            };
            this.sendMessage = function (message, callback) {
                var msg = {
                    message: message
                };
                if (callback) {
                    msg.callbackId = ++callbackId;
                    callbackIdCallback[msg.callbackId] = function (message) {
                        delete callbackIdCallback[msg.callbackId];
                        callback(message);
                    };
                }
                transport.sendMessage(msg);
            };
        };
        var transport = new Transport({
            sendMessage: function (msg) {
                parent.postMessage(msg, '*');
            },
            onMessage: function (cb) {
                window.onmessage = function (e) {
                    if (e.source === parent) {
                        cb(e.data);
                    }
                };
            }
        });
        var onMessage = transport.onMessage;
        var sendMessage = transport.sendMessage;

        onMessage(function (msg, response) {
            if (msg.event) {
                var fn = events[msg.event];
                if (fn) {
                    fn(msg).then(response).catch(function (err) {
                        response({success: false, error: 'exception', name: err.name, message: err.message});
                        throw err;
                    });
                    return true;
                }
            }
            console.error('worker', msg);
        });

        sendMessage({action: 'init'}, function (response) {
            var code = response.code;
            var requireList = response.require;

            require(requireList, function () {
                new Promise(function (resolve) {
                    resolve(runCode(code));
                }).then(function () {
                    sendMessage({action: 'ready'});
                }).catch(function (e) {
                    sendMessage({
                        action: 'error',
                        message: e.message,
                        name: e.name,
                        stack: e.stack
                    });
                    throw e;
                });
            });
        });

        var events = {};
        window.API_event = function (name, callback) {
            events[name] = function (query) {
                return new Promise(function (resolve) {
                    resolve(callback(query));
                });
            };
        };
        window.API_request = function (details) {
            return new Promise(function (resolve, reject) {
                sendMessage({action: 'request', details: details}, function (result) {
                    var err = result.error;
                    var response = result.response;
                    if (err) {
                        var error = new Error(err.message);
                        error.name = err.name;
                        reject(error);
                    } else {
                        resolve(response);
                    }
                });
            });
        };
        window.API_getDom = function (html) {
            var fragment = document.createDocumentFragment();
            var div = document.createElement('html');
            div.innerHTML = html;
            var el;
            while (el = div.firstChild) {
                fragment.appendChild(el);
            }
            return fragment;
        };

        var parseUrl = function (pageUrl) {
            var pathname = /([^#?]+)/.exec(pageUrl)[1];
            var path = /(.+:\/\/.*)\//.exec(pathname);
            if (path) {
                path = path[1];
            } else {
                path = pageUrl;
            }
            path += '/';
            return {
                protocol: /(.+:)\/\//.exec(pathname)[1],
                origin: /(.+:\/\/[^\/]+)/.exec(pathname)[1],
                path: path,
                pathname: pathname
            };
        };
        var urlParseCache = {};
        window.API_normalizeUrl = function (pageUrl, value) {
            if (/^magnet:/.test(value)) {
                return value;
            }
            if (/^http/.test(value)) {
                return value;
            }

            var parsedUrl = urlParseCache[pageUrl];
            if (!parsedUrl) {
                parsedUrl = urlParseCache[pageUrl] = parseUrl(pageUrl)
            }

            if (/^\/\//.test(value)) {
                return parsedUrl.protocol + value;
            }
            if (/^\//.test(value)) {
                return parsedUrl.origin + value;
            }
            if (/^\.\//.test(value)) {
                return parsedUrl.path + value.substr(2);
            }
            if (/^\?/.test(value)) {
                return parsedUrl.pathname + value;
            }
            return parsedUrl.path + value;
        };
    })(function (requires, code) {
        eval(code);
    });
});