/**
 * Created by Anton on 31.12.2016.
 */
"use strict";
require.config({
    baseUrl: './js'
});
require([
    './lib/promise.min',
    './module/utils'
], function (Promise, utils) {
    var changeIcon = function (storage, reset) {
        if (reset) {
            chrome.browserAction.setIcon({
                path: {
                    19: 'img/icon_19.png',
                    38: 'img/icon_38.png'
                }
            });
        }

        if (storage.invertIcon) {
            chrome.browserAction.setIcon({
                path: {
                    19: 'img/icon_19_i.png',
                    38: 'img/icon_38_i.png'
                }
            });
        }
    };

    var initContextMenuListener = function () {
        chrome.contextMenus.onClicked.addListener(function (info) {
            if (info.menuItemId === 'tms') {
                var request = info.selectionText;
                var params = request && '#' + utils.hashParam({
                        query: request
                    });
                chrome.tabs.create({
                    url: 'index.html' + params,
                    selected: true
                });
            }
        });
    };

    var changeContextMenu = function (storage) {
        chrome.contextMenus.removeAll(function () {
            if (storage.contextMenu) {
                chrome.contextMenus.create({
                    type: "normal",
                    id: "tms",
                    title: chrome.i18n.getMessage('contextMenuTitle'),
                    contexts: ["selection"]
                });
            }
        });
    };

    var initBrowserActionListener = function () {
        chrome.browserAction.onClicked.addListener(function () {
            chrome.tabs.create({
                url: 'index.html'
            });
        });
    };

    var changeBrowserAction = function (storage, reset) {
        if (reset) {
            chrome.browserAction.setPopup({
                popup: 'popup.html'
            });
        }

        if (storage.disablePopup) {
            chrome.browserAction.setPopup({
                popup: ''
            });
        }
    };

    var initOmniboxListener = function () {
        chrome.omnibox.onInputEntered.addListener(function (request) {
            var params = request && '#' + utils.hashParam({
                query: request
            });
            chrome.tabs.create({
                url: 'index.html' + params,
                selected: true
            });
        });
    };

    var load = function (reset) {
        chrome.storage.local.get({
            invertIcon: false,
            contextMenu: true,
            disablePopup: false
        }, function (storage) {
            changeContextMenu(storage);
            changeBrowserAction(storage, reset);
            changeIcon(storage, reset);
        });
    };

    var updateTracker = function (tracker, force) {
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
                    tracker.info.lastUpdate = parseInt(Date.now() / 1000);
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
            if (tracker.meta.updateURL !== tracker.meta.downloadURL) {
                promise = promise.then(function () {
                    return checkVersion(tracker.meta.downloadURL);
                })
            }
            return promise.then(function (result) {
                tracker.meta = result.meta;
                tracker.code = result.body;
                tracker.info.lastUpdate = parseInt(Date.now() / 1000);
                return {
                    previewVersion: result.previewVersion,
                    version: result.version
                }
            });
        };

        return new Promise(function (resolve) {
            if (!tracker.meta.downloadURL) {
                throw new Error('C_UNAVAILABLE');
            }
            var now = parseInt(Date.now() / 1000);
            var lastUpdate = tracker.info.lastUpdate || 0;
            if (now - lastUpdate > 24 * 60 * 60 || force) {
                resolve(checkUpdate());
            } else {
                throw new Error('C_TIMEOUT');
            }
        }).then(function (result) {
            return {success: true, trackerId: tracker.id, result: result};
        }).catch(function (err) {
            if (err.message === 'C_UNAVAILABLE') {
                return {success: false, trackerId: tracker.id, message: 'UNAVAILABLE'};
            } else
            if (err.message === 'C_TIMEOUT') {
                return {success: false, trackerId: tracker.id, message: 'TIMEOUT'};
            } else
            if (err.message === 'C_ACTUAL') {
                return {success: true, trackerId: tracker.id, message: 'ACTUAL', version: tracker.meta.version};
            } else {
                console.error('Update error', tracker.id, err);
                return {success: false, trackerId: tracker.id, message: 'ERROR'};
            }
        });
    };

    var updateInProgress = false;
    var update = function (message) {
        if (updateInProgress) {
            return Promise.resolve({success: false, message: 'OTHER_UPDATE_IN_PROGRESS'});
        }

        updateInProgress = true;
        return new Promise(function (resove) {
            chrome.storage.local.get({
                trackers: {}
            }, function (storage) {
                resove(storage);
            });
        }).then(function (storage) {
            var id = message.id;
            var promiseList = [];
            var trackers = storage.trackers;
            for (var key in trackers) {
                if (!id || id === trackers[key].id) {
                    promiseList.push(updateTracker(trackers[key], message.force));
                }
            }

            return Promise.all(promiseList).then(function (results) {
                var promise = Promise.resolve();
                var save = results.some(function (result) {
                    return result.success;
                });
                if (save) {
                    promise = promise.then(function () {
                        return new Promise(function (resolve) {
                            chrome.storage.local.set({
                                trackers: trackers
                            }, resolve);
                        })
                    });
                }
                return promise.then(function () {
                    updateInProgress = false;
                    return {success: true, results: results};
                });
            });
        });
    };

    chrome.runtime.onMessage.addListener(function (message, sender, response) {
        if (message.action === 'reload') {
            load(true);
        }
        if (message.action === 'update') {
            update(message).then(response);
            return true;
        }
    });

    initOmniboxListener();
    initContextMenuListener();
    initBrowserActionListener();
    load();
});