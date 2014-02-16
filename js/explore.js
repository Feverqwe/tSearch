var explore = function() {
    var var_cache = {
        // dom cache for items
        source: {},
        // resize_timer
        resize_timer: undefined,
        calculateMovebleCache: {},
        resize_timer_work: 0
    };
    var dom_cache = {};
    var options = {
        google_proxy: parseInt(GetSettings('google_proxy') || 0),
        use_english_postername: parseInt(GetSettings('use_english_postername') || 0),
        top_cache: JSON.parse(GetSettings('topCache') || "{}"),
        kp_folder_id: parseInt(GetSettings('kinopoisk_f_id') || 1),
        hideTopSearch: parseInt(GetSettings('hideTopSearch') || 0)
    };
    var listOptions_def = {
        favorites: { e: 1, s: 1, w: 120, c: 1 },
        kp_favorites: { e: 1, s: 1, w: 120, c: 1 },
        kp_in_cinema: { e: 1, s: 1, w: 120, c: 1 },
        kp_popular: { e: 1, s: 1, w: 120, c: 2 },
        kp_serials: { e: 1, s: 1, w: 120, c: 1 },
        imdb_in_cinema: { e: 1, s: 1, w: 120, c: 1 },
        imdb_popular: { e: 1, s: 1, w: 120, c: 2 },
        imdb_serials: { e: 1, s: 1, w: 120, c: 1 },
        gg_games_top: { e: 1, s: 1, w: 120, c: 1 },
        gg_games_new: { e: 1, s: 1, w: 120, c: 1 }
    };
    var listOptions = JSON.parse(GetSettings('listOptions') || "{}");
    if (listOptions.hasOwnProperty('favorites') === false) {
        listOptions = $.extend(true, {}, listOptions_def);
    }
    var content_options = {
        favorites: {
            title: _lang.exp_favorites,
            root_url: undefined,
            max_w: 120
        },
        kp_favorites: {
            title: _lang.exp_kinopoisk,
            root_url: 'http://www.kinopoisk.ru',
            max_w: 120,
            url: 'http://www.kinopoisk.ru/mykp/movies/list/type/%category%/page/%page%/sort/default/vector/desc/vt/all/format/full/perpage/25/',
            base_url: "http://www.kinopoisk.ru/film/",
            img_url: "http://st.kinopoisk.ru/images/film/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_in_cinema: {//new in cinema
            title: _lang.exp_in_cinima,
            root_url: 'http://www.kinopoisk.ru',
            max_w: 120,
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
            max_w: 120,
            url: 'http://www.kinopoisk.ru/popular/day/now/perpage/200/',
            keepAlive: Math.round(24 * 60 * 60 * (7 / 2)),
            base_url: "http://www.kinopoisk.ru/film/",
            img_url: "http://st.kinopoisk.ru/images/film/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_serials: {
            title: _lang.exp_serials,
            root_url: 'http://www.kinopoisk.ru',
            max_w: 120,
            url: 'http://www.kinopoisk.ru/top/lists/45/',
            keepAlive: Math.round(24 * 60 * 60 * 7),
            base_url: "http://www.kinopoisk.ru/film/",
            img_url: "http://st.kinopoisk.ru/images/film/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_in_cinema: {
            title: _lang.exp_imdb_in_cinima,
            root_url: 'http://www.imdb.com',
            max_w: 120,
            url: 'http://www.imdb.com/movies-in-theaters/',
            keepAlive: Math.round(24 * 60 * 60 * (7 / 3)),
            base_url: "http://www.imdb.com/title/",
            img_url: "http://ia.media-imdb.com/images/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_popular: {
            title: _lang.exp_imdb_films,
            root_url: 'http://www.imdb.com',
            max_w: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=feature',
            keepAlive: Math.round(24 * 60 * 60 * (7 / 2)),
            base_url: "http://www.imdb.com/title/",
            img_url: "http://ia.media-imdb.com/images/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_serials: {
            title: _lang.exp_imdb_serials,
            root_url: 'http://www.imdb.com',
            max_w: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=tv_series',
            keepAlive: Math.round(24 * 60 * 60 * 7),
            base_url: "http://www.imdb.com/title/",
            img_url: "http://ia.media-imdb.com/images/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        gg_games_top: {//best
            title: _lang.exp_games_best,
            root_url: 'http://gameguru.ru',
            max_w: 120,
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
            max_w: 120,
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
                obj.img = obj.img.replace('/f/games/','');
                obj.title = obj.title.trim();
                arr.push(obj);
            }
            return arr;
        };
        var kp_img_url = function(url) {
            return url.replace(/\/film\/([0-9]*)\//, '$1.jpg');
        };
        var kp_img_url2 = function(url) {
            return url.replace(/.*film\/([0-9]*).jpg/, '$1.jpg');
        };
        var imdb_img_url = function(i) {
            i = i.replace(/.*\/images\/(.*)_V1.*/, '$1_V1_SX120_.jpg');
            return i;
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
                    obj.img = kp_img_url2(obj.img);
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
                    obj.img = kp_img_url2(obj.img);
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
                    obj.img = kp_img_url(obj.img);
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
                    obj.img = imdb_img_url(obj.img);
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
                    obj.img = imdb_img_url(obj.img);
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
                    obj.img = imdb_img_url(obj.img);
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
    var content_write = function(type, content, page, update_pages) {
        if (content === undefined) {
            content = [];
        }
        var content_len = content.length;
        if (page === undefined || page < 0) {
            page = 0;
        }
        var options = listOptions[type];
        var line_count = options.c;
        var vc_source = var_cache.source[type];
        var source = content_options[type];
        if (source.conteiner_width === undefined) {
            source.conteiner_width = vc_source.li.width();
        }
        var item_count = Math.ceil(source.conteiner_width / (options.w + 10*2)) - 1;
        var onpage_count = item_count * line_count;
        vc_source.onpage_count = onpage_count;
        if (vc_source.pages === undefined || update_pages !== undefined) {
            var coef = content_len / onpage_count;
            var page_count = Math.floor(coef);
            if (coef % 1 === 0) {
                page_count--;
            }
            vc_source.current_page = page;
            var page_items = [];
            for (var i = 0; i <= page_count; i++) {
                page_items.push(
                    $('<li>', {'class': 'page_'+i+( (i === page)?' active':'' ), text: i+1}).data('page', i).data('type', type)
                );
            }
            if (vc_source.pages !== undefined) {
                vc_source.pages.get(0).textContent = '';
                vc_source.pages.append(page_items);
            } else {
                vc_source.pages = $('<ul>',{'class': 'page_body'}).append(page_items);
                vc_source.title.after(
                    vc_source.pages
                );
            }
            if (page_items.length <= 1) {
                vc_source.pages.addClass('hide');
            } else {
                vc_source.pages.removeClass('hide');
            }
        }

        if (vc_source.current_page !== page) {
            vc_source.pages.children('li.active').removeClass('active');
            vc_source.pages.children('li.page_'+page).addClass('active');
        }
        if (vc_source.body === undefined) {
            vc_source.body = $('<ul>',{'class': 'body'});
            vc_source.pages.after(
                vc_source.body
            );
            vc_source.body_height = 0;
        }
        var content_body = [];
        var from = onpage_count * page;
        var end = from + onpage_count;
        if (end > content_len) {
            end = content_len;
        }
        var spanList = [];
        for (var index = from; index < end; index++) {
            var title = content[index].title;
            var search_link = 'index.html#?search='+title;
            var span = $('<span>').append(
                $('<a>',{href: search_link, text: title, title: title})
            );
            var title_className = 'title';
            var moveble_class = var_cache.calculateMovebleCache[title];
            if (moveble_class === undefined) {
                spanList.push([span, title]);
            } else {
                title_className += ' '+moveble_class;
            }
            var img_url = content[index].img;
            if (img_url[6] !== '/' && source.img_url !== undefined) {
                img_url = source.img_url+img_url;
            }
            var url = ((source.root_url !== undefined)?source.root_url:'')+content[index].url;
            var menu;
            var $li = $('<li>');
            if ( type === 'favorites') {
                menu = [
                        $('<div>',{'class': 'rmFavorite', title: _lang.exp_rm_fav}).data('index', index),
                        $('<div>',{'class': 'move', title: _lang.exp_move_fav}),
                        $('<div>',{'class': 'edit', title: _lang.exp_edit_fav})
                    ];
                $li.data('index', index);
            } else {
                menu = [
                    $('<div>',{'class': 'inFavorite', title: _lang.exp_in_fav}).data('item',{url: url, img: img_url, title: title})
                ]
            }
            content_body.push(
                $li.append(
                    $('<div>', {'class': 'picture'}).append(
                        menu,
                        $('<div>', {'class': 'quality', title: _lang.exp_q_fav, text: '?'}),
                        $('<a>', {'class': 'link', href: url, target: '_blank', title: _lang.exp_btn_open}),
                        $('<a>',{href: search_link, title: title}).append(
                            $('<img>', {src: img_url})
                        )
                    ),
                    $('<div>',{'class': title_className}).append(
                        span
                    )
                )
            );
        }
        var content_body_len = content_body.length;
        if (content_body_len === 0) {
            if (page > 0) {
                page--;
                content_write(type, content, page, update_pages);
                return;
            }
            if (type === 'favorites') {
                vc_source.li.addClass('no_items');
            }
        } else
        if (type === 'favorites' && vc_source.li.hasClass('no_items')) {
            vc_source.li.removeClass('no_items');
        }
        vc_source.current_page = page;
        vc_source.body.get(0).textContent = '';
        vc_source.body.append(content_body);
        if (spanList.length > 0) {
            calculateMoveble(spanList, options.w, 'title');
        }
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
                return 1;
            } else {
                return -1;
            }
        });
        var content = [];
        source.xhr_content.forEach(function(item){
            content = content.concat(item[1]);
        });
        content_write(type, content);
        var_cache['exp_cache_'+type].content = content;
        SetSettings('exp_cache_'+type, JSON.stringify(var_cache['exp_cache_'+type]));
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
        var currentDate = new Date();
        var day = currentDate.getDay();
        var hours = currentDate.getHours();
        var minutes = currentDate.getMinutes();
        var seconds = currentDate.getSeconds();
        return parseInt(currentDate.getTime() / 1000) - day*24*60*60 - hours*60*60 - minutes*60 - seconds;
    };
    var load_content = function(type) {
        var cache = JSON.parse(GetSettings('exp_cache_'+type) || '{}');
        var_cache['exp_cache_'+type] = cache;
        if (type === 'kp_favorites' || type === 'favorites') {
            content_write(type, cache.content);
            return;
        }
        var date = getCacheDate();
        if (cache.keepAlive === date) {
            content_write(type, cache.content);
            return;
        }
        var_cache['exp_cache_'+type] = {keepAlive: date};
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
    var calculateMoveble = function (title, size, classname) {
        /*
         * Расчитывает стиль прокрутки длиных имен.
         */
        if (classname === undefined) {
            classname = 'title';
        }
        var styles = [];
        var title_l = title.length;
        for (var i = 0; i < title_l; i++) {
            var item = title[i][0];
            var text = title[i][1];
            var str_w = item.width();
            if (str_w <= size) {
                var_cache.calculateMovebleCache[text] = '';
                item.parent().attr('class', classname);
                continue;
            }
            str_w = Math.ceil(str_w / 10);
            if (str_w > 10) {
                if (str_w < 100) {
                    var t1 = Math.round(str_w / 10);
                    if (t1 > str_w / 10)
                        str_w = t1 * 10 * 10;
                    else
                        str_w = (t1 * 10 + 5) * 10;
                } else
                    str_w = str_w * 10;
            } else
                str_w = str_w * 10;
            var time_calc = Math.round(parseInt(str_w) / parseInt(size) * 3.5);
            var move_name = 'moveble' + '_' + size + '_' + str_w;
            var_cache.calculateMovebleCache[text] = move_name;
            if (dom_cache.body.children('style.' + move_name).length === 0) {
                styles.push(
                    $('<style>', {'class': move_name, text: '@-webkit-keyframes a_' + move_name
                    + '{'
                    +   '0%{margin-left:2px;}'
                    +   '50%{margin-left:-' + (str_w - size) + 'px;}'
                    +   '90%{margin-left:6px;}'
                    +   '100%{margin-left:2px;}'
                    + '}'
                    + 'div.' + move_name + ':hover > span {'
                    +   'overflow: visible;'
                    +   '-webkit-animation:a_' + move_name + ' ' + time_calc + 's;'
                    + '}'})
                );
            }
            item.parent().attr('class', classname + ' ' + move_name);
        }
        if (styles.length > 0) {
            dom_cache.body.append(styles);
        }
    };
    var width2fontSize = function(type, width) {
        var min = 714;
        var max = 857;
        var max_width = content_options[type].max_w;
        if (width >= 60) {
            width -= 60;
            max_width -= 60;
        } else {
            return;
        }
        var coefficient = width/max_width * 100;
        return Math.round(min+((max-min)/100 * coefficient));
    };
    var calculateSize = function(type) {
        var options = listOptions[type];
        var font_size_style = width2fontSize(type, options.w);
        var picture_size = 'li.'+type+' > ul.body > li{width: '+options.w+'px;}';

        var font_size;
        if (font_size_style === undefined) {
            font_size = 'li.'+type+' > ul.body > li > div.title{display: none;}';
        } else {
            font_size= 'li.'+type+' > ul.body > li > div.title{font-size: .'+font_size_style+'em;}';
        }
        dom_cache.body.children('style.'+'picture_width_'+type).remove();
        dom_cache.body.append( $('<style>',{'class': 'picture_width_'+type, text: picture_size+font_size}));
    };
    return {
        show: function() {
            if (dom_cache.explore !== undefined) {
                dom_cache.explore.show();
                return;
            }
            dom_cache.explore = $('div.explore');
            dom_cache.explore_ul = dom_cache.explore.children('ul');
            dom_cache.top = dom_cache.explore.children('div.top_search');
            dom_cache.body = $('body');
            dom_cache.window = $(window);
            $.each(listOptions, function(type, item){
                if (item.e === 0) {
                    return 1;
                }
                var source = content_options[type];
                var custom_menu = [];
                if (type === 'kp_favorites') {
                    custom_menu.push(
                        $('<a>', {'class': 'open', href: source.url.replace('%page%', 1).replace('%category%', options.kp_folder_id), target: '_blank', title: _lang.exp_btn_open}).data('type', type),
                        $('<div>', {'class': 'update', title: _lang.exp_btn_sync}).data('type', type)
                    );
                }
                var_cache.source[type] = {};
                var_cache.source[type].li = $('<li>',{'class': type+( (item.s !== 1)?' collapsed':'' )}).data('type', type);
                var_cache.source[type].title = $('<div>', {'class': 'head'}).append(
                    $('<div>',{'class': 'move'}).data('type', type),
                    $('<div>',{'class': 'title', text: source.title}),
                    $('<div>',{'class': 'action'}).append(
                        custom_menu,
                        $('<div>', {'class': 'setup', title: _lang.exp_setup_view}).data('type', type)
                    ),
                    $('<div>',{'class': 'setup_body'}).append(
                        $('<div>', {'class': 'slider'}),
                        $('<div>', {'class': 'default_size', title: _lang.exp_default}).data('type', type),
                        $('<select>', {'class': 'item_count'}).data('type', type).append(
                            (function(){
                                var list = [];
                                for (var i = 1; i < 7; i++) {
                                    list.push(
                                        $('<option>',{text: i, value: i})
                                    );
                                }
                                return list;
                            })()
                        )
                    ),
                    $('<div>',{'class': 'collapses '+( (item.s === 1)?'down':'up' )}).data('type', type)
                );
                var_cache.source[type].li.append(var_cache.source[type].title);
                calculateSize(type);
                dom_cache.explore_ul.append(var_cache.source[type].li);
                load_content(type);
            });
            dom_cache.explore_ul.on('mouseover', 'ul.page_body > li', function () {
                var $this = $(this);
                var page = $this.data('page');
                var type = $this.data('type');
                var body_height = var_cache.source[type].body.height();
                var_cache.source[type].body.css('min-height', body_height);
                var_cache.source[type].body_height = body_height;
                var content = var_cache['exp_cache_'+type].content;
                content_write(type, content, page);
            });
            dom_cache.explore_ul.on('click', 'div.collapses', function(e) {
                e.preventDefault();
                var $this = $(this);
                var type = $this.data('type');
                if ($this.hasClass('down') === true) {
                    listOptions[type].s = 0;
                    $this.removeClass('down').addClass('up');
                    var_cache.source[type].li.addClass('collapsed');
                } else {
                    listOptions[type].s = 1;
                    $this.removeClass('up').addClass('down');
                    var_cache.source[type].li.removeClass('collapsed');
                }
                SetSettings('listOptions', JSON.stringify(listOptions));
            });
            dom_cache.explore_ul.on('click', 'div.action > div.setup', function (e){
                e.preventDefault();
                var $this = $(this);
                var type = $this.data('type');
                var page = var_cache.source[type].current_page;
                var content = var_cache['exp_cache_'+type].content;
                var setup_body = var_cache.source[type].title.children('div.setup_body');
                setup_body.children('select.item_count').children('option[value="'+listOptions[type].c+'"]').prop('selected', true);
                setup_body.children('div.slider').slider({
                    value: listOptions[type].w,
                    min: 20,
                    max: content_options[type].max_w,
                    slide: function(e, ui) {
                        listOptions[type].w = ui.value;
                        calculateSize(type);
                    },
                    stop: function(e, ui) {
                        listOptions[type].w = ui.value;
                        calculateSize(type);
                        var_cache.source[type].body.css('min-height', 'auto');
                        content_write(type, content, page, 1);
                        SetSettings('listOptions', JSON.stringify(listOptions));
                    }
                });
                setup_body.toggleClass('show');
            });
            dom_cache.explore_ul.on('click', 'div.action > div.update', function(e){
                var $this = $(this);
                var type = $this.data('type');
                var source = content_options[type];
                $this.removeClass('error');
                if ($this.hasClass('loading')) {
                    if (source.xhr !== undefined) {
                        source.xhr.abort();
                    }
                } else {
                    $this.addClass('loading');
                }
                var page_limit = 20;
                var w_check_obj = {};
                var content = [];
                var load_page = function(page) {
                    source.xhr = $.ajax({
                        url: source.url.replace('%page%', page).replace('%category%', options.kp_folder_id),
                        success: function(data) {
                            var data = content_parser.kp_favorites(data);
                            var new_count = 0;
                            for (var i = 0, item; item = data[i]; i++) {
                                if (w_check_obj[item.url] !== undefined) {
                                    continue;
                                }
                                w_check_obj[item.url] = 1;
                                content.push(item);
                            }
                            if (new_count !== 0 && page_limit > 0) {
                                page++;
                                page_limit--;
                                load_page(page);
                            }
                            var current_page = var_cache.source[type].current_page;
                            content_write(type, content, current_page, 1);
                            var_cache['exp_cache_'+type] = {keepAlive: 0, content: content};
                            SetSettings('exp_cache_'+type, JSON.stringify(var_cache['exp_cache_'+type]));
                            $this.removeClass('loading');
                        },
                        error: function(){
                            $this.removeClass('loading').addClass('error');
                        }
                    });
                };
                load_page(0);
            });
            dom_cache.explore_ul.on('click', 'div.picture > div.inFavorite', function(e){
                var $this = $(this);
                var type = 'favorites';
                if (var_cache['exp_cache_'+type].content === undefined) {
                    var_cache['exp_cache_'+type].content = [];
                }
                var_cache['exp_cache_'+type].content.push($this.data('item'));
                var page = var_cache.source[type].current_page;
                content_write(type, var_cache['exp_cache_'+type].content, page, 1);
                SetSettings('exp_cache_'+type, JSON.stringify(var_cache['exp_cache_'+type]));
            });
            dom_cache.explore_ul.on('click', 'div.picture > div.rmFavorite', function(e){
                var $this = $(this);
                var type = 'favorites';
                var index = $this.data('index');
                var_cache['exp_cache_'+type].content.splice(index,1);
                var page = var_cache.source[type].current_page;
                content_write(type, var_cache['exp_cache_'+type].content, page, 1);
                SetSettings('exp_cache_'+type, JSON.stringify(var_cache['exp_cache_'+type]));
            });
            dom_cache.explore_ul.on('change', 'div.setup_body > select.item_count', function(e){
                e.preventDefault();
                var $this = $(this);
                var type = $this.data('type');
                var content = var_cache['exp_cache_'+type].content;
                var page = var_cache.source[type].current_page;
                listOptions[type].c = parseInt(this.value);
                var_cache.source[type].body.css('min-height', 'auto');
                content_write(type, content, page, 1);
                SetSettings('listOptions', JSON.stringify(listOptions));
            });
            dom_cache.explore_ul.on('click','div.setup_body > div.default_size', function(e){
                e.preventDefault();
                var $this = $(this);
                var type = $this.data('type');
                listOptions[type].w = listOptions_def[type].w;
                var_cache.source[type].title.children('div.setup_body').children('div.slider').slider({value: listOptions[type].w});
                var_cache.source[type].body.css('min-height', 'auto');
                var content = var_cache['exp_cache_'+type].content;
                var page = var_cache.source[type].current_page;
                calculateSize(type);
                var_cache.source[type].body.css('min-height', 'auto');
                content_write(type, content, page, 1);
                SetSettings('listOptions', JSON.stringify(listOptions));
            });
            dom_cache.explore_ul.sortable({
                axis: 'y',
                handle: 'div.head > div.move',
                scroll: false,
                start: function(e, ui) {
                    window.scrollTo(0,0);
                    dom_cache.explore_ul.addClass('sort_mode');
                    var type = $(e.toElement).data('type');
                    $(this).data('type', type).sortable("refreshPositions");
                    ui.type = type;
                },
                stop: function(e, ui) {
                    dom_cache.explore_ul.removeClass('sort_mode');
                    var lo = {};
                    var $li = dom_cache.explore_ul.children('li');
                    for (var i = 0, len = $li.length; i < len; i++) {
                        var type = $li.eq(i).data('type');
                        lo[type] = listOptions[type];
                    }
                    listOptions = lo;
                    SetSettings('listOptions', JSON.stringify(listOptions));
                }
            });
            dom_cache.explore.sortable({
                handle: 'div.picture > div.move',
                items: "li.favorites > ul.body > li",
                opacity: 0.8,
                stop: function(event, ui) {
                    var index = ui.item.data('index');
                    var prev = ui.item.prev().data('index');
                    var next = ui.item.next().data('index');
                    var type = 'favorites';
                    var content = var_cache['exp_cache_'+type].content;
                    var item = content[index];
                    if (prev === undefined && next === undefined) {
                        // hi!
                    } else
                    if (prev !== undefined) {
                        if (prev < index) {
                            content.splice(index, 1);
                            content.splice(prev + 1, 0, item);
                        } else {
                            content.splice(prev + 1, 0, item);
                            content.splice(index, 1);
                        }
                    } else {
                        content.splice(index, 1);
                        content.unshift(item);
                    }
                    var page = var_cache.source[type].current_page;
                    content_write(type, var_cache['exp_cache_'+type].content, page, 1);
                    SetSettings('exp_cache_'+type, JSON.stringify(var_cache['exp_cache_'+type]));
                }
            });
            dom_cache.window.on('resize', function(e) {
                clearTimeout(var_cache.resize_timer);
                var_cache.resize_timer = setTimeout(function(){
                    if (var_cache.resize_timer_work === 1) {
                        return;
                    }
                    var_cache.resize_timer_work = 1;
                    var cacheList = {};
                    var conteiner_width = dom_cache.explore_ul.width();
                    for (var type in listOptions) {
                        if (listOptions.hasOwnProperty(type) === false
                            || listOptions[type].e === 0) {
                            continue;
                        }
                        var options = listOptions[type];
                        var source = content_options[type];
                        source.conteiner_width = conteiner_width;
                        var currentCount = source.onpage_count;
                        if (cacheList[options.w] !== undefined) {
                            if (currentCount === cacheList[options.w]) {
                                continue;
                            }
                            content_write(type, var_cache['exp_cache_'+type].content, var_cache.source[type].current_page, 1);
                            continue;
                        }
                        var line_count = options.c;
                        var item_count = Math.ceil(source.conteiner_width / (options.w + 10*2)) - 1;
                        var onpage_count = item_count * line_count;
                        cacheList[options.w] = onpage_count;
                        if (currentCount === onpage_count) {
                            continue;
                        }
                        content_write(type, var_cache['exp_cache_'+type].content, var_cache.source[type].current_page, 1);
                    }
                    var_cache.resize_timer_work = 0;
                }, 100);
            });
            dom_cache.explore.show();
        },
        hide: function(){
            if (dom_cache.explore === undefined) {
                return;
            }
            dom_cache.explore.hide();
        },
        getDesc: function(request) {
            return about_keyword(k);
        }
    };
}();