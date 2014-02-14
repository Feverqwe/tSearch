torrent_lib['fast-torrent'] = function () {
    var name = 'Fast-Torrent';
    var filename = 'fast-torrent';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////////////////////+/v7///////8AAAEAAAEAAAAAAAAAAAAAAAAAAAAFAAD///X///L///L///T///z///////////8AAAEAAAEAAAAAAAAAAAD///////8OAgD//+KgcECgb0H//+P///X///////////8AAAD////9//8AAAAAAAD///////8TAwD//9izczOzcjX//9n///L///////////8AAAD////9//8AAAAAAAAAAAAAAAAUBAD//9izczOzcjX//9n///L///////////8AAAAAAAAAAAAAAAAAAAABAQEAAAATAwD//9i3czK6cy///9H//+f///X///z///8AAAAAAAAAAAAAAAAAAAD///////8TAwD//9i6cy/IdiX//8D//9H//+L///X///8AAAD///////8AAAAAAAD///////8TAwD//9e+dCzRdiHRdx++cy6gcED///L///8AAAD///////8AAAAAAAAAAAAAAAETAwD//9i+dCzRdiHSeCC/dC+gcED///L///8AAAAAAAAAAAAAAAAAAAAAAAAAAAEUBAD//9i6cy/KdSX//8D//9H//+L///X///8AAAAAAAAAAAAAAAAAAAD9//////8TAwD//9i1czK7dDD//9H//+f///X//vv///8AAAD///////8AAAAAAAD9///+/v4TAwD//9m5czDBdSn//8j//9z//+n///D///QFAAD///////8AAAAAAAAAAAAAAAETAwD//9nBdCveeRfoehDedxbMdiSwcTf//+IOAgAAAAAAAAAAAAAAAAAAAAAAAAEOAgD//+OucjfKdiTaeBraeBrMdiSwcjb//+IOAgAAAAAAAAAAAAACAAD///////8EAQD///X//+///+n//+b//+b//+n//+7///QEAQD9//////8AAAACAAD///////8AAAD9///9//////////////////////7///4AAAD9//////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    var url = 'http://fast-torrent.ru/search/';
    var root_url = 'http://fast-torrent.ru';
    var about = 'Сайт содержит каталог фильмов, сериалов, мультфильмов и аниме.';
    var flags = {
        a: 0,
        l: 1,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('div.film-list').children('div');
            var l = t.length;
            var arr = [];
            for (var i = 0; i < l; i++) {
                var item = t.eq(i).children('div.film-wrap');
                var title = item.children('h2').text();
                var category = item.children('div.film-genre').children('div').eq(0).text();
                var link = root_url+item.children('div.film-image').children('a').attr('href');
                var time = ex_kit.format_date(1, item.children('div.film-foot').children('em').eq(2).text().replace(/.*: /,''));
                arr[arr.length] = {
                    category: {
                        title: category,
                        id: -1
                    },
                    title: title,
                    url: link,
                    size: 0,
                    seeds: 1,
                    leechs: 0,
                    time: time
                }
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr != null)
                xhr.abort();
            xhr = $.ajax({
                type: 'GET',
                url: url + text + '/1.html',
                cache: false,
                success: function (data) {
                    view.result(filename, readCode(data), t);
                },
                error: function () {
                    view.loadingStatus(2, filename);
                }
            });
        };
        return {
            getPage: function (a) {
                return loadPage(a);
            }
        }
    }();
    var find = function (text) {
        return web.getPage(text);
    };
    return {
        find: function (a) {
            return find(a);
        },
        stop: function(){
            if (xhr !== undefined) {
                xhr.abort();
            }
            //view.loadingStatus(1, filename);
        },
        name: name,
        icon: icon,
        about: about,
        url: root_url,
        filename: filename,
        flags: flags,
        tests: [0, 0, 1, 0, 0, 1, 0, 0, 0]
    }
}();