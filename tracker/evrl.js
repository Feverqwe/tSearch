var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'Everall';
    var filename = 'evrl';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAABYVD1LX1pD/1hVQf9TUkH/TU4//0hLP/9FSD//QUc+/zg+Nv87QDX/PkM2/0JFNv9ISDj/TEw6/1NQO/9YVD1LaGBE/2FbQ/9aVkH/VFNB/05OP/9JTD7/Rkk9/0FGPP86QDb/PEE3/0BDOP9FRzj/Sko6/1FOOv9XUj3/Xlc+/2xiRf9kXUP/XFhC/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv9UUTz/WlU9/2JbP/9tYkX/Zl5D/5uBTv/y8vL/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/m4FO/15YPv9lXED/b2RG/2hfRP+bgU7/8vLy/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/8vLy/5uBTv9hWkD/aV5A/3BkRP9nX0P/m4FO//Ly8v+bgU7/Sko8/0VIO/9BRTv/PkI4/0JEOf9HSDr/m4FO/5uBTv+bgU7/YlpA/2xhQv9xZUX/Z19D/5uBTv/y8vL/m4FO/0pKPP9FSDv/QUU7/z9DOf9ERjn/SEk7/09OO/9VUj7/XVc//2ZdQv9vYkL/cWVF/2lfQv+bgU7/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/8vLy/5uBTv9mXUL/cGND/3BjQ/9mXUL/m4FO//Ly8v+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO//Ly8v+bgU7/aV9C/3FlRf9vYkL/Zl1C/5uBTv/y8vL/m4FO/0hJO/9ERjn/P0M5/0FFO/9FSDv/Sko8/5uBTv/y8vL/m4FO/2dfQ/9xZUX/bGFC/2JaQP+bgU7/8vLy/5uBTv9HSDr/QkQ5/z5COP9BRTv/RUg7/0pKPP+bgU7/8vLy/5uBTv9nX0P/cGRE/2leQP9hWkD/m4FO//Ly8v+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO//Ly8v+bgU7/aF9E/29kRv9lXED/Xlg+/5uBTv/y8vL/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/m4FO/2ZeQ/9tYkX/Yls//1pVPf9UUTz/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO/1xYQv9kXUP/bGJF/15XPv9XUj3/UU46/0pKOv9FRzj/QEM4/zxBN/86QDb/QUY8/0ZJPf9JTD7/Tk4//1RTQf9aVkH/YVtD/2hgRP9YVD1LU1A7/0xMOv9ISDj/QkU2/z5DNv87QDX/OD42/0FHPv9FSD//SEs//01OP/9TUkH/WFVB/19aQ/9YVD1LgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAA%3D%3D';
    var login_url = 'http://evrl.to/login/';
    var url = 'http://evrl.to/search/';
    var root_url = 'http://evrl.to';
    var about = 'Здесь можно найти и пообсуждать кино, фильмы, сериалы, музыку, игры, программы, новинки, другие ключевые слова и множество всяких полезных штук. А можно и не.';
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            return -1;
        }
        var calculateTime = function (t) {
            var t = t.replace('в ','');
            t = t.replace('января','1').replace('февраля','2').replace('марта','3')
            .replace('апреля','4').replace('мая','5').replace('июня','6')
            .replace('июля','7').replace('августа','8').replace('сентября','9')
            .replace('октября','10').replace('ноября','11').replace('декабря','12');
            var t2 = t.replace(':',' ');
            var ex_time = false;
            if (t2 != t) {
                t = t2;
                ex_time = true;
            }
            if (!ex_time)
                t = t.replace(' года','');
            var tt = new Date();
            var today = tt.getDate()+' '+(tt.getMonth()+1)+' '+tt.getFullYear()+' ';
            var tt = new Date((Math.round(tt.getTime()/1000)-24*60*60)*1000);
            var yesterday = tt.getDate()+' '+(tt.getMonth()+1)+' '+tt.getFullYear()+' ';
            t = t.replace('сегодня ',today).replace('вчера ',yesterday);
            var dd = t.split(' ');
            if (dd[0]<10) dd[0] = '0'+dd[0];
            if (ex_time)
                return Math.round((new Date(tt.getFullYear(),parseInt(dd[1])-1,parseInt('1'+dd[0])-100,parseInt('1'+dd[2])-100,parseInt('1'+dd[3])-100)).getTime() / 1000);
            else
                return Math.round((new Date(parseInt(dd[2]),parseInt(dd[1])-1,parseInt('1'+dd[0])-100)).getTime() / 1000);
        }
        var calculateSize = function (s) {
            var type = '';
            var size = s.replace(' ','');
            var t = size.replace('КБ','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024);
            }
            var t = size.replace('МБ','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024);
            }
            var t = size.replace('ГБ','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024);
            }
            var t = size.replace('ТБ','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024*1024);
            }
            return 0;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c);
            /*if (t.find('div.navbar-search').html() == null) {
                view.auth(0,id);
                return [];
            } else 
                view.auth(1,id);
                */
            t.find('div.talks_delimeter').remove();
            t = t.children('div');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var div = t.eq(i).children('div');
                if (div.eq(1).children('a').text().length == 0) continue;
                arr[arr.length] = {
                    'category' : {
                        'id': -1
                    },
                    'title' : div.eq(1).children('a').text(),
                    'url' : root_url+div.eq(1).children('a').attr('href'),
                    'size' : calculateSize(div.eq(2).children('div').eq(2).text()),
                    'dl' :  root_url+div.eq(2).children('div').eq(1).children('a').attr('href'),
                    'seeds' : 1,
                    'leechs' : 0,
                    'time' : calculateTime(div.eq(2).children('div').eq(3).text())
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
                contentType: 'application/json',
                url: url,
                cache : false,
                dataType: 'json',
                data: '{"request":{"url":"/search/","search_for":"'+text+'","cat_id":0,"options":0,"offset":1,"method":"getSearch"}}',
                success: function(data) {
                    if (data.response == null) {
                        view.auth(0,id);
                        view.result(id,[],t);
                    } else {
                        view.auth(1,id);
                        view.result(id,readCode(data.response.result),t);
                    }
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
        login_url : login_url,
        name : name,
        icon : icon,
        about : about,
        url : root_url,
        filename : filename
    }
}();
engine.ModuleLoaded(tmp_num);