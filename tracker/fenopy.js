var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'fenopy';
    var filename = 'fenopy';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAADy8vIMjIvJjkFCr/pBQq7/QEGr/z9AqP8+PqX/Pj6l/z4/pv8/QKn/QEGs/0FCr/9CQ7L/QkOz+o+OzY329vYHjIvKjkFDr/81NaP/JyOW/yAbjv8fGor/HhmH/x4Zhv8eGYf/HxqK/yAajv8hHJL/KSab/zk4qv9DRLX/kZDPi0FCr/o1NKP/IBuP/x8ai/8eGYb/KyeK/1VRnv9VUZ7/VVKf/x0Ygv8eGYb/HxqL/yAbkP8hHJT/OTiq/0JDtfpBQ67/JSGT/x8aiv8dGYT/HBh//1RRm/////////////////8bF3r/HBh//x0ZhP8fGor/IBuQ/ykmnP9DRbT/QEKr/yAbjP8eGYb/HBiA/xsWeP9TUJb/////////////////GhVz/xsWeP8cGH//HhmF/x8ajP8iHZP/QkSx/z9Bqf8fGor/HRiC/xsXe/8aFnT/U1CS/////////////////xgUbf8aFXP/Gxd6/x0Ygv8eGon/IBuQ/0JDsP8+QKf/HhmI/x0YgP8bFnj/GRVx/1JPj/////////////////8XE2j/GRVv/xoWdv8cGH7/HhmG/yAajv9BQ67/PkCm/x4Zhv8cGH7/GhZ2/xgUbf9RTo3/////////////////FhNl/xgUa/8aFnT/HBd8/x0ZhP8fGoz/QEKs/z4/pf8eGYb/HBd9/xoWdf/Gxdv/////////////////////////////////GRVy/xsXev8dGIL/HxqL/0BCq/8+QKb/HhmG/xwYfv8aFnb/xsXb/////////////////////////////////xkVcv8bF3r/HRiC/x8ai/9AQqv/PkCn/x4ZiP8dGID/GxZ4/0RBi/99e6v/////////////////YF2W/1JPkf8aFnX/HBd8/x0ZhP8fGoz/QEKs/0BBqv8fGov/HRmD/xwXfP8aFnX/REGK////////////////////////////GxZ4/xwYf/8eGYb/IRyP/0BCrf9BQq3/JCCS/x4ZiP8dGIL/Gxd7/xoWdf+bmcH/4+Lu/////////////////xwXfP8dGYP/HxqK/ycklf9BQ6//QUKu+jMxof8fG43/HhmI/x0Ygv8cF37/Gxd6/xsWeP8bFnj/Gxd6/xwYfv8dGYP/HhqJ/yAbjv81NaT/QkKw+oyLyY5BQq//NDOh/yMfkP8fGon/HhmF/x0Ygv8dGID/HRiA/x0Ygv8eGYX/HxqK/yUgkv81NKH/QkKw/4yLyo7y8vIMionHkUBBrfpAQqv/PkCn/z0+o/88PqD/Oz2e/zs9nv88PqD/PT6j/z5Ap/9AQqv/QEGt+ouLyI7y8vIMgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAA%3D%3D';
    var url = 'http://fenopy.se/';
    var root_url = 'http://fenopy.se';
    var about = 'A fast and user friendly bittorrent search engine, with milions of Video, Audio and Software torrents.';
    var flags = {
        a : 0,
        l : 0,
        rs: 0
    }
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
            /* Сериалы */['TV Shows'],
            /* Музыка */['Music'],
            /* Игры */['Games'],
            /* Фильмы */['Movies','Videos'],
            /* Мультфтльмы */[],
            /* Книги */['Books'],
            /* ПО */['Apps','Applications'],
            /* Анимэ */['Animes','Anime'],
            /* Док. и юмор */[],
            /* Спорт */[],
            /* XXX */[]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(f,groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        }
        var calculateSize = function (s) {
            var type = '';
            var size = s.replace(' ','');
            var t = size.replace('KB','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024);
            }
            var t = size.replace('MB','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024);
            }
            var t = size.replace('GB','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024);
            }
            var t = size.replace('TB','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024*1024);
            }
            return 0;
        }
        var calculateTime = function (t) {
            if ((/today/).test(t)) {
                return Math.round((new Date().getTime() / 1000)/(60*60*24))*(60*60*24);
            } else
            if ((/yesterday/).test(t)) {
                return (Math.round((new Date().getTime() / 1000)/(60*60*24))*(60*60*24))-(60*60*24);
            } else
            {
                var time = parseInt(t.replace(/([0-9]*).*/,'$1'));
                var nowTime = Math.round(new Date().getTime() / 1000);
                if ((/second/).test(t)) {
                    return nowTime - time;
                } else
                if ((/minute/).test(t)) {
                    return nowTime - time*60;
                } else
                if ((/hour/).test(t)) {
                    return nowTime - time*60*60;
                } else
                if ((/day/).test(t)) {
                    return nowTime - time*60*60*24;
                } else
                if ((/week/).test(t)) {
                    return nowTime - time*60*60*24*7;
                } else
                if ((/month/).test(t)) {
                    return nowTime - time*60*60*24*30;
                } else
                if ((/year/).test(t)) {
                    return nowTime - time*60*60*24*365;
                }
            }
            return 0;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = view.load_in_sandbox(id,c);
            t = t.find('#search_table').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td = t.eq(i).children('td');
                td.eq(0).children('sapn').remove();
                var links = td.eq(2).children('a');
                var title = td.eq(0).children('a').text();
                var url = td.eq(0).children('a').attr('href');
                td.eq(0).children().remove();
                var c_t = $.trim(td.eq(0).text()).substr(1);
                arr[arr.length] = {
                    'category' : {
                        'title' : c_t,
                        'id': calculateCategory(c_t)
                    },
                    'title' : title,
                    'url' : root_url+url,
                    'size' : calculateSize(td.eq(3).text()),
                    'dl' : links.eq(links.length-1).attr('href'),
                    'seeds' : td.eq(5).text(),
                    'leechs' : td.eq(6).text(),
                    'time' : calculateTime(td.eq(4).text())
                }
            }
            return arr;
        }
        var loadPage = function (text) {
            var t = text;
            if (xhr != null)
                xhr.abort();
            xhr = $.ajax({
                type: 'GET',
                url: url,
                cache : false,
                data: {
                    'keyword' : text,
                    'limit' : '50'
                },
                success: function(data) {
                    view.result(id,readCode(data),t);
                },
                error:function (){
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
        filename : filename,
        flags : flags
    }
}();
engine.ModuleLoaded(tmp_num);