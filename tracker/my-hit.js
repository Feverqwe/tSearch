//DISABLED!!!
//DISABLED!!!
//DISABLED!!!
//DISABLED!!!
//DISABLED!!!
//DISABLED!!!
(function () {
    num = torrent_lib.length;
    torrent_lib[num] = null;
    torrent_lib[num] = function() {
        var name = 'my-hit';
        var filename = 'my-hit';
        var id = null;
        var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAAAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAADAwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/wMDA/8DAwP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/wAAAP8AAAD/AAAA/8DAwP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP/AwMD/AAAA/wAAAP8AAAD/wMDA/8DAwP8AAAD/AAAA/wAAAP/AwMD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/wMDA/wAAAP8AAAD/AAAA/8DAwP/AwMD/AAAA/wAAAP8AAAD/wMDA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/8DAwP8AAAD/AAAA/wAAAP/AwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/8DAwP/AwMD/wMDA/4CAgP///////////4CAgP+AgID///////////+AgID/gICA////////////gICA/4CAgP///////////4CAgP8AAAD/AAAA////////////AAAA/wAAAP///////////wAAAP8AAAD///////////8AAAD/AAAA/8DAwP/AwMD/AAAA/wAAAP//////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDAwP///////////wAAAP8AAAD/wMDA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDAwP/AwMD/wMDA////////////AAAA/wAAAP/AwMD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwMDA/8DAwP/AwMD///////////8AAAD/AAAA/8DAwP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAwMD/wMDA/8DAwP//////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//AAAD/wAAwD8AAPwDAAD/wwAA//8%3D';
        var url = 'http://my-hit.ru/';
        var root_url = 'http://my-hit.ru';
        var about = 'Лучшие фильмы онлайн, скачать бесплатно.';
        var flags = {
            a: 1,
            l: 1,
            rs: 1
        }
        var xhr = null;
        var web = function() {
            var calculateTime = function(t) {
                var t = t.replace(/:/g, ' ').replace('янв', '1').replace('фев', '2').replace('мар', '3')
                        .replace('апр', '4').replace('май', '5').replace('июн', '6')
                        .replace('июл', '7').replace('авг', '8').replace('сен', '9')
                        .replace('окт', '10').replace('ноя', '11').replace('дек', '12');
                var dd = t.split(' ');
                return Math.round((new Date(parseInt(dd[2]), parseInt(dd[1]) - 1, parseInt(dd[0]), parseInt(dd[3]), parseInt(dd[4]))).getTime() / 1000);
            }
            var readCode = function(c) {
                c = view.contentFilter(c);
                var t = view.load_in_sandbox(id, c);
                t = t.find('img.thumb');
                var l = t.length;
                var arr = [];
                var i = 0;
                for (i = 0; i < l; i++) {
                    var title = t.eq(i).parents().eq(2).prev().find('a').text();
                    var url = t.eq(i).parents().eq(2).prev().find('a').attr('href');
                    var date = t.eq(i).parents().eq(2).next().children().text();
                    var tmp = date.split(':');
                    date = $.trim(tmp[5] + ':' + tmp[6]);
                    arr[arr.length] = {
                        'category': {
                            'id': 3
                        },
                        'title': title,
                        'url': root_url + url,
                        'size': 0,
                        'seeds': 1,
                        'leechs': 0,
                        'time': calculateTime(date)
                    }
                }
                return arr;
            }
            var loadPage = function(text) {
                var t = text;
                if (xhr != null)
                    xhr.abort();
                xhr = $.ajax({
                    type: 'GET',
                    url: url + 'index.php?module=search&func=view&result_orderby=score&result_order_asc=0&search_string=' + ex_kit.in_cp1251(text) + '&submit=',
                    cache: false,
                    success: function(data) {
                        view.result(id, readCode(data), t);
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
            name: name,
            icon: icon,
            about: about,
            url: root_url,
            filename: filename,
            flags: flags,
            tests: [0,0,0,0,0,0,0,0,0]
        }
    }();
    if (compression === 0) {
        engine.ModuleLoaded(num);
    }
})();