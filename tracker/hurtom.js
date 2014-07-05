torrent_lib.hurtom = function () {
    var name = 'Hurtom';
    var filename = 'hurtom';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8AMHta2jB8WtonglTaJIVS2iSCU9ole1TaSIxywP3+/SX9/v0lQ5JywCSAV9oqglXaLIBU2il+VNoogFraKIBa2rjSxme508dnP4df0w5oNf9UlHC9tdLEZMDXzlz9/v4p/f7+Kb7Zzly01MRkV5Z0vRNoO/9Bh2LUtdTFabXUxWn9/v0S/f79KFOTcsIOZzn/cqaLof7+/CH+/v0R/v7+Ef7+/hH+/v0R/v78IXWpj6EPaT7/T5Fwwvz+/Cr9/v0T////AP3+/iRSk3LCDmg8/3Knjaf7/v0k////AP///wD///8A////APz+/SJ1qpGmDWg8/0yOb8T8/v4q////AP///wD9/v4jVZJywRNnOv90p42s+f7+K////wD///8A////AP///wD7/v0mdaeNqBJmOv9Qjm7F+/7+Lf///wD///8A/v39IlKUccEPajn/cqiLp/z+/SX9/v0F/f79B/3+/Qf9/f0F/v39HnOojaEQbDz/U5VzxPz9/Sn///8A////AP39/iVKlHLCAmo7/2yojaH+/v0o/f79Kfv+/DP8/v0y/f39Kf79/Shvp42hCGk9/0yScsH+/f4i////AP///wD+/vwiTpVowQ1wMv8Pajj/EGE+/xhlQv8YZUD/F2Q//wpnP/8CZj3/AHA5/wB0M/9Gl2nG+v78Mf///wD///8A/f79JU+TbsINbTn/ZaKCuNfn4Ffa5+FQ2+fhTdvn4U3Y6OFP1+jgUGCfgLQIaTj/TZJvwvz+/Sj///8A////APz9/ipJkXHEBWk+/26pkKX8/f0l/f79Dv3+/Qz9/v0M/f79Dv39/SNxqJGkCWtC/06VeML8/f4o////AP///wD9/f0mVJFxwhBmOf9zpYuh/v39HP///wD///8A////AP///wD+/f0cc6aNoQxnO/9QkXLC/f39Jf///wD///8A/f79I1eTb8IVaDj/eKiLo/3+/R7///8A////AP///wD///8A/v79HHKmiqENZjf/UJBuwv3+/SX///8A/v79Cv3+/SZPkm/CD2s6/3Sqjqb8/v0m/f3+DP79/gr9/f0K/f7+DP3+/SJwpo2kCmg8/1CUdMX7/v0v/f79D9vn4Ubb5+FIR4tmyQ5oN/9jn4C11ujiU97r5kb+/v0o/v39KN/r5kXY5+JPYp2BtAtnOP9Fi2jO1ujhVdbo4lIVZz3/FWc9/wZyL/8Adyv/AHEz/wNoP/8sfFzg/v77KP7++ygsfFzgB2Q//wtsNv8Ocy//CXAz/wBrQP8BbEH///8AAAGAAADH4wAAx+MAAMfjAADH4wAAx+MAAMfjAADAAwAAx+MAAMfjAADH4wAAx+MAAMfjAADH4wAAAYAAAA%3D%3D';
    var url = 'http://toloka.hurtom.com/tracker.php';
    var root_url = 'http://toloka.hurtom.com/';
    var about = 'Об\'єднаймо все українське гуртом! Завантажити або скачати фільми і мультфільми українською, HD, українську музику, літературу, ігри та українізації';
    /*
     * a = требует авторизации
     * l = русскоязычный или нет
     * rs= поддержка русского языка
     */
    var flags = {
        a: 1,
        l: 0,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[125, 124, 32, 44, 192, 195],
                /* Музыка */[8, 23, 24, 43, 35, 37, 36, 38, 56, 98, 100, 101, 102, 103, 104, 105, 106],
                /* Игры */[10, 28, 29, 30, 41, 212, 205],
                /* Фильмы */[117, 42, 129, 219, 118, 16, 19, 55, 94, 144, 190, 70, 193, 194, 196, 197, 119, 18, 132],
                /* Мультфтльмы */[84],
                /* Книги */[11, 134, 177, 178, 179, 180, 183, 181, 182, 184, 185, 135, 186, 187, 189],
                /* ПО */[9, 25, 199, 203, 204, 200, 201, 202, 26, 234, 27, 122, 211, 40, 12],
                /* Анимэ */[127],
                /* Док. и юмор */[225, 21, 131, 226, 227, 228, 229, 230, 136, 96, 173, 139, 174, 140, 120, 66, 137, 138, 33],
                /* Спорт */[157, 235, 170, 162, 166, 167, 168, 169, 54, 158, 159, 160, 161]
            ];
            f = parseInt(f);
            for (var i = 0, len = groups_arr.length; i < len; i++) {
                if (groups_arr[i].indexOf(f) !== -1) {
                    return i;
                }
            }
            return -1;
        };
        var calculateTime = function (f) {
            var dd = f.split('-');
            return Math.round((new Date(parseInt(dd[0]), parseInt(dd[1]) - 1, parseInt(dd[2]))).getTime() / 1000);
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('table.forumline').eq(1).children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 1; i < l - 1; i++) {
                var td = t.eq(i).children('td');
                if (td.eq(5).children('a').attr('href') === undefined) {
                    continue;
                }
                arr.push({
                    category: {
                        title: td.eq(1).children('a').text(),
                        url: root_url + td.eq(1).children('a').attr('href'),
                        id: calculateCategory(td.eq(1).children('a').attr('href').replace(/.*f=([0-9]*)$/i, "$1"))
                    },
                    title: td.eq(2).children('a').text(),
                    url: root_url + td.eq(2).children('a').attr('href'),
                    size: ex_kit.format_size(td.eq(6).text()),
                    dl: root_url + td.eq(5).children('a').attr('href'),
                    seeds: td.eq(9).text(),
                    leechs: td.eq(10).text(),
                    time: calculateTime(td.eq(12).text())
                });
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr !== undefined)
                xhr.abort();
            xhr = engine.ajax({
                type: 'POST',
                url: url,
                cache: false,
                data: {
                    f: -1,
                    tm: -1,
                    sns: -1,
                    sds: -1,
                    my: 0,
                    sd: 0,
                    n: 0,
                    nm: text
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