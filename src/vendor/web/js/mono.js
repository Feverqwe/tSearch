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

    mono.isWebApp = true;

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
    mono.sendMessage = function(message, cb, hook) {};

    /**
     * Send message to active page, background page only
     * @param {*} message - Message
     * @param {function} [cb] - Callback function
     * @param {string} [hook] - Hook string
     * @returns {*|string} - callback id
     */
    mono.sendMessageToActiveTab = function(message, cb, hook) {};

    /**
     * Mono message hooks
     * @type {{}}
     */
    mono.sendHook = {};

    /**
     * Listen messages and call callback function
     * @param {function} cb - Callback function
     */
    mono.onMessage = function(cb) {};

    mono.storage = undefined;


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
