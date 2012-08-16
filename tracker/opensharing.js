var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'OpenSharing';
    var filename = 'opensharing';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABILAAASCwAAAAAAAAAAAAAAAA8AElrJ/xJayf8SWsn/ElrJ/xJayf8SWsn/ElrJ/xJayf8SWsn/ElrJ/xJayf8SWsn/ElrJ/xJayf8Ah0sAElzL/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/ElzL/xNfzv8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xeB8/8Uduz/FHbs/xeB8/8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xNfzv8TYtH/GIT0/xiE9P8YhPT/GIT0/xd/8f8RaeT///////////8RaeT/F3/x/xiE9P8YhPT/GIT0/xiE9P8TYtH/FGbV/xeB8f8XgfH/F4Hx/xZ87v8QZ+H//////////////////////xBn4f8WfO7/F4Hx/xeB8f8XgfH/FGbV/xRq2f8Xfu7/F37u/xZ56/8QZN7/////////////////////////////////EGTe/xZ56/8Xfu7/F37u/xRq2f8Vbt3/Fnrq/xZ66v8TcOT///////////////////////////////////////////8TcOT/Fnrq/xZ66v8Vbt3/FXLi/xZ25v8Wdub/FXHj/xJo3f8NVdD//////////////////////w1V0P8SaN3/FXHj/xZ25v8Wdub/FXLi/xZ25v8VcuL/FXLi/xVy4v8VcuL/EF/W//////////////////////8QX9b/FXLi/xVy4v8VcuL/FXLi/xZ25v8Weur/FW7d/xVu3f8Vbt3/FW7d/xBc0f//////////////////////EFzR/xVu3f8Vbt3/FW7d/xVu3f8Weur/F37u/xRq2f8Uatn/FGrZ/xRq2f8PWc3//////////////////////w9Zzf8Uatn/FGrZ/xRq2f8Uatn/F37u/xeB8f8UZtX/FGbV/xRm1f8UZtX/D1XK//////////////////////8PVcr/FGbV/xRm1f8UZtX/FGbV/xeB8f8YhPT/E2LR/xNi0f8TYtH/E2LR/xBWyf//////////////////////EFbJ/xNi0f8TYtH/E2LR/xNi0f8YhPT/GIb2/xNfzv8TX87/E1/O/xNfzv8SW8v/EFTG/w5Qw/8OUMP/EFTG/xJby/8TX87/E1/O/xNfzv8TX87/GIb2/xiG9v8SXMv/ElzL/xJcy/8SXMv/ElzL/xJcy/8SXMv/ElzL/xJcy/8SXMv/ElzL/xJcy/8SXMv/ElzL/xiG9v8AzdMAGIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8Yhvb/GIb2/xiG9v8AjU4AgAE9sQAAsYAAAEHpAACl1QAAGJ8AAAAmAADRIQAAL7MAAFNAAACvfgAA1c8AAJXOAABlJwAAB60AAGWmgAHAaQ%3D%3D';
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
                        'id': -1
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