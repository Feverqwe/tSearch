torrent_lib.inmac = function () {
    var name = 'InMac';
    var filename = 'inmac';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABMLAAATCwAAAAAAAAAAAAD///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BvIYqT8WNJ2vFjShrxY0oa8WMKGvAiSlldEYuA////wH///8B////Af///wH///8B////Af///wH///8BpnAoI72AKcW4fynFvYQqf7qCKoG5gSqdxIUq2f///wH///8B////Af///wH///8B////Af///wH///8BsXUlgahuJJ+lcCdDtnUi27BzI4GqbyJttnUi26VuJVWfgCAD////Af///wH///8B////Af///wG4cSoDpnIpK7l6JbH///8Bn18gA6NyKxmtcSOVtHYj16hzKGmucyNtoXQqEf///wH///8B////Af///wH///8Bv4AgA6x0KEXBgCit////Aa12J1+9fiijunsm27l6JN/AfyeptXYlpbl7J5mqgCoD////Af///wH///8B////AbiORwOmdCspv4Ao7aZ2LDXCgSjpsHcoV6VzLCFKVT8DxXM5A6JxLR+7fSjlfWY1Bf///wH///8B////Af///wH///8BgmM2CcWFLfGqdi1RxYUt64toLgeqgCoD////Af///wH///8Bxocuy655LjvUjkcD////Af///wH///8B////AdSAKgPNjS7RsHotWcOGK/mmdi0fqoAqA////wGqgCoDwIIiA72DLIG+hC2PqoArA////wH///8B////Af///wGKZy4LzpAr5beBK0vQkSzftX4rQ55gIgPUgCoDlmsuFbmCK1PDiCq3z5Aq+7R/LFX///8Bo3UuF7yGKl2+hyllzJApx8qPKduhdCwN0pUrvcCIKZXBiSmB1JYqx82RKfXTlSvLvoYphcCGKWW2gCtP////AYBmMwO7hSln05cqpcKKKIGpeCsV3Z4+A9GWKMnVmSf3z5Qpr7uFKWGldSwd////Af///wH///8B////Af///wH///8B////AbiORwP///8B////Af///wHPlirNuIQqO8CCPgP///8BqoAqA////wH///8B////Af///wH///8B////Af///wH///8B////Af///wGqgCsDoXQtEf///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wH///8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA%3D%3D';
    var login_url = 'https://inmac.org/login.php';
    var url = 'https://inmac.org/tracker.php';
    var root_url = 'https://inmac.org/';
    var about = 'Русскоязычный MAC - трекер, макинтош, хакинтош, программы, игры, видео, музыка, форум, вопросы, решения, общение..';
    var flags = {
        a: 1,
        l: 1,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[],
                /* Музыка */[331, 332, 333, 334, 335, 336, 337, 273],
                /* Игры */[376, 17, 426, 414, 264, 369, 370, 371, 372, 373, 374, 348, 381],
                /* Фильмы */[378, 457, 453, 454, 455],
                /* Мультфтльмы */[],
                /* Книги */[7, 105, 389],
                /* ПО */[452, 13, 438, 254, 14, 439, 256, 42, 351, 350, 255, 15, 211, 39, 46, 208, 70, 16, 380, 382, 383, 384, 385, 386, 388, 393, 368, 367, 199, 366, 11, 30],
                /* Анимэ */[],
                /* Док. и юмор */[],
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
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            if (t.find('input[name="login_username"]').length) {
                view.auth(0, filename);
                return [];
            } else
                view.auth(1, filename);
            t = t.find('#search-results').children('#tor-tbl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 0; i < l; i++) {
                var td = t.eq(i).children('td');
                if (td.eq(5).children('a').attr('href') === undefined) {
                    continue;
                }
                arr.push({
                    category: {
                        title: td.eq(2).children('a').text(),
                        url: root_url + td.eq(2).children('a').attr('href'),
                        id: calculateCategory(td.eq(2).children('a').attr('href').replace(/.*f=([0-9]*)$/i, "$1"))
                    },
                    title: td.eq(3).children('div').children('a').text(),
                    url: root_url + td.eq(3).children('div').children('a').attr('href'),
                    size: td.eq(5).children('u').text(),
                    dl: root_url + td.eq(5).children('a').attr('href'),
                    seeds: td.eq(6).children('b').text(),
                    leechs: td.eq(7).children('b').text(),
                    time: td.eq(9).children('u').text()
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
                    max: 1,
                    to: 0,
                    dm: 1,
                    x: 0,
                    y: 0,
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
        login_url: login_url,
        name: name,
        icon: icon,
        about: about,
        url: root_url,
        filename: filename,
        flags: flags,
        tests: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
}();