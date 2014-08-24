var notify = function () {
    "use strict";
    var _prefix = 'nf';
    var notifi;
    var layer;
    var body;
    var cb;
    var close = function () {
        layer.remove();
        notifi.remove();
        layer = undefined;
        notifi = undefined;
        inputs = [];
        count = 0;
    };
    var inputs = [];
    var count = 0;
    var getValues = function () {
        var vals = [];
        inputs.forEach(function (item) {
            var val = item.val();
            if (val === undefined) {
                val = undefined;
            } else if (val === null) {
                val = undefined;
            } else if (val.length === 0) {
                val = undefined;
            }
            vals.push(val);
        });
        return vals;
    };
    var createLayer = function () {
        layer = $('<div>', {'class': _prefix + '-layer'}).on('mousedown',function () {
            close();
            cb();
        }).appendTo(body);
    };
    var createType = function (_item) {
        var type = _item.type;
        var item = $('<div>', {'class': 'item ' + type});
        if (type !== 'buttons') {
            item.append($('<span>', {text: _item.text}));
        }
        if (type === 'note') {
            count++;
        }
        if (type === 'select') {
            var select = $('<select>');
            $.each(_item.options, function (key, value) {
                if (_item.o === 'folders') {
                    select.append($('<option>', {text: value[1], value: key}));
                } else {
                    select.append($('<option>', {text: value, value: key}));
                }
            });
            if (_item.empty) {
                select.append($('<option>', {text: '', value: '', selected: true}));
            }
            item.append(select);
            inputs.push(select);
            if (_item.options.length === 0) {
                return '';
            }
            count++;
        } else if (type === 'input') {
            var input = $('<input>',{value: _item.value});
            item.append(input);
            inputs.push(input);
            count++;
        } else if (type === 'buttons') {
            $('<button>', {'class': 'btn_cancel', text: _item.textNo}).on('click',function (e) {
                e.preventDefault();
                e.stopPropagation();
                close();
                cb();
            }).appendTo(item);
            $('<button>', {'class': 'btn_ok', text: _item.textOk}).on('click',function (e) {
                e.preventDefault();
                e.stopPropagation();
                cb(getValues());
                close();
            }).appendTo(item);
        } else if (type === 'textarea') {
            var input = $('<textarea>',{text: _item.value});
            item.append(input);
            inputs.push(input);
            count++;
        }
        return item;
    };
    var createNotifi = function (array, textOk, textNo) {
        notifi = $('<div>', {'class': _prefix + '-notifi'});
        notifi.on('click', function(e) {
            e.stopPropagation();
        });
        array.forEach(function (item) {
            notifi.append(createType(item));
        });
        notifi.append(createType({type: 'buttons', textOk: textOk, textNo: textNo}))
            .appendTo(body);
        for (var i = 0, inp; inp = inputs[i]; i++) {
            if (i === 0) {
                inp.focus();
            }
            inp.on('keydown', function (e) {
                if (e.target.tagName === 'TEXTAREA') {
                    return;
                }
                if (e.keyCode === 13) {
                    e.preventDefault();
                    notifi.find('button.btn_ok').trigger('click');
                } else if (e.keyCode === 27) {
                    e.preventDefault();
                    notifi.find('button.btn_cancel').trigger('click');
                }
            });
        }
        if (mono.isOpera) {
            notifi.css('left', ((body.width() - notifi.width()) / 2) + 'px' );
        }
    };
    return function (array, textOk, textNo, _cb) {
        if (layer !== undefined || notifi !== undefined) {
            close();
            cb();
        }
        if (body === undefined) {
            body = $('body');
        }
        createLayer();
        createNotifi(array, textOk, textNo);
        cb = _cb;
        if (count === 0) {
            cb(getValues());
            close();
        }
    }
}();