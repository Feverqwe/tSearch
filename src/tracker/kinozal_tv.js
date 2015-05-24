/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib.kinozal = {
    id: 'kinozal',
    title: 'Кинозал',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/wAAAAAAAAAAgEc7/4BHO//8+/n/gEc7/4BHO/+ARzv/9/Tt//Xy6v/08Ob/gEc7/4BHO/+ARzv/7efX/4BHO/+ARzv/AAAAAIBHO//8+/n/+/r3//r49P/59vH/9/Tu//by6v/08Of/8u7j//Hs3//v6dv/7efY/+vk1P/q4tD/gEc7/wAAAAAAAAAAgEc7//r49P/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/q4tD/gEc7/wAAAAAAAAAAAAAAAIBHO//59/H/AACA/wAAgP8AAID/AACA/87v/f8AAID/AACA/wAAgP8AAID/6ODM/4BHO/8AAAAAAAAAAAAAAACARzv/9/Xu/87v/f8AAID/AACA/87v/f/O7/3/zu/9/wAAgP8AAID/zu/9/+beyf+ARzv/AAAAAAAAAACARzv/+PXv//bz6//O7/3/AACA/wAAgP/O7/3/zu/9/wAAgP8AAID/zu/9/87v/f/l3MX/49nB/4BHO/8AAAAAgEc7//bz6//18ej/zu/9/wAAgP8AAID/AACA/wAAgP/O7/3/zu/9/87v/f/O7/3/49nC/+HXvv+ARzv/AAAAAIBHO//18ej/8+/l/87v/f8AAID/AACA/wAAgP8AAID/zu/9/87v/f/O7/3/zu/9/+LXvv/g1bv/gEc7/wAAAACARzv/gEc7//Ht4f/O7/3/AACA/wAAgP/O7/3/zu/9/wAAgP/O7/3/zu/9/87v/f/g1bv/gEc7/4BHO/8AAAAAAAAAAIBHO//w6t7/zu/9/wAAgP8AAID/zu/9/87v/f/O7/3/AACA/87v/f/O7/3/39O4/4BHO/8AAAAAAAAAAAAAAACARzv/7uja/wAAgP8AAID/AACA/wAAgP/O7/3/zu/9/wAAgP8AAID/AACA/93Stf+ARzv/AAAAAAAAAAAAAAAAgEc7//r49P/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/q4tD/gEc7/wAAAAAAAAAAgEc7//z7+f/7+vf/+vj0//n28f/39O7/9vLq//Tw5//y7uP/8ezf/+/p2//t59j/6+TU/+ri0P+ARzv/AAAAAIBHO/+ARzv//Pv5/4BHO/+ARzv/gEc7//f07f/18ur/9PDm/4BHO/+ARzv/gEc7/+3n1/+ARzv/gEc7/wAAAAAAAAAAgEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/wAAAAAAAAAAnHMAAAABAAAAAQAAgAMAAIADAACAAwAAAAEAAAABAAAAAQAAAAEAAIADAACAAwAAgAMAAAABAAAAAQAAnHMAAA%3D%3D',
    desc: 'Торрент трекер Кинозал.ТВ - фильмы, новинки кино, скачать фильмы, афиша кино.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    categoryList: [
        /*Serials*/[45, 46],
        /*Music  */[3, 4, 42],
        /*Games  */[23],
        /*Films  */[8, 6, 15, 17, 35, 39, 13, 14, 24, 11, 10, 9, 47, 12, 7, 48, 49, 50, 38, 16],
        /*Cartoon*/[21, 22],
        /*Books  */[2, 41],
        /*Soft   */[32, 40],
        /*Anime  */[20],
        /*Documen*/[18],
        /*Sport  */[37],
        /*XXX    */[],
        /*Humor  */[]
    ],
    categoryNameList: function(n) {
        "use strict";
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
        return undefined;
    },
    search: {
        searchUrl: 'http://kinozal.tv/browse.php',
        baseUrl: 'http://kinozal.tv',
        requestType: 'GET',
        requestData: 's=%search%',
        onGetRequest: 'encodeURIComponent',
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
            categoryTitle: function(value) {
                "use strict";
                var id = value.match(/\/([0-9]+)\./);
                if (!id) {
                    return '';
                }
                id = parseInt(id[1]);
                return this.tracker.categoryNameList(id);
            },
            categoryUrl: function(value) {
                "use strict";
                var id = value.match(/\/([0-9]+)\./);
                if (!id) {
                    return '';
                }
                id = '?c=' + id[1];
                return id;
            },
            categoryId: function(value) {
                "use strict";
                var id = value.match(/\/([0-9]+)\./);
                if (!id) {
                    return '';
                }
                id = parseInt(id[1]);
                return exKit.funcList.idInCategoryList.call(this, id);
            },
            size: function(value) {
                "use strict";
                return exKit.funcList.sizeFormat(value);
            },
            date: function(value) {
                "use strict";
                value = exKit.funcList.todayReplace(value, 1);
                return exKit.funcList.dateFormat(1, value)
            }
        }
    }
};