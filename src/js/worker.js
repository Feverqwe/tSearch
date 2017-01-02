/**
 * Created by Anton on 02.01.2017.
 */
"use strict";
(function () {
    var Transport = function () {
        var emptyFn = function () {};
        var onceFn = function (cb, scope) {
            return function () {
                if (cb) {
                    var context = scope || this;
                    cb.apply(context, arguments);
                    cb = null;
                }
            };
        };
        var transport = {
            sendMessage: function (msg) {
                postMessage(msg);
            },
            onMessage: function (cb) {
                onmessage = function (e) {
                    cb(e.data);
                };
            }
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
    var transport = new Transport();
    var onMessage = transport.onMessage;
    var sendMessage = transport.sendMessage;

    onMessage(function (msg) {
        console.error('worker', msg);
    });
    sendMessage({action: 'init'}, function (code) {
        eval(code);
    });
})();