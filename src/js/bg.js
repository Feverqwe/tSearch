/**
 * Created by Anton on 28.02.2015.
 */
var bg = {
    defaultSettings: {
        contextMenu: 1,
        searchPopup: 1,
        invertIcon: 0,
        langCode: undefined
    },
    settings: {},
    updateIcon: function() {
        "use strict";
        var prefix = bg.settings.invertIcon ? '_i' : '';
        chrome.browserAction.setIcon({
            path: {
                19: 'img/icon_19' + prefix + '.png',
                38: 'img/icon_38' + prefix + '.png'
            }
        });
    },
    updateBtnAction: function() {
        "use strict";
        chrome.browserAction.setPopup({
            popup: bg.settings.searchPopup ? 'popup.html' : ''
        });
    },
    updateContextMenu: function() {
        "use strict";
        chrome.contextMenus.removeAll(function () {
            if (!bg.settings.contextMenu) {
                return;
            }
            chrome.contextMenus.create({
                type: "normal",
                id: "item",
                title: mono.language.ctxMenuTitle,
                contexts: ["selection"],
                onclick: function (info) {
                    var request = info.selectionText;
                    if (request) {
                        request = '#?' + mono.hashParam({
                                search: request
                            });
                    }
                    chrome.tabs.create({
                        url: 'index.html' + request,
                        selected: true
                    });
                }
            });
        });
    },
    onMessage: function(msg, cb) {
        "use strict";
        if (msg === 'reloadSettings') {
            bg.run();
            return cb();
        }
    },
    once: function() {
        "use strict";
        // firefox don't have it
        if (chrome.omnibox) {
            chrome.omnibox.onInputEntered.addListener(function (request) {
                if (request) {
                    request = '#?' + mono.hashParam({
                            search: request
                        });
                }
                chrome.tabs.create({
                    url: "index.html" + request,
                    selected: true
                });
            });
        }
        chrome.browserAction.onClicked.addListener(function () {
            if (bg.settings.searchPopup) {
                return;
            }
            chrome.tabs.create({
                url: 'index.html'
            });
        });
        bg.run();
    },
    run: function() {
        "use strict";
        var _this = this;
        mono.storage.get(bg.defaultSettings, function(storage) {
            mono.storage.sync.get(bg.defaultSettings, function(syncStorage) {
                Object.keys(syncStorage).forEach(function(key) {
                    storage[key] = syncStorage[key];
                });

                Object.keys(bg.defaultSettings).forEach(function(key) {
                    if (storage[key] !== undefined) {
                        bg.settings[key] = storage[key];
                    } else {
                        bg.settings[key] = bg.defaultSettings[key];
                    }
                });

                mono.loadLanguage(storage.langCode, function () {
                    bg.updateContextMenu();
                    bg.updateBtnAction();
                    bg.updateIcon();
                });
            });
        });
    }
};

(function() {
    "use strict";
    var init = function(addon, button, initPopup) {
        "use strict";
        mono.onMessage.addListener(bg.onMessage);
        bg.once();
    };
    mono.onReady(function() {
        return init();
    });
})();