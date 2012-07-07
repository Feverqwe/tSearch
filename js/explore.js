var explore = function () {
    var AutoSetCategory = (localStorage.AutoSetCategory !== undefined) ? parseInt(localStorage.AutoSetCategory) : true;
    var xhr = null;
    var xhr_g = null;
    var xhr_s = null;
    var xhr_tf = null;
    var explorerCache = (localStorage.explorerCache !== undefined) ? JSON.parse(localStorage.explorerCache) : {
        games:null,
        films:null,
        top_films:null,
        serials:null
    };
    var favoritesList = (localStorage.favoritesList !== undefined) ? JSON.parse(localStorage.favoritesList) : [];
    var listOptions = (localStorage.listOptions !== undefined) ? JSON.parse(localStorage.listOptions) : [{
        n:'favorites',
        s:1,
        size: 0
    },{
        n:'films',
        s:1,
        size: 0
    },{
        n:'top_films',
        s:1,
        size: 0
    },{
        n:'serials',
        s:1,
        size: 0
    },{
        n:'games',
        s:1,
        size: 0
    }];
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
                'name' : item.eq(1).children('a').text().replace(/ \(([0-9]*)\)$/,''),
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
    var readTopFilms = function (c) {
        c = view.contentFilter(c);
        var t = $(c).find('div.stat').children('div.el');
        var l = t.length;
        var arr = [];
        var i = 0;
        for (i = 0;i<l;i++) {
            var item = t.eq(i);
            arr[arr.length] = {
                'img' : makeimg(item.children('a').attr('href')),
                'name' : item.children('a').text(),
                'url' : item.children('a').attr('href')
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
    var load_top_films = function () {
        if ( $('div.explore div.top_films').length > 0) return;
        var cache_arr = null;
        if (explorerCache.top_films != null) {
            if (explorerCache.top_films.date != null && explorerCache.top_films.date>Math.round((new Date()).getTime() / 1000)) {
                show_top_films(explorerCache.top_films.cache_arr);
                return;
            }
        } else {
            explorerCache = {
                games:null,
                films:null,
                top_films:null,
                serials:null
            };
        }
        var today = new Date;
        var yr = today.getFullYear();
        var month = today.getMonth()+1;
        month = (month<10) ? '0'+String(month):month;
        var date = today.getDate();
        date = (date<10) ? '0'+String(date):date;
        var url = 'http://www.kinopoisk.ru/level/56/day/'+yr+'-'+month+'-'+date+'/';
        if (xhr_tf != null)
            xhr_tf.abort();
        xhr_tf = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                var cotnt = readTopFilms(data);
                if (cache_arr == null) {
                    explorerCache.top_films = {
                        date : Math.round((new Date()).getTime() / 1000)+24*60*60/2,
                        cache_arr : cotnt
                    };
                }
                localStorage.explorerCache = JSON.stringify(explorerCache);
                show_top_films(cotnt);
            },
            error:function (xhr, ajaxOptions, thrownError){
                if (explorerCache.top_films != null && explorerCache.top_films.cache_arr != null)
                    show_top_films(explorerCache.top_films.cache_arr);
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
    var movebleCalculate = function (a,size) {
        var tmp_size = a.length*7;
        var st = '';
        if (tmp_size > size) {
            if (tmp_size < 50)
                st = 'moveble50';
            else if (tmp_size < 100)
                st = 'moveble100';
            else if (tmp_size < 150)
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
        write_content(content,'games','Игры',2,null,1,null,110);
    }
    var show_films = function (content) {
        write_content(content,'films','Сейчас в кино',3,'http://www.kinopoisk.ru',1);
    }
    var show_top_films = function (content) {
        write_content(content,'top_films','Фильмы',3,'http://www.kinopoisk.ru',1);
    }
    var show_serials = function (content) {
        write_content(content,'serials','Сериалы',0,'http://www.kinopoisk.ru',1);
    }
    var get_view_status = function (n) {
        if (listOptions == null) return 1;
        for (var i = 0;i<listOptions.length;i++) {
            if (listOptions[i].n == n)
                return listOptions[i].s;
        }
        return 1;
    }
    var set_view_size = function (n,s) {
        if (listOptions == null) return;
        for (var i = 0;i<listOptions.length;i++) {
            if (listOptions[i].n == n)
                listOptions[i].size = s;
        }
        localStorage.listOptions = JSON.stringify(listOptions);
    }
    var get_view_size = function (n) {
        if (listOptions == null) return 0;
        for (var i = 0;i<listOptions.length;i++) {
            if (listOptions[i].n == n)
                return listOptions[i].size;
        }
        return 0;
    }
    var triggerClick = function (s,c) {
        if (AutoSetCategory) {
            if (c == null)
                $('ul.categorys').children('li').eq(0).trigger('click');
            else
                $('ul.categorys').children('li[data-id='+c+']').trigger('click');
            view.SetAutoMove(null);
        }
        view.triggerSearch(s);
    }
    var make_form = function () {
        var ul = $('div.explore ul.sortable');
        if (ul.children('li').length > 0) return;
        ul.sortable({
            axis: 'y', 
            handle: 'div.move_it',
            revert: true,
            start: function(event, ui) {
                $('div.explore').find('div.spoiler').hide('fast');
                $('div.explore ul.sortable li div').children('div').children('div.poster').hide();
                $('div.explore ul.sortable li').children('div').children('h2').css('-webkit-box-shadow','none');
            },
            stop: function(event, ui) {
                $('div.explore').find('div.spoiler').show('fast');
                $('div.explore ul.sortable li div').children('div').children('div.poster').show();
                $('div.explore ul.sortable li').children('div').children('h2').css('-webkit-box-shadow','0 4px 8px -4px rgba(0, 0, 0, 0.5)');
                save_options();
            }
        });
        if (listOptions.length == 4) {
            listOptions[listOptions.length] = {
                n:'favorites',
                s:1,
                size: 0
            }
        }
        for (var i = 0;i<listOptions.length;i++){
            ul.append('<li class="'+listOptions[i].n+'"></li>');
        }
    }
    var save_options = function () {
        var ul = $('div.explore ul.sortable').children('li');
        var ul_c = ul.length;
        listOptions = [];
        for (var i2=0;i2<ul_c;i2++)
            listOptions[i2] = {
                n: ul.eq(i2).attr('class'), 
                s: (ul.eq(i2).find('div.spoiler').is('.up'))?0:1
            };
        localStorage.listOptions = JSON.stringify(listOptions);
    }
    var show_favorites = function () {
        if (favoritesList.length < 1) { 
            $('li.favorites').css('display','none');
            return;
        } else 
            $('li.favorites').css('display','list-item');
        $('li.favorites').empty();
        write_content(favoritesList,'favorites','Избранное',null,null,null,1);
    }
    var write_content = function (content,section,name,category,root_url,fav,did,def_size) {
        def_size = (def_size == null)?130:def_size;
        fav = (fav != null)?'<div class="add_favorite" title="В избранное">':'<div class="del_favorite" title="Удалить из избранного">';
        root_url = (root_url == null)? '' : root_url;
        var st = get_view_status(section);
        var c = '<div class="'+section+'"><h2><div class="move_it"></div>'+name+'<div class="setup" title="Настроить вид"'+((!st)?' style="display: none"':'')+'></div><div class="spoiler'+((!st)?' up':'')+'"></div></h2><div'+((!st)?' style="display:none"':'')+'>';
        var cc = 0;
        var size = get_view_size(section);
        var font_size = get_font_size(size);
        if (size > 0 && size!=null && size!=def_size)
            $('body').append('<style>'+
                'div.explore div.'+section+' > div > div.poster, '+
                'div.explore div.'+section+' > div > div.poster > div > div.info '+
                '{ width: '+size+'px; } '+
                'div.explore div.'+section+' div.poster > div.image > img '+
                '{width: '+(size-10)+'px;} '+
                ((font_size==0)?
                    'div.explore div.'+section+' div.poster > div.label '+
                    '{display: none;}'
                    :
                    'div.explore div.'+section+' div.poster > div.label > div.title, '+
                    'div.explore div.'+section+' div.poster > div.label > div.info > a '+
                    '{font-size: '+font_size+'px;}'
                    )+'</style>');
        $.each(content, function (k,v) {
            cc ++;
            var id = (did!=null) ? ' data-id="'+k+'"' : '';
            if (cc>20) return false;
            c += '<div class="poster"'+id+'><div class="image">'+fav+'</div><img src="'+v.img+'" title="'+v.name+'"/></div><div class="label"><div class="title'+movebleCalculate(v.name,def_size)+'" title="'+v.name+'"><span>'+v.name+'</span></div><div class="info"><a href="'+root_url+v.url+'" target="blank">Подробнее</a></div></div></div>';
        });
        c += '</div></div>';
        var explore_div = $('div.explore');
        var exp_li = explore_div.children('ul').children('li.'+section);
        exp_li.append(view.contentUnFilter(c));
        exp_li.children('div.'+section).children('div').children('div.poster').find('img').click(function () {
            var s = $(this).parent().parent().find('div.title').children('span').text();
            triggerClick(s,category);
        });
        exp_li.children('div.'+section).children('div').find('div.title').click(function () {
            var s = $(this).children('span').text();
            triggerClick(s,category);
        });
        update_btns(section,def_size);
    }
    var add_in_favorites = function (obj) {
        favoritesList[favoritesList.length] = {
            'img' : $(obj).find('img').attr('src'),
            'name' : $(obj).find('div.title').attr('title'),
            'url' : $(obj).find('div.info').children('a').attr('href')
        }
        localStorage.favoritesList = JSON.stringify(favoritesList);
        show_favorites();
    }
    var del_from_favorites = function (id) {
        favoritesList.splice(id,1);
        localStorage.favoritesList = JSON.stringify(favoritesList);
        show_favorites();
    }
    var load_all = function () {
        make_form();
        load_top_films();
        load_films();
        load_serials();
        load_games();
        show_favorites();
    }
    var update_btns = function (section,def_size) {
        $('div.explore div.'+section).find('div.spoiler').click( function () {
            if ($(this).is('.up')){
                var t = $(this);
                t.hide('fast');
                $(this).parent().children('div.setup').show('fast');
                $(this).parent().parent().children('div').slideDown('fast',function (){
                    t.removeClass('up').addClass('down');
                    t.show('fast');
                    save_options();
                });
            }else{
                var t = $(this);
                t.hide('fast');
                $(this).parent().children('div.setup').hide('fast');
                $(this).parent().parent().children('div').slideUp('fast',function (){
                    t.removeClass('down').addClass('up');
                    t.show('fast');
                    save_options();
                });
            }
        });
        $('div.explore div.'+section).find('div.add_favorite').click( function () {
            add_in_favorites($(this).parent().parent());
        });
        $('div.explore div.'+section).find('div.del_favorite').click( function () {
            $(this).parent().parent().hide('fast',function () {
                del_from_favorites($(this).attr('data-id'));
            });
        });
        $('div.explore div.'+section).find('div.setup').click(function () {
            var t = $(this).parent().children('div.setup_div');
            if (t.length != 0) {
                t.hide('fast',function () {
                    t.remove();
                });
                return;
            }
            t = $('<div class="setup_div" data-size="'+def_size+'"></div>').hide();
            $('<div class="slider"/>').slider({
                value: $(this).parent().parent().children('div').children('div.poster').width(),
                max: def_size,
                min: 30,
                animate: true,
                change: function(event, ui) {
                    set_view_size($(this).parent().parent().parent().parent().attr('class'),ui.value);
                },
                slide: function(event, ui) {
                    var t =  $(this).parent().parent().parent().children('div').children('div.poster');
                    t.width(ui.value);
                    t.find('img').width(ui.value-10);
                    var ttl = t.find('div.title span');
                    var inf = t.find('div.info a');
                    var txt = t.find('div.info').parent();
                    t.find('div.info').width(ui.value);
                    var f = get_font_size(ui.value);
                    if (f > 0) {
                        inf.css('font-size',f+'px');
                        ttl.css('font-size',f+'px');
                        txt.css('display','block');
                    } else {
                        txt.css('display','none');
                    }
                }
            }).appendTo(t);
            $('<div class="clear" title="По умолчанию">').click(function () {
                var t =  $(this).parent().parent().parent().children('div').children('div.poster');
                var defoult_size = $(this).parent().data('size');
                t.width(defoult_size);
                t.find('img').width(defoult_size-10);
                var ttl = t.find('div.title span');
                var inf = t.find('div.info a');
                var txt = t.find('div.info').parent();
                inf.css('font-size','12px');
                ttl.css('font-size','12px');
                txt.css('display','block');
                $(this).parent().children('div.slider').children().css('left','100%');
                set_view_size($(this).parent().parent().parent().parent().attr('class'),defoult_size);
            }).appendTo(t);
            $(this).after(t).next('div.setup_div').show('fast');
        });
    }
    var get_font_size = function (w) {
        if (w >105) {
            return 12;
        }
        else if (w > 80){
            return 11;
        }
        else if (w > 70){
            return 9;
        }
        else {
            return 0;
        }
    }
    return {
        getLoad : function () {
            return load_all();
        }
    }
}();