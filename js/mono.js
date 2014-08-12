/**
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine.
 */
var mono = function (env) {
    /**
     * @namespace chrome
     * @namespace chrome.app
     * @namespace chrome.app.getDetails
     *
     * @namespace safari.self.identifier
     *
     * @namespace addon
     */
    var mono = function() {
        // mono like console.log
        var args = Array.prototype.slice.call(arguments);
        args.unshift(mono.pageId,'monoLog:');
        console.log.apply(console, args);
    };

    var defaultId = 'monoScope';
    var addon;
    if (typeof window === 'undefined') {
        mono.isModule = true;
        mono.isFF = true;
        addon = env;
    } else {
        if (typeof GM_getValue !== 'undefined') {
            mono.isGM = true;
            mono.isTM = navigator.userAgent.indexOf('Firefox') === -1;
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
        } else
        if (window.safari !== undefined) {
            mono.isSafari = true;
            mono.isSafariPopup = safari.self.identifier === 'popup';
            mono.isSafariBgPage = safari.self.addEventListener === undefined;
        } else
        if (window.opera !== undefined) {
            mono.isOpera = true;
        } else {
            addon = window.addon || window.self;
            if (addon !== undefined && addon.port !== undefined) {
                mono.isFF = true;
            } else
            if (navigator.userAgent.indexOf('Firefox') !== -1) {
                mono.isFF = true;
                mono.noAddon = true;
            }
        }
    }
    mono.messageStack = 50;
    mono.addon = addon;
    mono.pageId = defaultId;
    mono.debug = {
        messages: false
    };

    var messagesEnable = false;

    var externalStorage = {
        get: function(src, cb) {
            mono.sendMessage({action: 'get', data: src}, cb, 'monoStorage');
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
                mono('localStorage','Can\'t save item', key,', very big!');
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

    var monoStorage = function() {
        /**
         * @namespace require
         */
        var ss = require("sdk/simple-storage");
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

    var gmStorage = {
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
        if (mono.isFF) {
            return externalStorage;
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
                mono.debug.messages && mono('cbCollector', message);
                if (cb === undefined) {
                    return;
                }
                !messagesEnable && mono.onMessage(function(){});
                if (cbStack.length > mono.messageStack) {
                    mono('Stack overflow!');
                    delete cbObj[cbStack.shift()];
                }
                id++;
                message.monoCallbackId = idPrefix+id;
                cbObj[idPrefix+id] = cb;
                cbStack.push(idPrefix+id);
            },
            cbCaller: function(message, pageId) {
                mono.debug.messages && mono('cbCaller', message);
                if (cbObj[message.monoResponseId] === undefined) {
                    if (message.monoResponseId.indexOf(idPrefix) === -1) {
                        return;
                    }
                    return mono('Send to', pageId, 'Id', message.monoResponseId,'Message response not found!');
                }
                cbObj[message.monoResponseId](message.data);
                delete cbObj[message.monoResponseId];
                cbStack.splice(cbStack.indexOf(message.monoResponseId), 1);
            },
            mkResponse: function(message, pageId) {
                mono.debug.messages && mono('mkResponse', message);
                var response;
                if (message.monoCallbackId !== undefined) {
                    response = function(responseMessage) {
                        responseMessage = {
                            data: responseMessage,
                            monoResponseId: message.monoCallbackId,
                            monoTo: message.monoFrom,
                            monoFrom: pageId
                        };
                        if (message.tabId !== undefined) {
                            responseMessage.tabId = message.tabId;
                        }
                        if (message.source !== undefined) {
                            responseMessage.source = message.source;
                        }
                        mono.debug.messages && mono('sendResponse', responseMessage);
                        mono.sendMessage.send(responseMessage);
                    }
                }
                return response;
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
                        return 1;
                    }
                } else
                if (cb.filter.indexOf(message.monoTo) === -1) {
                    return 1;
                }
                return undefined;
            }
        }
    }();

    var ffVirtualPort = function() {
        /**
         * @namespace postMessage
         */
        var onCollector = [];
        mono.addon = addon = {
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
                        onCollector.forEach(function(cb) {
                            cb(json);
                        });
                    });
                }
            }
        }
    };

    var ffMessaging = {
        currentTab: function (message) {
            mono.sendMessage({action: 'toActiveTab', message: message}, undefined, 'service');
        },
        send: function(message) {
            addon.port.emit('mono', message);
        },
        on: function(cb) {
            var firstEvent = messagesEnable;
            messagesEnable = true;
            msgTools.readFilter(this, cb);
            var pageId = cb.filter[0];
            var onMessage = function(message) {
                if (msgTools.filter(message, cb)) {
                    return;
                }
                if (firstEvent === false && message.monoResponseId) {
                    return msgTools.cbCaller(message, pageId);
                }
                var response = msgTools.mkResponse(message, pageId);
                cb(message.data, response);
            };
            addon.port.on('mono', onMessage);
        }
    };

    var chMessaging = {
        /**
         * @namespace chrome.runtime
         * @namespace chrome.tabs.query
         */
        currentTab: function (message) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0] === undefined) {
                    msgTools.rmCaller(message.monoResponseId);
                    return;
                }
                message.monoTo = defaultId;
                chrome.tabs.sendMessage(tabs[0].id, message);
            });
        },
        send: function(message) {
            var tabId = message.tabId;
            if (tabId !== undefined) {
                delete message.tabId;
                return chrome.tabs.sendMessage(tabId, message);
            }
            chrome.runtime.sendMessage(message);
        },
        on: function(cb) {
            var firstEvent = messagesEnable;
            messagesEnable = true;
            msgTools.readFilter(this, cb);
            var pageId = cb.filter[0];
            chrome.runtime.onMessage.addListener(function(message, sender) {
                if (msgTools.filter(message, cb)) {
                    return;
                }
                if (sender.tab !== undefined) {
                    message.tabId = sender.tab.id;
                }
                if (firstEvent === false && message.monoResponseId) {
                    return msgTools.cbCaller(message, pageId);
                }
                var response = msgTools.mkResponse(message, pageId);
                cb(message.data, response);
            });
        }
    };

    var opMessaging = {
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
                return source.postMessage(message);
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
                message.source = event.source;
                if (message.monoResponseId) {
                    return msgTools.cbCaller(message, message.monoTo);
                }
                var response = msgTools.mkResponse(message, message.monoTo);
                for (var i = 0, itemCb; itemCb = opMessaging.cbList[i]; i++) {
                    if (msgTools.filter(message, itemCb)) {
                        continue;
                    }
                    itemCb(message.data, response);
                }
            };
        }
    };

    var sfMessaging = {
        /**
         * @namespace safari.application
         * @namespace safari.application.activeBrowserWindow.activeTab
         * @namespace safari.extension.globalPage
         * @namespace safari.application.browserWindows
         */
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
                return safari.application.browserWindows.forEach(function(window) {
                    window.tabs.forEach(function(tab) {
                        if (!tab.page || !tab.page.dispatchMessage) {
                            return 1;
                        }
                        tab.page.dispatchMessage("message", message);
                    });
                });
            }
            safari.self.tab.dispatchMessage("message", message);
        },
        on: function (cb) {
            var firstEvent = messagesEnable;
            messagesEnable = true;
            msgTools.readFilter(this, cb);
            var pageId = cb.filter[0];
            var onMessage = function(event) {
                var message = event.message;
                if (msgTools.filter(message, cb)) {
                    return;
                }
                message.source = event.target;
                if (firstEvent === false && message.monoResponseId) {
                    return msgTools.cbCaller(message, pageId);
                }
                var response = msgTools.mkResponse(message, pageId);
                cb(message.data, response);
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

    var gmMessaging = {
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
                if (message.monoResponseId) {
                    return msgTools.cbCaller(message, message.monoTo);
                }
                var response = msgTools.mkResponse(message, message.monoTo);
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
        mono.debug.messages && mono('sendMessage', 'to:', to, 'hasCallback', !!cb, message);
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

    return mono;
};

if (typeof window !== "undefined") {
    mono = mono(window);
} else {
    exports.init = mono;
}