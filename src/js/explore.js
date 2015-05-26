/**
 * Created by Anton on 02.05.2015.
 */
var explore = {
    domCache: {
        container: document.getElementById('explore_block'),
        gallery: document.getElementById('explore_gallery'),
        topSearch: document.getElementById('top_search'),
        infoPopup: document.getElementById('info_popup'),
        infoPopupCorner: document.querySelector('#info_popup .corner'),
        infoPopupList: document.querySelector('#info_popup ul')
    },
    varCache: {
        isHidden: true,
        topListColumnCount: undefined,
        categoryList: {},
        movebleStyleList: {},
        quickSearchResultList: [],
        requestObj: {},
        aboutCache: {}
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
            imgUrl: 'http://st.kinopoisk.ru/images/film/'
        },
        kp_popular: {
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/popular/day/now/perpage/200/',
            keepAlive: [0, 3],
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/'
        },
        kp_serials: {
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/top/lists/45/',
            keepAlive: [0],
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/'
        },
        imdb_in_cinema: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/movies-in-theaters/',
            keepAlive: [2, 4, 6],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/'
        },
        imdb_popular: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=feature',
            keepAlive: [0 , 2],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/'
        },
        imdb_serials: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=tv_series',
            keepAlive: [0],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/'
        },
        gg_games_top: {//best
            rootUrl: 'http://gameguru.ru',
            maxWidth: 120,
            url: 'http://gameguru.ru/pc/games/rated/page%page%/list.html',
            keepAlive: [0],
            pageEnd: 5,
            pageStart: 1,
            baseUrl: 'http://gameguru.ru/pc/games/',
            imgUrl: 'http://gameguru.ru/f/games/'
        },
        gg_games_new: {//new
            rootUrl: 'http://gameguru.ru',
            maxWidth: 120,
            url: 'http://gameguru.ru/pc/games/released/page%page%/list.html',
            keepAlive: [2, 4],
            pageEnd: 5,
            pageStart: 1,
            baseUrl: 'http://gameguru.ru/pc/games/',
            imgUrl: 'http://gameguru.ru/f/games/'
        }
    },
    content_parser: function () {
        "use strict";
        var prepareObj = function(obj) {
            for (var key in obj) {
                var item = obj[key];
                if (typeof item !== 'string' || !item) {
                    if (key === 'title_en') {
                        // console.log('English title is not found!', obj);
                        obj[key] = undefined;
                        continue;
                    }
                    return;
                }
                obj[key] = spaceReplace(exKit.contentUnFilter(item));
            }
            return 1;
        };
        var kpGetImgFileName = function(url) {
            var m = url.match(/film\/(\d+)/);
            return m && m[1] + '.jpg' || url;
        };
        var imdbGetImgFilename = function(url) {
            var m = url.match(/images\/(.+)_V1/);
            return m && m[1] + '_V1_SX120_.jpg' || url;
        };

        var kpGetYear = function(text) {
            var m = text.match(/\s+\(.*([1-2]\d{3}).*\)/);
            return m && parseInt(m[1]);
        };
        var kpRmYear = function(text) {
            return text.replace(/(.*)\s+\(.*([1-2]\d{3}).*\).*/, '$1').trim();
        };
        var kpRmDesc = function(text) {
            return text.replace(/(.*)\s+\(.*\)$/, '$1').trim();
        }

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
        var onGooglePosterError = function(picList) {
            var index = parseInt(this.dataset.index);
            this.dataset.index = ++index;

            var src;
            if (!(src = picList[index])) {
                this.style.display = 'none';
                return;
            }

            this.src = src;
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

                    obj.img = kpGetImgFileName(obj.img);

                    var isSerial = kpRmDesc(obj.title);
                    if (obj.title !== isSerial) {
                        // isSerial
                        obj.title = isSerial;
                        obj.title_en && (obj.title_en = kpRmYear(obj.title_en));
                    } else {
                        var year;
                        if (obj.title_en) {
                            year = kpGetYear(obj.title_en);
                            if (year) {
                                obj.title_en = kpRmYear(obj.title_en);
                                obj.title_en += ' ' + year;
                                obj.title += ' ' + year;
                            }
                        }
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

                    obj.img = kpGetImgFileName(obj.img);

                    var year;
                    if (obj.title_en) {
                        year = kpGetYear(obj.title_en);
                        if (year) {
                            obj.title_en = kpRmYear(obj.title_en);
                            obj.title_en += ' ' + year;
                            obj.title += ' ' + year;
                        }
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
                    var img = el.querySelectorAll('a')[1];
                    img && (img = img.getAttribute('href'));

                    var title = el.querySelectorAll('a')[1];
                    title && (title = title.textContent);

                    var titleEn = el.querySelector('i');
                    titleEn !== null && (titleEn = titleEn.textContent);

                    var url = el.querySelectorAll('a')[1];
                    url && (url = url.getAttribute('href'));

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

                    obj.img = kpGetImgFileName(obj.img);

                    var year = kpGetYear(obj.title);
                    if (year) {
                        obj.title = kpRmYear(obj.title);
                        obj.title += ' ' + year;
                        if (obj.title_en) {
                            obj.title_en += ' ' + year;
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

                    var title = el.querySelector('td~td > div > a');
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

                    obj.img = kpGetImgFileName(obj.img);

                    obj.title = kpRmDesc(obj.title);

                    if (obj.title_en) {
                        obj.title_en = kpRmYear(obj.title_en);
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

                    obj.img = imdbGetImgFilename(obj.img);

                    var year = kpGetYear(obj.title);
                    obj.title = kpRmYear(obj.title);

                    if (year) {
                        obj.title += ' '+year;
                    }

                    obj.url = obj.url.replace(/\?ref.*$/, '');

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

                    obj.img = imdbGetImgFilename(obj.img);

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

                    obj.img = imdbGetImgFilename(obj.img);

                    arr.push(obj);
                }
                return arr;
            },
            gg_games_new: gg_games_new,
            gg_games_top: gg_games_new,
            google: function(content, request, cb) {
                var urlObj = {
                    search: {
                        rootUrl: 'http://google.com/',
                        baseUrl: 'http://google.com/'
                    }
                };
                var dom = exKit.parseHtml(exKit.contentFilter(content));
                content = dom.querySelectorAll('#rhs_block ol')[0];
                if (!content) {
                    return;
                }

                var url;
                var linkList = content.querySelectorAll('a');
                for (var i = 0, node; node = linkList[i]; i++) {
                    url = node.href;
                    if (!url) {
                        continue;
                    }
                    url = exKit.urlCheck(urlObj, url);
                    node.setAttribute('href', url);
                }

                var info = {};

                var params;
                var picUrlList = [];
                var picList = content.querySelectorAll('a > img');
                for (i = 0, node; node = picList[i]; i++) {
                    var parentNode = node.parentNode;
                    url = parentNode.href;
                    if (!url) {
                        parentNode.removeChild(node);
                        continue;
                    }
                    url = exKit.contentUnFilter(url);
                    params = mono.parseParam(url);
                    if (params.imgurl) {
                        if (params.imgurl.substr(0, 4) !== 'http') {
                            continue;
                        }
                        picUrlList.push(params.imgurl);
                    }
                }
                var viaProxyLinkList = [];
                for (i = 0, url; url = picUrlList[i]; i++) {
                    viaProxyLinkList.push('https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=400&rewriteMime=image/jpeg&url=' + encodeURIComponent(url));
                }
                info.picList = viaProxyLinkList.concat(picUrlList);

                var titelNode;
                info.title = titelNode = content.querySelector('div.kno-ecr-pt');
                info.title !== null && (info.title = info.title.textContent);
                if (!info.title) {
                    return;
                }

                info.type = titelNode.nextElementSibling || content.querySelector('div.kno-ecr-st');
                info.type !== null && (info.type = info.type.textContent);

                var descNode = content.querySelector('div.kno-rdesc');
                if (!descNode) {
                    return;
                }

                var wikiLink = descNode.querySelectorAll('a');
                if (wikiLink.length > 0 && (wikiLink = wikiLink[wikiLink.length - 1])) {
                    url = wikiLink.dataset.href;
                    if (!url) {
                        url = wikiLink.href;
                    }
                    if (url) {
                        url = exKit.contentUnFilter(url);
                    }
                    info.wikiLink = mono.create('a', {
                        text: wikiLink.textContent,
                        href: url,
                        target: '_blank'
                    });
                    wikiLink.parentNode.removeChild(wikiLink);
                }

                info.desc = descNode.textContent;
                if (!info.desc) {
                    return;
                }

                info.otherItems = document.createDocumentFragment();
                var otherItems = content.querySelectorAll('div.kno-fb-ctx > .kno-fv');
                for (i = 0, node; node = otherItems[i]; i++) {
                    var prevEl = node.previousElementSibling;

                    var lastEl = node.lastElementChild;
                    if (lastEl && lastEl.tagName === 'A' && lastEl.firstChild.nodeType === 1) {
                        var lPP, lP;
                        if ((lP = lastEl.previousElementSibling) && lP.textContent === ' ' &&
                            (lPP = lP.previousElementSibling) && lPP.textContent === ',') {
                                node.removeChild(lastEl);
                                node.removeChild(lPP);
                                node.removeChild(lP);
                        }
                    }

                    var value = node.textContent;
                    if (!prevEl || !value) continue;
                    var key = prevEl.textContent;
                    if (!key) {
                        continue;
                    }
                    info.otherItems.appendChild(mono.create('div', {
                        class: 'table',
                        append: [
                            mono.create('span', {
                                class: 'key',
                                text: key
                            }),
                            mono.create('span', {
                                class: 'value',
                                text: value
                            })
                        ]
                    }))
                }
                if (!info.otherItems.firstChild) {
                    info.otherItems = undefined;
                }

                var fragment = document.createDocumentFragment();
                if (info.picList.length > 0) {
                    fragment.appendChild(mono.create('div', {
                        class: 'poster',
                        append: [
                            mono.create('img', {
                                data: {
                                    index: 0
                                },
                                src: info.picList[0],
                                alt: info.title,
                                onCreate: function() {
                                    this.addEventListener('error', onGooglePosterError.bind(this, info.picList))
                                }
                            })
                        ]
                    }));
                }

                fragment.appendChild(mono.create('h1', {
                    class: 'title',
                    text: info.title
                }));

                info.type && fragment.appendChild(mono.create('div', {
                    class: 'type',
                    text: info.type
                }));

                fragment.appendChild(mono.create('div', {
                    class: 'desc',
                    text: info.desc,
                    append: info.wikiLink
                }));

                info.otherItems && fragment.appendChild(info.otherItems);

                return cb(fragment);
            }
        }
    }(),
    getDescription: function(request, cb) {
        if (!request) {
            return;
        }
        mono.ajax({
            url: 'https://www.google.com/search?q='+request,
            success: function(data) {
                this.content_parser.google(data, request, cb);
            }.bind(this)
        });
    },
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
                class: 'l'+line,
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
    onSetPage: function (page) {
        if (this.currentPage === page) return;
        this.currentPage = page;
        this.currentPageEl && this.currentPageEl.classList.remove('active');
        this.currentPageEl = this.pageEl.querySelector('li[data-page="'+page+'"]');
        this.currentPageEl && this.currentPageEl.classList.add('active');

        var height = this.body.clientHeight;
        if ((this.minHeight || 0) < height) {
            this.body.style.minHeight = height + 'px';
            this.minHeight = height;
        }

        var cache = engine.exploreCache[this.cacheName];
        if (cache && cache.content) {
            explore.writeCategoryContent(this.type, cache.content, page);
        }
    },
    getPageListBody: function (categoryObj, content, page) {
        "use strict";
        var contentLen = content.length;
        var coefficient = contentLen / categoryObj.displayItemCount;
        var pageCount = Math.floor(coefficient);
        if (coefficient % 1 === 0) {
            pageCount--;
        }
        if (pageCount === Infinity) {
            pageCount = 0;
        }

        var pageItems = document.createDocumentFragment();
        for (var i = 0; i <= pageCount; i++) {
            var isActive = page === i;
            var node;
            pageItems.appendChild(node = mono.create('li', {
                class: [isActive ? 'active' : undefined],
                data: {
                    page: i
                },
                text: i + 1
            }));
            if (isActive) {
                categoryObj.currentPageEl = node;
                categoryObj.currentPage = i;
            }
        }

        categoryObj.pageEl.textContent = '';
        categoryObj.pageEl.appendChild(pageItems);

        if (pageCount === 0) {
            categoryObj.pageEl.classList.add('hide');
        } else {
            categoryObj.pageEl.classList.remove('hide');
        }

        categoryObj.setPage = this.onSetPage.bind(categoryObj);
    },
    calculateMoveble: function(el, width) {
        "use strict";
        var styleEl;

        var elWidth = el.offsetWidth;
        if (elWidth <= width) {
            return;
        }
        elWidth = Math.ceil(elWidth / 10);
        if (elWidth > 10) {
            if (elWidth < 100) {
                var t1 = Math.round(elWidth / 10);
                if (t1 > elWidth / 10) {
                    elWidth = t1 * 10 * 10;
                } else {
                    elWidth = (t1 * 10 + 5) * 10;
                }
            } else {
                elWidth = elWidth * 10;
            }
        } else {
            elWidth = elWidth * 10;
        }

        var timeCalc = Math.round(parseInt(elWidth) / parseInt(width) * 3.5);
        var moveName = 'moveble' + '_' + width + '_' + elWidth;
        if (this.varCache.movebleStyleList['style.' + moveName] === undefined) {
            var keyFrames = ''
                + '{'
                + '0%{margin-left:2px;}'
                + '50%{margin-left:-' + (elWidth - width) + 'px;}'
                + '90%{margin-left:6px;}'
                + '100%{margin-left:2px;}'
                + '}';
            this.varCache.movebleStyleList['style.' + moveName] = styleEl = mono.create('style', {
                class: moveName,
                text: ''
                + '@-webkit-keyframes a_' + moveName
                + keyFrames
                + '@keyframes a_' + moveName
                + keyFrames
                + '@-moz-keyframes a_' + moveName
                + keyFrames
                + '@-o-keyframes a_' + moveName
                + keyFrames
                + 'div.' + moveName + ':hover > span {'
                + 'overflow: visible;'
                + '-webkit-animation:a_' + moveName + ' ' + timeCalc + 's;'
                + '-moz-animation:a_' + moveName + ' ' + timeCalc + 's;'
                + '-o-animation:a_' + moveName + ' ' + timeCalc + 's;'
                + 'animation:a_' + moveName + ' ' + timeCalc + 's;'
                + '}'
            });
        }
        el.parentNode.classList.add(moveName);

        if (styleEl !== undefined) {
            document.body.appendChild(styleEl);
        }
    },
    width2fontSize: function(type, width) {
        "use strict";
        var min = 10;
        var max = 13.5;
        var maxWidth = this.sourceOptions[type].maxWidth;
        if (width >= 60) {
            width -= 60;
            maxWidth -= 60;
        } else {
            return;
        }
        var coefficient = width/maxWidth * 100;
        return (min+((max-min)/100 * coefficient)).toFixed(6);
    },
    calculateSize: function(type) {
        "use strict";
        var options = engine.explorerOptionsObj[type];
        var categoryObj = this.varCache.categoryList[type];
        var fontSize = this.width2fontSize(type, options.width);

        var base = 'ul#explore_gallery li[data-type="'+type+'"] > ul.body > li';

        var imgSize = base + '{width: '+options.width+'px;}';

        var fontStyle = base + ' > div.title{' + (fontSize ? 'font-size:'+fontSize+'px;' : 'display:none;') + '}';

        if (categoryObj.style === undefined) {
            document.body.appendChild(categoryObj.style = mono.create('style', {
                class: 'categoryStyle',
                text: imgSize+fontStyle
            }));
        } else {
            categoryObj.style.textContent = imgSize+fontStyle;
        }
    },
    getCategoryDisplayItemCount: function(type) {
        "use strict";
        var explorerOptions = engine.explorerOptionsObj[type];
        var lineCount = explorerOptions.lineCount;
        var width = document.body.clientWidth - 180;
        var itemCount = Math.ceil(width / (explorerOptions.width + 10*2)) - 1;

        return itemCount * lineCount;
    },
    addRootUrl: function(url, root) {
        "use strict";
        if (root && !/^https?:\/\//.test(url)) {
            url = root+url;
        }
        return url;
    },
    getCategoryItemTitle: function(item) {
        "use strict";
        var title;
        if (item.title_en && (mono.language.langCode !== 'ru' || engine.settings.useEnglishPosterName)) {
            title = item.title_en;
        } else {
            title = item.title;
        }
        return title;
    },
    getItemQualityLabel: function (title) {
        "use strict";
        var label = '?';
        var qualityObj = engine.explorerQualityList[title];
        label = qualityObj && qualityObj.label || label;
        return label;
    },
    writeCategoryContent: function(type, content, page, update_pages) {
        "use strict";
        page = page || 0;
        content = content || [];
        var contentLen = content.length;
        var categoryObj = this.varCache.categoryList[type];
        var explorerOptions = engine.explorerOptionsObj[type];
        var sourceOptions = this.sourceOptions[type];


        var displayItemCount = categoryObj.displayItemCount = this.getCategoryDisplayItemCount(type);
        var form = displayItemCount * page;
        var end = form + displayItemCount;
        if (end > contentLen) {
            end = contentLen;
        }

        var contentBody = document.createDocumentFragment();
        var elCount = 0;
        for (var index = form; index < end; index++) {
            var title = this.getCategoryItemTitle(content[index]);

            var search_link = 'index.html#?search=' + encodeURIComponent(title);
            var titleEl = mono.create('span', {
                append: mono.create('a', {
                    href: search_link,
                    text: title,
                    title: title
                }),
                on: ['mouseenter', function onMouseEnter(e) {
                    explore.calculateMoveble(this, explorerOptions.width);
                    this.removeEventListener('mouseenter', onMouseEnter);
                }]
            });

            var imgUrl = this.addRootUrl(content[index].img, sourceOptions.imgUrl);
            var readMoreUrl = this.addRootUrl(content[index].url, sourceOptions.rootUrl);

            var actionList = document.createDocumentFragment();
            if (type === 'favorites') {
                mono.create(actionList, {
                    append: [
                        mono.create('div', {
                            class: 'rmFavorite',
                            title: mono.language.removeFromFavorite
                        }),
                        mono.create('div', {
                            class: 'move',
                            title: mono.language.move
                        }),
                        mono.create('div', {
                            class: 'edit',
                            title: mono.language.edit
                        })
                    ]
                });
            } else {
                actionList.appendChild(mono.create('div', {
                    class: 'inFavorite',
                    title: mono.language.addInFavorite
                }));
            }

            var qualityText = this.getItemQualityLabel(title);
            var quality = mono.create('div', {
                class: 'quality',
                title: mono.language.requestQuality,
                text: qualityText
            });

            quality.addEventListener('mouseenter', this.onMouseEnterQuality.bind(this, quality, type, index));

            contentBody.appendChild(mono.create('li', {
                append: [
                    mono.create('div', {
                        data: {
                            index: index
                        },
                        class: 'picture',
                        append: [
                            actionList,
                            quality,
                            mono.create('a', {
                                class: 'link',
                                href: readMoreUrl,
                                target: '_blank',
                                title: mono.language.readMore
                            }),
                            mono.create('a', {
                                href: search_link,
                                title: title,
                                append: mono.create('img', {
                                    src: imgUrl,
                                    on: ['error', function () {
                                        this.src = 'img/no_poster.png';
                                    }]
                                })
                            })
                        ]
                    }),
                    mono.create('div', {
                        class: 'title',
                        append: titleEl
                    })
                ]
            }));
            elCount++;
        }

        if (elCount === 0) {
            if (page > 0) {
                page--;
                return this.writeCategoryContent(type, content, page, update_pages);
            }
            if (type === 'favorites') {
                categoryObj.li.classList.add('empty');
            }
        } else
        if (type === 'favorites' && categoryObj.li.classList.contains('empty')) {
            categoryObj.li.classList.remove('empty');
        }

        if (!categoryObj.setPage || update_pages) {
            this.getPageListBody(categoryObj, content, page);
        }

        categoryObj.body.textContent = '';
        categoryObj.body.appendChild(contentBody);
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

        var categoryObj = this.varCache.categoryList[type];
        var cache = engine.exploreCache[categoryObj.cacheName];

        var content = [];
        source.xhr_content.sort(function(a,b){return a[0] > b[0] ? 1 : -1;});
        for (var i = 0, list; list = source.xhr_content[i]; i++) {
            content = content.concat(list[1]);
        }

        if (content.length === 0) {
            if (cache.content !== undefined) {
                content = cache.content;
            } else {
                categoryObj.li.classList.add('error');
            }
            cache.keepAlive = undefined;
            cache.errorTimeout = parseInt(Date.now() / 1000 + 60 * 60 * 2);
        }

        categoryObj.li.classList.remove('loading');

        cache.content = content;
        this.writeCategoryContent(type, content);

        var storage = {};
        storage[categoryObj.cacheName] = cache;
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
        var categoryObj = this.varCache.categoryList[type];
        var cache = engine.exploreCache[categoryObj.cacheName];
        var source = this.sourceOptions[type];
        if (source.noAutoUpdate) {
            this.writeCategoryContent(type, cache.content);
            return;
        }
        var date = this.getCacheDate(source.keepAlive);
        if (cache.errorTimeout && cache.errorTimeout > parseInt(Date.now() / 1000)) {
            categoryObj.li.classList.add('error');
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
    updateCategoryContent: function(type) {
        "use strict";
        var categoryObj = this.varCache.categoryList[type];
        categoryObj.body.style.minHeight = '';
        categoryObj.minHeight = '';
        var cache = engine.exploreCache[categoryObj.cacheName];
        this.writeCategoryContent(categoryObj.type, cache.content, categoryObj.currentPage, 1);
    },
    getSetupBody: function(type) {
        "use strict";
        var options = engine.explorerOptionsObj[type];
        var source = this.sourceOptions[type];
        var categoryObj = this.varCache.categoryList[type];

        var updateContent = function() {
        };

        var onChangeRange = null;
        var range;
        return mono.create('div', {
            class: 'setupBody',
            append: [
                range = mono.create('input', {
                    type: 'range',
                    name: 'imageWidth',
                    value: options.width,
                    min: 20,
                    max: source.maxWidth,
                    on: ['input', function(e) {
                        var value = this.value;
                        options.width = parseInt(value);
                        explore.calculateSize(type);

                        clearTimeout(onChangeRange);
                        onChangeRange = setTimeout(function() {
                            explore.updateCategoryContent(type);

                            mono.storage.set({explorerOptions: engine.explorerOptions});
                        }, 250);
                    }]
                }),
                mono.create('div', {
                    class: 'defaultSize',
                    title: mono.language.default,
                    on: ['click', function(e) {
                        e.preventDefault();
                        var defaultOptions = engine.defaultExplorerOptionsObj[type];
                        range.value = defaultOptions.width;
                        range.dispatchEvent(new CustomEvent('input'));
                    }]
                }),
                mono.create('select', {
                    class: 'lineCount',
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
                    })(),
                    onCreate: function() {
                        this.selectedIndex = options.lineCount - 1;
                    },
                    on: ['change', function() {
                        var value = parseInt(this.value);
                        options.lineCount = parseInt(value);
                        explore.updateCategoryContent(type);

                        mono.storage.set({explorerOptions: engine.explorerOptions});
                    }]
                })
            ]
        });
    },
    onPageListMouseEnter: function(categoryObj, e) {
        "use strict";
        var el = e.target;
        if (el === categoryObj.pageEl) return;

        var page = parseInt(el.dataset.page);

        categoryObj.setPage(page);
    },
    onSetupClick: function(e) {
        "use strict";
        e.preventDefault();
        var parent = this.parentNode;
        var head = parent.parentNode;

        var nextEl = parent.nextElementSibling;
        if (nextEl && nextEl.classList.contains('setupBody')) {
            head.removeChild(nextEl);
            return;
        }

        var li = head.parentNode;

        var setupBody = explore.getSetupBody(li.dataset.type);
        head.insertBefore(setupBody, nextEl);
    },
    onUpdateKpFavorites: function(e) {
        "use strict";
        e.preventDefault();

        var type = 'kp_favorites';
        var source = this.sourceOptions[type];
        var categoryObj = this.varCache.categoryList[type];

        categoryObj.li.classList.remove('error');
        categoryObj.li.classList.remove('login');
        if (source.xhr) {
            source.xhr.abort();
            source.xhr = null;
        }
        categoryObj.li.classList.add('loading');

        var limit = 20;
        var deDbtlUrl = [];
        var contentList = [];

        var onErrorStatus = function(className) {
            categoryObj.li.classList.remove('loading');
            categoryObj.li.classList.remove('error');
            categoryObj.li.classList.remove('login');
            categoryObj.li.classList.add(className);
        }

        var urlTemplate = source.url.replace('%category%', engine.settings.kinopoiskFolderId);
        (function getPage(page) {
            source.xhr = mono.ajax({
                url: urlTemplate.replace('%page%', page),
                success: function(data) {
                    var pContent = explore.content_parser.kp_favorites(data);
                    if (!pContent) {
                        return onErrorStatus('error');
                    }
                    if (pContent.requireAuth) {
                        return onErrorStatus('login');
                    }
                    var newCount = 0;
                    for (var i = 0, item; item = pContent[i]; i++) {
                        if (deDbtlUrl.indexOf(item.url) !== -1) {
                            continue;
                        }
                        deDbtlUrl.push(item.url);
                        contentList.push(item);
                        newCount++;
                    }

                    if (newCount && limit) {
                        limit--;
                        return getPage(++page);
                    }

                    var currentPage = categoryObj.currentPage;
                    explore.writeCategoryContent(type, contentList, currentPage, 1);

                    var storage = {};
                    engine.exploreCache[categoryObj.cacheName] = storage[categoryObj.cacheName] = {
                        content: contentList
                    }
                    mono.storage.set(storage);

                    categoryObj.li.classList.remove('loading');
                },
                error: onErrorStatus
            });
        })(1);
    },
    writeCategoryList: function () {
        "use strict";
        for (var i = 0, item; item = engine.explorerOptions[i]; i++) {
            if (!item.enable) continue;

            var source = this.sourceOptions[item.type];

            var actionList = mono.create('div', {
                class: 'actionList'
            });

            if (item.type === 'kp_favorites') {
                mono.create(actionList, {
                    append: [
                        mono.create('a', {
                            class: 'open',
                            target: '_blank',
                            title: mono.language.goToTheWebsite,
                            href: source.url.replace('%page%', 1).replace('%category%', engine.settings.kinopoiskFolderId)
                        }),
                        mono.create('div', {
                            class: 'update',
                            title: mono.language.update,
                            on: ['click', this.onUpdateKpFavorites.bind(this)]
                        })
                    ]
                });
            }

            actionList.appendChild(mono.create('div', {
                class: 'setup',
                title: mono.language.setupView,
                on: ['click', this.onSetupClick]
            }));

            var categoryObj = this.varCache.categoryList[item.type] = {};
            categoryObj.type = item.type;
            categoryObj.cacheName = 'expCache_' + item.type;

            this.domCache.gallery.appendChild(categoryObj.li = mono.create('li', {
                class: [!item.show ? 'collapsed' : undefined],
                data: {
                    type: item.type
                },
                append: [
                    categoryObj.head = mono.create('div', {
                        class: 'head',
                        append: [
                            mono.create('div', {
                                class: 'move'
                            }),
                            mono.create('div', {
                                class: 'title',
                                text: item.title || mono.language[item.lang]
                            }),
                            actionList,
                            mono.create('div', {
                                class: 'collapses'
                            })
                        ],
                        on: ['click', function(e) {
                            var el = e.target;
                            if (el !== this && !el.classList.contains('collapses')) {
                                return;
                            }

                            var li = this.parentNode;
                            var type = li.dataset.type;
                            var categoryObj = explore.varCache.categoryList[type];
                            var options = engine.explorerOptionsObj[type];

                            if (options.show) {
                                options.show = 0;
                                categoryObj.li.classList.add('collapsed');
                            } else {
                                options.show = 1;
                                categoryObj.li.classList.remove('collapsed');

                                explore.getCategoryContent(type);
                            }

                            mono.storage.set({explorerOptions: engine.explorerOptions});
                        }]
                    }),
                    categoryObj.pageEl = mono.create('ul', {
                        class: 'pageList',
                        data: {
                            type: item.type
                        },
                        on: ['mouseenter', this.onPageListMouseEnter.bind(this, categoryObj), true]
                    }),
                    categoryObj.body = mono.create('ul', {class: 'body'})
                ]
            }));

            this.calculateSize(item.type);
            item.show && this.getCategoryContent(item.type);
        }
    },
    saveFavorites: function () {
        "use strict";
        var fCategoryObj = this.varCache.categoryList.favorites;
        var fCache = engine.exploreCache[fCategoryObj.cacheName];

        var storage = {};
        storage[fCategoryObj.cacheName] = fCache;
        mono.storage.set(storage);
        if (engine.settings.enableFavoriteSync) {
            mono.storage.sync.set(storage);
        }
    },
    onInFavorite: function(el, e) {
        "use strict";
        e.preventDefault();
        el = el.parentNode;

        var li = el.parentNode;
        while (li.tagName !== 'LI' || !li.dataset.type) {
            li = li.parentNode;
        }

        var type = li.dataset.type;
        var index = parseInt(el.dataset.index);

        var sourceOptions = this.sourceOptions[type];
        var categoryObj = this.varCache.categoryList[type];
        var cache = engine.exploreCache[categoryObj.cacheName];
        var item = mono.cloneObj(cache.content[index]);

        item.img = this.addRootUrl(item.img, sourceOptions.imgUrl);
        item.url = this.addRootUrl(item.url, sourceOptions.rootUrl);
        item.title = this.getCategoryItemTitle(item);

        delete item.title_en;

        var fCategoryObj = this.varCache.categoryList.favorites;
        var fCache = engine.exploreCache[fCategoryObj.cacheName];
        if (!fCache.content) {
            fCache.content = [];
        }
        fCache.content.push(item);
        this.updateCategoryContent('favorites');

        this.saveFavorites();
    },
    onRmFavorite: function(el, e) {
        "use strict";
        e.preventDefault();
        el = el.parentNode;

        var type = 'favorites';
        var index = parseInt(el.dataset.index);

        var categoryObj = this.varCache.categoryList[type];
        var cache = engine.exploreCache[categoryObj.cacheName];

        cache.content.splice(index, 1);

        this.updateCategoryContent('favorites');
        this.saveFavorites();
    },
    onEditItem: function(el, e) {
        "use strict";
        e.preventDefault();
        el = el.parentNode;

        var type = 'favorites';
        var index = parseInt(el.dataset.index);

        var categoryObj = this.varCache.categoryList[type];
        var cache = engine.exploreCache[categoryObj.cacheName];

        var item = cache.content[index];

        var $body = showNotification([
            [{label: {text: mono.language.title}}],
            {input: {type: "text", value: item.title, placeholder: item.title, name: 'title'}},
            [{label: {text: mono.language.imageUrl}}],
            {input: {type: "text", value: item.img, placeholder: item.img, name: 'img'}},
            [{label: {text: mono.language.descUrl}}],
            {input: {type: "text", value: item.url, placeholder: item.url, name: 'url'}},
            [
                {input: {type: "button", value: mono.language.change, name: 'yesBtn', on: ['click', function(e) {
                    e.stopPropagation();
                    var formData = this.getFormData();

                    formData.title && (item.title = formData.title);
                    formData.img && (item.img = formData.img);
                    formData.url && (item.url = formData.url);

                    this.close();

                    explore.updateCategoryContent('favorites');
                    explore.saveFavorites();
                }]}},
                {input: {type: "button", value: mono.language.cancel, name: 'noBtn', on: ['click', function(e) {
                    e.stopPropagation();
                    this.close();
                }]}}
            ]
        ]);
        $body.addClass('favoriteItemEdit');
    },
    getTorrentWeight: function(ratingObj) {
        "use strict";
        ratingObj.sum -= (ratingObj.rate.seed + ratingObj.rate.music + ratingObj.rate.books + ratingObj.rate.xxx);
        return ratingObj.sum;
    },
    getTop5Response: function(torrentList, tracker) {
        "use strict";
        var now = Date.now();
        var maxTime = 180*24*60*60*1000;
        var hYearAgo = now - maxTime;

        var minTitleRate = 170;

        var quickSearchResultList = this.varCache.quickSearchResultList;
        var searchResultCounter = view.varCache.searchResultCounter;

        for (var i = 0, torrentObj; torrentObj = torrentList[i]; i++) {
            torrentObj.lowerCategoryTitle = !torrentObj.categoryTitle ? '' : torrentObj.categoryTitle.toLowerCase();
            if (engine.settings.teaserFilter && view.teaserFilter(torrentObj.title + ' ' + torrentObj.lowerCategoryTitle)) {
                continue;
            }
            if (torrentObj.date < hYearAgo) {
                torrentObj.quality += 100 * (hYearAgo - torrentObj.date) / maxTime;
            }
            var titleObj = view.hlTextToFragment(torrentObj.title, this.varCache.requestObj);
            var ratingObj = rate.rateText(this.varCache.requestObj, titleObj, torrentObj);

            if (ratingObj.rate.title < minTitleRate) {
                continue;
            }

            torrentObj.quality = this.getTorrentWeight(ratingObj);

            torrentObj.rating = ratingObj;
            torrentObj.titleObj = titleObj;

            torrentObj.size && mono.create(titleObj.node, {
                append: [
                    ', ',
                    view.formatSize(torrentObj.size)
                ]
            });

            quickSearchResultList.push(torrentObj);

            searchResultCounter.tracker[tracker.id]++;
            searchResultCounter.category[undefined]++;
            searchResultCounter.sum++;
        }

        view.resultCounterUpdate();

        quickSearchResultList.sort(function(a,b) {
            if (a.quality > b.quality) {
                return -1;
            } else
            if (a.quality === b.quality) {
                return 0;
            } else {
                return 1;
            }
        });

        quickSearchResultList.splice(5);

        var top5List = [];
        for (i = 0, torrentObj; torrentObj = quickSearchResultList[i]; i++) {
            top5List.push({
                id: tracker.id,
                quality: torrentObj.rating.quality,
                titleObj: mono.domToTemplate(torrentObj.titleObj.node),
                url: torrentObj.url
            });
        }
        return top5List;
    },
    updateInfoPopup: function(qualityLabel, qualityObj, request) {
        "use strict";
        var label = qualityObj && qualityObj.label || '?';
        qualityLabel.replaceChild(document.createTextNode(label), qualityLabel.firstChild);

        if (this.domCache.infoPopup.parentNode !== qualityLabel) {
            return;
        }

        this.domCache.infoPopup.style.display = 'none';
        this.domCache.infoPopupList.textContent = '';

        if (!qualityObj || qualityObj.list.length === 0) {
            return;
        }

        var list = document.createDocumentFragment();
        for (var i = 0, torrentObj; torrentObj = qualityObj.list[i]; i++) {
            list.appendChild(mono.create('li', {
                append: mono.create('a', {
                    data: {
                        index: i
                    },
                    append: mono.templateToDom(torrentObj.titleObj),
                    href: torrentObj.url,
                    target: '_blank',
                    onCreate: function() {
                        this.title = this.textContent;
                    }
                })
            }));
        }

        this.domCache.infoPopupList.appendChild(list);
        this.domCache.infoPopup.style.display = 'block';
    },
    onSearchSuccess: function(qualityLabel, tracker, request, data) {
        "use strict";
        view.setOnSuccessStatus(tracker, data);
        if (data.requireAuth === 1) return;

        var torrentList = data.torrentList;
        var topList = this.getTop5Response(torrentList, tracker);
        var qualityObj = {
            list: topList,
            label: topList.length > 0 && topList[0].quality || undefined
        };

        this.updateInfoPopup(qualityLabel, qualityObj, request);

        engine.explorerQualityList[request] = qualityObj;
        mono.storage.set({explorerQualityList: engine.explorerQualityList});
    },
    onClickQuality: function(el, e) {
        "use strict";
        e.preventDefault();
        var qualityLabel = el;
        el = el.parentNode;

        qualityLabel.replaceChild(document.createTextNode('*'), qualityLabel.firstChild);

        var li = el.parentNode;
        while (li.tagName !== 'LI' || !li.dataset.type) {
            li = li.parentNode;
        }

        var type = li.dataset.type;
        var index = parseInt(el.dataset.index);

        var categoryObj = this.varCache.categoryList[type];
        var cache = engine.exploreCache[categoryObj.cacheName];
        var item = cache.content[index];

        var request = this.getCategoryItemTitle(item);
        this.varCache.requestObj = {};
        request = view.prepareRequest(request, undefined, this.varCache.requestObj);

        view.inHistory(this.varCache.requestObj);

        var trackerList = view.getTrackerList();

        view.resultCounterReset();
        this.varCache.quickSearchResultList = [];
        exKit.searchList(trackerList, request, {
            onSuccess: this.onSearchSuccess.bind(this, qualityLabel),
            onError: view.onSearchError,
            onBegin: view.onSearchBegin
        });
    },
    setInfoPopupPos: function(el, infoPopup, corner) {
        "use strict";
        var width = 300;

        var parent = el;
        var labelPos = {
            left: 0,
            top: 0
        };
        while (parent.offsetParent !== null) {
            labelPos.left += parent.offsetLeft;
            labelPos.top += parent.offsetTop;
            parent = parent.offsetParent;
        }
        var rLabelPos = mono.getPosition(el);

        var labelSize = mono.getSize(el);

        var docWidth = document.body.clientWidth;
        var anglPos = labelPos.left + labelSize.width / 2;
        var rigthPos = anglPos + width / 2;
        var leftPos = anglPos - width / 2;
        if (rigthPos > docWidth) {
            rigthPos = docWidth - width / 2;
            leftPos = docWidth - width;
        }
        if (leftPos < 0) {
            leftPos = 0;
            rigthPos = width;
        }

        var cornerPersent = 100 * (anglPos - leftPos) / width;

        leftPos -= rLabelPos.left;
        labelPos.top -= rLabelPos.top;

        corner.style.left = cornerPersent + '%';
        infoPopup.style.left = leftPos + 'px';
        infoPopup.style.top = (labelPos.top + labelSize.height - 5) + 'px';
    },
    onMouseEnterQuality: function(el, type, index) {
        "use strict";
        var infoPopup = this.domCache.infoPopup;

        if (infoPopup.dataset.type === type && parseInt(infoPopup.dataset.index) === index) {
            return;
        }
        infoPopup.dataset.type = type;
        infoPopup.dataset.index = index;

        var infoPopupCorner = this.domCache.infoPopupCorner;
        this.setInfoPopupPos(el, infoPopup, infoPopupCorner);

        var categoryObj = this.varCache.categoryList[type];
        var cache = engine.exploreCache[categoryObj.cacheName];
        var item = cache.content[index];

        var request = this.getCategoryItemTitle(item);
        request = view.prepareRequest(request, 1);

        var qualityObj = engine.explorerQualityList[request];

        el.appendChild(infoPopup);

        this.updateInfoPopup(el, qualityObj, request);
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

        if (mono.isWebApp) {
            define.on('jquery', function() {
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

                var currentBrowser = undefined;
                var domList = {};
                var dlExBody = undefined;
                explore.domCache.gallery.parentNode.appendChild(
                    dlExBody = mono.create('div', {
                        id: 'explore_download_extension',
                        append: [
                            mono.create('h1', {
                                text: mono.language.downloadExtensionTitle
                            }),
                            currentBrowser = mono.create('div', {
                                class: 'currentBrowser'
                            }),
                            mono.create('div', {
                                class: 'browserList',
                                append: (function(){
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
                                        list.push(domList[key] = mono.create('a', {
                                            href: item.link,
                                            class: key,
                                            target: '_blank',
                                            append: [
                                                mono.create('img', {
                                                    src: 'web/'+key+'.png'
                                                }),
                                                mono.create('p', {
                                                    text: item.title
                                                })
                                            ]
                                        }));
                                    }
                                    return list;
                                })()
                            })
                        ]
                    })
                );
                currentBrowser.appendChild(domList[getBrowserName()] || mono.create('img', {src: 'img/icon_128.png'}));
                document.addEventListener('installExtensionMenu', function() {
                    dlExBody.classList.add('popupMode');
                    var stopProp = function(e) {
                        e.stopPropagation();
                    };
                    dlExBody.addEventListener('click', stopProp);
                    document.addEventListener('click', function() {
                        dlExBody.classList.remove('popupMode');
                        dlExBody.removeEventListener('click', stopProp);
                    });
                });
            });
            return;
        }

        window.addEventListener('resize', mono.debounce(function onResizeCategoryList() {
            if (onResizeCategoryList.lock) return;
            onResizeCategoryList.lock = true;

            for (var type in this.varCache.categoryList) {
                var categoryObj = this.varCache.categoryList[type];
                var options = engine.explorerOptionsObj[type];
                if (options.show && categoryObj.displayItemCount !== this.getCategoryDisplayItemCount(type)) {
                    this.updateCategoryContent(type);
                }
            }

            onResizeCategoryList.lock = false;
        }.bind(this), 300));

        this.domCache.gallery.addEventListener('click', function(e) {
            var el = e.target;
            if (el.classList.contains('inFavorite')) {
                return this.onInFavorite(el, e);
            }
            if (el.classList.contains('rmFavorite')) {
                return this.onRmFavorite(el, e);
            }
            if (el.classList.contains('edit')) {
                return this.onEditItem(el, e);
            }
            if (el.classList.contains('quality')) {
                return this.onClickQuality(el, e);
            }
        }.bind(this));

        this.domCache.infoPopup.addEventListener('click', function(e) {
            var el = e.target;

            while (el !== this && el.tagName !== 'A') {
                el = el.parentNode;
            }
            if (el === this) {
                return;
            }

            var type = this.dataset.type;
            var index = parseInt(this.dataset.index);

            var categoryObj = explore.varCache.categoryList[type];
            var cache = engine.exploreCache[categoryObj.cacheName];
            var item = mono.cloneObj(cache.content[index]);

            var request = explore.getCategoryItemTitle(item);
            var requestObj = {};
            request = view.prepareRequest(request, undefined, requestObj);

            var listIndex = parseInt(el.dataset.index);

            var qualityObj = engine.explorerQualityList[request];

            if (!qualityObj) return;

            var listItem = qualityObj.list[listIndex];

            if (!listItem) return;

            if (!view.varCache.historyObj[requestObj.historyKey]) {
                view.inHistory(requestObj);
            }

            view.inLinkHistory({
                id: listItem.id,
                api: {
                    url: listItem.url
                },
                titleTemplate: listItem.titleObj
            }, requestObj);
        });

        this.writeCategoryList();

        if (mono.isChrome && engine.settings.enableFavoriteSync) {
            chrome.storage.onChanged.addListener(function(changes) {
                if (!changes.hasOwnProperty('expCache_favorites')) {
                    return;
                }
                var cache = changes.expCache_favorites.newValue;
                var type = 'favorites';
                if (JSON.stringify(engine.exploreCache.expCache_favorites) === JSON.stringify(cache)) {
                    return;
                }
                engine.exploreCache.expCache_favorites = cache;
                var options = engine.explorerOptionsObj[type];
                if (options.enable && options.show) {
                    explore.updateCategoryContent(type);
                }
            });
        }

        define.on('jqueryui', function() {
            (this.domCache.$gallery = $(this.domCache.gallery)).sortable({
                axis: 'y',
                handle: '.head .move',
                scroll: false,
                start: function() {
                    window.scrollTo(0,0);
                    this.domCache.gallery.classList.add('sortMode');

                    this.domCache.$gallery.sortable("refreshPositions");
                }.bind(this),
                stop: function() {
                    this.domCache.gallery.classList.remove('sortMode');

                    var typeList = [];
                    var explorerOptions = [];
                    var type;
                    for (var i = 0, node, childNodes = this.domCache.gallery.childNodes; node = childNodes[i]; i++) {
                        type = node.dataset.type;
                        typeList.push(type);
                        explorerOptions.push(engine.explorerOptionsObj[type]);
                    }
                    for (type in engine.explorerOptionsObj) {
                        if (typeList.indexOf(type) === -1) {
                            explorerOptions.push(engine.explorerOptionsObj[type]);
                        }
                    }
                    engine.explorerOptions = explorerOptions;

                    mono.storage.set({explorerOptions: engine.explorerOptions});
                }.bind(this)
            });

            this.varCache.categoryList.favorites && $(this.varCache.categoryList.favorites.body).sortable({
                handle: '.move',
                items: 'li',
                opacity: 0.8,
                stop: function(e, ui) {
                    var li = ui.item[0];
                    var type = 'favorites';
                    var pic = li.firstChild;
                    var nextLi = li.nextElementSibling;
                    var index = parseInt(pic.dataset.index);

                    var categoryObj = this.varCache.categoryList[type];
                    var cache = engine.exploreCache[categoryObj.cacheName];

                    var item = cache.content.splice(index, 1)[0];
                    if (!nextLi) {
                        cache.content.push(item);
                    } else {
                        var nextPic = nextLi.firstChild;
                        var nextIndex = parseInt(nextPic.dataset.index);
                        if (index < nextIndex) {
                            nextIndex--;
                        }
                        cache.content.splice(nextIndex, 0, item);
                    }

                    this.updateCategoryContent('favorites');
                    this.saveFavorites();
                }.bind(this)
            });
        }.bind(this));
    }
};