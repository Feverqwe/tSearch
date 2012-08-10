var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'BitSnoop';
    var filename = 'bitsnoop';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAAN5SQADG6tQA0pKAAM6ikADt4dgAuy8UAMrWwADWgmwA8c3EAO3d1ADKvqwAwwLoAM6qlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGBgYGBgYGBgYGBgYAAAAGBgYGBgYGBgYGBgYGBgAGBgYGBgYGBgYGBgYGBgYGBgYGBgwBCQkJCQEMBgYGBgYGBgwFCQkJCQkJBQwGBgYGBgYBCQkFDQgKCQkBBgYGBgYGCQkJAwIJCQkJCQYGBgYGBgkJCQcCCQkJCQkGBgYGBgYJCQkHBgIECQkJBgYGBgYGCQkJAwYGAwkJCQYGBgYGBgEJCQULCwUJCQEGBgYGBgYMBQkJCQkJCQUMBgYGBgYGBgwBCQkJCQEMBgYGBgYGBgYGBgYGBgYGBgYGBgYABgYGBgYGBgYGBgYGBgYAAAAGBgYGBgYGBgYGBgYAAMADAACAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAMADAAA%3D';
    var url = 'http://bitsnoop.com/search';
    var root_url = 'http://bitsnoop.com/';
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            return -1;
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
            /* Спорт */[],
            /* XXX */[]
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
        var calculateTime = function (t) {
            if ($.trim(t.substr(0, 1)) == '') return 0;
            if ((/today/).test(t)) {
                
            } else
            if ((/yesterday/).test(t)) {
                
            } else
            if ((/ old/).test(t)) {
                var time = parseInt(t.replace(/([0-9]*).*/,'$1'));
                var nowTime = Math.round(new Date().getTime() / 1000);
                if ((/second/).test(t)) {
                    return nowTime - t;
                    
                } else
                if ((/minute/).test(t)) {
                    return nowTime - t*60;
                } else
                if ((/hour/).test(t)) {
                    return nowTime - t*60*60;
                } else
                if ((/day/).test(t)) {
                
                } else
                if ((/week/).test(t)) {
                
                } else
                if ((/month/).test(t)) {
                
                } else
                if ((/year/).test(t)) {
                
                }
            }
            console.log('"'+t+'"')
            return 0;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c);//.contents();
            t = t.find('#torrents').children('li');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var li = t.eq(i);
                li.children('div[id=sz]').find('td').eq(0).children('div.nfiles').remove();
                arr[arr.length] = {
                    'category' : {
                        'title' : li.children('span.icon').attr('title'),//td.eq(2).children('a').text(), 
                        //'url': root_url+td.eq(2).children('a').attr('href'),
                        'id': calculateCategory(li.children('span.icon').attr('class').replace(/icon cat_(.*)/,'$1'))//calculateCategory(td.eq(2).children('a').attr('href').replace(/(.*)f=([0-9]*)/i,"$2"))
                    },
                    'title' : li.children('a').text(),//td.eq(3).children('div').children('a').text(),
                    'url' : root_url+li.children('a').attr('href'),//root_url+td.eq(3).children('div').children('a').attr('href'),
                    'size' : calculateSize(li.children('div[id=sz]').find('td').eq(0).text()),//td.eq(5).children('u').text(),
                    //'dl' : td.eq(5).children('a').attr('href'),
                    'seeds' : li.children('div.torInfo').children('span.seeders').text().replace(',',''),//td.eq(6).children('b').text(),
                    'leechs' : li.children('div.torInfo').children('span.leechers').text().replace(',',''),//td.eq(7).children('b').text(),
                    'time' : calculateTime(li.children('div.torInfo').text().replace(/.*— .* — (.*)/,'$1'))//td.eq(9).children('u').text()
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
                    'q' : text+' safe:no',
                    't' : 'all'
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