var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'Мегашара';
    var filename = 'megashara';
    var id = null;
    var icon = 'http://megashara.com/favicon.ico';
    var url = 'http://megashara.com/search/';
    var xhr = null;
    var web = function () {
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
        var calculateCategory = function (n) {
            if (n == 'Фильмы')
                return 3;
            if (n == 'ТВ')
                return 3;
            else if (n == 'Игры' || n == 'Онлайн игры.')
                return 2;
            else if (n == 'Музыка')
                return 1;
            else if (n == 'Сериалы')
                return 0;
            /*
            var groups_arr = [
            [], //serials 0
            [], //music  1
            [], //games  2
            [], //films  3
            [], //cartoon 4
            [], //books 5
            [], //prog  6
            [], //anime 7
            [] //other 8
            ];*/
            return 8;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c);//.contents();
            t = t.find('table.table-wide').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td = t.eq(i).children('td');
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(0).text(), 
                        'id': calculateCategory(td.eq(0).text())
                    },
                    'title' : td.eq(1).children('a').text(),
                    'url' : td.eq(1).children('a').attr('href'),
                    'size' : calculateSize(td.eq(3).children().text()),
                    'dl' : td.eq(2).children('a').attr('href'),
                    'seeds' : td.eq(4).text(),
                    'leechs' : td.eq(5).text(),
                    'time' : 0
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
                    'sorting' : 'seed',
                    'time' : 'ALL',
                    'year' : 0,
                    'parent' : 0,
                    'where' : 'title',
                    'all_words' : 1,
                    'text' : text,
                    'order' : 'added'
                },
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
        filename : filename
    }
}();
engine.ModuleLoaded(tmp_num);