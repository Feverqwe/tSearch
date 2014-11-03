/**
 * @namespace require
 */
if (typeof window === 'undefined') {
    self = require('sdk/self');
    var tabs = require('sdk/tabs');
    window = require('sdk/window/utils').getMostRecentBrowserWindow();
    window.isModule = true;
    mono = require('toolkit/loader').main(require('toolkit/loader').Loader({
        paths: {
            'data/': self.data.url('js/')
        },
        name: self.name,
        prefixURI: 'resource://'+self.id.slice(1, -1)+'/',
        globals: {
            console: console,
            _require: function(path) {
                switch (path) {
                    case 'sdk/timers':
                        return require('sdk/timers');
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
}
var init = function (env, ffButton) {
    if (env) {
        mono = mono.init(env);
        window.hasButton = !!ffButton;
    }
    mono.pageId = 'bg';
    bg.boot();
};
var bg = function() {
    "use strict";
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
    var _lang = {}, var_cache = {};
    var add_in_omnibox = function() {
        chrome.omnibox.onInputEntered.addListener(function (text) {
            chrome.tabs.create({
                url: "index.html" + ( text ? '#?search=' + encodeURIComponent(text) : ''),
                selected: true
            });
        });
    };
    var checkExtExists = function(cb) {
        "use strict";
        if (!mono.isChromeWebApp) {
            return cb();
        }
        var xhr = new XMLHttpRequest();
        var url = 'chrome-extension://ngcldkkokhibdmeamidppdknbhegmhdh/images/icon_16.png';
        xhr.open('GET', url, true);
        xhr.onerror = function() {
            cb();
        };
        xhr.send();
    };
    var update_context_menu = function(enable) {
        if (mono.isChrome) {
            chrome.contextMenus.removeAll(function () {
                if (!enable) {
                    return;
                }
                checkExtExists(function() {
                    "use strict";
                    chrome.contextMenus.create({
                        type: "normal",
                        id: "item",
                        title: _lang.ctx_title,
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
            });
        }
        if (mono.isFF && window.hasButton) {
            if (enable && var_cache.cm_state) {
                return;
            }
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

            if (var_cache.topLevel && var_cache.topLevel.parentMenu) {
                var_cache.topLevel.parentMenu.removeItem(var_cache.topLevel);
            }

            if (!enable) {
                var_cache.cm_state = false;
                var_cache.topLevel = undefined;
                return;
            }

            var_cache.topLevel = cm.Item({
                label: _lang.ctx_title,
                context: cm.SelectionContext(),
                image: self.data.url('./icons/icon-16.png'),
                contentScript: contentScript,
                onMessage: function (text) {
                    tabs.open( self.data.url('index.html')+'#?search='+encodeURIComponent(text) );
                }
            });
            var_cache.cm_state = true;
        }
    };
    var update_btn_action = function() {
        if (!var_cache.btn_init) {
            chrome.browserAction.onClicked.addListener(function() {
                if (!var_cache.searchPopup) {
                    chrome.tabs.create({
                        url: 'index.html'
                    });
                }
            });
            var_cache.btn_init = true;
        }
        chrome.browserAction.setPopup({
            popup: (var_cache.searchPopup)?'popup.html':''
        });
    };

    return {
        boot: function() {
            mono.loadLanguage(function(language) {
                _lang = language;
                mono.onMessage(function(message) {
                    if (message === 'bg_update') {
                        bg.update();
                    }
                });
                bg.update();
            });
        },
        update: function() {
            mono.storage.get(['contextMenu', 'searchPopup'], function(storage) {
                if (storage.contextMenu === undefined) {
                    storage.contextMenu = 1;
                }
                if (storage.searchPopup === undefined) {
                    storage.searchPopup = 1;
                }
                update_context_menu(storage.contextMenu);
                if (mono.isChrome) {
                    add_in_omnibox();
                    if (!mono.isChromeWebApp) {
                        var_cache.searchPopup = storage.searchPopup;
                        update_btn_action();
                    }
                }
            });
        }
    };
}();
if (window.isModule) {
    exports.init = init;
} else {
    init();
}