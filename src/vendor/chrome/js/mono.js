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
    //@insert

    return mono;
}));
