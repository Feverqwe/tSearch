/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
define([
    './utils',
    './frameWorker',
    './transport'
], function (utils, FrameWorker, Transport) {
    var Tracker = function (/**tracker*/tracker) {
        var self = this;
        var ready = false;
        var stack = [];
        var requests = [];
        var worker = null;
        var transport = null;
        var load = function (onReady) {
            worker = new FrameWorker();
            transport = new Transport({
                sendMessage: function (msg) {
                    worker.postMessage(msg);
                },
                onMessage: function (cb) {
                    worker.onmessage = function (data) {
                        cb(data);
                    }
                }
            });
            transport.onMessage(function (msg, response) {
                if (msg.action === 'init') {
                    response({
                        code: tracker.code,
                        require: tracker.meta.require || []
                    });
                } else
                if (msg.action === 'ready') {
                    onReady();
                } else
                if (msg.action === 'request') {
                    var request = utils.request(msg.details, function (err, resp) {
                        var pos = requests.indexOf(request);
                        if (pos !== -1) {
                            requests.splice(pos, 1);
                        }
                        request = null;

                        var error = null;
                        if (err) {
                            error = {
                                name: err.name,
                                message: err.message
                            };
                        }
                        response({
                            error: error,
                            response: resp
                        });
                    });
                    request && requests.push(request);
                    return true;
                } else
                if (msg.action === 'error') {
                    console.error(tracker.id, 'Loading error!', msg.name + ':', msg.message);
                } else {
                    console.error(tracker.id, 'msg', msg);
                }
            });
        };
        var onReady = function () {
            ready = true;
            while (stack.length) {
                self.sendMessage.apply(null, stack.shift());
            }
        };
        this.id = tracker.id;
        this.sendMessage = function (message, callback) {
            if (ready) {
                transport.sendMessage(message, callback);
            } else {
                stack.push([message, callback]);
            }
        };
        this.reload = function () {
            worker.terminate();
            load(onReady);
        };
        this.destroy = function () {
            ready = false;
            worker.terminate();
            self.abort();
        };
        this.search = function (query, cb) {
            self.sendMessage({
                event: 'search',
                query: query
            }, cb);
        };
        this.abort = function () {
            requests.splice(0).forEach(function (request) {
                request.abort();
            });
        };
        load(onReady);
    };
    return Tracker;
});