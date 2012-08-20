var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'mininova';
    var filename = 'mininova';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AOJwNgDws5QAh0ogAPjZygDpkmYA9MmzAOaATQDsonwA++riAO6riQDyvKIA5HY/APni1gDnh1cARERERERERERBERERERERFEEREREREREUQRERERERERRBInHiLhciFEEiceIuFyIUQSJx4i4XIhRBIsHiJRciFEEiYXIjEygUQSIv0tJtKxRBiMYoVY2aFEEREREREREUQRERERERERRBERERERERFEEREREREREUREREREREREQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    var url = 'http://www.mininova.org/search/';
    var root_url = 'http://www.mininova.org/';
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
            /* Сериалы */[8],
            /* Музыка */[5],
            /* Игры */[3],
            /* Фильмы */[4],
            /* Мультфтльмы */[],
            /* Книги */[2],
            /* ПО */[7],
            /* Анимэ */[1]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(f),groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        }
        var calculateSize = function (s) {
            var type = '';
            var size = s.replace(' ','');
            var t = size.replace('KB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024);
            }
            t = size.replace('MB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024);
            }
            t = size.replace('GB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024);
            }
            t = size.replace('TB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024*1024);
            }
            return 0;
        }
        var calculateTime = function (s) {
            var s = s.replace(/([0-9]*)([^0-9]*)([0-9]*)/,'$1 $2 $3')
            var d = s.split(" ");
            var date = d[0];
            var month = $.trim(d[1]);
            var year = '20'+d[2];
            if (month == 'Jan') month = '01';
            if (month == 'Feb') month = '02';
            if (month == 'Mar') month = '03';
            if (month == 'Apr') month = '04';
            if (month == 'May') month = '05';
            if (month == 'Jun') month = '06';
            if (month == 'Jul') month = '07';
            if (month == 'Aug') month = '08';
            if (month == 'Sep') month = '09';
            if (month == 'Oct') month = '10';
            if (month == 'Nov') month = '11';
            if (month == 'Dec') month = '12';
            return Math.round((new Date(parseInt(year),parseInt('1'+month)-101,parseInt('1'+date)-100)).getTime() / 1000)
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c);
            t = t.find('table.maintable').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 1;i<l;i++) {
                var td = t.eq(i).children('td');
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(2).children('small').children('strong').children('a').text(), 
                        'url': root_url+td.eq(1).children('a').attr('href'),
                        'id': calculateCategory(td.eq(1).children('a').attr('href').replace(/(.*)cat\/([0-9]*)/i,"$2"))
                    },
                    'title' : td.eq(2).children('a[class!="dl"][class!="ti com"]').text(),
                    'url' : root_url+td.eq(2).children('a[class!="dl"][class!="ti com"]').attr('href'),
                    'size' : calculateSize(td.eq(3).text()),
                    'dl' : td.eq(2).children('a[class="dl"]').attr('href'),
                    'seeds' : td.eq(4).children().text(),
                    'leechs' : td.eq(5).children().text(),
                    'time' : calculateTime(td.eq(0).text())
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
                    'search' : text,
                    'cat' : 0
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