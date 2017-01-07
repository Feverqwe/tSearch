/**
 * Created by Anton on 02.05.2015.
 */
"use strict";
define([
    './utils',
    './dom'
], function (utils, dom) {
    var cloneObj = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };
    var debounce = function(fn, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    };

    var defaultExplorerOptions = [
        {type: 'favorites',      enable: 1, show: 1, width: 100, lineCount: 1, lang: 'favoriteList'},     //0
        {type: 'kp_favorites',   enable: 1, show: 1, width: 100, lineCount: 1, lang: 'kpFavoriteList'},  //1
        {type: 'kp_in_cinema',   enable: 1, show: 1, width: 100, lineCount: 1, lang: 'kpInCinema'},  //2
        {type: 'kp_popular',     enable: 1, show: 1, width: 100, lineCount: 2, lang: 'kpPopular'},    //3
        {type: 'kp_serials',     enable: 1, show: 1, width: 100, lineCount: 1, lang: 'kpSerials'},    //4
        {type: 'imdb_in_cinema', enable: 1, show: 1, width: 100, lineCount: 1, lang: 'imdbInCinema'},//5
        {type: 'imdb_popular',   enable: 1, show: 1, width: 100, lineCount: 2, lang: 'imdbPopular'},  //6
        {type: 'imdb_serials',   enable: 1, show: 1, width: 100, lineCount: 1, lang: 'imdbSerials'},  //7
        {type: 'gg_games_top',   enable: 1, show: 1, width: 100, lineCount: 1, lang: 'ggGamesTop'},  //8
        {type: 'gg_games_new',   enable: 1, show: 1, width: 100, lineCount: 1, lang: 'ggGamesNew'}   //9
    ];
    var explorerOptions = cloneObj(defaultExplorerOptions);

    var defaultExplorerOptionsObj = {};
    var explorerOptionsObj = {};
    for (var i = 0, item; item = defaultExplorerOptions[i]; i++) {
        defaultExplorerOptionsObj[item.type] = item;
    }
    for (i = 0, item; item = explorerOptions[i]; i++) {
        explorerOptionsObj[item.type] = item;
    }

    var exploreCache = {};

    var __storage, storage;
    __storage = storage = {};

    var exKit = {
        contentFilterR: {
            searchJs: /javascript/ig,
            blockHref: /\/\//,
            blockSrc: /src=(['"]?)/ig,
            blockSrcSet: /srcset=(['"]?)/ig,
            blockOnEvent: /on(\w+)=/ig
        },
        contentFilter: function (content) {
            "use strict";
            return content.replace(exKit.contentFilterR.searchJs, 'tms-block-javascript')
                .replace(exKit.contentFilterR.blockHref, '//about:blank#blockurl#')
                .replace(exKit.contentFilterR.blockSrc, 'src=$1data:image/gif,base64#blockurl#')
                .replace(exKit.contentFilterR.blockSrcSet, 'data-block-attr-srcset=$1')
                .replace(exKit.contentFilterR.blockOnEvent, 'data-block-event-$1=');
        },
        contentUnFilter: function (content) {
            "use strict";
            return content.replace(/data:image\/gif,base64#blockurl#/g, '')
                .replace(/about:blank#blockurl#/g, '')
                .replace(/tms-block-javascript/g, 'javascript');
        },
        parseHtml: function (html) {
            "use strict";
            var fragment = document.createDocumentFragment();
            var div = document.createElement('html');
            div.innerHTML = html;
            var el;
            while (el = div.firstChild) {
                fragment.appendChild(el);
            }
            return fragment;
        },
        urlCheck: function (details, tracker, value) {
            "use strict";
            if (value.substr(0, 7) === 'magnet:') {
                return value;
            }
            if (value.substr(0, 2) === '//') {
                value = value.replace(/^\/\/[^\/?#]+/, '');
            }
            if (value.substr(0, 4) === 'http') {
                return value;
            }
            if (value[0] === '/') {
                return tracker.search.rootUrl + value.substr(1);
            }
            if (value.substr(0, 2) === './') {
                return tracker.search.baseUrl + value.substr(2);
            }
            if (value[0] === '?') {
                var url = details.requestUrl || '';
                var pos = url.search(/[?#]/);
                if (pos !== -1) {
                    url = url.substr(0, pos);
                }
                return url + value;
            }
            return tracker.search.baseUrl + value;
        }
    };

    var explore = {
        domCache: {
            container: document.querySelector('.explore'),
            gallery: document.querySelector('.explore__gallery')
        },
        varCache: {
            topListColumnCount: undefined,
            categoryList: {},
            movebleStyleList: {},
            quickSearchResultList: [],
            requestObj: {},
            aboutCache: {},
            qualityListLimit: 50
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
                keepAlive: [0, 2],
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
            var prepareObj = function (obj) {
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
            var kpGetImgFileName = function (url) {
                var m = url.match(/film\/(\d+)/);
                return m && m[1] + '.jpg' || url;
            };
            var imdbGetImgFilename = function (url) {
                var m = url.match(/images\/(.+)_V1/);
                return m && m[1] + '_V1_SX120_.jpg' || url;
            };

            var kpGetYear = function (text) {
                var m = text.match(/\s+\(.*([1-2]\d{3}).*\)/);
                return m && parseInt(m[1]);
            };
            var kpRmYear = function (text) {
                return text.replace(/(.*)\s+\(.*([1-2]\d{3}).*\).*/, '$1').trim();
            };
            var kpRmDesc = function (text) {
                return text.replace(/(.*)\s+\(.*\)$/, '$1').trim();
            }

            var getYear = function (text) {
                return parseInt(text.replace(/.*\([^\(]*([1-2]{1}[0-9]{3})[^\)]*\).*/g, '$1'));
            };
            var rmYear = function (text) {
                return text.replace(/(.*) \([^\(]*[0-9]{4}[^\)]*\).*/, '$1').trim();
            };
            var rmSerial = function (text) {
                return text.replace(' (сериал)', '').trim();
            };
            var spaceReplace = function (text) {
                return text.replace(/[\s\xA0]/g, ' ');
            };

            var gg_games_new = function (content) {
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

                    obj.img = obj.img.replace('/f/games/', '');
                    obj.title = obj.title.trim();
                    arr.push(obj);
                }
                return arr;
            };
            var onGooglePosterError = function (picList) {
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
                kp_favorites: function (content) {
                    var dom = exKit.parseHtml(exKit.contentFilter(content));
                    if (dom.querySelector('.login > .js-external-login-action')) {
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
                kp_in_cinema: function (content) {
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
                kp_popular: function (content) {
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
                kp_serials: function (content) {
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
                imdb_in_cinema: function (content) {
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
                            obj.title += ' ' + year;
                        }

                        obj.url = obj.url.replace(/\?ref.*$/, '');

                        arr.push(obj);
                    }
                    return arr;
                },
                imdb_popular: function (content) {
                    var dom = exKit.parseHtml(exKit.contentFilter(content));

                    var elList = dom.querySelectorAll('.lister-list > .lister-item');
                    var arr = [];
                    for (var i = 0, el; el = elList[i]; i++) {
                        var img = el.querySelector('.lister-item-image img');
                        img !== null && (img = img.getAttribute('loadlate'));

                        var title = el.querySelector('.lister-item-header > a');
                        title !== null && (title = title.textContent);

                        var url = el.querySelector('.lister-item-header > a');
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
                imdb_serials: function (content) {
                    var dom = exKit.parseHtml(exKit.contentFilter(content));

                    var elList = dom.querySelectorAll('.lister-list > .lister-item');
                    var arr = [];
                    for (var i = 0, el; el = elList[i]; i++) {
                        var img = el.querySelector('.lister-item-image img');
                        img !== null && (img = img.getAttribute('loadlate'));

                        var title = el.querySelector('.lister-item-header > a');
                        title !== null && (title = title.textContent);

                        var url = el.querySelector('.lister-item-header > a');
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
                google: function (content, request, cb) {
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
                        url = exKit.urlCheck({}, urlObj, url);
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
                        params = utils.parseParam(url);
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
                        info.wikiLink = dom.el('a', {
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
                        info.otherItems.appendChild(dom.el('div', {
                            class: 'table',
                            append: [
                                dom.el('span', {
                                    class: 'key',
                                    text: key
                                }),
                                dom.el('span', {
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
                        var el = dom.el('div', {
                            class: 'poster',
                            append: [
                                dom.el('img', {
                                    data: {
                                        index: 0
                                    },
                                    src: info.picList[0],
                                    alt: info.title
                                })
                            ]
                        });
                        el.addEventListener('error', onGooglePosterError.bind(this, info.picList));
                        fragment.appendChild(el);
                    }

                    fragment.appendChild(dom.el('h1', {
                        class: 'title',
                        text: info.title
                    }));

                    info.type && fragment.appendChild(dom.el('div', {
                        class: 'type',
                        text: info.type
                    }));

                    fragment.appendChild(dom.el('div', {
                        class: 'desc',
                        text: info.desc,
                        append: [
                            info.wikiLink
                        ]
                    }));

                    info.otherItems && fragment.appendChild(info.otherItems);

                    return cb(fragment);
                }
            }
        }(),
        getDescription: function (request, cb) {
            request && utils.request({
                url: 'https://www.google.com/search?q=' + encodeURIComponent(request),
                success: function (data) {
                }.bind(this)
            }, function (err, response) {
                if (!err) {
                    explore.content_parser.google(response.body, request, cb);
                }
            });
        },
        getCacheDate: function (keepAlive) {
            if (!keepAlive) {
                return undefined;
            }
            var currentDate = new Date();
            var day = currentDate.getDay();
            var hours = currentDate.getHours();
            var minutes = currentDate.getMinutes();
            var seconds = currentDate.getSeconds();
            var lastDay = 0;
            keepAlive.forEach(function (num) {
                if (day >= num) {
                    lastDay = num;
                }
            });
            day = day - lastDay;
            return parseInt(currentDate.getTime() / 1000) - day * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60 - seconds;
        },
        show: function () {
            this.once && this.once();
            this.domCache.container.classList.remove('explore-hide');
        },
        hide: function () {
            this.domCache.container.classList.add('explore-hide');
        },
        onSetPage: function (page) {
            if (this.currentPage === page) return;
            this.currentPage = page;
            this.currentPageEl && this.currentPageEl.classList.remove('active');
            this.currentPageEl = this.pageEl.querySelector('li[data-page="' + page + '"]');
            this.currentPageEl && this.currentPageEl.classList.add('active');

            var height = this.body.clientHeight;
            if ((this.minHeight || 0) < height) {
                this.body.style.minHeight = height + 'px';
                this.minHeight = height;
            }

            var cache = exploreCache[this.cacheName];
            if (cache && cache.content) {
                explore.writeCategoryContent(this.type, cache.content, page);
            }
        },
        getPageListBody: function (categoryObj, content, page) {
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
                pageItems.appendChild(node = dom.el('li', {
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
        calculateMoveble: function (el, width) {
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
                this.varCache.movebleStyleList['style.' + moveName] = styleEl = dom.el('style', {
                    class: moveName,
                    text: ''
                    + '@keyframes a_' + moveName
                    + keyFrames
                    + 'div.' + moveName + ':hover > span {'
                    + 'overflow: visible;'
                    + 'animation:a_' + moveName + ' ' + timeCalc + 's;'
                    + '}'
                });
            }
            el.parentNode.classList.add(moveName);

            if (styleEl !== undefined) {
                document.body.appendChild(styleEl);
            }
        },
        width2fontSize: function (type, width) {
            var min = 10;
            var max = 13.5;
            var maxWidth = this.sourceOptions[type].maxWidth;
            if (width >= 60) {
                width -= 60;
                maxWidth -= 60;
            } else {
                return;
            }
            var coefficient = width / maxWidth * 100;
            return (min + ((max - min) / 100 * coefficient)).toFixed(6);
        },
        calculateSize: function (type) {
            "use strict";
            var options = explorerOptionsObj[type];
            var categoryObj = this.varCache.categoryList[type];
            var fontSize = this.width2fontSize(type, options.width);

            var base = 'ul.explore__gallery li[data-type="' + type + '"] > ul.body > li';

            var imgSize = base + '{width: ' + options.width + 'px;}';

            var fontStyle = base + ' > div.title{' + (fontSize ? 'font-size:' + fontSize + 'px;' : 'display:none;') + '}';

            if (categoryObj.style === undefined) {
                document.body.appendChild(categoryObj.style = dom.el('style', {
                    class: 'categoryStyle',
                    text: imgSize + fontStyle
                }));
            } else {
                categoryObj.style.textContent = imgSize + fontStyle;
            }
        },
        getCategoryDisplayItemCount: function (type) {
            var explorerOptions = explorerOptionsObj[type];
            var lineCount = explorerOptions.lineCount;
            var width = document.body.clientWidth - 180;
            var itemCount = Math.ceil(width / (explorerOptions.width + 10 * 2)) - 1;

            return itemCount * lineCount;
        },
        addRootUrl: function (url, root) {
            if (root && !/^https?:\/\//.test(url)) {
                url = root + url;
            }
            return url;
        },
        getCategoryItemTitle: function (item) {
            var title;
            if (item.title_en && storage.useEnglishPosterName) {
                title = item.title_en;
            } else {
                title = item.title;
            }
            return title;
        },
        writeCategoryContent: function (type, content, page, update_pages) {
            "use strict";
            page = page || 0;
            content = content || [];
            var contentLen = content.length;
            var categoryObj = this.varCache.categoryList[type];
            var explorerOptions = explorerOptionsObj[type];
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
                var search_link = 'index.html#?' + utils.hashParam({
                        search: title
                    });
                var titleEl = dom.el('span', {
                    append: dom.el('a', {
                        href: search_link,
                        text: title,
                        title: title
                    })
                });
                var $titleEl = $(titleEl);
                $titleEl.one('mouseenter', function onMouseEnter(e) {
                    explore.calculateMoveble(this, explorerOptions.width);
                });

                var imgUrl = this.addRootUrl(content[index].img, sourceOptions.imgUrl);
                var readMoreUrl = this.addRootUrl(content[index].url, sourceOptions.rootUrl);

                var actionList = document.createDocumentFragment();
                if (type === 'favorites') {
                    dom.el(actionList, {
                        append: [
                            dom.el('div', {
                                class: 'rmFavorite',
                                title: chrome.i18n.getMessage('removeFromFavorite')
                            }),
                            dom.el('div', {
                                class: 'move',
                                title: chrome.i18n.getMessage('move')
                            }),
                            dom.el('div', {
                                class: 'edit',
                                title: chrome.i18n.getMessage('edit')
                            })
                        ]
                    });
                } else {
                    actionList.appendChild(dom.el('div', {
                        class: 'inFavorite',
                        title: chrome.i18n.getMessage('addInFavorite')
                    }));
                }

                // $(quality).on('mouseenter', this.onMouseEnterQuality.bind(this, quality, type, index));

                contentBody.appendChild(dom.el('li', {
                    append: [
                        dom.el('div', {
                            data: {
                                index: index
                            },
                            class: 'picture',
                            append: [
                                actionList,
                                dom.el('a', {
                                    class: 'link',
                                    href: readMoreUrl,
                                    target: '_blank',
                                    title: chrome.i18n.getMessage('readMore')
                                }),
                                dom.el('a', {
                                    href: search_link,
                                    title: title,
                                    append: dom.el('img', {
                                        src: imgUrl,
                                        on: ['error', function () {
                                            this.src = 'img/no_poster.png';
                                        }]
                                    })
                                })
                            ]
                        }),
                        dom.el('div', {
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
            } else if (type === 'favorites' && categoryObj.li.classList.contains('empty')) {
                categoryObj.li.classList.remove('empty');
            }

            if (!categoryObj.setPage || update_pages) {
                this.getPageListBody(categoryObj, content, page);
            }

            categoryObj.body.textContent = '';
            categoryObj.body.appendChild(contentBody);
        },
        xhr_dune: function (type, source) {
            source.xhr_wait_count--;
            if (source.xhr_wait_count !== 0) {
                return;
            }

            var categoryObj = this.varCache.categoryList[type];
            var cache = exploreCache[categoryObj.cacheName];

            var content = [];
            source.xhr_content.sort(function (a, b) {
                return a[0] > b[0] ? 1 : -1;
            });
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
            chrome.storage.local.set(storage);
            if (__storage.enableFavoriteSync && type === 'favorites') {
                chrome.storage.sync.set(storage);
            }
        },
        xhr_send: function (type, source, page, page_mode) {
            var _this = explore;
            source.xhr_wait_count++;
            source.xhr.push(
                utils.request({
                    url: (page_mode) ? source.url.replace('%page%', page) : source.url
                }, function (err, response) {
                    if (err) {
                        explore.xhr_dune(type, source);
                    } else {
                        var item = [page, _this.content_parser[type](response.body)];
                        source.xhr_content.push(item);
                        explore.xhr_dune(type, source);
                    }
                })
            );
        },
        getCategoryContent: function (type) {
            var categoryObj = this.varCache.categoryList[type];
            var cache = exploreCache[categoryObj.cacheName];
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
                source.xhr.forEach(function (item) {
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
        updateCategoryContent: function (type) {
            var categoryObj = this.varCache.categoryList[type];
            categoryObj.body.style.minHeight = '';
            categoryObj.minHeight = '';
            var cache = exploreCache[categoryObj.cacheName];
            this.writeCategoryContent(categoryObj.type, cache.content, categoryObj.currentPage, 1);
        },
        getSetupBody: function (type) {
            var options = explorerOptionsObj[type];
            var source = this.sourceOptions[type];
            var categoryObj = this.varCache.categoryList[type];

            var updateContent = function () {
            };

            var onChangeRange = null;
            var range;
            var select = dom.el('select', {
                class: 'lineCount',
                append: (function () {
                    var list = [];
                    for (var i = 1; i < 7; i++) {
                        list.push(
                            dom.el('option', {
                                text: i,
                                value: i
                            })
                        );
                    }
                    return list;
                })(),
                on: ['change', function () {
                    var value = parseInt(this.value);
                    options.lineCount = parseInt(value);
                    explore.updateCategoryContent(type);

                    chrome.storage.local.set({explorerOptions: explorerOptions});
                }]
            });
            select.selectedIndex = options.lineCount - 1;;

            return dom.el('div', {
                class: 'setupBody',
                append: [
                    range = dom.el('input', {
                        type: 'range',
                        name: 'imageWidth',
                        value: options.width,
                        min: 20,
                        max: source.maxWidth,
                        on: ['input', function (e) {
                            var value = this.value;
                            options.width = parseInt(value);
                            explore.calculateSize(type);

                            clearTimeout(onChangeRange);
                            onChangeRange = setTimeout(function () {
                                explore.updateCategoryContent(type);

                                chrome.storage.local.set({explorerOptions: explorerOptions});
                            }, 250);
                        }]
                    }),
                    dom.el('div', {
                        class: 'defaultSize',
                        title: chrome.i18n.getMessage('default'),
                        on: ['click', function (e) {
                            e.preventDefault();
                            var defaultOptions = defaultExplorerOptionsObj[type];
                            range.value = defaultOptions.width;
                            range.dispatchEvent(new CustomEvent('input'));
                        }]
                    }),
                    select
                ]
            });
        },
        onPageListMouseEnter: function (categoryObj, e) {
            var el = e.target;
            if (el === categoryObj.pageEl) return;

            var page = parseInt(el.dataset.page);

            categoryObj.setPage(page);
        },
        onSetupClick: function (e) {
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
        onUpdateKpFavorites: function (e) {
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

            var onErrorStatus = function (className) {
                categoryObj.li.classList.remove('loading');
                categoryObj.li.classList.remove('error');
                categoryObj.li.classList.remove('login');
                categoryObj.li.classList.add(className);
            };

            var urlTemplate = source.url.replace('%category%', __storage.kinopoiskFolderId);
            (function getPage(page) {
                source.xhr = utils.request({
                    url: urlTemplate.replace('%page%', page)
                }, function (err, response) {
                    if (err) {
                        return onErrorStatus('error')
                    }
                    var data = response.body;
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
                    exploreCache[categoryObj.cacheName] = storage[categoryObj.cacheName] = {
                        content: contentList
                    };

                    chrome.storage.local.set(storage);

                    categoryObj.li.classList.remove('loading');
                });
            })(1);
        },
        writeCategoryList: function () {
            for (var i = 0, item; item = explorerOptions[i]; i++) {
                if (!item.enable) continue;

                var source = this.sourceOptions[item.type];

                var actionList = dom.el('div', {
                    class: 'actionList'
                });

                if (item.type === 'kp_favorites') {
                    dom.el(actionList, {
                        append: [
                            dom.el('a', {
                                class: 'open',
                                target: '_blank',
                                title: chrome.i18n.getMessage('goToTheWebsite'),
                                href: source.url.replace('%page%', 1).replace('%category%', __storage.kinopoiskFolderId)
                            }),
                            dom.el('div', {
                                class: 'update',
                                title: chrome.i18n.getMessage('update'),
                                on: ['click', this.onUpdateKpFavorites.bind(this)]
                            })
                        ]
                    });
                }

                actionList.appendChild(dom.el('div', {
                    class: 'setup',
                    title: chrome.i18n.getMessage('setupView'),
                    on: ['click', this.onSetupClick]
                }));

                var categoryObj = this.varCache.categoryList[item.type] = {};
                categoryObj.type = item.type;
                categoryObj.cacheName = 'expCache_' + item.type;

                var classList  = [];
                if (!item.show) {
                    classList.push('collapsed');
                }
                this.domCache.gallery.appendChild(categoryObj.li = dom.el('li', {
                    class: classList,
                    data: {
                        type: item.type
                    },
                    append: [
                        categoryObj.head = dom.el('div', {
                            class: 'head',
                            append: [
                                dom.el('div', {
                                    class: 'move'
                                }),
                                dom.el('div', {
                                    class: 'title',
                                    text: item.title || chrome.i18n.getMessage(item.lang)
                                }),
                                actionList,
                                dom.el('div', {
                                    class: 'collapses'
                                })
                            ],
                            on: ['click', function (e) {
                                var el = e.target;
                                if (el !== this && !el.classList.contains('collapses')) {
                                    return;
                                }

                                var li = this.parentNode;
                                var type = li.dataset.type;
                                var categoryObj = explore.varCache.categoryList[type];
                                var options = explorerOptionsObj[type];

                                if (options.show) {
                                    options.show = 0;
                                    categoryObj.li.classList.add('collapsed');
                                } else {
                                    options.show = 1;
                                    categoryObj.li.classList.remove('collapsed');

                                    explore.getCategoryContent(type);
                                }

                                chrome.storage.local.set({explorerOptions: explorerOptions});
                            }]
                        }),
                        categoryObj.pageEl = dom.el('ul', {
                            class: 'pageList',
                            data: {
                                type: item.type
                            }
                        }),
                        categoryObj.body = dom.el('ul', {class: 'body'})
                    ]
                }));

                $(categoryObj.pageEl).on('mouseenter', 'li', this.onPageListMouseEnter.bind(this, categoryObj));

                this.calculateSize(item.type);
                item.show && this.getCategoryContent(item.type);
            }
        },
        saveFavorites: function () {
            var fCategoryObj = this.varCache.categoryList.favorites;
            var fCache = exploreCache[fCategoryObj.cacheName];

            var storage = {};
            storage[fCategoryObj.cacheName] = fCache;
            chrome.storage.local.set(storage);
            if (__storage.enableFavoriteSync) {
                chrome.storage.sync.set(storage);
            }
        },
        onInFavorite: function (el, e) {
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
            var cache = exploreCache[categoryObj.cacheName];
            var item = cloneObj(cache.content[index]);

            item.img = this.addRootUrl(item.img, sourceOptions.imgUrl);
            item.url = this.addRootUrl(item.url, sourceOptions.rootUrl);
            item.title = this.getCategoryItemTitle(item);

            delete item.title_en;

            var fCategoryObj = this.varCache.categoryList.favorites;
            var fCache = exploreCache[fCategoryObj.cacheName];
            if (!fCache.content) {
                fCache.content = [];
            }
            fCache.content.push(item);
            this.updateCategoryContent('favorites');

            this.saveFavorites();
        },
        onRmFavorite: function (el, e) {
            e.preventDefault();
            el = el.parentNode;

            var type = 'favorites';
            var index = parseInt(el.dataset.index);

            var categoryObj = this.varCache.categoryList[type];
            var cache = exploreCache[categoryObj.cacheName];

            cache.content.splice(index, 1);

            this.updateCategoryContent('favorites');
            this.saveFavorites();
        },
        onEditItem: function (el, e) {
            e.preventDefault();
            el = el.parentNode;

            var type = 'favorites';
            var index = parseInt(el.dataset.index);

            var categoryObj = this.varCache.categoryList[type];
            var cache = exploreCache[categoryObj.cacheName];

            var item = cache.content[index];

            var $body = showNotification([
                [{label: {text: chrome.i18n.getMessage('title')}}],
                {input: {type: "text", value: item.title, placeholder: item.title, name: 'title'}},
                [{label: {text: chrome.i18n.getMessage('imageUrl')}}],
                {input: {type: "text", value: item.img, placeholder: item.img, name: 'img'}},
                [{label: {text: chrome.i18n.getMessage('imageUrl')}}],
                {input: {type: "text", value: item.url, placeholder: item.url, name: 'url'}},
                [
                    {
                        input: {
                            type: "button",
                            value: chrome.i18n.getMessage('change'),
                            name: 'yesBtn',
                            on: ['click', function (e) {
                                e.stopPropagation();
                                var formData = this.getFormData();

                                formData.title && (item.title = formData.title);
                                formData.img && (item.img = formData.img);
                                formData.url && (item.url = formData.url);

                                this.close();

                                explore.updateCategoryContent('favorites');
                                explore.saveFavorites();
                            }]
                        }
                    },
                    {
                        input: {
                            type: "button",
                            value: chrome.i18n.getMessage('cancel'),
                            name: 'noBtn',
                            on: ['click', function (e) {
                                e.stopPropagation();
                                this.close();
                            }]
                        }
                    }
                ]
            ]);
            $body.addClass('favoriteItemEdit');
        },
        once: function once() {
            explore.once = null;
            window.addEventListener('resize', debounce(function onResizeCategoryList() {
                if (onResizeCategoryList.lock) return;
                onResizeCategoryList.lock = true;

                for (var type in this.varCache.categoryList) {
                    var categoryObj = this.varCache.categoryList[type];
                    var options = explorerOptionsObj[type];
                    if (options.show && categoryObj.displayItemCount !== this.getCategoryDisplayItemCount(type)) {
                        this.updateCategoryContent(type);
                    }
                }

                onResizeCategoryList.lock = false;
            }.bind(this), 300));

            this.domCache.gallery.addEventListener('click', function (e) {
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
                    // return this.onClickQuality(el, e);
                }
            }.bind(this));

            this.writeCategoryList();

            if (__storage.enableFavoriteSync) {
                chrome.storage.onChanged.addListener(function (changes, areaName) {
                    var aName = __storage.enableFavoriteSync ? 'sync' : 'local';
                    if (areaName !== aName) {
                        return;
                    }
                    if (!changes.hasOwnProperty('expCache_favorites')) {
                        return;
                    }
                    var cache = changes.expCache_favorites.newValue || {};
                    var type = 'favorites';
                    if (JSON.stringify(exploreCache.expCache_favorites) === JSON.stringify(cache)) {
                        return;
                    }
                    exploreCache.expCache_favorites = cache;
                    var options = explorerOptionsObj[type];
                    if (options.enable && options.show) {
                        explore.updateCategoryContent(type);
                    }
                });
            }

            /*(this.domCache.$gallery = $(this.domCache.gallery)).sortable({
                axis: 'y',
                handle: '.head .move',
                scroll: false,
                start: function () {
                    window.scrollTo(0, 0);
                    this.domCache.gallery.classList.add('sortMode');

                    this.domCache.$gallery.sortable("refreshPositions");
                }.bind(this),
                stop: function () {
                    this.domCache.gallery.classList.remove('sortMode');

                    var typeList = [];
                    var _explorerOptions = [];
                    var type;
                    for (var i = 0, node, childNodes = this.domCache.gallery.childNodes; node = childNodes[i]; i++) {
                        type = node.dataset.type;
                        typeList.push(type);
                        _explorerOptions.push(explorerOptionsObj[type]);
                    }
                    for (type in explorerOptionsObj) {
                        if (typeList.indexOf(type) === -1) {
                            _explorerOptions.push(explorerOptionsObj[type]);
                        }
                    }
                    explorerOptions = _explorerOptions;

                    chrome.storage.loca.set({explorerOptions: explorerOptions});
                }.bind(this)
            });*/

            /*this.varCache.categoryList.favorites && $(this.varCache.categoryList.favorites.body).sortable({
                handle: '.move',
                items: 'li',
                opacity: 0.8,
                stop: function (e, ui) {
                    var li = ui.item[0];
                    var type = 'favorites';
                    var pic = li.firstChild;
                    var nextLi = li.nextElementSibling;
                    var index = parseInt(pic.dataset.index);

                    var categoryObj = this.varCache.categoryList[type];
                    var cache = exploreCache[categoryObj.cacheName];

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
            });*/
        },
        init: function (cb) {
            require(['./lib/jquery-3.1.1.min'], function () {
                require(['./lib/jquery-ui.min'], function () {
                    chrome.storage.local.get({
                        useEnglishPosterName: false,
                        enableFavoriteSync: false,
                        kinopoiskFolderId: 1
                    }, function (_storage) {
                        storage = __storage = _storage;

                        var cacheList = {};
                        for (var i = 0, item; item = defaultExplorerOptions[i]; i++) {
                            cacheList['expCache_' + item.type] = {};
                        }

                        chrome.storage.local.get(cacheList, function (storage) {
                            exploreCache = storage;

                            cb();
                        });
                    });
                });
            });
        }
    };
    return explore;
});