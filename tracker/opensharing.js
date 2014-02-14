torrent_lib.opensharing = function () {
    var name = 'OpenSharing';
    var filename = 'opensharing';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABILAAASCwAAAAAAAAAAAAAAAA8AElrJ/xJayf8SWsn/ElrJ/xJayf8SWsn/ElrJ/xJayf8SWsn/ElrJ/xJayf8SWsn/ElrJ/xJayf8Ah0sAElzL/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/ElzL/xNfzv8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xeB8/8Uduz/FHbs/xeB8/8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xNfzv8TYtH/GIT0/xiE9P8YhPT/GIT0/xd/8f8RaeT///////////8RaeT/F3/x/xiE9P8YhPT/GIT0/xiE9P8TYtH/FGbV/xeB8f8XgfH/F4Hx/xZ87v8QZ+H//////////////////////xBn4f8WfO7/F4Hx/xeB8f8XgfH/FGbV/xRq2f8Xfu7/F37u/xZ56/8QZN7/////////////////////////////////EGTe/xZ56/8Xfu7/F37u/xRq2f8Vbt3/Fnrq/xZ66v8TcOT///////////////////////////////////////////8TcOT/Fnrq/xZ66v8Vbt3/FXLi/xZ25v8Wdub/FXHj/xJo3f8NVdD//////////////////////w1V0P8SaN3/FXHj/xZ25v8Wdub/FXLi/xZ25v8VcuL/FXLi/xVy4v8VcuL/EF/W//////////////////////8QX9b/FXLi/xVy4v8VcuL/FXLi/xZ25v8Weur/FW7d/xVu3f8Vbt3/FW7d/xBc0f//////////////////////EFzR/xVu3f8Vbt3/FW7d/xVu3f8Weur/F37u/xRq2f8Uatn/FGrZ/xRq2f8PWc3//////////////////////w9Zzf8Uatn/FGrZ/xRq2f8Uatn/F37u/xeB8f8UZtX/FGbV/xRm1f8UZtX/D1XK//////////////////////8PVcr/FGbV/xRm1f8UZtX/FGbV/xeB8f8YhPT/E2LR/xNi0f8TYtH/E2LR/xBWyf//////////////////////EFbJ/xNi0f8TYtH/E2LR/xNi0f8YhPT/GIb2/xNfzv8TX87/E1/O/xNfzv8SW8v/EFTG/w5Qw/8OUMP/EFTG/xJby/8TX87/E1/O/xNfzv8TX87/GIb2/xiG9v8SXMv/ElzL/xJcy/8SXMv/ElzL/xJcy/8SXMv/ElzL/xJcy/8SXMv/ElzL/xJcy/8SXMv/ElzL/xiG9v8AzdMAGIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8AjU4AgAE9sQAAsYAAAEHpAACl1QAAGJ8AAAAmAADRIQAAL7MAAFNAAACvfgAA1c8AAJXOAABlJwAAB60AAGWmgAHAaQ%3D%3D';
    var url = 'http://opensharing.org/newsearch.php';
    var root_url = 'http://opensharing.org';
    var about = 'Открытый торрент-трекер без регистрации и рейтинга';
    var flags = {
        a: 0,
        l: 1,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateTime = function (s) {
            var d = s.split(' ');
            var date = d[0];
            var month = d[1];
            var year = '20' + d[2];
            if (month === 'Янв')
                month = '01';
            if (month === 'Фев')
                month = '02';
            if (month === 'Мар')
                month = '03';
            if (month === 'Апр')
                month = '04';
            if (month === 'Май')
                month = '05';
            if (month === 'Июн')
                month = '06';
            if (month === 'Июл')
                month = '07';
            if (month === 'Авг')
                month = '08';
            if (month === 'Сен')
                month = '09';
            if (month === 'Окт')
                month = '10';
            if (month === 'Ноя')
                month = '11';
            if (month === 'Дек')
                month = '12';
            return Math.round((new Date(parseInt(year), parseInt(month) - 1, parseInt(date))).getTime() / 1000)
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('#index').children('table').children('tbody').children('tr');
            var l = t.length;
            var arr = new Array(l);
            for (var i = 1; i < l; i++) {
                var td = t.eq(i).children('td');
                var corr = 0;
                if (td.length > 5) {
                    corr = 1;
                }
                td.eq(2 + corr).children('span').children('img').remove();
                arr[i - 1] = {
                    category: {
                        id: -1
                    },
                    title: td.eq(1).children('a').eq(2).text(),
                    url: root_url + td.eq(1).children('a').eq(2).attr('href'),
                    size: ex_kit.format_size(td.eq(4 + corr).text()),
                    dl: td.eq(1).children('a').eq(0).attr('href'),
                    seeds: td.eq(2 + corr).children('span.green').text(),
                    leechs: td.eq(3 + corr).children('span.red').text(),
                    time: calculateTime(td.eq(0).text())
                }
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr !== undefined)
                xhr.abort();
            xhr = $.ajax({
                type: 'GET',
                url: url,
                data: {
                    search_word: text,
                    search_place: 0,
                    search_direction_asc: 1,
                    search_type: 1,
                    search_cat: 0,
                    search_sort: 2
                },
                cache: false,
                success: function (data) {
                    view.result(filename, readCode(data), t);
                },
                error: function () {
                    view.loadingStatus(2, filename);
                }
            });
        };
        return {
            getPage: function (a) {
                return loadPage(a);
            }
        }
    }();
    var find = function (text) {
        return web.getPage(text);
    };
    return {
        find: function (a) {
            return find(a);
        },
        stop: function(){
            if (xhr !== undefined) {
                xhr.abort();
            }
            //view.loadingStatus(1, filename);
        },
        name: name,
        icon: icon,
        about: about,
        url: root_url,
        filename: filename,
        flags: flags,
        tests: [0, 1, 1, 0, 0, 0, 0, 0, 0]
    }
}();