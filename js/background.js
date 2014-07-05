if (typeof window === 'undefined') {
    self = require("sdk/self");
    var tabs = require("sdk/tabs");
    window = require("sdk/window/utils").getMostRecentBrowserWindow();
    window.isModule = true;
    mono = require('./mono.js');
}
var init = function (env, lang) {
    if (env) {
        mono = mono.init(env);
        window.get_lang = lang.get_lang;
    }
    mono.messageStack = 100;
    mono.pageId = 'bg';
    mono.localStorage(function() {
        bg.boot();
        bg.update();
    }, 1);
};
var bg = function() {
    /**
     * @namespace chrome
     * @namespace chrome.omnibox
     * @namespace chrome.omnibox.onInputEntered
     * @namespace chrome.omnibox.onInputEntered.addListener
     * @namespace chrome.tabs
     * @namespace chrome.contextMenus
     * @namespace chrome.removeAll
     * @namespace chrome.browserAction
     * @namespace chrome.browserAction.onClicked
     * @namespace chrome.browserAction.setPopup
     */
    var _lang, btn_init, var_cache = {};
    var add_in_omnibox = function() {
        var add_in_omnibox = parseInt(mono.localStorage.get('add_in_omnibox') || 1);
        if (add_in_omnibox === 0) {
            return;
        }
        if (mono.isChrome) {
            chrome.omnibox.onInputEntered.addListener(function (text) {
                chrome.tabs.create({
                    url: "index.html" + ( (text.length > 0) ? '#?search=' + text : ''),
                    selected: true
                });
            });
        }
    };
    var update_context_menu = function() {
        var val = mono.localStorage.get('context_menu');
        var context_menu = (val === undefined || val === null)?1:val;
        if (mono.isChrome) {
            chrome.contextMenus.removeAll(function () {
                if (context_menu === 0) {
                    return;
                }
                chrome.contextMenus.create({
                    type: "normal",
                    id: "item",
                    title: _lang.ctx_title,
                    contexts: ["selection"],
                    onclick: function (info) {
                        var text = info.selectionText;
                        chrome.tabs.create({
                            url: 'index.html' + ( (text.length > 0) ? '#?search=' + text : ''),
                            selected: true
                        });
                    }
                });
            });
        }
        if (mono.isFF) {
            var contentScript = (function() {
                var onContext = function() {
                    self.on("click", function() {
                        var text = window.getSelection().toString();
                        self.postMessage(text);
                    });
                };
                var minifi = function(str) {
                    var list = str.split('\n');
                    var newList = [];
                    list.forEach(function(line) {
                        newList.push(line.trim());
                    });
                    return newList.join('');
                };
                var onClickString = onContext.toString();
                var n_pos =  onClickString.indexOf('\n')+1;
                onClickString = onClickString.substr(n_pos, onClickString.length - 1 - n_pos).trim();
                return minifi(onClickString);
            })();
            var cm = require("sdk/context-menu");
            if (var_cache.topLevel) {
                var_cache.topLevel.parentMenu.removeItem(var_cache.topLevel);
            }
            if (context_menu === 0) {
                var_cache.topLevel = undefined;
                return;
            }
            var_cache.topLevel = cm.Item({
                label: _lang.ctx_title,
                context: cm.SelectionContext(),
                image: self.data.url('./icons/icon-16.png'),
                contentScript: contentScript,
                onMessage: function (text) {
                    tabs.open( self.data.url('index.html')+'#?search='+text );
                }
            });
        }
    };
    var init_btn_action = function() {
        chrome.browserAction.onClicked.addListener(function() {
            var show_popup = parseInt(mono.localStorage.get('search_popup') || 1);
            if (!show_popup) {
                chrome.tabs.create({
                    url: 'index.html'
                });
            }
        });
    };
    var update_btn_action = function() {
        if (!btn_init) {
            init_btn_action();
            btn_init = true;
        }
        var show_popup = parseInt(mono.localStorage.get('search_popup') || 1);
        chrome.browserAction.setPopup({
            popup: (show_popup)?'popup.html':''
        });
    };
    return {
        boot: function() {
            _lang = window.get_lang( mono.localStorage.get('lang') || window.navigator.language.substr(0, 2) );
            mono.onMessage(function(message) {
                if (message === 'bg_update') {
                    bg.update();
                }
            });
        },
        update: function() {
            add_in_omnibox();
            update_context_menu();
            if (mono.isChrome && !mono.isChromeApp) {
                update_btn_action();
            }
        }
    };
}();
if (window.isModule) {
    exports.init = init;
} else {
    init();
}