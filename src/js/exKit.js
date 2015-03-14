/**
 * Created by Anton on 09.03.2015.
 */
var exKit = {
    legacy: {
        varCache: {
            size_check: new RegExp('[^0-9.,кбмгтkmgtb]', 'g'),
            size_kb: new RegExp('кб|kb'),
            size_mb: new RegExp('мб|mb'),
            size_gb: new RegExp('гб|gb'),
            size_tb: new RegExp('тб|tb'),
            today_now: new RegExp('сейчас|now'),
            today_today: new RegExp('сегодня|today'),
            today_yest: new RegExp('вчера|yesterday'),
            ex_num: new RegExp('[^0-9]', 'g'),
            spaces: new RegExp('\\s+', 'g'),
            timeFormat4: /([0-9]{1,2}d)?[^0-9]*([0-9]{1,2}h)?[^0-9]*([0-9]{1,2}m)?[^0-9]*([0-9]{1,2}s)?/
        },
        sizeFormat: function (s) {
            "use strict";
            var size = s.toLowerCase().replace(exKit.varCache.size_check, '').replace(',', '.');
            var t = size.replace(exKit.varCache.size_kb, '');
            var size_len = size.length;
            if (t.length !== size_len) {
                t = parseFloat(t);
                return Math.round(t * 1024);
            }
            t = size.replace(exKit.varCache.size_mb, '');
            if (t.length !== size_len) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024);
            }
            t = size.replace(exKit.varCache.size_gb, '');
            if (t.length !== size_len) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024 * 1024);
            }
            t = size.replace(exKit.varCache.size_tb, '');
            if (t.length !== size_len) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024 * 1024 * 1024);
            }
            return 0;
        },
        monthReplace: function (t) {
            "use strict";
            return t.toLowerCase().replace('янв', '1').replace('фев', '2').replace('мар', '3')
                .replace('апр', '4').replace('мая', '5').replace('май', '5').replace('июн', '6')
                .replace('июл', '7').replace('авг', '8').replace('сен', '9')
                .replace('окт', '10').replace('ноя', '11').replace('дек', '12')
                .replace('jan', '1').replace('feb', '2').replace('mar', '3')
                .replace('apr', '4').replace('may', '5').replace('jun', '6')
                .replace('jul', '7').replace('aug', '8').replace('sep', '9')
                .replace('oct', '10').replace('nov', '11').replace('dec', '12');
        },
        todayReplace: function (t, f) {
            "use strict";
            f = parseInt(f);
            t = t.toLowerCase();
            if ((exKit.varCache.today_now).test(t)) {
                return Math.round(Date.now() / 1000);
            }
            var tt = new Date();
            var tty = new Date((Math.round(tt.getTime() / 1000) - 24 * 60 * 60) * 1000);
            var today;
            var yesterday;
            if (f === 0) {
                today = tt.getFullYear() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getDate() + ' ';
                yesterday = tty.getFullYear() + ' ' + (tty.getMonth() + 1) + ' ' + tty.getDate() + ' ';
            } else {
                today = tt.getDate() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getFullYear() + ' ';
                yesterday = tty.getDate() + ' ' + (tty.getMonth() + 1) + ' ' + tty.getFullYear() + ' ';
            }
            t = t.replace(exKit.varCache.today_today, today).replace(exKit.varCache.today_yest, yesterday);
            return t;
        },
        dateFormat: function (f, t) {
            "use strict";
            if (f === undefined) {
                return ['2013-04-31[[[ 07]:03]:27]', '31-04-2013[[[ 07]:03]:27]', 'n day ago', '04-31-2013[[[ 07]:03]:27]', '2d 1h 0m 0s ago'];
            }
            f = parseInt(f);
            if (f === 0) { // || f === '2013-04-31[[[ 07]:03]:27]') {
                var dd = t.replace(exKit.varCache.ex_num, ' ').replace(exKit.varCache.spaces, ' ').trim().split(' ');
                for (var i = 0; i < 6; i++) {
                    if (dd[i] === undefined) {
                        dd[i] = 0;
                    } else {
                        dd[i] = parseInt(dd[i]);
                        if (isNaN(dd[i])) {
                            if (i < 3) {
                                return 0;
                            } else {
                                dd[i] = 0;
                            }
                        }
                    }
                }
                if (dd[0] < 10) {
                    dd[0] = '200' + dd[0];
                } else if (dd[0] < 100) {
                    dd[0] = '20' + dd[0];
                }
                return Math.round((new Date(dd[0], dd[1] - 1, dd[2], dd[3], dd[4], dd[5])).getTime() / 1000);
            }
            if (f === 1) { //  || f === '31-04-2013[[[ 07]:03]:27]') {
                var dd = t.replace(exKit.varCache.ex_num, ' ').replace(exKit.varCache.spaces, ' ').trim().split(' ');
                for (var i = 0; i < 6; i++) {
                    if (dd[i] === undefined) {
                        dd[i] = 0;
                    } else {
                        dd[i] = parseInt(dd[i]);
                        if (isNaN(dd[i])) {
                            if (i < 3) {
                                return 0;
                            } else {
                                dd[i] = 0;
                            }
                        }
                    }
                }
                if (dd[2] < 10) {
                    dd[2] = '200' + dd[2];
                } else if (dd[2] < 100) {
                    dd[2] = '20' + dd[2];
                }
                return Math.round((new Date(dd[2], dd[1] - 1, dd[0], dd[3], dd[4], dd[5])).getTime() / 1000);
            }
            if (f === 2) { //  || f === 'n day ago') {
                var old = parseFloat(t.replace(exKit.varCache.ex_num, '')) * 24 * 60 * 60;
                return Math.round(Date.now() / 1000) - old;
            }
            if (f === 3) { //  || f === '04-31-2013[[[ 07]:03]:27]') {
                var dd = t.replace(exKit.varCache.ex_num, ' ').replace(exKit.varCache.spaces, ' ').trim().split(' ');
                for (var i = 0; i < 6; i++) {
                    if (dd[i] === undefined) {
                        dd[i] = 0;
                    } else {
                        dd[i] = parseInt(dd[i]);
                        if (isNaN(dd[i])) {
                            if (i < 3) {
                                return 0;
                            } else {
                                dd[i] = 0;
                            }
                        }
                    }
                }
                if (dd[2] < 10) {
                    dd[2] = '200' + dd[2];
                } else if (dd[2] < 100) {
                    dd[2] = '20' + dd[2];
                }
                return Math.round((new Date(dd[2], dd[0] - 1, dd[1], dd[3], dd[4], dd[5])).getTime() / 1000);
            }
            if (f === 4) { //  || f === '2d 1h 0m 0s ago') {
                var match = t.match(exKit.varCache.timeFormat4);
                if (match) {
                    var d = parseInt(match[1]) || 0;
                    var h = parseInt(match[2]) || 0;
                    var m = parseInt(match[3]) || 0;
                    var s = parseInt(match[4]) || 0;
                    var time = d * 24 * 60 * 60 + h * 60 * 60 + m * 60 + s;
                    if (time === 0) {
                        return 0;
                    }
                    return parseInt(Date.now() / 1000) - time;
                }
                return 0;
            }
        },
        isNumber: function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
    },
    prepareTrackerR: {
        hasEndSlash:/\/$/
    },
    funcList: {
        encodeURIComponent: encodeURIComponent,
        decodeURIComponent: decodeURIComponent,
        encodeCp1251: function (string) {
            "use strict";
            var output = '', charCode, ExitValue, char;
            for (var i = 0, len = string.length; i < len; i++) {
                char = string.charAt(i);
                charCode = char.charCodeAt(0);
                var Acode = charCode;
                if (charCode > 1039 && charCode < 1104) {
                    Acode -= 848;
                    ExitValue = '%' + Acode.toString(16);
                }
                else if (charCode === 1025) {
                    Acode = 168;
                    ExitValue = '%' + Acode.toString(16);
                }
                else if (charCode === 1105) {
                    Acode = 184;
                    ExitValue = '%' + Acode.toString(16);
                }
                else if (charCode === 32) {
                    Acode = 32;
                    ExitValue = '%' + Acode.toString(16);
                }
                else if (charCode === 10) {
                    ExitValue = '%0A';
                }
                else {
                    ExitValue = char;
                }
                output = output + ExitValue;
            }
            return output;
        },
        strContain: function(text, value) {
            "use strict";
            return value.indexOf(text) !== -1;
        },
        substr: function(start, len, value) {
            "use strict";
            if (typeof value !== 'string') {
                value = len;
                len = undefined;
            }
            return value.substr(start, len);
        },
        equal: function(a, b) {
            "use strict";
            return a === b;
        },
        indexOf: function(word, position, value) {
            "use strict";
            if (typeof value !== 'string') {
                value = position;
                position = undefined;
            }
            return value.indexOf(word, position)
        },
        replace: function(sValue, rValue, value) {
            "use strict";
            if (sValue.substr(0, 7) === 'RegExp:') {
                var rStart = sValue.indexOf(':', 7) + 1;
                var flags = sValue.substr(7, rStart - 1 - 7);
                sValue = new RegExp(sValue.substr(rStart), flags);
            }
            return value.replace(sValue, rValue);
        },
        setVar: function(name, value) {
            "use strict";
            return this.scope[name] = value;
        },
        getVar: function(name) {
            "use strict";
            return this.scope[name];
        },
        return: function(bool, value) {
            "use strict";
            if (bool === undefined) {
                bool = value;
            }
            this.scope.return = 1;
            return bool;
        },
        console: function(value) {
            "use strict";
            console.log('>', arguments);
            return value;
        }
    },
    getArgs: function(args) {
        "use strict";
        var list = [];
        for (var i = 0, len = args.length; i < len; i++) {
            var arg = args[i];
            if (typeof arg === 'string' && arg[0] === ':') {
                list.push(this.scope[arg.substr(1)]);
                continue;
            }
            list.push(arg);
        }
        return list;
    },
    funcList2func: function(list) {
        "use strict";
        var isOwnScope;
        if (isOwnScope = this.scope === undefined ? 1 : 0) {
            this.scope = {};
        }
        var func;
        var args = Array.prototype.slice.call(arguments).slice(1);
        for (var i = 0, item; item = list[i]; i++) {
            var type = typeof item;
            if (type === 'function') {
                args[0] = item.apply(this, args);
            } else
            if (item.func !== undefined) {
                type = typeof item.func;
                if (type === 'function') {
                    var itemArgs = item.args !== undefined ? exKit.getArgs.call(this, item.args) : args;
                    var out = item.func.apply(this, itemArgs);
                    if (item.not !== undefined) {
                        out = !out;
                    }
                    if (item.var !== undefined) {
                        this.scope[item.var] = out;
                    } else {
                        args[0] = out;
                    }
                } else {
                    item.func = exKit.funcList2func.bind(this, item.func);
                    --i;
                }
            } else
            if (item.bool !== undefined) {
                type = typeof item.bool;
                if (type === 'function') {
                    if (item.bool.apply(this, args)) {
                        args[0] = item.true.apply(this, args);
                    } else {
                        args[0] = item.false.apply(this, args);
                    }
                } else {
                    item.bool = exKit.funcList2func.bind(this, item.bool);
                    item.true = exKit.funcList2func.bind(this, item.true || ['return', 1]);
                    item.false = exKit.funcList2func.bind(this, item.false || ['return', 0]);
                    --i;
                }
            } else
            if (type === 'object' && (func = exKit.funcList[item[0]]) !== undefined) {
                list[i] = func.bind.apply(func, [this].concat(item.slice(1)));
                --i;
            } else
            if ((func = exKit.funcList[item]) !== undefined) {
                list[i] = func.bind.apply(func, [this]);
                --i;
            }
            if (this.scope.return === 1) {
                break;
            }
        }
        if (isOwnScope === 1) {
            this.scope = undefined;
        }
        return args[0];
    },
    bindFunc: function(tracker, obj, key1) {
        "use strict";
        if (obj[key1] === undefined) return;
        var context = {
            tracker: tracker,
            scope: undefined
        };
        if (Array.isArray(obj[key1])) {
            obj[key1] = exKit.funcList2func.bind(context, obj[key1]);
        } else {
            obj[key1] = obj[key1].bind(context);
        }
    },
    prepareTracker: function(tracker) {
        "use strict";
        var itemList = ['onGetValue', 'onFindSelector', 'onSelectorIsNotFound', 'onEmptySelectorValue'];
        for (var i = 0, item; item = itemList[i]; i++) {
            if (!tracker.search[item]) {
                tracker.search[item] = {};
            }
        }
        for (var key in tracker.search.torrentSelector) {
            for (var i = 0, item; item = itemList[i]; i++) {
                exKit.bindFunc(tracker, tracker.search[item], key);
            }
        }
        exKit.bindFunc(tracker, tracker.search, 'onGetRequest');
        exKit.bindFunc(tracker, tracker.search, 'onGetListItem');
        exKit.bindFunc(tracker, tracker.search, 'onResponseUrl');

        if (!tracker.search.rootUrl) {
            tracker.search.rootUrl = tracker.search.searchUrl.substr(0, tracker.search.searchUrl.indexOf('/', tracker.search.searchUrl.indexOf('//') + 2) + 1);
        }
        if (!tracker.search.baseUrl) {
            tracker.search.baseUrl = tracker.search.searchUrl.substr(0, tracker.search.searchUrl.lastIndexOf('/'));
        }
        if (!exKit.prepareTrackerR.hasEndSlash.test(tracker.search.rootUrl)) {
            tracker.search.rootUrl = tracker.search.rootUrl + '/';
        }
        if (!exKit.prepareTrackerR.hasEndSlash.test(tracker.search.baseUrl)) {
            tracker.search.baseUrl = tracker.search.baseUrl + '/';
        }
        return tracker;
    },
    parseHtml: function(html) {
        "use strict";
        var fragment = document.createDocumentFragment();
        var div = document.createElement('div');
        div.innerHTML = html;
        var el;
        while (el = div.firstChild) {
            fragment.appendChild(el);
        }
        return fragment;
    },
    contentFilterR: {
        searchJs: /javascript/ig,
        blockHref: /\/\//,
        blockSrc: /src=(['"]?)/ig,
        blockOnEvent: /on(\w+)=/ig
    },
    contentFilter: function(content) {
        "use strict";
        return content.replace(exKit.contentFilterR.searchJs, 'tms-block-javascript')
            .replace(exKit.contentFilterR.blockHref, '//about:blank#blockurl#')
            .replace(exKit.contentFilterR.blockSrc, 'src=$1data:image/gif,base64#blockurl#')
            .replace(exKit.contentFilterR.blockOnEvent, 'data-block-event-$1=');
    },
    contentUnFilter: function(content) {
        "use strict";
        return content.replace(/data:image\/gif,base64#blockurl#/g, '')
            .replace(/\/\/about:blank#blockurl#/g, '')
            .replace(/tms-block-javascript/g, 'javascript');
    },
    intList: ['categoryId','size','seed','peer', 'date'],
    isUrlList: ['categoryUrl', 'url', 'downloadUrl'],
    unFilterKeyList: ['categoryTitle', 'categoryUrl', 'title', 'url', 'downloadUrl'],
    urlCheck: function(tracker, value) {
        "use strict";
        if (value.substr(0, 4) === 'http') {
            return value;
        }
        if (value[0] === '/') {
            return tracker.search.rootUrl + value;
        }
        if (value.substr(0, 2) === './') {
            return tracker.search.baseUrl + value.substr(2);
        }
        return tracker.search.baseUrl + value;
    },
    parseDom: function(tracker, request, dom, cb) {
        "use strict";
        var $dom = $(dom);
        if (tracker.search.loginFormSelector !== undefined && $dom.find(tracker.search.loginFormSelector).length) {
            return cb({requireAuth: 1});
        }
        var torrentList = [];
        var torrentElList = $dom.find(tracker.search.listItemSelector);
        for (var i = 0, len = torrentElList.length; i < len; i++) {
            var el = torrentElList.eq(i);
            if (tracker.search.onGetListItem !== undefined && !tracker.search.onGetListItem(el)) {
                continue;
            }
            var trObj = {
                column: {},
                error: {}
            };
            var cache = {};
            for (var key in tracker.search.torrentSelector) {
                var item = tracker.search.torrentSelector[key];
                if (typeof item === 'string') {
                    item = {selector: item};
                }

                if (cache[item.selector] === undefined) {
                    cache[item.selector] = el.find(item.selector).get(0);
                }
                var value = cache[item.selector];

                if (value === undefined && tracker.search.onSelectorIsNotFound[key] !== undefined) {
                    value = tracker.search.onSelectorIsNotFound[key](el);
                }

                if (value === undefined) {
                    trObj.error[key] = value;
                    trObj.error[key+'!'] = 'Selector is not found!';
                    trObj.error[key+'Selector'] = item.selector;
                    continue;
                }

                if (tracker.search.onFindSelector[key] !== undefined) {
                    value = tracker.search.onFindSelector[key](value);
                } else
                if (item.attr !== undefined) {
                    value = value.getAttribute(item.attr);
                } else {
                    value = value.textContent;
                }

                if ((value === null || value.length === 0) && tracker.search.onEmptySelectorValue[key] !== undefined) {
                    value = tracker.search.onEmptySelectorValue[key](el);
                }

                if (value === null) {
                    trObj.error[key] = value;
                    trObj.error[key+'!'] = 'Attribute is not found!';
                    continue;
                }
                if (value.length === 0) {
                    trObj.error[key] = value;
                    trObj.error[key+'!'] = 'Text content is empty!';
                    continue;
                }

                if (tracker.search.onGetValue[key] !== undefined) {
                    value = tracker.search.onGetValue[key](value, el);
                }
                if (exKit.intList.indexOf(key) !== -1) {
                    var intValue = parseInt(value);
                    if (isNaN(intValue)) {
                        intValue = -1;
                        trObj.error[key] = value;
                        trObj.error[key+'!'] = 'isNaN';
                    }
                    value = intValue;
                }
                if (exKit.unFilterKeyList.indexOf(key) !== -1) {
                    value = exKit.contentUnFilter(value);
                }
                if (exKit.isUrlList.indexOf(key) !== -1) {
                    value = exKit.urlCheck(tracker, value);
                }
                trObj.column[key] = value;
            }
            if (!trObj.column.title || !trObj.column.url) {
                console.debug('Skip torrent:', trObj);
                continue;
            }
            if (!mono.isEmptyObject(trObj.error)) {
                console.debug('Torrent has problems:', trObj);
            }
            torrentList.push(trObj.column);
        }
        cb({success: 1, torrentList: torrentList});
    },
    parseResponse: function(tracker, request, cb, data, xhr) {
        "use strict";
        if (tracker.search.onResponseUrl !== undefined && !tracker.search.onResponseUrl(xhr.responseURL)) {
            return cb({requireAuth: 1});
        }
        data = exKit.contentFilter(data);
        return exKit.parseDom(tracker, request, exKit.parseHtml(data), cb);
    },
    search: function(tracker, request) {
        "use strict";
        if (tracker.search.onGetRequest !== undefined) {
            request = tracker.search.onGetRequest(request);
        }
        var xhr = mono.ajax({
            url: tracker.search.searchUrl.replace('%search%', request),
            type: tracker.search.requestType,
            mimeType: tracker.search.requestMimeType,
            dataType: tracker.search.requestDataType,
            data: (tracker.search.requestData || '').replace('%search%', request),
            success: (tracker.search.parseResponse || exKit.parseResponse).bind(null, tracker, request, function(data) {
                engine.search.onSuccess(tracker, data);
            }),
            error: function(xhr) {
                engine.search.onError(tracker, xhr.status, xhr.statusText);
            }
        });
        return {
            tracker: tracker,
            abort: xhr.abort
        }
    }
};