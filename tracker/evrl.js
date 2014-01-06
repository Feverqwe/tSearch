(function() {
    num = torrent_lib.length;
    torrent_lib[num] = null;
    torrent_lib[num] = function() {
        var name = 'Everall';
        var filename = 'evrl';
        var id = null;
        var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAABYVD1LX1pD/1hVQf9TUkH/TU4//0hLP/9FSD//QUc+/zg+Nv87QDX/PkM2/0JFNv9ISDj/TEw6/1NQO/9YVD1LaGBE/2FbQ/9aVkH/VFNB/05OP/9JTD7/Rkk9/0FGPP86QDb/PEE3/0BDOP9FRzj/Sko6/1FOOv9XUj3/Xlc+/2xiRf9kXUP/XFhC/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv9UUTz/WlU9/2JbP/9tYkX/Zl5D/5uBTv/y8vL/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/m4FO/15YPv9lXED/b2RG/2hfRP+bgU7/8vLy/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/8vLy/5uBTv9hWkD/aV5A/3BkRP9nX0P/m4FO//Ly8v+bgU7/Sko8/0VIO/9BRTv/PkI4/0JEOf9HSDr/m4FO/5uBTv+bgU7/YlpA/2xhQv9xZUX/Z19D/5uBTv/y8vL/m4FO/0pKPP9FSDv/QUU7/z9DOf9ERjn/SEk7/09OO/9VUj7/XVc//2ZdQv9vYkL/cWVF/2lfQv+bgU7/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/8vLy/5uBTv9mXUL/cGND/3BjQ/9mXUL/m4FO//Ly8v+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO//Ly8v+bgU7/aV9C/3FlRf9vYkL/Zl1C/5uBTv/y8vL/m4FO/0hJO/9ERjn/P0M5/0FFO/9FSDv/Sko8/5uBTv/y8vL/m4FO/2dfQ/9xZUX/bGFC/2JaQP+bgU7/8vLy/5uBTv9HSDr/QkQ5/z5COP9BRTv/RUg7/0pKPP+bgU7/8vLy/5uBTv9nX0P/cGRE/2leQP9hWkD/m4FO//Ly8v+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO//Ly8v+bgU7/aF9E/29kRv9lXED/Xlg+/5uBTv/y8vL/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/8vLy//Ly8v/y8vL/m4FO/2ZeQ/9tYkX/Yls//1pVPf9UUTz/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO/5uBTv+bgU7/m4FO/1xYQv9kXUP/bGJF/15XPv9XUj3/UU46/0pKOv9FRzj/QEM4/zxBN/86QDb/QUY8/0ZJPf9JTD7/Tk4//1RTQf9aVkH/YVtD/2hgRP9YVD1LU1A7/0xMOv9ISDj/QkU2/z5DNv87QDX/OD42/0FHPv9FSD//SEs//01OP/9TUkH/WFVB/19aQ/9YVD1LgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAA%3D%3D';
        var login_url = 'http://evrl.to/login/';
        var url = 'http://evrl.to/ts/';
        var root_url = 'http://evrl.to';
        var about = 'Здесь можно найти и пообсуждать кино, фильмы, сериалы, музыку, игры, программы, новинки, другие ключевые слова и множество всяких полезных штук. А можно и не.';
        var flags = {
            a: 1,
            l: 1,
            rs: 1
        };
        var xhr = null;
        var web = function() {
            var readCode = function(c) {
                c = view.contentFilter(c);
                var t = view.load_in_sandbox(id, c);
                var t2 = t.find('.feed-item');
                t = t.find(".ts-result");
                t = t.find('div');
                var l = t.length;
                var arr = [];
                var i = 0;
                for (i = 0; i < l; i++) {
                    var div = t.eq(i);
                    if (div.children('a').length !== 2 || div.children('a').eq(0).children('img').length !== 1) {
                        continue;
                    }
                    arr.push({
                        'category': {
                            'id': -1
                        },
                        'title': div.children('a').eq(1).text(),
                        'url': root_url + div.children('a').eq(1).attr('href'),
                        'size': 0,
                        'dl': null,
                        'seeds': 1,
                        'leechs': 0,
                        'time': 0
                    });
                }
                var l = t2.length;
                var i = 0;
                for (i = 0; i < l; i++) {
                    var div = t2.eq(i).children('div').children('div');
                    var categorys = '';
                    var info = div.children('div').eq(1).children('div').eq(0);
                    var cc = div.children('div').eq(0).find('a');
                    for (var f = 0; f < cc.length; cc++) {
                        categorys += ' ' + '<a href="' + root_url + cc.eq(i).attr('href') + '">' + cc.eq(i).text() + '</a>';
                    }
                    arr.push({
                        'category': {
                            'title': categorys,
                            'id': -1
                        },
                        'title': div.children('a').eq(0).text(),
                        'url': root_url + div.children('a').eq(0).attr('href'),
                        'size': ex_kit.format_size(info.children('div').eq(2).children('a').text().substr(8)),
                        'dl': root_url + info.children('div').eq(2).children('a').attr('href'),
                        'seeds': info.children('div').eq(0).children('span').text(),
                        'leechs': info.children('div').eq(1).children('span').text(),
                        'time': 0
                    });
                }
                return arr;
            }
            var loadPage = function(text) {
                var t = text;
                if (xhr != null)
                    xhr.abort();
                xhr = $.ajax({
                    type: 'POST',
                    contentType: 'application/json',
                    url: url + '?search="' + text + '"',
                    cache: false,
                    dataType: 'json',
                    data: JSON.stringify({
                        request: {
                            "url": "/ts/?search=\"" + text + "\"",
                            "method": "getContent"
                        }
                    }),
                    success: function(data) {
                        if (data.response !== undefined) {
                            view.auth(1, id);
                            view.result(id, readCode(data.response.content), t);
                        } else {
                            view.auth(0, id);
                            view.result(id, [], t);
                        }
                    },
                    error: function() {
                        view.loadingStatus(2, id);
                    }
                });
            }
            return {
                getPage: function(a) {
                    return loadPage(a);
                }
            }
        }();
        var find = function(text) {
            return web.getPage(text);
        }
        return {
            find: function(a) {
                return find(a);
            },
            setId: function(a) {
                id = a;
            },
            id: id,
            login_url: login_url,
            name: name,
            icon: icon,
            about: about,
            url: root_url,
            filename: filename,
            flags: flags,
            tests: [0,1,1,0,0,1,0,0,0]
        }
    }();
    if (compression === 0) {
        engine.ModuleLoaded(num);
    }
})();