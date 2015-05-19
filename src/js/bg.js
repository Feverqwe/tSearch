/**
 * Created by Anton on 28.02.2015.
 */
var mono = (typeof mono !== 'undefined') ? mono : undefined;

(function() {
    "use strict";
    if (typeof window !== 'undefined') return;
    var self = require('sdk/self');
    mono = require('toolkit/loader').main(require('toolkit/loader').Loader({
        paths: {
            'data/': self.data.url('js/')
        },
        name: self.name,
        prefixURI: self.data.url().match(/([^:]+:\/\/[^/]+\/)/)[1],
        globals: {
            console: console,
            _require: function(path) {
                switch (path) {
                    case 'sdk/simple-storage':
                        return require('sdk/simple-storage');
                    case 'sdk/window/utils':
                        return require('sdk/window/utils');
                    case 'sdk/self':
                        return require('sdk/self');
                    default:
                        console.log('Module not found!', path);
                }
            }
        }
    }), "data/mono");
    self = null;
})();

var bg = {
    settings: {
        contextMenu: 1,
        searchPopup: 1
    },
    updateBtnAction: mono.isChrome ? function() {
        "use strict";
        chrome.browserAction.setPopup({
            popup: bg.settings.searchPopup ? 'popup.html' : ''
        });
    } : function() {
        "use strict";

    },
    updateContextMenu: mono.isChrome ? function() {
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
                    var text = info.selectionText;
                    chrome.tabs.create({
                        url: 'index.html' + ( text ? '#?search=' + encodeURIComponent(text) : ''),
                        selected: true
                    });
                }
            });
        });
    } : function() {
        "use strict";

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
        if (mono.isChrome) {
            chrome.omnibox.onInputEntered.addListener(function (text) {
                chrome.tabs.create({
                    url: "index.html" + ( text ? '#?search=' + encodeURIComponent(text) : ''),
                    selected: true
                });
            });
            chrome.browserAction.onClicked.addListener(function() {
                if (bg.settings.searchPopup) {
                    return;
                }
                chrome.tabs.create({
                    url: 'index.html'
                });
            });
        }
        bg.run();
    },
    run: function() {
        "use strict";
        mono.storage.get(['contextMenu', 'searchPopup', 'langCode'], function(storage) {
            if (storage.hasOwnProperty('contextMenu')) {
                bg.settings.contextMenu = storage.contextMenu;
            }
            if (storage.hasOwnProperty('searchPopup')) {
                bg.settings.searchPopup = storage.searchPopup;
            }

            mono.getLanguage(function() {
                bg.updateContextMenu();
                bg.updateBtnAction();
            }, storage.langCode);
        });
    }
};

(function() {
    var init = function(addon, button) {
        "use strict";
        if (addon) {
            mono = mono.init(addon);
            mono.ffButton = button;
            mono.ajax.xhr = require('sdk/net/xhr').XMLHttpRequest;
        } else {
            mono.ajax.xhr = XMLHttpRequest;
        }

        mono.onMessage(bg.onMessage);
        bg.once();
    };
    if (!mono.isModule) {
        return init();
    }
    exports.init = init;
})();