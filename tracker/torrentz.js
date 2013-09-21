(function () {
    num = torrent_lib.length;
    torrent_lib[num] = null;
    torrent_lib[num] = function() {
        var name = 'Torrentz';
        var filename = 'torrentz';
        var id = null;
        var icon = 'data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZZjMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8IAAA/DcAAPw7AAD8PQAA/CAAAPw/AAD8PwAA/D8AAPw/AAD8PwAA/D8AAPw/AAB8PgAAAAAAAAAAAACAAQAA';
        var url = 'http://torrentz.eu/search';
        var root_url = 'http://torrentz.eu';
        var about = 'Torrent Search Engine';
        var flags = {
            a: 0,
            l: 0,
            rs: 1
        }
        var xhr = null;
        var web = function() {
            var calculateCategory = function(f) {
                return ((/xxx/i).test(f)) ? 10 :
                        ((/porn/i).test(f)) ? 10 :
                        ((/anime/i).test(f)) ? 7 :
                        ((/audio/i).test(f)) ? 1 :
                        ((/music/i).test(f)) ? 1 :
                        ((/game/i).test(f)) ? 2 :
                        ((/video/i).test(f)) ? 3 :
                        ((/movies/i).test(f)) ? 3 :
                        ((/film/i).test(f)) ? 3 :
                        ((/comics/i).test(f)) ? 5 :
                        ((/books/i).test(f)) ? 5 :
                        ((/applications/i).test(f)) ? 6 :
                        ((/apps/i).test(f)) ? 6 :
                        ((/tv/i).test(f)) ? 0 :
                        -1;
            }
            var calculateTime = function(t) {
                if ((/today/).test(t)) {
                    return Math.round((new Date().getTime() / 1000) / (60 * 60 * 24)) * (60 * 60 * 24);
                } else
                if ((/yesterday/).test(t)) {
                    return (Math.round((new Date().getTime() / 1000) / (60 * 60 * 24)) * (60 * 60 * 24)) - (60 * 60 * 24);
                } else
                {
                    var time = parseInt(t.replace(/([0-9]*).*/, '$1'));
                    var nowTime = Math.round(new Date().getTime() / 1000);
                    if ((/second/).test(t)) {
                        return nowTime - time;
                    } else
                    if ((/minute/).test(t)) {
                        return nowTime - time * 60;
                    } else
                    if ((/hour/).test(t)) {
                        return nowTime - time * 60 * 60;
                    } else
                    if ((/day/).test(t)) {
                        return nowTime - time * 60 * 60 * 24;
                    } else
                    if ((/week/).test(t)) {
                        return nowTime - time * 60 * 60 * 24 * 7;
                    } else
                    if ((/month/).test(t)) {
                        return nowTime - time * 60 * 60 * 24 * 30;
                    } else
                    if ((/year/).test(t)) {
                        return nowTime - time * 60 * 60 * 24 * 365;
                    }
                }
                return 0;
            }
            var readCode = function(c) {
                c = view.contentFilter(c);
                var t = view.load_in_sandbox(id, c);
                t = t.find('dl').parent('div.results').children('dl');
                var l = t.length;
                var arr = [];
                var i = 0;
                for (i = 0; i < l - 1; i++) {
                    var dl = t.eq(i);
                    var title = dl.children('dt').children('a').text();
                    var url = dl.children('dt').children('a').attr('href');
                    dl.children('dt').children('a').remove();
                    var cat = $.trim($.trim(dl.children('dt').text()).substr(1));
                    arr[arr.length] = {
                        'category': {
                            'title': cat,
                            'id': calculateCategory(cat)
                        },
                        'title': title,
                        'url': root_url + url,
                        'size': ex_kit.format_size(dl.children('dd').children('span.s').text()),
                        'seeds': dl.children('dd').children('span.u').text().replace(',', ''),
                        'leechs': dl.children('dd').children('span.d').text().replace(',', ''),
                        'time': calculateTime($.trim(dl.children('dd').children('span.a').text()))
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
                        'f': text
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
            tests: [0,0,1,0,0,1,0,0,0]
        }
    }();
    if (compression === 0) {
        engine.ModuleLoaded(num);
    }
})();