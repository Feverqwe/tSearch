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
        xhr.ontimeout = function() {
            obj.onTimeout(xhr);
        }
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
        if (vXhr.hasOwnProperty('status')) return;
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
            vXhr.responseURL = xhr.responseURL;

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
    return chrome.i18n.getMessage('langCode');
} : window.isModule ? function () {
    "use strict";
    var lang = require("sdk/l10n").get('langCode');
    if (lang !== 'langCode') {
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
/**
 * @param {function} cb
 * @param {string} force
 * @returns {undefined}
 */
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
/**
 * @param {object} obj
 * @returns {boolean}
 */
mono.isEmptyObject = function(obj) {
    "use strict";
    for (var item in obj) {
        return false;
    }
    return true;
};
/**
 * Create new element
 * @param {Element|String} tagName
 * @param {Object} obj
 * @returns {Element|Node}
 */
mono.create = function create(tagName, obj) {
    "use strict";
    var el;
    if ( typeof tagName === 'string') {
        el = document.createElement(tagName);
    } else {
        el = tagName;
    }
    if (obj !== undefined) {
        for (var attr in obj) {
            var value = obj[attr];
            if (create.hook[attr]) {
                create.hook[attr](el, value);
                continue;
            }
            el[attr] = value;
        }
    }
    return el;
};
mono.create.hook = {
    text: function(el, value) {
        "use strict";
        el.textContent = value;
    },
    data: function(el, value) {
        "use strict";
        for (var item in value) {
            el.dataset[item] = value[item];
        }
    },
    class: function(el, value) {
        "use strict";
        if (Array.isArray(value)) {
            for (var i = 0, len = value.length; i < len; i++) {
                var className = value[i];
                if (className === null || className === undefined) {
                    continue;
                }
                el.classList.add(className);
            }
            return;
        }
        el.setAttribute('class', value);
    },
    style: function(el, value) {
        "use strict";
        if (typeof value === 'object') {
            for (var item in value) {
                el.style[item] = value[item];
            }
            return;
        }
        el.setAttribute('style', value);
    },
    append: function(el, value) {
        "use strict";
        if (Array.isArray(value)) {
            for (var i = 0, len = value.length; i < len; i++) {
                var subEl = value[i];
                if (!subEl) {
                    continue;
                }
                if (typeof (subEl) !== 'object') {
                    subEl = document.createTextNode(subEl);
                }
                el.appendChild(subEl);
            }
            return;
        }
        el.appendChild(value);
    },
    after: function(el, value) {
        "use strict";
        var hasNextEl = el.nextElementSibling;
        var elList;
        this.append(elList = document.createDocumentFragment(), value);
        if (hasNextEl !== null) {
            el.parentNode.insertBefore(elList, hasNextEl);
        } else {
            el.parentNode.appendChild(elList);
        }
    },
    on: function(el, args) {
        "use strict";
        if (Array.isArray(args[0])) {
            for (var i = 0, len = args.length; i < len; i++) {
                var subArgs = args[i];
                el.addEventListener(subArgs[0], subArgs[1], subArgs[2]);
            }
            return;
        }
        //type, onEvent, useCapture
        el.addEventListener(args[0], args[1], args[2]);
    },
    onCreate: function(el, value) {
        "use strict";
        value.call(el);
    }
};
/**
 * @param {String|Array} list
 * @param {DocumentFragment} [fragment]
 * @returns {DocumentFragment|Element}
 */
mono.parseTemplate = function(list, fragment) {
    "use strict";
    if (typeof list === "string") {
        list = list.replace(/"/g, '\\"').replace(/\\'/g, '\\u0027').replace(/'/g, '"').replace(/([{,]{1})\s*([a-zA-Z0-9]+):/g, '$1"$2":');
        try {
            list = JSON.parse(list);
        } catch (e) {
            return document.createTextNode(list);
        }
    }
    fragment = fragment || document.createDocumentFragment();
    for (var i = 0, len = list.length; i < len; i++) {
        var item = list[i];
        if (typeof item === 'object') {
            for (var tagName in item) {
                var el = item[tagName];
                var append = el.append;
                delete el.append;
                var dEl;
                fragment.appendChild(dEl = mono.create(tagName, el));
                if (append !== undefined) {
                    mono.parseTemplate(append, dEl);
                }
            }
        } else {
            fragment.appendChild(document.createTextNode(item));
        }
    }
    return fragment;
};
/**
 * @param {object} language
 * @param {Element} [body]
 */
mono.writeLanguage = function(language, body) {
    "use strict";
    var elList = (body || document).querySelectorAll('[data-lang]');
    for (var i = 0, el; el = elList[i]; i++) {
        var langList = el.dataset.lang.split('|');
        for (var m = 0, lang; lang = langList[m]; m++) {
            var args = lang.split(',');
            var locale = language[args.shift()];
            if (locale === undefined) {
                console.log('Lang not found!', el.dataset.lang);
                continue;
            }
            if (args.length !== 0) {
                args.forEach(function (item) {
                    if (item === 'text') {
                        el.textContent = locale;
                        return 1;
                    } else
                    if (item === 'tmpl') {
                        el.textContent = '';
                        el.appendChild(mono.parseTemplate(locale));
                        return 1;
                    }
                    el.setAttribute(item, locale);
                });
            } else if (el.tagName === 'DIV') {
                el.setAttribute('title', locale);
            } else if (['A', 'LEGEND', 'SPAN', 'LI', 'TH', 'P', 'OPTION', 'H1', 'H2'].indexOf(el.tagName) !== -1) {
                el.textContent = locale;
            } else if (el.tagName === 'INPUT') {
                el.value = locale;
            } else {
                console.log('Tag name not found!', el.tagName);
            }
        }
    }
};

mono.openTab = mono.isChrome ? function(url) {
    "use strict";
    chrome.tabs.create({url: url});
} : mono.isFF ? function(url) {
    "use strict";
    mono.sendMessage({action: 'openTab', dataUrl: true, url: url}, undefined, 'service');
} : mono.isOpera ? function(url) {
    "use strict";
    mono.sendMessage({action: 'tab', url: url });
} : mono.isSafari ? function(url) {
    "use strict";
    var tab = safari.application.activeBrowserWindow.openTab();
    tab.url = safari.extension.baseURI + url;
    tab.activate();
} : mono.isMaxthon ? function(url) {
    "use strict";
    url = window.external.mxGetRuntime().getPrivateUrl() + url;
    mx.browser.tabs();
    mx.browser.newTab({url: url, activate: true});
} : function() {
    "use strict";
    console.error('openTab is not supported!');
};

mono.closePopup = mono.isFF ? function() {
    "use strict";
    return mono.addon.postMessage('closeMe');
} : mono.isSafari ? function() {
    "use strict";
    safari.extension.popovers[0].hide();
} : function() {
    "use strict";
    console.error('closePopup is not supported!');
};

mono.resizePopup = mono.isFF ? function(w, h) {
    "use strict";
    mono.sendMessage({action: 'resize', height: h, width: w}, undefined, "service");
} : mono.isOpera ? function(w, h) {
    "use strict";
    mono.sendMessage({action: 'resize', height: h, width: w});
} : mono.isSafari ? function(w, h) {
    "use strict";
    if (w !== undefined) {
        safari.extension.popovers[0].width = w;
    }
    if (h !== undefined) {
        safari.extension.popovers[0].height = h;
    }
} : mono.isMaxthon ? function(w, h) {
    "use strict";
    window.external.mxGetRuntime().getActionByName("Torrents MultiSearch").resize(w, h);
} : mono.isChrome ? function(){} : function(w, h) {
    "use strict";
    console.error('resizePopup is not supported!');
};

mono.expand = function() {
    "use strict";
    for (var i = 1, item; item = arguments[i]; i++) {
        for (var key in item) {
            if (!item.hasOwnProperty(key)) continue;
            arguments[0][key] = item[key];
        }
    }
    return arguments[0];
};

mono.throttle = function(fn, threshhold, scope) {
    threshhold = threshhold || 250;
    var last;
    var deferTimer;
    return function () {
        var context = scope || this;

        var now = Date.now();
        var args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
};

mono.debounce = function(fn, delay) {
    var timer = null;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
};

mono.capitalize = function(str) {
    "use strict";
    return str[0].toUpperCase() + str.substr(1);
};