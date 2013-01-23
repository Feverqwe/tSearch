var explore = function () {
    var _google_proxy = (GetSettings('google_proxy') !== undefined) ? parseInt(GetSettings('google_proxy')) : false;
    var use_english_postername = (GetSettings('use_english_postername') !== undefined) ? parseInt(GetSettings('use_english_postername')) : false;
    var AutoSetCategory = (GetSettings('AutoSetCategory') !== undefined) ? parseInt(GetSettings('AutoSetCategory')) : true;
    var xhr = {};
    var explorerCache = (GetSettings('explorerCache') !== undefined) ? JSON.parse(GetSettings('explorerCache')) : {
        games:null,
        games_a:null,
        games_n:null,
        films:null,
        top_films:null,
        serials:null
    };
    var topCache = (GetSettings('topCache') !== undefined) ? JSON.parse(GetSettings('topCache')) : null;
    var favoritesList = (GetSettings('favoritesList') !== undefined) ? JSON.parse(GetSettings('favoritesList')) : [];
    var listOptions_def = {
        favorites: {
            s:1,
            size: 0,
            count: 6,
            line: 1
        }, 
        films: {
            s:1,
            size: 0,
            count: 6,
            line: 1
        }, 
        top_films: {
            s:1,
            size: 0,
            count: 12,
            line: 2
        },
        serials: {
            s:1,
            size: 0,
            count: 6,
            line: 1
        },
        games: {
            s:1,
            size: 128,
            count: 7,
            line: 1
        },
        games_n: {
            s:1,
            size: 128,
            count: 7,
            line: 1
        },
        games_a: {
            s:1,
            size: 128,
            count: 7,
            line: 1
        }
    };
    var listOptions = (GetSettings('listOptions') !== undefined) ? JSON.parse(GetSettings('listOptions')) : listOptions_def;
    var content_sourse = {
        favorites: {
            t:_lang.exp_favorites,
            c:null,
            root_url: '',
            fav: null,
            did: 1,
            size: 130,
            margin: 14,
            url: '',
            timeout: 0
        },
        games: { //best
            t:_lang.exp_games_best,
            c:2,
            root_url: 'http://gameguru.ru',
            fav: 0,
            did: null,
            size: 190,
            margin: 12,
            url: 'http://gameguru.ru/pc/games/rate_week/page%page%/list.html',
            timeout: Math.round(24*60*60*7), //week
            page_max: 5,
            page_zero: 1,
            page_e: true
        },
        games_n: { //new
            t:_lang.exp_games_new,
            c:1,
            root_url: 'http://gameguru.ru',
            fav: 0,
            did: null,
            size: 190,
            margin: 12,
            url: 'http://gameguru.ru/pc/games/new/page%page%/list.html',
            timeout: Math.round(24*60*60*(7/2)), //half week
            page_max: 5,
            page_zero: 1,
            page_e: true
        },
        games_a: { //all
            t:_lang.exp_games_all,
            c:1,
            root_url: 'http://gameguru.ru',
            fav: 0,
            did: null,
            size: 190,
            margin: 12,
            url: 'http://gameguru.ru/pc/games/best_all/page%page%/list.html',
            timeout: Math.round(24*60*60*7), //week
            page_max: 10,
            page_zero: 1,
            page_e: true
        },
        films: { //new in cinima
            t:_lang.exp_in_cinima,
            c:3,
            root_url: 'http://www.kinopoisk.ru',
            fav: 1,
            did: null,
            size: 130,
            margin: 14,
            url: 'http://www.kinopoisk.ru/afisha/new/page/%page%/',
            timeout: Math.round(24*60*60*(7/3)),
            page_max: 2,
            page_zero: 0,
            page_e: true
        },
        top_films: {
            t:_lang.exp_films,
            c:3,
            root_url: 'http://www.kinopoisk.ru',
            fav: 1,
            did: null,
            size: 130,
            margin: 14,
            url: 'http://www.kinopoisk.ru/popular/day/now/perpage/200/',
            timeout: Math.round(24*60*60*(7/2))
        },
        serials: {
            t:_lang.exp_serials,
            c:0,
            root_url: 'http://www.kinopoisk.ru',
            fav: 1,
            did: null,
            size: 130,
            margin: 14,
            url: 'http://www.kinopoisk.ru/top/lists/45/',
            timeout: Math.round(24*60*60*7)
        }
    };
    var read_content = function(type,content) {
        var sesizeimg = function (i) {
            var g_proxy = function (url) {
                if (!_google_proxy) return url;
                var google_proxy = 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url=';
                return google_proxy+encodeURI(url);
            }
            i = g_proxy(i.replace('/sm_film/','/film/'));
            return i;
        }
        var makeimg = function (i) {
            var g_proxy = function (url) {
                if (!_google_proxy) return url;
                var google_proxy = 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url=';
                return google_proxy+encodeURI(url);
            }
            i = g_proxy(i.replace(/(.*)\/film\/([0-9]*)\//,'http://st.kinopoisk.ru/images/film/$2.jpg'));
            return i;
        }
        var Films = function (c) {
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
                    'name' : item.eq(1).children('div.name').children('a').text().replace(/ \(.*, ([0-9]{4})\)$/,' ($1)'),
                    'name_en' : item.eq(1).children('div.name').children('span').text().replace(/ \([0-9]*\) [0-9]* мин./, ''),
                    'url' : item.eq(1).children('div.name').children('a').attr('href')
                }
            }
            return arr;
        }
        var Serials = function (c) {
            c = view.contentFilter(c);
            var t = $(c).find('#itemList').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 1;i<l;i++) {
                var item = t.eq(i).children('td');
                arr[arr.length] = {
                    'img' : makeimg(item.eq(1).children('div').children('a').attr('href')),
                    'name' : item.eq(1).children('div').children('a').text().replace(/ \([0-9]* – .*\)$/,'').replace(/ \(сериал\)$/,''),
                    'name_en' : item.eq(1).children('div').children('span').text().replace(/ [0-9]* мин.$/,'').replace(/ \([0-9]* – .*\)$/,''),
                    'url' : item.eq(1).children('div').children('a').attr('href')
                }
            }
            return arr;
        }
        var Games = function (c) {
            var g_proxy = function (url) {
                if (!_google_proxy) return url;
                var google_proxy = 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=220&rewriteMime=image/jpeg&url=';
                return google_proxy+encodeURI(url);
            }
            c = view.contentFilter(c);
            var t = $(c).find('div.play-list-02').children('div.one.p-rel');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var item = t.eq(i);
                arr[arr.length] = {
                    'img' : g_proxy(item.children('a').eq(0).find('img').attr('src')),
                    'name' : item.children('div.name-i').children('a').text(),
                    'url' : item.children('div.name-i').children('a').attr('href')
                }
            }
            return arr;
        }
        var Games_gg = function (c) {
            var makeimg = function (url) {
                return url = content_sourse[type].root_url+url.replace('/small_img','/medium_img');
            }
            var g_proxy = function (url) {
                if (!_google_proxy) return url;
                var google_proxy = 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=180&rewriteMime=image/jpeg&url=';
                return google_proxy+encodeURI(url);
            }
            c = view.contentFilter(c);
            var t = $(c).find('td.enc-box-list').children('div.enc-item');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var item = t.eq(i);
                arr[arr.length] = {
                    'img' : g_proxy(makeimg(item.children('div.e-title').children('div.im').find('img').attr('src'))),
                    'name' : item.children('div.e-title').find('a').eq(0).text().trim(),
                    'url' : item.children('div.e-title').find('a').eq(0).attr('href')
                }
            }
            return arr;
        }
        var TopFilms = function (c) {
            c = view.contentFilter(c);
            var t = $(c).find('div.stat').children('div.el');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var item = t.eq(i);
                arr[arr.length] = {
                    'img' : makeimg(item.children('a').attr('href')),
                    'name' : item.children('a').text().replace(/ \(.*, ([0-9]{4})\)$/,' ($1)'),
                    'name_en' : item.children('i').text(),
                    'url' : item.children('a').attr('href')
                }
            }

            return arr;
        }
        var About = function (c) {
            c = view.contentFilter(c);
            var t = $(c).find('#rhs_block').find('div.kno-ec.rhsvw.vk_rhsc').eq(0).children('div');
            t.find('span.kno-fm.fl.q').remove();
            
            var obj = t.find('a')
            for (var i = 0 ; i < obj.length; i++) {
                if (obj.eq(i).attr('href')[0] == '/')
                    obj.eq(i).attr('href','http://google.com'+obj.eq(i).attr('href'));
                obj.eq(i).attr('target','_blank');
            }
            var imgs = t.find('img')
            for (var i = 0 ; i < imgs.length; i++) {
                var par_href = decodeURIComponent(imgs.eq(i).parent('a').attr('href'));
                if (par_href == undefined) 
                    continue;
                if (par_href.indexOf("imgres") < 0) {
                    imgs.eq(i).parent('a').remove();
                    continue;
                }
                imgs.eq(i).attr('src',par_href.replace(/.*=http(.*)&imgref.*/,'http$1'));
                if (imgs.eq(i).attr('src')[0] == '/')
                    imgs.eq(i).attr('src','#'+imgs.eq(i).attr('src'));
            }
            var info = {};
            info['img'] = t.find('a.bia.uh_rl').eq(0).children('img').attr('src');
            info['title'] = t.find('div.kno-ecr-pt').html();
            info['type'] = t.find('div.kno-ecr-st').html();
            info['desc'] = t.find("div.kno-desc").html();
            info['table'] = t.find('table.kno-fs').html();
            var content_info = ''
            if (info.title == undefined || info.desc == undefined) {
                return '';
            }
            if (info.img != undefined) {
                content_info += '<div class="a-poster"><img src="'+info.img+'" /></div>';
            }
            if (info.title != undefined) {
                content_info += '<div class="a-title">'+info.title+'</div>';
            }
            if (info.type != undefined) {
                content_info += '<div class="a-type">'+info.type+'</div>';
            }
            if (info.desc != undefined) {
                content_info += '<div class="a-desc">'+info.desc+'</div>';
            }
            if (info.table != undefined) {
                content_info += '<div class="a-table">'+info.table+'</div>';
            }
            if (content_info.length > 0)
                return view.contentUnFilter('<div>'+content_info+'</div>');
            else
                return '';
        }
        if (type == "about") return About(content);
        else
        if (type == 'serials') return Serials(content);
        else
        if (type == 'top_films') return TopFilms(content);
        else
        if (type == 'films') return Films(content);
        else
        if (type == 'games') return Games_gg(content);
        else
        if (type == 'games_n') return Games_gg(content);
        else
        if (type == 'games_a') return Games_gg(content);
    }
    var load_exp_content = function (type, url, page) {
        if (page != null) {
            url = url.replace('%page%',page[1])
        }
        var time = Math.round(new Date().getTime() / 1000);
        var timeout = content_sourse[type].timeout;
        if ( $('div.explore div.'+type).length > 0 ) return;
        if (explorerCache[type] != null && explorerCache[type].date != null && explorerCache[type].date>time) {
            write_content(explorerCache[type].cache_arr,type);
            return;
        }
        if (page != null) {
            if (xhr[type+page[1]] != null)
                xhr[type+page[1]].abort();
        } else {
            if (xhr[type] != null)
                xhr[type].abort();
        }
        xhr[type] = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                var content = read_content(type,data);
                if (page != null) {
                    if (explorerCache[type] != null && explorerCache[type].date != null && explorerCache[type].date<time) {
                        explorerCache[type].date = time+timeout;
                        explorerCache[type].cache_arr = []
                    }
                    if (explorerCache[type] != null && explorerCache[type].cache_arr != null) {
                        if (page[1] == page[0])
                            content = content.concat(explorerCache[type].cache_arr);
                        else
                            content = explorerCache[type].cache_arr.concat(content);
                    }
                    $('li.'+type).empty();
                }
                write_content(content,type);
                explorerCache[type] = {
                    date : time+timeout,
                    cache_arr : content
                };
                SetSettings('explorerCache',JSON.stringify(explorerCache));
            },
            error:function (){
                if (explorerCache[type] != null && explorerCache[type].cache_arr != null)
                    write_content(explorerCache[type].cache_arr,type);
            }
        });
    }
    var updateConfig = function () {
        var new_conf = {};
        $.each(content_sourse, function(key, value) {
            if (listOptions[key] != null) {
                new_conf[key] = listOptions[key];
            } else {
                new_conf[key] = listOptions_def[key];
            }
        });
        listOptions = new_conf;
    }
    var set_view_status = function (n,s) {
        listOptions[n]['s'] = s;
        SetSettings('listOptions',JSON.stringify(listOptions));
    }
    var set_view_size = function (n,s) {
        listOptions[n]['size'] = s;
        SetSettings('listOptions',JSON.stringify(listOptions));
    }
    var set_view_i_line = function (n,s) {
        listOptions[n]['line'] = parseInt(s);
        SetSettings('listOptions',JSON.stringify(listOptions));
    }
    var get_view_status = function (n) {
        if (listOptions == null) return 1;
        if (listOptions[n] != null)
            return listOptions[n]['s'];
        return 1;
    }
    var get_view_size = function (n) {
        if (listOptions != null && listOptions[n] != null & listOptions[n].size > 0)
            return listOptions[n].size;
        if (listOptions_def[n] != null && listOptions_def[n].size != null && listOptions_def[n].size > 0)
            return listOptions_def[n].size;
        else
            return content_sourse[n].size;
    }
    var update_current_item = function (key) {
        $('li.'+key+' > div > div').html(write_page(key, $('li.'+key+' > div > div').attr('data-page')));
        var size = get_view_size(key);
        calculate_moveble(key,size);  
    }
    var update_poster_count = function () {
        $.each(listOptions, function(key, value) {
            var now_count = $('li.'+key).attr('data-item-count');
            var new_count = get_view_i_count(key);
            if (now_count != undefined && now_count != new_count) {
                update_current_item(key)
            }
        });
    }
    var get_view_i_count = function (n) {
        var line_count = listOptions_def[n].line;
        if (listOptions[n] != null && listOptions[n].line != null && listOptions[n].line > 0)
            line_count = listOptions[n].line;
        var page_width = $('li.'+n).width();
        var poster_size = get_view_size(n);
        var poster_margin = get_poster_margin_size(n,poster_size)*2;
        return Math.floor(page_width/(poster_size+poster_margin))*line_count;
    }
    var get_view_i_line = function (n) {
        var line_count = listOptions_def[n].line;
        if (listOptions[n] != null && listOptions[n].line != null && listOptions[n].line > 0)
            line_count = listOptions[n].line;
        return line_count
    }
    var save_order = function () {
        var ul = $('div.explore ul.sortable').children('li');
        var ul_c = ul.length;
        var old_listOpts = listOptions;
        listOptions = {};
        for (var i2=0;i2<ul_c;i2++){
            var section = ul.eq(i2).attr('class');
            if (old_listOpts[section] != null)
                listOptions[section] = old_listOpts[section];
        }
        SetSettings('listOptions',JSON.stringify(listOptions));
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
    var show_favorites = function () {
        var type = 'favorites';
        if (favoritesList.length < 1) {
            $('li.'+type).css('display','none');
            return;
        } else 
            $('li.'+type).css('display','list-item');
        var page = $('li.'+type).children('div').children('div').attr('data-page');
        if (page == null) page = 1;
        $('li.'+type).empty();
        write_content(favoritesList,type,page);
    }
    var set_poster_size = function (section, size) {
        var font_size = get_font_size(size);
        var margine_size = get_poster_margin_size(section,size);
        $('div.explore div.'+section).find('div.setup').attr('data-size',size);
        $('style.poster_size_'+section).remove();
        $('body').append('<style class="poster_size_'+section+'">'+
            'div.explore div.'+section+' > div > div.poster '+
            '{ width: '+size+'px; margin: '+margine_size+'px; } '+
            'div.explore div.'+section+' > div > div.poster > div > div.info '+
            '{ width: '+size+'px; } '+
            'div.explore div.'+section+' div.poster > div.image > a > img '+
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
        var i_line = get_view_i_line(section);
        //определяем размер постера и их кол-во
        var size = get_view_size(section);
        var def_size = content_sourse[section].size;
        var name = content_sourse[section].t;
        size = (size == null || size < 1)?def_size:size;
        if (size > 0 && size!=def_size)
            set_poster_size(section, size);
        //<<
        //впиливание кастмного стиля для отобрадения нужного размера постеров и шрифта
        if (page_num == null) page_num = 1;
        var st = get_view_status(section);//st - статус отображения (открыт или нет спойлер)
        var c = '<div class="'+section+'">'
        +'<h2>'
        +'<div class="move_it"></div>'
        +name
        +'<div class="setup" data-i_line="'+i_line+'" data-size="'+size+'" title="'+_lang.exp_setup_view+'"'+((!st)?' style="display: none"':'')+'></div>'
        +'<div class="spoiler'+((!st)?' up':'')+'"></div>'
        +'</h2>'
        +'<div'+((!st)?' style="display:none"':'')+' data-page="'+page_num+'">';
        //вывод страницы
        c += write_page(section, page_num, content);
        //<<
        c += '</div></div>';
        var explore_div = $('div.explore');
        var exp_li = explore_div.children('ul').children('li.'+section);
        exp_li.append(c);
        
        //триггеры пошли
        calculate_moveble(section,size);
        //<<<<<<<<<<<<<<
        
        if (exp_li.children('div.'+section).children('div').children('div.poster').length == 0 && page_num > 1) {
            $('li.'+section).empty();
            write_content(content,section,page_num-1);
        }
    }
    var write_page = function (section, page, content) {
        if (content == null)
            content = (section == 'favorites')?favoritesList:explorerCache[section].cache_arr;
        var root_url = content_sourse[section].root_url;
        var fav = content_sourse[section].fav;
        var did = content_sourse[section].did;
        if (page == null) page = 1;
        var poster_count = get_view_i_count(section);
        $('li.'+section).attr('data-item-count',poster_count);
        var buttons = (fav != null)?'<div class="add_favorite" title="'+_lang.exp_in_fav+'">':'<div class="del_favorite" title="'+_lang.exp_rm_fav+'"></div><div class="edit_favorite" title="'+_lang.exp_edit_fav+'">';
        var buttons = buttons + '</div><div class="quality_box" title="'+_lang.exp_q_fav+'">';
        var c = '<div class="pager">'+make_page_body(poster_count,content.length,page)+'</div>';
        var max_item = page*poster_count;
        var min_item = max_item - poster_count;
        var name_v = '';
        var cc = 0;
        var werite_item = 0;
        $.each(content, function (k,v) {
            cc ++;
            if (cc<=min_item) return true;
            if (cc>max_item) return false;
            werite_item ++;
            var id = ' data-id="'+k+'"';
            var qual = (did!=null)? get_q_favorites(k) : '?';
            name_v = v.name;
            if (_lang.t != 'ru' || use_english_postername) {
                if (v.name_en != null && v.name_en != undefined && v.name_en.length > 0) 
                    name_v = v.name_en;
            }
            c += '<div class="poster"'+id+'>'
            +'<div class="image">'+buttons+qual+'</div>'
            +'<a href="#s='+name_v+'"><img src="'+v.img+'" title="'+name_v+'"/></a>'
            +'</div>'
            +'<div class="label">'
            +'<div class="title" title="'+name_v+'"><span><a href="#s='+name_v+'">'+name_v+'</a></span></div>'
            +'<div class="info"><a href="'+root_url+v.url+'" target="blank">'+_lang.exp_more+'</a></div>'
            +'</div>'
            +'</div>';
        });
        if (werite_item == 0 && page > 1) {
            var new_page = page-1;
            $('li.'+section+' > div > div').attr('data-page',new_page)
            return write_page(section,new_page,content);
        } else
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
    var add_in_favorites = function (obj) {
        favoritesList[favoritesList.length] = {
            'img' : $(obj).find('img').attr('src'),
            'name' : $(obj).find('div.title').attr('title'),
            'url' : $(obj).find('div.info').children('a').attr('href')
        }
        SetSettings('favoritesList',JSON.stringify(favoritesList));
        show_favorites();
    }
    var edit_from_favorites = function (id) {
        var new_name = apprise(_lang.exp_edit_fav_label, {'input':favoritesList[id].name, 'id':id}, function (id,name) {
            favoritesList[id].name = name;
            SetSettings('favoritesList',JSON.stringify(favoritesList));
            show_favorites();
        });
    }
    var del_from_favorites = function (id) {
        favoritesList.splice(id,1);
        SetSettings('favoritesList',JSON.stringify(favoritesList));
        show_favorites();
    }
    var update_q_favorites = function (id,q) {
        if (q == '') q = '?';
        favoritesList[id]['quality'] = q;
        SetSettings('favoritesList',JSON.stringify(favoritesList));
    }
    var get_q_favorites = function (id) {
        if (favoritesList[id].quality == null) return '?';
        return favoritesList[id]['quality'];
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
                $('div.explore ul.sortable li div').children('div').css('min-height','');
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
        //remove!!! временная ф-я
        if (listOptions['games_a'] == null)
            updateConfig();
        if (explorerCache['games_a'] == null)
            SetSettings('explorerCache',JSON.stringify({}));
        //<<<<<<<<
        $.each(listOptions, function(key, value) {
            ul.append('<li class="'+key+'"></li>');
            if (key == 'favorites')
                show_favorites();
            else
                if (content_sourse[key].page_e == true && content_sourse[key].page_zero != null && content_sourse[key].page_max != null) {
                    var zero = content_sourse[key].page_zero;
                    var max = content_sourse[key].page_max;
                    for (var n = zero; n <= max; n++)
                        load_exp_content(key,content_sourse[key].url, [zero, n, max]);
                } else 
                    load_exp_content(key,content_sourse[key].url);
        });
        //спойлер
        $('div.explore > ul.sortable > li').on('click','div > h2 > div.spoiler', function () {
            var t = $(this);
            t.parents().eq(1).children('div').css('min-height','0px');
            if (t.is('.up')){
                t.hide('fast');
                t.parent().children('div.setup').show('fast');
                t.parent().parent().children('div').slideDown('fast',function (){
                    t.removeClass('up').addClass('down');
                    t.show('fast');
                    var sect = t.parents().eq(2).attr('class');
                    set_view_status(sect,1);
                });
            }else{
                t.parent().children('div.setup').hide('fast');
                $('div.explore').find('div.setup_div').hide('fast',function (a,b) {
                    $(this).remove();
                });
                t.parents().eq(1).children('div').slideUp('fast',function (){
                    t.removeClass('down').addClass('up');
                    t.show('fast');
                    var sect = t.parents().eq(2).attr('class');
                    set_view_status(sect,0);
                });
            }
        });
        //переключение страниц
        $('div.explore > ul.sortable > li').on('hover', 'div > div.pager > div.item', function() {
            var page = $(this).text();
            var sect = $(this).parents().eq(3).attr('class');
            if ($('li.'+sect).children('div').children('div').attr('data-page') == page) return;
            
            var main_div = $(this).parents().eq(1);
            if (main_div.css('min-height') != null) {
                if (main_div.height() > main_div.css('min-height').replace('px',''))
                    main_div.css('min-height',main_div.height()+'px');
            } else {
                main_div.css('min-height',$(this).parents().eq(1).height()+'px')
            }
            
            $('li.'+sect).children('div').children('div').attr('data-page',page);
            $(this).parents().eq(1).html(write_page(sect, page));
            
            var size = get_view_size(sect);
            calculate_moveble(sect,size);            
        });
        //настройки
        $('div.explore > ul.sortable > li').on('click','div > h2 > div.setup', function () {
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
        // кнопка избранное - добавить
        $('div.explore > ul.sortable > li').on('click', 'div > div.poster > div.image > div.add_favorite', function() {
            add_in_favorites($(this).parent().parent());
        });
        // кнопка избранное - удалить
        $('div.explore > ul.sortable > li').on('click', 'div > div.poster > div.image > div.del_favorite', function() {
            $(this).parent().parent().hide('fast',function () {
                del_from_favorites($(this).attr('data-id'));
            });
        });
        // кнопка избранное - редактировать постер
        $('div.explore > ul.sortable > li').on('click', 'div > div.poster > div.image > div.edit_favorite', function() {
            edit_from_favorites($(this).parent().parent().attr('data-id'));
        });
        // кнопка качества
        $('div.explore > ul.sortable > li').on('click', 'div > div.poster > div.image > div.quality_box', function() {
            var section = $(this).parents().eq(4).attr('class');
            var name = $(this).parent().parent().children('div.label').children('div.title').text();
            $(this).addClass('loading');
            var tmp_id = parseInt($(this).parent().parent().attr('data-id'));
            view.getQuality(name.replace(/ \(([0-9]*)\)$/,' $1'),tmp_id,section);
        });
        //клик по постеру
        $('div.explore > ul.sortable > li').on('click', 'div > div.poster > div.image > a', function(event) {
            event.preventDefault();
            var section = $(this).parents().eq(3).attr('class');
            var s = $(this).parents().eq(1).find('div.title').children('span').text();
            triggerClick(s,section);
        });
        //клик по имени
        $('div.explore > ul.sortable > li').on('click', 'div > div.poster > div.label > div.title a', function(event) {
            event.preventDefault();
            var section = $(this).parents().eq(3).attr('class');
            var s = $(this).children('span').text();
            triggerClick(s,section);
        });
        //клик по подробнее
        $('div.explore > ul.sortable > li').on('click', 'div > div.poster > div.label > div.info a', function() {
            try {
                var s = $(this).parents().eq(1).children('div.title').children('span').text();
                _gaq.push(['_trackEvent', 'About', 'keyword', s]);
            } finally {
                return true;
            }
        });
        
        get_search_top()
        $('div.explore > div.top_search > div.tags').on('click', 'span > a', function() {
            event.preventDefault();
            var s = $(this).attr('title');
            triggerClick(s);
        });
    }
    var render_top = function(arr) {
        $('div.explore div.top_search div.tags').jQCloud(arr,{
            delayedMode: true, 
            encodeURI: false
        });
    }
    var get_search_top = function() {
        var timeout = 86400;
        var time = Math.round(new Date().getTime() / 1000);
        if (topCache != null && topCache.keywords != null && topCache.timeout>time) {
            render_top(topCache.keywords);
            return;
        }
        var type = "search_top";
        var url = "http://feverqwe.narod.ru/top.json";
        if (xhr[type] != null)
            xhr[type].abort();
        xhr[type] = $.ajax({
            type: 'JSON',
            url: url,
            success: function(data) {
                data = jQuery.parseJSON( data );
                data['timeout'] = time + timeout;
                SetSettings('topCache',JSON.stringify(data));
                var kw_arr = data['keywords'];
                render_top(kw_arr);
            },
            error:function (){
                if (topCache != null && topCache.keywords != null)
                    render_top(topCache.keywords);
            }
        });
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
    var make_setup_view = function (obj) {
        var i_line = $(obj).attr('data-i_line');
        var size = $(obj).attr('data-size');
        var section = $(obj).parents().eq(2).attr('class');
        var def_size = content_sourse[section].size;
        var t = $('<div class="setup_div" data-i_line="'+i_line+'" data-size="'+def_size+'"></div>').hide();
        $('<div class="slider"/>').slider({
            value: size,
            max: def_size,
            min: 30,
            animate: true,
            change: function(event, ui) {
                var sect = $(this).parents().eq(3).attr('class');
                set_view_size(sect,ui.value);
                //calculate_moveble(sect,ui.value);
                set_poster_size(sect,ui.value);
                $(this).parents().eq(2).children('div').css('min-height','0px');
                update_current_item(sect);
            },
            slide: function(event, ui) {
                var t =  $(this).parents().eq(2).children('div').children('div.poster');
                var sect = $(this).parents().eq(3).attr('class');
                var margin_size = get_poster_margin_size(sect,ui.value);
                t.css({
                    'width' : ui.value+'px',
                    'margin' : margin_size+'px'
                });
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
        $('<div class="clear" title="'+_lang.exp_default+'">').click(function () {
            var t =  $(this).parents().eq(2).children('div').children('div.poster');
            var sect = $(this).parents().eq(3).attr('class');
            var defoult_size = content_sourse[sect].size;
            if (listOptions_def[sect] != null && listOptions_def[sect].size != null && listOptions_def[sect].size > 0)
                defoult_size = listOptions_def[sect].size;
            var margin_size = get_poster_margin_size(sect,defoult_size);
            t.css({
                'width' : defoult_size+'px',
                'margin' : margin_size+'px'
            });
            t.find('img').width(defoult_size-10);
            t.find('div.title span').css('font-size','12px');
            t.find('div.info a').css('font-size','12px');
            t.find('div.info').parent().css('display','block');
            $(this).parent().children('div.slider').slider('value',defoult_size);
            var sect = $(this).parents().eq(3).attr('class');
            set_view_size(sect,defoult_size);
            calculate_moveble(sect,defoult_size);
            set_poster_size(sect,defoult_size);
            $(this).parents().eq(2).children('div').css('min-height','0px');
        }).appendTo(t);
        var optns = '';
        for (var i = 1; i<7; i++ )
            optns += '<option value="'+i+'"'+((i == i_line)?' selected':'')+'>'+i+'</option>';
        $('<div class="count"><select>'+optns+'</select></div>').children().change(function () {
            var sect = $(this).parents().eq(3).attr('class');
            $(this).parents().eq(2).children('div.setup').attr('data-i_line',$(this).val());
            set_view_i_line(sect,$(this).val());
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
    var get_poster_margin_size = function (section,w) {
        var max_w = content_sourse[section].size;
        var max_m = content_sourse[section].margin;
        if (w < 70) return 0;
        else
        if (w < max_w-25) max_m -= 8;
        else
        if (w < max_w-15) max_m -= 6;
        else
        if (w < max_w-5) max_m -= 4;
        var size = Math.round((max_m*w)/max_w);
        return size;
    }
    var setQuality = function (obj) {
        var categorys1 = [];
        var categorys = [];
        var order = function (a,b) {
            if (a.counter > b.counter)
                return -1;
            if (a.counter == b.counter)
                return 0;
            return 1;
        }
        for (var i_tt=-1;i_tt<11;i_tt++)
            if (obj.categorys[i_tt] != null && i_tt != 4) {
                if (obj.categorys[i_tt].year) {
                    if (categorys1.length == 0) {
                        categorys1[categorys1.length] = obj.categorys[i_tt];
                        categorys1[categorys1.length-1]['cid'] = i_tt;
                    } else 
                    if (obj.categorys[i_tt].label != '') {
                        categorys1[categorys1.length] = obj.categorys[i_tt];
                        categorys1[categorys1.length-1]['cid'] = i_tt;
                    }
                } else
                if (obj.categorys[i_tt].label != '') {
                    categorys[categorys.length] = obj.categorys[i_tt];
                    categorys[categorys.length-1]['cid'] = i_tt;
                }
            };
        if (categorys1.length > 0)
            categorys = categorys1;
        categorys.sort(order);
        var label = ''
        $.each(categorys, function (k,v) {
            if (v.label.length == 0 || v.cid == 4) return true;
            if (label.length == 0)
                label = '<label title="'+view.getAssocCategorys(v.cid)+'">'+v.label+'</label>';
            else
                label += ', '+'<label title="'+view.getAssocCategorys(v.cid)+'">'+v.label+'</label>';
        });
        var qbox = $('li.'+obj.section+' > div.'+obj.section+' > div').children('div[data-id='+obj.id+']').find('div.quality_box');
        qbox.removeClass('loading');
        if (obj.section == 'favorites')
            update_q_favorites(obj.id,label);
        if (label.length > 0) {
            qbox.html(label).css('display','block');
        } else {
            qbox.text('-');
        }
    }
    var about_keyword = function (keyword) {
        if (keyword.length == 0)
            return;
        var ab_panel = $('div.about_panel');
        ab_panel.empty();
        var url = 'https://www.google.com/search?q='+keyword
        var type = "about"
        if (xhr[type] != null)
            xhr[type].abort();
        xhr[type] = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                var content = read_content(type,data);
                ab_panel.html(content);
            }
        });
    }
    return {
        getAbout : function (k) {
            return about_keyword(k);
        },
        getLoad : function () {
            return make_form();
        },
        setQuality : function (a) {
            setQuality(a);
        },
        update_poster_count : function () {
            update_poster_count();
        }
    }
}();
$(window).on('resize', function() {
    explore.update_poster_count();
});