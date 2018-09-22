// ==UserScript==
// @name Кинозал
// @trackerURL http://kinozal.tv/
// @icon data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/wAAAAAAAAAAgEc7/4BHO//8+/n/gEc7/4BHO/+ARzv/9/Tt//Xy6v/08Ob/gEc7/4BHO/+ARzv/7efX/4BHO/+ARzv/AAAAAIBHO//8+/n/+/r3//r49P/59vH/9/Tu//by6v/08Of/8u7j//Hs3//v6dv/7efY/+vk1P/q4tD/gEc7/wAAAAAAAAAAgEc7//r49P/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/q4tD/gEc7/wAAAAAAAAAAAAAAAIBHO//59/H/AACA/wAAgP8AAID/AACA/87v/f8AAID/AACA/wAAgP8AAID/6ODM/4BHO/8AAAAAAAAAAAAAAACARzv/9/Xu/87v/f8AAID/AACA/87v/f/O7/3/zu/9/wAAgP8AAID/zu/9/+beyf+ARzv/AAAAAAAAAACARzv/+PXv//bz6//O7/3/AACA/wAAgP/O7/3/zu/9/wAAgP8AAID/zu/9/87v/f/l3MX/49nB/4BHO/8AAAAAgEc7//bz6//18ej/zu/9/wAAgP8AAID/AACA/wAAgP/O7/3/zu/9/87v/f/O7/3/49nC/+HXvv+ARzv/AAAAAIBHO//18ej/8+/l/87v/f8AAID/AACA/wAAgP8AAID/zu/9/87v/f/O7/3/zu/9/+LXvv/g1bv/gEc7/wAAAACARzv/gEc7//Ht4f/O7/3/AACA/wAAgP/O7/3/zu/9/wAAgP/O7/3/zu/9/87v/f/g1bv/gEc7/4BHO/8AAAAAAAAAAIBHO//w6t7/zu/9/wAAgP8AAID/zu/9/87v/f/O7/3/AACA/87v/f/O7/3/39O4/4BHO/8AAAAAAAAAAAAAAACARzv/7uja/wAAgP8AAID/AACA/wAAgP/O7/3/zu/9/wAAgP8AAID/AACA/93Stf+ARzv/AAAAAAAAAAAAAAAAgEc7//r49P/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/q4tD/gEc7/wAAAAAAAAAAgEc7//z7+f/7+vf/+vj0//n28f/39O7/9vLq//Tw5//y7uP/8ezf/+/p2//t59j/6+TU/+ri0P+ARzv/AAAAAIBHO/+ARzv//Pv5/4BHO/+ARzv/gEc7//f07f/18ur/9PDm/4BHO/+ARzv/gEc7/+3n1/+ARzv/gEc7/wAAAAAAAAAAgEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/wAAAAAAAAAAnHMAAAABAAAAAQAAgAMAAIADAACAAwAAAAEAAAABAAAAAQAAAAEAAIADAACAAwAAgAMAAAABAAAAAQAAnHMAAA%3D%3D
// @description Торрент трекер Кинозал.ТВ - фильмы, новинки кино, скачать фильмы, афиша кино.
// @downloadURL https://github.com/Feverqwe/tSearch/raw/master/src/trackers/kinozal.js
// @connect *://kinozal.tv/*
// @require exKit
// @version 1.0.1
// ==/UserScript==

