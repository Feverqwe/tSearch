/**
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine. Firefox lib.
 *
 * @namespace require
 * @namespace exports
 */
(function() {
    var self = require("sdk/self");
    var tabs = require("sdk/tabs");
    var serviceList = {};
    var route = {};
    var stateList = {};
    var defaultId = 'monoScope';
    route[defaultId] = [];

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

    var sendTo = function(to, message) {
        if (typeof to !== "string") {
            var page = to;
            if (stateList[page] === false) {
                return;
            }
            var type = page.isVirtual?'lib':'port';
            try {
                page[type].emit(defaultId, message);
            } catch (e) {
                stateList[page] = false;
                console.log('page ex', page.contentURL);
            }
            return;
        }
        for (var i = 0, page; page = route[to][i]; i++) {
            if (stateList[page] === false) {
                continue;
            }
            var type = page.isVirtual?'lib':'port';
            try {
                page[type].emit(to, message);
            } catch (e) {
                stateList[page] = false;
                console.log('page ex', page.contentURL);
            }
        }
    };

    serviceList['monoStorage'] = function(message) {
        var to = message.monoFrom;
        var msg = message.data;
        var response;
        if (message.monoCallbackId !== undefined) {
            response = function(responseMessage) {
                responseMessage = {
                    data: responseMessage,
                    monoTo: to,
                    monoFrom: 'monoStorage',
                    monoResponseId: message.monoCallbackId
                };
                sendTo(to, responseMessage);
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

    XMLHttpRequest = require('sdk/net/xhr').XMLHttpRequest;
    var xhrList = {};
    serviceList['service'] = function(message) {
        var to = message.monoFrom;
        var msg = message.data;
        var response;
        if (message.monoCallbackId !== undefined) {
            response = function(responseMessage) {
                responseMessage = {
                    data: responseMessage,
                    monoTo: to,
                    monoFrom: 'monoStorage',
                    monoResponseId: message.monoCallbackId
                };
                sendTo(to, responseMessage);
            }
        }
        if (msg.action === 'resize') {
            return route[to].forEach(function(page) {
                if (msg.width) {
                    page.width = msg.width;
                }
                if (msg.height) {
                    page.height = msg.height;
                }
            });
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

    var virtualPageList = {};
    var monoVirtualPage = function(pageId) {
        var subscribClientList = {};
        var subscribServerList = {};
        var obj = {
            port: {
                on: function(to, cb) {
                    if (subscribClientList[to] === undefined) {
                        subscribClientList[to] = [];
                    }
                    subscribClientList[to].push(cb);
                },
                emit: function(to, message) {
                    if (to === defaultId) {
                        return sendAll(message, virtualPageList[pageId]);
                    }
                    if (route[to] !== undefined) {
                        return sendTo(to, message);
                    }
                    subscribServerList[to].forEach(function(item) {
                        item(message);
                    });
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
        var vPageId = self.options.pageId+Math.floor((Math.random() * 10000) + 1);
        self.port.emit('monoAttach', vPageId);
        window.addEventListener('message', function(e) {
            if (e.data[0] !== '>') {
                return;
            }
            var sepPos = e.data.indexOf(':');
            if (sepPos === -1) {
                return;
            }
            var pageId = e.data.substr(1, sepPos - 1);
            if (pageId === self.options.pageId) {
                pageId = vPageId;
            }
            var data = e.data.substr(sepPos+1);
            var json = JSON.parse(data);
            if (json.monoFrom === self.options.pageId) {
                json.monoFrom = vPageId;
            }
            self.port.emit(pageId, json);
        });
        self.port.on(vPageId, function (message) {
            if (message.monoTo === vPageId) {
                message.monoTo = self.options.pageId;
            }
            var msg = '<'+self.options.pageId + ':' + JSON.stringify(message);
            var event = document.createEvent("CustomEvent");
            event.initCustomEvent("monoMessage", false, false, msg);
            window.dispatchEvent(event);
        });
        self.port.on(self.options.defaultId, function (message) {
            var msg = '<'+self.options.defaultId + ':' + JSON.stringify(message);
            var event = document.createEvent("CustomEvent");
            event.initCustomEvent("monoMessage", false, false, msg);
            window.dispatchEvent(event);
        });
    };
    exports.virtualPort = monoVirtualPort;

    var sendAll = function(message, exPage) {
        for (var i = 0, page; page = route[defaultId][i]; i++) {
            if (page === exPage) {
                continue;
            }
            sendTo(page, message);
        }
    };
    exports.sendAll = sendAll;

    exports.addPage = function(pageId, page) {
        if (route[pageId] === undefined) {
            route[pageId] = [];
        }

        stateList[page] = true;

        var type;
        if (page.isVirtual) {
            type = 'lib';
        } else {
            type = 'port';
            page.on('pageshow', function() {
                stateList[page] = true;
            });
            page.on('pagehide', function() {
                stateList[page] = false;
            });
            page.on('attach', function() {
                stateList[page] = true;
            });
            page.on('detach', function() {
                stateList[page] = false;
                route[pageId].splice(route[pageId].indexOf(page), 1);
                route[defaultId].splice(route[defaultId].indexOf(page), 1);
                delete stateList[page];
            });
        }

        route[pageId].push(page);
        if (route[defaultId].indexOf(page) !== -1) {
            return;
        }
        route[defaultId].push(page);

        page[type].on(defaultId, function(message) {
            sendAll(message, page);
        });

        for (var serviceName in serviceList) {
            page[type].on(serviceName, serviceList[serviceName]);
        }

        for (var virtualPageName in virtualPageList) {
            var vPage = virtualPageList[virtualPageName];
            if (vPage === page) {
                continue;
            }
            page.port.on(virtualPageName, function(message) {
                vPage.lib.emit(virtualPageName, message);
            });
        }
    }
})();