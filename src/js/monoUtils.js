/**
 * Created by Anton on 28.02.2015.
 */
mono.param = function(params) {
    if (typeof params === 'string') return params;

    var args = [];
    for (var key in params) {
        var value = params[key];
        if (value === null || value === undefined) {
            continue;
        }
        args.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
    return args.join('&');
};
mono.ajax = function(obj) {
    var url = obj.url;

    var method = obj.type || 'GET';
    method = method.toUpperCase();

    var data = obj.data;

    if (data && typeof data !== "string") {
        data = mono.param(data);
    }

    if (data && method === 'GET') {
        url += (url.indexOf('?') === -1 ? '?' : '&') + data;
        data = undefined;
    }

    if (obj.cache === false && ['GET','HEAD'].indexOf(method) !== -1) {
        var nc = '_=' + Date.now();
        url += (url.indexOf('?') === -1 ? '?' : '&') + nc;
    }

    var xhr = new mono.ajax.xhr();

    xhr.open(method, url, true);

    if (obj.timeout !== undefined) {
        xhr.timeout = obj.timeout;
    }

    if (obj.dataType) {
        obj.dataType = obj.dataType.toLowerCase();

        xhr.responseType = obj.dataType;
    }

    obj.headers = obj.headers || {};

    if (obj.contentType) {
        obj.headers["Content-Type"] = obj.contentType;
    }

    if (data && !obj.headers["Content-Type"]) {
        obj.headers["Content-Type"] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    if (obj.mimeType) {
        xhr.overrideMimeType(obj.mimeType);
    }

    for (var key in obj.headers) {
        xhr.setRequestHeader(key, obj.headers[key]);
    }

    if (obj.onTimeout !== undefined) {
        xhr.ontimeout = obj.onTimeout;
    }

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
            var response = (obj.dataType) ? xhr.response : xhr.responseText;
            return obj.success && obj.success(response, xhr);
        }
        obj.error && obj.error(xhr);
    };

    xhr.onerror = function() {
        obj.error && obj.error(xhr);
    };

    xhr.send(data);

    return xhr;
};
mono.ajax.xhr = mono.isModule ? require('sdk/net/xhr').XMLHttpRequest : !mono.isFF ? XMLHttpRequest : function ffMsgXHR() {
    "use strict";
    var xhr = {
        id: Date.now() + '_' + Math.floor((Math.random() * 10000) + 1)
    };

    var vXhr = {};
    vXhr.abort = function() {
        mono.sendMessage({action: 'xhrAbort', data: xhr.id}, undefined, "service");
    };
    vXhr.open = function(method, url, async) {
        xhr.method = method;
        xhr.url = url;
        xhr.async = async;
    };
    vXhr.overrideMimeType = function(mimeType) {
        xhr.mimeType = mimeType;
    };
    vXhr.setRequestHeader = function(key, value) {
        if (!xhr.headers) {
            xhr.headers = {};
        }
        xhr.headers[key] = value;
    };
    vXhr.send = function(data) {
        xhr.data = data;
        xhr.timeout = vXhr.timeout;
        xhr.responseType = vXhr.responseType;

        if (xhr.hasOwnProperty('ontimeout')) {
            console.error('ffXHR ontimeout is not supported!');
        }

        mono.sendMessage({action: 'xhr', data: xhr}, function(xhr) {
            vXhr.status = xhr.status;
            vXhr.statusText = xhr.statusText;

            if (xhr.responseType) {
                vXhr.response = xhr.response;
            } else {
                vXhr.responseText = xhr.response;
            }

            vXhr.onload && vXhr.onload();
        }, "service");
    };
    return vXhr;
};
mono.checkAvailableLanguage = function(lang) {
    "use strict";
    lang = lang.substr(0, 2);
    return ['ru', 'en'].indexOf(lang) !== -1 ? lang : 'en';
};
mono.getLocale = function() {
    "use strict";
    if (mono.getLocale.locale !== undefined) {
        return mono.getLocale.locale;
    }

    var getLang = mono.isModule ? function () {
        "use strict";
        var window = require('sdk/window/utils').getMostRecentBrowserWindow();
        return String(window.navigator.language).toLowerCase();
    } : function () {
        "use strict";
        return String(navigator.language).toLowerCase();
    };

    var lang = getLang();
    var match = lang.match(/\(([^)]+)\)/);
    if (match !== null) {
        lang = match[1];
    }

    var tPos = lang.indexOf('-');
    if (tPos !== -1) {
        var left = lang.substr(0, tPos);
        var right = lang.substr(tPos + 1);
        if (left === right) {
            lang = left;
        } else {
            lang = left + '-' + right.toUpperCase();
        }
    }
    return mono.getLocale.locale = lang;
};
mono.detectLanguage = mono.isChrome ? function() {
    "use strict";
    return chrome.i18n.getMessage('lang');
} : window.isModule ? function () {
    "use strict";
    var lang = require("sdk/l10n").get('lang');
    if (lang !== 'lang') {
        return lang;
    }
    return mono.getLocale();
} : function () {
    "use strict";
    return mono.getLocale();
};
mono.readChromeLocale = function(lang) {
    "use strict";
    var language = {};
    for (var key in lang) {
        language[key] = lang[key].message;
    }
    return language;
};
mono.getLanguage = function(cb, force) {
    "use strict";
    var lang = mono.checkAvailableLanguage(force || mono.detectLanguage());

    var url = '_locales/' + lang + '/messages.json';
    if (mono.isModule) {
        try {
            mono.language = mono.readChromeLocale(JSON.parse(require('sdk/self').data.load(url)));
            cb();
        } catch (e) {
            console.log(e);
            if (lang !== 'en') {
                return mono.getLanguage(cb, 'en');
            }
            console.error('Can\'t load language!');
        }
        return;
    }
    mono.ajax({
        url: url,
        dataType: 'JSON',
        success: function (data) {
            mono.language = mono.readChromeLocale(data);
            cb();
        },
        error: function () {
            if (lang !== 'en') {
                return mono.getLanguage(cb, 'en');
            }
            console.error('Can\'t load language!');
        }
    });
};
mono.isEmptyObject = function(obj) {
    "use strict";
    for (var item in obj) {
        return false;
    }
    return true;
};