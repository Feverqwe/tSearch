/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
define([
    '../lib/promise.min',
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
        var load = function (onReady) {
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


        var getContent = function (url) {
            utils.request({
                url: url
            }, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    resolve(response.data);
                }
            });
        };
        var checkUpdate = function () {
            return getContent(tracker.meta.updateURL).then(function (data) {
                var meta = utils.parseMeta(data);
                var version = tracker.meta.version;
                var result;
                if (utils.isNewVersion(meta.version, version)) {
                    result = getContent(tracker.meta.downloadURL).then(function (data) {
                        var meta = utils.parseMeta(data);
                        if (utils.isNewVersion(meta.version, version)) {
                            tracker.meta = meta;
                            tracker.code = data;
                            tracker.info.lastUpdate = parseInt(Date.now() / 1000);
                            return {
                                success: true,
                                previewVersion: version,
                                version: meta.version
                            };
                        } else {
                            result = {
                                success: false,
                                message: 'ACTUAL',
                                version: meta.version
                            };
                        }
                    });
                } else {
                    result = {
                        success: false,
                        message: 'ACTUAL',
                        version: meta.version
                    };
                }
                return result;
            });
        };
        this.update = function (force) {
            return Promise.resolve().then(function () {
                var now = parseInt(Date.now() / 1000);
                var updateURL = tracker.meta.updateURL;
                var lastUpdate = tracker.info.lastUpdate || 0;
                if (updateURL && (now - lastUpdate > 24 * 60 * 60 || force)) {
                    return checkUpdate();
                } else {
                    return {
                        success: false,
                        message: 'TIMEOUT'
                    };
                }
            });
        };
        load(onReady);
    };
    return Tracker;
});