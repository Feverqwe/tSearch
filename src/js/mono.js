// ==UserScript==
// @exclude     file://*
// ==/UserScript==

/**
 *
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine.
 *
 **/

var mono = (typeof mono !== 'undefined') ? mono : undefined;

(function(window, factory) {
    if (mono) {
        return;
    }

    if (window) {
        return mono = factory();
    }

    exports.isFF = true;
    exports.isModule = true;

    exports.init = factory;
}(typeof window !== "undefined" ? window : undefined, function(_addon) {
    var require;

    /**
     * Mono
     * @type {{
     * isModule: Boolean,
     * isFF: Boolean,
     * isGM: Boolean,
     * isTM: Boolean,
     * isChrome: Boolean,
     * isChromeApp: Boolean,
     * isChromeWebApp: Boolean,
     * isChromeInject: Boolean,
     * isSafari: Boolean,
     * isSafariPopup: Boolean,
     * isSafariBgPage: Boolean,
     * isSafariInject: Boolean,
     * isOpera: Boolean,
     * isOperaInject: Boolean,
     * messageStack: number,
     * cloneObj: Function,
     * msgClearStack: Function,
     * msgRemoveCbById: Function,
     * sendMessage: Function,
     * sendMessageToActiveTab: Function,
     * sendHook: Object,
     * onMessage: Function
     * storage: Object
     * }}
     */
    var mono = {};

    (function() {
        //@strip_firefox_>
        if (typeof window === 'undefined') {
            /**
             * @namespace _require
             */
            mono.isFF = true;
            mono.isModule = true;
            mono.addon = _addon;
            require = _require;
            return;
        }
        //@strip_firefox_<

        if (location.host === 'static.tms.mooo.com') {
            mono.isWebApp = true;
            return;
        }

        //@strip_gm_>
        if (typeof GM_getValue !== 'undefined') {
            mono.isGM = true;
            if (window.hasOwnProperty('chrome')) {
                mono.isTM = true;
            } else
            if (navigator.userAgent.indexOf('Maxthon/') !== -1) {
                mono.isVM = true;
            }
            return;
        }
        //@strip_gm_<

        //@strip_chrome_>
        if (window.hasOwnProperty('chrome')) {
            mono.isChrome = true;
            mono.isChromeInject = !chrome.hasOwnProperty('tabs');
            if (!chrome.app.hasOwnProperty('getDetails')) {
                mono.isChromeApp = true;
            } else {
                var details = chrome.app.getDetails();
                if (details && details.hasOwnProperty('app')) {
                    mono.isChromeWebApp = true;
                }
                details = undefined;
            }
            return;
        }
        //@strip_chrome_<

        //@strip_opera_>
        if (window.hasOwnProperty('opera')) {
            mono.isOpera = true;
            mono.isOperaInject = opera.extension.broadcastMessage === undefined;
            return;
        }
        //@strip_opera_<

        //@strip_firefox_>
        if (navigator.userAgent.indexOf('Firefox') !== -1) {
            mono.isFF = true;
            if (typeof addon !== 'undefined' && addon.hasOwnProperty('port')) {
                mono.addon = addon;
            } else
            if (typeof self !== 'undefined' && self.hasOwnProperty('port')) {
                mono.addon = self;
            } else {
                mono.noAddon = true;
            }
            return;
        }
        //@strip_firefox_<

        //@strip_safari_>
        if (window.hasOwnProperty('safari')) {
            mono.isSafari = true;
            mono.isSafariPopup = safari.self.identifier === 'popup';
            mono.isSafariBgPage = safari.self.addEventListener === undefined;
            mono.isSafariInject = !mono.isSafariPopup && safari.application === undefined;
            return;
        }
        if (navigator.userAgent.indexOf('Safari/') !== -1) {
            // Safari bug!
            mono.isSafari = true;
            return;
        }
        //@strip_safari_<

        console.error('Mono: can\'t define browser!');
    })();

    mono.cloneObj = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    /**
     * Clone array or object via JSON
     * @param {object|Array} obj
     * @returns {object|Array}
     */

    var msgTools = {
        cbObj: {},
        cbStack: [],
        id: 0,
        idPrefix: Math.floor(Math.random() * 1000) + '_',
        /**
         * Add callback function in cbObj and cbStack
         * @param {object} message - Message
         * @param {function} cb - Callback function
         */
        addCb: function(message, cb) {
            mono.onMessage.inited === undefined && mono.onMessage(function() {});

            if (msgTools.cbStack.length > mono.messageStack) {
                msgTools.clean();
            }
            var id = message.callbackId = msgTools.idPrefix + (++msgTools.id);
            msgTools.cbObj[id] = {
                fn: cb,
                time: Date.now()
            };
            msgTools.cbStack.push(id);
        },
        /**
         * Call function from callback list
         * @param {object} message
         */
        callCb: function(message) {
            var cb = msgTools.cbObj[message.responseId];
            if (cb === undefined) return;
            delete msgTools.cbObj[message.responseId];
            msgTools.cbStack.splice(msgTools.cbStack.indexOf(message.responseId), 1);
            cb.fn(message.data);
        },
        /**
         * Response function
         * @param {function} response
         * @param {string} callbackId
         * @param {*} responseMessage
         */
        mkResponse: function(response, callbackId, responseMessage) {
            if (callbackId === undefined) return;

            responseMessage = {
                data: responseMessage,
                responseId: callbackId
            };
            response.call(this, responseMessage);
        },
        /**
         * Clear callback stack
         */
        clearCbStack: function() {
            for (var item in msgTools.cbObj) {
                delete msgTools.cbObj[item];
            }
            msgTools.cbStack.splice(0);
        },
        /**
         * Remove item from cbObj and cbStack by cbId
         * @param {string} cbId - Callback id
         */
        removeCb: function(cbId) {
            var cb = msgTools.cbObj[cbId];
            if (cb === undefined) return;
            delete msgTools.cbObj[cbId];
            msgTools.cbStack.splice(msgTools.cbStack.indexOf(cbId), 1);
        },
        /**
         * Remove old callback from cbObj
         * @param {number} aliveTime - Keep alive time
         */
        clean: function(aliveTime) {
            var now = Date.now();
            aliveTime = aliveTime || 120 * 1000;
            for (var item in msgTools.cbObj) {
                if (msgTools.cbObj[item].time + aliveTime < now) {
                    delete msgTools.cbObj[item];
                    msgTools.cbStack.splice(msgTools.cbStack.indexOf(item), 1);
                }
            }
        }
    };

    mono.messageStack = 50;
    mono.msgClearStack = msgTools.clearCbStack;
    mono.msgRemoveCbById = msgTools.removeCb;
    mono.msgClean = msgTools.clean;

    /**
     * Send message if background page - to local pages, or to background page
     * @param {*} message - Message
     * @param {function} [cb] - Callback function
     * @param {string} [hook] - Hook string
     * @returns {*|string} - callback id
     */
    mono.sendMessage = function(message, cb, hook) {
        message = {
            data: message,
            hook: hook
        };
        if (cb) {
            msgTools.addCb(message, cb.bind(this));
        }
        mono.sendMessage.send.call(this, message);

        return message.callbackId;
    };

    /**
     * Send message to active page, background page only
     * @param {*} message - Message
     * @param {function} [cb] - Callback function
     * @param {string} [hook] - Hook string
     * @returns {*|string} - callback id
     */
    mono.sendMessageToActiveTab = function(message, cb, hook) {
        message = {
            data: message,
            hook: hook
        };
        if (cb) {
            msgTools.addCb(message, cb.bind(this));
        }
        mono.sendMessage.sendToActiveTab.call(this, message);

        return message.callbackId;
    };

    /**
     * Mono message hooks
     * @type {{}}
     */
    mono.sendHook = {};

    /**
     * Listen messages and call callback function
     * @param {function} cb - Callback function
     */
    mono.onMessage = function(cb) {
        var _this = this;
        mono.onMessage.inited = 1;
        mono.onMessage.on.call(_this, function(message, response) {
            if (message.responseId !== undefined) {
                return msgTools.callCb(message);
            }
            var mResponse = msgTools.mkResponse.bind(_this, response, message.callbackId);
            if (message.hook !== undefined) {
                var hookFunc = mono.sendHook[message.hook];
                if (hookFunc !== undefined) {
                    return hookFunc(message.data, mResponse);
                }
            }
            cb.call(_this, message.data, mResponse);
        });
    };

    mono.storage = undefined;

    (function() {
        if (!mono.isChrome || !(chrome.hasOwnProperty('runtime') && chrome.runtime.onMessage)) return;

        var lowLevelHook = {};

        var chromeMsg = {
            cbList: [],
            mkResponse: function(sender) {
                if (sender.tab) {
                    // send to tab
                    return function(message) {
                        chromeMsg.sendTo(message, sender.tab.id);
                    }
                }
                if (sender.monoDirect) {
                    return function(message) {
                        sender(mono.cloneObj(message), chromeMsg.onMessage);
                    };
                }
                return function(message) {
                    // send to extension
                    chromeMsg.send(message);
                }
            },
            sendTo: function(message, tabId) {
                chrome.tabs.sendMessage(tabId, message);
            },
            onMessage: function(message, sender, _response) {
                if (mono.isChromeBgPage === 1) {
                    if (message.fromBgPage === 1) {
                        // block msg's from bg page to bg page.
                        return;
                    }
                } else if (message.toBgPage === 1) {
                    // block msg to bg page not in bg page.
                    return;
                }

                if (message.hook !== undefined) {
                    var hookFunc = lowLevelHook[message.hook];
                    if (hookFunc !== undefined) {
                        return hookFunc(message, sender, _response);
                    }
                }

                var response = chromeMsg.mkResponse(sender);
                for (var i = 0, cb; cb = chromeMsg.cbList[i]; i++) {
                    cb(message, response);
                }
            },
            on: function(cb) {
                chromeMsg.cbList.push(cb);
                if (chromeMsg.cbList.length !== 1) {
                    return;
                }
                chrome.runtime.onMessage.addListener(chromeMsg.onMessage);
            },
            sendToActiveTab: function(message) {
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    if (tabs[0] === undefined || tabs[0].id < 0) {
                        return;
                    }
                    chromeMsg.sendTo(message, tabs[0].id);
                });
            },
            send: function(message) {
                if (mono.isChromeBgPage) {
                    message.fromBgPage = 1;
                } else {
                    message.toBgPage = 1;
                }
                chrome.runtime.sendMessage(message);
            }
        };

        chromeMsg.on.lowLevelHook = lowLevelHook;

        (function() {
            if (!chrome.runtime.hasOwnProperty('getBackgroundPage')) return;

            mono.isChromeBgPage = location.href.indexOf('_generated_background_page.html') !== -1;

            chrome.runtime.getBackgroundPage(function(bgWin) {
                if (bgWin !== window) {
                    delete mono.isChromeBgPage;
                } else {
                    mono.isChromeBgPage = 1;
                }

                if (!mono.isChromeBgPage) {
                    chromeMsg.onMessage.monoDirect = true;
                    chromeMsg.send = mono.sendMessage.send = function(message) {
                        bgWin.mono.chromeDirectOnMessage(mono.cloneObj(message), chromeMsg.onMessage);
                    }
                } else
                if (mono.chromeDirectOnMessage === undefined) {
                    mono.chromeDirectOnMessage = function(message, sender) {
                        chromeMsg.onMessage(message, sender);
                    };
                }
            });
        })();

        mono.onMessage.on = chromeMsg.on;
        mono.sendMessage.send = chromeMsg.send;
        mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
    })();
    (function() {
        if (!mono.isFF) return;

        (function() {
            if (!mono.noAddon) return;

            var onCollector = [];
            mono.addon = {
                port: {
                    emit: function(pageId, message) {
                        var msg = '>' + JSON.stringify(message);
                        window.postMessage(msg, "*");
                    },
                    on: function(pageId, onMessage) {
                        onCollector.push(onMessage);
                        if (onCollector.length > 1) {
                            return;
                        }
                        window.addEventListener('monoMessage', function(e) {
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
        })();

        var firefoxMsg = {
            cbList: [],
            mkResponse: function(pageId) {
                return function(message) {
                    firefoxMsg.sendTo(message, pageId);
                }
            },
            on: function(cb) {
                firefoxMsg.cbList.push(cb);
                if (firefoxMsg.cbList.length !== 1) {
                    return;
                }
                mono.addon.port.on('mono', function(msg) {
                    var response = firefoxMsg.mkResponse(msg.from);
                    for (var i = 0, cb; cb = firefoxMsg.cbList[i]; i++) {
                        cb(msg, response);
                    }
                });
            },
            send: function(message) {
                mono.addon.port.emit('mono', message);
            },
            sendTo: function(message, to) {
                message.to = to;
                mono.addon.port.emit('mono', message);
            },
            sendToActiveTab: function(message) {
                message.hook = 'activeTab';
                firefoxMsg.sendTo(message);
            }
        };

        mono.onMessage.on = firefoxMsg.on;
        mono.sendMessage.send = firefoxMsg.send;
        mono.sendMessage.sendToActiveTab = firefoxMsg.sendToActiveTab;
    })();
    (function() {
        if (!mono.isChrome || (chrome.hasOwnProperty('runtime') && chrome.runtime.onMessage)) return;

        var lowLevelHook = {};

        var chromeMsg = {
            cbList: [],
            mkResponse: function(sender, _response) {
                if (sender.tab && sender.tab.id > -1) {
                    // send to tab
                    return function(message) {
                        chromeMsg.sendTo(message, sender.tab.id);
                    }
                }

                return function(message) {
                    // send to extension
                    _response(message);
                }
            },
            sendTo: function(message, tabId) {
                chrome.tabs.sendRequest(tabId, message, function(message) {
                    if (message && message.responseId !== undefined) {
                        return msgTools.callCb(message);
                    }
                });
            },
            onMessage: function(message, sender, _response) {
                if (mono.isChromeBgPage === 1) {
                    if (message.fromBgPage === 1) {
                        // block msg's from bg page to bg page.
                        return;
                    }
                } else if (message.toBgPage === 1) {
                    // block msg to bg page not in bg page.
                    return;
                }

                if (message.hook !== undefined) {
                    var hookFunc = lowLevelHook[message.hook];
                    if (hookFunc !== undefined) {
                        return hookFunc(message, sender, _response);
                    }
                }

                var response = chromeMsg.mkResponse(sender, _response);
                for (var i = 0, cb; cb = chromeMsg.cbList[i]; i++) {
                    cb(message, response);
                }
            },
            on: function(cb) {
                chromeMsg.cbList.push(cb);
                if (chromeMsg.cbList.length !== 1) {
                    return;
                }
                chrome.extension.onRequest.addListener(chromeMsg.onMessage);
            },
            sendToActiveTab: function(message) {
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    if (tabs[0] === undefined || tabs[0].id < 0) {
                        return;
                    }
                    chromeMsg.sendTo(message, tabs[0].id);
                });
            },
            send: function(message) {
                if (mono.isChromeBgPage) {
                    message.fromBgPage = 1;
                } else {
                    message.toBgPage = 1;
                }
                chrome.extension.sendRequest(message, function(message) {
                    if (message && message.responseId !== undefined) {
                        return msgTools.callCb(message);
                    }
                });
            }
        };

        chromeMsg.on.lowLevelHook = lowLevelHook;

        (function() {
            try {
                if (chrome.runtime.getBackgroundPage === undefined) return;
            } catch (e) {
                return;
            }

            mono.isChromeBgPage = location.href.indexOf('_generated_background_page.html') !== -1;

            chrome.runtime.getBackgroundPage(function(bgWin) {
                if (bgWin !== window) {
                    delete mono.isChromeBgPage;
                } else {
                    mono.isChromeBgPage = 1;
                }
            });
        })();

        mono.onMessage.on = chromeMsg.on;
        mono.sendMessage.send = chromeMsg.send;
        mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
    })();
    (function() {
        if (!mono.isSafari) return;

        var localUrl, localUrlLen;
        if (mono.isSafariBgPage && window.location && window.location.href) {
            localUrl = window.location.href.substr(0, window.location.href.indexOf('/', 19));
            localUrlLen = localUrl.length;
        }

        var safariMsg = {
            cbList: [],
            mkResponse: !mono.isSafariBgPage ? function() {
                return function(message) {
                    safariMsg.send(message);
                }
            } : function(source) {
                return function(message) {
                    safariMsg.sendTo(message, source);
                }
            },
            sendTo: function(message, source) {
                if (!source.page || !source.page.dispatchMessage) {
                    return;
                }
                source.page.dispatchMessage("message", message);
            },
            onMessage: function(event) {
                var message = event.message;
                var response = safariMsg.mkResponse(event.target);
                for (var i = 0, cb; cb = safariMsg.cbList[i]; i++) {
                    cb(message, response);
                }
            },
            on: function(cb) {
                safariMsg.cbList.push(cb);
                if (safariMsg.cbList.length !== 1) {
                    return;
                }
                if ((mono.isSafariPopup || mono.isSafariBgPage) && mono.safariDirectOnMessage === undefined) {
                    mono.safariDirectOnMessage = safariMsg.onMessage;
                }
                if (mono.isSafariBgPage) {
                    return safari.application.addEventListener("message", safariMsg.onMessage, false);
                }
                safari.self.addEventListener("message", safariMsg.onMessage, false);
            },
            sendToActiveTab: function(message) {
                var currentTab = safari.application.activeBrowserWindow.activeTab;
                safariMsg.sendTo(message, currentTab);
            },
            send: mono.isSafariPopup ? function(message) {
                safari.extension.globalPage.contentWindow.mono.safariDirectOnMessage({
                    message: mono.cloneObj(message),
                    target: {
                        page: {
                            dispatchMessage: function(name, message) {
                                mono.safariDirectOnMessage({
                                    message: mono.cloneObj(message)
                                });
                            }
                        }
                    }
                });
            } : mono.isSafariBgPage ? function(message) {
                for (var p = 0, popup; popup = safari.extension.popovers[p]; p++) {
                    popup.contentWindow.mono.safariDirectOnMessage({
                        message: mono.cloneObj(message),
                        target: {
                            page: {
                                dispatchMessage: function(name, message) {
                                    mono.safariDirectOnMessage({
                                        message: mono.cloneObj(message)
                                    });
                                }
                            }
                        }
                    });
                }
                for (var w = 0, window; window = safari.application.browserWindows[w]; w++) {
                    for (var t = 0, tab; tab = window.tabs[t]; t++) {
                        if (tab.url && tab.url.substr(0, localUrlLen) === localUrl) {
                            safariMsg.sendTo(message, tab);
                        }
                    }
                }
            } : function(message) {
                safariMsg.sendTo(message, {
                    page: safari.self.tab
                });
            }
        };

        mono.onMessage.on = safariMsg.on;
        mono.sendMessage.send = safariMsg.send;
        mono.sendMessage.sendToActiveTab = safariMsg.sendToActiveTab;
    })();
    (function() {
        if (!mono.isOpera) return;

        var inLocalScope = window.location && window.location.href && window.location.href.substr(0, 9) === 'widget://';

        var operaMsg = {
            cbList: [],
            mkResponse: function(source) {
                return function(message) {
                    operaMsg.sendTo(message, source);
                }
            },
            sendTo: function(message, source) {
                try {
                    source.postMessage(message);
                } catch (e) {}
            },
            on: function(cb) {
                operaMsg.cbList.push(cb);
                if (operaMsg.cbList.length !== 1) {
                    return;
                }
                opera.extension.onmessage = function(event) {
                    var message = event.data;
                    if (message.toLocalScope === 1 && inLocalScope === false) return;
                    var response = operaMsg.mkResponse(event.source);
                    for (var i = 0, cb; cb = operaMsg.cbList[i]; i++) {
                        cb(message, response);
                    }
                }
            },
            sendToActiveTab: function(message) {
                var currentTab = opera.extension.tabs.getSelected();
                operaMsg.sendTo(message, currentTab);
            },
            send: mono.isOperaInject ? function(message) {
                operaMsg.sendTo(message, opera.extension);
            } : function(message) {
                message.toLocalScope = 1;
                opera.extension.broadcastMessage(message);
            }
        };

        mono.onMessage.on = operaMsg.on;
        mono.sendMessage.send = operaMsg.send;
        mono.sendMessage.sendToActiveTab = operaMsg.sendToActiveTab;
    })();
    (function() {
        if (!mono.isGM) return;

        var gmMsg = {
            cbList: [],
            onMessage: function(_message) {
                var message = mono.cloneObj(_message);
                var response = gmMsg.onMessage;
                for (var i = 0, cb; cb = gmMsg.cbList[i]; i++) {
                    if (this.isBg === cb.isBg) {
                        continue;
                    }
                    cb(message, response.bind({
                        isBg: cb.isBg
                    }));
                }
            },
            on: function(cb) {
                cb.isBg = this.isBg;
                gmMsg.cbList.push(cb);
            }
        };
        gmMsg.send = gmMsg.onMessage;

        mono.onMessage.on = gmMsg.on;
        mono.sendMessage.send = gmMsg.send;
        mono.sendMessage.sendToActiveTab = gmMsg.onMessage.bind({
            isBg: true
        });
    })();

    (function() {
        if (!mono.isChrome || !chrome.hasOwnProperty('storage')) return;

        /**
         * Chrome storage mode
         * @param {string} mode - Local/Sync
         * @returns {{get: Function, set: Function, remove: Function, clear: Function}}
         */
        var chStorage = function(mode) {
            return chrome.storage[mode];
        };

        /**
         * Chrome storage
         * @type {{get: Function, set: Function, remove: Function, clear: Function}}
         */
        mono.storage = chStorage('local');
        /**
         * Chrome local
         * @type {{get: Function, set: Function, remove: Function, clear: Function}|mono.storage|*}
         */
        mono.storage.local = mono.storage;
        /**
         * Chrome sync storage
         * @type {{get: Function, set: Function, remove: Function, clear: Function}}
         */
        mono.storage.sync = chStorage('sync');
    })();
    (function() {
        if (!mono.isFF) return;

        if (!mono.isModule) {
            /**
             * External storage mode
             * @type {{get: Function, set: Function, remove: Function, clear: Function}}
             */
            var externalStorage = {
                /**
                 * Get item from storage
                 * @param {string|null|undefined|Array|Object} obj - Item's, null/undefined - all items
                 * @param {function} cb - Callback function
                 */
                get: function(obj, cb) {
                    mono.sendMessage({
                        action: 'get',
                        data: obj
                    }, cb, 'monoStorage');
                },
                /**
                 * Set item in storage
                 * @param {Object} obj
                 * @param {function} [cb]
                 */
                set: function(obj, cb) {
                    mono.sendMessage({
                        action: 'set',
                        data: obj
                    }, cb, 'monoStorage');
                },
                /**
                 * Remove item from storage
                 * @param {Array|string} obj
                 * @param {function} [cb]
                 */
                remove: function(obj, cb) {
                    mono.sendMessage({
                        action: 'remove',
                        data: obj
                    }, cb, 'monoStorage');
                },
                /**
                 * Clear storage
                 * @param {function} [cb]
                 */
                clear: function(cb) {
                    mono.sendMessage({
                        action: 'clear'
                    }, cb, 'monoStorage');
                }
            };
            mono.storage = externalStorage;
            mono.storage.local = mono.storage.sync = mono.storage;
            return;
        }

        /**
         * Firefox simple storage
         * @returns {{get: Function, set: Function, remove: Function, clear: Function}}
         */
        var ffSimpleStorage = function() {
            var ss = require('sdk/simple-storage');
            return {
                /**
                 * Get item from storage
                 * @param {string|null|undefined|Array|Object} src - Item's, null/undefined - all items
                 * @param {function} cb - Callback function
                 */
                get: function(src, cb) {
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
                            if (!ss.storage.hasOwnProperty(key)) {
                                continue;
                            }
                            obj[key] = ss.storage[key];
                        }
                    } else {
                        for (key in src) {
                            if (!ss.storage.hasOwnProperty(key)) {
                                continue;
                            }
                            obj[key] = ss.storage[key];
                        }
                    }
                    cb(obj);
                },
                /**
                 * Set item in storage
                 * @param {Object} obj
                 * @param {function} [cb]
                 */
                set: function(obj, cb) {
                    for (var key in obj) {
                        ss.storage[key] = obj[key];
                    }
                    cb && cb();
                },
                /**
                 * Remove item from storage
                 * @param {Array|string} obj
                 * @param {function} [cb]
                 */
                remove: function(obj, cb) {
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
                /**
                 * Clear storage
                 * @param {function} [cb]
                 */
                clear: function(cb) {
                    for (var key in ss.storage) {
                        delete ss.storage[key];
                    }
                    cb && cb();
                }
            }
        };

        /**
         * FF Storage
         * @type {{get: Function, set: Function, remove: Function, clear: Function}}
         */
        mono.storage = ffSimpleStorage();
        mono.storage.local = mono.storage.sync = mono.storage;
    })();
    (function() {
        if (!mono.isGM) return;

        /**
         * GM storage
         * @type {{get: Function, set: Function, remove: Function, clear: Function}}
         */
        var storage = {
            /**
             * @namespace GM_listValues
             * @namespace GM_getValue
             * @namespace GM_setValue
             * @namespace GM_deleteValue
             */

            /**
             * Get item from storage
             * @param {string|null|undefined|Array|Object} src - Item's, null/undefined - all items
             * @param {function} cb - Callback function
             */
            get: function(src, cb) {
                var key, value, obj = {};
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
                        value = GM_getValue(key);
                        if (value !== undefined) {
                            if (typeof value !== 'object') {
                                obj[key] = value;
                            } else {
                                obj[key] = JSON.parse(JSON.stringify(value));
                            }
                        }
                    }
                } else {
                    for (key in src) {
                        value = GM_getValue(key);
                        if (value !== undefined) {
                            if (typeof value !== 'object') {
                                obj[key] = value;
                            } else {
                                obj[key] = JSON.parse(JSON.stringify(value));
                            }
                        }
                    }
                }
                cb(obj);
            },
            /**
             * Set item in storage
             * @param {Object} obj
             * @param {function} [cb]
             */
            set: function(obj, cb) {
                for (var key in obj) {
                    if (typeof obj[key] !== 'object') {
                        GM_setValue(key, obj[key]);
                    } else {
                        GM_setValue(key, JSON.parse(JSON.stringify(obj[key])));
                    }
                }
                cb && cb();
            },
            /**
             * Remove item from storage
             * @param {Array|string} obj
             * @param {function} [cb]
             */
            remove: function(obj, cb) {
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
            /**
             * Clear storage
             * @param {function} [cb]
             */
            clear: function(cb) {
                var nameList = GM_listValues();
                for (var key in nameList) {
                    GM_deleteValue(key);
                }
                cb && cb();
            }
        };

        /**
         * GM Storage
         * @type {{get: Function, set: Function, remove: Function, clear: Function}}
         */
        mono.storage = storage;
        mono.storage.local = mono.storage.sync = mono.storage;
    })();
    (function() {
        if (mono.storage) return;

        /**
         * localStorage mode
         * @param {object} localStorage - Storage type
         * @returns {{get: Function, set: Function, remove: Function, clear: Function}}
         */
        var getLocalStorage = function(localStorage) {
            /**
             * localStorage mode
             * @type {{getObj: Function, setObj: Function, rmObj: Function, readValue: Function
             * get: Function, set: Function, remove: Function, clear: Function}}
             */
            var localStorageMode = {
                /**
                 * Get object from localStorage
                 * @param {string} key
                 * @returns {*}
                 */
                getObj: function(key) {
                    var index = 0;
                    var keyPrefix = localStorageMode.chunkPrefix + key;
                    var chunk = localStorage[keyPrefix + index];
                    var data = '';
                    while (chunk !== undefined) {
                        data += chunk;
                        index++;
                        chunk = localStorage[keyPrefix + index];
                    }
                    var value = undefined;
                    try {
                        value = JSON.parse(data);
                    } catch (e) {}
                    return value;
                },
                /**
                 * Set object in localStorage
                 * @param {string} key
                 * @param {*} value
                 */
                setObj: function(key, value) {
                    value = JSON.stringify(value);
                    var keyPrefix = localStorageMode.chunkPrefix + key;
                    var chunkLen = 1024 - keyPrefix.length - 3;
                    if (localStorageMode.regexp === undefined) {
                        localStorageMode.regexp = new RegExp('.{1,' + chunkLen + '}', 'g');
                    }
                    var valueLen = value.length;
                    var number_of_part = Math.floor(valueLen / chunkLen);
                    if (number_of_part >= 512) {
                        console.log('monoLog:', 'localStorage', 'Can\'t save item', key, ', very big!');
                        return;
                    }
                    var dataList = value.match(localStorageMode.regexp);
                    var dataListLen = dataList.length;
                    for (var i = 0, item; i < dataListLen; i++) {
                        item = dataList[i];
                        localStorage[keyPrefix + i] = item;
                    }
                    localStorage[key] = localStorageMode.chunkItem;

                    localStorageMode.rmObj(key, dataListLen);
                },
                /**
                 * Remove object from localStorage
                 * @param {string} key
                 * @param {number} index - Chunk index
                 */
                rmObj: function(key, index) {
                    var keyPrefix = localStorageMode.chunkPrefix + key;
                    if (index === undefined) {
                        index = 0;
                    }
                    var data = localStorage[keyPrefix + index];
                    while (data !== undefined) {
                        delete localStorage[keyPrefix + index];
                        index++;
                        data = localStorage[keyPrefix + index];
                    }
                },
                /**
                 * Read value from localStorage
                 * @param key
                 * @param value
                 * @returns {*}
                 */
                readValue: function(key, value) {
                    if (value === localStorageMode.chunkItem) {
                        value = localStorageMode.getObj(key)
                    } else if (value !== undefined) {
                        var data = value.substr(1);
                        var type = value[0];
                        if (type === 'i') {
                            value = parseFloat(data);
                        } else if (type === 'b') {
                            value = data === 'true';
                        } else {
                            value = data;
                        }
                    }
                    return value;
                },
                /**
                 * Get item from storage
                 * @param {string|null|undefined|Array|Object} src - Item's, null/undefined - all items
                 * @param {function} cb - Callback function
                 */
                get: function(src, cb) {
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
                            if (!localStorage.hasOwnProperty(key)) {
                                continue;
                            }
                            obj[key] = localStorageMode.readValue(key, localStorage[key]);
                        }
                    } else {
                        for (key in src) {
                            if (!localStorage.hasOwnProperty(key)) {
                                continue;
                            }
                            obj[key] = localStorageMode.readValue(key, localStorage[key]);
                        }
                    }
                    cb(obj);
                },
                /**
                 * Set item in storage
                 * @param {Object} obj
                 * @param {function} [cb]
                 */
                set: function(obj, cb) {
                    var key;
                    for (key in obj) {
                        var value = obj[key];
                        if (value === undefined) {
                            localStorageMode.remove(key);
                        } else if (typeof value === 'object') {
                            localStorageMode.setObj(key, value);
                        } else {
                            var type = typeof value;
                            if (type === 'boolean') {
                                value = 'b' + value;
                            } else if (type === 'number') {
                                value = 'i' + value;
                            } else {
                                value = 's' + value;
                            }
                            localStorage[key] = value;
                        }
                    }
                    cb && cb();
                },
                /**
                 * Remove item from storage
                 * @param {Array|string} obj
                 * @param {function} [cb]
                 */
                remove: function(obj, cb) {
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
                /**
                 * Clear storage
                 * @param {function} [cb]
                 */
                clear: function(cb) {
                    localStorage.clear();
                    cb && cb();
                }
            };
            localStorageMode.chunkPrefix = 'mCh_';
            localStorageMode.chunkLen = localStorageMode.chunkPrefix.length;
            localStorageMode.chunkItem = 'monoChunk';
            return localStorageMode;
        };

        /**
         * External storage mode
         * @type {{get: Function, set: Function, remove: Function, clear: Function}}
         */
        var externalStorage = {
            /**
             * Get item from storage
             * @param {string|null|undefined|Array|Object} obj - Item's, null/undefined - all items
             * @param {function} cb - Callback function
             */
            get: function(obj, cb) {
                mono.sendMessage({
                    action: 'get',
                    data: obj
                }, cb, 'monoStorage');
            },
            /**
             * Set item in storage
             * @param {Object} obj
             * @param {function} [cb]
             */
            set: function(obj, cb) {
                mono.sendMessage({
                    action: 'set',
                    data: obj
                }, cb, 'monoStorage');
            },
            /**
             * Remove item from storage
             * @param {Array|string} obj
             * @param {function} [cb]
             */
            remove: function(obj, cb) {
                mono.sendMessage({
                    action: 'remove',
                    data: obj
                }, cb, 'monoStorage');
            },
            /**
             * Clear storage
             * @param {function} [cb]
             */
            clear: function(cb) {
                mono.sendMessage({
                    action: 'clear'
                }, cb, 'monoStorage');
            }
        };

        /**
         *
         * @param {object} message
         * @param {function} [response]
         */
        var externalStorageHook = function(message, response) {
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
        };

        if (false && mono.isOpera && typeof widget !== 'undefined') {
            // remove false if need use prefs
            /**
             * Opera storage
             * @type {{get: Function, set: Function, remove: Function, clear: Function}}
             */
            mono.storage = getLocalStorage(widget.preferences);
            mono.storage.local = mono.storage.sync = mono.storage;
            return;
        }
        if (mono.isFF || mono.isChromeInject || mono.isOperaInject || mono.isSafariInject) {
            /**
             * Firefox bridge storage
             * @type {{get: Function, set: Function, remove: Function, clear: Function}}
             */
            mono.storage = externalStorage;
            mono.storage.local = mono.storage.sync = mono.storage;
            return;
        }
        if (window.localStorage) {
            /**
             * LocalStorage
             * @type {{get: Function, set: Function, remove: Function, clear: Function}}
             */
            mono.storage = getLocalStorage(window.localStorage);
            mono.storage.local = mono.storage.sync = mono.storage;
            if (mono.isChrome || mono.isSafari || mono.isOpera) {
                // ff work via monoLib.js
                mono.sendHook.monoStorage = externalStorageHook;
            }
            return;
        }
        console.error('Can\'t detect storage!');
    })();

    //@insert

    return mono;
}));
