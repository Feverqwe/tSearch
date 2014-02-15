var explore = function() {
    var var_cache = {
        // dom cache for items
        source: {}
    };
    var dom_cache = {};
    var options = {
        google_proxy: parseInt(GetSettings('google_proxy') || 0),
        use_english_postername: parseInt(GetSettings('use_english_postername') || 0),
        top_cache: JSON.parse(GetSettings('topCache') || "{}"),
        favoritesList: JSON.parse(GetSettings('favoritesList') || "[]"),
        favoritesDeskList: JSON.parse(GetSettings('favoritesDeskList') || "{}"),
        kinopoiskList: JSON.parse(GetSettings('kinopoiskList') || "[]"),
        kinopoisk_category: parseInt(GetSettings('kinopoisk_category') || 1),
        kinopoisk_folder_id: parseInt(GetSettings('kinopoisk_f_id') || 1),
        hideTopSearch: parseInt(GetSettings('hideTopSearch') || 0),
        hide_exp_section: {
            kp_popular: parseInt(GetSettings('s_films') || 1),
            kp_in_cinema: parseInt(GetSettings('s_top_films') || 1),
            kp_serials: parseInt(GetSettings('s_serials') || 1),
            imdb_in_cinema: parseInt(GetSettings('s_imdb_films') || 0),
            imdb_popular: parseInt(GetSettings('s_imdb_top_films') || 0),
            imdb_serials: parseInt(GetSettings('s_imdb_serials') || 0),
            gg_games_new: parseInt(GetSettings('s_games_n') || 1),
            gg_games_top: parseInt(GetSettings('s_games') || 1)
        }
    };
    var listOptions_def = {
        favorites: { e: 1, w: 120, c: 1 },
        kp_favorites: { e: 1, w: 120, c: 1 },
        kp_in_cinema: { e: 1, w: 120, c: 1 },
        kp_popular: { e: 1, w: 120, c: 2 },
        kp_serials: { e: 1, w: 120, c: 1 },
        imdb_in_cinema: { e: 1, w: 120, c: 1 },
        imdb_popular: { e: 1, w: 120, c: 2 },
        imdb_serials: { e: 1, w: 120, c: 1 },
        gg_games_top: { e: 1, w: 128, c: 1 },
        gg_games_new: { e: 1, w: 128, c: 1 }
    };
    var listOptions = JSON.parse(GetSettings('listOptions') || "[]");
    if (listOptions.length === 0) {
        listOptions = listOptions_def;
    }
    var content_options = {
        favorites: {
            title: _lang.exp_favorites,
            root_url: undefined,
            margin: 14
        },
        kp_favorites: {
            title: _lang.exp_kinopoisk,
            root_url: 'http://www.kinopoisk.ru',
            margin: 14,
            url: 'http://www.kinopoisk.ru/mykp/movies/list/type/%category%/page/%page%/sort/default/vector/desc/vt/all/format/full/perpage/25/',
            base_url: "http://www.kinopoisk.ru/film/",
            img_url: "http://st.kinopoisk.ru/images/film/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_in_cinema: {//new in cinema
            title: _lang.exp_in_cinima,
            root_url: 'http://www.kinopoisk.ru',
            margin: 14,
            url: 'http://www.kinopoisk.ru/afisha/new/page/%page%/',
            keepAlive: Math.round(24 * 60 * 60 * (7 / 3)),
            page_end: 2,
            page_start: 0,
            base_url: "http://www.kinopoisk.ru/film/",
            img_url: "http://st.kinopoisk.ru/images/film/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_popular: {
            title: _lang.exp_films,
            root_url: 'http://www.kinopoisk.ru',
            margin: 14,
            url: 'http://www.kinopoisk.ru/popular/day/now/perpage/200/',
            keepAlive: Math.round(24 * 60 * 60 * (7 / 2)),
            base_url: "http://www.kinopoisk.ru/film/",
            img_url: "http://st.kinopoisk.ru/images/film/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_serials: {
            title: _lang.exp_serials,
            root_url: 'http://www.kinopoisk.ru',
            margin: 14,
            url: 'http://www.kinopoisk.ru/top/lists/45/',
            keepAlive: Math.round(24 * 60 * 60 * 7),
            base_url: "http://www.kinopoisk.ru/film/",
            img_url: "http://st.kinopoisk.ru/images/film/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_in_cinema: {
            title: _lang.exp_imdb_in_cinima,
            root_url: 'http://www.imdb.com',
            margin: 14,
            url: 'http://www.imdb.com/movies-in-theaters/',
            keepAlive: Math.round(24 * 60 * 60 * (7 / 3)),
            base_url: "http://www.imdb.com/title/",
            img_url: "http://ia.media-imdb.com/images/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_popular: {
            title: _lang.exp_imdb_films,
            root_url: 'http://www.imdb.com',
            margin: 14,
            url: 'http://www.imdb.com/search/title?count=100&title_type=feature',
            keepAlive: Math.round(24 * 60 * 60 * (7 / 2)),
            base_url: "http://www.imdb.com/title/",
            img_url: "http://ia.media-imdb.com/images/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_serials: {
            title: _lang.exp_imdb_serials,
            root_url: 'http://www.imdb.com',
            margin: 14,
            url: 'http://www.imdb.com/search/title?count=100&title_type=tv_series',
            keepAlive: Math.round(24 * 60 * 60 * 7),
            base_url: "http://www.imdb.com/title/",
            img_url: "http://ia.media-imdb.com/images/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        gg_games_top: {//best
            title: _lang.exp_games_best,
            root_url: 'http://gameguru.ru',
            margin: 12,
            url: 'http://gameguru.ru/pc/games/rate_week/page%page%/list.html',
            keepAlive: Math.round(24 * 60 * 60 * 7), //week
            page_end: 5,
            page_start: 1,
            base_url: "http://gameguru.ru/pc/games/",
            img_url: "http://gameguru.ru/f/games/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=220&rewriteMime=image/jpeg&url='
        },
        gg_games_new: {//new
            title: _lang.exp_games_new,
            root_url: 'http://gameguru.ru',
            margin: 12,
            url: 'http://gameguru.ru/pc/games/new/page%page%/list.html',
            keepAlive: Math.round(24 * 60 * 60 * (7 / 2)), //half week
            page_end: 5,
            page_start: 1,
            base_url: "http://gameguru.ru/pc/games/",
            img_url: "http://gameguru.ru/f/games/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=220&rewriteMime=image/jpeg&url='
        }
    };
    var content_parser = function () {
        var check_item = function(item) {
            if (item.url === undefined) {
                return 0;
            } else {
                if (item.url.indexOf('#block') !== -1) {
                    item.url = engine.contentUnFilter(item.url);
                }
            }
            if (item.img === undefined) {
                return 0;
            } else {
                if (item.img.indexOf('#block') !== -1) {
                    item.img = engine.contentUnFilter(item.img);
                }
            }
            if (item.title.length === 0) {
                return 0;
            }
            /*
            if (item.title_en !== undefined && item.title_en.length === 0) {
                return 0;
            }
            */
            return 1;
        };
        var gg_games_new = function(content) {
            content = engine.contentFilter(content);
            var $content = engine.load_in_sandbox(content);
            $content = $content.find('td.enc-box-list').children('div.enc-item');
            var arr = [];
            for (var i = 0, len = $content.length; i < len; i++) {
                var item = $content.eq(i);
                var obj = {
                    img: item.children('div.e-title').children('div.im').find('img').attr('src'),
                    title: item.children('div.e-title').find('a').eq(0).text(),
                    url: item.children('div.e-title').find('a').eq(0).attr('href')
                };
                if (check_item(obj) === 0) {
                    console.log("Explorer gg_games_new have problem!");
                    continue;
                }
                arr.push(obj);
            }
            return arr;
        };
        var kp_img_url = function(url) {
            return url.replace(/\/film\/([0-9]*)\//, '$1.jpg');
        };
        return {
            kp_favorites: function(content) {
                content = engine.contentFilter(content);
                var $content = engine.load_in_sandbox(content);
                if ($content.find('#login').length > 0) {
                    return undefined;
                }
                $content = $content.find('#itemList').children('li.item');
                var arr = [];
                for (var i = 0, len = $content.length; i < len; i++) {
                    var item = $content.eq(i);
                    var obj = {
                        img: 'http://st.kinopoisk.ru' + item.find('img.poster').attr('title'),
                        title: item.find('div.info').eq(0).children('a.name').text(),
                        title_en: item.find('div.info').children('span').eq(0).text(),
                        url: item.find('div.info').eq(0).children('a.name').attr('href')
                    };
                    if (check_item(obj) === 0) {
                        console.log("Explorer kp_favorites have problem!");
                        continue;
                    }

                    arr.push(obj);
                }
                return arr;
            },
            kp_in_cinema: function(content) {
                content = engine.contentFilter(content);
                var $content = engine.load_in_sandbox(content);
                $content = $content.find('div.filmsListNew').children('div.item');
                $content.find('div.threeD').remove();
                var arr = [];
                for (var i = 0, len = $content.length; i < len; i++) {
                    var item = $content.eq(i).children('div');
                    var obj = {
                        img: item.eq(0).children('a').children('img').attr('src'),
                        title: item.eq(1).children('div.name').children('a').text(),
                        title_en: item.eq(1).children('div.name').children('span').text(),
                        url: item.eq(1).children('div.name').children('a').attr('href')
                    };
                    if (check_item(obj) === 0) {
                        console.log("Explorer kp_in_cinema have problem!");
                        continue;
                    }
                    arr.push(obj);
                }
                return arr;
            },
            kp_popular: function(content) {
                content = engine.contentFilter(content);
                var $content = engine.load_in_sandbox(content);
                $content = $content.find('div.stat').children('div.el');
                var arr = [];
                for (var i = 0, len = $content.length; i < len; i++) {
                    var item = $content.eq(i);
                    var obj = {
                        img: item.children('a').attr('href'),
                        title: item.children('a').text(),
                        title_en: item.children('i').text(),
                        url: item.children('a').attr('href')
                    };
                    if (check_item(obj) === 0) {
                        console.log("Explorer kp_popular have problem!");
                        continue;
                    }
                    obj.img = kp_img_url(obj.img);
                    arr.push(obj);
                }
                return arr;
            },
            kp_serials : function(content) {
                content = engine.contentFilter(content);
                var $content = engine.load_in_sandbox(content);
                $content = $content.find('#itemList').children('tbody').children('tr');
                var arr = [];
                for (var i = 1, len = $content.length; i < len; i++) {
                    var item = $content.eq(i).children('td');
                    var obj = {
                        img: item.eq(1).children('div').children('a').attr('href'),
                        title: item.eq(1).children('div').children('a').text(),
                        title_en: item.eq(1).children('div').children('span').text(),
                        url: item.eq(1).children('div').children('a').attr('href')
                    };
                    if (check_item(obj) === 0) {
                        console.log("Explorer kp_serials have problem!");
                        continue;
                    }
                    arr.push(obj);
                }
                return arr;
            },
            imdb_in_cinema: function(content) {
                content = engine.contentFilter(content);
                var $content = engine.load_in_sandbox(content);
                $content = $content.find('table.nm-title-overview-widget-layout');
                var arr = [];
                for (var i = 0, len = $content.length; i < len; i++) {
                    var item = $content.eq(i);
                    var obj = {
                        img: item.find('div.image img').attr('src'),
                        title: item.find('[itemprop="name"] a').eq(0).text(),
                        url: item.find('div.image img').attr('src')
                    };
                    if (check_item(obj) === 0) {
                        console.log("Explorer imdb_in_cinema have problem!");
                        continue;
                    }
                    arr.push(obj);
                }
                return arr;
            },
            imdb_popular: function(content) {
                content = engine.contentFilter(content);
                var $content = engine.load_in_sandbox(content);
                $content = $content.find('table.results').children('tbody').children('tr.detailed');
                var arr = [];
                for (var i = 0, len = $content.length; i < len; i++) {
                    var item = $content.eq(i);
                    var obj = {
                        img: item.children('td.image').find('img').attr('src'),
                        title: item.children('td.title').children('a').eq(0).text(),
                        url: item.children('td.title').children('a').eq(0).attr('href')
                    };
                    if (check_item(obj) === 0) {
                        console.log("Explorer imdb_popular have problem!");
                        continue;
                    }
                    arr.push(obj);
                }
                return arr;
            },
            imdb_serials: function(content) {
                content = engine.contentFilter(content);
                var $content = engine.load_in_sandbox(content);
                $content = $content.find('table.results').children('tbody').children('tr.detailed');
                var arr = [];
                for (var i = 0, len = $content.length; i < len; i++) {
                    var item = $content.eq(i);
                    var obj = {
                        img: item.children('td.image').find('img').attr('src'),
                        title: item.children('td.title').children('a').eq(0).text(),
                        url: item.children('td.title').children('a').eq(0).attr('href')
                    };
                    if (check_item(obj) === 0) {
                        console.log("Explorer imdb_serials have problem!");
                        continue;
                    }
                    arr.push(obj);
                }
                return arr;
            },
            gg_games_new: gg_games_new,
            gg_games_top: gg_games_new,
            desc: function(content) {
                content = engine.contentFilter(content);
                var mt = engine.load_in_sandbox(content);

                var $content = mt.find('#rhs_block').find('.rhsvw.kno-inline').eq(0).children('div');

                if ($content.length === 0) {
                    return;
                }

                $content.find('span.kno-fm.fl.q').remove();

                var obj = $content.find('a');
                var obj_len = obj.length;
                if (obj_len === 0) {
                    return;
                }
                for (var i = 0; i < obj_len; i++) {
                    if (obj.eq(i).attr('href') === undefined)
                        continue;
                    if (obj.eq(i).attr('href')[0] === '/')
                        obj.eq(i).attr('href', 'http://google.com' + obj.eq(i).attr('href'));
                    obj.eq(i).attr('target', '_blank');
                }
                var imgs = $content.find('img');
                var imgs_len = imgs.length;
                for (var i = 0; i < imgs_len; i++) {
                    var par_href = decodeURIComponent(imgs.eq(i).parent('a').attr('href'));
                    if (par_href === "undefined")
                        continue;
                    if (par_href.indexOf("imgres") < 0) {
                        imgs.eq(i).parent('a').remove();
                        continue;
                    }
                    imgs.eq(i).attr('src', par_href.replace(/.*=http(.*)&imgref.*/, 'http$1'));
                    if (imgs.eq(i).attr('src')[0] === '/') {
                        imgs.eq(i).attr('src', '#' + imgs.eq(i).attr('src'));
                    }
                }
                var info = {};
                //(!_google_proxy) ? "" :
                var google_proxy = "https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=400&rewriteMime=image/jpeg&url=";
                info.img = $content.find('a.bia.uh_rl').eq(0).children('img').attr('src');
                info.title = $content.find('div.kno-ecr-pt').text();
                info.type = $content.find('div.kno-ecr-st').text();
                var dom_desc = $content.find('div.kno-rdesc');
                info.desc_link_a = dom_desc.find('a').eq(-1);
                info.desc_link_title = info.desc_link_a.text();
                info.desc_link = info.desc_link_a.attr('href');
                if (info.desc_link !== undefined) {
                    info.desc_link = $('<a>', {href: view.contentUnFilter(info.desc_link), text: info.desc_link_title});
                    info.desc_link_a.remove();
                } else {
                    info.desc_link = '';
                }
                info.desc = dom_desc.text();
                info.other = $content.find('div.kno-fb-ctx');
                var content_info = $('<div>');
                if (info.title.length === 0 || info.desc.length === 0) {
                    return '';
                }
                if (info.img !== undefined) {
                    content_info.append($('<div>', {'class': 'a-poster'}).append($('<img>', {src: google_proxy + view.contentUnFilter(info.img)}).on('error', function(){
                        $(this).css('display', 'none');
                    })));
                }
                if (info.title !== undefined) {
                    content_info.append($('<div>', {'class': 'a-title', text: info.title}));
                }
                if (info.type !== undefined) {
                    content_info.append($('<div>', {'class': 'a-type', text: info.type}));
                }
                if (info.desc !== undefined) {
                    content_info.append($('<div>', {'class': 'a-desc', text: info.desc}).append(info.desc_link));
                }
                for (var i = 0, item; item = info.other[i]; i++) {
                    var val = $(item).children('.kno-fv');
                    var k = val.prev().text();
                    var v = val.text();
                    content_info.append($('<div>', {'class': 'a-table'}).append($('<span>', {'class': 'key', text: k}), $('<span>', {'class': 'value', text: v})));
                }
                return content_info;
            }
        }
    }();
    var content_write = function(type, content, page) {
        if (page === undefined || page < 1) {
            page = 1;
        }
        var line_count = listOptions[type].c;
        var source = content_options[type];
        if (source.conteiner_width === undefined) {
            source.conteiner_width = var_cache.source[type].li.width();
        }
        var item_count = Math.ceil(source.conteiner_width / (listOptions[type].w + 10*2)) - 1;
        if (var_cache.source[type].pages === undefined) {
            var onpage_count = item_count * line_count;
            var page_count = Math.floor(content.length / onpage_count);
            var page_body = $('<ul>',{'class': 'page_body'});
            for (var i = 1; i <=page_count; i++) {
                page_body.append(
                    $('<li>', {'class': (page === i)?'active':'', text: i})
                );
            }
            var_cache.source[type].pages = page_body;
            var_cache.source[type].title.after(
                var_cache.source[type].pages
            );
        }
        if (var_cache.source[type].body === undefined) {
            var_cache.source[type].body = $('<ul>',{'class': 'body'});
            var_cache.source[type].pages.after(
                var_cache.source[type].body
            );
        }
        var content_body = [];
        for (var line = 0; line < line_count; line++) {
            var from = item_count * line * page;
            var end = from + item_count;
            for (var index = from; index < end; index++) {
                content_body.push(
                    $('<li>').append(
                        $('<div>', {'class': 'picture'}).append(
                            $('<img>', {src: ((source.img_url !== undefined)?source.img_url:'')+content[index].img}),
                            $('<div>', {'class': 'menu'}),
                            $('<div>', {'class': 'info'}).append(
                                $('<div>', {'class': 'quality'}),
                                $('<a>', {'class': 'more', href: ((source.root_url !== undefined)?source.root_url:'')+content[index].url})
                            )
                        ),
                        $('<div>',{'class': 'title'}).append(
                            $('<span>').append(
                                $('<a>',{href: 'index.html#?search='+content[index].title, text: content[index].title})
                            )
                        )
                    )
                );
            }
        }
        var_cache.source[type].body.get(0).textContent = '';
        var_cache.source[type].body.append(content_body);
    };
    var xhr_dune = function(type, source) {
        source.xhr_wait_count--;
        if (source.xhr_wait_count !== 0) {
            return;
        }
        source.xhr_content.sort(function(a,b){
            if (a[0] === b[0]){
                return 0;
            }
            if (a[0] > b[0]){
                return -1;
            } else {
                return 1;
            }
        });
        var content = [];
        source.xhr_content.forEach(function(item){
            content = content.concat(item[1]);
        });
        content_write(type, content);
    };
    var xhr_send = function(type, source, page, page_mode) {
        source.xhr_wait_count++;
        source.xhr.push(
            $.ajax({
                url: (page_mode)?source.url.replace('%page%', page):source.url,
                success: function(data) {
                    source.xhr_content.push([page,content_parser[type](data)]);
                    xhr_dune(type, source);
                },
                error: function() {
                    xhr_dune(type, source);
                }
            })
        );
    };
    var getCacheDate = function() {
        var currentDate = new Data();
        var day = currentDate.getDay();
        var h = currentDate.getHours();
        var unixtime = parseInt(currentDate.getTime() / 1000);
        return unixtime - day*24*60*60;
    };
    var load_content = function(type) {
        var cache = JSON.parse(GetSettings('exp_cache_'+type) || {});
        var date = getCacheDate();
        if (cache.keepAlive > date) {
            content_write(cache.content);
            return;
        }
        var source = content_options[type];
        var page_mode = false;
        if (source.page_start !== undefined && source.page_end !== undefined) {
            page_mode = true;
        } else {
            source.page_start = 0;
            source.page_end = 0;
        }
        if (source.xhr !== undefined) {
            source.xhr.forEach(function(item){
                item.abort();
            })
        }
        source.xhr = [];
        source.xhr_wait_count = 0;
        source.xhr_content = [];
        for (var i = source.page_start; i <= source.page_end; i++) {
            xhr_send(type, source, i, page_mode);
        }
    };
    var explorerCache = JSON.parse(GetSettings('explorerCache') || "{}");
    return {
        show: function() {
            dom_cache.explore = $('div.explore');
            dom_cache.explore_ul = dom_cache.explore.children('ul');
            dom_cache.top = dom_cache.explore.children('div.top_search');
            $.each(listOptions, function(type, item){
                if (item.e === 0) {
                    return 1;
                }
                if (var_cache.source[type] === undefined) {
                    var source = content_options[type];
                    var_cache.source[type] = {};
                    var_cache.source[type].li = $('<li>',{'class': type});
                    var_cache.source[type].title = $('<div>', {'class': 'head'}).append(
                        $('<div>',{'class': 'move'}),
                        $('<div>',{'class': 'title', text: source.title}),
                        $('<div>',{'class': 'action'}).append(
                            $('<div>', {'class': 'setup'})
                        ),
                        $('<div>',{'class': 'setup_body'}).append(
                            $('<div>', {'class': 'slider'}),
                            $('<div>', {'class': 'default_size'}),
                            $('<select>', {'class': 'item_count'}).append(
                                (function(){
                                    var list = [];
                                    for (var i = 0; i < 7; i++) {
                                        list.push(
                                            $('<option>',{text: i, value: i})
                                        );
                                    }
                                    return list;
                                })()
                            )
                        ),
                        $('<div>',{'class': 'collapses'})
                    );
                    var_cache.source[type].li.append(var_cache.source[type].title);
                }
                dom_cache.explore_ul.append(var_cache.source[type].li);
            });
            load_content('kp_popular');
        },
        getDesc: function(request) {
            return about_keyword(k);
        }
    };
}();