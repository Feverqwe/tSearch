/**
 * Created by Anton on 31.12.2016.
 */
"use strict";
require.config({
    baseUrl: './js'
});
require([
    './module/utils'
], function (utils) {
    var initIcon = function (storage, reset) {
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
    var initContextMenu = function (storage, reset) {
        var next = function () {
            if (storage.contextMenu) {
                chrome.contextMenus.create({
                    type: "normal",
                    id: "tms",
                    title: chrome.i18n.getMessage('contextMenuTitle'),
                    contexts: ["selection"],
                    onclick: function (info) {
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
            }
        };

        if (reset) {
            chrome.contextMenus.remove("tms", next);
        } else {
            next();
        }
    };
    var initBrowserAction = function (storage, reset) {
        var listener = function () {
            chrome.tabs.create({
                url: 'index.html'
            });
        };

        if (reset) {
            chrome.browserAction.setPopup({
                popup: 'popup.html'
            });
            chrome.browserAction.onClicked.removeListener(listener);
        }

        if (storage.disablePopup) {
            chrome.browserAction.setPopup({
                popup: ''
            });
            chrome.browserAction.onClicked.addListener(listener);
        }
    };
    var initOmniboxListener = function (reset) {
        var listener = function (request) {
            var params = request && '#' + utils.hashParam({
                    query: request
                });
            chrome.tabs.create({
                url: 'index.html' + params,
                selected: true
            });
        };

        if (reset) {
            chrome.omnibox.onInputEntered.removeListener(listener);
        }

        chrome.omnibox.onInputEntered.addListener(listener);
    };

    var load = function (reset) {
        chrome.storage.local.get({
            invertIcon: false,
            contextMenu: true,
            disablePopup: false
        }, function (storage) {
            initOmniboxListener(reset);
            initContextMenu(storage, reset);
            initBrowserAction(storage, reset);
            initIcon(storage, reset);
        });
    };

    chrome.runtime.onMessage.addListener(function (message) {
        if (message.action === 'reload') {
            load(true);
        }
    });

    load();
});