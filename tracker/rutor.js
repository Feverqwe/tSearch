torrent_lib.rutor = function () {
    var name = 'Рутор';
    var filename = 'rutor';
    var icon = 'data:image/x-icon;base64,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';
    var url = 'http://rutor.org/search/0/0/100/0/';
    var root_url = 'http://rutor.org';
    var about = 'Открытый торрент трекер';
    var flags = {
        a: 0,
        l: 1,
        rs: 1,
        proxy: 1
    };
    var xhr = undefined;
    var web = function () {
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('#index').children('table').children('tbody').children('tr');
            var l = t.length;
            var arr = new Array(l);
            for (var i = 1; i < l; i++) {
                var td = t.eq(i).children('td');
                arr[i - 1] = {
                    category: {
                        id: -1
                    },
                    title: td.eq(1).children('a').eq(2).text(),
                    url: root_url + td.eq(1).children('a').eq(2).attr('href'),
                    size: ex_kit.format_size(td.eq(-2).text()),
                    dl: td.eq(1).children('a').eq(-2).attr('href'),
                    seeds: td.eq(-1).children('span.green').text(),
                    leechs: td.eq(-1).children('span.red').text(),
                    time: ex_kit.format_date(1, ex_kit.month_replace(td.eq(0).text()))
                };
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr !== undefined)
                xhr.abort();
            xhr = engine.ajax({
                tracker: filename,
                type: 'GET',
                url: url + text,
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
        };
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
    };
}();