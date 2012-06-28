var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'OpenSharing';
    var filename = 'opensharing';
    var id = null;
    var icon = 'http://opensharing.org/favicon.ico';
    var url = 'http://opensharing.org/c.php';
    var root_url = 'http://opensharing.org';
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
        var calculateTime = function (s) {
            var d = s.split(' ');
            var date = d[0];
            var month = d[1];
            var year = '20'+d[2];
            if (month == 'Янв') month = '01';
            if (month == 'Фев') month = '02';
            if (month == 'Мар') month = '03';
            if (month == 'Апр') month = '04';
            if (month == 'Май') month = '05';
            if (month == 'Июн') month = '06';
            if (month == 'Июл') month = '07';
            if (month == 'Авг') month = '08';
            if (month == 'Сен') month = '09';
            if (month == 'Окт') month = '10';
            if (month == 'Ноя') month = '11';
            if (month == 'Дек') month = '12';
            return Math.round((new Date(parseInt(year),parseInt('1'+month)-101,parseInt('1'+date)-100)).getTime() / 1000)
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c);//.contents();
            t = t.find('#index').children('table').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 1;i<l;i++) {
                var td = t.eq(i).children('td');
                var corr = 0;
                if (td.length > 5)
                    corr = 1;
                td.eq(2+corr).children('span').children('img').remove();
                arr[arr.length] = {
                    'category' : {
                        'id': 8
                    },
                    'title' : td.eq(1).children('a').eq(2).text(),
                    'url' : root_url+td.eq(1).children('a').eq(2).attr('href'),
                    'size' : calculateSize(td.eq(4+corr).text()),
                    'dl' : td.eq(1).children('a').eq(0).attr('href'),
                    'seeds' : td.eq(2+corr).children('span.green').text(),
                    'leechs' : td.eq(3+corr).children('span.red').text(),
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
                data: {
                    'search' : text,
                    'method' : 1,
                    'in' : 0,
                    'tags' : 0,
                    'cat' : 0,
                    'order' : 2,
                    'inc' : 0,
                    'make_search' : 1
                },
                cache : false,
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