torrent_lib.kickass = function () {
    var name = 'KickAss';
    var filename = 'kickass';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHUFLcyFLV74bO0UuAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeQEthLmNy+DVzhf81c4X/NXOF/ydUYdscPEUdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkTFeuN3WG/zh2iP84doj/OHaI/zh2iP84doj/M2t7/B9BS1IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlS1ecPHmM/zx5jP88eYz/WIyc/3OfrP9BfI//PHmM/zx5jP83b4D9IEFLPgAAAAAAAAAAAAAAAAAAAAAiQ0wzPXiJ/kB9j/9AfY//XZGg//b5+v//////4uvu/2iZp/9AfY//QH2P/zNkcu4AAAAAAAAAAAAAAAAAAAAAMl1q2UWBlP9FgZT/RYGU/73T2f///////f7+//L29//p8PL/RYGU/0WBlP9FgZT/KUxXgAAAAAAAAAAAJ0ZPHUeBk/9Khpj/SoaY/0qGmP/b5+r//////7vR2P9Khpj/bp6t/0qGmP9Khpj/SoaY/zlndOcAAAAAAAAAAC9SXIBPi53/T4ud/0+Lnf9Pi53/0eHm///////F2d//T4ud/0+Lnf9Pi53/T4ud/0+Lnf9Mhpf/KEZPEgAAAAA4YGu+VJCh/1SQof9UkKH/VJCh/8HX3f//////6/L0/1SQof9UkKH/VJCh/1SQof9UkKH/VJCh/y9QWVwAAAAAQGp31lmUpv9ZlKb/aZ6u/5u/yv/W5en////////////C2N//3urt/3Smtf9ZlKb/WZSm/1mUpv81WWOIAAAAAENseNRemar/Xpmq/3Wntv////////////////////////////////+VvMf/Xpmq/16Zqv9emar/OFtlhAAAAABCaHS+Y52v/2Odr/9nn7H/iLTC/4Kxv//0+Pn//////6zL1f9jna//Y52v/2Odr/9jna//Y52v/zdXYVwAAAAAPF5od2ehsv9nobL/Z6Gy/2ehsv9nobL/xtzi///////f6+//Z6Gy/2ehsv9nobL/Z6Gy/2Wdrv80UVoSAAAAADZTXBJkmqr+a6W2/2ultv9rpbb/a6W2/2ultv9rpbb/a6W2/2ultv9rpbb/a6W2/2ultv9SfovlAAAAAAAAAAAAAAAAS3J9xG+ouf9vqLn/XIuZ9GGTovpvqLn/b6i5/2+ouf9gkqD5Zpqp/W+ouf9vqLn/QWJsdwAAAAAAAAAAAAAAADtZYhdbipfxQWJrbgAAAAAAAAAAR2t2p2CRn/dBYmtuAAAAAAAAAABGanSgVH6L3wAAAAAAAAAA/j8AAPgPAADwBwAA4AMAAMADAADAAQAAgAEAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIABAADAAQAAxjMAAA%3D%3D';
    var url = 'http://kickass.to/search/';
    var blank_url = 'http://kickass.to/new/';
    var root_url = 'http://kickass.to';
    var about = 'Search and download new TV shows, TV series, movies, mp3, music and PC/PS2/PSP/Wii/Xbox games absolutely for free.';
    var flags = {
        a: 0,
        l: 0,
        rs: 1,
        proxy: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[],
                /* Музыка */['music'],
                /* Игры */[],
                /* Фильмы */['movies', 'tv'],
                /* Мультфтльмы */[],
                /* Книги */['books'],
                /* ПО */['applications'],
                /* Анимэ */['anime'],
                /* Док. и юмор */[],
                /* Спорт */[],
                /* Порно */['xxx']
            ];
            for (var i = 0, len = groups_arr.length; i < len; i++) {
                if (groups_arr[i].indexOf(f) !== -1) {
                    return i;
                }
            }
            return -1;
        };
        var calcTime = function (t) {
            t = t.replace(/([0-9]*)\s([A-Za-z]*)/, '$1|$2').split('|');
            var type_time = t[1];
            var val = parseInt(t[0]);
            var nowTS = Math.round((new Date()).getTime() / 1000);
            if ((/sec/).test(type_time)) {
                nowTS -= val;
            } else if ((/min/).test(type_time)) {
                nowTS -= val * 60;
            } else if ((/hour/).test(type_time)) {
                nowTS -= val * (60 ^ 2);
            } else if ((/day/).test(type_time)) {
                nowTS -= val * (60 ^ 2) * 24;
            } else if ((/week/).test(type_time)) {
                nowTS -= val * (60 ^ 2) * 24 * 7;
            } else if ((/month/).test(type_time)) {
                nowTS -= val * (60 ^ 2) * 24 * 30;
            } else if ((/year/).test(type_time)) {
                nowTS -= val * (60 ^ 2) * 24 * 365;
            } else
                return 0;
            return nowTS;
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('table.data').children('tbody').children('tr');
            var l = t.length;
            var arr = new Array(l);
            for (var i = 1; i < l; i++) {
                var td = t.eq(i).children('td');
                var category = td.eq(0).children('div.torrentname').children('div').children('span').children('span');
                var cat_href = category.find('a').eq(0).attr('href');
                var link = td.eq(0).children('div.torrentname').children('div').children('a');
                var catId = -1;
                if (cat_href !== undefined) {
                    catId = calculateCategory(cat_href.replace(/\/(.*)\/$/, "$1"));
                }
                arr[i - 1] = {
                    category: {
                        title: category.text(),
                        url: root_url + cat_href,
                        id: catId
                    },
                    title: link.text(),
                    url: root_url + link.attr('href'),
                    size: ex_kit.format_size(td.eq(1).text()),
                    dl: td.eq(0).children('div').eq(0).children('a.imagnet').attr('href'),
                    seeds: td.eq(4).text(),
                    leechs: td.eq(5).text(),
                    time: calcTime(td.eq(3).text())
                }
            }
            return arr;
        };
        var loadPage = function (text, cb) {
            if (xhr !== undefined)
                xhr.abort();
            xhr = engine.ajax({
                tracker: filename,
                type: 'GET',
                url: (!text) ? blank_url : url + text + '/',
                success: function (data) {
                    cb(1, readCode(data));
                },
                error: function () {
                    cb(2, 2);
                }
            });
        };
        return {
            getPage: loadPage
        }
    }();
    return {
        find: web.getPage,
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