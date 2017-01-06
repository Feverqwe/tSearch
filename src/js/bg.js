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
    var state = [];
    var initContextMenu = function () {
        chrome.storage.local.get({
            contextMenu: true
        }, function (storage) {
            if (storage.contextMenu) {
                chrome.contextMenus.create({
                    type: "normal",
                    id: "tms",
                    title: chrome.i18n.getMessage('contextMenuTitle'),
                    contexts: ["selection"],
                    onclick: function (info) {
                        var request = info.selectionText;
                        var params = request && '#?' + utils.hashParam({
                            query: request
                        });
                        chrome.tabs.create({
                            url: 'index.html' + params,
                            selected: true
                        });
                    }
                });

                state.push(function () {
                    chrome.contextMenus.remove("tms");
                });
            }
        });
    };
    var initBrowserAction = function () {
        chrome.storage.local.get({
            disablePopup: false
        }, function (storage) {
            if (storage.disablePopup) {
                chrome.browserAction.setPopup({
                    popup: ''
                });

                var listener = function () {
                    chrome.tabs.create({
                        url: 'index.html'
                    });
                };

                chrome.browserAction.onClicked.addListener(listener);
                state.push(function () {
                    chrome.browserAction.setPopup({
                        popup: 'popup.html'
                    });
                    chrome.browserAction.onClicked.removeListener(listener);
                });
            }
        });
    };
    var initOmniboxListener = function () {
        var listener = function (request) {
            var params = request && '#?' + utils.hashParam({
                query: request
            });
            chrome.tabs.create({
                url: 'index.html' + params,
                selected: true
            });
        };

        chrome.omnibox.onInputEntered.addListener(listener);
        state.push(function () {
            chrome.omnibox.onInputEntered.removeListener(listener);
        });
    };
    var load = function () {
        var listener = function (message) {
            if (message.action === 'reload') {
                reload();
            }
        };

        chrome.runtime.onMessage.addListener(listener);
        state.push(function () {
            chrome.runtime.onMessage.removeListener(listener);
        });

        initContextMenu();
        initBrowserAction();
        initOmniboxListener();
    };
    var reload = function () {
        destroy();
        load();
    };
    var destroy = function () {
        state.slice(0).forEach(function (destroyFn) {
            destroyFn();
        });
    };
    load();
});