API_exKit({
    version: 2,
    id: 'kinozal',
    title: 'Кинозал',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/wAAAAAAAAAAgEc7/4BHO//8+/n/gEc7/4BHO/+ARzv/9/Tt//Xy6v/08Ob/gEc7/4BHO/+ARzv/7efX/4BHO/+ARzv/AAAAAIBHO//8+/n/+/r3//r49P/59vH/9/Tu//by6v/08Of/8u7j//Hs3//v6dv/7efY/+vk1P/q4tD/gEc7/wAAAAAAAAAAgEc7//r49P/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/q4tD/gEc7/wAAAAAAAAAAAAAAAIBHO//59/H/AACA/wAAgP8AAID/AACA/87v/f8AAID/AACA/wAAgP8AAID/6ODM/4BHO/8AAAAAAAAAAAAAAACARzv/9/Xu/87v/f8AAID/AACA/87v/f/O7/3/zu/9/wAAgP8AAID/zu/9/+beyf+ARzv/AAAAAAAAAACARzv/+PXv//bz6//O7/3/AACA/wAAgP/O7/3/zu/9/wAAgP8AAID/zu/9/87v/f/l3MX/49nB/4BHO/8AAAAAgEc7//bz6//18ej/zu/9/wAAgP8AAID/AACA/wAAgP/O7/3/zu/9/87v/f/O7/3/49nC/+HXvv+ARzv/AAAAAIBHO//18ej/8+/l/87v/f8AAID/AACA/wAAgP8AAID/zu/9/87v/f/O7/3/zu/9/+LXvv/g1bv/gEc7/wAAAACARzv/gEc7//Ht4f/O7/3/AACA/wAAgP/O7/3/zu/9/wAAgP/O7/3/zu/9/87v/f/g1bv/gEc7/4BHO/8AAAAAAAAAAIBHO//w6t7/zu/9/wAAgP8AAID/zu/9/87v/f/O7/3/AACA/87v/f/O7/3/39O4/4BHO/8AAAAAAAAAAAAAAACARzv/7uja/wAAgP8AAID/AACA/wAAgP/O7/3/zu/9/wAAgP8AAID/AACA/93Stf+ARzv/AAAAAAAAAAAAAAAAgEc7//r49P/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/q4tD/gEc7/wAAAAAAAAAAgEc7//z7+f/7+vf/+vj0//n28f/39O7/9vLq//Tw5//y7uP/8ezf/+/p2//t59j/6+TU/+ri0P+ARzv/AAAAAIBHO/+ARzv//Pv5/4BHO/+ARzv/gEc7//f07f/18ur/9PDm/4BHO/+ARzv/gEc7/+3n1/+ARzv/gEc7/wAAAAAAAAAAgEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/wAAAAAAAAAAnHMAAAABAAAAAQAAgAMAAIADAACAAwAAAAEAAAABAAAAAQAAAAEAAIADAACAAwAAgAMAAAABAAAAAQAAnHMAAA%3D%3D',
    desc: 'Торрент трекер Кинозал.ТВ - фильмы, новинки кино, скачать фильмы, афиша кино.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1
    },
    categoryList: {
        serials: [45, 46],
        music: [3, 4, 42],
        games: [23],
        films: [8, 6, 15, 17, 35, 39, 13, 14, 24, 11, 10, 9, 47, 12, 7, 48, 49, 50, 38, 16],
        cartoon: [21, 22],
        books: [2, 41],
        soft: [32, 40],
        anime: [20],
        doc: [18],
        sport: [37],
        xxx: [],
        humor: []
    },
    categoryNameList: function (n) {
        var map = {
            1: 'Другое - Видеоклипы',
            2: 'Другое - АудиоКниги',
            3: 'Музыка - Буржуйская',
            4: 'Музыка - Русская',
            5: 'Музыка - Сборники',
            6: 'Кино - Боевик / Военный',
            7: 'Кино - Классика',
            8: 'Кино - Комедия',
            9: 'Кино - Исторический',
            10: 'Кино - Наше Кино',
            11: 'Кино - Приключения',
            12: 'Кино - Детский / Семейный',
            13: 'Кино - Фантастика',
            14: 'Кино - Фэнтези',
            15: 'Кино - Триллер / Детектив',
            16: 'Кино - Эротика',
            17: 'Кино - Драма',
            18: 'Кино - Документальный',
            20: 'Мульт - Аниме',
            21: 'Мульт - Буржуйский',
            22: 'Мульт - Русский',
            23: 'Другое - Игры',
            24: 'Кино - Ужас / Мистика',
            32: 'Другое - Программы',
            35: 'Кино - Мелодрама',
            37: 'Кино - Спорт',
            38: 'Кино - Театр, Опера, Балет',
            39: 'Кино - Индийское',
            40: 'Другое - Дизайн / Графика',
            41: 'Другое - Библиотека',
            42: 'Музыка - Классическая',
            45: 'Сериал - Русский',
            46: 'Сериал - Буржуйский',
            47: 'Кино - Азиатский',
            48: 'Кино - Концерт',
            49: 'Кино - Передачи / ТВ-шоу',
            50: 'Кино - ТВ-шоу Мир'
        };
        return map[n];
    },
    search: {
        searchUrl: 'http://kinozal.tv/browse.php',
        nextPageSelector: {selector: 'div.paginator a[rel="next"]', attr: 'href'},
        baseUrl: 'http://kinozal.tv',
        requestType: 'GET',
        requestData: 's=%search%',
        listItemSelector: 'table.t_peer.w100p>tbody>tr',
        listItemSplice: [1, 0],
        torrentSelector: {
            categoryTitle: {selector: 'td.bt>img', attr: 'src'},
            categoryUrl: {selector: 'td.bt>img', attr: 'src'},
            categoryId: {selector: 'td.bt>img', attr: 'src'},
            title: 'td.nam>a',
            url: {selector: 'td.nam>a', attr: 'href'},
            size: 'td.s:eq(1)',
            seed: 'td.sl_s',
            peer: 'td.sl_p',
            date: 'td.s:eq(2)'
        },
        onGetValue: {
            categoryIdR: /\/([0-9]+)\./,
            categoryTitle: function (details, value) {
                var id = value.match(this.categoryIdR);
                if (!id) {
                    return '';
                }
                id = parseInt(id[1]);
                return details.tracker.categoryNameList(id);
            },
            categoryUrl: function (details, value) {
                var id = value.match(this.categoryIdR);
                if (!id) {
                    return '';
                }
                id = '?c=' + id[1];
                return id;
            },
            categoryId: function (details, value) {
                var id = value.match(this.categoryIdR);
                if (!id) {
                    return '';
                }
                id = parseInt(id[1]);
                return exKit.funcList.idInCategoryList(details.tracker, id);
            },
            size: function (details, value) {
                return exKit.funcList.sizeFormat(value);
            },
            date: function (details, value) {
                value = exKit.funcList.todayReplace(value, 1);
                return exKit.funcList.dateFormat(1, value)
            }
        }
    }
});