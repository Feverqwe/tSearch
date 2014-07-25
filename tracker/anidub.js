torrent_lib.anidub = function () {
    var name = 'AniDUB';
    var filename = 'anidub';
    var icon = 'data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAABNmlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjarY6xSsNQFEDPi6LiUCsEcXB4kygotupgxqQtRRCs1SHJ1qShSmkSXl7VfoSjWwcXd7/AyVFwUPwC/0Bx6uAQIYODCJ7p3MPlcsGo2HWnYZRhEGvVbjrS9Xw5+8QMUwDQCbPUbrUOAOIkjvjB5ysC4HnTrjsN/sZ8mCoNTIDtbpSFICpA/0KnGsQYMIN+qkHcAaY6addAPAClXu4vQCnI/Q0oKdfzQXwAZs/1fDDmADPIfQUwdXSpAWpJOlJnvVMtq5ZlSbubBJE8HmU6GmRyPw4TlSaqo6MukP8HwGK+2G46cq1qWXvr/DOu58vc3o8QgFh6LFpBOFTn3yqMnd/n4sZ4GQ5vYXpStN0ruNmAheuirVahvAX34y/Axk/96FpPYgAAACBjSFJNAAB6JQAAgIMAAPn/AACA6AAAUggAARVYAAA6lwAAF2/XWh+QAAABkklEQVR42tTTPWiTURTG8d99E021CRW1LQVBSBxsHRSk0FJwUEERwUkdxM1BcBEH6eBiBzdB3CqIg6Otgy7i4iCiiEqF4qJTrUIURBBjP/Le6+AbSMWtk2c5Xw9/nsvlhJSS9URmnbFuQDh09OSawZIgMDBdbu7bHVYefEnlxUBACS28wg28+aeDzdKRT6k8fy+vLWTiXEYDdezEMM7iNSahVN+1Zw0g8XhTSDvmVb6PheUzjWz5eEvpc+Jj4Af6C+lhvP3bwTHUe0WrXLmc9zfepZ7RgbAyWhPH2sIIxtEs9Ne7HWzAE9SSoE/UTOWJ+6l266eSemirinJhsXAxgazbwQUMdZpcMBjy/T3igav5Ni9Sjy2h3VnHIrc7gF5MFfUqbv+BkAuzB8OvylhY0kolGMSpQvu1A5hCragf4hyeFpDtlZDGq+JwZA4fil+BaxlGcKnrKZNFvglbRS9j5c5MrNarob03CtViP427GS7iGxYwg/eFYBbPsdAnDj2KvZVm2niiKj7DaZyH8P8f0+8BAI2EedpUNIv0AAAAAElFTkSuQmCC';
    var url = 'http://tr.anidub.com/index.php?do=search';
    var root_url = 'http://tr.anidub.com/';
    var about = 'Аниме торрент-трекер Anidub.';
    var flags = {
        a: 1,
        l: 1,
        rs: 1,
        proxy: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var list = f.split('/');
            var cat = $.trim(list.slice(-1));
            if (cat.length === 0) {
                list.splice(-1);
                cat = list.slice(-1);
            }
            cat = $.trim(cat);
            var groups_arr = [
                /* Сериалы */[],
                /* Музыка */['ost'],
                /* Игры */[],
                /* Фильмы */['anime_movie'],
                /* Мультфтльмы */[],
                /* Книги */[],
                /* ПО */[],
                /* Анимэ */['anime_ova', 'dorama', 'manga', 'anime_tv'],
                /* Док. и юмор */[],
                /* Спорт */[],
                []
            ];
            for (var i = 0, len = groups_arr.length; i < len; i++)
                if (groups_arr[i].indexOf(cat) !== -1) {
                    return i;
                }
            return -1;
        };
        var calculateTime = function (f) {
            var dd = f.replace(/[\t:-]/g, ' ').split(' ');
            return Math.round((new Date(parseInt(dd[0]), parseInt(dd[1]) - 1, parseInt(dd[2]), parseInt(dd[3]), parseInt(dd[4]), parseInt(dd[5]))).getTime() / 1000);
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('#dle-content>div.dpad.searchitem');
            var l = t.length;
            if ( l === 0) {
                return [];
            }
            var arr = new Array(l - 1);
            for (var i = 0; i < l - 1; i++) {
                var td = t.eq(i);
                arr[i] = {
                    category: {
                        title: td.find('a:eq(1)').text(),
                        url: td.find('a:eq(1)').attr('href'),
                        id: calculateCategory(td.find('a:eq(1)').attr('href'))
                    },
                    title: td.find('h3>a').text(),
                    url: td.find('h3>a').attr('href'),
                    size: undefined,
                    seeds: undefined,
                    leechs: undefined,
                    time: ex_kit.format_date(1, td.find('b').text())
                }
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr !== undefined)
                xhr.abort();
            xhr = engine.ajax({
                tracker: filename,
                type: 'POST',
                data: 'do=search&subaction=search&showposts=1&story=' + encodeURIComponent(text),
                url: url,
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
        tests: [0, 0, 0, 0, 1, 1, 1, 1, 0]
    };
}();