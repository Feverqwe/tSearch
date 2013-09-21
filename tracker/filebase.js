(function () {
    num = torrent_lib.length;
    torrent_lib[num] = null;
    torrent_lib[num] = function() {
        var name = 'FileBase';
        var filename = 'filebase';
        var id = null;
        var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEACABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAQAUAAAAAAAAAAAAAAAEAAAABAABZW1sAWllbAFtcWgBbWlwAXlxbAFtbWwBdWlwAXVtbAFpcXAD///4A3+HhAP7+/gD///8A4+DiAP3//gDi4OAA/f//AODf4QAAMP4AAy7/AAAr4ADe4d8A///8ANzg4QD//v8A3uDgAFlbXAAAMP8AAC7/AAEp4AD7//8A4uDfAFhbWQABMP4AAiveAAAy/gADL/4A//79AOHf3wD6//4A4eHhAAAx/QAAMf8A4OHfAPz+/wDe4OEA4+HhAFpaWgAAKOIAAjD/APz//QAEL/8AASrdAAIv/wDf398AXFxcAAEp3wAAL/8A3t/jAOLf4QAALN4AAjH/AAAq3wAALv4A4ODgAFlcWgAAKuEA//3/AAEx/wDd398AXVleAFhdXAD9/v8AAirgAAAp4ABdW1oA3d7iAFxbXQBYWloAXF1bAFxYXQBbXFgAV1tcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAgMEBQUFAwAGBwgABgIJCQoLDA0MDg8JCQ8MEAUHERITFBAQFQkWFxgMGQwHGhgUGxwdCRgRGB4fGAwPIAcQISIjJBEMDBUlDCYnGAgHKBIpHSoYKxAsLQwJLhgvAhgwMRIdMjM0NQw2DAstNxoJKjgcKhU5GzgSDDoMFgAFOxIqHTkMPD0bPhIMFQwDAwkUPyMdDAwZCRBADAwPQQUWG0IpMR05OSI9OUBDDgIGDRIqPikjHRshPjlERRhGR0hJHCpCPyo+IT1CEjFAAgUJOUkSGxQSMUoSOUIqDktBDwlIDRYJOwwWTBAlQAwaTUEFRwYFAwUFTk9QUVIHBQAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8=';
        var url = 'http://www.filebase.ws/torrents/search/';
        var root_url = 'http://www.filebase.ws';
        var about = 'Filebase.ws - скачать фильмы, игры, музыку, программы, бесплатно!';
        var flags = {
            a: 1,
            l: 1,
            rs: 1
        }
        var xhr = null;
        var web = function() {
            var calculateCategory = function(f) {
                var groups_arr = [
                    /* Сериалы */['serials'],
                    /* Музыка */['videoclips', 'eng-music', 'rus-music'],
                    /* Игры */['games'],
                    /* Фильмы */['dvd5', 'tv', 'action', 'comedy', 'thriller', 'classic', 'history', 'mystic', 'sci-fi', 'horror', 'drama', 'adventure', 'detective', 'concert', 'epic', 'dvd9', 'fantasy', 'hdtv', 'war', 'family', 'tales', 'catastroph'],
                    /* Мультфтльмы */['cartoons'],
                    /* Книги */['books'],
                    /* ПО */['software'],
                    /* Анимэ */['anime'],
                    /* Док. и юмор */['documental'],
                    /* Спорт */['sport']
                ];
                for (var i = 0; i < groups_arr.length; i++)
                    if (jQuery.inArray(f, groups_arr[i]) > -1) {
                        return i;
                    }
                return -1;
            }
            var calculateTime = function(f) {
                var dd = f.split('/');
                return Math.round(new Date(parseInt('20' + dd[2]), parseInt(dd[1]) - 1, parseInt(dd[0])).getTime() / 1000);
            }
            var readCode = function(c) {
                c = view.contentFilter(c);
                var t = view.load_in_sandbox(id, c);
                t = t.find('td.lista2').parent('tr').parent('tbody').children('tr');
                var l = t.length;
                var arr = [];
                var i = 0;
                for (i = 1; i < l; i++) {
                    var td = t.eq(i).children('td');
                    if (td.length < 2)
                        continue;
                    arr[arr.length] = {
                        'category': {
                            'title': td.eq(0).children('a').children('img').attr('alt'),
                            'url': root_url + td.eq(0).children('a').attr('href'),
                            'id': calculateCategory(td.eq(0).children('a').attr('href').replace(/.*\/torrents\/(.*)\/$/i, "$1"))
                        },
                        'title': td.eq(1).children('a').text(),
                        'url': root_url + td.eq(1).children('a').attr('href'),
                        'size': ex_kit.format_size(td.eq(4).text()),
                        'seeds': td.eq(6).text(),
                        'leechs': td.eq(7).text(),
                        'time': calculateTime(td.eq(3).text())
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
                    url: url,
                    cache: false,
                    data: {
                        'search': text,
                        'c': 0,
                        't': 'liveonly'
                    },
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