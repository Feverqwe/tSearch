/**
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine. Firefox lib.
 *
 * @namespace require
 * @namespace exports
 */
var XMLHttpRequest = require('sdk/net/xhr').XMLHttpRequest;
(function() {
    var self = require("sdk/self");
    var tabs = require("sdk/tabs");
    var serviceList = {};
    var map = {};
    var defaultId = 'monoScope';
    var pageIndex = 0;

    var monoStorage = function() {
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
                if (Array.isArray(obj) === true) {
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
    }();
    exports.storage = monoStorage;

    var sendAll = function(message, fromPage) {
        for (var index in map) {
            if (fromPage && index === fromPage.index) {
                continue;
            }
            sendToPage(map[index], message);
        }
    };
    exports.sendAll = sendAll;

    var sendToPage = function(page, message) {
        if (page.active === false) {
            return;
        }
        var type = (page.isVirtual)?'lib':'port';
        page[type].emit('mono', message);
    };

    serviceList['monoStorage'] = function(page, message) {
        var msg = message.data;
        var response;
        if (message.monoCallbackId !== undefined) {
            response = function(responseMessage) {
                responseMessage = {
                    data: responseMessage,
                    monoTo: message.monoFrom,
                    monoFrom: 'monoStorage',
                    monoResponseId: message.monoCallbackId
                };
                sendToPage(page, responseMessage);
            }
        }
        if (msg.action === 'get') {
            return monoStorage.get(msg.data, response);
        }
        if (msg.action === 'set') {
            return monoStorage.set(msg.data, response);
        }
        if (msg.action === 'remove') {
            return monoStorage.remove(msg.data, response);
        }
        if (msg.action === 'clear') {
            return monoStorage.clear(response);
        }
    };

    var xhrList = {};
    serviceList['service'] = function(page, message) {
        var msg = message.data;
        var response;
        if (message.monoCallbackId !== undefined) {
            response = function(responseMessage) {
                responseMessage = {
                    data: responseMessage,
                    monoTo: message.monoFrom,
                    monoFrom: 'service',
                    monoResponseId: message.monoCallbackId
                };
                sendToPage(page, responseMessage);
            }
        }
        if (msg.action === 'resize') {
            if (page.active === false) {
                return;
            }
            if (msg.width) {
                page.width = msg.width;
            }
            if (msg.height) {
                page.height = msg.height;
            }
            return;
        }
        if (msg.action === 'openTab') {
            return tabs.open( (msg.dataUrl)?self.data.url(msg.url):msg.url );
        }
        if (msg.action === 'xhr') {
            var obj = msg.data;
            var xhr = new XMLHttpRequest();
            xhr.open(obj.open[0], obj.open[1], obj.open[2], obj.open[3], obj.open[4]);
            xhr.responseType = obj.responseType;
            if (obj.mimeType) {
                xhr.overrideMimeType(obj.mimeType);
            }
            if (obj.headers) {
                for (var key in obj.headers) {
                    xhr.setRequestHeader(key, obj.headers[key]);
                }
            }
            if (obj.responseType) {
                xhr.responseType = obj.responseType;
            }
            xhr.onload = xhr.onerror = function() {
                delete xhrList[obj.id];
                return response({
                    status: xhr.status,
                    statusText: xhr.statusText,
                    response: (obj.responseType)?xhr.response:xhr.responseText
                });
            };
            xhr.send(obj.data);
            if (obj.id) {
                xhrList[obj.id] = xhr;
            }
        }
        if (msg.action === 'xhrAbort') {
            var xhr = xhrList[msg.data];
            if (xhr) {
                xhr.abort();
                delete xhrList[msg.data];
            }
        }
    };

    var monoOnMessage = function(page, message) {
        if (serviceList[message.monoTo]) {
            return serviceList[message.monoTo](page, message);
        }
        if (virtualPageList[message.monoTo]) {
            return virtualPageList[message.monoTo].lib.emit('mono', message);
        }
        if (message.monoTo === defaultId) {
            return sendAll(message, page);
        }
        for (var index in map) {
            var _page = map[index];
            if (_page.id.indexOf(message.monoTo) !== -1) {
                sendToPage(_page, message);
            }
        }
    };

    var virtualPageList = {};
    var monoVirtualPage = function(pageId) {
        var subscribClientList = {};
        var subscribServerList = {};
        var obj = {
            port: {
                emit: function(to, message) {
                    subscribServerList[to].forEach(function(item) {
                        item(message);
                    });
                },
                on: function(to, cb) {
                    if (subscribClientList[to] === undefined) {
                        subscribClientList[to] = [];
                    }
                    subscribClientList[to].push(cb);
                }
            },
            lib: {
                emit: function(to, message) {
                    subscribClientList[to].forEach(function(item) {
                        item(message);
                    });
                },
                on: function(to, cb) {
                    if (subscribServerList[to] === undefined) {
                        subscribServerList[to] = [];
                    }
                    subscribServerList[to].push(cb);
                }
            },
            isVirtual: true
        };
        virtualPageList[pageId] = obj;
        return obj;
    };
    exports.virtualAddon = monoVirtualPage;

    var monoVirtualPort = function() {
        self.port.emit('monoAttach', self.options.pageId);
        window.addEventListener('message', function(e) {
            if (e.data[0] !== '>') {
                return;
            }
            var json = JSON.parse(e.data.substr(1));
            self.port.emit('mono', json);
        });
        self.port.on('mono', function (message) {
            var msg = '<' + JSON.stringify(message);
            var event = document.createEvent("CustomEvent");
            event.initCustomEvent("monoMessage", false, false, msg);
            window.dispatchEvent(event);
        });
    };
    exports.virtualPort = monoVirtualPort;


    exports.addPage = function(pageId, page) {
        pageIndex++;
        var index = pageIndex;
        if (page.id === undefined) {
            page.id = [];
        }
        page.id.push(pageId);
        if (page.index !== undefined) {
            return;
        }
        page.index = index;
        page.active = true;
        map[index] = page;

        if (!page.isVirtual) {
            page.on('pageshow', function() {
                page.active = true;
            });
            page.on('pagehide', function() {
                page.active = false;
            });
            page.on('attach', function() {
                page.active = true;
                map[page.index] = page;
            });
            page.on('detach', function() {
                delete map[page.index];
                page.active = false;
            });
        }
        var type = (page.isVirtual)?'lib':'port';
        page[type].on('mono', function(message) {
            monoOnMessage(page, message);
        });
    }
})();