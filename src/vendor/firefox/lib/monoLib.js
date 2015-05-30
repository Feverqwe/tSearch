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
        if (getPageId.value === undefined) {
            getPageId.value = -1;
        }
        return ++getPageId.value;
    };

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
        var page = mPage.page;
        if (page.isVirtual) return;

        var onPageShow = function() {
            mPage.active = true;
        };
        var onPageHide = function() {
            mPage.active = false;
        };
        var onAttach = function() {
            mPage.active = true;
            map[mPage.id] = mPage;

            page.on('pageshow', onPageShow);
            page.on('pagehide', onPageHide);
        };
        var onDetach = function() {
            delete map[mPage.id];
            mPage.active = false;

            page.off('pageshow', onPageShow);
            page.off('pagehide', onPageHide);
        };

        page.on('attach', onAttach);
        page.on('detach', onDetach);
    };

    var sendHook = {
        activeTab: function(message) {
            var tabs = require("sdk/tabs");
            var currentTab = tabs.activeTab;
            var pageIdList = [];
            for (var index in map) {
                if (map[index].page.tab === currentTab && map[index].page.url === currentTab.url) {
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
            active: true,
            isLocal: page.isVirtual === undefined && page.url && page.url.indexOf(localUrl) === 0
        };
        map[mPage.id] = mPage;

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
            set: function(obj, cb) {
                for (var key in obj) {
                    ss.storage[key] = obj[key];
                }
                cb && cb();
            },
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
            clear: function(cb) {
                for (var key in ss.storage) {
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
