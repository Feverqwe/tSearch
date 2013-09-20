(function () {
    num = torrent_lib.length;
    torrent_lib[num] = null;
    torrent_lib[num] = function() {
        var name = 'ThePirateBay UK';
        var filename = 'thepiratebay2';
        var id = null;
        var icon = 'data:image/png;base64,Qk04AwAAAAAAADYAAAAoAAAAEAAAABAAAAABABgAAAAAAAAAAADgTAAA4EwAAAAAAAAAAAAA/////////////////////////////////////////////////////v7+/////////////Pz8vb297Ozs////////////////////////////////4uLiSUlJ3d3d////////8/PzEhIScnJy8fHx////////////////////8fHxwsLCWFhYAAAAyMjI////////5+fnEBAQICAgQkJCV1dXZWVli4uLiYmJUlJSKioqPT09bm5uHh4eYWFhwcHBubm5bGxsQEBAp6end3d3FBQUAAAAFBQUOTk5ISEhGRkZPT09WVlZQkJCKioqJycnenp6AAAAQUFBPz8/YGBgjo6O0dHR+/v7////////7+/vxcXFnZ2dg4ODExMTQEBAv7+/AAAAgoKCjo6OpaWltra2qqqqpqampaWlpKSkra2tr6+vsbGx5eXll5eXW1tb1NTUcXFxmJiYAwMDAAAANzc3VFRUGxsbAAAAX19fPDw8ERERAAAAQUFB/v7+/Pz8////////nJycAAAAAAAAAAAAHx8fCwsLAAAAJiYmBQUFAAAAAAAAKysr+vr6////////////nJycAAAAAAAADw8PAAAAAAAAAAAAAAAADQ0NAwMDAAAANjY2+vr6////////////rq6uAAAANjY25eXlWVlZHx8fJycnIyMj0dHRhoaGAAAAV1dX////////////////r6+vAAAALS0t0tLSX19fsrKy2dnZZWVlsrKyiIiIAAAAWVlZ////////////////r6+vAAAAAAAABQUFAgICExMTEBAQAwMDAwMDAQEBAAAAWlpa////////////////q6urAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVFRU////////////////19fXSUlJQUFBQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQkJCQkJCqKio/////////////////////////v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////AAA%3D';
        var url = 'http://tpb.pirateparty.org.uk/search/';
        var root_url = 'http://tpb.pirateparty.org.uk';
        var about = 'Download music, movies, games, software and much more. The Pirate Bay is the world\'s largest bittorrent tracker.';
        var flags = {
            a: 0,
            l: 0,
            rs: 0
        }
        var xhr = null;
        var web = function() {
            var calculateCategory = function(f) {
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
                for (var i = 0; i < groups_arr.length; i++)
                    if (jQuery.inArray(parseInt(f), groups_arr[i]) > -1) {
                        return i;
                    }
                return -1;
            }
            var mackcalcSize = function(s) {
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
            }
            var calculateSize = function(s) {
                s = s.split(', ')[1];
                if (s == undefined)
                    return 0;
                s = s.split(' ');
                s = s[1] + s[2];
                return mackcalcSize(s);
            }
            var makecalcTime = function(t) {
                t = t.replace(/\s+/g, ' ');
                if (t.split('.').length == 2 || (/mins? ago/).test(t)) {
                    //мин назад
                    var min_out = parseInt(t.replace(/([0-9]*).*/, '$1')) * 60;
                    return Math.round((new Date()).getTime() / 1000) - min_out;
                } else {
                    var t_time = t.replace(/.*?([0-9]*):([0-9]*)$/, '$1:$2');
                    var t_date = t.replace(' ' + t_time, '');
                    var now_date = new Date();
                    var year = now_date.getFullYear();
                    if (t_date.split('-').length == 1) {
                        //Вчера 20:38
                        //Сегодня 12:32
                        var date_td = now_date.getDate();
                        var month_td = now_date.getMonth();
                        var yt_date = new Date((Math.round(now_date.getTime() / 1000) - 24 * 60 * 60) * 1000);
                        var date_yt = yt_date.getDate();
                        var month_yt = yt_date.getMonth();
                        t_date = t_date.replace('Вчера', month_yt + ' ' + date_yt).replace('Сегодня', month_td + ' ' + date_td).replace(t_date, month_td + ' ' + date_td);
                    } else {
                        var month = t_date.split('-');
                        var date = month[1];
                        var month = month[0];
                        var month_m = parseInt(month) - 1;
                        var date_m = parseInt(date);
                        t_date = t_date.replace(month + '-' + date, month_m + ' ' + date_m);
                    }
                    var t_date = t_date.split(' ');
                    var time_h = t_time.split(':');
                    if (time_h.length == 1) {
                        year = String(time_h).replace(/-/, ' ').split(' ');
                        var time_m = 0;
                        var time_h = 0;
                        t_date[0] = parseInt(year[0]) - 1;
                        t_date[1] = parseInt(year[1]);
                        year = year[2];
                    } else {
                        var time_m = parseInt(time_h[1]);
                        var time_h = parseInt(time_h[0]);
                    }
                    return Math.round((new Date(year, t_date[0], parseInt(t_date[1]), parseInt(time_h), parseInt(time_m))).getTime() / 1000);
                }
            }
            var calculateTime = function(t) {
                t = t.split(', ')[0];
                if (t.split(' ')[1] == undefined)
                    return 0;
                t = t.split(' ');
                t = t[1];
                return makecalcTime(t);
            }
            var readCode = function(c) {
                c = view.contentFilter(c);
                var t = view.load_in_sandbox(id, c);
                t = t.find('#searchResult').children('tbody').children('tr');
                var l = t.length;
                var arr = [];
                var i = 0;
                for (i = 0; i < l; i++) {
                    var td = t.eq(i).children('td');
                    if (td.length == 1)
                        continue;
                    if (td.length == 4) {
                        arr[arr.length] = {
                            'category': {
                                'title': td.eq(0).children().children('a').eq(1).text(),
                                'url': root_url + td.eq(0).children().children('a').eq(1).attr('href'),
                                'id': calculateCategory(String(td.eq(0).children().children('a').eq(1).attr('href')).replace(/(.*)\/([0-9]*)/i, "$2"))
                            },
                            'title': td.eq(1).children('div.detName').children('a').text(),
                            'url': root_url + td.eq(1).children('div.detName').children('a').attr('href'),
                            'size': calculateSize(td.eq(1).children('font.detDesc').text()),
                            'dl': td.eq(1).children('a').eq(0).attr('href'),
                            'seeds': td.eq(2).text(),
                            'leechs': td.eq(3).text(),
                            'time': calculateTime(td.eq(1).children('font.detDesc').text())
                        }
                    } else if (td.length == 7) {
                        arr[arr.length] = {
                            'category': {
                                'title': td.eq(0).children('a').text(),
                                'url': root_url + td.eq(0).children('a').attr('href'),
                                'id': calculateCategory(String(td.eq(0).children('a').attr('href')).replace(/(.*)\/([0-9]*)/i, "$2"))
                            },
                            'title': td.eq(1).children('a').text(),
                            'url': root_url + td.eq(1).children('a').attr('href'),
                            'size': mackcalcSize(td.eq(4).text()),
                            'dl': td.eq(3).children().children('a').eq(0).attr('href'),
                            'seeds': td.eq(5).text(),
                            'leechs': td.eq(6).text(),
                            'time': makecalcTime(td.eq(2).text())
                        }
                    }
                }
                return arr;
            }
            var loadPage = function(text) {
                var t = text;
                if (xhr != null)
                    xhr.abort();
                xhr = $.ajax({
                    type: 'GET',
                    url: url + text + '/0/99/0',
                    cache: false,
                    success: function(data) {
                        view.result(id, readCode(data), t);
                    },
                    error: function(xhr, ajaxOptions, thrownError) {
                        view.loadingStatus(2, id);
                    }
                });
            }
            return {
                getPage: function(a) {
                    return loadPage(a);
                }
            }
        }();
        var find = function(text) {
            return web.getPage(text);
        }
        return {
            find: function(a) {
                return find(a);
            },
            setId: function(a) {
                id = a;
            },
            id: id,
            name: name,
            icon: icon,
            about: about,
            url: root_url,
            filename: filename,
            flags: flags,
            tests: [0,0,0,0,0,0,0,0,0]
        }
    }();
    if (compression === 0) {
        engine.ModuleLoaded(num);
    }
})();