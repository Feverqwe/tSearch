var ex_kit = function() {
    /*
     * Набор универсальных тулзов для использования в пользовательских кодах трекеров.
     */
    var in_cp1251 = function(sValue) {
        var text = "", Ucode, ExitValue, s;
        for (var i = 0, sValue_len = sValue.length; i < sValue_len; i++) {
            s = sValue.charAt(i);
            Ucode = s.charCodeAt(0);
            var Acode = Ucode;
            if (Ucode > 1039 && Ucode < 1104) {
                Acode -= 848;
                ExitValue = "%" + Acode.toString(16);
            }
            else if (Ucode === 1025) {
                Acode = 168;
                ExitValue = "%" + Acode.toString(16);
            }
            else if (Ucode === 1105) {
                Acode = 184;
                ExitValue = "%" + Acode.toString(16);
            }
            else if (Ucode === 32) {
                Acode = 32;
                ExitValue = "%" + Acode.toString(16);
            }
            else if (Ucode === 10) {
                Acode = 10;
                ExitValue = "%0A";
            }
            else {
                ExitValue = s;
            }
            text = text + ExitValue;
        }
        return text;
    };
    var format_size = function(s) {
        var size = s.toLowerCase().replace(/[^0-9.,кбмгтkmgtb]/g, '').replace(',', '.');
        var t = size.replace(/кб|kb/, '');
        if (t.length !== size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024);
        }
        t = size.replace(/мб|mb/, '');
        if (t.length !== size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024 * 1024);
        }
        t = size.replace(/гб|gb/, '');
        if (t.length !== size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024 * 1024 * 1024);
        }
        t = size.replace(/тб|tb/, '');
        if (t.length !== size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024 * 1024 * 1024 * 1024);
        }
        return 0;
    };
    function today_replace(t, f) {
        f = parseInt(f);
        t = t.toLowerCase();
        if ((/сейчас|now/).test(t)) {
            return Math.round((new Date()).getTime() / 1000);
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
        t = t.replace(/сегодня|today/, today).replace(/вчера|yesterday/, yesterday);
        return t;
    }
    function month_replace(t) {
        return t.toLowerCase().replace(/янв/, '1').replace(/фев/, '2').replace(/мар/, '3')
            .replace(/апр/, '4').replace(/ма(я|й)/, '5').replace(/июн/, '6')
            .replace(/июл/, '7').replace(/авг/, '8').replace(/сен/, '9')
            .replace(/окт/, '10').replace(/ноя/, '11').replace(/дек/, '12')
            .replace(/jan/, '1').replace(/feb/, '2').replace(/mar/, '3')
            .replace(/apr/, '4').replace(/may/, '5').replace(/jun/, '6')
            .replace(/jul/, '7').replace(/aug/, '8').replace(/sep/, '9')
            .replace(/oct/, '10').replace(/nov/, '11').replace(/dec/, '12');
    }
    var format_date = function(f, t) {
        if (f === undefined) {
            return ['2013-04-31[[[ 07]:03]:27]', '31-04-2013[[[ 07]:03]:27]', 'n day ago'];
        }
        f = parseInt(f);
        if (f === 0) { // || f === '2013-04-31[[[ 07]:03]:27]') {
            var dd = t.replace(/[^0-9]/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
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
            } else
            if (dd[0] < 100) {
                dd[0] = '20' + dd[0];
            }
            return Math.round((new Date(dd[0], dd[1] - 1, dd[2], dd[3], dd[4], dd[5])).getTime() / 1000);
        }
        if (f === 1) { //  || f === '31-04-2013[[[ 07]:03]:27]') {
            var dd = t.replace(/[^0-9]/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
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
            } else
            if (dd[2] < 100) {
                dd[2] = '20' + dd[2];
            }
            return Math.round((new Date(dd[2], dd[1] - 1, dd[0], dd[3], dd[4], dd[5])).getTime() / 1000);
        }
        if (f === 2) { //  || f === 'n day ago') {
            var old = parseFloat(t.replace(/[^0-9.]/g, '')) * 24 * 60 * 60;
            return Math.round((new Date()).getTime() / 1000) - old;
        }
    };
    var isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    return {
        isNumber: isNumber,
        in_cp1251: in_cp1251,
        format_size: format_size,
        month_replace: month_replace,
        format_date: format_date,
        today_replace: today_replace
    };
}();