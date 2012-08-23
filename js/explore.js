var explore = function () {
    var AutoSetCategory = (GetSettings('AutoSetCategory') !== undefined) ? parseInt(GetSettings('AutoSetCategory')) : true;
    var xhr = null;
    var xhr_g = null;
    var xhr_s = null;
    var xhr_tf = null;
    var explorerCache = (GetSettings('explorerCache') !== undefined) ? JSON.parse(GetSettings('explorerCache')) : {
        games:null,
        films:null,
        top_films:null,
        serials:null
    };
    var favoritesList = (GetSettings('favoritesList') !== undefined) ? JSON.parse(GetSettings('favoritesList')) : [];
    var listOptions = (GetSettings('listOptions') !== undefined) ? JSON.parse(GetSettings('listOptions')) : [{
        n:'favorites',
        s:1,
        size: 0,
        count: 6
    },{
        n:'films',
        s:1,
        size: 0,
        count: 6
    },{
        n:'top_films',
        s:1,
        size: 0,
        count: 12
    },{
        n:'serials',
        s:1,
        size: 0,
        count: 6
    },{
        n:'games',
        s:1,
        size: 0,
        count: 8
    }];
    var content_sourse = {
        favorites: {
            t:'Избранное',
            c:null,
            root_url: null,
            fav: null,
            did: 1,
            size: 130
        },
        games: {
            t:'Игры',
            c:2,
            root_url: 'http://www.igromania.ru',
            fav: 1,
            did: null,
            size: 203
        },
        films: {
            t:'Сейчас в кино',
            c:3,
            root_url: 'http://www.kinopoisk.ru',
            fav: 1,
            did: null,
            size: 130
        },
        top_films: {
            t:'Фильмы',
            c:3,
            root_url: 'http://www.kinopoisk.ru',
            fav: 1,
            did: null,
            size: 130
        },
        serials: {
            t:'Сериалы',
            c:0,
            root_url: 'http://www.kinopoisk.ru',
            fav: 1,
            did: null,
            size: 130
        }
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
                'name' : item.eq(1).children('a').text().replace(/ \(([0-9]*)\)$/,''),
                'url' : item.eq(1).children('a').attr('href')
            }
        }
        return arr;
    }
    var readGames = function (c) {
        c = view.contentFilter(c);
        var t = $(c).find('div.block12_content').children('div.block12_flash_bottom');
        var l = t.length;
        var arr = [];
        var i = 0;
        for (i = 1;i<l;i++) {
            var item = t.eq(i).prev();
            arr[arr.length] = {
                'img' : item.find('img.block12_gamespic').attr('src'),
                'name' : item.find('span.block3_newslist_capture').text(),                
                'url' : item.find('div.block12_underopen_text').children('a').attr('href')
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
        var url = 'http://www.kinopoisk.ru/top/serial/list/';
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
                if (cotnt.length > 0)
                    SetSettings('explorerCache',JSON.stringify(explorerCache));
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
        var url = 'http://www.kinopoisk.ru/popular/day//perpage/200/';
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
                if (cotnt.length > 0)
                    SetSettings('explorerCache',JSON.stringify(explorerCache));
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
        var url = 'http://www.kinopoisk.ru/afisha/new/';
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
                if (cotnt.length > 0)
                    SetSettings('explorerCache',JSON.stringify(explorerCache));
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
        var url = 'http://www.igromania.ru/gametop/';
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
                if (cotnt.length > 0)
                    SetSettings('explorerCache',JSON.stringify(explorerCache));
                show_games(cotnt);
            },
            error:function (xhr, ajaxOptions, thrownError){
                if (explorerCache.games != null && explorerCache.games.cache_arr != null)
                    show_games(explorerCache.games.cache_arr);
            }
        });
    }
    var show_games = function (content) {
        var t = 'games';
        write_content(content,t);
    }
    var show_films = function (content) {
        var t = 'films';
        write_content(content,t);
    }
    var show_top_films = function (content) {
        var t = 'top_films';
        write_content(content,t);
    }
    var show_serials = function (content) {
        var t = 'serials';
        write_content(content,t);
    }
    var get_view_status = function (n) {
        if (listOptions == null) return 1;
        for (var i = 0;i<listOptions.length;i++) {
            if (listOptions[i].n == n)
                return listOptions[i].s;
        }
        return 1;
    }
    var set_view_status = function (n,s) {
        if (listOptions == null) return;
        for (var i = 0;i<listOptions.length;i++) {
            if (listOptions[i].n == n)
                listOptions[i].s = s;
        }
        SetSettings('listOptions',JSON.stringify(listOptions));
    }
    var set_view_size = function (n,s) {
        if (listOptions == null) return;
        for (var i = 0;i<listOptions.length;i++) {
            if (listOptions[i].n == n)
                listOptions[i].size = s;
        }
        SetSettings('listOptions',JSON.stringify(listOptions));
    }
    var set_view_i_count = function (n,s) {
        if (listOptions == null) return;
        for (var i = 0;i<listOptions.length;i++) {
            if (listOptions[i].n == n)
                listOptions[i].count = parseInt(s);
        }
        SetSettings('listOptions',JSON.stringify(listOptions));
    }
    var get_view_size = function (n) {
        if (listOptions == null) return content_sourse[n].size;
        for (var i = 0;i<listOptions.length;i++) {
            if (listOptions[i].n == n)
                return listOptions[i].size;
        }
        return content_sourse[n].size;
    }
    var get_view_i_count = function (n) {
        if (listOptions == null) return 0;
        for (var i = 0;i<listOptions.length;i++) {
            if (listOptions[i].n == n)
                return listOptions[i].count;
        }
        return 0;
    }
    var triggerClick = function (s,c) {
        if (AutoSetCategory) {
            if (c == null)
                $('ul.categorys').children('li').eq(0).trigger('click');
            else
                $('ul.categorys').children('li[data-id="'+c+'"]').trigger('click');
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
                $('div.explore').find('div.setup_div').hide('fast',function (a,b) {
                    $(this).remove();
                });
                $('div.explore').find('div.setup:visible').addClass('triggered').hide('fast');
                $('div.explore ul.sortable li div').children('div').children('div.poster').hide();
                $('div.explore ul.sortable li div').children('div').children('div.pager').hide();
                $('div.explore ul.sortable li').children('div').children('h2').css('-webkit-box-shadow','none');
            },
            stop: function(event, ui) {
                $('div.explore').find('div.spoiler').show('fast');
                $('div.explore').find('div.setup.triggered').removeClass('triggered').show('fast');
                $('div.explore ul.sortable li div').children('div').children('div.poster').show();
                $('div.explore ul.sortable li div').children('div').children('div.pager').show();
                $('div.explore ul.sortable li').children('div').children('h2').css('-webkit-box-shadow','0 4px 8px -4px rgba(0, 0, 0, 0.5)');
                save_order();
            }
        });
        for (var i = 0;i<listOptions.length;i++){
            ul.append('<li class="'+listOptions[i].n+'"></li>');
        }
    }
    var save_order = function () {
        var ul = $('div.explore ul.sortable').children('li');
        var ul_c = ul.length;
        var old_listOpts = listOptions;
        listOptions = [];
        for (var i2=0;i2<ul_c;i2++){
            var ol_l = old_listOpts.length;
            for ( var i = 0; i<ol_l; i++)
                if (old_listOpts[i].n == ul.eq(i2).attr('class'))
                    listOptions[i2] = old_listOpts[i];
        }
        SetSettings('listOptions',JSON.stringify(listOptions));
    }
    var show_favorites = function () {
        if (favoritesList.length < 1) {
            $('li.favorites').css('display','none');
            return;
        } else 
            $('li.favorites').css('display','list-item');
        var page = $('li.favorites').children('div').children('div').attr('data-page');
        if (page == null) page = 1;
        $('li.favorites').empty();
        var t = 'favorites';
        write_content(favoritesList,t,page);
    }
    var set_poster_size = function (section, size) {
        var font_size = get_font_size(size);
        $('div.explore').find('div.setup').attr('data-size',size);
        $('style.poster_size_'+section).remove();
        $('body').append('<style class="poster_size_'+section+'">'+
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
    //<<<<
    }
    var write_content = function (content,section,page_num) {
        var i_count = get_view_i_count(section);
        i_count = (i_count == null || i_count < 1)?20:i_count;
        //определяем размер постера и их кол-во
        var size = get_view_size(section);
        var def_size = content_sourse[section].size;
        var name = content_sourse[section].t;
        size = (size == null || size < 1)?def_size:size;
        if (size > 0 && size!=null && size!=def_size)
            set_poster_size(section, size);
        //<<
        //впиливание кастмного стиля для отобрадения нужного размера постеров и шрифта
        
        if (page_num == null) page_num = 1;
        var st = get_view_status(section);//st - статус отображения (открыт или нет спойлер)
        var c = '<div class="'+section+'"><h2><div class="move_it"></div>'+name+'<div class="setup" data-i_count="'+i_count+'" data-size="'+size+'" title="Настроить вид"'+((!st)?' style="display: none"':'')+'></div><div class="spoiler'+((!st)?' up':'')+'"></div></h2><div'+((!st)?' style="display:none"':'')+' data-page="'+page_num+'">';
        //вывод страницы
        c += write_page(section, page_num, content);
        //<<
        c += '</div></div>';
        var explore_div = $('div.explore');
        var exp_li = explore_div.children('ul').children('li.'+section);
        exp_li.append(c);
        
        var category = content_sourse[section].c;
        exp_li.children('div.'+section).children('div').on('click', 'div.poster img', function() {
            var s = $(this).parents().eq(1).find('div.title').children('span').text();
            triggerClick(s,category);
        });
        exp_li.children('div.'+section).children('div').on('click', 'div.title', function() {
            var s = $(this).children('span').text();
            triggerClick(s,category);
        });
        calculate_moveble(section,size);
        update_btns(section);
    }
    var write_page = function (section, page, content) {
        if (content == null)
            var content = get_content(section);
        var root_url = content_sourse[section].root_url;
        var fav = content_sourse[section].fav;
        var did = content_sourse[section].did;
            
        if (page == null) page = 1;
        var poster_count = get_view_i_count(section);
        poster_count = (poster_count == null || poster_count < 1)?20:poster_count;
        var cc = 0;
        var fav = (fav != null)?'<div class="add_favorite" title="В избранное">':'<div class="del_favorite" title="Удалить из избранного">';
        var root_url = (root_url == null)? '' : root_url;
        var c = '';
        c+= '<div class="pager">'+make_page_body(poster_count,content.length,page)+'</div>';
        var max_item = page*poster_count;
        var min_item = max_item - poster_count;
        $.each(content, function (k,v) {
            cc ++;
            if (cc<=min_item) return true;
            if (cc>max_item) return false;
            var id = (did!=null) ? ' data-id="'+k+'"' : '';
            c += '<div class="poster"'+id+'><div class="image">'+fav+'</div><img src="'+v.img+'" title="'+v.name+'"/></div><div class="label"><div class="title" title="'+v.name+'"><span>'+v.name+'</span></div><div class="info"><a href="'+root_url+v.url+'" target="blank">Подробнее</a></div></div></div>';
        });
        return view.contentUnFilter(c);
    }
    var make_page_body = function (i_count,length,page) {
        var btns = '';
        if (length<=i_count) return '';
        var page_count = Math.floor((length-1)/i_count);
        for (var i = 1;i<page_count+2;i++) {
            btns += '<div class="item'+((i==page)?' active':'')+'">'+i+'</div>';
        }
        return btns;
    }
    var get_content = function (section) {
        if (section == 'favorites')
            return favoritesList;
        return explorerCache[section].cache_arr;
    }
    var add_in_favorites = function (obj) {
        favoritesList[favoritesList.length] = {
            'img' : $(obj).find('img').attr('src'),
            'name' : $(obj).find('div.title').attr('title'),
            'url' : $(obj).find('div.info').children('a').attr('href')
        }
        SetSettings('favoritesList',JSON.stringify(favoritesList));
        show_favorites();
    }
    var del_from_favorites = function (id) {
        favoritesList.splice(id,1);
        SetSettings('favoritesList',JSON.stringify(favoritesList));
        show_favorites();
    }
    var load_all = function () {
        //remove old gamespot
        var t = JSON.stringify(explorerCache);
        if ((/gamespotcdn/).test(t)) {
            explorerCache.games = null;
        }
        //<<<<<<<<<<<<<<<<<<<
        make_form();
        load_top_films();
        load_films();
        load_serials();
        load_games();
        show_favorites();
    }
    var calculate_moveble = function (section,size) {
        if (size<=70) return;
        var titles = $('div.'+section).find('span');
        var titles_l = titles.length;
        
        for (var i = 0;i<titles_l;i++){
            var str_w = titles.eq(i).width();
            if (str_w == 0) {
                str_w = titles.eq(i).text().length * 7;
            }
            if (str_w < size) continue;
            str_w = Math.ceil(str_w/10);
            if (str_w > 10) {
                if (str_w < 100) {
                    var t1 = Math.round(str_w/10);
                    if (t1 > str_w/10)
                        str_w = t1*10*10;
                    else
                        str_w = (t1*10 + 5)*10;
                } else 
                    str_w = str_w * 10;
            } else 
                str_w = str_w * 10;
            var str_s = size;
            var move_name = 'moveble'+'_'+str_s+'_'+str_w;
            if ($('body').find('.'+move_name).length == 0) {
                $('body').append('<style class="'+move_name+'">'
                    +'@-webkit-keyframes a_'+move_name
                    +'{'
                    +'0%{margin-left:2px;}'
                    +'50%{margin-left:-'+(str_w-str_s)+'px;}'
                    +'90%{margin-left:6px;}'
                    +'100%{margin-left:2px;}'
                    +'}'
                    +'@keyframes a_'+move_name
                    +'{'
                    +'0%{margin-left:2px;}'
                    +'50%{margin-left:-'+(str_w-str_s)+'px;}'
                    +'90%{margin-left:6px;}'
                    +'100%{margin-left:2px;}'
                    +'}'
                    +'@-moz-keyframes a_'+move_name
                    +'{'
                    +'0%{margin-left:2px;}'
                    +'50%{margin-left:-'+(str_w-str_s)+'px;}'
                    +'90%{margin-left:6px;}'
                    +'100%{margin-left:2px;}'
                    +'}'
                    +'@-o-keyframes a_'+move_name
                    +'{'
                    +'0%{margin-left:2px;}'
                    +'50%{margin-left:-'+(str_w-str_s)+'px;}'
                    +'90%{margin-left:6px;}'
                    +'100%{margin-left:2px;}'
                    +'}'
                    +'div.explore div.poster div.title.'+move_name+':hover > span {'
                    +'overflow: visible;'
                    +'-webkit-animation:a_'+move_name+' 6s 1;'
                    +'-moz-animation:a_'+move_name+' 6s 1;'
                    +'-o-animation:a_'+move_name+' 6s 1;'
                    +'}'
                    +'</style>');
            }
            titles.eq(i).parent().attr('class','title '+move_name);
        }
    }
    var bind_fav_btns = function (section) {
        // кнопка избранное - добавить
        $('div.explore div.'+section).on('click', 'div.add_favorite', function() {
            add_in_favorites($(this).parent().parent());
        });
        // кнопка избранное - удалить
        $('div.explore div.'+section).on('click', 'div.del_favorite', function() {
            $(this).parent().parent().hide('fast',function () {
                del_from_favorites($(this).attr('data-id'));
            });
        });
    }
    var bind_pager_btns = function (sect) {
        // кнопки переключения страниц
        $('div.explore div.'+sect+'').on('hover', 'div.pager > div.item', function() {
            var main_div = $(this).parents().eq(1);
            if (main_div.css('min-height') != null) {
                if (main_div.height() > main_div.css('min-height').replace('px',''))
                    main_div.css('min-height',main_div.height()+'px');
            } else {
                main_div.css('min-height',$(this).parents().eq(1).height()+'px')
            }
                
            var page = $(this).text();
            var sect = $(this).parents().eq(3).attr('class');
            $('li.'+sect).children('div').children('div').attr('data-page',page);
            $(this).parents().eq(1).html(write_page(sect, page));
            
            var size = get_view_size(sect);
            calculate_moveble(sect,size);            
        });
    }
    var update_btns = function (section) {
        //спойлер увеличения\уменьшения постеров
        $('div.explore div.'+section).find('div.spoiler').click( function () {
            $(this).parents().eq(1).children('div').css('min-height','0px');
            if ($(this).is('.up')){
                var t = $(this);
                t.hide('fast');
                $(this).parent().children('div.setup').show('fast');
                $(this).parent().parent().children('div').slideDown('fast',function (){
                    t.removeClass('up').addClass('down');
                    t.show('fast');
                    var sect = t.parents().eq(2).attr('class');
                    set_view_status(sect,1);
                });
            }else{
                var t = $(this);
                t.hide('fast');
                $(this).parent().children('div.setup').hide('fast');
                
                
                $('div.explore').find('div.setup_div').hide('fast',function (a,b) {
                    $(this).remove();
                });
                
                $(this).parents().eq(1).children('div').slideUp('fast',function (){
                    t.removeClass('down').addClass('up');
                    t.show('fast');
                    var sect = t.parents().eq(2).attr('class');
                    set_view_status(sect,0);
                });
            }
        });
        bind_fav_btns(section);
        bind_pager_btns(section);
        //настройки
        $('div.explore div.'+section).find('div.setup').click(function () {
            var t = $(this).parent().children('div.setup_div');
            if (t.length != 0) {
                t.hide('fast',function () {
                    t.remove();
                });
                return;
            }
            $('div.explore').find('div.setup_div').hide('fast',function (a,b) {
                $(this).remove();
            });
            t = make_setup_view(this);
            $(this).after(t).next('div.setup_div').show('fast');
        });
    }
    var make_setup_view = function (obj) {
        var i_count = $(obj).attr('data-i_count');
        var size = $(obj).attr('data-size');
        var section = $(obj).parents().eq(2).attr('class');
        var def_size = content_sourse[section].size;
        var t = $('<div class="setup_div" data-i_count="'+i_count+'" data-size="'+def_size+'"></div>').hide();
        $('<div class="slider"/>').slider({
            value: size,
            max: def_size,
            min: 30,
            animate: true,
            change: function(event, ui) {
                var sect = $(this).parents().eq(3).attr('class');
                set_view_size(sect,ui.value);
                calculate_moveble(sect,ui.value);
                set_poster_size(sect,ui.value);
                $(this).parents().eq(2).children('div').css('min-height','0px');
            },
            slide: function(event, ui) {
                var t =  $(this).parents().eq(2).children('div').children('div.poster');
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
            var t =  $(this).parents().eq(2).children('div').children('div.poster');
            var sect = $(this).parents().eq(3).attr('class');
            var defoult_size = content_sourse[sect].size;
            t.width(defoult_size);
            t.find('img').width(defoult_size-10);
            t.find('div.title span').css('font-size','12px');
            t.find('div.info a').css('font-size','12px');
            t.find('div.info').parent().css('display','block');
            $(this).parent().children('div.slider').children().css('left','100%');
            var sect = $(this).parents().eq(3).attr('class');
            set_view_size(sect,defoult_size);
            calculate_moveble(sect,defoult_size);
            set_poster_size(sect,defoult_size);
            $(this).parents().eq(2).children('div').css('min-height','0px');
        }).appendTo(t);
        var optns = '';
        for (var i = 3; i<21; i++ )
            optns += '<option value="'+i+'"'+((i == i_count)?' selected':'')+'>'+i+'</option>';
        $('<div class="count"><select>'+optns+'</select></div>').children().change(function () {
            var sect = $(this).parents().eq(3).attr('class');
            $(this).parents().eq(2).children('div.setup').attr('data-i_count',$(this).val());
            set_view_i_count(sect,$(this).val());
            var main_div = $(this).parents().eq(3).children('div');
            main_div.css('min-height','0px');
            main_div.html(write_page(sect, null));
            var size = get_view_size(sect);
            calculate_moveble(sect,size);            
        }).parent().appendTo(t);
        return t;
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