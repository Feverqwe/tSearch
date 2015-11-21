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

(function(window, base, factory) {
    "use strict";
    if (mono && mono.isLoaded) {
        return;
    }

    if (typeof window !== "undefined") {
        return mono = base(factory.bind(null, null, factory), mono);
    }

    //@if0 useFf=1>
    exports.isFF = true;
    exports.isModule = true;

    exports.init = factory;
    //@if0 useFf=1<
}(
    typeof window !== "undefined" ? window : undefined,
    function base(factory, _mono) {
        if (['interactive', 'complete'].indexOf(document.readyState) !== -1) {
            return factory(null, _mono);
        }

        //@if0 useGm=1>
        if (typeof GM_getValue !== 'undefined') {
            return factory(null, _mono);
        }
        //@if0 useGm=1<

        var objCreate = function(o) {
            if (typeof Object.create === 'function') {
                return Object.create(o);
            }
            var a = function() {};
            a.prototype = o;
            return new a();
        };

        var base = objCreate({
            isLoaded: true,
            onReadyStack: [],
            onReady: function() {
                base.onReadyStack.push([this, arguments]);
            }
        });

        var onLoad = function() {
            document.removeEventListener('DOMContentLoaded', onLoad, false);
            window.removeEventListener('load', onLoad, false);

            mono = factory(null, _mono);

            for (var key in base) {
                if (base.hasOwnProperty(key)) {
                    mono[key] = base[key];
                }
            }

            var item;
            while (item = base.onReadyStack.shift()) {
                mono.onReady.apply(item[0], item[1]);
            }
        };

        document.addEventListener('DOMContentLoaded', onLoad, false);
        window.addEventListener('load', onLoad, false);

        return base;
    },
    function initMono(_addon, _mono) {
        var require;

        /**
         * Mono
         * @type {{
         * isLoaded: Boolean,
         * msgType: string,
         * storageType: string,
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
        var mono = {
            isLoaded: true,
            emptyFunc: function() {},
            msgType: undefined,
            storageType: undefined,
            msgList: {},
            storageList: {},
            onReady: function(cb) {
                cb();
            }
        };

        //@if0 true=false>
        0 !== 0 && (window.mono = mono);
        //@if0 true=false<

        (function browserDefine() {
            //@if1 useFf=1>
            if (typeof window === 'undefined') {
                mono.isFF = true;
                mono.msgType = 'firefox';
                mono.isModule = true;
                mono.addon = _addon;
                require = _require;
                return;
            }
            //@if1 useFf=1<

            //@if1 useGm=1>
            //@if1 oneMode!=1>
            if (typeof GM_getValue !== 'undefined') {
                //@if1 oneMode!=1<
                mono.isGM = true;
                mono.msgType = 'gm';
                if (window.chrome !== undefined) {
                    mono.isTM = true;
                } else
                if (navigator.userAgent.indexOf('Maxthon/') !== -1) {
                    mono.isVM = true;
                } else {
                    mono.isGmOnly = true;
                }
                return;
                //@if1 oneMode!=1>
            }
            //@if1 oneMode!=1<
            //@if1 useGm=1<

            //@if1 useChrome=1>
            //@if1 oneMode!=1>
            if (window.chrome !== undefined) {
                //@if1 oneMode!=1<
                mono.isChrome = true;
                mono.isChromeInject = !chrome.hasOwnProperty('tabs');
                mono.msgType = 'chrome';
                //@if2 oldChromeSupport=1>
                if (!(chrome.hasOwnProperty('runtime') && chrome.runtime.onMessage)) {
                    mono.msgType = 'oldChrome';
                }
                //@if2 oldChromeSupport=1<

                //@if1 useChromeApp=1>
                if (!chrome.app.hasOwnProperty('getDetails')) {
                    mono.isChromeApp = true;
                }
                //@if1 useChromeApp=1<

                //@if1 useChromeWebApp=1>
                if (chrome.app.hasOwnProperty('getDetails')) {
                    var details = chrome.app.getDetails();
                    if (details && details.hasOwnProperty('app')) {
                        mono.isChromeWebApp = true;
                    }
                }
                //@if1 useChromeWebApp=1<
                return;
                //@if1 oneMode!=1>
            }
            //@if1 oneMode!=1<
            //@if1 useChrome=1<

            //@if1 useOpera=1>
            //@if1 oneMode!=1>
            if (window.opera !== undefined) {
                //@if1 oneMode!=1<
                mono.isOpera = true;
                mono.msgType = 'opera';
                mono.isOperaInject = opera.extension.broadcastMessage === undefined;
                return;
                //@if1 oneMode!=1>
            }
            //@if1 oneMode!=1<
            //@if1 useOpera=1<

            //@if1 useFf=1>
            //@if1 oneMode!=1>
            if (navigator.userAgent.indexOf('Firefox') !== -1 || typeof InstallTrigger !== 'undefined') {
                //@if1 oneMode!=1<
                mono.isFF = true;
                mono.msgType = 'firefox';
                if (typeof addon !== 'undefined' && addon.hasOwnProperty('port')) {
                    mono.addon = addon;
                } else
                if (typeof self !== 'undefined' && self.hasOwnProperty('port')) {
                    mono.addon = self;
                } else {
                    mono.noAddon = true;
                }
                return;
                //@if1 oneMode!=1>
            }
            //@if1 oneMode!=1<
            //@if1 useFf=1<

            //@if1 useSafari=1>
            //@if1 oneMode!=1>
            if (window.safari !== undefined) {
                //@if1 oneMode!=1<
                mono.isSafari = true;
                mono.msgType = 'safari';
                mono.isSafariPopup = safari.self.identifier === 'popup';
                mono.isSafariBgPage = safari.self.addEventListener === undefined;
                mono.isSafariInject = !mono.isSafariPopup && safari.application === undefined;
                return;
                //@if1 oneMode!=1>
            }
            //@if1 oneMode!=1<
            //@if1 useSafari=1<

            //@if1 useWebApp=1>
            //@if1 oneMode!=1>
            if (true) {
                //@if1 oneMode!=1<
                mono.isWebApp = true;
                return;
                //@if1 oneMode!=1>
            }
            //@if1 oneMode!=1<
            //@if1 useWebApp=1<

            //@if1 oneMode!=1>
            console.error('Mono: can\'t define browser!');
            //@if1 oneMode!=1<
        })();

        /**
         * Clone array or object via JSON
         * @param {object|Array} obj
         * @returns {object|Array}
         */
        mono.cloneObj = function(obj) {
            return JSON.parse(JSON.stringify(obj));
        };

        var msgTools = {
            cbObj: {},
            cbStack: [],
            id: 0,
            idPrefix: Math.floor(Math.random() * 1000) + '_',
            aliveTime: 120 * 1000,
            /**
             * Add callback function in cbObj and cbStack
             * @param {object} message - Message
             * @param {function} cb - Callback function
             */
            addCb: function(message, cb) {
                mono.onMessage.count === 0 && mono.onMessage(mono.emptyFunc);

                if (this.cbStack.length > mono.messageStack) {
                    this.clean();
                }
                var id = message.callbackId = this.idPrefix + (++this.id);
                this.cbObj[id] = {
                    fn: cb,
                    time: Date.now()
                };
                this.cbStack.push(id);
            },
            /**
             * Call function from callback list
             * @param {object} message
             */
            callCb: function(message) {
                var cb = this.cbObj[message.responseId];
                if (cb === undefined) return;
                delete this.cbObj[message.responseId];
                this.cbStack.splice(this.cbStack.indexOf(message.responseId), 1);
                cb.fn(message.data);
            },
            /**
             * Response function
             * @param {function} response
             * @param {string} callbackId
             * @param {*} responseMessage
             */
            mkResponse: function(response, callbackId, responseMessage) {
                responseMessage = {
                    data: responseMessage,
                    responseId: callbackId
                };
                response(responseMessage);
            },
            /**
             * Clear callback stack
             */
            clearCbStack: function() {
                for (var item in this.cbObj) {
                    delete this.cbObj[item];
                }
                this.cbStack.splice(0);
            },
            /**
             * Remove item from cbObj and cbStack by cbId
             * @param {string} cbId - Callback id
             */
            removeCb: function(cbId) {
                var cb = this.cbObj[cbId];
                if (cb === undefined) return;
                delete this.cbObj[cbId];
                this.cbStack.splice(this.cbStack.indexOf(cbId), 1);
            },
            /**
             * Remove old callback from cbObj
             * @param {number} [aliveTime] - Keep alive time
             */
            clean: function(aliveTime) {
                var now = Date.now();
                aliveTime = aliveTime || this.aliveTime;
                for (var item in this.cbObj) {
                    if (this.cbObj[item].time + aliveTime < now) {
                        delete this.cbObj[item];
                        this.cbStack.splice(this.cbStack.indexOf(item), 1);
                    }
                }
            }
        };

        mono.messageStack = 50;
        mono.msgClearStack = msgTools.clearCbStack.bind(msgTools);
        mono.msgRemoveCbById = msgTools.removeCb.bind(msgTools);
        mono.msgClean = msgTools.clean.bind(msgTools);

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
            var index = mono.onMessage.count++;
            var func = mono.onMessage.wrapFunc.bind(this, cb, index);
            cb.monoCbId = index;
            mono.onMessage.on.call(this, mono.onMessage.wrapper[index] = func);
        };
        mono.onMessage.count = 0;
        mono.onMessage.wrapper = {};
        mono.onMessage.wrapFunc = function(cb, index, message, response) {
            if (message.responseId !== undefined) {
                return msgTools.callCb(message);
            }
            var mResponse;
            if (message.callbackId === undefined) {
                mResponse = mono.emptyFunc;
            } else {
                mResponse = msgTools.mkResponse.bind(msgTools, response.bind(this), message.callbackId);
            }
            if (message.hook !== undefined) {
                if (index !== 0) {
                    return;
                }
                var hookFunc = mono.sendHook[message.hook];
                if (hookFunc !== undefined) {
                    return hookFunc(message.data, mResponse);
                }
            }
            cb.call(this, message.data, mResponse);
        };

        /**
         * Remove listener
         * @param {function} cb
         */
        mono.offMessage = function(cb) {
            var func = mono.onMessage.wrapper[cb.monoCbId];
            if (func === undefined) {
                return;
            }
            delete mono.onMessage.wrapper[cb.monoCbId];
            delete cb.monoCbId;
            mono.onMessage.off(func);
        };

        //@if0 useChrome=1>
        mono.msgList.chrome = function() {
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
                    //@if3 chromeUseDirectMsg=1>
                    if (sender.monoDirect) {
                        return function(message) {
                            sender(mono.cloneObj(message), chromeMsg.onMessage);
                        };
                    }
                    //@if3 chromeUseDirectMsg=1<
                    return function(message) {
                        // send to extension
                        chromeMsg.send(message);
                    }
                },
                sendTo: function(message, tabId) {
                    chrome.tabs.sendMessage(tabId, message);
                },
                onMessage: function(message, sender, _response) {
                    if (mono.isChromeBgPage) {
                        if (message.fromBgPage === 1) {
                            // block msg's from bg page to bg page.
                            return;
                        }
                    } else
                    if (message.toBgPage === 1) {
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
                off: function(cb) {
                    var cbList = chromeMsg.cbList;
                    var pos = cbList.indexOf(cb);
                    if (pos === -1) {
                        return;
                    }
                    cbList.splice(pos, 1);
                    if (cbList.length !== 0) {
                        return;
                    }
                    chrome.runtime.onMessage.removeListener(chromeMsg.onMessage);
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

            if (chrome.runtime.hasOwnProperty('getBackgroundPage')) {
                mono.isChromeBgPage = location.href.indexOf('_generated_background_page.html') !== -1;

                //@if3 chromeForceDefineBgPage=1||chromeUseDirectMsg=1>
                chrome.runtime.getBackgroundPage(function(bgWin) {
                    if (bgWin !== window) {
                        delete mono.isChromeBgPage;
                    } else {
                        mono.isChromeBgPage = true;
                    }

                    //@if3 chromeUseDirectMsg=1>
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
                    //@if3 chromeUseDirectMsg=1<
                });
                //@if3 chromeForceDefineBgPage=1||chromeUseDirectMsg=1<
            }

            mono.onMessage.on = chromeMsg.on;
            mono.onMessage.off = chromeMsg.off;
            mono.sendMessage.send = chromeMsg.send;
            mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
        };
        //@if0 useChrome=1<

        //@if0 useChrome=1&&oldChromeSupport=1>
        mono.msgList.oldChrome = function() {
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
                    if (mono.isChromeBgPage) {
                        if (message.fromBgPage === 1) {
                            // block msg's from bg page to bg page.
                            return;
                        }
                    } else
                    if (message.toBgPage === 1) {
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
                off: function(cb) {
                    var cbList = chromeMsg.cbList;
                    var pos = cbList.indexOf(cb);
                    if (pos === -1) {
                        return;
                    }
                    cbList.splice(pos, 1);
                    if (cbList.length !== 0) {
                        return;
                    }
                    chrome.extension.onRequest.removeListener(chromeMsg.onMessage);
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

            try {
                if (chrome.runtime.getBackgroundPage !== undefined) {
                    mono.isChromeBgPage = location.href.indexOf('_generated_background_page.html') !== -1;

                    //@if4 chromeForceDefineBgPage=1>
                    chrome.runtime.getBackgroundPage(function(bgWin) {
                        if (bgWin !== window) {
                            delete mono.isChromeBgPage;
                        } else {
                            mono.isChromeBgPage = true;
                        }
                    });
                    //@if4 chromeForceDefineBgPage=1<
                }
            } catch (e) {}

            mono.onMessage.on = chromeMsg.on;
            mono.onMessage.off = chromeMsg.off;
            mono.sendMessage.send = chromeMsg.send;
            mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
        };
        //@if0 useChrome=1&&oldChromeSupport=1<

        //@if0 useFf=1>
        mono.msgList.firefox = function() {
            if (mono.noAddon) {
                var onCollector = [];
                var onMessage = function(e) {
                    if (e.detail[0] !== '<') {
                        return;
                    }
                    var data = e.detail.substr(1);
                    var json = JSON.parse(data);
                    for (var i = 0, cb; cb = onCollector[i]; i++) {
                        cb(json);
                    }
                };
                mono.addon = {
                    port: {
                        emit: function(pageId, message) {
                            var msg = '>' + JSON.stringify(message);
                            window.postMessage(msg, "*");
                        },
                        on: function(pageId, func) {
                            onCollector.push(func);
                            if (onCollector.length > 1) {
                                return;
                            }
                            window.addEventListener('monoMessage', onMessage);
                        },
                        removeListener: function(pageId, func) {
                            var pos = onCollector.indexOf(func);
                            if (pos === -1) {
                                return;
                            }
                            onCollector.splice(pos, 1);
                            if (onCollector.length !== 0) {
                                return;
                            }
                            window.removeEventListener('monoMessage', onMessage);
                        }
                    }
                }
            }

            var firefoxMsg = {
                cbList: [],
                mkResponse: function(pageId) {
                    return function(message) {
                        firefoxMsg.sendTo(message, pageId);
                    }
                },
                onMessage: function(msg) {
                    var response = firefoxMsg.mkResponse(msg.from);
                    for (var i = 0, cb; cb = firefoxMsg.cbList[i]; i++) {
                        cb(msg, response);
                    }
                },
                on: function(cb) {
                    firefoxMsg.cbList.push(cb);
                    if (firefoxMsg.cbList.length !== 1) {
                        return;
                    }
                    mono.addon.port.on('mono', firefoxMsg.onMessage);
                },
                off: function(cb) {
                    var cbList = firefoxMsg.cbList;
                    var pos = cbList.indexOf(cb);
                    if (pos === -1) {
                        return;
                    }
                    cbList.splice(pos, 1);
                    if (cbList.length !== 0) {
                        return;
                    }
                    mono.addon.port.removeListener('mono', firefoxMsg.onMessage);
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
            mono.onMessage.off = firefoxMsg.off;
            mono.sendMessage.send = firefoxMsg.send;
            mono.sendMessage.sendToActiveTab = firefoxMsg.sendToActiveTab;
        };
        //@if0 useFf=1<

        //@if0 useSafari=1>
        mono.msgList.safari = function() {
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
                off: function(cb) {
                    var cbList = safariMsg.cbList;
                    var pos = cbList.indexOf(cb);
                    if (pos === -1) {
                        return;
                    }
                    cbList.splice(pos, 1);
                    if (cbList.length !== 0) {
                        return;
                    }
                    if (mono.isSafariBgPage) {
                        return safari.application.removeEventListener("message", safariMsg.onMessage, false);
                    }
                    safari.self.removeEventListener("message", safariMsg.onMessage, false);
                },
                sendToActiveTab: function(message) {
                    var activeTab = safari.application.activeBrowserWindow && safari.application.activeBrowserWindow.activeTab;
                    if (!activeTab) {
                        return;
                    }
                    safariMsg.sendTo(message, activeTab);
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
            mono.onMessage.off = safariMsg.off;
            mono.sendMessage.send = safariMsg.send;
            mono.sendMessage.sendToActiveTab = safariMsg.sendToActiveTab;
        };
        //@if0 useSafari=1<

        //@if0 useOpera=1>
        mono.msgList.opera = function() {
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
                off: function(cb) {
                    var cbList = operaMsg.cbList;
                    var pos = cbList.indexOf(cb);
                    if (pos === -1) {
                        return;
                    }
                    cbList.splice(pos, 1);
                    if (cbList.length !== 0) {
                        return;
                    }
                    opera.extension.onmessage = undefined;
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
            mono.onMessage.off = operaMsg.off;
            mono.sendMessage.send = operaMsg.send;
            mono.sendMessage.sendToActiveTab = operaMsg.sendToActiveTab;
        };
        //@if0 useOpera=1<

        //@if0 useGm=1>
        mono.msgList.gm = function() {
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
                },
                off: function(cb) {
                    var cbList = gmMsg.cbList;
                    var pos = cbList.indexOf(cb);
                    if (pos === -1) {
                        return;
                    }
                    cbList.splice(pos, 1);
                }
            };
            gmMsg.send = gmMsg.onMessage;

            mono.onMessage.on = gmMsg.on;
            mono.onMessage.off = gmMsg.off;
            mono.sendMessage.send = gmMsg.send;
            mono.sendMessage.sendToActiveTab = gmMsg.onMessage.bind({
                isBg: true
            });
        };
        //@if0 useGm=1<

        var initFunc = mono.msgList[mono.msgType];
        if (initFunc !== undefined) {
            initFunc();
        } else {
            console.error('Msg transport is not defined!');
        }
        initFunc = undefined;
        mono.msgList = undefined;

        (function storageDefine() {
            //@if5 useFf=1>
            if (mono.isFF) {
                if (!mono.isModule) {
                    mono.storageType = 'externalStorage';
                } else {
                    mono.storageType = 'simpleStorage';
                }
                return;
            }
            //@if5 useFf=1<

            //@if5 useGm=1>
            if (mono.isGM) {
                mono.storageType = 'gm';
                return;
            }
            //@if5 useGm=1<

            //@if5 useChrome=1>
            if (mono.isChrome && chrome.hasOwnProperty('storage')) {
                mono.storageType = 'chrome';
                return;
            }
            //@if5 useChrome=1<

            //@if5 useLocalStorage=1||useOpera=1>
            mono.storageType = 'localStorage';

            //@if5 useOpera=1>
            if (typeof widget !== 'undefined') {
                mono.storageType = 'operaPreferences';
            }
            //@if5 useOpera=1<
            //@if5 useLocalStorage=1||useOpera=1<
        })();

        //@if0 useFf=1>
        mono.storageList.simpleStorage = function() {
            /**
             * Firefox simple storage
             * @returns {{get: Function, set: Function, remove: Function, clear: Function}}
             */
            var ffSimpleStorage = function() {
                var ss = require('sdk/simple-storage');
                return {
                    /**
                     * Get item from storage
                     * @param {string|number|null|undefined|Array} src - Item's, null/undefined - all items
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
                        if (Array.isArray(src) === false) {
                            src = [src];
                        }
                        for (var i = 0, len = src.length; i < len; i++) {
                            key = src[i];
                            if (!ss.storage.hasOwnProperty(key)) {
                                continue;
                            }
                            obj[key] = ss.storage[key];
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
                            if (obj[key] === undefined) {
                                delete ss.storage[key];
                            } else {
                                ss.storage[key] = obj[key];
                            }
                        }
                        cb && cb();
                    },
                    /**
                     * Remove item from storage
                     * @param {Array|string} arr
                     * @param {function} [cb]
                     */
                    remove: function(arr, cb) {
                        if (Array.isArray(arr) === false) {
                            arr = [arr];
                        }
                        for (var i = 0, len = arr.length; i < len; i++) {
                            var key = arr[i];
                            delete ss.storage[key];
                        }
                        cb && cb();
                    },
                    /**
                     * Clear storage
                     * @param {function} [cb]
                     */
                    clear: function(cb) {
                        for (var key in ss.storage) {
                            if (!ss.storage.hasOwnProperty(key)) {
                                continue;
                            }
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
        };

        mono.storageList.externalStorage = function() {
            /**
             * External storage mode
             * @type {{get: Function, set: Function, remove: Function, clear: Function}}
             */
            var externalStorage = {
                /**
                 * Get item from storage
                 * @param {string|number|null|undefined|Array} obj - Item's, null/undefined - all items
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
                        data: obj,
                        keys: Object.keys(obj)
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
             * FF Storage
             * @type {{get: Function, set: Function, remove: Function, clear: Function}}
             */
            mono.storage = externalStorage;
            mono.storage.local = mono.storage.sync = mono.storage;
        };
        //@if0 useFf=1<

        //@if0 useGm=1>
        mono.storageList.gm = function() {
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
                 * @param {string|number|null|undefined|Array} src - Item's, null/undefined - all items
                 * @param {function} cb - Callback function
                 */
                get: function(src, cb) {
                    var key, value, obj = {},
                        i, len;
                    if (src === undefined || src === null) {
                        src = GM_listValues();
                    }
                    if (Array.isArray(src) === false) {
                        src = [src];
                    }
                    for (i = 0, len = src.length; i < len; i++) {
                        key = src[i];
                        value = GM_getValue(key, 'isMonoEmptyValue');
                        if (value !== undefined && value !== 'isMonoEmptyValue') {
                            if (typeof value !== 'object') {
                                obj[key] = value;
                            } else {
                                obj[key] = JSON.parse(JSON.stringify(value));
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
                    var value;
                    for (var key in obj) {
                        value = obj[key];
                        if (typeof value !== 'object') {
                            if (value === undefined) {
                                storage.remove([key]);
                            } else {
                                GM_setValue(key, value);
                            }
                        } else {
                            GM_setValue(key, JSON.parse(JSON.stringify(value)));
                        }
                    }
                    cb && cb();
                },
                /**
                 * Remove item from storage
                 * @param {Array|string} arr
                 * @param {function} [cb]
                 */
                remove: function(arr, cb) {
                    if (Array.isArray(arr) === false) {
                        arr = [arr];
                    }
                    for (var i = 0, len = arr.length; i < len; i++) {
                        var key = arr[i];
                        GM_deleteValue(key);
                    }
                    cb && cb();
                },
                /**
                 * Clear storage
                 * @param {function} [cb]
                 */
                clear: function(cb) {
                    storage.remove(GM_listValues());
                    cb && cb();
                }
            };

            /**
             * GM Storage
             * @type {{get: Function, set: Function, remove: Function, clear: Function}}
             */
            mono.storage = storage;
            mono.storage.local = mono.storage.sync = mono.storage;
        };
        //@if0 useGm=1<

        //@if0 useChrome=1>
        mono.storageList.chrome = function() {
            /**
             * Chrome storage
             * @type {{get: Function, set: Function, remove: Function, clear: Function}}
             */
            mono.storage = chrome.storage.local;
            /**
             * Chrome local
             * @type {{get: Function, set: Function, remove: Function, clear: Function}|mono.storage|*}
             */
            mono.storage.local = mono.storage;
            /**
             * Chrome sync storage
             * @type {{get: Function, set: Function, remove: Function, clear: Function}}
             */
            mono.storage.sync = chrome.storage.sync;
        };
        //@if0 useChrome=1<

        //@if0 useLocalStorage=1||useOpera=1>
        mono.storageList.localStorage = mono.storageList.operaPreferences = function() {
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
                            console.error('monoLog:', 'localStorage', 'Can\'t save item', key, ', very big!');
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
                        } else
                        if (value !== undefined) {
                            var data = value.substr(1);
                            var type = value[0];
                            if (type === 'i') {
                                value = parseFloat(data);
                            } else
                            if (type === 'b') {
                                value = data === 'true';
                            } else {
                                value = data;
                            }
                        }
                        return value;
                    },
                    /**
                     * Get item from storage
                     * @param {string|number|null|undefined|Array} src - Item's, null/undefined - all items
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
                        if (Array.isArray(src) === false) {
                            src = [src];
                        }
                        for (var i = 0, len = src.length; i < len; i++) {
                            key = src[i];
                            if (!localStorage.hasOwnProperty(key)) {
                                continue;
                            }
                            obj[key] = localStorageMode.readValue(key, localStorage[key]);
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
                            var value = obj[key];
                            if (value === undefined) {
                                localStorageMode.remove(key);
                                continue;
                            }
                            var type = typeof value;
                            if (type === 'object') {
                                localStorageMode.setObj(key, value);
                                continue;
                            }
                            if (type === 'boolean') {
                                value = 'b' + value;
                            } else
                            if (type === 'number') {
                                value = 'i' + value;
                            } else {
                                value = 's' + value;
                            }
                            localStorage[key] = value;
                        }
                        cb && cb();
                    },
                    /**
                     * Remove item from storage
                     * @param {Array|string} arr
                     * @param {function} [cb]
                     */
                    remove: function(arr, cb) {
                        if (Array.isArray(arr) === false) {
                            arr = [arr];
                        }
                        for (var i = 0, len = arr.length; i < len; i++) {
                            var key = arr[i];
                            if (!localStorage.hasOwnProperty(key)) {
                                continue;
                            }
                            if (localStorage[key] === localStorageMode.chunkItem) {
                                localStorageMode.rmObj(key);
                            }
                            delete localStorage[key];
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
                 * @param {string|number|null|undefined|Array} obj - Item's, null/undefined - all items
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
                        data: obj,
                        keys: Object.keys(obj)
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
                    for (var i = 0, len = message.keys.length; i < len; i++) {
                        var key = message.keys[i];
                        if (!message.data.hasOwnProperty(key)) {
                            message.data[key] = undefined;
                        }
                    }
                    return mono.storage.set(message.data, response);
                } else
                if (message.action === 'remove') {
                    return mono.storage.remove(message.data, response);
                } else
                if (message.action === 'clear') {
                    return mono.storage.clear(response);
                }
            };

            if (mono.storageType === 'operaPreferences') {
                mono.storage = getLocalStorage(widget.preferences);
                mono.storage.local = mono.storage.sync = mono.storage;
                return;
            }

            if (mono.isChromeInject || mono.isOperaInject || mono.isSafariInject) {
                mono.storage = externalStorage;
                mono.storage.local = mono.storage.sync = mono.storage;
                return;
            }

            var _localStorage;
            try {
                if (typeof localStorage !== 'undefined') {
                    _localStorage = localStorage;
                } else
                if (window.localStorage) {
                    _localStorage = window.localStorage;
                }
            } catch (e) {}

            if (_localStorage) {
                /**
                 * LocalStorage
                 * @type {{get: Function, set: Function, remove: Function, clear: Function}}
                 */
                mono.storage = getLocalStorage(_localStorage);
                mono.storage.local = mono.storage.sync = mono.storage;
                if (mono.isChrome || mono.isSafari || mono.isOpera) {
                    mono.sendHook.monoStorage = externalStorageHook;
                }
                return;
            }

            console.error('Can\'t detect localStorage!');
        };
        //@if0 useLocalStorage=1||useOpera=1<

        initFunc = mono.storageList[mono.storageType];
        if (initFunc !== undefined) {
            initFunc();
        } else {
            console.error('Storage is not defined!');
        }
        initFunc = undefined;
        mono.storageList = undefined;

        //@insert

        return mono;
    }
));
