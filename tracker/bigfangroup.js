(function () {
    num = torrent_lib.length;
    torrent_lib[num] = null;
    torrent_lib[num] = function() {
        var name = 'BigFanGroup';
        var filename = 'bigfangroup';
        var id = null;
        var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEKGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS4xLjIiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxMy0wNC0wNFQxNDowNDo5MDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+UGl4ZWxtYXRvciAyLjEuMTwveG1wOkNyZWF0b3JUb29sPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6Q29tcHJlc3Npb24+NTwvdGlmZjpDb21wcmVzc2lvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MTwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzI8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xNjwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjE2PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CvJlu/AAAANqSURBVDgRbZNtbFNlFMf/97Z3652jtWvHHSvtWLd1L0HDmARCN2FApeBswI1MJZAsRo3Eb2qmfBnGTybGRT9IDAYNBgSyZBKYZJZlwRlQM7Tb6kLJXnR920u79eXe3d3b2/vYSpagcj6cc/L8n995zvPkPBQhBI+1SXeJpMVpjYYRtQn2YzRdTT5uH/XvApQG8c7tINmO0LzUPjCkVjEMhbZWKrCxBH0QNX2o/G4Mj0AUWTpTDna2HpTiXExsco1PrDxzfVDWXR1UMC/lumMycGwk8OxmsKdJK+xoLBzlDOEhKPKPQqzqPkWUCzHvUMDk9QYwGRAwMFyM1uZZOJ0J9HltuC9wgCBjW8kCXM4lzAU3gzObcexoAWluMARApLPk5a63yXbn0+RafzG59G0ZicUY4vu9iEw90JHy2udJ9/u1JJXUkOBcAVmcB9mzr5Gceus4IdFXEzTS/j+tFhH+qA3nL9fBtX8ZFy5WYNvOI9AVqXjjlSlIYgHu/aZH3W4Puj98CpNRDhaLAiiijxYTwZ+tpSnILINrd2sxPl4MU8ka2l+cAlEJrg9ZoWoo8GkaQpbBV8P1WFI2oIKTASLfoVUpNeDYnAClasAUCzAasnA/F0fvRz4srxRibNwER00KzS08fu3vh6dxOneyBpXcGrKiNEILCfZujW1NKDcQZEQWaYHCje/NaHr2IMwmGZ2eaYTnWMzMFOLTz+sxE9HDXqbCxinLkb/Wxuiz3p2znBE/Hd1FUKOPIZnM4kq/FUsrRsRjDJy74uB5CqFQAS7e3gp/yISTbhWcifJaXT9EtD09PWp0ZGvviYO0q6w0SO9tTSMcDcO9LwJH7SqOv1YNz+Eg9PoMoJVgyV2xq10nYzXem59MOu82tfgH7aWL56vLq3Hi5A5U2VM40jaP02ccmFgwYyGuxfBtI4p4Huc+sMBWpn7BNIz+kme1eZc33y3fO+4X2C2x5YoDh1+yQzHkXnkDA2aLjC8Ha8AkFVz6zI5DLfxNPJh6D6aH3D8d5NMD3SQZ/gOdrx9LXLn1TQrOhpwkqshEstjfwOLOjTZ0dFRchkQ60TS6+hAH/vOZcgsUKHna1ZXOUO/eHGHqtLkZaDtUOfHEk/WfQHfq63VwPf6vwLqwcs9lYI14k6hZiQ/5z5XuXeTXtUfj35VGeoV6xszZAAAAAElFTkSuQmCC';
        var url = 'http://www.bigfangroup.org/browse.php';
        var root_url = 'http://www.bigfangroup.org/';
        var about = 'Bigfangroup.org - только у нас можно скачать самые новые серии Интернов, новые выпуски Comedy Club. Новые серии сериала Деффчёнки, новые фильмы, сериалы, музыку и игры для компьютера бесплатно, без смс, на большой скорости.';
        /*
         * a = требует авторизации
         * l = русскоязычный или нет
         * rs= поддержка русского языка
         */
        var flags = {
            a: 1,
            l: 1,
            rs: 1
        }
        var xhr = null;
        var web = function() {
            var calculateCategory = function(f) {
                var groups_arr = [
                    /* Сериалы */[11],
                    /* Музыка */[44, 46, 43],
                    /* Игры */[5],
                    /* Фильмы */[13, 48, 45, 33, 39, 15, 21, 28, 18, 24, 36, 19, 31, 12, 29, 27, 47, 22],
                    /* Мультфтльмы */[],
                    /* Книги */[35, 38],
                    /* ПО */[1],
                    /* Анимэ */[],
                    /* Док. и юмор */[32, 49, 25, 26, 23, 30, 14],
                    /* Спорт */[37],
                    /* xxx */[42]
                ];
                for (var i = 0; i < groups_arr.length; i++)
                    if (jQuery.inArray(parseInt(f), groups_arr[i]) > -1) {
                        return i;
                    }
                return -1;
            }
            var readCode = function(c) {
                c = view.contentFilter(c);
                var t = view.load_in_sandbox(id, c);
                t = t.find('#releases-table').children('table.embedded').children('tbody#highlighted').children('tr');
                var l = t.length;
                var arr = [];
                var i = 0;
                for (i = 0; i < l; i++) {
                    var td = t.eq(i).children('td');
                    arr[arr.length] = {
                        'category': {
                            'title': td.eq(0).find('img').attr('alt'),
                            'url': root_url + td.eq(0).children('a').attr('href'),
                            'id': calculateCategory(td.eq(0).children('a').attr('href').replace(/.*cat=([0-9]*).*$/i, "$1"))
                        },
                        'title': td.eq(1).children('a').text(),
                        'url': root_url + td.eq(1).children('a').attr('href'),
                        'size': ex_kit.format_size(td.eq(5).text()),
                        'seeds': td.eq(6).text(),
                        'leechs': td.eq(7).text(),
                        'time': 0
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
                    url: url + '?search=' + ex_kit.in_cp1251(text),
                    cache: false,
                    success: function(data) {
                        view.result(id, readCode(data), t);
                    },
                    error: function() {
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
            tests: [0,0,0,0,0,1,0,0,0]
        }
    }();
    if (compression === 0) {
        engine.ModuleLoaded(num);
    }
})();