//DISABLED!!!
//DISABLED!!!
//DISABLED!!!
//DISABLED!!!
//DISABLED!!!
//DISABLED!!!
(function () {
    num = torrent_lib.length;
    torrent_lib[num] = null;
    torrent_lib[num] = function() {
        var name = 'mmatracker';
        var filename = 'mmatracker';
        var id = null;
        var icon = 'data:image/vnd.microsoft.icon;base64,AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAODg4APr59wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAREBERISEREBEQEREiIREQERARESEhERAREBERIiEREBEQEREREREQESAhESEhESAhICEhISEhIBIgIhIhIhIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAAAAAAAMzMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzMwAAAAAAAD//wAA';
        var url = 'http://mmatracker.ru/browse.php';
        var root_url = 'http://mmatracker.ru/';
        var about = 'MMAtracker - открытый общедоступный спортивный трекер. Качай и смотри бои без правил.';
        var flags = {
            a: 1,
            l: 1,
            rs: 1
        }
        var xhr = null;
        var web = function() {
            var calculateCategory = function(f) {
                var groups_arr = [
                    /* Сериалы */[],
                    /* Музыка */[],
                    /* Игры */[],
                    /* Фильмы */[],
                    /* Мультфтльмы */[],
                    /* Книги */[],
                    /* ПО */[],
                    /* Анимэ */[],
                    /* Док. и юмор */[19],
                    /* Спорт */[18, 21, 24, 20, 23]
                ];
                for (var i = 0; i < groups_arr.length; i++)
                    if (jQuery.inArray(parseInt(f), groups_arr[i]) > -1) {
                        return i;
                    }
                return -1;
            }
            var calculateTime = function(time) {
                time = $.trim(time).split(" ");
                var date = time[0].split('-');
                time = time[1].split(':');
                return Math.round((new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2]), parseInt(time[0]), parseInt(time[1]))).getTime() / 1000);
            }
            var readCode = function(c) {
                c = view.contentFilter(c);
                var t = view.load_in_sandbox(id, c);
                t = t.find('table.embedded').children('tbody');
                var l = t.length;
                var arr = [];
                var i = 0;
                for (i = 1; i < l - 2; i++) {
                    var tr = t.eq(i).children('tr');
                    var dl_link = tr.eq(1).children('td').eq(1).children('a').eq(2).attr('href');
                    if (dl_link == undefined) {
                        dl_link = null;
                    } else {
                        dl_link = root_url + dl_link
                    }
                    arr[arr.length] = {
                        'category': {
                            'title': tr.eq(1).children('td').eq(0).children('a').children('img').attr('alt'),
                            'url': root_url + tr.eq(1).children('td').eq(0).children('a').attr('href'),
                            'id': calculateCategory(tr.eq(1).children('td').eq(0).children('a').attr('href').replace(/.*cat=([0-9]*)$/i, "$1"))
                        },
                        'title': tr.eq(1).children('td').eq(1).children('a').eq(0).text(),
                        'url': root_url + tr.eq(1).children('td').eq(1).children('a').eq(0).attr('href'),
                        'dl': dl_link,
                        'size': ex_kit.format_size(tr.eq(2).children('td').eq(3).text()),
                        'seeds': $.trim(tr.eq(2).children('td').eq(4).text().split('|')[0]),
                        'leechs': $.trim(tr.eq(2).children('td').eq(4).text().split('|')[1]),
                        'time': calculateTime($.trim(tr.eq(2).children('td').eq(0).text()))
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