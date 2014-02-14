torrent_lib.bitsnoop = function () {
    var name = 'BitSnoop';
    var filename = 'bitsnoop';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAAN5SQADG6tQA0pKAAM6ikADt4dgAuy8UAMrWwADWgmwA8c3EAO3d1ADKvqwAwwLoAM6qlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGBgYGBgYGBgYGBgYAAAAGBgYGBgYGBgYGBgYGBgAGBgYGBgYGBgYGBgYGBgYGBgYGBgwBCQkJCQEMBgYGBgYGBgwFCQkJCQkJBQwGBgYGBgYBCQkFDQgKCQkBBgYGBgYGCQkJAwIJCQkJCQYGBgYGBgkJCQcCCQkJCQkGBgYGBgYJCQkHBgIECQkJBgYGBgYGCQkJAwYGAwkJCQYGBgYGBgEJCQULCwUJCQEGBgYGBgYMBQkJCQkJCQUMBgYGBgYGBgwBCQkJCQEMBgYGBgYGBgYGBgYGBgYGBgYGBgYABgYGBgYGBgYGBgYGBgYAAAAGBgYGBgYGBgYGBgYAAMADAACAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAMADAAA%3D';
    var url = 'http://bitsnoop.com/search';
    var root_url = 'http://bitsnoop.com';
    var about = 'The best torrent search in the world. Aggregated torrents from numerous sites and groups, automated verification, super-fast search.';
    var flags = {
        a: 0,
        l: 0,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */['tv'],
                /* Музыка */['audio'],
                /* Игры */['games', 'game_pc', 'xbox'],
                /* Фильмы */['video'],
                /* Мультфтльмы */[],
                /* Книги */['books', 'abooks'],
                /* ПО */['software'],
                /* Анимэ */[],
                /* Док. и юмор */[],
                /* Спорт */[],
                /* XXX */['x3']
            ];
            for (var i = 0, len = groups_arr.length; i < len; i++) {
                if (groups_arr[i].indexOf(f) !== -1) {
                    return i;
                }
            }
            return -1;
        };
        var calculateTime = function (t) {
            if ($.trim(t.substr(0, 1)).length === 0)
                return 0;
            if ((/today/).test(t)) {
                return Math.round((new Date().getTime() / 1000) / (60 * 60 * 24)) * (60 * 60 * 24);
            } else if ((/yesterday/).test(t)) {
                return (Math.round((new Date().getTime() / 1000) / (60 * 60 * 24)) * (60 * 60 * 24)) - (60 * 60 * 24);
            } else if ((/ old/).test(t)) {
                var time = parseInt(t.replace(/([0-9]*).*/, '$1'));
                var nowTime = Math.round(new Date().getTime() / 1000);
                if ((/second/).test(t)) {
                    return nowTime - time;
                } else if ((/minute/).test(t)) {
                    return nowTime - time * 60;
                } else if ((/hour/).test(t)) {
                    return nowTime - time * 60 * 60;
                } else if ((/day/).test(t)) {
                    return nowTime - time * 60 * 60 * 24;
                } else if ((/week/).test(t)) {
                    return nowTime - time * 60 * 60 * 24 * 7;
                } else if ((/month/).test(t)) {
                    return nowTime - time * 60 * 60 * 24 * 30;
                } else if ((/year/).test(t)) {
                    return nowTime - time * 60 * 60 * 24 * 365;
                }
            }
            return 0;
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('#torrents').children('li');
            var l = t.length;
            var arr = new Array(l);
            for (var i = 0; i < l; i++) {
                var li = t.eq(i);
                li.children('div[id="sz"]').find('td').eq(0).children('div.nfiles').remove();
                var ss = li.children('div.torInfo').children('span.seeders').text().replace(',', '');
                var ls = li.children('div.torInfo').children('span.leechers').text().replace(',', '');
                if (ls.length === 0) {
                    ls = 0;
                }
                if (ss.length === 0) {
                    ss = 0;
                }
                arr[i] = {
                    category: {
                        title: li.children('span.icon').attr('title'),
                        id: calculateCategory(li.children('span.icon').attr('class').replace(/icon cat_(.*)/, '$1'))
                    },
                    title: li.children('a').text(),
                    url: root_url + li.children('a').attr('href'),
                    size: ex_kit.format_size(li.children('div[id="sz"]').find('td').eq(0).text()),
                    seeds: ss,
                    leechs: ls,
                    time: calculateTime(li.children('div.torInfo').text().replace(/.*— .* — (.*)/, '$1'))
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
                cache: false,
                data: {
                    q: text + ' safe:no',
                    t: 'all'
                },
                success: function (data) {
                    view.result(filename, readCode(data), t);
                },
                error: function (xhr, ajaxOptions, thrownError) {
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
        tests: [0, 0, 1, 0, 0, 1, 0, 0, 0]
    }
}();