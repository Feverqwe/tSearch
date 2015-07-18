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

        (function browserDefine() {

            if (window.chrome !== undefined) {
                mono.isChrome = true;
                mono.isChromeInject = !chrome.hasOwnProperty('tabs');
                mono.msgType = 'chrome';

                if (!(chrome.hasOwnProperty('runtime') && chrome.runtime.onMessage)) {
                    mono.msgType = 'oldChrome';
                }

                if (chrome.app.hasOwnProperty('getDetails')) {
                    mono.isChromeWebApp = chrome.app.getDetails();
                    if (mono.isChromeWebApp && mono.isChromeWebApp.hasOwnProperty('app')) {
                        mono.isChromeWebApp = true;
                    } else {
                        delete mono.isChromeWebApp;
                    }
                }

                return;
            }

            console.error('Mono: can\'t define browser!');
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

            }

            mono.onMessage.on = chromeMsg.on;
            mono.onMessage.off = chromeMsg.off;
            mono.sendMessage.send = chromeMsg.send;
            mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
        };

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

                }
            } catch (e) {}

            mono.onMessage.on = chromeMsg.on;
            mono.onMessage.off = chromeMsg.off;
            mono.sendMessage.send = chromeMsg.send;
            mono.sendMessage.sendToActiveTab = chromeMsg.sendToActiveTab;
        };

        var func = mono.msgList[mono.msgType];
        if (func !== undefined) {
            func();
        } else {
            console.error('Msg transport is not defined!');
        }
        func = undefined;
        mono.msgList = undefined;

        (function storageDefine() {

            if (mono.isChrome && chrome.hasOwnProperty('storage')) {
                mono.storageType = 'chrome';
                return;
            }

        })();

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
