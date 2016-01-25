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
                    case 'sdk/net/xhr':
                        return require('sdk/net/xhr');
                    case 'sdk/l10n':
                        return require('sdk/l10n');
                    case 'sdk/base64':
                        return require('sdk/base64');
                    default:
                        console.error('Module not found!', path);
                }
            }
        }
    }), "data/mono");
    self = null;
})();

var bg = {
    defaultSettings: {
        contextMenu: 1,
        searchPopup: 1,
        invertIcon: 0,
        enableProxyApi: 0,
        langCode: undefined,
        proxyHostList: [
            '*://*.kinozal.tv/*'
        ]
    },
    settings: {},
    updateIcon: function() {
        "use strict";
        var prefix;
        if (mono.isFF) {
            if (!mono.ffButton) {
                return;
            }

            prefix = bg.settings.invertIcon ? '-i' : '';
            mono.ffButton.icon = {
                16: './icons/icon-16' + prefix + '.png',
                32: './icons/icon-32' + prefix + '.png',
                64: './icons/icon-64' + prefix + '.png'
            };
        }
        if (mono.isChrome && !mono.isChromeWebApp) {
            prefix = bg.settings.invertIcon ? '_i' : '';
            chrome.browserAction.setIcon({
                path: {
                    19: 'img/icon_19' + prefix + '.png',
                    38: 'img/icon_38' + prefix + '.png'
                }
            });
        }
    },
    updateBtnAction: function() {
        "use strict";
        if (mono.isChrome && !mono.isChromeWebApp) {
            chrome.browserAction.setPopup({
                popup: bg.settings.searchPopup ? 'popup.html' : ''
            });
        }
    },
    ffContextMenu: null,
    checkExtExists: function(cb) {
        "use strict";
        if (!mono.isChromeWebApp) {
            return cb();
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'chrome-extension://ngcldkkokhibdmeamidppdknbhegmhdh/img/icon_16.png', true);
        xhr.onerror = function() {
            cb();
        };
        xhr.send();
    },
    chromeUpdateContextMenu: function() {
        "use strict";
        chrome.contextMenus.removeAll(function () {
            if (!bg.settings.contextMenu) {
                return;
            }
            bg.checkExtExists(function() {
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
        });
    },
    ffUpdateContextMenu: function() {
        "use strict";
        if (!mono.ffButton) {
            return;
        }

        var contentScript = (function() {
            var onContext = function() {
                "self".on("click", function() {
                    var text = window.getSelection().toString();
                    "self".postMessage(text);
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
            var onClickString = onContext.toString().replace(/"self"/g, 'self');
            var n_pos =  onClickString.indexOf('{')+1;
            onClickString = onClickString.substr(n_pos, onClickString.length - 1 - n_pos).trim();
            return minifi(onClickString);
        })();

        var self = require('sdk/self');

        if (bg.ffContextMenu) {
            bg.ffContextMenu.parentMenu.removeItem(bg.ffContextMenu);
            bg.ffContextMenu = null;
        }

        if (!bg.settings.contextMenu) {
            return;
        }

        var prefix = bg.settings.invertIcon ? '-i' : '';
        var contextMenu = require("sdk/context-menu");
        bg.ffContextMenu = contextMenu.Item({
            label: mono.language.ctxMenuTitle,
            context: contextMenu.SelectionContext(),
            image: self.data.url('./icons/icon-16' + prefix + '.png'),
            contentScript: contentScript,
            onMessage: function (request) {
                var tabs = require('sdk/tabs');
                if (request) {
                    request = '#?' + mono.hashParam({
                            search: request
                        });
                }
                tabs.open(self.data.url('index.html') + request);
            }
        });
    },
    updateContextMenu: function() {
        "use strict";
        if (mono.isChrome) {
            return this.chromeUpdateContextMenu();
        }
        if (mono.isFF) {
            return this.ffUpdateContextMenu();
        }
    },
    onMessage: function(msg, cb) {
        "use strict";
        if (msg === 'reloadSettings') {
            bg.run();
            return cb();
        } else
        if (msg.action === 'openTab') {
            var tab = opera.extension.tabs.create({url: msg.url});
            tab.focus();
        } else
        if (msg.action === 'resize') {
            msg.height && (bg.operaBtn.popup.height = msg.height);
            msg.width && (bg.operaBtn.popup.width = msg.width);
        } else
        if (msg.action === 'ping') {
            return cb('pong');
        }
    },
    once: function() {
        "use strict";
        if (mono.isChrome) {
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
            if (!mono.isChromeWebApp) {
                chrome.browserAction.onClicked.addListener(function () {
                    if (bg.settings.searchPopup) {
                        return;
                    }
                    chrome.tabs.create({
                        url: 'index.html'
                    });
                });
            }
        }
        bg.run();
    },
    proxy: {
        currentProxy: null,
        getChromeProxy: function() {
            "use strict";
            return {
                address: ['HTTPS proxy.googlezip.net:443', 'PROXY compress.googlezip.net:80', 'PROXY 74.125.205.211:80']
            }
        },
        onStorageChange: function(changes, areaName) {
            "use strict";
            if (['sync', 'local'].indexOf(areaName) === -1) {
                return;
            }

            if (changes.proxyHostList) {
                bg.settings.proxyHostList = changes.proxyHostList.newValue;
                bg.proxy.init();
            }
        },
        onError: function(details) {
            "use strict";
            var _this = bg.proxy;
            if (details.fatal) {
                _this.stop();
                console.error('Fatal error', details);
                return;
            }
            console.error('Proxy error', details);
            _this.check();
        },
        enable: function() {
            "use strict";
            var _this = this;

            chrome.storage.onChanged.addListener(_this.onStorageChange);

            var hostList = bg.settings.proxyHostList;
            if (!hostList.length) {
                return;
            }

            var hostListRe = hostList.map(function(pattern) {
                return mono.urlPatternToStrRe(pattern);
            }).join('|');

            this.currentProxy = this.getChromeProxy();

            var config = {
                mode: "pac_script",
                pacScript: {
                    data: (function() {
                        var strFunc = ''
                        +'var matchRe = new RegExp("{regexp}");'
                        +'var FindProxyForURL = function(url){'
                        +  'if (matchRe.test(url)) {'
                        +    'return "{address};DIRECT";'
                        +  '}'
                        +  'return "DIRECT";'
                        +'}';
                        strFunc = strFunc.replace('{address}', _this.currentProxy.address.join(';'));
                        strFunc = strFunc.replace('{regexp}', hostListRe);
                        return strFunc;
                    })()
                }
            };

            chrome.proxy.settings.set({
                value: config,
                scope: 'regular'
            });

            chrome.proxy.onProxyError.addListener(_this.onError);
        },
        check: function(cb) {
            "use strict";
            var _this = this;
            chrome.proxy.settings.get({incognito:false}, function(details) {
                if (['controllable_by_this_extension', 'controlled_by_this_extension'].indexOf(details.levelOfControl) === -1) {
                    console.error('Run proxy error!');
                    _this.stop();
                    return;
                }
                cb && cb();
            });
        },
        stop: function(cb) {
            "use strict";
            var _this = this;
            chrome.storage.onChanged.removeListener(_this.onStorageChange);
            chrome.proxy.onProxyError.removeListener(_this.onError);
            chrome.proxy.settings.get({incognito:false}, function(details) {
                var next = function() {
                    cb && cb();
                };

                if (['controllable_by_this_extension', 'controlled_by_this_extension'].indexOf(details.levelOfControl) !== -1) {
                    chrome.proxy.settings.clear({
                        scope: 'regular'
                    }, next);
                } else {
                    next();
                }
            });
        },
        init: function() {
            "use strict";
            if (!chrome.proxy) {
                return;
            }

            var _this = this;
            _this.stop(function() {
                if (bg.settings.enableProxyApi) {
                    _this.check(function () {
                        _this.enable();
                    });
                }
            });
        }
    },
    run: function() {
        "use strict";
        var _this = this;
        var storageKeys = Object.keys(bg.defaultSettings);
        mono.storage.get(storageKeys, function(storage) {
            mono.storage.sync.get(storageKeys, function(syncStorage) {
                Object.keys(syncStorage).forEach(function(key) {
                    storage[key] = syncStorage[key];
                });

                Object.keys(bg.defaultSettings).forEach(function(key) {
                    if (storage.hasOwnProperty(key)) {
                        bg.settings[key] = storage[key];
                    } else {
                        bg.settings[key] = bg.defaultSettings[key];
                    }
                });

                mono.getLanguage(function () {
                    bg.updateContextMenu();
                    bg.updateBtnAction();
                }, storage.langCode);

                if ((mono.isChrome && !mono.isChromeWebApp) || mono.isFF) {
                    bg.updateIcon();
                }

                if (mono.isChrome) {
                    _this.proxy.init();
                }
            });
        });
    }
};

(function() {
    "use strict";
    var init = function(addon, button, initPopup) {
        "use strict";
        if (addon) {
            mono = mono.init(addon);
            mono.ffButton = button;
            initPopup();
            mono.ajax.xhr = require('sdk/net/xhr').XMLHttpRequest;
        } else {
            mono.ajax.xhr = XMLHttpRequest;
        }

        mono.onMessage(bg.onMessage);
        bg.once();
    };
    if (mono.isModule) {
        exports.init = init;
    } else {
        mono.onReady(function() {
            return init();
        });
    }
})();