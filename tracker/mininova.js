torrent_lib.mininova = function () {
    var name = 'mininova';
    var filename = 'mininova';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AOJwNgDws5QAh0ogAPjZygDpkmYA9MmzAOaATQDsonwA++riAO6riQDyvKIA5HY/APni1gDnh1cARERERERERERBERERERERFEEREREREREUQRERERERERRBInHiLhciFEEiceIuFyIUQSJx4i4XIhRBIsHiJRciFEEiYXIjEygUQSIv0tJtKxRBiMYoVY2aFEEREREREREUQRERERERERRBERERERERFEEREREREREUREREREREREQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    var url = 'http://www.mininova.org/search/';
    var root_url = 'http://www.mininova.org';
    var about = 'Download Movies, TV Shows, Music, Software and more. Mininova is the largest BitTorrent search engine and directory on the net with thousands of torrents.';
    var flags = {
        a: 0,
        l: 0,
        rs: 0
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[8],
                /* Музыка */[5],
                /* Игры */[3],
                /* Фильмы */[4],
                /* Мультфтльмы */[],
                /* Книги */[2],
                /* ПО */[7],
                /* Анимэ */[1]
            ];
            f = parseInt(f);
            for (var i = 0, len = groups_arr.length; i < len; i++) {
                if (groups_arr[i].indexOf(f) !== -1) {
                    return i;
                }
            }
            return -1;
        };
        var calculateTime = function (s) {
            var s = s.replace(/([0-9]*)([^0-9]*)([0-9]*)/, '$1 $2 $3')
            var d = s.split(" ");
            var date = d[0];
            var month = $.trim(d[1]);
            var year = '20' + d[2];
            if (month === 'Jan')
                month = '01';
            if (month === 'Feb')
                month = '02';
            if (month === 'Mar')
                month = '03';
            if (month === 'Apr')
                month = '04';
            if (month === 'May')
                month = '05';
            if (month === 'Jun')
                month = '06';
            if (month === 'Jul')
                month = '07';
            if (month === 'Aug')
                month = '08';
            if (month === 'Sep')
                month = '09';
            if (month === 'Oct')
                month = '10';
            if (month === 'Nov')
                month = '11';
            if (month === 'Dec')
                month = '12';
            return Math.round((new Date(parseInt(year), parseInt(month) - 1, parseInt(date))).getTime() / 1000)
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('table.maintable').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 1; i < l; i++) {
                var td = t.eq(i).children('td');
                if (td.eq(1).children('a').attr('href') === undefined){
                    continue;
                }
                arr.push({
                    category: {
                        title: td.eq(2).children('small').children('strong').children('a').text(),
                        url: root_url + td.eq(1).children('a').attr('href'),
                        id: calculateCategory(td.eq(1).children('a').attr('href').replace(/.*cat\/([0-9]*)$/i, "$1"))
                    },
                    title: td.eq(2).children('a[class!="dl"][class!="ti com"]').text(),
                    url: root_url + td.eq(2).children('a[class!="dl"][class!="ti com"]').attr('href'),
                    size: ex_kit.format_size(td.eq(3).text()),
                    dl: root_url + td.eq(2).children('a[class="dl"]').attr('href'),
                    seeds: td.eq(4).children().text(),
                    leechs: td.eq(5).children().text(),
                    time: calculateTime(td.eq(0).text())
                });
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
                cache: false,
                data: {
                    search: text,
                    cat: 0
                },
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
        tests: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
}();