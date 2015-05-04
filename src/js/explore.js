/**
 * Created by Anton on 02.05.2015.
 */
var explore = {
    domCache: {
        container: document.getElementById('explore_block'),
        gallery: document.getElementById('explore_gallery'),
        topSearch: document.getElementById('top_search'),
        infoPopup: document.getElementById('info_popup')
    },
    varCache: {
        isHidden: true,
        topListColumnCount: undefined,
        categoryList: {}
    },
    sourceOptions: {
        favorites: {
            maxWidth: 120,
            noAutoUpdate: 1
        },
        kp_favorites: {
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/mykp/movies/list/type/%category%/page/%page%/sort/default/vector/desc/vt/all/format/full/perpage/25/',
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/',
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url=',
            noAutoUpdate: 1
        },
        kp_in_cinema: {//new in cinema
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/afisha/new/page/%page%/',
            keepAlive: [2, 4, 6],
            pageEnd: 2,
            pageStart: 0,
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/',
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_popular: {
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/popular/day/now/perpage/200/',
            keepAlive: [0, 3],
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/',
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_serials: {
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/top/lists/45/',
            keepAlive: [0],
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/',
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_in_cinema: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/movies-in-theaters/',
            keepAlive: [2, 4, 6],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/',
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_popular: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=feature',
            keepAlive: [0 , 2],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/',
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_serials: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=tv_series',
            keepAlive: [0],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/',
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        gg_games_top: {//best
            rootUrl: 'http://gameguru.ru',
            maxWidth: 120,
            url: 'http://gameguru.ru/pc/games/rated/page%page%/list.html',
            keepAlive: [0],
            pageEnd: 5,
            pageStart: 1,
            baseUrl: 'http://gameguru.ru/pc/games/',
            imgUrl: 'http://gameguru.ru/f/games/',
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=220&rewriteMime=image/jpeg&url='
        },
        gg_games_new: {//new
            rootUrl: 'http://gameguru.ru',
            maxWidth: 120,
            url: 'http://gameguru.ru/pc/games/released/page%page%/list.html',
            keepAlive: [2, 4],
            pageEnd: 5,
            pageStart: 1,
            baseUrl: 'http://gameguru.ru/pc/games/',
            imgUrl: 'http://gameguru.ru/f/games/',
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=220&rewriteMime=image/jpeg&url='
        }
    },
    content_parser: function () {
        var prepareObj = function(obj) {
            for (var key in item) {
                var item = obj[key];
                if (typeof item !== 'string' || !item) return;
                obj[key] = exKit.contentUnFilter(spaceReplace(obj[key]));
            }
            return 1;
        };
        var kp_img_url = function(url) {
            return url.replace(/\/film\/([0-9]*)\//, '$1.jpg');
        };
        var kp_img_url2 = function(url) {
            return url.replace(/.*film\/([0-9]*)\.jpg/, '$1.jpg');
        };
        var imdb_img_url = function(i) {
            i = i.replace(/.*\/images\/(.*)_V1.*/, '$1_V1_SX120_.jpg');
            return i;
        };
        var getYear = function(text) {
            return parseInt(text.replace(/.*\([^\(]*([1-2]{1}[0-9]{3})[^\)]*\).*/g, '$1'));
        };
        var rmYear = function(text) {
            return text.replace(/(.*) \([^\(]*[0-9]{4}[^\)]*\).*/, '$1').trim();
        };
        var rmSerial = function(text) {
            return text.replace(' (сериал)', '').trim();
        };
        var spaceReplace = function(text) {
            return text.replace(/[\s\xA0]/g, ' ');
        };

        var gg_games_new = function(content) {
            var dom = exKit.parseHtml(exKit.contentFilter(content));

            var elList = dom.querySelectorAll('.cnt-box-td .enc-tab1 .enc-box-list > .enc-item');
            var arr = [];
            for (var i = 0, el; el = elList[i]; i++) {
                var img = el.querySelector('.im img');
                img !== null && (img = img.getAttribute('src'));

                var title = el.querySelector('.e-title a');
                title !== null && (title = title.textContent);

                var url = el.querySelector('.e-title a');
                url !== null && (url = url.getAttribute('href'));

                var obj = {
                    img: img,
                    title: title,
                    url: url
                };

                if (!prepareObj(obj)) {
                    console.log("Explorer gg_games_new have problem!");
                    continue;
                }
                obj.img = obj.img.replace('/f/games/','');
                obj.title = obj.title.trim();
                arr.push(obj);
            }
            return arr;
        };
        return {
            kp_favorites: function(content) {
                var dom = exKit.parseHtml(exKit.contentFilter(content));
                if (dom.querySelector('#login')) {
                    return {requireAuth: 1};
                }
                var elList = dom.querySelectorAll('#itemList > li.item');
                var arr = [];
                for (var i = 0, el; el = elList[i]; i++) {
                    var img = el.querySelector('img.poster[title]');
                    img !== null && (img = img.getAttribute('title'));

                    var title = el.querySelector('div.info > a.name');
                    title !== null && (title = title.textContent);

                    var titleEn = el.querySelector('div.info > span');
                    titleEn !== null && (titleEn = titleEn.textContent);

                    var url = el.querySelector('div.info > a.name');
                    url !== null && (url = url.getAttribute('href'));

                    var obj = {
                        img: img,
                        title: title,
                        title_en: titleEn,
                        url: url
                    };

                    if (!prepareObj(obj)) {
                        console.log("Explorer kp_favorites have problem!");
                        continue;
                    }

                    obj.img = kp_img_url2('http://st.kinopoisk.ru' + obj.img);
                    title = obj.title;
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
                var dom = exKit.parseHtml(exKit.contentFilter(content));

                var threeD = dom.querySelectorAll('div.filmsListNew > div.item div.threeD');
                for (var i = 0, el; el = threeD[i]; i++) {
                    var parent = threeD.parentNode;
                    parent && parent.removeChild(threeD);
                }

                var elList = dom.querySelectorAll('div.filmsListNew > div.item');
                var arr = [];
                for (var i = 0, el; el = elList[i]; i++) {
                    var img = el.querySelector('div > a > img');
                    img !== null && (img = img.getAttribute('src'));

                    var title = el.querySelector('div > div.name > a');
                    title !== null && (title = title.textContent);

                    var titleEn = el.querySelector('div > div.name > span');
                    titleEn !== null && (titleEn = titleEn = titleEn.textContent);

                    var url = el.querySelector('div > div.name > a');
                    url !== null && (url = url.getAttribute('href'));

                    var obj = {
                        img: img,
                        title: title,
                        title_en: titleEn,
                        url: url
                    };

                    if (!prepareObj(obj)) {
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
                var dom = exKit.parseHtml(exKit.contentFilter(content));

                var elList = dom.querySelectorAll('div.stat > div.el');
                var arr = [];
                for (var i = 0, el; el = elList[i]; i++) {
                    var img = el.querySelector('a');
                    img !== null && (img = img.getAttribute('href'));

                    var title = el.querySelector('a');
                    title !== null && (title = title.textContent);

                    var titleEn = el.querySelector('i');
                    titleEn !== null && (titleEn = titleEn.textContent);

                    var url = el.querySelector('a');
                    url !== null && (url = url.getAttribute('href'));

                    var obj = {
                        img: img,
                        title: title,
                        title_en: titleEn,
                        url: url
                    };

                    if (!prepareObj(obj)) {
                        console.log("Explorer kp_popular have problem!");
                        continue;
                    }
                    obj.img = kp_img_url(obj.img);
                    var year = getYear(obj.title);
                    obj.title = rmYear(obj.title);
                    if (!isNaN(year)) {
                        obj.title += ' '+year;
                        if (obj.title_en !== null) {
                            obj.title_en += ' '+year;
                        }
                    }
                    arr.push(obj);
                }
                return arr;
            },
            kp_serials : function(content) {
                var dom = exKit.parseHtml(exKit.contentFilter(content));

                var elList = dom.querySelectorAll('#itemList > tbody > tr');
                var arr = [];
                for (var i = 0, el; el = elList[i]; i++) {
                    var img = el.querySelector('td > div > a');
                    img !== null && (img = img.getAttribute('href'));

                    var title = el.querySelector('td > div > a');
                    title !== null && (title = title.textContent);

                    var titleEn = el.querySelector('td > div > span');
                    titleEn !== null && (titleEn = titleEn.textContent);

                    var url = el.querySelector('td > div > a');
                    url !== null && (url = url.getAttribute('href'));

                    var obj = {
                        img: img,
                        title: title,
                        title_en: titleEn,
                        url: url
                    };

                    if (!prepareObj(obj)) {
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
                var dom = exKit.parseHtml(exKit.contentFilter(content));

                var elList = dom.querySelectorAll('table.nm-title-overview-widget-layout');
                var arr = [];
                for (var i = 0, el; el = elList[i]; i++) {
                    var img = el.querySelector('div.image img');
                    img !== null && (img = img.getAttribute('src'));

                    var title = el.querySelector('*[itemprop="name"] a');
                    title !== null && (title = title.textContent);

                    var url = el.querySelector('*[itemprop="name"] a');
                    url !== null && (url = url.getAttribute('href'));

                    var obj = {
                        img: img,
                        title: title,
                        url: url
                    };

                    if (!prepareObj(obj)) {
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
                var dom = exKit.parseHtml(exKit.contentFilter(content));

                var elList = dom.querySelectorAll('table.results > tbody > tr.detailed');
                var arr = [];
                for (var i = 0, el; el = elList[i]; i++) {
                    var img = el.querySelector('td.image img');
                    img !== null && (img = img.getAttribute('src'));

                    var title = el.querySelector('td.title > a');
                    title !== null && (title = title.textContent);

                    var url = el.querySelector('td.title > a');
                    url !== null && (url = url.getAttribute('href'));

                    var obj = {
                        img: img,
                        title: title,
                        url: url
                    };

                    if (!prepareObj(obj)) {
                        console.log("Explorer imdb_popular have problem!");
                        continue;
                    }
                    obj.img = imdb_img_url(obj.img);
                    arr.push(obj);
                }
                return arr;
            },
            imdb_serials: function(content) {
                var dom = exKit.parseHtml(exKit.contentFilter(content));

                var elList = dom.querySelectorAll('table.results > tbody > tr.detailed');
                var arr = [];
                for (var i = 0, el; el = elList[i]; i++) {
                    var img = el.querySelector('td.image img');
                    img !== null && (img = img.getAttribute('src'));

                    var title = el.querySelector('td.title > a');
                    title !== null && (title = title.textContent);

                    var url = el.querySelector('td.title > a');
                    url !== null && (url = url.getAttribute('href'));

                    var obj = {
                        img: img,
                        title: title,
                        url: url
                    };

                    if (!prepareObj(obj)) {
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
                content = exKit.contentFilter(content);
                var $content = $(exKit.parseHtml(content));
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
                    images.push(href.replace(/.*=http(.*)&imgref.*/, 'http$1'));
                }
                var info = {};
                var google_proxy = "https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=400&rewriteMime=image/jpeg&url=";
                if (images.length > 0) {
                    info.img = exKit.contentUnFilter(images[0]);
                }
                info.title = $content.find('div.kno-ecr-pt').text();
                info.type = $content.find('div.kno-ecr-st').text();
                var dom_desc = $content.find('div.kno-rdesc');
                info.desc_link_a = dom_desc.find('a').eq(-1);
                info.desc_link_title = info.desc_link_a.text();
                info.desc_link = info.desc_link_a.attr('href');
                if (info.desc_link !== undefined) {
                    info.desc_link = $('<a>', {href: exKit.contentUnFilter(info.desc_link), text: info.desc_link_title, target: '_blank'});
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
                explore.limitObjSize(explore.varCache.about_cache, 10);
                explore.varCache.about_cache[request] = '<div>'+content_info.html()+'</div>';
                // view.setDescription(content_info);
                // todo: fix me
            }
        }
    }(),
    getCacheDate: function(keepAlive) {
        "use strict";
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
    },
    getTopListColumnCount: function() {
        "use strict";
        var width = document.body.clientWidth;
        return width > 1275 ? 4 : 3;
    },
    writeTopList: function(content) {
        "use strict";
        if (!content || !content.length) return;

        var columnCount = this.getTopListColumnCount();

        var lineIcon;
        var lineIconStyle;
        var column = 1;
        var line = 1;
        var request;
        var body = mono.create('ul', {
            class: 'c' + columnCount
        });
        for (var i = 0, item; item = content[i]; i++) {
            if (line > 10) {
                break;
            }
            lineIcon = undefined;
            if (column % columnCount === 0) {
                lineIconStyle = ['info'];
                if (line < 6) {
                    lineIconStyle.push('t' + line);
                }
                lineIcon = mono.create('div', {
                    class: lineIconStyle
                });
            }
            request = item.text;
            if (item.year > 0) {
                request += ' ' + item.year;
            }
            body.appendChild(mono.create('li', {
                class: ['l'+line],
                append: [
                    lineIcon,
                    mono.create('span', {
                        title: request,
                        append: [
                            mono.create('a', {
                                href: '#?search=' + encodeURIComponent(request),
                                text: item.text
                            })
                        ]
                    })
                ]
            }));
            if (column % columnCount === 0) {
                line++;
            }
            column++;
        }

        this.domCache.topSearch.textContent = '';
        this.domCache.topSearch.appendChild(body);

        this.varCache.topListColumnCount = columnCount;
    },
    loadTopList: function() {
        "use strict";
        var cache = engine.topList;

        this.writeTopList(cache.content);

        var date = this.getCacheDate([0,1,2,3,4,5,6]);
        if (cache.keepAlive === date || !navigator.onLine) {
            return;
        }

        mono.ajax({
            url: "http://static.tms.mooo.com/top.json",
            dataType: 'json',
            cache: false,
            success: function(data) {
                if (data && data.keywords) {
                    (cache.content = data.keywords).sort(function(a, b) {
                        if (a.weight === b.weight) {
                            return 0;
                        } else
                        if (a.weight > b.weight) {
                            return -1;
                        }
                        return 1;
                    });

                    this.writeTopList(cache.content);

                    cache.keepAlive = date;
                    mono.storage.set({topList: cache});
                }
            }.bind(this)
        });
    },
    show: function() {
        "use strict";
        if (!this.varCache.isHidden) return;
        this.varCache.isHidden = true;

        this.once();
        this.domCache.container.classList.remove('hide');
    },
    hide: function() {
        "use strict";
        if (this.varCache.isHidden) return;
        this.varCache.isHidden = false;

        this.domCache.container.classList.add('hide');
    },
    writeCategoryContent: function () {
        "use strict";
    },
    limitObjSize: function(obj, count) {
        "use strict";
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
    },
    xhr_dune: function(type, source) {
        "use strict";
        source.xhr_wait_count--;
        if (source.xhr_wait_count !== 0) {
            return;
        }

        var cache = engine.exploreCache['expCache_' + type];
        var categoryObj = this.varCache.categoryList[type];

        var content = [];
        source.xhr_content.sort(function(a,b){return a[0] > b[0] ? 1 : -1;});
        for (var i = 0, list; list = source.xhr_content[i]; i++) {
            content = content.concat(list[1]);
        }

        if (content.length === 0) {
            if (cache.content !== undefined) {
                content = cache.content;
            } else {
                categoryObj.li.classList.add('timeout');
            }
            cache.keepAlive = undefined;
            cache.errorTimeout = parseInt(Date.now() / 1000 + 60 * 60 * 2);
        }

        categoryObj.li.classList.remove('loading');

        cache.content = content;
        this.writeCategoryContent(type, content);

        var storage = {};
        storage['expCache_'+type] = cache;
        mono.storage.set(storage, function() {
            if (engine.settings.enableFavoriteSync === 1 && type === 'favorites') {
                mono.storage.sync.set(storage);
            }
        });
    },
    xhr_send: function(type, source, page, page_mode) {
        "use strict";
        source.xhr_wait_count++;
        source.xhr.push(
            mono.ajax({
                url: (page_mode)?source.url.replace('%page%', page):source.url,
                success: function(data) {
                    source.xhr_content.push([page, this.content_parser[type](data)]);
                    this.xhr_dune(type, source);
                }.bind(this),
                error: function() {
                    this.xhr_dune(type, source);
                }.bind(this)
            })
        );
    },
    getCategoryContent: function(type) {
        "use strict";
        var cache = engine.exploreCache['expCache_' + type];
        var source = this.sourceOptions[type];
        if (source.noAutoUpdate) {
            this.writeCategoryContent(type, cache.content);
            return;
        }
        var date = this.getCacheDate(source.keepAlive);
        var categoryObj = this.varCache.categoryList[type];
        if (cache.errorTimeout && cache.errorTimeout > parseInt(Date.now() / 1000)) {
            categoryObj.li.classList.add('timeout');
            return;
        }
        if (cache.keepAlive === date || !navigator.onLine) {
            this.writeCategoryContent(type, cache.content);
            return;
        }
        categoryObj.li.classList.add('loading');
        cache.keepAlive = date;

        var page_mode = false;
        if (source.pageStart !== undefined && source.pageEnd !== undefined) {
            page_mode = true;
        } else {
            source.pageStart = 0;
            source.pageEnd = 0;
        }
        if (source.xhr) {
            source.xhr.forEach(function(item){
                item.abort();
            });
        }
        source.xhr = [];
        source.xhr_wait_count = 0;
        source.xhr_content = [];
        for (var i = source.pageStart; i <= source.pageEnd; i++) {
            this.xhr_send(type, source, i, page_mode);
        }
    },
    writeCategoryList: function () {
        "use strict";
        for (var i = 0, item; item = engine.explorerOptions[i]; i++) {
            if (!item.enable) continue;

            var source = this.sourceOptions[item.type];

            var actionList = document.createDocumentFragment();

            if (item.type === 'kp_favorites') {
                mono.create(actionList, {
                    append: [
                        mono.create('a', {
                            class: ['open'],
                            target: '_blank',
                            title: mono.language.goToTheWebsite,
                            href: source.url.replace('%page%', 1).replace('%category%', engine.settings.kinopoiskFolderId)
                        }),
                        mono.create('div', {
                            class: ['update'],
                            title: mono.language.update
                        })
                    ]
                });
            }

            mono.create(actionList, {
                append: [
                    mono.create('div', {
                        class: ['setup'],
                        title: mono.language.setupView
                    })
                ]
            });

            var categoryObj = this.varCache.categoryList[item.type] = {};
            this.domCache.gallery.appendChild(categoryObj.li = mono.create('li', {
                class: [!item.show ? 'collapsed' : undefined],
                data: {
                    type: item.type
                },
                append: [
                    categoryObj.head = mono.create('div', {
                        class: ['head'],
                        append: [
                            mono.create('div', {
                                class: ['move']
                            }),
                            mono.create('div', {
                                class: ['title'],
                                text: item.title || mono.language[item.lang]
                            }),
                            mono.create('div', {
                                class: ['action'],
                                append: actionList
                            }),
                            mono.create('div', {
                                class: ['setupBody'],
                                append: [
                                    mono.create('input', {
                                        type: 'range',
                                        name: 'imageWidth'
                                    }),
                                    mono.create('div', {
                                        class: ['defaultSize'],
                                        title: mono.language.default
                                    }),
                                    mono.create('select', {
                                        class: ['lineCount'],
                                        append: (function(){
                                            "use strict";
                                            var list = [];
                                            for (var i = 1; i < 7; i++) {
                                                list.push(
                                                    mono.create('option', {
                                                        text: i,
                                                        value: i
                                                    })
                                                );
                                            }
                                            return list;
                                        })()
                                    })
                                ]
                            }),
                            mono.create('div', {
                                class: ['collapses', item.show ? 'down' : undefined]
                            })
                        ]
                    })
                ]
            }));

            item.show && this.getCategoryContent(item.type);
        }
    },
    once: function once() {
        "use strict";
        if (once.inited) return;
        once.inited = 1;

        if (!engine.settings.hideTopSearch) {
            this.loadTopList();
            window.addEventListener('resize', mono.throttle(function onResize() {
                if (onResize.lock) return;
                onResize.lock = true;

                if (this.varCache.topListColumnCount !== this.getTopListColumnCount()) {
                    this.writeTopList(engine.topList.content);
                }
                onResize.lock = false;
            }.bind(this), 250));
        }

        this.writeCategoryList();
    }
};