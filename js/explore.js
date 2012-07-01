var explore = function () {
    var xhr = null;
    var xhr_g = null;
    var xhr_s = null;
    var sesizeimg = function (i) {
        i = i.replace('/sm_film/','/film/');
        return i;
    }
    var makeimg = function (i) {
        i = i.replace(/(.*)\/film\/([0-9]*)\//,'http://st.kinopoisk.ru/images/film/$2.jpg');
        return i;
    }
    var readAfisha = function (c) {
        var root_url = 'http://www.kinopoisk.ru/';
        c = view.contentFilter(c);
        var t = $(c).find('div.filmsListNew').children('div.item');
        t.find('div.threeD').remove();
        var l = t.length;
        var arr = [];
        var i = 0;
        for (i = 0;i<l;i++) {
            var item = t.eq(i).children('div');
            arr[arr.length] = {
                'img' : sesizeimg(item.eq(0).children('a').children('img').attr('src')),
                'name' : item.eq(1).children('div.name').children('a').text(),
                'url' : root_url+item.eq(1).children('div.name').children('a').attr('href')
            }
        }
        return arr;
    }
    var readSerials = function (c) {
        var root_url = 'http://www.kinopoisk.ru/';
        c = view.contentFilter(c);
        var t = $(c).find('#top250_place_1').parent().children('tr');
        var l = t.length;
        var arr = [];
        var i = 0;
        for (i = 1;i<l;i++) {
            var item = t.eq(i).children('td');
            arr[arr.length] = {
                'img' : makeimg(item.eq(1).children('a').attr('href')),
                'name' : item.eq(1).children('a').text().replace(/\(([0-9]*)\)$/,''),
                'url' : root_url+item.eq(1).children('a').attr('href')
            }
        }
        return arr;
    }
    var readGames = function (c) {
        var root_url = 'http://www.gamespot.com/';
        c = view.contentFilter(c);
        var t = $(c).find('ul.games').children('li');
        var l = t.length;
        var arr = [];
        var i = 0;
        for (i = 0;i<l;i++) {
            var item = t.eq(i).children('div').children('div');
            arr[arr.length] = {
                'img' : item.eq(1).children('a').children('img').attr('src'),
                'name' : item.eq(0).children('h3').children('a').text(),
                'url' : root_url+item.eq(0).children('h3').children('a').attr('href')
            }
        }
        return arr;
    }
    var load_serials = function () {
        if ( $('div.explore div.serials').length > 0) return;
        var url = 'http://www.kinopoisk.ru/level/20/serial/list/';
        if (xhr_s != null)
            xhr_s.abort();
        xhr_s = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                show_serials(readSerials(data));
            },
            error:function (xhr, ajaxOptions, thrownError){
                
            }
        });
    }
    var load_afisha = function () {
        if ( $('div.explore div.films').length > 0) return;
        var url = 'http://www.kinopoisk.ru/level/8/view/main/';
        if (xhr != null)
            xhr.abort();
        xhr = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                show_afisha(readAfisha(data));
            },
            error:function (xhr, ajaxOptions, thrownError){
                
            }
        });
    }
    var load_games = function () {
        if ( $('div.explore div.game').length > 0) return;
        var url = 'http://www.gamespot.com/games.html?platform=5&type=top_rated&mode=top&sort=score&dlx_type=all&date_filter=6&sortdir=asc&official=all';
        if (xhr_g != null)
            xhr_g.abort();
        xhr_g = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                show_games(readGames(data));
            },
            error:function (xhr, ajaxOptions, thrownError){
                
            }
        });
    }
    var movebleCalculate = function (a) {
        var tmp_size = a.length*7;
        var st = '';
        if (tmp_size > 140) {
            if (tmp_size < 150)
                st = 'moveble150';
            else if (tmp_size < 200)
                st = 'moveble200';
            else if (tmp_size < 250)
                st = 'moveble250';
            else if (tmp_size < 300)
                st = 'moveble300';
            else if (tmp_size < 350)
                st = 'moveble350';
            else if (tmp_size < 400)
                st = 'moveble400';
            else if (tmp_size < 450)
                st = 'moveble450';
            else if (tmp_size < 500)
                st = 'moveble500';
            else if (tmp_size < 550)
                st = 'moveble550';
            else if (tmp_size > 550)
                st = 'moveble600';
        }
        return ' '+st;
    }
    var show_games = function (content) {
        var c = '<div class="game"><h2>Игры</h2>';
        $.each(content, function (k,v) {
            c += '<div class="poster"><div class="image"><img src="'+v.img+'"/></div><div class="title'+movebleCalculate(v.name)+'">'+v.name+'</div></div>';
        });
        c += '</div>';
        $('div.explore').append(view.contentUnFilter(c));
        $('div.explore div.game').children('div.poster').click(function () {
            var s = $(this).children('div.title').text();
            view.triggerSearch(s);
        });
    }
    var show_afisha = function (content) {
        var c = '<div class="films"><h2>Фильмы</h2>';
        $.each(content, function (k,v) {
            c += '<div class="poster"><div class="image"><img src="'+v.img+'"/></div><div class="title'+movebleCalculate(v.name)+'">'+v.name+'</div></div>';
        });
        c += '</div>';
        $('div.explore').prepend(view.contentUnFilter(c));
        $('div.explore div.films').children('div.poster').click(function () {
            var s = $(this).children('div.title').text();
            view.triggerSearch(s);
        });
    }
    var show_serials = function (content) {
        var c = '<div class="serials"><h2>Сериалы</h2>';
        $.each(content, function (k,v) {
            c += '<div class="poster"><div class="image"><img src="'+v.img+'"/></div><div class="title'+movebleCalculate(v.name)+'">'+v.name+'</div></div>';
        });
        c += '</div>';
        if ($('div.explore div.game').length > 0)
            $('div.explore div.game').before(view.contentUnFilter(c));
        else
        if ($('div.explore div.films').length > 0)
            $('div.explore div.films').after(view.contentUnFilter(c));
        else
            $('div.explore').prepend(view.contentUnFilter(c));
        $('div.explore div.serials').children('div.poster').click(function () {
            var s = $(this).children('div.title').text();
            view.triggerSearch(s);
        });
    }
    var load_all = function () {
        load_afisha();
        load_serials();
        load_games();
    }
    return {
        getLoad : function () {
            return load_all();
        }
    }
}();