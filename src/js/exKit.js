/**
 * Created by Anton on 09.03.2015.
 */
var exKit = {
    cp1251: function (string) {
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
    toContextFunc: function(code) {
        "use strict";
        var context = {};
        var run = this.exec(code, {
            getValue: function() {
                return context.value;
            }
        });
        code = null;
        return function() {
            context = this;
            return run();
        };
    },
    prepareTracker: function(tracker) {
        "use strict";
        /*var prepare = tracker.search.prepare || {};
        for (var key in prepare) {
            var item = prepare[key];
            if (Array.isArray(item)) {
                for (var i = 0, len = item.length; i < len; i++) {
                    var arrItem = item[i];
                    if (typeof arrItem === 'string' && arrItem.substr(0, 8) === 'function') {
                        var func = arrItem.substr(arrItem.indexOf('{') + 1);
                        func = arrItem.substr(0, arrItem.lastIndexOf('}') - 1);
                        item[i] = this.toContextFunc(item[i])
                    }
                }
            }
        }*/
        return tracker;
    },
    funcList: {

    },
    requestPrepare: function(tracker, request) {
        "use strict";
        var requestPrepare = tracker.search.requestPrepare;
        if (!requestPrepare) return request;
        for (var i = 0, item; item = requestPrepare[i]; i++) {
            var type = typeof item;
            if (type === 'string') {
                var func = this.funcList[type];
                if (func !== undefined) {
                    request = func(request);
                }
            } else
            if (type === 'function') {
                request = item(request);
            }
        }
        return request;
    },
    search: function(tracker, request) {
        "use strict";
        request = this.requestPrepare(tracker, request);
        var requestData = tracker.search.requestData;
        if (requestData !== undefined) {
            requestData = requestData.replace('%search%', request);
        }
        var xhr = mono.ajax({
            url: tracker.search.searchUrl.replace('%search%', request),
            type: tracker.search.requestType,
            data: requestData,
            success: engine.search.onSuccess.bind(tracker, request),
            error: function(xhr) {
                engine.search.onError.call(tracker, xhr.status, xhr.statusText);
            }
        });
        return {
            tracker: tracker,
            abort: xhr.abort
        }
    },
    wrapFunc: function() {
        "use strict";
        return this.interpreter.createPrimitive(this.func.apply(null, arguments));
    },
    initEnvFunc: function(funcList, interpreter, scope) {
        "use strict";
        if (!funcList) return;
        for (var funcName in funcList) {
            if (!funcList.hasOwnProperty(funcName)) continue;
            interpreter.setProperty(scope, funcName, interpreter.createNativeFunction(this.wrapFunc.bind({func: funcList[funcName], interpreter: interpreter})));
        }
    },
    exec: function(code, funcList) {
        "use strict";
        return (new Interpreter(code, this.initEnvFunc.bind(exKit, funcList))).run;
    }
};