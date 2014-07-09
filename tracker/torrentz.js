torrent_lib.torrentz = function () {
    var name = 'Torrentz';
    var filename = 'torrentz';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZZjMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8IAAA/DcAAPw7AAD8PQAA/CAAAPw/AAD8PwAA/D8AAPw/AAD8PwAA/D8AAPw/AAB8PgAAAAAAAAAAAACAAQAA';
    var url = 'http://torrentz.eu/search';
    var root_url = 'http://torrentz.eu';
    var about = 'Torrent Search Engine';
    var flags = {
        a: 0,
        l: 0,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            return ((/xxx|porn/i).test(f)) ? 10 :
                    ((/anime/i).test(f)) ? 7 :
                        ((/audio|music/i).test(f)) ? 1 :
                                ((/game/i).test(f)) ? 2 :
                                    ((/video|movies|film/i).test(f)) ? 3 :
                                                ((/comics|books/i).test(f)) ? 5 :
                                                        ((/applications|apps/i).test(f)) ? 6 :
                                                                ((/tv/i).test(f)) ? 0 :
                                                                    -1;
        };
        var calculateTime = function (t) {
            if ((/today/).test(t)) {
                return Math.round((new Date().getTime() / 1000) / (60 * 60 * 24)) * (60 * 60 * 24);
            } else if ((/yesterday/).test(t)) {
                return (Math.round((new Date().getTime() / 1000) / (60 * 60 * 24)) * (60 * 60 * 24)) - (60 * 60 * 24);
            } else {
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
            t = t.find('dl').parent('div.results').children('dl');
            var l = t.length;
            var arr = new  Array(l - 1);
            for (var i = 0; i < l - 1; i++) {
                var dl = t.eq(i);
                var title = dl.children('dt').children('a').text();
                var url = dl.children('dt').children('a').attr('href');
                dl.children('dt').children('a').remove();
                var cat = $.trim($.trim(dl.children('dt').text()).substr(1));
                arr[i] = {
                    category: {
                        title: cat,
                        id: calculateCategory(cat)
                    },
                    title: title,
                    url: root_url + url,
                    size: ex_kit.format_size(dl.children('dd').children('span.s').text()),
                    seeds: dl.children('dd').children('span.u').text().replace(',', ''),
                    leechs: dl.children('dd').children('span.d').text().replace(',', ''),
                    time: calculateTime($.trim(dl.children('dd').children('span.a').text()))
                }
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr !== undefined)
                xhr.abort();
            xhr = engine.ajax({
                type: 'GET',
                url: url,
                cache: false,
                data: {
                    f: text
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
        tests: [0, 0, 1, 0, 0, 1, 0, 0, 0]
    }
}();