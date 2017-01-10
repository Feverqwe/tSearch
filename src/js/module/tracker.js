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
        var reloadRequierd = false;
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
            self.destroy();
            load(onReady);
        };
        this.destroy = function () {
            ready = false;
            worker.terminate();
            self.abort();
        };
        this.search = function (query, cb) {
            if (reloadRequierd) {
                reloadRequierd = false;
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


        var updateRequest = null;
        var getContent = function (url) {
            return new Promise(function (resolve, reject) {
                if (updateRequest) {
                    updateRequest.abort();
                }
                updateRequest = utils.request({
                    url: url
                }, function (err, response) {
                    updateRequest = null;
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.body);
                    }
                });
            });
        };
        var checkVersion = function (url) {
            return getContent(url).then(function (body) {
                var meta = utils.parseMeta(body);
                var version = tracker.meta.version;
                if (!utils.isNewVersion(meta.version, version)) {
                    throw new Error('C_ACTUAL');
                }
                return {
                    previewVersion: version,
                    version: meta.version,
                    meta: meta,
                    body: body
                };
            });
        };
        var checkUpdate = function () {
            var promise = Promise.resolve();
            if (tracker.meta.updateURL) {
                promise = promise.then(function () {
                    return checkVersion(tracker.meta.updateURL);
                });
            }
            return promise.then(function () {
                return checkVersion(tracker.meta.downloadURL);
            }).then(function (result) {
                tracker.meta = result.meta;
                tracker.code = result.body;
                tracker.info.lastUpdate = parseInt(Date.now() / 1000);
                return {
                    previewVersion: result.previewVersion,
                    version: result.version
                }
            });
        };

        this.update = function (force) {
            return Promise.resolve().then(function () {
                if (!tracker.meta.downloadURL) {
                    throw new Error('C_UNAVAILABLE');
                }
                var now = parseInt(Date.now() / 1000);
                var lastUpdate = tracker.info.lastUpdate || 0;
                if (now - lastUpdate > 24 * 60 * 60 || force) {
                    return checkUpdate();
                } else {
                    throw new Error('C_TIMEOUT');
                }
            }).then(function (result) {
                reloadRequierd = true;
                return {success: true, result: result};
            }).catch(function (err) {
                if (err.message === 'C_UNAVAILABLE') {
                    return {success: false, message: 'UNAVAILABLE'};
                } else
                if (err.message === 'C_TIMEOUT') {
                    return {success: false, message: 'TIMEOUT'};
                } else
                if (err.message === 'C_ACTUAL') {
                    return {success: false, message: 'ACTUAL'};
                } else {
                    console.error('Update error', tracker.id, err);
                    return {success: false, message: 'ERROR'};
                }
            });
        };
        load(onReady);
    };
    return Tracker;
});