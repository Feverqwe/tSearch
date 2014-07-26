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
    var sanitizeRegExp = [/href=/img, /data-safe-href=/img];

    var getMonoPage = function(page) {
        for (var index in map) {
            if (map[index].page === page) {
                return map[index];
            }
        }
        return undefined;
    };

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

    var sendToPage = function(mPage, message) {
        if (mPage.port !== undefined) {
            mPage = getMonoPage(mPage);
            if (mPage === undefined) {
                return;
            }
        }
        if (mPage.active === false) {
            return;
        }
        var type = (mPage.page.isVirtual !== undefined)?'lib':'port';
        mPage.page[type].emit('mono', message);
    };
    exports.sendToPage = sendToPage;

    var sendAll = function(message, fromMonoPage) {
        if (fromMonoPage !== undefined && fromMonoPage.port !== undefined) {
            fromMonoPage = getMonoPage(fromMonoPage);
            if (fromMonoPage === undefined) {
                return;
            }
        }
        for (var index in map) {
            if (fromMonoPage !== undefined && fromMonoPage.index === index) {
                continue;
            }
            sendToPage(map[index], message);
        }
    };
    exports.sendAll = sendAll;

    serviceList['monoStorage'] = function(mPage, message) {
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
                sendToPage(mPage, responseMessage);
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

    var sanitizedHTML = function (html) {
        var chrome = require('chrome');
        var Cc = chrome.Cc;
        var Ci = chrome.Ci;

        var flags = 2;

        html = html.replace(sanitizeRegExp[0], "data-safe-href=");
        var parser = Cc["@mozilla.org/parserutils;1"].getService(Ci.nsIParserUtils);
        var sanitizedHTML = parser.sanitize(html, flags);
        sanitizedHTML = sanitizedHTML.replace(sanitizeRegExp[1], "href=");
        return sanitizedHTML;
    };

    var xhrList = {};
    serviceList['service'] = function(mPage, message) {
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
                sendToPage(mPage, responseMessage);
            }
        }
        if (msg.action === 'resize') {
            if (mPage.active === false) {
                return;
            }
            if (msg.width) {
                mPage.page.width = msg.width;
            }
            if (msg.height) {
                mPage.page.height = msg.height;
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
                    response: (obj.responseType)?xhr.response:(obj.safe)?sanitizedHTML(xhr.responseText):xhr.responseText
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
        if (msg.action === 'toActiveTab') {
            var pageInMap = undefined;
            var currentPageUrl = tabs.activeTab.url;
            for (var index in map) {
                if (map[index].page.url === currentPageUrl) {
                    pageInMap = map[index];
                    break;
                }
            }
            if (pageInMap === undefined) {
                return;
            }
            msg.message.monoTo = defaultId;
            sendToPage(pageInMap, msg.message);
        }
    };

    var monoOnMessage = function(mPage, message) {
        if (serviceList[message.monoTo] !== undefined) {
            return serviceList[message.monoTo](mPage, message);
        }
        if (virtualPageList[message.monoTo] !== undefined) {
            return virtualPageList[message.monoTo].lib.emit('mono', message);
        }
        if (message.monoTo === defaultId) {
            return sendAll(message, mPage);
        }
        for (var index in map) {
            var _mPage = map[index];
            if (_mPage.id.indexOf(message.monoTo) !== -1) {
                sendToPage(_mPage, message);
            }
        }
    };

    var virtualPageList = {};
    var monoVirtualAddon = function(pageId) {
        var subscribClientList = {};
        var subscribServerList = {};
        var obj = {
            port: {
                emit: function(to, message) {
                    if (subscribServerList[to] === undefined) {
                        return console.log('Drop message to', to);
                    }
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
                    if (subscribClientList[to] === undefined) {
                        return console.log('Drop message to', to);
                    }
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
    exports.virtualAddon = monoVirtualAddon;

    var monoVirtualPort = function() {
        window.addEventListener('message', function(e) {
            if (e.data[0] !== '>') {
                return;
            }
            var json = JSON.parse(e.data.substr(1));
            self.port.emit('mono', json);
        });
        self.port.on('mono', function (message) {
            var msg = '<' + JSON.stringify(message);
            var event = new CustomEvent("monoMessage", {detail: msg});
            window.dispatchEvent(event);
        });
    };
    exports.virtualPort = monoVirtualPort;

    exports.addPage = function(pageId, page) {
        var mPage = getMonoPage(page);
        if ( mPage === undefined ) {
            mPage = {page: page};
        }
        if (mPage.id === undefined) {
            mPage.id = [];
        }
        mPage.id.push(pageId);
        if (mPage.index !== undefined) {
            return;
        }
        mPage.index = pageIndex++;
        mPage.active = true;
        map[pageIndex] = mPage;

        if (page.isVirtual === undefined) {
            page.on('pageshow', function() {
                mPage.active = true;
            });
            page.on('pagehide', function() {
                mPage.active = false;
            });
            page.on('attach', function() {
                mPage.active = true;
                map[mPage.index] = mPage;
            });
            page.on('detach', function() {
                delete map[mPage.index];
                mPage.active = false;
            });
        }
        var type = (page.isVirtual !== undefined)?'lib':'port';
        page[type].on('mono', function(message) {
            monoOnMessage(mPage, message);
        });
    }
})();