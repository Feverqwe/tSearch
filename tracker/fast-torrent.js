var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'Fast-Torrent';
    var filename = 'fast-torrent';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////////////////////+/v7///////8AAAEAAAEAAAAAAAAAAAAAAAAAAAAFAAD///X///L///L///T///z///////////8AAAEAAAEAAAAAAAAAAAD///////8OAgD//+KgcECgb0H//+P///X///////////8AAAD////9//8AAAAAAAD///////8TAwD//9izczOzcjX//9n///L///////////8AAAD////9//8AAAAAAAAAAAAAAAAUBAD//9izczOzcjX//9n///L///////////8AAAAAAAAAAAAAAAAAAAABAQEAAAATAwD//9i3czK6cy///9H//+f///X///z///8AAAAAAAAAAAAAAAAAAAD///////8TAwD//9i6cy/IdiX//8D//9H//+L///X///8AAAD///////8AAAAAAAD///////8TAwD//9e+dCzRdiHRdx++cy6gcED///L///8AAAD///////8AAAAAAAAAAAAAAAETAwD//9i+dCzRdiHSeCC/dC+gcED///L///8AAAAAAAAAAAAAAAAAAAAAAAAAAAEUBAD//9i6cy/KdSX//8D//9H//+L///X///8AAAAAAAAAAAAAAAAAAAD9//////8TAwD//9i1czK7dDD//9H//+f///X//vv///8AAAD///////8AAAAAAAD9///+/v4TAwD//9m5czDBdSn//8j//9z//+n///D///QFAAD///////8AAAAAAAAAAAAAAAETAwD//9nBdCveeRfoehDedxbMdiSwcTf//+IOAgAAAAAAAAAAAAAAAAAAAAAAAAEOAgD//+OucjfKdiTaeBraeBrMdiSwcjb//+IOAgAAAAAAAAAAAAACAAD///////8EAQD///X//+///+n//+b//+b//+n//+7///QEAQD9//////8AAAACAAD///////8AAAD9///9//////////////////////7///4AAAD9//////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    var url = 'http://fast-torrent.ru/search/';
    var root_url = 'http://fast-torrent.ru';
    var about = 'Сайт содержит каталог фильмов, сериалов, мультфильмов и аниме.';
    var flags = {
        a : 0,
        l : 1,
        rs: 1
    }
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var c = f.length;
            var url = '';
            for (var i=0;i<c;i++)
                url += $(f[i]).attr('href');
            return ((/sex/).test(url))?10:
                ((/anime/).test(url))?7:
                ((/videoklipy/).test(url))?1:
                ((/koncertnoe/).test(url))?1:
                ((/documental/).test(url))?8:
                ((/dokumental/).test(url))?8:
                ((/multfilm/).test(url))?4:
                ((/multserialy/).test(url))?4:
                ((/tv/).test(url))?0:
                ((/film/).test(url))?3:
                ((/art-haus/).test(url))?3:
                ((/biography/).test(url))?3:
                ((/action/).test(url))?3:
                ((/boevye/).test(url))?3:
                ((/western/).test(url))?3:
                ((/voenniy/).test(url))?3:
                ((/detective/).test(url))?3:
                ((/detskiy/).test(url))?3:
                ((/drama/).test(url))?3:
                ((/history/).test(url))?3:
                ((/katastrofa/).test(url))?3:
                ((/short/).test(url))?3:
                ((/comedy/).test(url))?3:
                ((/criminal/).test(url))?3:
                ((/melodrama/).test(url))?3:
                ((/mystic/).test(url))?3:
                ((/nemoe/).test(url))?3:
                ((/noir/).test(url))?3:
                ((/parody/).test(url))?3:
                ((/adventure/).test(url))?3:
                ((/roman/).test(url))?3:
                ((/triller/).test(url))?3:
                ((/russian/).test(url))?3:
                ((/family/).test(url))?3:
                ((/skazka/).test(url))?3:
                ((/soviet/).test(url))?3:
                ((/horror/).test(url))?3:
                ((/adventure/).test(url))?3:
                ((/spektakl/).test(url))?3:
                ((/sport/).test(url))?9:
                ((/triller/).test(url))?3:
                ((/fantasy/).test(url))?3:
                ((/vampiryi/).test(url))?3:
                ((/vidovoj/).test(url))?3:
                ((/vojna/).test(url))?3:
                ((/gipotezy/).test(url))?3:
                ((/dopolnitelnye/).test(url))?3:
                ((/channel/).test(url))?8:
                ((/music/).test(url))?1:
                -1;
        }
        var calculateTime = function (f) {
            var dd = f.split('.');
            return Math.round(new Date(parseInt(dd[2]),parseInt(dd[1])-1,parseInt(dd[0])).getTime() / 1000);
        }
        var calculateQuality = function (t) {
            if (t == undefined) return '';
            t = t.replace(/qa-.* qa-([A-Za-z0-9\-]*) use.*/,' $1');
            return t;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = view.load_in_sandbox(id,c);
            t = t.find('table.list').children('tbody').children('tr[height="1%"]');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td2 = t.eq(i).children('td');
                var td1 = t.eq(i).prev().children('td');
                if (td1.eq(1).children('h2').text().length == 0) continue;
                arr[arr.length] = {
                    'category' : {
                        'title' : td1.eq(1).children('div[class="genre_list"]').text(),
                        'id': calculateCategory(td1.eq(1).children('div[class="genre_list"]').children('a'))
                    },
                    'title' : td1.eq(1).children('h2').text()+calculateQuality(td1.eq(1).children('div.film_controll').children('em.qa-icon').attr('class')),
                    'url' : root_url+td2.eq(2).children('a').attr('href'),
                    'size' : 0,
                    'seeds' : 1,
                    'leechs' : 0,//$.trim(td2.eq(1).text().replace('Скачали:','')),
                    'time' : calculateTime($.trim(td2.eq(0).text().split(':')[2]))
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
                url: url+text+'/50/1.html',
                cache : false,
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