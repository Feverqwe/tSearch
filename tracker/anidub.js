torrent_lib.anidub = function () {
    var name = 'AniDUB';
    var filename = 'anidub';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACRjor/c3Fu/4WEgv+/v77/i4uL/4GBgP9ycG7/jouI/zMyMN8IBgVwLi0rEwAAAAAAAAAAAAAAAAAAAAAAAAAAfnx5/8rKyv+wr6//zc3M/9LS0v/5+fn/g4KB/6uopP+em5f/Z2Vi/1FPTfgsLCqOSUlGDAAAAAAAAAAAAAAAAJubmv/h4eH/0NDQ//39/f/ExMT/h4eF/42LiP+ioJ3/nZuX/357eP+6t7P/l5SR/0tKR92fnZkjAAAAAAAAAADPzs7/5eXl/8bGxf+fn57/iIeE/6ilof+trKr//v7+/8rJyP+fnJn/npuY/7u5tf+vrKj/MjEvygAAAAAAAAAAzc3M/8bGxf/DwsH/lpOQ/6uopP+rqKT/nZuZ/9zc3P+lpKL/q6ik/46Mif+7ubX/urez/z89O/YREA8JAAAAAOrq6v+fn57/kI6K/6uopP+rqKT/q6ik/6uopP+gnpr/qaai/6ekoP+Qjov/sq+r/3Z0cf8LCglxAAAAAAAAAADIyMf/h4aD/6uopP+rqKT/q6ik/6uopP+rqKT/q6ik/6uopP+MiYb/kY6L/05MSu8vLixhAAAAAAAAAAAAAAAAoZ+d/52bmP+vraz/pKGd/6uopP+rqKT/q6ik/6uopP+rqKT/QUA97wsKCXw9PToVAAAAAAAAAAAAAAAAAAAAAKuopP/R0dH//v7+/66tq/+rqKT/q6ik/6uopP+rqKT/eXZz/wgGBVoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACrqKT/trWz/87NzP+gnZr/q6ik/6uopP+rqKT/enh1/xIRD4EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAenh0/6Wjn/+rqKT/q6ik/6uopP+Rjor/RkRC4woJB1kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKekof99e3j/fnx5/4WDf/+Egn7/Ly4s4wgGBQkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACYlpP/u7m1/7u5tf+vrKj/cnBt/zIyMFoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPTs5za+sqP+6t7P/iYeD/zMyMJ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL+9uxs6OTfNTEpI9jQzMYVUVFECAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgGBQkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+sQQAHrEEAA6xBAAOsQQABrEEAA6xBAAesQQAPrEEAP6xBAH+sQQD/rEEB/6xBA/+sQQf/rEEH/6xB3/+sQQ%3D%3D';
    var url = 'http://tr.anidub.com/browse.php';
    var root_url = 'http://tr.anidub.com/';
    var about = 'Аниме торрент-трекер Anidub.';
    var flags = {
        a: 1,
        l: 1,
        rs: 1,
        proxy: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[],
                /* Музыка */['Music/OST'],
                /* Игры */['Anime Games', 'Онлайн игры'],
                /* Фильмы */[],
                /* Мультфтльмы */[],
                /* Книги */[],
                /* ПО */[],
                /* Анимэ */['OVA', 'TV', 'Live', 'Movie', 'DVD-5/DVD-9/Blu-Ray', 'ONA', 'Manga', 'HWP', 'iPod'],
                /* Док. и юмор */[],
                /* Спорт */[],
                ['Hentai']
            ];
            for (var i = 0, len = groups_arr.length; i < len; i++)
                if (groups_arr[i].indexOf($.trim(f)) !== -1) {
                    return i;
                }
            return -1;
        };
        var calculateTime = function (f) {
            var dd = f.replace(/[\t:-]/g, ' ').split(' ');
            return Math.round((new Date(parseInt(dd[0]), parseInt(dd[1]) - 1, parseInt(dd[2]), parseInt(dd[3]), parseInt(dd[4]), parseInt(dd[5]))).getTime() / 1000);
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('table.main').eq(1).children('tbody').children('tr').children('td').children('table');
            var l = t.length;
            if ( l === 0) {
                return [];
            }
            var arr = new Array(l - 1);
            for (var i = 0; i < l - 1; i++) {
                var td = t.eq(i).children('tbody').children('tr').children('td').eq(1);
                var params = td.children('table').eq(2).find('td').eq(0).text().replace(/[\r\t]*/g, '').replace(/[а-яА-Я]*\:/gm, '').replace(/\n/gm, '').replace(/\s+/g, " ").split(' ');
                var pp = 0;
                if (params.length === 9) {
                    pp = 1;
                }
                arr[i] = {
                    category: {
                        title: td.children('table').eq(2).find('td').eq(1).children('a').eq(0).text(),
                        id: calculateCategory(td.children('table').eq(2).find('td').eq(1).children('a').eq(0).text())
                    },
                    title: td.children('table').eq(0).find('span').children('a').eq(1).text(),
                    url: root_url + td.children('table').eq(0).find('span').children('a').eq(1).attr('href'),
                    size: ex_kit.format_size($.trim(params[2 + pp] + params[3 + pp])),
                    seeds: params[5 + pp].replace(',', ''),
                    leechs: params[6 + pp].replace(',', ''),
                    time: calculateTime(td.children('table').eq(0).find('span').children('a').eq(2).text())
                }
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr !== undefined)
                xhr.abort();
            xhr = engine.ajax({
                tracker: filename,
                type: 'GET',
                url: url + '?noscript=0&ajax=1&search=' + encodeURIComponent(text) + '&view=0&incldead=0&trailer=no&date=0',
                cache: false,
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
        name: name,
        icon: icon,
        about: about,
        url: root_url,
        filename: filename,
        flags: flags,
        tests: [0, 0, 1, 0, 0, 1, 0, 0, 0]
    };
}();