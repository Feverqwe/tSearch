var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'FreeTorrents';
    var filename = 'free-torrents';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEACABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAQAEAAAAAAAAAAAAAAAEAAAAAAADhkBUAHLUAAB+4AAAhugAA/cgxAB22AAAlvgAA6J4cAOmfHQD4viwAKsMAACS9AAD8xzAA5JUYAOWXGQDnnBsA/MUwAOSXGAD8xjAAE6wAAOKSFgApwgAAM8wAADHKAAAvyAAAILkAAOOUFwDrpB8AFK0AAOKTFgDlmBkA/8wzAACZAADMZgAAAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIiIiIiIhISEhISIiIiIiIiIiIiIhAA8PISIiIiIiIiIiIiIhABAHISIiIiIiIiIiIiIhAAwPISIiIiIiIiIiIiIhAAQPISIiIiIiIiIiIiIhAAQPISIgICAgICIiIiIiIiEeHwchIiADAwUgIiIiIiIiIQ4fFCEiIAMWBSAiIiIiIiIhER8aISIgAxYBICIiIiIiIiENDx0hIiADGAEgIiIiIiIiISEhISEiIAIYASAiIiIiIiIiIiIiIAMYGSAiIiIiIiIiIiIiIAMYAiAiIiIiIiIiIiIiIAMYAyAiIiIiIiIiIiIiIAMDAyAiIiIiIiIiIiIiICAgICAiIiIiIvg/AADwfwAA4P8AAMH/AACD/wAABB8AAIIPAADBBwAA4IMAAPBBAAD4IAAA/8EAAP+DAAD/BwAA/g8AAPwfAAA%3D';
    var login_url = 'http://login.free-torrents.org/forum/login.php';
    var url = 'http://tr.free-torrents.org/forum/tracker.php';
    var root_url = 'http://free-torrents.org/forum/';
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
            /* Сериалы */[],
            /* Музыка */[],
            /* Игры */[],
            /* Фильмы */[],
            /* Мультфтльмы */[],
            /* Книги */[],
            /* ПО */[],
            /* Анимэ */[],
            /* Док. и юмор */[],
            /* Спорт */[]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(f),groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c);//.contents();
            if (t.find('input[name=login_username]').html() != null) {
                view.auth(0,id);
                return [];
            } else 
                view.auth(1,id);
            t = t.find('#main_content_wrap').children('#tor-tbl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td = t.eq(i).children('td');
                if (td.eq(5).children('p').children('a').attr('href') == null) continue;
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(2).children('a').text(), 
                        'url': root_url+td.eq(2).children('a').attr('href'),
                        'id': calculateCategory(td.eq(2).children('a').attr('href').replace(/(.*)f=([0-9]*)\&.*/i,"$2"))
                    },
                    'title' : td.eq(3).children('a').text(),
                    'url' : root_url+td.eq(3).children('a').attr('href'),
                    'size' : td.eq(5).children('u').text(),
                    'dl' : td.eq(5).children('p').children('a').attr('href'),
                    'seeds' : td.eq(6).children('b').text(),
                    'leechs' : td.eq(7).children('b').text(),
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
        filename : filename
    }
}();
engine.ModuleLoaded(tmp_num);