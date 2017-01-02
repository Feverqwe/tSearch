/**
 * Created by Anton on 02.01.2017.
 */
"use strict";
(function (Transport, runCode) {
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
        console.error('worker', msg);
    });

    sendMessage({action: 'init'}, function (response) {
        runCode(response);
    });


})(function (transport) {
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
}, function (code) {
    eval(code);
});