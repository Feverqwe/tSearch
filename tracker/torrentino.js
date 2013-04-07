var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'Torrentino';
    var filename = 'torrentino';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAAAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAD///8B////Af///wEAAAADAAAADQAAABUAAAAbAAAAHwAAABsAAAAVAAAADQAAAAX///8B////Af///wH///8B////AQAAAAMAAAATAAAAKQAAAD0AAABNAAAAWQAAAF0BBBZjAQYkXQIHKE8AAg4zAAAAGQAABAf///8B////Af///wEAAAARAAAALQAAAEcAAABhAAAAeQAAAo8AAACXDRqV3w8cpfsWJMb7ChVuewAAAC8BAxEdAAAAA////wH///8BAAAADwAAACkAAABDAAAAWwAAAHMAAASHAAAAiw4bmeERHKn/GSfT/w0YfX8AAAArAgUbGf///wH///8B////Af///wEAAAALAAAAHwABADEBBwBBAAADRwAAAEUMGIbPER6w/xkn1f8QH55jAAAAAxIgpQP///8B////Af///wH///8B////Af///wEUdAADBQqkCQcbdSUACzEVECC1xRAbpP8YJs7/FirYW////wEQJscTCSKyA////wH///8B////Af///wH///8BNf8ABx6tMl8RIM3LFSXI7xQjx/cQG6T/FyPC/xoozescK9zzFinQl////wH///8B////Af///wEp2h0D////ASjNG5EiyQz/GYNWqxQZ1O0VJcL/ER2v/xYiuv0cKMr/GCfG0RIs4hP///8B////Af///wEs1BwD////AS/ZG3Uq2xv/IcAW/yHLBvEZcXarExjO9xMju/8aJ9j/Gyze4wwgqiH///8B////Af///wElsxcD////ASmyFVUqzhz/KNIb/x+3Ev8gvxb/I9QK4xROlKcSF8f/FyjO8xInzjf///8BFinSA////wH///8B////ATLKF0Mt2h37KMkb/yTAGP8cpBD/IL0U/yLHF/8i0AzbEz6lsxAa1FH///8BEx/IA////wH///8B////Af///wEyxxc7MNQaUzPYGmcq2Bv5HKYR/yG9E/MmxhVhI8YVYSbaCSX///8BHnh4A////wH///8B////Af///wH///8B////Af///wE1vxUbK9cb8x+4E/8bmg/rLrATEf///wH///8B////Af///wH///8B////Af///wH///8B////ATLJFwP///8BNMIWHSvZG/EethP/HKIP6TG+FBP///8BJbsXA////wH///8B////Af///wH///8B////Af///wH///8B////ATa9FBkr2BvxHasS/yG4Eus70xYR////Af///wH///8B////Af///wH///8B////Af///wH///8B////Af///wE2txMJL80XXSe2EmknrxFfPNIVB////wH///8B////Af///wH///8B////Af///wH///8BAAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//w%3D%3D';
    var url = 'http://www.torrentino.com/search';
    var root_url = 'http://www.torrentino.com';
    var about = 'Торрент трекер (torrent tracker) ТОРРЕНТИНО - скачать торрент (torrent) скачать фильмы бесплатно (movie film) без регистрации фильмы, сериалы, музыку, софт.';
    var flags = {
        a : 0,
        l : 1,
        rs: 1
    }
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            return ((/спорт/i).test(f))?9:
                ((/аним/i).test(f))?7:
                ((/мультф/i).test(f))?4:
                ((/мультс/i).test(f))?4:
                ((/книг/i).test(f))?5:
                ((/Журнал/i).test(f))?5:
                ((/музыка/i).test(f))?1:
                ((/докум/i).test(f))?8:
                ((/телепередачи/i).test(f))?8:
                ((/телешоу/i).test(f))?8:
                ((/ТВ/).test(f))?8:
                ((/игры/i).test(f))?2:
                ((/аркады/i).test(f))?2:
                ((/сериал/i).test(f))?0:
                ((/фильм/i).test(f))?3:
                ((/софт/i).test(f))?6:
                ((/программ/i).test(f))?6:
                -1;
        }
        var calculateSize = function (s) {
            var type = '';
            var size = s.replace(' ','');
            var t = size.replace('КБ','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024);
            }
            var t = size.replace('МБ','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024);
            }
            var t = size.replace('ГБ','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024);
            }
            var t = size.replace('ТБ','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024*1024);
            }
            return 0;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = view.load_in_sandbox(id,c);
            t = t.find('ol.items').children('li.item');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var div = t.eq(i).children('div').children('div.torrent-holder');
                arr[arr.length] = {
                    'category' : {
                        'title' : div.children('div.title').children('p.tags').text(),
                        'id': calculateCategory(div.children('div.title').children('p.tags').text())
                    },
                    'title' : div.children('div.title').children('h4').children('a').text(),
                    'url' : div.children('div.title').children('h4').children('a').attr('href'),
                    'size' : calculateSize(div.children('div.data').children('p.size').text()),
                    'seeds' : div.children('div.data').children('p.peers-info').children('span.s').text(),
                    'leechs' : div.children('div.data').children('p.peers-info').children('span.l').text(),
                    'time' : 0
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
                    'order' : 'date'
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
        name : name,
        icon : icon,
        about : about,
        url : root_url,
        filename : filename,
        flags : flags
    }
}();
engine.ModuleLoaded(tmp_num);