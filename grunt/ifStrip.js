/**
 * Created by Anton on 09.07.2015.
 */
var idIndex = 0;
exports.setIfId = function(content) {
    "use strict";
    var hasIf = false;
    content = content.replace(/(\/\/@if)(\s+)/g, function(text, aif, space) {
        hasIf = true;
        return aif + idIndex + space;
    });
    hasIf && idIndex++;
    return content;
};
var strTo = function(str) {
    "use strict";
    var value = str;
    if (strTo.isNumber.test(value)) {
        value = parseFloat(value);
    } else
    if (strTo.isBool.test(value)) {
        value = value === 'true';
    }
    return value;
};
strTo.isNumber = /^[\d.]+$/;
strTo.isBool = /^(true|false)$/i;
exports.ifStrip = function(data, options) {
    "use strict";
    options = options || {};
    for (var key in options) {
        options[key] = strTo(options[key]);
    }
    var startPos = -1;
    var n = 1000;
    while (true) {
        if (n-- === 0) {
            console.error('Cycle!');
            return;
        }

        startPos = data.indexOf('//@if', startPos);
        if (startPos === -1) {
            break;
        }

        var str = data.substr(startPos, data.indexOf('>', startPos) - startPos);
        var endPos = data.indexOf(str + '<', startPos);
        var ifLen = str.length + 1;

        var sIf = str.match(/\/\/@if\d*\s+([^><]+)/);

        if (!sIf) {
            continue;
        }

        var ifList = sIf[1].split(/(\|\||&&)/);

        var result = undefined;
        for (var i = 0, item; item = ifList[i]; i++) {
            if (item === '&&') {
                if (!result) {
                    break;
                }
                continue;
            } else
            if (item === '||') {
                if (result) {
                    break;
                }
                continue;
            }
            var keyValue = item.split('=');
            key = keyValue[0];
            if (key.slice(-1) === '!') {
                key = key.slice(0, -1);
                result = !options[key];
            } else
            if (key[0] === '!') {
                key = key.substr(1);
                result = !options[key];
            } else {
                var value = strTo(keyValue[1]);
                result = options[key] === value;
            }
        }

        if (!result) {
            data = data.substr(0, startPos) + data.substr(endPos + ifLen);
        } else {
            data = data.substr(0, endPos) + data.substr(endPos + ifLen);
            data = data.substr(0, startPos) + data.substr(startPos + ifLen);
        }
    }

    return data;
};