var explore = function() {
    "use strict";
    var var_cache = {
        // dom cache for items
        source: {},
        // resize_timer
        resize_timer: undefined,
        calculateMovebleCache: {},
        resize_timer_work: 0,
        conteiner_width: undefined,
        window_width: undefined,
        top_columns_num: undefined,
        kp_img_url: new RegExp('\\/film\\/([0-9]*)\\/'),
        kp_img_url2: new RegExp('.*film\\/([0-9]*).jpg'),
        imdb_img_url: new RegExp('.*\\/images\\/(.*)_V1.*'),
        getYear: new RegExp('.*\\([^\\(]*([1-2]{1}[0-9]{3})[^\\)]*\\).*','g'),
        rmYear: new RegExp('(.*) \\([^\\(]*[0-9]{4}[^\\)]*\\).*'),
        gLinkRepl: new RegExp('.*=http(.*)&imgref.*'),
        //cache dom obj
        qulityList: {},
        qualityCache: {},
        qualityCacheTimer: undefined,
        qualityBoxCache: {},
        // 1 - show , 0 - hide
        mode: 0,
        needResize: 0,
        about_cache: {},
        qualityCache_limit: 30,
        qualityBoxCache_limit: 100
    };

    var dom_cache = {};
    var settings = {};
    var listOptions = {};
    var content_options = {
        favorites: {
            title: undefined,
            root_url: undefined,
            max_w: 120
        },
        kp_favorites: {
            title: undefined,
            root_url: 'http://www.kinopoisk.ru',
            max_w: 120,
            url: 'http://www.kinopoisk.ru/mykp/movies/list/type/%category%/page/%page%/sort/default/vector/desc/vt/all/format/full/perpage/25/',
            base_url: "http://www.kinopoisk.ru/film/",
            img_url: "http://st.kinopoisk.ru/images/film/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_in_cinema: {//new in cinema
            title: undefined,
            root_url: 'http://www.kinopoisk.ru',
            max_w: 120,
            url: 'http://www.kinopoisk.ru/afisha/new/page/%page%/',
            keepAlive: [2, 4, 6],
            page_end: 2,
            page_start: 0,
            base_url: "http://www.kinopoisk.ru/film/",
            img_url: "http://st.kinopoisk.ru/images/film/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_popular: {
            title: undefined,
            root_url: 'http://www.kinopoisk.ru',
            max_w: 120,
            url: 'http://www.kinopoisk.ru/popular/day/now/perpage/200/',
            keepAlive: [0, 3],
            base_url: "http://www.kinopoisk.ru/film/",
            img_url: "http://st.kinopoisk.ru/images/film/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_serials: {
            title: undefined,
            root_url: 'http://www.kinopoisk.ru',
            max_w: 120,
            url: 'http://www.kinopoisk.ru/top/lists/45/',
            keepAlive: [0],
            base_url: "http://www.kinopoisk.ru/film/",
            img_url: "http://st.kinopoisk.ru/images/film/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_in_cinema: {
            title: undefined,
            root_url: 'http://www.imdb.com',
            max_w: 120,
            url: 'http://www.imdb.com/movies-in-theaters/',
            keepAlive: [2, 4, 6],
            base_url: "http://www.imdb.com/title/",
            img_url: "http://ia.media-imdb.com/images/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_popular: {
            title: undefined,
            root_url: 'http://www.imdb.com',
            max_w: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=feature',
            keepAlive: [0 , 2],
            base_url: "http://www.imdb.com/title/",
            img_url: "http://ia.media-imdb.com/images/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_serials: {
            title: undefined,
            root_url: 'http://www.imdb.com',
            max_w: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=tv_series',
            keepAlive: [0],
            base_url: "http://www.imdb.com/title/",
            img_url: "http://ia.media-imdb.com/images/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        gg_games_top: {//best
            title: undefined,
            root_url: 'http://gameguru.ru',
            max_w: 120,
            url: 'http://gameguru.ru/pc/games/rate_week/page%page%/list.html',
            keepAlive: [0],
            page_end: 5,
            page_start: 1,
            base_url: "http://gameguru.ru/pc/games/",
            img_url: "http://gameguru.ru/f/games/",
            g_proxy: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=220&rewriteMime=image/jpeg&url='
        },
        gg_games_new: {//new
            title: undefined,
            root_url: 'http://gameguru.ru',
            max_w: 120,
            url: 'http://gameguru.ru/pc/games/new/page%page%/list.html',
            keepAlive: [2, 4],
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
            if (!item.title) {
                return 0;
            }
            if (item.title_en !== undefined && item.title_en.length === 0) {
                return 0;
            }
            return 1;
        };
        var gg_games_new = function(content) {
            content = engine.contentFilter(content);
            var $content = engine.load_in_sandbox(content);
            $content = $content.find('.GGN__list-games .GGN__list-blocks').children('div');
            var arr = [];
            for (var i = 0, len = $content.length; i < len; i++) {
                var item = $content.eq(i);
                var href = item.find('.GGN_content-unit-title').find('a').eq(0);
                var obj = {
                    img: item.find('.GGN_content-unit-img').find('img').attr('src'),
                    title: href.text(),
                    url: href.attr('href')
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
            return url.replace(var_cache.kp_img_url, '$1.jpg');
        };
        var kp_img_url2 = function(url) {
            return url.replace(var_cache.kp_img_url2, '$1.jpg');
        };
        var imdb_img_url = function(i) {
            i = i.replace(var_cache.imdb_img_url, '$1_V1_SX120_.jpg');
            return i;
        };
        var getYear = function(text) {
            return parseInt(text.replace(var_cache.getYear, '$1'));
        };
        var rmYear = function(text) {
            return text.replace(var_cache.rmYear, '$1').trim();
        };
        var rmSerial = function(text) {
            return text.replace(' (сериал)', '').trim();
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
                    var title = obj.title;
                    obj.title = rmSerial(obj.title);
                    var isSerial = (title !== obj.title);
                    var year = getYear(obj.title_en);
                    obj.title_en = rmYear(obj.title_en);
                    if (obj.title_en.length > 0) {
                        if (!isSerial && !isNaN(year)) {
                            obj.title_en += ' '+year;
                        }
                    } else {
                        obj.title_en = undefined;
                    }
                    if (!isSerial && !isNaN(year)) {
                        obj.title += ' '+year;
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
                    obj.img = kp_img_url2(obj.img);
                    var year = getYear(obj.title_en);
                    obj.title_en = rmYear(obj.title_en);
                    if (!obj.title_en) {
                        obj.title_en = undefined;
                    }
                    if (!isNaN(year)) {
                        if (obj.title_en !== undefined) {
                            obj.title_en += ' '+year;
                        }
                        obj.title += ' '+year;
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
                    if (!obj.title_en) {
                        obj.title_en = undefined;
                    }
                    if (check_item(obj) === 0) {
                        console.log("Explorer kp_popular have problem!");
                        continue;
                    }
                    obj.img = kp_img_url(obj.img);
                    var year = getYear(obj.title);
                    obj.title = rmYear(obj.title);
                    if (!isNaN(year)) {
                        obj.title += ' '+year;
                        if (obj.title_en !== undefined) {
                            obj.title_en += ' '+year;
                        }
                    }
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
                    obj.title = rmSerial(obj.title);
                    obj.title_en = rmYear(obj.title_en);
                    if (!obj.title_en) {
                        obj.title_en = undefined;
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
                        url: item.find('[itemprop="name"] a').attr('href')
                    };
                    if (check_item(obj) === 0) {
                        console.log("Explorer imdb_in_cinema have problem!");
                        continue;
                    }
                    obj.img = imdb_img_url(obj.img);
                    var year = getYear(obj.title);
                    obj.title = rmYear(obj.title);
                    if (!isNaN(year)) {
                        obj.title += ' '+year;
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
            google: function(content, request) {
                content = engine.contentFilter(content);
                var $content = engine.load_in_sandbox(content);
                $content = $content.find('#rhs_block').find('ol').eq(0);
                //content = undefined;
                if ($content.length === 0) {
                    return;
                }
                var links = $content.find('a');
                for (var i = 0, len = links.length; i < len; i++) {
                    if (links.eq(i).attr('href') === undefined) {
                        continue;
                    }
                    if (links.eq(i).attr('href')[0] === '/') {
                        links.eq(i).attr('href', 'http://google.com' + links.eq(i).attr('href'));
                    }
                    links.eq(i).attr('target', '_blank');
                }
                var images = [];
                var imgList = $content.find('a > img');
                for (var i = 0, len = imgList.length; i < len; i++) {
                    var parent_a = imgList.eq(i).parent('a');
                    var href = parent_a.attr('href');
                    if (href === undefined) {
                        parent_a.remove();
                        continue;
                    } else {
                        href = decodeURIComponent(href);
                    }
                    if (href.indexOf("imgres") === -1) {
                        continue;
                    }
                    images.push(href.replace(var_cache.gLinkRepl, 'http$1'));
                }
                var info = {};
                var google_proxy = "https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=400&rewriteMime=image/jpeg&url=";
                if (images.length > 0) {
                    info.img = engine.contentUnFilter(images[0]);
                }
                info.title = $content.find('div.kno-ecr-pt').text();
                info.type = $content.find('div.kno-ecr-st').text();
                var dom_desc = $content.find('div.kno-rdesc');
                info.desc_link_a = dom_desc.find('a').eq(-1);
                info.desc_link_title = info.desc_link_a.text();
                info.desc_link = info.desc_link_a.attr('href');
                if (info.desc_link !== undefined) {
                    info.desc_link = $('<a>', {href: engine.contentUnFilter(info.desc_link), text: info.desc_link_title, target: '_blank'});
                    info.desc_link_a.remove();
                } else {
                    info.desc_link = '';
                }
                info.desc = dom_desc.text();
                info.other = $content.find('div.kno-fb-ctx');
                var content_info = $('<div>');
                if (!info.title || !info.desc) {
                    return '';
                }
                if (info.img !== undefined) {
                    content_info.append($('<div>', {'class': 'a-poster'})
                        .append($('<img>', {src: google_proxy + info.img, alt: info.title})
                            .on('error', function(){
                                $(this).css('display', 'none');
                            })
                        )
                    );
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
                    if (!v || !k) {
                        continue;
                    }
                    content_info.append($('<div>', {'class': 'a-table'}).append($('<span>', {'class': 'key', text: k}), $('<span>', {'class': 'value', text: v})));
                }
                limitObjSize(var_cache.about_cache, 10);
                var_cache.about_cache[request] = '<div>'+content_info.html()+'</div>';
                view.setDescription(content_info);
            }
        };
    }();
    var content_write = function(type, content, page, update_pages) {
        if (content === undefined) {
            content = [];
        }
        var content_len = content.length;
        if (page === undefined || page < 0) {
            page = 0;
        }
        var _options = listOptions[type];
        var line_count = _options.c;
        var vc_source = var_cache.source[type];
        var source = content_options[type];
        if (var_cache.conteiner_width === undefined) {
            var_cache.conteiner_width = var_cache.window_width - 180;
        }
        var item_count = Math.ceil(var_cache.conteiner_width / (_options.w + 10*2)) - 1;
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
            if (Infinity === page_count) {
                page_count = 0;
            }
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
        var_cache.qulityList[type] = {};
        for (var index = from; index < end; index++) {
            var title;
            if ((_lang.lang === 'en' || engine.settings.useEnglishPosterName === 1) && content[index].title_en !== undefined) {
                title = content[index].title_en;
            } else {
                title = content[index].title;
            }
            var search_link = 'index.html#?search='+encodeURIComponent(title);
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
                        $('<div>',{'class': 'edit', title: _lang.exp_edit_fav}).data('index', index)
                    ];
                $li.data('index', index);
            } else {
                menu = [
                    $('<div>',{'class': 'inFavorite', title: _lang.exp_in_fav}).data('item',{url: url, img: img_url, title: title})
                ];
            }
            var qualityText = '?';
            if (var_cache.qualityBoxCache[title] !== undefined) {
                qualityText = var_cache.qualityBoxCache[title];
            }
            var quality = $('<div>', {'class': 'quality', title: _lang.exp_q_fav}).append($('<span>', {text: qualityText})).data('type', type).data('index', index).data('title', title);
            var_cache.qulityList[type][index] = quality;
            content_body.push(
                $li.append(
                    $('<div>', {'class': 'picture'}).append(
                        menu,
                        quality,
                        $('<a>', {'class': 'link', href: url, target: '_blank', title: _lang.exp_more}).data('title', title),
                        $('<a>',{href: search_link, title: title}).append(
                            $('<img>', {src: img_url}).on('error', function(){
                                this.src = 'images/no_poster.png';
                            })
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
            calculateMoveble(spanList, _options.w, 'title');
        }
    };
    var topList_write = function() {
        if (var_cache.conteiner_width === undefined) {
            var_cache.conteiner_width = var_cache.window_width - 180;
        }
        var columns_num = (var_cache.conteiner_width > 1275) ? 4 : 3;
        var_cache.top_columns_num = columns_num;
        if (var_cache.topList === undefined || var_cache.topList.content === undefined || var_cache.topList.content.length === 0) {
            return;
        }
        var dot = '';
        var sub_style = '';
        var num = 1;
        var column = 1;
        var request = '';
        var content = $('<ul>', {'class': 'c' + columns_num});
        for (var i = 0, item; item = var_cache.topList.content[i]; i++) {
            if (column > 10) {
                break;
            }
            dot = '';
            if (num % columns_num === 0) {
                if (column < 6) {
                    sub_style = ' t' + column;
                } else {
                    sub_style = '';
                }
                dot = $('<div>', {'class': 'info' + sub_style});
            }
            request = item.text;
            if (item.year > 0) {
                request += ' ' + item.year;
            }
            content.append(
                $('<li>', {'class': 'l' + column}).append(
                    dot,
                    $('<span>', {title: request}).append(
                        $('<a>', {href: '#?search=' + encodeURIComponent(request), text: item.text})
                    )
                )
            );
            if (num % columns_num === 0) {
                column++;
            }
            num++;
        }
        dom_cache.top_search.get(0).textContent = '';
        dom_cache.top_search.append(content);
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
        if (content.length === 0) {
            if (var_cache['exp_cache_'+type].content !== undefined) {
                content = var_cache['exp_cache_'+type].content;
            } else {
                var_cache.source[type].li.addClass('timeout');
            }
        }
        var_cache.source[type].li.removeClass('loading');
        content_write(type, content);
        var_cache['exp_cache_'+type].content = content;
        var storage = {};
        storage['exp_cache_'+type] = var_cache['exp_cache_'+type];
        if (content.length === 0) {
            storage['exp_cache_'+type].errorTimeout = parseInt(Date.now() / 1000 + 60 * 60 * 2);
            delete storage['exp_cache_'+type].keepAlive;
        }
        mono.storage.set(storage, function() {
            if ( engine.settings.enableFavoriteSync === 1 && type === 'favorites' ) {
                mono.storage.sync.set(storage);
            }
        });
    };
    var xhr_send = function(type, source, page, page_mode) {
        source.xhr_wait_count++;
        source.xhr.push(
            engine.ajax({
                url: (page_mode)?source.url.replace('%page%', page):source.url,
                safe: true,
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
    var getCacheDate = function(keepAlive) {
        if (!keepAlive) {
            return undefined;
        }
        var currentDate = new Date();
        var day = currentDate.getDay();
        var hours = currentDate.getHours();
        var minutes = currentDate.getMinutes();
        var seconds = currentDate.getSeconds();
        var lastDay = 0;
        keepAlive.forEach(function(num) {
            if (day >= num) {
                lastDay =  num;
            }
        });
        day = day - lastDay;
        return parseInt(currentDate.getTime() / 1000) - day*24*60*60 - hours*60*60 - minutes*60 - seconds;
    };
    var load_content = function(type) {
        var storage_type = ( engine.settings.enableFavoriteSync === 1 && type === 'favorites' )?'sync':'local';
        mono.storage[storage_type].get('exp_cache_'+type, function onGetFromStorage(storage) {

            if (type === 'favorites' && storage_type === 'sync' && storage['exp_cache_'+type] === undefined) {
                storage_type = 'local';
                return mono.storage.local.get('exp_cache_'+type, onGetFromStorage);
            }

            if (typeof storage['exp_cache_'+type] === 'string') {
                try {
                    storage['exp_cache_' + type] = JSON.parse(storage['exp_cache_' + type]);
                } catch (e) {
                    storage['exp_cache_' + type] = undefined;
                }
            }

            var cache = storage['exp_cache_'+type] || {};
            var_cache['exp_cache_'+type] = cache;
            if (type === 'kp_favorites' || type === 'favorites') {
                content_write(type, cache.content);
                return;
            }
            var source = content_options[type];
            var date = getCacheDate(source.keepAlive);
            if (cache.errorTimeout !== undefined && cache.errorTimeout > parseInt(Date.now() / 1000) ) {
                var_cache.source[type].li.addClass('timeout');
                return;
            }
            if (cache.keepAlive === date || navigator.onLine === false) {
                content_write(type, cache.content);
                return;
            }
            var_cache.source[type].li.addClass('loading');
            var_cache['exp_cache_'+type].keepAlive = date;
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
                });
            }
            source.xhr = [];
            source.xhr_wait_count = 0;
            source.xhr_content = [];
            for (var i = source.page_start; i <= source.page_end; i++) {
                xhr_send(type, source, i, page_mode);
            }
        });
    };
    var load_topList = function() {
        mono.storage.get('topList', function(storage) {

            if (typeof storage.topList === 'string') {
                try {
                    storage.topList = JSON.parse(storage.topList);
                } catch (e) {
                    storage.topList = undefined;
                }
            }

            var cache = storage.topList || {};
            var_cache.topList = cache;
            var date = getCacheDate([0,1,2,3,4,5,6]);
            if (cache.keepAlive === date || navigator.onLine === false) {
                topList_write();
                return;
            }
            var_cache.topList.keepAlive = date;
            var onSuccess = function(data) {
                var keywords = data.keywords;
                keywords.sort(function(a, b) {
                    if (a.weight === b.weight) {
                        return 0;
                    } else
                    if (a.weight > b.weight) {
                        return -1;
                    }
                    return 1;
                });
                var_cache.topList.content = keywords;
                topList_write();
                mono.storage.set({topList: var_cache.topList});
            };
            var oldStatic = function() {
                engine.ajax({
                    url: "http://antoshka.on.ufanet.ru/top.json",
                    dataType: 'json',
                    cache: false,
                    success: onSuccess,
                    error: function() {
                        if (var_cache.topList.content === undefined) {
                            return;
                        }
                        topList_write();
                    }
                });
            };
            engine.ajax({
                localXhr: true,
                url: "http://static.tms.mooo.com/top.json",
                dataType: 'json',
                cache: false,
                success: onSuccess,
                error: oldStatic
            });
        });
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
                if (str_w !== 0) {
                    var_cache.calculateMovebleCache[text] = '';
                }
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
                var keyframeStyle = '{'
                    +   '0%{margin-left:2px;}'
                    +   '50%{margin-left:-' + (str_w - size) + 'px;}'
                    +   '90%{margin-left:6px;}'
                    +   '100%{margin-left:2px;}'
                    + '}';
                styles.push(
                    $('<style>', {'class': move_name, text: '@-webkit-keyframes a_' + move_name
                    + keyframeStyle
                    + '@keyframes a_' + move_name
                    + keyframeStyle
                    + '@-moz-keyframes a_' + move_name
                    + keyframeStyle
                    + '@-o-keyframes a_' + move_name
                    + keyframeStyle
                    + 'div.' + move_name + ':hover > span {'
                    +   'overflow: visible;'
                    +   '-webkit-animation:a_' + move_name + ' ' + time_calc + 's;'
                    +   '-moz-animation:a_' + move_name + ' ' + time_calc + 's;'
                    +   '-o-animation:a_' + move_name + ' ' + time_calc + 's;'
                    +   'animation:a_' + move_name + ' ' + time_calc + 's;'
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
    var limitObjSize = function(obj, count) {
        var i;
        var arr = [];
        for (i in obj) {
            if (obj.hasOwnProperty(i) === false) {
                continue;
            }
            arr.push(i);
        }
        var arr_len = arr.length;
        if (arr_len < count) {
            return;
        }
        var end = arr_len - count;
        for (i = 0; i < end; i++) {
            delete obj[arr[i]];
        }
    };
    var setQuality = function(type, index, quality, request, cache) {
        /**
         * quality = {qualityBox, url, hlTitle}
         */
        var quality_len = quality.length;
        if (quality_len !== 0 && cache === undefined) {
            if (mono.isChrome || type === 'favorites' || type === 'kp_favorites') {
                var_cache.qualityCache[request] = quality;
            }
            var_cache.qualityBoxCache[request] = quality[0].qualityBox;
            clearTimeout(var_cache.qualityCacheTimer);
            var_cache.qualityCacheTimer = setTimeout(function(){
                limitObjSize(var_cache.qualityCache, var_cache.qualityCache_limit);
                limitObjSize(var_cache.qualityBoxCache, var_cache.qualityBoxCache_limit);
                var storage = {};
                storage.qualityCache = var_cache.qualityCache;
                storage.qualityBoxCache =var_cache.qualityBoxCache;
                mono.storage.set(storage);
            }, 1000);
        }
        if (var_cache.qulityList[type][index] === undefined) {
            return;
        }
        var $quality = var_cache.qulityList[type][index];
        if (quality_len === 0) {
            $quality.children('span').text('-');
            return;
        }
        $quality.children('span').text( quality[0].qualityBox );
        if ($quality.children('info_popup').length === 0) {
            $quality.append( dom_cache.info_popup );
            var btn_offset = $quality.offset();
            var top = btn_offset.top+17;
            var left = btn_offset.left - 150 + 8;
            var left_pos = left;
            var corner_pos = 0;
            if (left_pos + 300 > var_cache.window_width) {
                left_pos = var_cache.window_width - 300;
                corner_pos = 150 + (left - left_pos);
            } else if ( left_pos < 0 ) {
                left_pos = 0;
                corner_pos = btn_offset.left + 8;
            }
            dom_cache.info_popup.offset({top: top, left: left_pos});
            var popup = dom_cache.info_popup.children();
            popup.children('div.corner').css('left',(corner_pos === 0)?'50%':(corner_pos+'px'));
        }
        var ul = popup.children('div.content').children('ul');
        var content = [];
        for (var i = 0, item; item = quality[i]; i++) {
            var a = $('<a>',{href: item.url, target: '_blank'}).data('title', item.hlTitle).data('href', item.url).data('request', request).data('tracker', item.tracker).html(item.hlTitle);
            a.attr('title', a.text());
            content.push( $('<li>').append(a) );
        }
        ul.get(0).textContent = '';
        ul.append( content );
    };
    var getDescription = function(request) {
        if (var_cache.about_cache[request] !== undefined) {
            view.setDescription(var_cache.about_cache[request]);
            return;
        }
        engine.ajax({
            url: 'https://www.google.com/search?q='+request,
            safe: true,
            success: function(data) {
                content_parser.google(data, request);
            }
        });
    };
    var getBrowserName = function() {
        var browser = '';
        if(navigator && navigator.userAgent) {
            if(navigator.userAgent.indexOf('OPR\/') !== -1) {
                browser = 'opera';
            } else
            if(navigator.userAgent.indexOf('Opera\/') !== -1) {
                browser = 'opera';
            } else
            if(navigator.userAgent.indexOf('Firefox\/') !== -1) {
                browser = 'firefox';
            } else
            if(navigator.userAgent.indexOf('Chrome\/') !== -1) {
                browser = 'chrome';
            } else
            if(navigator.userAgent.indexOf('Safari\/') !== -1) {
                browser = 'safari';
            }
        }
        return browser;
    };
    return {
        show: function() {
            if (dom_cache.explore_container !== undefined) {
                var_cache.mode = 1;
                if (var_cache.needResize === 1) {
                    var_cache.needResize = 0;
                    dom_cache.window.trigger('resize');
                }
                dom_cache.explore_container.show();
                return;
            }
            var_cache.mode = 1;
            $.each(engine.def_listOptions, function(key, value){
                if (listOptions.hasOwnProperty(key) === false) {
                    listOptions[key] = $.extend({},value);
                }
            });
            dom_cache.explore_container = $( document.getElementById('explore_container') );
            dom_cache.explore_gallery = $( document.getElementById('explore_gallery') );
            dom_cache.top_search = $( document.getElementById('top_search') );
            dom_cache.body = $( document.body );
            dom_cache.window = $( window );
            dom_cache.info_popup = $( document.getElementById('info_popup') );

            var_cache.window_width = dom_cache.window.width();
            if (engine.settings.hideTopSearch === 0) {
                load_topList();
            }

            if (mono.isWebApp) {
                listOptions = {};
                var currentBrowser = undefined;
                var domList = {};
                dom_cache.explore_gallery.after(
                    $('<div>', {id: 'explore_download_extension'}).append([
                        $('<h1>', {
                            text: _lang.downloadExtensionTitle
                        }),
                        currentBrowser = $('<div>', {
                            class: 'currentBrowser'
                        }),
                        $('<div>', {
                            class: 'browserList'
                        }).append((function(){
                            var obj = {
                                safari: {
                                    title: 'Safari',
                                    link: 'http://static.tms.mooo.com/safari/build_safari.safariextz'
                                },
                                chrome: {
                                    title: 'Chrome',
                                    link: 'https://chrome.google.com/webstore/detail/ngcldkkokhibdmeamidppdknbhegmhdh'
                                },
                                firefox: {
                                    title: 'Firefox',
                                    link: 'http://static.tms.mooo.com/firefox/build_firefox.xpi'
                                },
                                opera: {
                                    title: 'Opera',
                                    link: 'https://addons.opera.com/ru/extensions/details/torrents-multisearch/'
                                }
                            };
                            var list = [];
                            for (var key in obj) {
                                var item = obj[key];
                                list.push(domList[key] = $('<a>', {
                                    href: item.link,
                                    class: key,
                                    target: '_blank'
                                }).append([
                                    $('<img>', {src: 'web/'+key+'.png'}),
                                    $('<p>', {
                                        text: item.title
                                    })
                                ]));
                            }
                            return list;
                        })())
                    ])
                );
                var browser = getBrowserName();
                currentBrowser.append(domList[browser] || $('<img>', {
                    src: 'images/icon_128.png'
                }));
                /*
                if (browser === 'chrome') {
                    var url = 'https://chrome.google.com/webstore/detail/ngcldkkokhibdmeamidppdknbhegmhdh';
                    $(document.head).append($('<link>', {
                        rel: 'chrome-webstore-item',
                        href: url
                    }));
                    domList[browser].on('click', function(e) {
                        e.preventDefault();
                        chrome.webstore.install(url, function(){
                            console.log('a', arguments);
                        },
                        function() {
                            console.log('b', arguments);
                        });
                    });
                }
                */
            }

            $.each(listOptions, function(type, item) {
                if (item.e === 0) {
                    return 1;
                }
                var source = content_options[type];
                var custom_menu = [];
                if (type === 'kp_favorites') {
                    custom_menu.push(
                        $('<a>', {'class': 'open', href: source.url.replace('%page%', 1).replace('%category%', engine.settings.kinopoiskFolderId), target: '_blank', title: _lang.exp_btn_open}).data('type', type),
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
                dom_cache.explore_gallery.append(var_cache.source[type].li);
                if (item.s === 1) {
                    load_content(type);
                }
            });

            setTimeout(function(){
                dom_cache.explore_container.removeClass('loading');
            }, 30);

            dom_cache.explore_gallery.on('mouseover', 'ul.page_body > li', function () {
                var $this = $(this);
                var page = $this.data('page');
                var type = $this.data('type');
                var body_height = var_cache.source[type].body.height();
                var_cache.source[type].body.css('min-height', body_height);
                var_cache.source[type].body_height = body_height;
                var content = var_cache['exp_cache_'+type].content;
                content_write(type, content, page);
            });
            dom_cache.explore_gallery.on('click', 'div.head', function(e) {
                var isHead = e.target.classList.contains('head');
                var isBtn = e.target.classList.contains('collapses');
                if (!isBtn && !isHead) {
                    return;
                }
                e.preventDefault();
                var $this = $(e.target);
                if (isHead) {
                    $this = $this.children('div.collapses');
                }
                var type = $this.data('type');
                if (var_cache.isCollapsing === 1) {
                    return;
                }
                if ($this.hasClass('down') === true) {
                    listOptions[type].s = 0;
                    $this.removeClass('down').addClass('up');
                    var_cache.source[type].li.addClass('collapsing');
                    var_cache.isCollapsing = 1;
                    setTimeout(function(){
                        var_cache.isCollapsing = undefined;
                        var_cache.source[type].li.removeClass('collapsing').addClass('collapsed');
                    }, 200);
                } else {
                    listOptions[type].s = 1;
                    $this.removeClass('up').addClass('down');
                    var_cache.source[type].li.removeClass('collapsed');
                    if (var_cache.source[type].pages === undefined) {
                        load_content(type);
                    }
                }
                mono.storage.set({listOptions: JSON.stringify(listOptions) });
            });
            dom_cache.explore_gallery.on('click', 'div.action > div.setup', function (e){
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
                        mono.storage.set({listOptions: JSON.stringify(listOptions) });
                    }
                });
                setup_body.toggleClass('show');
            });
            dom_cache.explore_gallery.on('click', 'div.action > div.update', function(e){
                var $this = $(this);
                var type = $this.data('type');
                if (navigator.onLine === false) {
                    return;
                }
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
                    source.xhr = engine.ajax({
                        url: source.url.replace('%page%', page).replace('%category%', engine.settings.kinopoiskFolderId),
                        safe: true,
                        success: function(data) {
                            data = content_parser.kp_favorites(data);
                            if (data === undefined) {
                                $this.addClass('error');
                                return;
                            }
                            var new_count = 0;
                            for (var i = 0, item; item = data[i]; i++) {
                                if (w_check_obj[item.url] !== undefined) {
                                    continue;
                                }
                                w_check_obj[item.url] = 1;
                                content.push(item);
                                new_count++;
                            }
                            if (new_count !== 0 && page_limit > 0) {
                                page++;
                                page_limit--;
                                load_page(page);
                                return;
                            }
                            var current_page = var_cache.source[type].current_page;
                            content_write(type, content, current_page, 1);
                            var_cache['exp_cache_'+type] = {keepAlive: 0, content: content};
                            var storage = {};
                            storage['exp_cache_'+type] = var_cache['exp_cache_'+type];
                            mono.storage.set(storage, function() {
                                if ( engine.settings.enableFavoriteSync === 1 && type === 'favorites' ) {
                                    mono.storage.sync.set(storage);
                                }
                            });
                            $this.removeClass('loading');
                        },
                        error: function(){
                            $this.removeClass('loading').addClass('error');
                        }
                    });
                };
                load_page(1);
            });
            dom_cache.explore_gallery.on('click', 'div.picture > div.inFavorite', function(e){
                var $this = $(this);
                var type = 'favorites';
                if (var_cache['exp_cache_'+type].content === undefined) {
                    var_cache['exp_cache_'+type].content = [];
                }
                var_cache['exp_cache_'+type].content.push($this.data('item'));
                var page = var_cache.source[type].current_page;
                content_write(type, var_cache['exp_cache_'+type].content, page, 1);
                var storage = {};
                storage['exp_cache_'+type] = var_cache['exp_cache_'+type];
                mono.storage.set(storage, function() {
                    if ( engine.settings.enableFavoriteSync === 1 && type === 'favorites' ) {
                        mono.storage.sync.set(storage);
                    }
                });
            });
            dom_cache.explore_gallery.on('click', 'div.picture > div.rmFavorite', function(e){
                var $this = $(this);
                var type = 'favorites';
                var index = $this.data('index');
                var_cache['exp_cache_'+type].content.splice(index,1);
                var page = var_cache.source[type].current_page;
                content_write(type, var_cache['exp_cache_'+type].content, page, 1);
                var storage = {};
                storage['exp_cache_'+type] = var_cache['exp_cache_'+type];
                mono.storage.set(storage, function() {
                    if ( engine.settings.enableFavoriteSync === 1 && type === 'favorites' ) {
                        mono.storage.sync.set(storage);
                    }
                });
            });
            dom_cache.explore_gallery.on('click', 'div.picture > div.edit', function(e){
                var $this = $(this);
                var type = 'favorites';
                var index = $this.data('index');
                var item = var_cache['exp_cache_'+type].content[index];
                notify([{type: 'input',value: item.title, text: _lang.exp_edit_fav_label0},
                    {type: 'input',value: item.img, text: _lang.exp_edit_fav_label1},
                    {type: 'input',value: item.url, text: _lang.exp_edit_fav_label2}],
                    _lang.apprise_btns0,_lang.apprise_btns1, function(arr){
                        if (arr === undefined) {
                            return;
                        }
                        item.title = arr[0];
                        item.img = arr[1];
                        item.url = arr[2];
                        var_cache['exp_cache_'+type].content[index] = item;
                        var page = var_cache.source[type].current_page;
                        content_write(type, var_cache['exp_cache_'+type].content, page, 1);
                        var storage = {};
                        storage['exp_cache_'+type] = var_cache['exp_cache_'+type];
                        mono.storage.set(storage, function() {
                            if ( engine.settings.enableFavoriteSync === 1 && type === 'favorites' ) {
                                mono.storage.sync.set(storage);
                            }
                        });
                    });
            });
            dom_cache.explore_gallery.on('click', 'div.picture > a.link', function(e){
                var $this = $(this);
                ga('send', 'event', 'About', 'keyword', $this.data('title'));
            });
            dom_cache.explore_gallery.on('click', 'div.quality', function(e) {
                var $this = $(this);
                var type = $this.data('type');
                var index = $this.data('index');
                var title = $this.data('title');
                $this.children('span').text('*');
                view.getQuality(title, type, index);
            });
            dom_cache.explore_gallery.on('mouseover', 'div.quality', function(e) {
                var $this = $(this);
                var title = $this.data('title');
                if (var_cache.qualityCache[title] === undefined) {
                    return;
                }
                var type = $this.data('type');
                var index = $this.data('index');
                setQuality(type, index, var_cache.qualityCache[title], title, 1);
            });
            dom_cache.explore_gallery.on('mouseover', 'div.quality > div.info_popup', function(e) {
                e.stopPropagation();
            });
            dom_cache.explore_gallery.on('click', 'div.quality > div.info_popup', function(e) {
                e.stopPropagation();
            });
            dom_cache.explore_gallery.on('click', 'div.quality > div.info_popup a', function() {
                var title = $(this).data('title');
                var request = $(this).data('request');
                var href = $(this).data('href');
                var tracker = $(this).data('tracker');
                view.addInClickHistory(request, title, href, tracker);
            });
            dom_cache.explore_gallery.on('change', 'div.setup_body > select.item_count', function(e){
                e.preventDefault();
                var $this = $(this);
                var type = $this.data('type');
                var content = var_cache['exp_cache_'+type].content;
                var page = var_cache.source[type].current_page;
                listOptions[type].c = parseInt(this.value);
                var_cache.source[type].body.css('min-height', 'auto');
                content_write(type, content, page, 1);
                mono.storage.set({listOptions: JSON.stringify(listOptions) });
            });
            dom_cache.explore_gallery.on('click','div.setup_body > div.default_size', function(e){
                e.preventDefault();
                var $this = $(this);
                var type = $this.data('type');
                listOptions[type].w = engine.def_listOptions[type].w;
                var_cache.source[type].title.children('div.setup_body').children('div.slider').slider({value: listOptions[type].w});
                var_cache.source[type].body.css('min-height', 'auto');
                var content = var_cache['exp_cache_'+type].content;
                var page = var_cache.source[type].current_page;
                calculateSize(type);
                var_cache.source[type].body.css('min-height', 'auto');
                content_write(type, content, page, 1);
                mono.storage.set({listOptions: JSON.stringify(listOptions) });
            });
            dom_cache.explore_gallery.sortable({
                axis: 'y',
                handle: 'div.head > div.move',
                scroll: false,
                start: function(e, ui) {
                    window.scrollTo(0,0);
                    dom_cache.explore_gallery.addClass('sort_mode');
                    var type = $(e.toElement).data('type');
                    $(this).data('type', type).sortable("refreshPositions");
                    ui.type = type;
                },
                stop: function(e, ui) {
                    dom_cache.explore_gallery.removeClass('sort_mode');
                    var lo = {};
                    var $li = dom_cache.explore_gallery.children('li');
                    for (var i = 0, len = $li.length; i < len; i++) {
                        var type = $li.eq(i).data('type');
                        lo[type] = listOptions[type];
                    }
                    $.each(listOptions, function(key, value){
                        if (lo.hasOwnProperty(key) === false) {
                            lo[key] = listOptions[key];
                        }
                    });
                    listOptions = lo;
                    mono.storage.set({listOptions: JSON.stringify(listOptions) });
                }
            });
            dom_cache.explore_container.sortable({
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
                        return;
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
                        if (next < index) {
                            content.splice(index, 1);
                            content.splice(next, 0, item);
                        } else {
                            content.splice(next, 0, item);
                            content.splice(index, 1);
                        }
                    }
                    var page = var_cache.source[type].current_page;
                    content_write(type, var_cache['exp_cache_'+type].content, page, 1);
                    var storage = {};
                    storage['exp_cache_'+type] = var_cache['exp_cache_'+type];
                    mono.storage.set(storage, function() {
                        if ( engine.settings.enableFavoriteSync === 1 && type === 'favorites' ) {
                            mono.storage.sync.set(storage);
                        }
                    });
                }
            });
            dom_cache.window.on('resize', function(e) {
                if (var_cache.mode === 0) {
                    var_cache.needResize = 1;
                    return;
                }
                clearTimeout(var_cache.resize_timer);
                var_cache.resize_timer = setTimeout(function(){
                    if (var_cache.resize_timer_work === 1) {
                        return;
                    }
                    var_cache.resize_timer_work = 1;
                    var cacheList = {};
                    var_cache.window_width = dom_cache.window.width();
                    var_cache.conteiner_width = var_cache.window_width - 180;
                    var columns_num = (var_cache.conteiner_width > 1275) ? 4 : 3;
                    if (engine.settings.hideTopSearch === 0 && var_cache.top_columns_num !== columns_num) {
                        topList_write();
                    }
                    for (var type in listOptions) {
                        if (listOptions.hasOwnProperty(type) === false
                            || listOptions[type].e === 0
                            || var_cache.source[type].body === undefined) {
                            continue;
                        }
                        var _options = listOptions[type];
                        var source = content_options[type];
                        var currentCount = source.onpage_count;
                        if (cacheList[_options.w] !== undefined) {
                            if (currentCount === cacheList[_options.w]) {
                                continue;
                            }
                            content_write(type, var_cache['exp_cache_'+type].content, var_cache.source[type].current_page, 1);
                            continue;
                        }
                        var line_count = _options.c;
                        var item_count = Math.ceil(var_cache.conteiner_width / (_options.w + 10*2)) - 1;
                        var onpage_count = item_count * line_count;
                        cacheList[_options.w] = onpage_count;
                        if (currentCount === onpage_count) {
                            continue;
                        }
                        content_write(type, var_cache['exp_cache_'+type].content, var_cache.source[type].current_page, 1);
                    }
                    var_cache.resize_timer_work = 0;
                }, 250);
            });
            if (mono.isChrome && engine.settings.enableFavoriteSync === 1) {
                chrome.storage.onChanged.addListener(function(changes) {
                    for (var key in changes) {
                        if (changes.hasOwnProperty(key) === false) {
                            continue;
                        }
                        if (key !== "exp_cache_favorites") {
                            continue;
                        }
                        var type = 'favorites';
                        var_cache['exp_cache_'+type] = changes[key].newValue;
                        if (var_cache.source[type].body === undefined || var_cache.mode === 0) {
                            continue;
                        }
                        var page = var_cache.source[type].current_page;
                        content_write(type, var_cache['exp_cache_'+type].content, page, 1);
                    }
                });
            }
        },
        hide: function(){
            if (dom_cache.explore_container === undefined) {
                return;
            }
            var_cache.mode = 0;
            dom_cache.explore_container.hide();
        },
        getDescription: getDescription,
        setQuality: setQuality,
        boot: function(cb) {
            if (mono.isChrome) {
                var_cache.qualityCache_limit = 100;
                var_cache.qualityBoxCache_limit = 200;
            }
            mono.storage.get(['qualityCache', 'qualityBoxCache', 'listOptions'], function(storage) {

                if (typeof storage.qualityCache === 'string') {
                    try {
                        storage.qualityCache = JSON.parse(storage.qualityCache);
                    } catch (e) {
                        storage.qualityCache = undefined;
                    }
                }
                if (typeof storage.qualityBoxCache === 'string') {
                    try {
                        storage.qualityBoxCache = JSON.parse(storage.qualityBoxCache);
                    } catch (e) {
                        storage.qualityBoxCache = undefined;
                    }
                }

                var_cache.qualityCache = storage.qualityCache || {};
                var_cache.qualityBoxCache = storage.qualityBoxCache || {};

                try {
                    listOptions = JSON.parse(storage.listOptions || '{}');
                } catch (e) {
                    listOptions = {};
                }
                settings = engine.settings;

                content_options.favorites.title = _lang.exp_items_favorites;
                content_options.kp_favorites.title = _lang.exp_items_kp_favorites;
                content_options.kp_in_cinema.title = _lang.exp_items_kp_in_cinema;
                content_options.kp_popular.title = _lang.exp_items_kp_popular;
                content_options.kp_serials.title = _lang.exp_items_kp_serials;
                content_options.imdb_in_cinema.title = _lang.exp_items_imdb_in_cinema;
                content_options.imdb_popular.title = _lang.exp_items_imdb_popular;
                content_options.imdb_serials.title = _lang.exp_items_imdb_serials;
                content_options.gg_games_top.title = _lang.exp_items_gg_games_top;
                content_options.gg_games_new.title = _lang.exp_items_gg_games_new;

                cb && cb();
            });
        }
    };
}();