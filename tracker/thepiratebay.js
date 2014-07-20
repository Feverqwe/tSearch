torrent_lib.thepiratebay = function () {
    var name = 'ThePirateBay';
    var filename = 'thepiratebay';
    var icon = 'data:image/png;base64,Qk04AwAAAAAAADYAAAAoAAAAEAAAABAAAAABABgAAAAAAAAAAADgTAAA4EwAAAAAAAAAAAAA/////////////////////////////////////////////////////v7+/////////////Pz8vb297Ozs////////////////////////////////4uLiSUlJ3d3d////////8/PzEhIScnJy8fHx////////////////////8fHxwsLCWFhYAAAAyMjI////////5+fnEBAQICAgQkJCV1dXZWVli4uLiYmJUlJSKioqPT09bm5uHh4eYWFhwcHBubm5bGxsQEBAp6end3d3FBQUAAAAFBQUOTk5ISEhGRkZPT09WVlZQkJCKioqJycnenp6AAAAQUFBPz8/YGBgjo6O0dHR+/v7////////7+/vxcXFnZ2dg4ODExMTQEBAv7+/AAAAgoKCjo6OpaWltra2qqqqpqampaWlpKSkra2tr6+vsbGx5eXll5eXW1tb1NTUcXFxmJiYAwMDAAAANzc3VFRUGxsbAAAAX19fPDw8ERERAAAAQUFB/v7+/Pz8////////nJycAAAAAAAAAAAAHx8fCwsLAAAAJiYmBQUFAAAAAAAAKysr+vr6////////////nJycAAAAAAAADw8PAAAAAAAAAAAAAAAADQ0NAwMDAAAANjY2+vr6////////////rq6uAAAANjY25eXlWVlZHx8fJycnIyMj0dHRhoaGAAAAV1dX////////////////r6+vAAAALS0t0tLSX19fsrKy2dnZZWVlsrKyiIiIAAAAWVlZ////////////////r6+vAAAAAAAABQUFAgICExMTEBAQAwMDAwMDAQEBAAAAWlpa////////////////q6urAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVFRU////////////////19fXSUlJQUFBQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQkJCQkJCqKio/////////////////////////v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////AAA%3D';
    var url = 'http://thepiratebay.se/search/';
    var root_url = 'http://thepiratebay.se';
    var about = 'Download music, movies, games, software and much more. The Pirate Bay is the world\'s largest bittorrent tracker.';
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
                /* Музыка */[101, 102, 103, 104, 199],
                /* Игры */[504, 401, 402, 403, 404],
                /* Фильмы */[201, 202, 203, 204, 205, 207, 208, 209, 299, 501, 502, 505, 506],
                /* Мультфтльмы */[],
                /* Книги */[601],
                /* ПО */[301, 302, 303],
                /* Анимэ */[],
                /* Док. и юмор */ [],
                /* Спорт */[]
            ];
            f = parseInt(f);
            for (var i = 0, len = groups_arr.length; i < len; i++) {
                if (groups_arr[i].indexOf(f) !== -1) {
                    return i;
                }
            }
            return -1;
        };
        var mackcalcSize = function (s) {
            var size = s;
            var t = size.replace('KiB', '');
            if (t != size) {
                t = parseFloat(t);
                return Math.round(t * 1024);
            }
            var t = size.replace('MiB', '');
            if (t != size) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024);
            }
            var t = size.replace('GiB', '');
            if (t != size) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024 * 1024);
            }
            var t = size.replace('TiB', '');
            if (t != size) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024 * 1024 * 1024);
            }
            var t = size.replace('B', '');
            if (t != size) {
                t = parseFloat(t);
                return Math.round(t);
            }
            return 0;
        };
        var calculateSize = function (s) {
            s = s.split(', ')[1];
            if (s === undefined)
                return 0;
            s = s.split(' ');
            s = s[1] + s[2];
            return mackcalcSize(s);
        };
        var getMonth = function(date) {
            var m = date.getMonth()+1;
            if (m < 10) {
                m = '0'+m;
            }
            return m;
        };
        var makecalcTime = function (t) {
            t = t.trim().replace(/\s+/g, ' ');
            var space_pos = t.lastIndexOf(' ');
            var time = t.substr(space_pos+1);
            var year = undefined;
            var c_date = new Date();
            if (time.indexOf(':') !== -1) {
                year = undefined;
            } else if ((/[0-9]{4}/).test(time)) {
                year = time;
                time = undefined;
            } else {
                year = c_date.getFullYear();
                time = undefined;
            }
            var month_date = t.substr(0, space_pos);
            var word = undefined;
            if ((/[^0-9-]/).test(month_date)) {
                word = month_date.toLowerCase();
                if ((/min|мин/).test(month_date)) {
                    word = 'today';
                }
                month_date = undefined;
            } else {
                word = undefined;
            }
            if (word !== undefined) {
                var o_word = word;
                word = ex_kit.today_replace(word).split(' ').slice(0, 2).reverse().join(' ');
                if (o_word === word) {
                    if ((/y-day/).test(word)) {
                        c_date = new Date( c_date.getTime() - 24*60*60*1000 );
                        word = word.replace('y-day', getMonth(c_date)+' '+c_date.getDate() );
                    }
                }
                if (o_word === word) {
                    console.info('undef date', o_word);
                    word = getMonth(c_date)+' '+c_date.getDate();
                }
            }
            var date = ((month_date)?month_date:word)+' '+( (year)?year:c_date.getFullYear() )+' '+( (time)?time:'' );
            return ex_kit.format_date(3, date);
        };
        var calculateTime = function (t) {
            t = t.split(', ')[0];
            if (t.split(' ')[1] === undefined)
                return 0;
            t = t.split(' ');
            t = t[1];
            return makecalcTime(t);
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('#searchResult').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 0; i < l; i++) {
                var td = t.eq(i).children('td');
                var td_len = td.length;
                if (td_len === 1) {
                    continue;
                }
                if (td_len === 4) {
                    arr.push({
                        category: {
                            title: td.eq(0).children().children('a').eq(1).text(),
                            url: root_url + td.eq(0).children().children('a').eq(1).attr('href'),
                            id: calculateCategory(String(td.eq(0).children().children('a').eq(1).attr('href')).replace(/(.*)\/([0-9]*)/i, "$2"))
                        },
                        title: td.eq(1).children('div.detName').children('a').text(),
                        url: root_url + td.eq(1).children('div.detName').children('a').attr('href'),
                        size: calculateSize(td.eq(1).children('font.detDesc').text()),
                        dl: td.eq(1).children('a').eq(0).attr('href'),
                        seeds: td.eq(2).text(),
                        leechs: td.eq(3).text(),
                        time: calculateTime(td.eq(1).children('font.detDesc').text())
                    });
                } else if (td_len === 7) {
                    arr.push({
                        category: {
                            title: td.eq(0).children('a').text(),
                            url: root_url + td.eq(0).children('a').attr('href'),
                            id: calculateCategory(String(td.eq(0).children('a').attr('href')).replace(/(.*)\/([0-9]*)/i, "$2"))
                        },
                        title: td.eq(1).children('a').text(),
                        url: root_url + td.eq(1).children('a').attr('href'),
                        size: mackcalcSize(td.eq(4).text()),
                        dl: td.eq(3).children().children('a').eq(0).attr('href'),
                        seeds: td.eq(5).text(),
                        leechs: td.eq(6).text(),
                        time: makecalcTime(td.eq(2).text())
                    });
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
                type: 'GET',
                url: url + encodeURIComponent(text) + '/0/99/0',
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
        tests: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
}();