/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
define([
    'promise',
    './utils',
    './frameWorker',
    './transport'
], function (Promise, utils, FrameWorker, Transport) {
    var Tracker = function (/**tracker*/tracker) {
        var self = this;
        var ready = false;
        var stack = [];
        var requests = [];
        var worker = null;
        var transport = null;
        var requireReload = false;
        var connectRe = null;
        var prepareConnect = function (connect) {
            connect = connect || [];
            var connectRe = [];
            connect.forEach(function (patter) {
                try {
                    connectRe.push(utils.urlPatternToStrRe(patter));
                } catch (e) {
                    console.error('Connect pattern error!', tracker.id, patter, e);
                }
            });
            if (!connectRe.length) {
                return null;
            }
            return new RegExp(connectRe.join('|'), 'i');
        };
        var load = function (onReady) {
            connectRe = prepareConnect(tracker.meta.connect);
            worker = new FrameWorker(tracker.id);
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
                    if (typeof msg.details !== 'object') {
                        msg.details = {url: msg.details};
                    }

                    if (!connectRe || !connectRe.test(msg.details.url)) {
                        console.error('Connection is not allowed!', msg.details.url, 'Add url patter in @connect!');
                        return response({
                            error: {
                                name: 'Error',
                                message: 'Connection is not allowed!'
                            }
                        });
                    }

                    var request = utils.request(msg.details, function (err, resp) {
                        var pos = requests.indexOf(requestWrapper);
                        if (pos !== -1) {
                            requests.splice(pos, 1);
                        }
                        requestWrapper = null;

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
                    var requestWrapper = {
                        abort: function () {
                            response({
                                error: {
                                    name: 'Error',
                                    message: 'ABORT'
                                }
                            });
                            request.abort();
                        }
                    };
                    requestWrapper && requests.push(requestWrapper);
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
            self.destroy();
            self.load();
        };
        this.safeReload = function () {
            requireReload = true;
        };
        this.destroy = function () {
            requireReload = false;
            self.loaded = false;
            ready = false;
            transport = null;
            worker.terminate();
            worker = null;
            self.abort();
        };
        this.search = function (query, cb) {
            if (requireReload) {
                self.reload();
            }

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
        this.load = function () {
            self.loaded = true;
            load(onReady);
        };
    };
    return Tracker;
});