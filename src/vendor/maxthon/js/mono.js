/**
 *
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine.
 *
 **/

var mono = (typeof mono !== 'undefined') ? mono : undefined;

(function(window, factory) {
    "use strict";
    if (mono && mono.isLoaded) {
        return;
    }

    if (typeof window !== "undefined") {
        return mono = factory(null, mono);
    }

}(
    typeof window !== "undefined" ? window : undefined,
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
            storageList: {}
        };

        mono.isMaxthon = true;

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

        mono.storageType = 'localStorage';

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

        func = mono.storageList[mono.storageType];
        if (func !== undefined) {
            func();
        } else {
            console.error('Storage is not defined!');
        }
        func = undefined;
        mono.storageList = undefined;

        //@insert

        return mono;
    }
));
