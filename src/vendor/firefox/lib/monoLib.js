/**
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine. Firefox lib.
 *
 */

(function() {
    var map = {};
    var flags = exports.flags = {
        enableLocalScope: false
    };
    /**
     * @namespace exports
     * @namespace require
     */

    /**
     * Response id for page
     * @returns {number}
     */
    var getPageId = function() {
        return getPageId.value++;
    };
    getPageId.value = 0;

    /**
     * Get mono page from map
     * @param page
     * @returns {object}
     */
    var getMonoPage = function(page) {
        for (var index in map) {
            if (map[index].page === page) {
                return map[index];
            }
        }
        return undefined;
    };

    var virtualPageList = [];
    /**
     * Virtual port for background page
     * @returns {{port: {emit: Function, on: Function}, lib: {emit: Function, on: Function}, isVirtual: boolean}}
     */
    exports.virtualAddon = function() {
        var subscribClientList = {};
        var subscribServerList = {};
        var obj = {
            port: {
                /**
                 * Send message from bg page
                 * @param {number} to
                 * @param message
                 */
                emit: function(to, message) {
                    var list = subscribServerList[to];
                    if (list === undefined) {
                        return;
                    }
                    for (var i = 0, item; item = list[i]; i++) {
                        item(message);
                    }
                },
                /**
                 * Listener for background page
                 * @param {number} to
                 * @param {function} cb - Callback function
                 */
                on: function(to, cb) {
                    if (subscribClientList[to] === undefined) {
                        subscribClientList[to] = [];
                    }
                    subscribClientList[to].push(cb);
                },
                removeListener: function(to, cb) {
                    var cbList;
                    if ((cbList = subscribClientList[to]) === undefined) {
                        return;
                    }
                    var pos = cbList.indexOf(cb);
                    if (pos === -1) {
                        return;
                    }
                    cbList.splice(pos, 1);
                }
            },
            lib: {
                /**
                 * Send message to bg page
                 * @param {number} to
                 * @param message
                 */
                emit: function(to, message) {
                    var list = subscribClientList[to];
                    if (list === undefined) {
                        return;
                    }
                    for (var i = 0, item; item = list[i]; i++) {
                        item(message);
                    }
                },
                /**
                 * Listener for monoLib
                 * @param {number} to
                 * @param {function} cb - Callback function
                 */
                on: function(to, cb) {
                    if (subscribServerList[to] === undefined) {
                        subscribServerList[to] = [];
                    }
                    subscribServerList[to].push(cb);
                },
                removeListener: function(to, cb) {
                    var cbList;
                    if ((cbList = subscribServerList[to]) === undefined) {
                        return;
                    }
                    var pos = cbList.indexOf(cb);
                    if (pos === -1) {
                        return;
                    }
                    cbList.splice(pos, 1);
                }
            },
            isVirtual: true
        };
        virtualPageList.push(obj);
        return obj;
    };

    /**
     * Virtual port function for pages without addon, but with mono.js work like bridge
     */
    exports.virtualPort = function() {
        window.addEventListener('message', function(e) {
            if (e.data[0] !== '>') {
                return;
            }
            var json = JSON.parse(e.data.substr(1));
            self.port.emit('mono', json);
        });
        self.port.on('mono', function(message) {
            var msg = '<' + JSON.stringify(message);
            var event = new CustomEvent("monoMessage", {
                detail: msg
            });
            window.dispatchEvent(event);
        });
    };

    var bindPage = function(mPage) {
        if (mPage.page.isVirtual) {
            mPage.active = true;
            map[mPage.id] = mPage;
            return;
        }

        var onPageShow = function() {
            mPage.active = true;
        };

        var onPageHide = function() {
            mPage.active = false;
        };

        var onAttach = function() {
            mPage.active = true;
            map[mPage.id] = mPage;

            mPage.page.removeListener('pagehide', onPageHide);
            mPage.page.removeListener('pageshow', onPageShow);
            mPage.page.removeListener('detach', onDetach);
            mPage.page.on('detach', onDetach);
            mPage.page.on('pageshow', onPageShow);
            mPage.page.on('pagehide', onPageHide);
        };

        var onDetach = function() {
            delete map[mPage.id];
            mPage.active = false;

            mPage.page.removeListener('pagehide', onPageHide);
            mPage.page.removeListener('pageshow', onPageShow);
            mPage.page.removeListener('attach', onAttach);
            mPage.page.on('attach', onAttach);
        };

        onAttach();
    };

    var sendHook = {
        activeTab: function(message) {
            var tabs = require("sdk/tabs");
            var currentTab = tabs.activeTab;
            var pageIdList = [];
            for (var index in map) {
                if (map[index].page.tab === currentTab && map[index].page.tab && map[index].page.tab.url === currentTab.url) {
                    pageIdList.push(map[index].id);
                }
            }
            if (pageIdList.length === 0) {
                return;
            }
            for (var i = 0, page; page = pageIdList[i]; i++) {
                message.to = page;
                monoOnMessage(message);
            }
        },
        popupWin: function(message) {
            var self = require("sdk/self");
            var url = 'resource://' + self.id.slice(1, -1) + '/';
            var pageId;
            for (var index in map) {
                var page = map[index].page;
                if (page.isShowing !== undefined && page.tab === null && page.url.indexOf(url) === 0) {
                    pageId = map[index].id;
                    break;
                }
            }
            if (pageId === undefined) {
                return;
            }
            message.to = pageId;
            monoOnMessage(message);
        }
    };

    var monoOnMessage = function(message) {
        if (message.hook !== undefined) {
            var hookFunc = sendHook[message.hook];
            if (hookFunc !== undefined) {
                delete message.hook;
                return hookFunc(message);
            }
        }
        if (message.to !== undefined) {
            var mPage = map[message.to];
            if (!mPage || mPage.active === false) {
                return;
            }
            var type = (mPage.page.isVirtual !== undefined) ? 'lib' : 'port';
            return mPage.page[type].emit('mono', message);
        }

        var fmPage = map[message.from];
        for (var i = 0, item; item = virtualPageList[i]; i++) {
            if (fmPage.page === item) continue;
            item.lib.emit('mono', message);
        }

        if (flags.enableLocalScope && fmPage !== undefined && fmPage.page.isVirtual && message.from !== undefined) {
            for (var index in map) {
                var mPage = map[index];
                if (fmPage === mPage || mPage.isLocal === false || mPage.active === false) continue;
                mPage.page.port.emit('mono', message);
            }
        }
    };

    var localUrl = require("sdk/self").data.url().match(/([^:]+:\/\/[^/]+)\//)[1];
    exports.addPage = function(page) {
        var mPage = getMonoPage(page);
        if (mPage) {
            return;
        }
        mPage = {
            page: page,
            id: getPageId(),
            isLocal: page.isVirtual === undefined && page.url && page.url.indexOf(localUrl) === 0
        };

        bindPage(mPage);

        var type = (page.isVirtual !== undefined) ? 'lib' : 'port';
        page[type].on('mono', function(message) {
            message.from = mPage.id;
            monoOnMessage(message);
        });
    };

    var ffSimpleStorage = (function() {
        var ss = require('sdk/simple-storage');
        return {
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
    })();
    exports.storage = ffSimpleStorage;

    sendHook.monoStorage = function(message) {
        var msg = message.data || {};
        var response = function(responseMessage) {
            if (message.callbackId === undefined) return;

            responseMessage = {
                data: responseMessage,
                to: message.from,
                responseId: message.callbackId
            };
            monoOnMessage(responseMessage);
        };
        var func = ffSimpleStorage[msg.action];
        if (func === undefined) return;
        if (msg.action === 'set') {
            for (var i = 0, len = msg.keys.length; i < len; i++) {
                var key = msg.keys[i];
                if (!msg.data.hasOwnProperty(key)) {
                    msg.data[key] = undefined;
                }
            }
        }
        if (msg.action === 'clear') {
            func(response);
        } else {
            func(msg.data, response);
        }
    };

    /**
     * @namespace sendHook {object}
     * @namespace monoOnMessage {function}
     * @namespace map {array}
     */
    var serviceList = exports.serviceList = {
        resize: function(message) {
            var mPage = map[message.from];
            if (!mPage || mPage.active === false) {
                return;
            }
            var msg = message.data || {};

            if (msg.width) {
                mPage.page.width = msg.width;
            }
            if (msg.height) {
                mPage.page.height = msg.height;
            }
        },
        openTab: function(message) {
            var msg = message.data || {};
            var self = require("sdk/self");
            var tabs = require("sdk/tabs");
            tabs.open((msg.dataUrl) ? self.data.url(msg.url) : msg.url);
        }
    };

    sendHook.service = function(message) {
        var msg = message.data || {};

        var response = function(responseMessage) {
            if (message.callbackId === undefined) return;

            responseMessage = {
                data: responseMessage,
                to: message.from,
                responseId: message.callbackId
            };
            monoOnMessage(responseMessage);
        };
        var service = serviceList[msg.action];
        if (service !== undefined) {
            service(message, response);
        }
    };
})();
