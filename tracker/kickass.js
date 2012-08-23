var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'KickAss';
    var filename = 'kickass';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHUFLcyFLV74bO0UuAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeQEthLmNy+DVzhf81c4X/NXOF/ydUYdscPEUdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkTFeuN3WG/zh2iP84doj/OHaI/zh2iP84doj/M2t7/B9BS1IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlS1ecPHmM/zx5jP88eYz/WIyc/3OfrP9BfI//PHmM/zx5jP83b4D9IEFLPgAAAAAAAAAAAAAAAAAAAAAiQ0wzPXiJ/kB9j/9AfY//XZGg//b5+v//////4uvu/2iZp/9AfY//QH2P/zNkcu4AAAAAAAAAAAAAAAAAAAAAMl1q2UWBlP9FgZT/RYGU/73T2f///////f7+//L29//p8PL/RYGU/0WBlP9FgZT/KUxXgAAAAAAAAAAAJ0ZPHUeBk/9Khpj/SoaY/0qGmP/b5+r//////7vR2P9Khpj/bp6t/0qGmP9Khpj/SoaY/zlndOcAAAAAAAAAAC9SXIBPi53/T4ud/0+Lnf9Pi53/0eHm///////F2d//T4ud/0+Lnf9Pi53/T4ud/0+Lnf9Mhpf/KEZPEgAAAAA4YGu+VJCh/1SQof9UkKH/VJCh/8HX3f//////6/L0/1SQof9UkKH/VJCh/1SQof9UkKH/VJCh/y9QWVwAAAAAQGp31lmUpv9ZlKb/aZ6u/5u/yv/W5en////////////C2N//3urt/3Smtf9ZlKb/WZSm/1mUpv81WWOIAAAAAENseNRemar/Xpmq/3Wntv////////////////////////////////+VvMf/Xpmq/16Zqv9emar/OFtlhAAAAABCaHS+Y52v/2Odr/9nn7H/iLTC/4Kxv//0+Pn//////6zL1f9jna//Y52v/2Odr/9jna//Y52v/zdXYVwAAAAAPF5od2ehsv9nobL/Z6Gy/2ehsv9nobL/xtzi///////f6+//Z6Gy/2ehsv9nobL/Z6Gy/2Wdrv80UVoSAAAAADZTXBJkmqr+a6W2/2ultv9rpbb/a6W2/2ultv9rpbb/a6W2/2ultv9rpbb/a6W2/2ultv9SfovlAAAAAAAAAAAAAAAAS3J9xG+ouf9vqLn/XIuZ9GGTovpvqLn/b6i5/2+ouf9gkqD5Zpqp/W+ouf9vqLn/QWJsdwAAAAAAAAAAAAAAADtZYhdbipfxQWJrbgAAAAAAAAAAR2t2p2CRn/dBYmtuAAAAAAAAAABGanSgVH6L3wAAAAAAAAAA/j8AAPgPAADwBwAA4AMAAMADAADAAQAAgAEAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIABAADAAQAAxjMAAA%3D%3D';
    var url = 'http://kat.ph/search/';
    var blank_url = 'http://kat.ph/new/';
    var root_url = 'http://kat.ph';
    var about = 'Search and download new TV shows, TV series, movies, mp3, music and PC/PS2/PSP/Wii/Xbox games absolutely for free.';
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
            /* Сериалы */[],
            /* Музыка */['music'],
            /* Игры */[],
            /* Фильмы */['movies','tv'],
            /* Мультфтльмы */[],
            /* Книги */['books'],
            /* ПО */['applications'],
            /* Анимэ */['anime'],
            /* Док. и юмор */[],
            /* Спорт */[],
            /* Порно */['xxx']
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(f,groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        }
        var calcTime = function (t) {
            t = t.replace(/([0-9]*).?([A-Za-z]*)/,'$1|$2').split('|');
            var type_time = t[1];
            var val = parseInt(t[0]);
            var nowTS = Math.round((new Date()).getTime() / 1000);
            if ((/sec/).test(type_time)) {
                nowTS -= val;
            } else
            if ((/min/).test(type_time)) {
                nowTS -= val*60;
            } else
            if ((/hour/).test(type_time)) {
                nowTS -= val*(60^2);
            } else
            if ((/day/).test(type_time)) {
                nowTS -= val*(60^2)*24;
            } else
            if ((/week/).test(type_time)) {
                nowTS -= val*(60^2)*24*7;
            } else
            if ((/month/).test(type_time)) {
                nowTS -= val*(60^2)*24*30;
            } else
            if ((/year/).test(type_time)) {
                nowTS -= val*(60^2)*24*365;
            } else
                return 0;
            return nowTS;
        }
        var calculateSize = function (s) {
            var type = '';
            var size = s.replace(' ','');
            var t = size.replace('KB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024);
            }
            var t = size.replace('MB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024);
            }
            var t = size.replace('GB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024);
            }
            var t = size.replace('TB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024*1024);
            }
            return 0;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c)
            t = t.find('table.data').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 1;i<l;i++) {
                var td = t.eq(i).children('td');
                var span_l = td.eq(0).children('div').eq(1).children('span').find('span').length-1;
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(0).children('div').eq(1).children('span').find('span').eq(span_l).text(), 
                        'url': root_url+td.eq(0).children('div').eq(1).children('span').find('span').eq(span_l).find('a').eq(0).attr('href'),
                        'id': calculateCategory(td.eq(0).children('div').eq(1).children('span').find('span').eq(span_l).find('a').eq(0).attr('href').replace(/\/(.*)\//i,"$1"))
                    },
                    'title' : td.eq(0).children('div').eq(1).children('a').eq(1).text(),
                    'url' : root_url+td.eq(0).children('div').eq(1).children('a').eq(1).attr('href'),
                    'size' : calculateSize(td.eq(1).text()),
                    'dl' : td.eq(0).children('div').eq(0).children('a.imagnet').attr('href'),
                    'seeds' : td.eq(4).text(),
                    'leechs' : td.eq(5).text(),
                    'time' : calcTime(td.eq(3).text())
                }
            }
            return arr;
        }
        var loadPage = function (text) {
            var t = text;
            if (xhr != null)
                xhr.abort();
            xhr = $.ajax({
                type: 'POST',
                url: (text == '') ? blank_url : url+text+'/',
                success: function(data) {
                    view.result(id,readCode(data),t);
                },
                error:function (xhr, ajaxOptions, thrownError){
                    view.loadingStatus(2,id);
                }
            });
        }
        return {
            getPage : function (a) {
                return loadPage(a);
            }
        }
    }();
    var find = function (text) {
        return web.getPage(text);
    }
    return {
        find : function (a) {
            return find(a);
        },
        setId : function (a) {
            id = a;
        },
        id : id,
        name : name,
        icon : icon,
        about : about,
        url : root_url,
        filename : filename
    }
}();
engine.ModuleLoaded(tmp_num);