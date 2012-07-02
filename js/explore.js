var explore = function () {
    var AutoSetCategory = (localStorage.AutoSetCategory !== undefined) ? parseInt(localStorage.AutoSetCategory) : true;
    var xhr = null;
    var xhr_g = null;
    var xhr_s = null;
    var explorerCache = (localStorage.explorerCache !== undefined) ? JSON.parse(localStorage.explorerCache) : {
        games:null,
        films:null,
        serials:null
    };
    var sesizeimg = function (i) {
        i = i.replace('/sm_film/','/film/');
        return i;
    }
    var makeimg = function (i) {
        i = i.replace(/(.*)\/film\/([0-9]*)\//,'http://st.kinopoisk.ru/images/film/$2.jpg');
        return i;
    }
    var readFilms = function (c) {
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
                'url' : item.eq(1).children('div.name').children('a').attr('href')
            }
        }
        return arr;
    }
    var readSerials = function (c) {
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
                'url' : item.eq(1).children('a').attr('href')
            }
        }
        return arr;
    }
    var readGames = function (c) {
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
                'url' : item.eq(0).children('h3').children('a').attr('href')
            }
        }
        return arr;
    }
    var load_serials = function () {
        if ( $('div.explore div.serials').length > 0) return;
        var cache_arr = null;
        if (explorerCache.serials != null)
            if (explorerCache.serials.date != null && explorerCache.serials.date>Math.round((new Date()).getTime() / 1000)) {
                show_serials(explorerCache.serials.cache_arr);
                return;
            }
        var url = 'http://www.kinopoisk.ru/level/20/serial/list/';
        if (xhr_s != null)
            xhr_s.abort();
        xhr_s = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                var cotnt = readSerials(data);
                if (cache_arr == null) {
                    explorerCache.serials = {
                        date : Math.round((new Date()).getTime() / 1000)+24*60*60/2,
                        cache_arr : cotnt
                    };
                }
                localStorage.explorerCache = JSON.stringify(explorerCache);
                show_serials(cotnt);
            },
            error:function (xhr, ajaxOptions, thrownError){
                if (explorerCache.serials != null && explorerCache.serials.cache_arr != null)
                    show_serials(explorerCache.serials.cache_arr);
            }
        });
    }
    var load_films = function () {
        if ( $('div.explore div.films').length > 0) return;
        var cache_arr = null;
        if (explorerCache.films != null)
            if (explorerCache.films.date != null && explorerCache.films.date>Math.round((new Date()).getTime() / 1000)) {
                show_films(explorerCache.films.cache_arr);
                return;
            }
        var url = 'http://www.kinopoisk.ru/level/8/view/main/';
        if (xhr != null)
            xhr.abort();
        xhr = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                var cotnt = readFilms(data);
                if (cache_arr == null) {
                    explorerCache.films = {
                        date : Math.round((new Date()).getTime() / 1000)+24*60*60/2,
                        cache_arr : cotnt
                    };
                }
                localStorage.explorerCache = JSON.stringify(explorerCache);
                show_films(cotnt);
            },
            error:function (xhr, ajaxOptions, thrownError){
                if (explorerCache.films != null && explorerCache.films.cache_arr != null)
                    show_films(explorerCache.films.cache_arr);
            }
        });
    }
    var load_games = function () {
        if ( $('div.explore div.games').length > 0) return;
        var cache_arr = null;
        if (explorerCache.games != null)
            if (explorerCache.games.date != null && explorerCache.games.date>Math.round((new Date()).getTime() / 1000)) {
                show_games(explorerCache.games.cache_arr);
                return;
            }
        var url = 'http://www.gamespot.com/games.html?platform=5&type=top_rated&mode=top&sort=score&dlx_type=all&date_filter=6&sortdir=asc&official=all';
        if (xhr_g != null)
            xhr_g.abort();
        xhr_g = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                var cotnt = readGames(data);
                if (cache_arr == null) {
                    explorerCache.games = {
                        date : Math.round((new Date()).getTime() / 1000)+24*60*60/2,
                        cache_arr : cotnt
                    };
                }
                localStorage.explorerCache = JSON.stringify(explorerCache);
                show_games(cotnt);
            },
            error:function (xhr, ajaxOptions, thrownError){
                if (explorerCache.games != null && explorerCache.games.cache_arr != null)
                    show_games(explorerCache.games.cache_arr);
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
        var c = '<div class="games"><h2>Игры</h2>';
        $.each(content, function (k,v) {
            v.name = v.name.substr(3,(v.name).length-6);
            c += '<div class="poster"><div class="image"><img src="'+v.img+'" title="'+v.name+'"/></div><div><div class="title'+movebleCalculate(v.name)+'" title="'+v.name+'"><span>'+v.name+'</span></div><div class="info"><a href="'+v.url+'" target="blank">Подробнее</a></div></div></div>';
        });
        c += '</div>';
        $('div.explore').append(view.contentUnFilter(c));
        $('div.explore div.games').children('div.poster').find('img').click(function () {
            var s = $(this).parent().parent().find('div.title').children('span').text();
            triggerClick(s,2);
        });
        $('div.explore div.games').find('div.title').click(function () {
            var s = $(this).children('span').text();
            triggerClick(s,2);
        });
    }
    var show_films = function (content) {
        var root_url = 'http://www.kinopoisk.ru';
        var c = '<div class="films"><h2>Фильмы</h2>';
        $.each(content, function (k,v) {
            c += '<div class="poster"><div class="image"><img src="'+v.img+'" title="'+v.name+'"/></div><div><div class="title'+movebleCalculate(v.name)+'" title="'+v.name+'"><span>'+v.name+'</span></div><div class="info"><a href="'+root_url+v.url+'" target="blank">Подробнее</a></div></div></div>';
        });
        c += '</div>';
        $('div.explore').prepend(view.contentUnFilter(c));
        $('div.explore div.films').children('div.poster').find('img').click(function () {
            var s = $(this).parent().parent().find('div.title').children('span').text();
            triggerClick(s,3);
        });
        $('div.explore div.films').find('div.title').click(function () {
            var s = $(this).children('span').text();
            triggerClick(s,3);
        });
    }
    var show_serials = function (content) {
        var root_url = 'http://www.kinopoisk.ru';
        var c = '<div class="serials"><h2>Сериалы</h2>';
        $.each(content, function (k,v) {
            c += '<div class="poster"><div class="image"><img src="'+v.img+'" title="'+v.name+'"/></div><div><div class="title'+movebleCalculate(v.name)+'" title="'+v.name+'"><span>'+v.name+'</span></div><div class="info"><a href="'+root_url+v.url+'" target="blank">Подробнее</a></div></div></div>';
        });
        c += '</div>';
        if ($('div.explore div.games').length > 0)
            $('div.explore div.games').before(view.contentUnFilter(c));
        else
        if ($('div.explore div.films').length > 0)
            $('div.explore div.films').after(view.contentUnFilter(c));
        else
            $('div.explore').prepend(view.contentUnFilter(c));
        $('div.explore div.serials').children('div.poster').find('img').click(function () {
            var s = $(this).parent().parent().find('div.title').children('span').text();
            triggerClick(s,0);
        });
        $('div.explore div.serials').find('div.title').click(function () {
            var s = $(this).children('span').text();
            triggerClick(s,0);
        });
    }
    var triggerClick = function (s,c) {
        if (AutoSetCategory) {
            $('ul.categorys').children('li[data-id='+c+']').trigger('click');
            view.SetAutoMove(null);
        }
        view.triggerSearch(s);
    }
    var load_all = function () {
        load_films();
        load_serials();
        load_games();
    }
    return {
        getLoad : function () {
            return load_all();
        }
    }
}();