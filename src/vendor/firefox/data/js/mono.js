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

    mono.isFF = true;
    mono.isModule = typeof window === 'undefined';
    if (mono.isModule) {
        require = _require;
        mono.addon = _addon;
    } else
    if (typeof addon !== 'undefined' && addon.hasOwnProperty('port')) {
        mono.addon = addon;
    } else
    if (typeof self !== 'undefined' && self.hasOwnProperty('port')) {
        mono.addon = self;
    } else {
        mono.noAddon = true;
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
    //@insert

    return mono;
}));
