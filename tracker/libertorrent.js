torrent_lib.libertorrent = function () {
    var name = 'Книжный трекер';
    var filename = 'libertorrent';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAT/BAXmlZD///HDEg//BwP/AgnyBQj/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX3BwL2CQ3+8fPv+/2mTkfzAAD/Agj5BAj/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/AgKSEgf9///++v/43dPrBAD7BAbwBgj/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAXyAAH7lo7/7+v/2Nf//vHBKiP/BQLtCAT/BAX/BAX/BAX/BAX7BQX/BAX/BQb8BgbBFAz//+f038nvuqX/8Ob//+vJBwD9AAD/BAX/BAX/BAX/BAX/BAX/BAX4BwbyCgilYFbCNjWzCQfzBwf0DAj6BAT7AAD/AQT/BAX/BAX/BAX/BAX7BQX/BAT6AgLRFxHq//PBAgn//fHj+e28gIaSCA/QEBD9AAD/BAX/BAX/BAX/BAXyBwT7BgTJISDQj4f/8ur/5ej/5OLVAAmqBgCWIR7/v8Xp9/P5BQX9BQX/BAX/BAX/BAT/BAXmr6jx8/SlIyTc8eL/9PLx//7u9v//+fHSXUjfFAf0Cwn6Bgb/BAX/BAX5BwH/BAWtY1/z+Pfy9ur+pJm7CwqfMyjp2dLy/v75/v/0//XQKR73DAn/BQLtCAT/BQT/BQL6AAbRloP5/P//9//1+vn///G6XU7/CQ+/CwzRyL7l6M//Aw7/BAX7BgT/BAXyBwX9AgH/BwfWBgDjzcH/+Pvn////9P/y/v7/fYL/AAr/tKT6AAT/BAT0BwT/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/REL0++zu9PnBh4H/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX9Dgv/Bxfu8u3Stqv/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BAX/BATyBwTskYjyAQr/BAX/BAX/BAX/BAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    var login_url = 'http://booktracker.org/login.php';
    var url = 'http://booktracker.org/tracker.php';
    var root_url = 'http://booktracker.org/';
    var about = 'Книжный трекер (booktracker.org), рукописи не горят';
    /*
     * a = требует авторизации
     * l = русскоязычный или нет
     * rs= поддержка русского языка
     */
    var flags = {
        a: 1,
        l: 1,
        rs: 1
    };
    var xhr = undefined;
    var web = function () {
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            if (t.find('input[name="login_username"]').length) {
                view.auth(0, filename);
                return [];
            } else
                view.auth(1, filename);
            t = t.find('#main_content_wrap').children('table.forumline.tablesorter').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 0; i < l; i++) {
                var td = t.eq(i).children('td');
                if (td.eq(5).children('a').attr('href') === undefined) {
                    continue;
                }
                arr.push({
                    category: {
                        title: td.eq(2).children('a').text(),
                        url: root_url + td.eq(2).children('a').attr('href'),
                        id: 5
                    },
                    title: td.eq(3).children('a').text(),
                    url: root_url + td.eq(3).children('a').attr('href'),
                    size: td.eq(5).children('u').text(),
                    dl: root_url + td.eq(5).children('a').attr('href'),
                    seeds: td.eq(6).text(),
                    leechs: td.eq(7).text(),
                    time: td.eq(9).children('u').text()
                });
            }
            return arr;
        };
        var loadPage = function (text) {
            var t = text;
            if (xhr !== undefined)
                xhr.abort();
            xhr = $.ajax({
                type: 'POST',
                url: url,
                cache: false,
                data: {
                    max: 1,
                    to: 1,
                    nm: text
                },
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
        login_url: login_url,
        name: name,
        icon: icon,
        about: about,
        url: root_url,
        filename: filename,
        flags: flags,
        tests: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
}();