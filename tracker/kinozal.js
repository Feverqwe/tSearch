torrent_lib.kinozal = function () {
    var name = 'Кинозал';
    var filename = 'kinozal';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/wAAAAAAAAAAgEc7/4BHO//8+/n/gEc7/4BHO/+ARzv/9/Tt//Xy6v/08Ob/gEc7/4BHO/+ARzv/7efX/4BHO/+ARzv/AAAAAIBHO//8+/n/+/r3//r49P/59vH/9/Tu//by6v/08Of/8u7j//Hs3//v6dv/7efY/+vk1P/q4tD/gEc7/wAAAAAAAAAAgEc7//r49P/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/q4tD/gEc7/wAAAAAAAAAAAAAAAIBHO//59/H/AACA/wAAgP8AAID/AACA/87v/f8AAID/AACA/wAAgP8AAID/6ODM/4BHO/8AAAAAAAAAAAAAAACARzv/9/Xu/87v/f8AAID/AACA/87v/f/O7/3/zu/9/wAAgP8AAID/zu/9/+beyf+ARzv/AAAAAAAAAACARzv/+PXv//bz6//O7/3/AACA/wAAgP/O7/3/zu/9/wAAgP8AAID/zu/9/87v/f/l3MX/49nB/4BHO/8AAAAAgEc7//bz6//18ej/zu/9/wAAgP8AAID/AACA/wAAgP/O7/3/zu/9/87v/f/O7/3/49nC/+HXvv+ARzv/AAAAAIBHO//18ej/8+/l/87v/f8AAID/AACA/wAAgP8AAID/zu/9/87v/f/O7/3/zu/9/+LXvv/g1bv/gEc7/wAAAACARzv/gEc7//Ht4f/O7/3/AACA/wAAgP/O7/3/zu/9/wAAgP/O7/3/zu/9/87v/f/g1bv/gEc7/4BHO/8AAAAAAAAAAIBHO//w6t7/zu/9/wAAgP8AAID/zu/9/87v/f/O7/3/AACA/87v/f/O7/3/39O4/4BHO/8AAAAAAAAAAAAAAACARzv/7uja/wAAgP8AAID/AACA/wAAgP/O7/3/zu/9/wAAgP8AAID/AACA/93Stf+ARzv/AAAAAAAAAAAAAAAAgEc7//r49P/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/q4tD/gEc7/wAAAAAAAAAAgEc7//z7+f/7+vf/+vj0//n28f/39O7/9vLq//Tw5//y7uP/8ezf/+/p2//t59j/6+TU/+ri0P+ARzv/AAAAAIBHO/+ARzv//Pv5/4BHO/+ARzv/gEc7//f07f/18ur/9PDm/4BHO/+ARzv/gEc7/+3n1/+ARzv/gEc7/wAAAAAAAAAAgEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/wAAAAAAAAAAnHMAAAABAAAAAQAAgAMAAIADAACAAwAAAAEAAAABAAAAAQAAAAEAAIADAACAAwAAgAMAAAABAAAAAQAAnHMAAA%3D%3D';
    var url = 'http://kinozal.tv/browse.php';
    var root_url = 'http://kinozal.tv';
    var about = 'Торрент трекер Кинозал.ТВ - фильмы, новинки кино, скачать фильмы, афиша кино';
    var flags = {
        a: 1,
        l: 1,
        rs: 1
    };
    var xhr = null;
    var web = function () {
        var calculateSize = function (s) {
            var size = s.replace(' ', '');
            var t = size.replace('КБ', '');
            if (t.length !== size.length) {
                t = parseFloat(t);
                return Math.round(t * 1024);
            }
            var t = size.replace('МБ', '');
            if (t.length !== size.length) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024);
            }
            var t = size.replace('ГБ', '');
            if (t.length !== size.length) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024 * 1024);
            }
            var t = size.replace('ТБ', '');
            if (t.length !== size.length) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024 * 1024 * 1024);
            }
            return 0;
        };
        var calculateCategory = function (n) {
            var n = n.replace(/.*c=([0-9]*)$/i, "$1");
            var groups_arr = [
                /* Сериалы */[45, 46], //serials
                /* Музыка */[3, 4, 42], //music
                /* Игры */[23], //games
                /* Фильмы */[8, 6, 15, 17, 35, 39, 13, 14, 24, 11, 10, 9, 47, 12, 7, 48, 49, 50, 38, 16], //films
                /* Мультфтльмы */[21, 22], //cartoon
                /* Книги */[2, 41], //books
                /* ПО */[32, 40], //prog
                /* Анимэ */[20], //anime
                /* Док. и юмор */[18],
                /* Спорт */[37]
            ];
            for (var i = 0; i < groups_arr.length; i++)
                if (jQuery.inArray(parseFloat(n), groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        };
        var calculateCategoryName = function (n) {
            var n = parseFloat(n);
            if (n === 45)
                return 'Сериал - Русский';
            else if (n === 46)
                return 'Сериал - Буржуйский';
            else if (n === 8)
                return 'Кино - Комедия';
            else if (n === 6)
                return 'Кино - Боевик / Военный';
            else if (n === 15)
                return 'Кино - Триллер / Детектив';
            else if (n === 17)
                return 'Кино - Драма';
            else if (n === 35)
                return 'Кино - Мелодрама';
            else if (n === 39)
                return 'Кино - Индийское';
            else if (n === 13)
                return 'Кино - Фантастика';
            else if (n === 14)
                return 'Кино - Фэнтези';
            else if (n === 24)
                return 'Кино - Ужас / Мистика';
            else if (n === 11)
                return 'Кино - Приключения';
            else if (n === 10)
                return 'Кино - Наше Кино';
            else if (n === 9)
                return 'Кино - Исторический';
            else if (n === 47)
                return 'Кино - Азиатский';
            else if (n === 18)
                return 'Кино - Документальный';
            else if (n === 37)
                return 'Кино - Спорт';
            else if (n === 12)
                return 'Кино - Детский / Семейный';
            else if (n === 7)
                return 'Кино - Классика';
            else if (n === 48)
                return 'Кино - Концерт';
            else if (n === 49)
                return 'Кино - Передачи / ТВ-шоу';
            else if (n === 50)
                return 'Кино - ТВ-шоу Мир';
            else if (n === 38)
                return 'Кино - Театр, Опера, Балет';
            else if (n === 16)
                return 'Кино - Эротика';
            else if (n === 21)
                return 'Мульт - Буржуйский';
            else if (n === 22)
                return 'Мульт - Русский';
            else if (n === 20)
                return 'Мульт - Аниме';
            else if (n === 3)
                return 'Музыка - Буржуйская';
            else if (n === 4)
                return 'Музыка - Русская';
            else if (n === 5)
                return 'Музыка - Сборники';
            else if (n === 42)
                return 'Музыка - Классическая';
            else if (n === 2)
                return 'Другое - АудиоКниги';
            else if (n === 1)
                return 'Другое - Видеоклипы';
            else if (n === 23)
                return 'Другое - Игры';
            else if (n === 32)
                return 'Другое - Программы';
            else if (n === 40)
                return 'Другое - Дизайн / Графика';
            else if (n === 41)
                return 'Другое - Библиотека';
            return null;
        };
        var calculateTime = function (t) {
            if ((/сейчас/).test(t)) {
                return Math.round((new Date()).getTime() / 1000);
            }
            var tt = new Date();
            var today = tt.getDate() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getFullYear() + ' ';
            var tt = new Date((Math.round(tt.getTime() / 1000) - 24 * 60 * 60) * 1000);
            var yesterday = tt.getDate() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getFullYear() + ' ';
            t = t.replace('сегодня ', today).replace('вчера ', yesterday);
            t = ex_kit.month_replace(t);
            return ex_kit.format_date(1, t);
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var ver = 1;
            var t = engine.load_in_sandbox(c);
            t = t.find('table.mn2').eq($(c).find('table.mn2').length - 1).children('tbody').children('tr');
            if (t.length === 0) {
                ver = 2;
                var t = $(c).find('table.t_peer.w100p').children('tbody').children('tr');
            }
            var l = t.length;
            var arr = [];
            for (var i = 1; i < l; i++) {
                var td = t.eq(i).children('td');
                if (ver === 1) {
                    arr[arr.length] = {
                        'category': {
                            'title': calculateCategoryName(td.eq(0).children('a').eq(0).attr('href')),
                            'url': root_url + td.eq(0).children('a').eq(0).attr('href'),
                            'id': calculateCategory(td.eq(0).children('a').eq(0).attr('href'))
                        },
                        'title': td.eq(1).children('a').text(),
                        'url': root_url + td.eq(1).children('a').attr('href'),
                        'size': ex_kit.format_size(td.eq(4).text()),
                        'seeds': td.eq(6).text(),
                        'leechs': td.eq(7).text(),
                        'time': calculateTime(td.eq(3).text())
                    };
                } else if (ver === 2) {
                    var category_id = td.eq(0).children('img').attr('src').replace(/.*\/([0-9]*)\.gif$/, '$1');
                    arr[arr.length] = {
                        'category': {
                            'title': calculateCategoryName(category_id),
                            'url': url + '?c=' + category_id,
                            'id': calculateCategory(category_id)
                        },
                        'title': td.eq(1).children('a').text(),
                        'url': root_url + td.eq(1).children('a').attr('href'),
                        'size': ex_kit.format_size(td.eq(3).text()),
                        'seeds': td.eq(4).text(),
                        'leechs': td.eq(5).text(),
                        'time': calculateTime(td.eq(6).text())
                    };
                }
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr !== null)
                xhr.abort();
            xhr = $.ajax({
                type: 'GET',
                url: url + '?s=' + ex_kit.in_cp1251(text),
                cache: false,
                success: function (data) {
                    view.result(filename, readCode(data), t);
                },
                error: function (xhr, ajaxOptions, thrownError) {
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
        name: name,
        icon: icon,
        about: about,
        url: root_url,
        filename: filename,
        flags: flags,
        tests: [0, 0, 0, 0, 0, 1, 0, 0, 0]
    };
}();