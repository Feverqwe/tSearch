/**
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine.
 */

var mono = (typeof mono === 'undefined') ? undefined : mono;

(function( global, factory ) {
    if (mono) {
        return;
    }
    if (global) {
        return mono = factory();
    }
    return exports.init = factory;
}(typeof window !== "undefined" ? window : undefined, function ( addon ) {
    var defaultId = 'monoScope';
    var mono = function() {
        // mono like console.log
        var args = Array.prototype.slice.call(arguments);
        args.unshift(mono.pageId,'monoLog:');
        console.log.apply(console, args);
    };

    if (typeof window === 'undefined') {
        /**
         * @namespace _require
         */
        var require = _require;
        mono.isModule = true;
        mono.isFF = true;
        mono.addon = addon;
        setTimeout = require('sdk/timers').setTimeout;
    } else {
        window.mono = mono;
        if (typeof GM_getValue !== 'undefined') {
            mono.isGM = true;
            if (window.chrome !== undefined) {
                mono.isTM = true;
            }
        } else
        if (window.chrome !== undefined) {
            mono.isChrome = true;
            if (chrome.app.getDetails === undefined) {
                mono.isChromeApp = true;
            } else {
                var details = chrome.app.getDetails();
                if (details && details.app !== undefined) {
                    mono.isChromeWebApp = true;
                }
            }
            mono.isChromeInject = chrome.tabs === undefined;
        } else
        if (window.safari !== undefined) {
            mono.isSafari = true;
            mono.isSafariPopup = safari.self.identifier === 'popup';
            mono.isSafariBgPage = safari.self.addEventListener === undefined;
            mono.isSafariInject = !mono.isSafariPopup && safari.application === undefined;
        } else
        if (window.opera !== undefined) {
            mono.isOpera = true;
            mono.isOperaInject = opera.extension.broadcastMessage === undefined;
        } else {
            mono.addon = window.addon || window.self;
            if (mono.addon !== undefined && mono.addon.port !== undefined) {
                mono.isFF = true;
            } else
            if (navigator.userAgent.indexOf('Firefox') !== -1) {
                mono.isFF = true;
                mono.noAddon = true;
            }
        }
    }

    mono.messageStack = 50;
    mono.pageId = defaultId;
    mono.debug = {
        messages: false
    };

    var messagesEnable = false;

    var externalStorage = {
        get: function(obj, cb) {
            mono.sendMessage({action: 'get', data: obj}, cb, 'monoStorage');
        },
        set: function(obj, cb) {
            mono.sendMessage({action: 'set', data: obj}, cb, 'monoStorage');
        },
        remove: function(obj, cb) {
            mono.sendMessage({action: 'remove', data: obj}, cb, 'monoStorage');
        },
        clear: function(cb) {
            mono.sendMessage({action: 'clear'}, cb, 'monoStorage');
        }
    };

    mono.externalStorageActivate = function() {
        if (!mono.isChrome && !mono.isSafari && !mono.isOpera) {
            return;
        }
        !messagesEnable && mono.onMessage(function(){});
        mono.onMessage.call({filter: 'monoStorage', private: true}, function(message, response) {
            if (message.action === 'get') {
                return mono.storage.get(message.data, response);
            } else
            if (message.action === 'set') {
                return mono.storage.set(message.data, response);
            } else
            if (message.action === 'remove') {
                return mono.storage.remove(message.data, response);
            } else
            if (message.action === 'clear') {
                return mono.storage.clear(response);
            }
        })
    };

    var localStorage = {};
    var localStorageMode = {
        getObj: function(key) {
            var index = 0;
            var keyPrefix = localStorageMode.chunkPrefix+key;
            var chunk = localStorage[keyPrefix+index];
            var data = '';
            while (chunk !== undefined) {
                data += chunk;
                index++;
                chunk = localStorage[keyPrefix+index];
            }
            var value = undefined;
            try {
                value = JSON.parse(data);
            } catch (e) {}
            return value;
        },
        setObj: function(key, value) {
            value = JSON.stringify(value);
            var keyPrefix = localStorageMode.chunkPrefix+key;
            var chunkLen = 1024 - keyPrefix.length - 3;
            if (localStorageMode.regexp === undefined) {
                localStorageMode.regexp = new RegExp('.{1,'+chunkLen+'}', 'g');
            }
            var valueLen = value.length;
            var number_of_part = Math.floor( valueLen / chunkLen );
            if (number_of_part >= 512) {
                console.log(mono.pageId, 'monoLog:', 'localStorage','Can\'t save item', key,', very big!');
                return;
            }
            var dataList = value.match(localStorageMode.regexp);
            var dataListLen = dataList.length;
            for (var i = 0, item; i < dataListLen; i++) {
                item = dataList[i];
                localStorage[keyPrefix+i] = item;
            }
            localStorage[key] = localStorageMode.chunkItem;

            localStorageMode.rmObj(key, dataListLen);
        },
        rmObj: function(key, index) {
            var keyPrefix = localStorageMode.chunkPrefix+key;
            if (index === undefined) {
                index = 0;
            }
            var data = localStorage[keyPrefix+index];
            while (data !== undefined) {
                delete localStorage[keyPrefix+index];
                index++;
                data = localStorage[keyPrefix+index];
            }
        },
        readValue: function(key, value) {
            if (value === localStorageMode.chunkItem) {
                value = localStorageMode.getObj(key)
            } else
            if (value !== undefined) {
                var data = value.substr(1);
                var type = value[0];
                if (type === 'i') {
                    value = parseInt(data);
                } else
                if (type === 'b') {
                    value = data === 'true';
                } else {
                    value = data;
                }
            }
            return value;
        },
        get: function (src, cb) {
            var key, obj = {};
            if (src === undefined || src === null) {
                for (key in localStorage) {
                    if (!localStorage.hasOwnProperty(key) || key === 'length') {
                        continue;
                    }
                    if (key.substr(0, localStorageMode.chunkLen) === localStorageMode.chunkPrefix) {
                        continue;
                    }
                    obj[key] = localStorageMode.readValue(key, localStorage[key]);
                }
                return cb(obj);
            }
            if (typeof src === 'string') {
                src = [src];
            }
            if (Array.isArray(src) === true) {
                for (var i = 0, len = src.length; i < len; i++) {
                    key = src[i];
                    obj[key] = localStorageMode.readValue(key, localStorage[key]);
                }
            } else {
                for (key in src) {
                    obj[key] = localStorageMode.readValue(key, localStorage[key]);
                }
            }
            cb(obj);
        },
        set: function (obj, cb) {
            var key;
            for (key in obj) {
                var value = obj[key];
                if (value === undefined) {
                    localStorageMode.remove(key);
                } else
                if (typeof value === 'object') {
                    localStorageMode.setObj(key, value);
                } else {
                    var type = typeof value;
                    if (type === 'boolean') {
                        value = 'b'+value;
                    } else
                    if (type === 'number') {
                        value = 'i'+value;
                    } else {
                        value = 's'+value;
                    }
                    localStorage[key] = value;
                }
            }
            cb && cb();
        },
        remove: function (obj, cb) {
            if (Array.isArray(obj)) {
                for (var i = 0, len = obj.length; i < len; i++) {
                    var key = obj[i];
                    if (localStorage[key] === localStorageMode.chunkItem) {
                        localStorageMode.rmObj(key);
                    }
                    delete localStorage[key];
                }
            } else {
                if (localStorage[obj] === localStorageMode.chunkItem) {
                    localStorageMode.rmObj(obj);
                }
                delete localStorage[obj];
            }
            cb && cb();
        },
        clear: function (cb) {
            localStorage.clear();
            cb && cb();
        }
    };
    localStorageMode.chunkPrefix = 'mCh_';
    localStorageMode.chunkLen = localStorageMode.chunkPrefix.length;
    localStorageMode.chunkItem = 'monoChunk';

    var monoStorage = !mono.isModule ? undefined : function() {
        var ss = require('sdk/simple-storage');
        return {
            get: function (src, cb) {
                var key, obj = {};
                if (src === undefined || src === null) {
                    for (key in ss.storage) {
                        if (!ss.storage.hasOwnProperty(key)) {
                            continue;
                        }
                        obj[key] = ss.storage[key];
                    }
                    return cb(obj);
                }
                if (typeof src === 'string') {
                    src = [src];
                }
                if (Array.isArray(src) === true) {
                    for (var i = 0, len = src.length; i < len; i++) {
                        key = src[i];
                        obj[key] = ss.storage[key];
                    }
                } else {
                    for (key in src) {
                        obj[key] = ss.storage[key];
                    }
                }
                cb(obj);
            },
            set: function (obj, cb) {
                var key;
                for (key in obj) {
                    ss.storage[key] = obj[key];
                }
                cb && cb();
            },
            remove: function (obj, cb) {
                if (Array.isArray(obj)) {
                    for (var i = 0, len = obj.length; i < len; i++) {
                        var key = obj[i];
                        delete ss.storage[key];
                    }
                } else {
                    delete ss.storage[obj];
                }
                cb && cb();
            },
            clear: function (cb) {
                var key;
                for (key in ss.storage) {
                    delete ss.storage[key];
                }
                cb && cb();
            }
        }
    };

    var gmStorage = !mono.isGM ? undefined : {
        /**
         * @namespace GM_listValues
         * @namespace GM_getValue
         * @namespace GM_setValue
         * @namespace GM_deleteValue
         */
        get: function (src, cb) {
            var key, obj = {};
            if (src === undefined || src === null) {
                var nameList = GM_listValues();
                for (key in nameList) {
                    obj[key] = GM_getValue(key);
                }
                return cb(obj);
            }
            if (typeof src === 'string') {
                src = [src];
            }
            if (Array.isArray(src) === true) {
                for (var i = 0, len = src.length; i < len; i++) {
                    key = src[i];
                    obj[key] = GM_getValue(key);
                }
            } else {
                for (key in src) {
                    obj[key] = GM_getValue(key);
                }
            }
            cb(obj);
        },
        set: function (obj, cb) {
            var key;
            for (key in obj) {
                GM_setValue(key, obj[key]);
            }
            cb && cb();
        },
        remove: function (obj, cb) {
            if (Array.isArray(obj)) {
                for (var i = 0, len = obj.length; i < len; i++) {
                    var key = obj[i];
                    GM_deleteValue(key);
                }
            } else {
                GM_deleteValue(obj);
            }
            cb && cb();
        },
        clear: function (cb) {
            var key;
            var nameList = GM_listValues();
            for (key in nameList) {
                GM_deleteValue(key);
            }
            cb && cb();
        }
    };

    var storage_fn = function(mode) {
        /**
         * @namespace widget.preferences
         */
        if (mono.isModule) {
            if (monoStorage.get === undefined) {
                monoStorage = monoStorage();
            }
            return monoStorage;
        } else
        if (mono.isChrome && chrome.storage !== undefined) {
            return chrome.storage[mode];
        } else
        if (false && mono.isOpera && window.widget) {
            // remove false if need use prefs
            localStorage = widget.preferences;
            return localStorageMode;
        } else
        if (mono.isGM) {
            return gmStorage;
        } else
        if (mono.isFF || mono.isChromeInject || mono.isOperaInject || mono.isSafariInject) {
            return externalStorage;
        } else
        if (window.localStorage !== undefined) {
            localStorage = window.localStorage;
            return localStorageMode;
        }
        return {};
    };
    mono.storage = storage_fn('local');
    mono.storage.local = mono.storage;
    mono.storage.sync = storage_fn('sync');

    var msgTools = function() {
        var cbObj = mono.debug.cbStack = {};
        var cbStack = [];
        var id = 0;
        var idPrefix = Math.floor(Math.random()*1000)+'_';
        return {
            cbCollector: function (message, cb) {
                if (cb === undefined) {
                    return;
                }
                mono.debug.messages && console.log(mono.pageId, 'monoLog:', 'cbCollector', message);
                !messagesEnable && mono.onMessage(function(){});
                if (cbStack.length > mono.messageStack) {
                    console.log(mono.pageId, 'monoLog:', 'Stack overflow!');
                    delete cbObj[cbStack.shift()];
                }
                id++;
                message.monoCallbackId = idPrefix+id;
                cbObj[idPrefix+id] = cb;
                cbStack.push(idPrefix+id);

                var timeout = message.timeout;
                if (timeout !== undefined) {
                    delete message.timeout;
                    setTimeout(function() {
                        if (cbObj[idPrefix+id] === undefined) {
                            return;
                        }
                        msgTools.cbCaller({
                            data: null,
                            monoResponseId: idPrefix+id
                        });
                    }, timeout);
                }
            },
            cbCaller: function(message) {
                mono.debug.messages && console.log(mono.pageId, 'monoLog:', 'cbCaller', message);
                if (cbObj[message.monoResponseId] === undefined) {
                    if (message.monoResponseId.indexOf(idPrefix) === -1) {
                        return;
                    }
                    return console.log(mono.pageId, 'monoLog:', 'Send to', message.monoTo, 'Id', message.monoResponseId,'Message response not found!');
                }
                cbObj[message.monoResponseId](message.data);
                delete cbObj[message.monoResponseId];
                cbStack.splice(cbStack.indexOf(message.monoResponseId), 1);
            },
            mkResponse: function(message) {
                if (message.monoCallbackId === undefined) {
                    return undefined;
                }
                mono.debug.messages && console.log(mono.pageId, 'monoLog:', 'mkResponse', message);
                return function(responseMessage) {
                    if (message.dead === 1) {
                        return console.log(mono.pageId, 'monoLog:', 'mkResponse', 'dead response', message);
                    }
                    responseMessage = {
                        data: responseMessage,
                        monoResponseId: message.monoCallbackId,
                        monoTo: message.monoFrom,
                        monoFrom: message.monoTo
                    };
                    if (message.tabId !== undefined) {
                        responseMessage.tabId = message.tabId;
                    }
                    if (message.source !== undefined) {
                        responseMessage.source = message.source;
                    }
                    mono.debug.messages && console.log(mono.pageId, 'monoLog:', 'sendResponse', responseMessage);
                    mono.sendMessage.send(responseMessage);
                    message.dead = 1;
                };
            },
            rmCaller: function(monoResponseId) {
                if (monoResponseId === undefined) {
                    return;
                }
                delete cbObj[monoResponseId];
                cbStack.splice(cbStack.indexOf(monoResponseId), 1);
            },
            readFilter: function(params, cb) {
                cb.private = params.private;
                if (params.filter === undefined) {
                    params.filter = [mono.pageId];
                } else
                if (!Array.isArray(params.filter)) {
                    params.filter = [params.filter];
                }
                cb.filter = params.filter;
            },
            filter: function(message, cb) {
                if (message.monoTo === defaultId) {
                    if (cb.private !== undefined) {
                        mono.debug.messages && console.log(mono.pageId, 'monoLog:', 'filterDrop', message);
                        return 1;
                    }
                } else
                if (cb.filter.indexOf(message.monoTo) === -1) {
                    mono.debug.messages && console.log(mono.pageId, 'monoLog:', 'filterDrop', message);
                    return 1;
                }
                return undefined;
            }
        }
    }();

    var ffVirtualPort = !(mono.isFF && mono.noAddon) ? undefined : function() {
        /**
         * @namespace postMessage
         */
        var onCollector = [];
        mono.addon = {
            port: {
                emit: function(pageId, message) {
                    var msg = '>'+JSON.stringify(message);
                    window.postMessage(msg, "*");
                },
                on: function(pageId, onMessage) {
                    onCollector.push(onMessage);
                    if (onCollector.length > 1) {
                        return;
                    }
                    window.addEventListener('monoMessage', function (e) {
                        if (e.detail[0] !== '<') {
                            return;
                        }
                        var data = e.detail.substr(1);
                        var json = JSON.parse(data);
                        for (var i = 0, cb; cb = onCollector[i]; i++) {
                            cb(json);
                        }
                    });
                }
            }
        }
    };

    var ffMessaging = !mono.isFF ? undefined : {
        cbList: [],
        currentTab: function (message) {
            mono.sendMessage({action: 'toActiveTab', message: message}, undefined, 'service');
        },
        send: function(message) {
            mono.addon.port.emit('mono', message);
        },
        on: function(cb) {
            msgTools.readFilter(this, cb);
            ffMessaging.cbList.push(cb);
            if (ffMessaging.cbList.length > 1) {
                return;
            }
            messagesEnable = true;
            var onMessage = function(message) {
                if (message.monoResponseId !== undefined) {
                    return msgTools.cbCaller(message);
                }
                var response = msgTools.mkResponse(message);
                for (var i = 0, itemCb; itemCb = ffMessaging.cbList[i]; i++) {
                    if (msgTools.filter(message, itemCb)) {
                        continue;
                    }
                    itemCb(message.data, response);
                }
            };
            mono.addon.port.on('mono', onMessage);
        }
    };

    var chMessaging = !mono.isChrome ? undefined : {
        /**
         * @namespace chrome.runtime
         * @namespace chrome.tabs.query
         */
        cbList: [],
        currentTab: function (message) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0] === undefined || tabs[0].id < 0) {
                    msgTools.rmCaller(message.monoResponseId);
                    return;
                }
                message.monoTo = defaultId;
                chrome.tabs.sendMessage(tabs[0].id, message);
            });
        },
        send: function(message) {
            var tabId = message.tabId;
            if (tabId !== undefined && tabId > -1) {
                delete message.tabId;
                return chrome.tabs.sendMessage(tabId, message);
            }
            chrome.runtime.sendMessage(message);
        },
        on: function(cb) {
            msgTools.readFilter(this, cb);
            chMessaging.cbList.push(cb);
            if (chMessaging.cbList.length > 1) {
                return;
            }
            messagesEnable = true;
            chrome.runtime.onMessage.addListener(function(message, sender) {
                if (message.monoResponseId !== undefined) {
                    return msgTools.cbCaller(message);
                }
                if (sender.tab !== undefined) {
                    message.tabId = sender.tab.id;
                }
                var response = msgTools.mkResponse(message);
                for (var i = 0, itemCb; itemCb = chMessaging.cbList[i]; i++) {
                    if (msgTools.filter(message, itemCb)) {
                        continue;
                    }
                    itemCb(message.data, response);
                }
            });
        }
    };

    var opMessaging = !mono.isOpera ? undefined : {
        /**
         * @namespace opera.extension
         * @namespace opera.extension.tabs
         * @namespace opera.extension.tabs.getSelected
         * @namespace opera.extension.broadcastMessage
         */
        cbList: [],
        currentTab: function (message) {
            var currentTab = opera.extension.tabs.getSelected();
            message.monoTo = defaultId;
            try {
                currentTab.postMessage(message);
            } catch (e) {}
        },
        send: function(message) {
            var source = message.source;
            if (source !== undefined) {
                delete message.source;
                try {
                    source.postMessage(message);
                } catch (e) {}
                return;
            }
            if (opera.extension.postMessage !== undefined) {
                return opera.extension.postMessage(message);
            }
            opera.extension.broadcastMessage(message);
        },
        on: function(cb) {
            msgTools.readFilter(this, cb);
            opMessaging.cbList.push(cb);
            if (opMessaging.cbList.length > 1) {
                return;
            }
            messagesEnable = true;
            opera.extension.onmessage = function(event) {
                var message = event.data;
                if (message.monoResponseId !== undefined) {
                    return msgTools.cbCaller(message);
                }
                message.source = event.source;
                var response = msgTools.mkResponse(message);
                for (var i = 0, itemCb; itemCb = opMessaging.cbList[i]; i++) {
                    if (msgTools.filter(message, itemCb)) {
                        continue;
                    }
                    itemCb(message.data, response);
                }
            };
        }
    };

    var sfMessaging = !mono.isSafari ? undefined : {
        /**
         * @namespace safari.application
         * @namespace safari.application.activeBrowserWindow.activeTab
         * @namespace safari.extension.globalPage
         * @namespace safari.application.browserWindows
         */
        cbList: [],
        currentTab: function (message) {
            var currentTab = safari.application.activeBrowserWindow.activeTab;
            if (currentTab.page === undefined) {
                msgTools.rmCaller(message.monoResponseId);
                return;
            }
            message.monoTo = defaultId;
            currentTab.page.dispatchMessage("message", message);
        },
        send: function (message) {
            var source = message.source;
            if (source !== undefined) {
                delete message.source;
                if (source.page !== undefined) {
                    return source.page.dispatchMessage("message", message);
                }
            }
            if (mono.isSafariPopup) {
                return safari.extension.globalPage.contentWindow.mono.safariDirectOnMessage({
                    message: message,
                    target: {page: {dispatchMessage: function(name, message) {
                        mono.safariDirectOnMessage({message: message});
                    }}}});
            }
            if (mono.isSafariBgPage) {
                for (var w = 0, window; window = safari.application.browserWindows[w]; w++) {
                    for (var t = 0, tab; tab = window.tabs[t]; t++) {
                        if (!tab.page || !tab.page.dispatchMessage) {
                            continue;
                        }
                        tab.page.dispatchMessage("message", message);
                    }
                }
                return;
            }
            safari.self.tab.dispatchMessage("message", message);
        },
        on: function (cb) {
            msgTools.readFilter(this, cb);
            sfMessaging.cbList.push(cb);
            if (sfMessaging.cbList.length > 1) {
                return;
            }
            messagesEnable = true;
            var onMessage = function(event) {
                var message = event.message;
                if (message.monoResponseId !== undefined) {
                    return msgTools.cbCaller(message);
                }
                message.source = event.target;
                var response = msgTools.mkResponse(message);
                for (var i = 0, itemCb; itemCb = sfMessaging.cbList[i]; i++) {
                    if (msgTools.filter(message, itemCb)) {
                        continue;
                    }
                    itemCb(message.data, response);
                }
            };
            if ( (mono.isSafariPopup || mono.isSafariBgPage) && mono.safariDirectOnMessage === undefined ) {
                mono.safariDirectOnMessage = onMessage;
            }
            if (mono.isSafariBgPage) {
                return safari.application.addEventListener("message", onMessage, false);
            }
            safari.self.addEventListener("message", onMessage, false);
        }
    };

    var gmMessaging = !mono.isGM ? undefined : {
        cbList: [],
        gotMsg: function() {},
        currentTab: function (message) {
            message.monoTo = defaultId;
            gmMessaging.gotMsg(message);
        },
        send: function (message) {
            gmMessaging.gotMsg(message);
        },
        on: function (cb) {
            msgTools.readFilter(this, cb);
            gmMessaging.cbList.push(cb);
            if (gmMessaging.cbList.length > 1) {
                return;
            }
            messagesEnable = true;
            gmMessaging.gotMsg = function (message) {
                if (message.monoResponseId !== undefined) {
                    return msgTools.cbCaller(message);
                }
                var response = msgTools.mkResponse(message);
                for (var i = 0, itemCb; itemCb = gmMessaging.cbList[i]; i++) {
                    if (msgTools.filter(message, itemCb)) {
                        continue;
                    }
                    itemCb(message.data, response);
                }
            };
        }
    };

    mono.sendMessage = function(message, cb, to) {
        message = {
            data: message,
            monoTo: to || defaultId,
            monoFrom: mono.pageId
        };
        if (this.from !== undefined) {
            message.monoFrom = this.from;
        }
        if (this.timeout !== undefined) {
            message.timeout = this.timeout;
        }
        mono.debug.messages && console.log(mono.pageId, 'monoLog:', 'sendMessage', 'to:', to, message);
        msgTools.cbCollector(message, cb);
        if (to === 'activeTab') {
            return mono.sendMessage.currentTab(message);
        }
        mono.sendMessage.send(message);
    };

    if (mono.isChrome) {
        mono.sendMessage.send = chMessaging.send;
        mono.sendMessage.currentTab = chMessaging.currentTab;
        mono.onMessage = chMessaging.on;
    } else
    if (mono.isFF) {
        if (mono.noAddon) {
            ffVirtualPort();
        }
        mono.sendMessage.send = ffMessaging.send;
        mono.sendMessage.currentTab = ffMessaging.currentTab;
        mono.onMessage = ffMessaging.on;
    } else
    if (mono.isOpera) {
        mono.sendMessage.send = opMessaging.send;
        mono.sendMessage.currentTab = opMessaging.currentTab;
        mono.onMessage = opMessaging.on;
    } else
    if (mono.isSafari) {
        mono.sendMessage.send = sfMessaging.send;
        mono.sendMessage.currentTab = sfMessaging.currentTab;
        mono.onMessage = sfMessaging.on;
    } else
    if (mono.isGM) {
        mono.sendMessage.send = gmMessaging.send;
        mono.sendMessage.currentTab = gmMessaging.currentTab;
        mono.onMessage = gmMessaging.on;
    }

    //> utils
    mono.loadLanguage = function(cb, force) {
        var language = {};
        var url = '_locales/{lang}/messages.json';
        if (mono.isOpera && !mono.isOperaInject) {
            url = 'build/' + url;
        }
        if (mono.isModule) {
            var window = require('sdk/window/utils').getMostRecentBrowserWindow();
            var self = require('sdk/self');
        }
        var lang, data;
        if (mono.isChrome) {
            lang = chrome.i18n.getMessage('lang');
        } else {
            lang = ((typeof navigator !== 'undefined') ? navigator : window.navigator).language.substr(0, 2);
        }

        url = url.replace('{lang}', force || lang);
        if (mono.isModule) {
            try {
                data = JSON.parse(self.data.load(url));
            } catch (e) {
                if (force) {
                    return cb();
                }
                return mono.loadLanguage(cb, 'en');
            }
            for (var item in data) {
                language[item] = data[item].message;
            }
            return cb(language);
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
            var data = xhr.response;
            for (var item in data) {
                language[item] = data[item].message;
            }
            cb(language);
        };
        xhr.onerror = function() {
            if (force) {
                return cb();
            }
            mono.loadLanguage(cb, 'en');
        };
        try {
            xhr.send();
        } catch (e) {
            xhr.onerror();
        }
    };
    //<utils

    return mono;
}));