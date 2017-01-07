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

    var changeContextMenu = function (storage, reset) {
        var next = function () {
            if (storage.contextMenu) {
                chrome.contextMenus.create({
                    type: "normal",
                    id: "tms",
                    title: chrome.i18n.getMessage('contextMenuTitle'),
                    contexts: ["selection"]
                });
            }
        };

        if (reset) {
            chrome.contextMenus.removeAll(next);
        } else {
            next();
        }
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
            changeContextMenu(storage, reset);
            changeBrowserAction(storage, reset);
            changeIcon(storage, reset);
        });
    };

    chrome.runtime.onMessage.addListener(function (message) {
        if (message.action === 'reload') {
            load(true);
        }
    });

    initOmniboxListener();
    initContextMenuListener();
    initBrowserActionListener();
    load();
});