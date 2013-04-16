(function (tmp_num) {
torrent_lib[tmp_num] = function () {
    var name = 'Порнолаб';
    var filename = 'pornolab';
    var id = null;
    var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAADFBMVEXj4+Pv7+88YLr6KAKxMh22AAAACXBIWXMAAABIAAAASABGyWs+AAAAK0lEQVQI12NgAAHR0NAQBqlVU78AiaVAIhSVAIuBZUNDUYj4/1ACbAAIAABFhxuT/FH5qgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxMi0wNi0yNVQyMTowNzoyMiswNDowMONsV98AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTItMDYtMjVUMjE6MDc6MjIrMDQ6MDCSMe9jAAAAAElFTkSuQmCC';
    var login_url = 'http://pornolab.net/forum/login.php';
    var url = 'http://pornolab.net/forum/tracker.php';
    var root_url = 'http://pornolab.net/forum/';
    var about = 'Крупнейший русскоязычный порно трекер.';
    var flags = {
        a : 1,
        l : 1,
        rs: 1
    }
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            return 10;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = view.load_in_sandbox(id,c);
            if (t.find('input[name="login_username"]').length) {
                view.auth(0,id);
                return [];
            } else 
                view.auth(1,id);
            t = t.find('#search-results').children('#tor-tbl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td = t.eq(i).children('td');
                if (td.eq(5).children('a').attr('href') == null) continue;
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(2).children('a').text(), 
                        'url': root_url+td.eq(2).children('a').attr('href'),
                        'id': calculateCategory(td.eq(2).children('a').attr('href').replace(/.*f=([0-9]*)$/i,"$1"))
                    },
                    'title' : td.eq(3).children('div').children('a').text(),
                    'url' : root_url+td.eq(3).children('div').children('a').attr('href'),
                    'size' : td.eq(5).children('u').text(),
                    'dl' : root_url+td.eq(5).children('a').attr('href'),
                    'seeds' : td.eq(6).children('b').text(),
                    'leechs' : td.eq(7).children('b').text(),
                    //'down' : td.eq(8).text(),
                    'time' : td.eq(9).children('u').text()
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
                url: url,
                cache : false,
                data: {
                    'max' : 1,
                    'to' : 1,
                    'nm' : text
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
        login_url : login_url,
        name : name,
        icon : icon,
        about : about,
        url : root_url,
        filename : filename,
        flags : flags
    }
}();
if ('compression' in window == false || window.compression == 0) {
    engine.ModuleLoaded(tmp_num);
}
}(torrent_lib.length));