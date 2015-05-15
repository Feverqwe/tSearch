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
            var size = s.toLowerCase().replace(exKit.legacy.varCache.size_check, '').replace(',', '.');
            var t = size.replace(exKit.legacy.varCache.size_kb, '');
            var size_len = size.length;
            if (t.length !== size_len) {
                t = parseFloat(t);
                return Math.round(t * 1024);
            }
            t = size.replace(exKit.legacy.varCache.size_mb, '');
            if (t.length !== size_len) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024);
            }
            t = size.replace(exKit.legacy.varCache.size_gb, '');
            if (t.length !== size_len) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024 * 1024);
            }
            t = size.replace(exKit.legacy.varCache.size_tb, '');
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
            if ((exKit.legacy.varCache.today_now).test(t)) {
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
            t = t.replace(exKit.legacy.varCache.today_today, today).replace(exKit.legacy.varCache.today_yest, yesterday);
            return t;
        },
        dateFormat: function (f, t) {
            "use strict";
            if (f === undefined) {
                return ['2013-04-31[[[ 07]:03]:27]', '31-04-2013[[[ 07]:03]:27]', 'n day ago', '04-31-2013[[[ 07]:03]:27]', '2d 1h 0m 0s ago'];
            }
            f = parseInt(f);
            if (f === 0) { // || f === '2013-04-31[[[ 07]:03]:27]') {
                var dd = t.replace(exKit.legacy.varCache.ex_num, ' ').replace(exKit.legacy.varCache.spaces, ' ').trim().split(' ');
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
                var dd = t.replace(exKit.legacy.varCache.ex_num, ' ').replace(exKit.legacy.varCache.spaces, ' ').trim().split(' ');
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
                var old = parseFloat(t.replace(exKit.legacy.varCache.ex_num, '')) * 24 * 60 * 60;
                return Math.round(Date.now() / 1000) - old;
            }
            if (f === 3) { //  || f === '04-31-2013[[[ 07]:03]:27]') {
                var dd = t.replace(exKit.legacy.varCache.ex_num, ' ').replace(exKit.legacy.varCache.spaces, ' ').trim().split(' ');
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
                var match = t.match(exKit.legacy.varCache.timeFormat4);
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
    parseRegExp: function(regexp, flags) {
        "use strict";
        return new RegExp(regexp, flags);
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
        strContain: function(value, text) {
            "use strict";
            return value.indexOf(text) !== -1;
        },
        substr: function(value, start, len) {
            "use strict";
            return value.substr(start, len);
        },
        indexOf: function(value, word, position) {
            "use strict";
            return value.indexOf(word, position)
        },
        replace: function(value, sValue, rValue) {
            "use strict";
            return value.replace(sValue, rValue);
        },
        match: function(value, sValue) {
            "use strict";
            return value.match(sValue);
        },
        firstMatch: function(value, sValue) {
            "use strict";
            var m = value.match(sValue);
            if (m === null) return;
            return m[1];
        },
        setVar: function(name, value) {
            "use strict";
            return this.scope[name] = value;
        },
        getVar: function(name) {
            "use strict";
            return this.scope[name];
        },
        getItem: function(list, item) {
            "use strict";
            return list[item];
        },
        callItem: function(list, item, args) {
            "use strict";
            return list[item].apply(list, args);
        },
        return: function(value) {
            "use strict";
            this.scope.return = value;
        },
        parseInt: function(value) {
            "use strict";
            return parseInt(value);
        },
        parseFloat: function(value) {
            "use strict";
            return parseFloat(value);
        },
        String: function(value) {
            "use strict";
            return String(value);
        },
        isNaN: function(value) {
            "use strict";
            return isNaN(value);
        },
        console: function(value) {
            "use strict";
            console.log('>', arguments);
            return value;
        },
        inc: function(name) {
            "use strict";
            this.scope[name]++;
        },
        dec: function(name) {
            "use strict";
            this.scope[name]--;
        },
        operator: function(a, char, b) {
            "use strict";
            if (char === '===') {
                return a === b;
            } else
            if (char === '!==') {
                return a !== b;
            } else
            if (char === '>') {
                return a > b;
            } else
            if (char === '<') {
                return a > b;
            } else
            if (char === '+') {
                return a + b;
            } else
            if (char === '-') {
                return a - b;
            } else
            if (char === '||') {
                return a || b;
            } else
            if (char === '&&') {
                return a && b;
            } else
            if (char === '/') {
                return a / b;
            } else
            if (char === '*') {
                return a * b;
            } else
            if (char === '%') {
                return a % b;
            } else
            if (char === '&') {
                return a && b;
            } else
            if (char === '|') {
                return a | b;
            } else
            if (char === '==') {
                return a == b;
            } else
            if (char === '!=') {
                return a != b;
            }
        },
        pass: function() {
            "use strict";
        },
        typeof: function(value) {
            "use strict";
            return typeof value;
        },
        each: function(cb, list) {
            "use strict";
            if (Array.isArray(list)) {
                for (var i = 0, len = list.length; i < len; i++) {
                    cb(i, list[i]);
                    if (this.scope.hasOwnProperty('return')) {
                        break;
                    }
                }
            } else
            for (var key in list) {
                cb(key, list[key]);
                if (this.scope.hasOwnProperty('return')) {
                    break;
                }
            }
        },
        idInCategoryList: function(cId) {
            "use strict";
            for (var i = 0, item; item = this.tracker.categoryList[i]; i++) {
                if (item.indexOf(cId) !== -1) {
                    return i;
                }
            }
            return -1;
        },
        idInCategoryListInt: function(url, regexp) {
            "use strict";
            var cId = exKit.funcList.firstMatch(url, regexp);
            if (cId === undefined) {
                return - 1;
            }
            cId = parseInt(cId);
            return exKit.funcList.idInCategoryList.call(this, cId);
        },
        idInCategoryListStr: function(url, regexp) {
            "use strict";
            var cId = exKit.funcList.firstMatch(url, regexp);
            if (cId === undefined) {
                return - 1;
            }
            return exKit.funcList.idInCategoryList.call(this, cId);
        },
        trim: function(string) {
            "use strict";
            return $.trim(string);
        }
    },
    getArgs: function(globalArgs, args) {
        "use strict";
        var len = args.length;
        var list = new Array(len);
        for (var i = 0; i < len; i++) {
            var arg = args[i];
            if (typeof arg === 'object' && arg !== null) {
                if (arg.var !== undefined) {
                    arg = this.scope[arg.var];
                } else
                if (arg.arg !== undefined) {
                    arg = globalArgs[arg.arg];
                } else
                if (arg.scope !== undefined) {
                    arg = this.scope;
                } else
                if (arg.regexp !== undefined) {
                    arg = args[i] = exKit.parseRegExp(arg.regexp, arg.flags);
                }
            }
            list[i] = arg;
        }
        return list;
    },
    prepareFuncList: function(list) {
        "use strict";
        if (typeof list !== "object" || !Array.isArray(list)) {
            list = [list];
        }
        return list;
    },
    args2list: function(args) {
        "use strict";
        var len = args.length - 1;
        var list = new Array(len);
        for (var i = 0; i < len; i++) {
            list[i] = args[i + 1];
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
        var args = exKit.args2list(arguments);
        for (var i = 0, item; item = list[i]; i++) {
            var type = typeof item;
            if (type === 'function') {
                this.scope.context = item.apply(this, args);
            } else
            if (item.exec !== undefined) {
                if (typeof item.exec !== 'function') {
                    item.exec = exKit.prepareFuncList(item.exec);
                    if (item.cb !== undefined) {
                        item.cb = exKit.funcList2func.bind(this, exKit.prepareFuncList(item.cb));
                        item.exec = exKit.funcList2func.bind(this, item.exec, item.cb);
                    } else {
                        item.exec = exKit.funcList2func.bind(this, item.exec);
                    }
                    if (item.args !== undefined && !Array.isArray(item.args)) {
                        item.args = [item.args];
                    }
                    if (item.var === undefined) {
                        item.var = 'context';
                    }
                    --i;
                    continue;
                }

                var itemArgs = item.args === undefined ? args : exKit.getArgs.call(this, args, item.args);
                var out = item.exec.apply(this, itemArgs);
                if (item.not !== undefined) {
                    out = !out;
                }
                this.scope[item.var] = out;
            } else
            if (item.func !== undefined) {
                if (typeof item.func !== 'function') {
                    item.func = exKit.funcList2func.bind(this, exKit.prepareFuncList(item.func));
                    --i;
                    continue;
                }

                this.scope[item.var] = item.func;
            } else
            if (item.if !== undefined) {
                if (typeof item.if !== 'function') {
                    item.if = exKit.funcList2func.bind(this, exKit.prepareFuncList(item.if));
                    item.then && (item.then = exKit.funcList2func.bind(this, exKit.prepareFuncList(item.then)));
                    item.else && (item.else = exKit.funcList2func.bind(this, exKit.prepareFuncList(item.else)));
                    --i;
                    continue;
                }

                if (item.if.apply(this, args)) {
                    item.then && (this.scope.context = item.then.apply(this, args));
                } else {
                    item.else && (this.scope.context = item.else.apply(this, args));
                }
            } else
            if (type === 'object' && (func = exKit.funcList[item[0]]) !== undefined) {
                list[i] = func.bind.apply(func, [this].concat(exKit.getArgs.call(this, args, item.slice(1))));
                --i;
                continue;
            } else
            if ((func = exKit.funcList[item]) !== undefined) {
                list[i] = func.bind.apply(func, [this]);
                --i;
                continue;
            } else
            if ((func = this.scope[item]) !== undefined) {
                list[i] = func.bind.apply(func, [this]);
                --i;
                continue;
            }
            if (this.scope.hasOwnProperty('return')) {
                this.scope.context = this.scope.return;
                break;
            }
        }
        var outResult = this.scope.context;
        if (isOwnScope === 1) {
            this.scope = undefined;
        }
        return outResult;
    },
    bindFunc: function(tracker, obj, key1) {
        "use strict";
        if (obj[key1] === undefined) return;
        var type = typeof obj[key1];
        var context = {
            tracker: tracker,
            scope: undefined
        };
        if (type === 'function') {
            obj[key1] = obj[key1].bind(context);
        } else {
            obj[key1] = exKit.funcList2func.bind(context, exKit.prepareFuncList(obj[key1]));
        }
    },
    prepareCustomTracker: function(trackerJson) {
        "use strict";
        if (trackerJson.version === 1) {
            var id = 'ct_'+trackerJson.uid;
            if (engine.trackerLib[id]) {
                return;
            }
            var trackerObj = engine.trackerLib[id] = {};
            trackerObj.code = JSON.stringify(trackerJson);
            trackerObj.icon = trackerJson.icon;
            trackerObj.id = id;
            trackerObj.title = trackerJson.name;
            trackerObj.desc = trackerJson.about;
            trackerObj.flags = !trackerJson.flags ? {} : {
                auth: trackerJson.a ? 1 : 0,
                language:  trackerJson.l ? 'ru' : undefined,
                cyrillic: trackerJson.rs ? 1 : 0,
                allowProxy: trackerJson.post ? 0 : 1
            };
            var search = trackerObj.search = {};
            var torrentSelector = search.torrentSelector = {};
            var onGetValue = search.onGetValue = {};
            search.searchUrl = trackerJson.search_path;
            if (trackerJson.root_url) {
                search.baseUrl = trackerJson.root_url;
            }
            if (trackerJson.auth) {
                search.loginUrl = trackerJson.auth;
            }
            if (trackerJson.post) {
                search.requestType = 'POST';
                search.requestData = trackerJson.post;
            }
            if (trackerJson.encode) {
                search.onGetRequest = 'encodeCp1251';
            }
            search.listItemSelector = trackerJson.items;
            if (trackerJson.charset) {
                search.requestMimeType = 'text/html; charset=' + trackerJson.charset;
            }
            if (trackerJson.cat_alt) {
                trackerJson.cat_attr = 'alt';
                trackerJson.cat_alt = undefined;
            }
            if (trackerJson.auth_f) {
                search.loginFormSelector = trackerJson.auth_f;
            }
            if (trackerJson.sf || trackerJson.sl) {
                search.listItemSplice = [trackerJson.sf || 0, trackerJson.sl || 0];
            }
            torrentSelector.title = trackerJson.tr_name;
            torrentSelector.url = {selector: trackerJson.tr_link, attr: 'href'};
            if (trackerJson.cat_name) {
                torrentSelector.categoryTitle = trackerJson.cat_name;
                if (trackerJson.cat_attr) {
                    torrentSelector.categoryTitle = {selector: torrentSelector.categoryTitle, attr: trackerJson.cat_attr};
                }
                if (trackerJson.cat_link) {
                    torrentSelector.categoryUrl = {selector: trackerJson.cat_link, attr: 'href'};
                }
            }
            if (trackerJson.tr_size) {
                torrentSelector.size = trackerJson.tr_size;
                if (trackerJson.size_attr) {
                    torrentSelector.size = {selector: torrentSelector.size, attr: trackerJson.size_attr};
                }
                var sizeList = [{exec: 'setVar', args: ['context', {arg: 0}]}];
                if (trackerJson.size_r && trackerJson.size_rp !== undefined) {
                    sizeList.push({var: 'context', exec: 'replace', args: [{var: 'context'}, {regexp: trackerJson.size_r, flags: 'ig'}, trackerJson.size_rp]});
                }
                if (trackerJson.s_c) {
                    sizeList.push({var: 'context', exec: function(value) {
                        return exKit.legacy.sizeFormat(value);
                    }, args: [{var: 'context'}]});
                }
                if (sizeList.length > 1) {
                    onGetValue.size = sizeList;
                }
            }
            if (trackerJson.tr_dl) {
                torrentSelector.downloadUrl = {selector: trackerJson.tr_dl, attr: 'href'};
            }
            if (trackerJson.seed) {
                torrentSelector.seed = trackerJson.seed;
                if (trackerJson.seed_r && trackerJson.seed_rp !== undefined) {
                    onGetValue.seed = {exec: 'replace', args: [{arg: 0}, {regexp: trackerJson.seed_r, flags: 'ig'}, trackerJson.seed_rp]};
                }
            }
            if (trackerJson.peer) {
                torrentSelector.peer = trackerJson.peer;
                if (trackerJson.peer_r && trackerJson.peer_rp !== undefined) {
                    onGetValue.peer = {exec: 'replace', args: [{arg: 0}, {regexp: trackerJson.peer_r, flags: 'ig'}, trackerJson.peer_rp]};
                }
            }
            if (trackerJson.date) {
                torrentSelector.date = trackerJson.date;
                if (trackerJson.date_attr) {
                    torrentSelector.date = {selector: torrentSelector.date, attr: trackerJson.date_attr};
                }
                var dateFuncList = [];
                if (trackerJson.t_r && trackerJson.t_r_r !== undefined) {
                    var t_r = new RegExp(trackerJson.t_r, "ig");
                    dateFuncList.push(function(value) {
                        return value.replace(t_r, trackerJson.t_r_r);
                    });
                }
                if (trackerJson.t_t_r) {
                    dateFuncList.push(function(value) {
                        return exKit.legacy.todayReplace(value, trackerJson.t_f);
                    });
                }
                if (trackerJson.t_m_r) {
                    dateFuncList.push(function(value) {
                        return exKit.legacy.monthReplace(value);
                    });
                }
                if (trackerJson.t_f !== undefined && trackerJson.t_f !== "-1") {
                    dateFuncList.push(function(value) {
                        return exKit.legacy.dateFormat(trackerJson.t_f, value);
                    });
                }
                if (dateFuncList.length) {
                    onGetValue.date = function (value) {
                        for (var i = 0, func; func = dateFuncList[i]; i++) {
                            value = func(value);
                        }
                        return value;
                    };
                }
            }
            return trackerObj;
        }
    },
    prepareTracker: function(tracker) {
        "use strict";
        var itemList = ['onGetValue', 'onFindSelector', 'onSelectorIsNotFound', 'onSelectorIsNotFoundSkip', 'onEmptySelectorValue'];
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
        exKit.bindFunc(tracker, tracker.search, 'onAfterDomParse');
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
            .replace(/about:blank#blockurl#/g, '')
            .replace(/tms-block-javascript/g, 'javascript');
    },
    intList: ['categoryId','size','seed','peer', 'date'],
    isUrlList: ['categoryUrl', 'url', 'downloadUrl'],
    unFilterKeyList: ['categoryTitle', 'categoryUrl', 'title', 'url', 'downloadUrl'],
    urlCheck: function(tracker, value) {
        "use strict";
        if (value.substr(0, 7) === 'magnet:') {
            return value;
        }
        if (value.substr(0, 4) === 'http') {
            return value;
        }
        if (value[0] === '/') {
            return tracker.search.rootUrl + value.substr(1);
        }
        if (value.substr(0, 2) === './') {
            return tracker.search.baseUrl + value.substr(2);
        }
        return tracker.search.baseUrl + value;
    },
    parseDom: function(tracker, request, dom, cb) {
        "use strict";
        var $dom = $(dom);
        if (tracker.search.onAfterDomParse !== undefined) {
            $dom = tracker.search.onAfterDomParse($dom);
        }
        if (tracker.search.loginFormSelector !== undefined && $dom.find(tracker.search.loginFormSelector).length) {
            return cb({requireAuth: 1});
        }
        var torrentList = [];
        var torrentElList = $dom.find(tracker.search.listItemSelector);
        if (tracker.search.listItemSplice !== undefined) {
            if (tracker.search.listItemSplice[0] > 0) {
                torrentElList.splice(0, tracker.search.listItemSplice[0]);
            }
            if (tracker.search.listItemSplice[1] > 0) {
                torrentElList.splice(-tracker.search.listItemSplice[1]);
            }
        }
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
                var value;
                if (typeof item === 'function') {
                    value = item(el);
                    trObj.column[key] = value;
                    continue;
                }
                if (typeof item === 'string') {
                    item = {selector: item};
                }

                if (cache[item.selector] === undefined) {
                    cache[item.selector] = el.find(item.selector).get(0);
                }
                value = cache[item.selector];

                if (value === undefined && tracker.search.onSelectorIsNotFoundSkip[key]) {
                    continue;
                }

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

                if (value !== null) {
                    value = $.trim(value);
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
                console.debug('[' + tracker.id + ']', 'Skip torrent:', trObj);
                continue;
            }
            if (!mono.isEmptyObject(trObj.error)) {
                console.debug('[' + tracker.id + ']', 'Torrent has problems:', trObj);
            }
            torrentList.push(trObj.column);
        }
        cb({torrentList: torrentList});
    },
    parseResponse: function(tracker, request, cb, data, xhr) {
        "use strict";
        if (tracker.search.onResponseUrl !== undefined && !tracker.search.onResponseUrl(xhr.responseURL)) {
            return cb({requireAuth: 1});
        }
        data = exKit.contentFilter(data);
        return exKit.parseDom(tracker, request, exKit.parseHtml(data), cb);
    },
    search: function(tracker, request, onSearch) {
        "use strict";
        var trackerRequest = request;
        onSearch.onBegin && onSearch.onBegin(tracker);
        if (tracker.search.onGetRequest !== undefined) {
            trackerRequest = tracker.search.onGetRequest(request);
        }
        var xhr = mono.ajax({
            url: tracker.search.searchUrl.replace('%search%', trackerRequest),
            type: tracker.search.requestType,
            mimeType: tracker.search.requestMimeType,
            dataType: tracker.search.requestDataType,
            data: (tracker.search.requestData || '').replace('%search%', trackerRequest),
            success: (tracker.search.parseResponse || exKit.parseResponse).bind(null, tracker, request, function(data) {
                onSearch.onDone(tracker);
                onSearch.onSuccess(tracker, request, data);
            }),
            error: function(xhr) {
                onSearch.onDone(tracker);
                onSearch.onError(tracker, xhr.status, xhr.statusText);
            },
            onTimeout: function(xhr) {
                onSearch.onDone(tracker);
                onSearch.onError(tracker, xhr.status, xhr.statusText);
            }
        });
        return {
            tracker: tracker,
            abort: function() {
                xhr.abort();
            }
        }
    },
    searchProgressList: {},
    searchProgressListClear: function() {
        "use strict";
        var progressList = exKit.searchProgressList;
        for (var trackerId in progressList) {
            if (progressList[trackerId] === undefined) continue;
            progressList[trackerId].abort();
            progressList[trackerId] = undefined;
        }
    },
    searchProgressListBind: function(onSearch) {
        "use strict";
        var progressList = exKit.searchProgressList;
        var onDone = onSearch.onDone;
        onSearch.onDone = function(tracker) {
            progressList[tracker.id] = undefined;
            onDone && onDone.apply(null, arguments);
        };
        onSearch = null;
    },
    searchList: function(trackerList, request, onSearch) {
        "use strict";
        exKit.searchProgressListClear();
        exKit.searchProgressListBind(onSearch);
        for (var i = 0, trackerId; trackerId = trackerList[i]; i++) {
            exKit.searchProgressList[trackerId] = exKit.search(engine.trackerLib[trackerId], request, onSearch);
        }
    },
    getTrackerIconUrl: function(icon) {
        "use strict";
        icon  = icon || '#ccc';
        if (icon[0] !== '#') {
            return icon;
        }
        var svg = 'data:image/svg+xml;base64,';
        var data = '';
        if (icon === '#skull') {
            data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 48 48" version="1.1" viewBox="0 0 48 48" height="20px" width="20px"><g><g><path d="M33,46c-0.553,0-1-0.447-1-1V34h1c4.963,0,9-4.037,9-9v-5c0-9.925-8.075-18-18-18S6,10.075,6,20v5c0,4.963,4.037,9,9,9h1     v11c0,0.553-0.447,1-1,1s-1-0.447-1-1v-9.045C8.401,35.448,4,30.729,4,25v-5C4,8.972,12.972,0,24,0s20,8.972,20,20v5     c0,5.729-4.401,10.448-10,10.955V45C34,45.553,33.553,46,33,46z"/></g><g><path d="M21,46c-0.553,0-1-0.447-1-1V35c0-0.553,0.447-1,1-1s1,0.447,1,1v10C22,45.553,21.553,46,21,46z"/></g><g><path d="M27,46c-0.553,0-1-0.447-1-1V35c0-0.553,0.447-1,1-1s1,0.447,1,1v10C28,45.553,27.553,46,27,46z"/></g><g><path d="M33,32c-3.859,0-7-3.141-7-7s3.141-7,7-7s7,3.141,7,7S36.859,32,33,32z M33,20c-2.757,0-5,2.243-5,5s2.243,5,5,5     s5-2.243,5-5S35.757,20,33,20z"/></g><g><path d="M15,32c-3.859,0-7-3.141-7-7s3.141-7,7-7s7,3.141,7,7S18.859,32,15,32z M15,20c-2.757,0-5,2.243-5,5s2.243,5,5,5     s5-2.243,5-5S17.757,20,15,20z"/></g><g><path d="M5.236,18c-0.553,0-1-0.447-1-1s0.447-1,1-1C7.955,16,12,14.136,12,9c0-0.553,0.447-1,1-1s1,0.447,1,1     C14,14.908,9.592,18,5.236,18z"/></g><g><path d="M42.764,18C38.408,18,34,14.908,34,9c0-0.553,0.447-1,1-1s1,0.447,1,1c0,5.136,4.045,7,6.764,7c0.553,0,1,0.447,1,1     S43.316,18,42.764,18z"/></g><g><path d="M25.02,32c-0.005,0.001-0.012,0.001-0.02,0h-2c-0.347,0-0.668-0.18-0.851-0.475s-0.199-0.663-0.044-0.973l1-2     c0.34-0.678,1.449-0.678,1.789,0l0.92,1.84c0.129,0.168,0.205,0.379,0.205,0.607C26.02,31.553,25.572,32,25.02,32z"/></g></g></svg>';
        } else {
            data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 48 48" version="1.1" viewBox="0 0 48 48" height="20px" width="20px"><circle cx="24" cy="24" r="20" stroke="black" fill="'+icon+'" /></svg>';
        }
        svg += btoa(data);
        return svg;
    }
};