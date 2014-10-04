torrent_lib.kaztorka = function () {
    var name = 'Kaztorka.org';
    var filename = 'kaztorka';
    var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuM4zml1AAAAJ+SURBVDhPjdBfTFJRHAfw8+Dmlg+25kMrbcncys0Hqq2NrbbWWlvrqZfe2kyNJkYoA122nJipSVvmLNNY8VBk/hcFrgh4BPwT/kFR4CIgcVWcV73ShYvoUweuS3tr++zsfL+/33k5oMLqK4OeQ2OJUwTx44SjR0RwGZSbl0sMTkQCcd0KOegnhUYX2/wlnw5IoBtdxNADJNBTPLyEfJgL7u0f7Mb22ch6OuI0EzvxgwONn0SxzOQGYiPO1zqQdjsR3YsTYYavWUDxsdYhMbjcW3Q0vt/hDKGIStGIC5TqXUXqeUQxF6RjcbRROGBH8cUovhpmKGav2bZSmFxAhMNOINQ583vnEKU9GI7GZtap/J7ZRqt3K8KQNFMLPeyUVaJZBDeVk9fbzHe+TCimAxQdNfk3Gy3ebZohqIhUt3RfZbv39edd5eQthZXXOnbtkxXw2iycOoxTj72G+Bq54w1tE5s7doLkvYeozK7DsuuxxELSlRYIrraMZVVrsmQaudGJB9ZYECfOv9Qm+n9x35rA5SZ4+rkaaTHjPmJjaCHgDm74VzcE3bNsf1ye3AC4b4wZ0v4MaV/7+PKvEFmjc4j77cEQuURs5si0ydGRi3V6kNdgSBf1IIoJ3zpJVWsXT4l7+xbQE+rjuDe9NDE6PEU9OTIM5Nbq0wRdaYLOz5N+kvpdqXaklXRlVgxMBcitXbrV6rvRNFr0zdZs8Z0QdGZXacEFGZbK70h91NE9v0rRjNzgTuX/QM5KBzrtxG4kFonG0Bc/UE6hnXOVQyCnSpdSoEp5qLr9DharZi7VYCkF3xNNsuQ8G+Q1GE4+6UZ31GRWqAG30XSmXP2fcl/p/wCFdNpHKe4MYgAAAABJRU5ErkJggg==';
    var login_url = 'http://kaztorka.org/auth/login';
    var url = 'http://kaztorka.org/search';
    var root_url = 'http://kaztorka.org/';
    var about = 'Самый большой казахстанский трекер';
    var flags = {
        a: 1,
        l: 1,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var _rn = /[\r\n]+/g;
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            if (t.find('#loginForm #username').length) {
                view.auth(0, filename);
                return [];
            } else {
                view.auth(1, filename);
            }
            t = t.find('#searchTable>tbody>tr');
            var arr = [];
            for (var i = 1, len = t.length; i < len; i++) {
                var item = t.eq(i);
                var data = {
                    category: {
                        id: -1
                    }
                };
                var link = item.find('td.lista.cName>a');
                data.title = link.text();
                data.url = link.attr('href');
                var cLink = item.find('td.lista.center.cCat>a');
                data.category.title = cLink.text();
                data.category.url = cLink.attr('href');
                data.size = item.find('td.lista.center:eq(5)').text();
                if (data.size) {
                    data.size = data.size.replace(_rn, ' ');
                    data.size = ex_kit.format_size(data.size);
                }
                data.dl = item.find('td.lista.center:eq(2)>a').attr('href');
                data.seeds = item.find('td.lista.center:eq(6)>font').text();
                data.leechs = item.find('td.lista.center:eq(7)>font').text();
                data.time = item.find('td.lista.center:eq(3)').text();
                if (data.time) {
                    data.time = data.time.replace(_rn, ' ');
                    data.time = ex_kit.month_replace(data.time);
                    data.time = ex_kit.format_date(0, data.time);
                }

                arr.push(data);
            }
            return arr;
        };
        var loadPage = function (text, cb) {
            if (xhr !== undefined)
                xhr.abort();
            xhr = engine.ajax({
                tracker: filename,
                type: 'POST',
                url: url,
                cache: false,
                data: {
                    torrentName: text
                },
                success: function (data) {
                    cb(1, readCode(data));
                },
                error: function () {
                    cb(2, 2);
                }
            });
        };
        return {
            getPage: loadPage
        };
    }();
    return {
        find: web.getPage,
        stop: function(){
            if (xhr !== undefined) {
                xhr.abort();
            }
            //view.loadingStatus(1, filename);
        },
        login_url: login_url,
        name: name,
        icon: icon,
        about: about,
        url: root_url,
        filename: filename,
        flags: flags,
        tests: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
}();