var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'isoHunt';
    var filename = 'isohunt';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAQAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD39vX28e/5+fUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACkim2EWjTazb0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACkimdmMwDBq5oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQv6qymH4AAACulH1mMwCpi3EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD08O16UCaAXDPs5N/Mu6xmMwCgfl8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD7+viadFNzRRPl3tjn39dyRBaJYz4AAAAAAAAAAAC7qJaQbUvfzsYAAAAAAAAAAAAAAAC1m4ZmMwDGs57p4tqFXjh9VCXo4dgAAAAAAADZyrx1SByMbEUAAAAAAAAAAAAAAADJvKtsPQujh2n7+/qUd1dmMwB1Rxl3SRx3SRx1RxlmNAGKZj/l2NMAAAAAAAAAAADk1c5wQBGNZ0H18O2niGNmMwBtPA52SRx2SRx2SRxtPQxoNQPl2tQAAAAAAAAAAADz8eyHXz9xQxXt6OTMvrNpNwW1mYQAAAAAAAAAAACxloNmMwC6p40AAAAAAAAAAAAAAACjgGJsOgrTx7Xs49uFXjeXdlXv6uMAAAAAAADXzb9sPAujgWYAAAAAAAAAAAAAAAC/rZlmNAG4n4gAAAAAAAAAAAAAAAAAAAAAAADn39d3TCGDWS7PwbQAAAAAAAAAAADx7ei6pI7Yyr0AAAAAAAAAAAAAAAAAAAAAAAAAAACJZD9rOgrIs54AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADGsZxmMwCkjnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADSwLdtPQqDWjL08vAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADy7uju6eQAAADx/wAA8f8AAPH/AACR/wAAAf8AAAHHAACAxwAAgAMAAIADAACA4wAAwGMAAMfhAADH8QAA//EAAP/wAAD/+QAA';
    var url = 'http://isohunt.com/torrents/';
    var root_url = 'http://isohunt.com';
    var about = 'Bit Torrent search engine, with an awesome P2P community sharing comments and ratings in discovering new media.';
    var flags = {
        a : 0,
        l : 0,
        rs: 1
    }
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            return ((/anime/i).test(f))?7:
                ((/audio/i).test(f))?1:
                ((/music/i).test(f))?1:
                ((/game/i).test(f))?2:
                ((/video/i).test(f))?3:
                ((/movies/i).test(f))?3:
                ((/Comics/i).test(f))?5:
                ((/Books/i).test(f))?5:
                ((/Applications/i).test(f))?6:
                ((/Apps/i).test(f))?6:
                ((/tv/i).test(f))?0:
                -1;
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
            var type = t.replace(/([0-9\.])*([a-z])*/,'$2');
            var time = parseFloat(t.replace(type,''));
            var nowTime = Math.round(new Date().getTime() / 1000);
            if (type == 's')
                return Math.round(nowTime-time);
            else
            if (type == 'm')
                return Math.round(nowTime-time*60);
            if (type == 'h')
                return Math.round(nowTime-time*60*60);
            if (type == 'd')
                return Math.round(nowTime-time*60*60*24);
            if (type == 'w')
                return Math.round(nowTime-time*60*60*24*7);
            return 0;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c);//.contents();
            t = t.find('#serps').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 1;i<l-1;i++) {
                var td = t.eq(i).children('td');
                if (td.children('table').length != 0) continue;
                var url = td.eq(2).children('a').eq(1).attr('href');
                if (!(/http/).test(url))
                    url = root_url+url;
                td.eq(1).children('a').remove();
                var ss = td.eq(4).text();
                var sl = td.eq(4).text();
                if (ss.length == 0) ss = 0;
                if (sl.length == 0) sl = 0;
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(0).text(),
                        'id': calculateCategory(td.eq(0).text())
                    },
                    'title' : td.eq(2).children('a').eq(1).text(),
                    'url' : url,
                    'size' : calculateSize(td.eq(3).text()),
                    'seeds' : ss,
                    'leechs' : sl,
                    'time' : calculateTime($.trim(td.eq(1).text()))
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
                    'ihq' : text
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
        about : about,
        url : root_url,
        filename : filename,
        flags : flags
    }
}();
engine.ModuleLoaded(tmp_num);