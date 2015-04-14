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
    setBtnAction: mono.isChrome ? function ch(state) {
        "use strict";
        ch.lastState = state;
        if (!ch.inited) {
            chrome.browserAction.onClicked.addListener(function() {
                if (ch.lastState) return;
                chrome.tabs.create({
                    url: 'index.html'
                });
            });
            ch.inited = 1;
        }
        chrome.browserAction.setPopup({
            popup: state ? 'popup.html' : ''
        });
    } : function() {
        "use strict";

    },
    setCtxMenu: mono.isChrome ? function(state) {
        "use strict";
        chrome.contextMenus.removeAll(function () {
            if (!state) return;
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

    },
    run: function() {
        "use strict";

        mono.storage.get(['contextMenu', 'searchPopup', 'langCode'], function(storage) {
            if (!storage.hasOwnProperty('contextMenu')) {
                storage.contextMenu = 1;
            }
            if (!storage.hasOwnProperty('searchPopup')) {
                storage.searchPopup = 1;
            }

            mono.getLanguage(function() {
                bg.setBtnAction(storage.searchPopup);
                bg.setCtxMenu(storage.contextMenu);
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
        bg.run();
    };
    if (!mono.isModule) {
        return init();
    }
    exports.init = init;
})();