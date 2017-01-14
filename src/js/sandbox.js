/**
 * Created by Anton on 02.01.2017.
 */
"use strict";
require.config({
    baseUrl: './js',
    paths: {
        promise: './lib/promise.min',
        jquery: './lib/jquery-3.1.1.min',
        moment: './lib/moment-with-locales.min',
        baseApi: './module/baseApi',
        exKit: './module/exKit'
    }
});
require([
    'promise',
    './module/transport',
    'baseApi'
], function (Promise, Transport) {
    (function (runCode) {
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
                        if (err.message !== 'ABORT') {
                            throw err;
                        }
                    });
                    return true;
                }
            }
            console.error('worker', msg);
        });

        sendMessage({action: 'init'}, function (response) {
            if (!response) {
                throw  new Error("API response is empty")
            }

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
                    if (!result) {
                        throw new Error("API response is empty")
                    }

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
    })(function (code) {
        return eval(code);
    });
});