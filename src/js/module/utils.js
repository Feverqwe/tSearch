/**
 * Created by Anton on 31.12.2016.
 */
"use strict";
define(function () {
    var utils = {};
    utils.param = function(params) {
        var args = [];
        for (var key in params) {
            var value = params[key];
            if (value !== null && value !== undefined) {
                args.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        }
        return args.join('&');
    };
    utils.parseUrl = function(url, details) {
        details = details || {};
        var query = null;
        if (!details.params && /\?/.test(url)) {
            query = url.match(/[^?]*\?(.*)/)[1];
        } else {
            query = url;
        }
        var separator = details.sep || '&';
        var dblParamList = query.split(separator);
        var params = {};
        for (var i = 0, len = dblParamList.length; i < len; i++) {
            var item = dblParamList[i];
            var keyValue = item.split('=');
            var key = keyValue[0];
            var value = keyValue[1] || '';
            if (!details.noDecode) {
                try {
                    key = decodeURIComponent(key);
                } catch (err) {
                    key = unescape(key);
                }
                try {
                    params[key] = decodeURIComponent(value);
                } catch (err) {
                    params[key] = unescape(value);
                }
            } else {
                params[key] = value;
            }
        }
        return params;
    };
    utils.hashParam = function (params) {
        var hashParams = {};
        var len = 0;
        for (var key in params) {
            len++;
            hashParams[key] = btoa(unescape(encodeURIComponent(params[key])));
        }
        if (len) {
            hashParams.base64 = true;
        }
        return utils.param(hashParams);
    };
    utils.hashParseParam = function(queryString) {
        var params = {};
        var hashParams = utils.parseUrl(queryString, {params: true});
        if (hashParams.base64) {
            for (var key in hashParams) {
                if (key === 'base64') {
                    continue;
                }
                try {
                    params[key] = decodeURIComponent(escape(atob(hashParams[key])));
                } catch (e) {
                    console.error('Error decode param', key, hashParams[key], e);
                }
            }
        } else {
            params = hashParams;
        }
        return params;
    };
    utils.parseXhrHeader = function(head) {
        head = head.split(/\r?\n/);
        var headers = {};
        head.forEach(function(line) {
            var sep = line.indexOf(':');
            if (sep === -1) {
                return;
            }
            var key = line.substr(0, sep).trim().toLowerCase();
            var value = line.substr(sep + 1).trim();
            headers[key] = value;
        });
        return headers;
    };
    utils.request = function (obj, origCb) {
        var result = {};
        var cb = function(err, body) {
            cb = null;
            if (request.timeoutTimer) {
                clearTimeout(request.timeoutTimer);
            }

            origCb && origCb(err, getResponse(body));
        };

        var getResponse = function(body) {
            var response = {};

            response.statusCode = xhr.status;
            response.statusText = xhr.statusText;
            response.url = xhr.responseURL || obj.url;

            var headers = null;
            var allHeaders = xhr.getAllResponseHeaders();
            if (typeof allHeaders === 'string') {
                headers = utils.parseXhrHeader(allHeaders);
            }
            response.headers = headers || {};

            response.body = body;

            return response;
        };

        if (typeof obj !== 'object') {
            obj = {url: obj};
        }

        var url = obj.url;

        var method = obj.method || obj.type || 'GET';
        method = method.toUpperCase();

        var data = obj.data;
        if (typeof data !== "string") {
            data = utils.param(data);
        }

        if (data && method === 'GET') {
            url += (/\?/.test(url) ? '&' : '?') + data;
            data = undefined;
        }

        if (obj.cache === false && ['GET','HEAD'].indexOf(method) !== -1) {
            url += (/\?/.test(url) ? '&' : '?') + '_=' + Date.now();
        }

        obj.headers = obj.headers || {};

        if (data) {
            obj.headers["Content-Type"] = obj.contentType || obj.headers["Content-Type"] || 'application/x-www-form-urlencoded; charset=UTF-8';
        }

        var request = {};
        request.url = url;
        request.method = method;

        data && (request.data = data);
        obj.json && (request.json = true);
        obj.timeout && (request.timeout = obj.timeout);
        obj.mimeType && (request.mimeType = obj.mimeType);
        obj.withCredentials && (request.withCredentials = true);
        Object.keys(obj.headers).length && (request.headers = obj.headers);

        if (request.timeout > 0) {
            request.timeoutTimer = setTimeout(function() {
                cb && cb(new Error('ETIMEDOUT'));
                xhr.abort();
            }, request.timeout);
        }

        var readyCallback = function() {
            var xhrSuccessStatus = {
                0: 200,
                1223: 204
            };

            var status = xhrSuccessStatus[xhr.status] || xhr.status;
            try {
                if (status >= 200 && status < 300 || status === 304) {
                    var body = xhr.responseText;
                    if (typeof body !== 'string') {
                        throw new Error('Response is not string!');
                    }
                    if (request.json) {
                        body = JSON.parse(body);
                    }
                    return cb && cb(null, body);
                }
                throw new Error(xhr.status + ' ' + xhr.statusText);
            } catch (e) {
                return cb && cb(e);
            }
        };

        var errorCallback = function() {
            cb && cb(new Error(xhr.status + ' ' + xhr.statusText));
        };

        try {
            var xhr = new XMLHttpRequest();
            xhr.open(request.method, request.url, true);
            if (request.mimeType) {
                xhr.overrideMimeType(request.mimeType);
            }
            if (request.withCredentials) {
                xhr.withCredentials = true;
            }
            for (var key in request.headers) {
                xhr.setRequestHeader(key, request.headers[key]);
            }
            xhr.onload = readyCallback;
            xhr.onerror = errorCallback;
            if (xhr.onabort !== undefined) {
                xhr.onabort = errorCallback;
            } else {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        cb && setTimeout(function () {
                            return errorCallback();
                        });
                    }
                };
            }
            xhr.send(request.data || null);
        } catch (e) {
            setTimeout(function() {
                cb && cb(e);
            });
        }

        result.abort = function() {
            cb = null;
            xhr.abort();
        };

        return result;
    };
    utils.getUuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };
    utils.bindClearBtn = function (clear, input) {
        var clearIsVisible = false;
        input.addEventListener('keyup', function() {
            if (this.value.length > 0) {
                if (!clearIsVisible) {
                    clearIsVisible = true;
                    clear.classList.add('input__clear_visible');
                }
            } else {
                if (clearIsVisible) {
                    clearIsVisible = false;
                    clear.classList.remove('input__clear_visible');
                }
            }
        });

        clear.addEventListener('click', function (e) {
            e.preventDefault();
            input.value = '';
            input.dispatchEvent(new CustomEvent('keyup'));
            input.focus();
        });
    };
    utils.bindDblClickClear = function (nodeList) {
        if (!Array.isArray(nodeList)) {
            nodeList = [nodeList];
        }
        nodeList.forEach(function (node) {
            node.addEventListener('dblclick', function() {
                this.value = '';
                this.dispatchEvent(new CustomEvent('keyup'));
            });
        });
    };
    var sanitizeText = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;
    utils.sanitizeTextRe = function (text) {
        return text.replace(sanitizeText, '\\$&');
    };
    utils.throttle = function (fn, time) {
        var lastTime = 0;
        var timer = null;
        return function () {
            clearTimeout(timer);
            var now = Date.now();
            if (now - lastTime > time) {
                lastTime = now;
                fn.apply(null, arguments);
            } else {
                timer = setTimeout(function () {
                    fn.apply(null, arguments);
                }, time);
            }
        };
    };
    utils.parseMeta = function (code) {
        var meta = {};
        var readMeta = false;
        var params = {
            name: 'string',
            version: 'string',
            author: 'string',
            description: 'string',
            homepageURL: 'string',
            icon: 'string',
            icon64: 'string',
            updateURL: 'string',
            downloadURL: 'string',
            supportURL: 'string',
            require: 'array',
            connect: 'array'
        };
        code.split(/\r?\n/).some(function (line) {
            if (!/^\s*\/\//.test(line)) {
                return;
            }
            if (!readMeta && /[=]+UserScript[=]+/.test(line)) {
                readMeta = true;
            }
            if (readMeta && /[=]+\/UserScript[=]+/.test(line)) {
                readMeta = false;
                return true;
            }
            if (readMeta) {
                var m = /^\s*\/\/\s*@([A-Za-z0-9]+)\s+(.+)$/.exec(line);
                if (m) {
                    var key = m[1];
                    var value = m[2].trim();
                    var type = params[key];
                    if (type === 'string') {
                        meta[key] = value;
                    } else
                    if (type === 'array') {
                        if (!meta[key]) {
                            meta[key] = [];
                        }
                        meta[key].push(value);
                    }
                }
            }
        });
        if (!Object.keys(meta).length) {
            throw new Error("Meta data is not found!");
        }
        if (!meta.name) {
            throw new Error("Name field is not found!");
        }
        if (!meta.version) {
            throw new Error("Version field is not found!");
        }
        return meta;
    };
    utils.isNewVersion = function (oldVersion, newVersion) {
        var validate = /^[\d.]+$/;
        if (!validate.test(oldVersion) || !validate.test(newVersion)) {
            throw new Error('Incorrect version');
        }
        var normlize = function (value, len) {
            while (value.length < len) {
                value += '0';
            }
            return value;
        };
        var oldParts = oldVersion.split('.');
        var newParts = newVersion.split('.');
        return newParts.some(function (value, index) {
            var oldValue = oldParts[index] || '';
            var newValue = newParts[index] || '';
            var len = Math.max(oldValue.length, newValue.length);
            oldValue = parseInt(normlize(oldValue, len));
            newValue = parseInt(normlize(newValue, len));
            if (newValue > oldValue) {
                return true;
            }
        });
    };
    return utils;
});