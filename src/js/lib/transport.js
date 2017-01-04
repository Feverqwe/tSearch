/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
define(function () {
    var emptyFn = function () {};
    var onceFn = function (cb) {
        return function () {
            if (cb) {
                cb.apply(null, arguments);
                cb = null;
            }
        };
    };

    var Transport = function (transport) {
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

    return Transport;
});