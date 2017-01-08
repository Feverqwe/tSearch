/**
 * Created by Anton on 02.05.2015.
 */
"use strict";
define([
    '../lib/promise.min',
    './utils',
    './dom'
], function (Promise, utils, dom) {
    var defaultSections = [
        'favorites',
        'kpFavorites', 'kpInCinema', 'kpPopular', 'kpSerials',
        'imdbInCinema', 'imdbPopular', 'imdbSerials',
        'ggGamesTop', 'ggGamesNew'
    ];
    var insertDefaultSections = function (idSectionMap, sections) {
        defaultSections.forEach(function (id) {
            if (!idSectionMap[id]) {
                var item = {
                    id: id,
                    enable: true,
                    show: true,
                    width: 100,
                    lines: 1
                };
                if (['kpPopular', 'imdbPopular'].indexOf(id) !== -1) {
                    item.lines = 2;
                }
                sections.push(idSectionMap[id] = item);
            }
        });
    };

    var contentSource = {
        favorites: {
            maxWidth: 120,
            noAutoUpdate: 1
        },
        kpFavorites: {
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'https://www.kinopoisk.ru/mykp/movies/list/type/%category%/page/%page%/sort/default/vector/desc/vt/all/format/full/perpage/25/',
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/',
            noAutoUpdate: 1
        },
        kpInCinema: {//new in cinema
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: [
                'http://www.kinopoisk.ru/afisha/new/page/0/',
                'http://www.kinopoisk.ru/afisha/new/page/1/',
                'http://www.kinopoisk.ru/afisha/new/page/2/'
            ],
            keepAlive: [2, 4, 6],
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/'
        },
        kpPopular: {
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/popular/day/now/perpage/200/',
            keepAlive: [0, 3],
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/'
        },
        kpSerials: {
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/top/lists/45/',
            keepAlive: [0],
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/'
        },
        imdbInCinema: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/movies-in-theaters/',
            keepAlive: [2, 4, 6],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/'
        },
        imdbPopular: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=feature',
            keepAlive: [0, 2],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/'
        },
        imdbSerials: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=tv_series',
            keepAlive: [0],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/'
        },
        ggGamesTop: {//best
            rootUrl: 'http://gameguru.ru',
            maxWidth: 120,
            url: [
                'http://gameguru.ru/pc/games/rated/list.html',
                'http://gameguru.ru/pc/games/rated/page2/list.html',
                'http://gameguru.ru/pc/games/rated/page3/list.html',
                'http://gameguru.ru/pc/games/rated/page4/list.html',
                'http://gameguru.ru/pc/games/rated/page5/list.html'
            ],
            keepAlive: [0],
            baseUrl: 'http://gameguru.ru/pc/games/',
            imgUrl: 'http://gameguru.ru/f/games/'
        },
        ggGamesNew: {//new
            rootUrl: 'http://gameguru.ru',
            maxWidth: 120,
            url: [
                'http://gameguru.ru/pc/games/released/list.html',
                'http://gameguru.ru/pc/games/released/page2/list.html',
                'http://gameguru.ru/pc/games/released/page3/list.html',
                'http://gameguru.ru/pc/games/released/page4/list.html',
                'http://gameguru.ru/pc/games/released/page5/list.html'
            ],
            keepAlive: [2, 4],
            baseUrl: 'http://gameguru.ru/pc/games/',
            imgUrl: 'http://gameguru.ru/f/games/'
        }
    };
    var contentParser = (function () {
        var exKit = {
            contentFilterR: {
                searchJs: /javascript/ig,
                blockHref: /\/\//,
                blockSrc: /src=(['"]?)/ig,
                blockSrcSet: /srcset=(['"]?)/ig,
                blockOnEvent: /on(\w+)=/ig
            },
            contentFilter: function (content) {
                return content.replace(exKit.contentFilterR.searchJs, 'tms-block-javascript')
                    .replace(exKit.contentFilterR.blockHref, '//about:blank#blockurl#')
                    .replace(exKit.contentFilterR.blockSrc, 'src=$1data:image/gif,base64#blockurl#')
                    .replace(exKit.contentFilterR.blockSrcSet, 'data-block-attr-srcset=$1')
                    .replace(exKit.contentFilterR.blockOnEvent, 'data-block-event-$1=');
            },
            contentUnFilter: function (content) {
                return content.replace(/data:image\/gif,base64#blockurl#/g, '')
                    .replace(/about:blank#blockurl#/g, '')
                    .replace(/tms-block-javascript/g, 'javascript');
            },
            parseHtml: function (html) {
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
        return {
            kpFavorites: function (content) {
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
            kpInCinema: function (content) {
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
            kpPopular: function (content) {
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
            kpSerials: function (content) {
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
            imdbInCinema: function (content) {
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
            imdbPopular: function (content) {
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
            imdbSerials: function (content) {
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
            ggGamesTop: gg_games_new,
            ggGamesNew: gg_games_new
        };
    })();

    var Explore = function (storage, exploreNode) {
        var movebleStyleList = {};
        var sections = storage.eSections;
        var idSectionMap = {};
        sections.forEach(function (item) {
            idSectionMap[item.id] = item;
        });
        insertDefaultSections(idSectionMap, sections);

        var sectionWrappers = [];
        var sectionWrapperIdMap = {};

        var updateCategoryContent = function (sectionWrapper) {
            sectionWrapper.bodyNode.style.minHeight = '';
            sectionWrapper.minHeight = 0;
            setContent(sectionWrapper, sectionWrapper.currentPage, 1);
        };

        var onResize = function () {
            var section;
            for (var i = 0, sectionWrapper; sectionWrapper = sectionWrappers[i]; i++) {
                section = sectionWrapper.section;
                if (section.enable && section.show && sectionWrapper.displayItemCount !== getCategoryDisplayItemCount(section)) {
                    updateCategoryContent(sectionWrapper);
                }
            }
        };

        var onResizeThrottle = utils.throttle(onResize, 100);

        var saveOptions = function () {
            chrome.storage.local.set({eSections: sections});
        };

        var updateKpFavorites = function () {
            var _this = this;

            _this.node.classList.add('section-loading');
            loadFavorites(_this).then(function () {
                _this.node.classList.remove('section-loading');

                var storageDate = {};
                storageDate[_this.cacheKey] = _this.cache;
                chrome.storage.local.set(storageDate);

                setContent(_this);
            });
        };

        var getSetupBody = function () {

        };

        var sectionSetup = function () {

        };

        var saveFavorites = function () {
            var sectionWrapper = sectionWrapperIdMap.favorites;
            var storage = {};
            storage[sectionWrapper.cacheKey] = sectionWrapper.cache;
            chrome.storage.local.set(storage);
        };

        var onInFavorite = function (el, li, e) {
            e.preventDefault();

            var index = parseInt(el.dataset.index);
            var sectionWrapper = sectionWrapperIdMap[li.dataset.id];
            var item = sectionWrapper.cache.content[index];

            var source = sectionWrapper.source;

            var _item = {
                img: addRootUrl(item.img, source.imgUrl),
                url: addRootUrl(item.url, source.rootUrl),
                title: getCategoryItemTitle(item)
            };

            var favoritesSectionWrapper = sectionWrapperIdMap.favorites;
            if (!favoritesSectionWrapper.cache.content) {
                favoritesSectionWrapper.cache.content = [];
            }

            favoritesSectionWrapper.cache.content.push(_item);

            updateCategoryContent(favoritesSectionWrapper);

            saveFavorites();
        };

        var onRmFavorite = function (el, li, e) {
            e.preventDefault();
            el = el.parentNode;

            var index = parseInt(el.dataset.index);
            var sectionWrapper = sectionWrapperIdMap.favorites;

            sectionWrapper.cache.content.splice(index, 1);

            updateCategoryContent(sectionWrapper);

            saveFavorites();
        };

        var sectionCollapse = function () {
            if (this.section.show) {
                this.section.show = false;
                this.node.classList.add('section-collapsed');
            } else {
                this.section.show = true;
                this.node.classList.remove('section-collapsed');
                getSectionContent(this);
            }
            saveOptions();
        };

        /**
         * @typedef {Object} section
         * @property {String} id
         * @property {Boolean} enable
         * @property {Boolean} show
         * @property {number} width
         * @property {number} lines
         */

        var getCacheDate = function (keepAlive) {
            if (keepAlive) {
                var date = new Date();
                var day = date.getDay();
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var seconds = date.getSeconds();
                var lastDay = 0;
                keepAlive.forEach(function (num) {
                    if (day >= num) {
                        lastDay = num;
                    }
                });
                day = day - lastDay;
                day = day * 24 * 60 * 60;
                hours = hours * 60 * 60;
                minutes = minutes * 60;
                return parseInt(date.getTime() / 1000) - day - hours - minutes - seconds;
            }
        };

        var getCategoryDisplayItemCount = function (section) {
            var lineCount = section.lines;
            var width = document.body.clientWidth - 176;
            var itemCount = Math.ceil(width / (section.width + 10 * 2)) - 1;
            return itemCount * lineCount;
        };

        var getCategoryItemTitle = function (item) {
            var title;
            if (item.title_en && storage.useEnglishPosterName) {
                title = item.title_en;
            } else {
                title = item.title;
            }
            return title;
        };

        var calculateMoveble = function (el, width) {
            var styleEl = null;

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
            if (!movebleStyleList['style.' + moveName]) {
                var keyFrames = ''
                    + '{'
                    + '0%{margin-left:2px;}'
                    + '50%{margin-left:-' + (elWidth - width) + 'px;}'
                    + '90%{margin-left:6px;}'
                    + '100%{margin-left:2px;}'
                    + '}';
                movebleStyleList['style.' + moveName] = styleEl = dom.el('style', {
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

            if (styleEl) {
                document.body.appendChild(styleEl);
            }
        };

        var addRootUrl = function (url, root) {
            if (root && !/^https?:\/\//.test(url)) {
                url = root + url;
            }
            return url;
        };

        var onSetPage = function (page) {
            if (this.currentPage !== page) {
                this.currentPage = page;
                this.currentPageEl && this.currentPageEl.classList.remove('item-active');
                var activePage = this.pagesNode.querySelector('li[data-page="' + page + '"]');
                activePage && activePage.classList.add('item-active');
                this.currentPageEl = activePage;

                var height = this.bodyNode.clientHeight;
                if (this.minHeight < height) {
                    this.bodyNode.style.minHeight = height + 'px';
                    this.minHeight = height;
                }

                if (this.cache.content) {
                    setContent(this, page);
                }
            }
        };

        var setPages = function (sectionWrapper, content, page) {
            var coefficient = content.length / sectionWrapper.displayItemCount;
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
                var node = dom.el('li', {
                    class: ['pages__item'],
                    data: {
                        page: i
                    },
                    text: i + 1
                });
                if (isActive) {
                    node.classList.add('item-active');
                    sectionWrapper.currentPageEl = node;
                    sectionWrapper.currentPage = i;
                }
                pageItems.appendChild(node);
            }

            sectionWrapper.pagesNode.textContent = '';
            sectionWrapper.pagesNode.appendChild(pageItems);

            if (pageCount === 0) {
                sectionWrapper.pagesNode.classList.add('pages-hide');
            } else {
                sectionWrapper.pagesNode.classList.remove('pages-hide');
            }

            sectionWrapper.setPage = onSetPage;
        };

        var setContent = function (sectionWrapper, page, update_pages) {
            var sourceOptions = sectionWrapper.source;
            var id = sectionWrapper.id;
            page = page || 0;
            var content = sectionWrapper.cache.content || [];

            var displayItemCount = sectionWrapper.displayItemCount = getCategoryDisplayItemCount(sectionWrapper.section);
            var from = displayItemCount * page;

            var contentBody = document.createDocumentFragment();
            var items = content.slice(from, from + displayItemCount);
            items.forEach(function (item, index) {
                index = index + from;
                var title = getCategoryItemTitle(item);
                var search_link = 'index.html#' + utils.hashParam({
                        query: title
                    });
                var imgUrl = addRootUrl(item.img, sourceOptions.imgUrl);
                var readMoreUrl = addRootUrl(item.url, sourceOptions.rootUrl);

                var actionList = document.createDocumentFragment();
                if (id === 'favorites') {
                    dom.el(actionList, {
                        append: [
                            dom.el('div', {
                                class: 'action__rmFavorite',
                                title: chrome.i18n.getMessage('removeFromFavorite')
                            }),
                            dom.el('div', {
                                class: 'action__move',
                                title: chrome.i18n.getMessage('move')
                            }),
                            /*dom.el('div', {
                                class: 'action__edit',
                                title: chrome.i18n.getMessage('edit')
                            })*/
                        ]
                    });
                } else {
                    actionList.appendChild(dom.el('div', {
                        class: 'action__inFavorite',
                        title: chrome.i18n.getMessage('addInFavorite')
                    }));
                }

                contentBody.appendChild(dom.el('li', {
                    class: ['gallery__item'],
                    append: [
                        dom.el('div', {
                            data: {
                                index: index
                            },
                            class: 'item__picture',
                            append: [
                                actionList,
                                dom.el('a', {
                                    class: 'item__link',
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
                            class: 'item__title',
                            append: dom.el('span', {
                                append: dom.el('a', {
                                    href: search_link,
                                    text: title,
                                    title: title
                                }),
                                on: ['mouseenter', function title__mouseEnter(e) {
                                    this.removeEventListener('mouseenter', title__mouseEnter);
                                    calculateMoveble(this, sectionWrapper.section.width);
                                }]
                            })
                        })
                    ]
                }));
            });

            if (!contentBody.childNodes.length) {
                if (page > 0) {
                    page--;
                    return setContent(sectionWrapper, page, update_pages);
                }
                if (id === 'favorites') {
                    sectionWrapper.node.classList.add('section-empty');
                }
            } else
            if (id === 'favorites' && sectionWrapper.node.classList.contains('section-empty')) {
                sectionWrapper.node.classList.remove('section-empty');
            }

            if (!sectionWrapper.setPage || update_pages) {
                setPages(sectionWrapper, content, page);
            }

            sectionWrapper.bodyNode.textContent = '';
            sectionWrapper.bodyNode.appendChild(contentBody);
        };

        var loadContent = function (sectionWrapper) {
            sectionWrapper.requestList.splice(0).forEach(function (request) {
                request.abort();
            });
            var urlList = sectionWrapper.source.url;
            if (!Array.isArray(urlList)) {
                urlList = [urlList];
            }
            var promiseList = [];
            urlList.forEach(function (url) {
                promiseList.push(new Promise(function (resolve, reject) {
                    var request = utils.request({
                        url: url
                    }, function (err, response) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(response.body);
                        }
                    });
                    sectionWrapper.requestList.push({
                        abort: function () {
                            request.abort();
                            reject(new Error('ABORTED'));
                        }
                    });
                }).then(function (body) {
                    var content = contentParser[sectionWrapper.id](body);
                    if (!content) {
                        throw new Error("ERROR");
                    }
                    return content;
                }));
            });

            sectionWrapper.node.classList.add('section-error');

            var cache = sectionWrapper.cache;
            return Promise.all(promiseList).then(function (contentList) {
                var content = [].concat.apply([], contentList);
                if (!content.length) {
                    throw new Error("Content is empty!");
                }
                cache.content = content;
                return {success: true};
            }).catch(function (err) {
                cache.keepAlive = null;
                cache.errorTimeout = parseInt(Date.now() / 1000 + 60 * 60 * 2);
                sectionWrapper.node.classList.add('section-error');
                return {success: false, error: err};
            });
        };

        var loadFavorites = function (sectionWrapper) {
            var cache = sectionWrapper.cache;
            sectionWrapper.requestList.splice(0).forEach(function (request) {
                request.abort();
            });

            var limit = 20;
            var unicUrlList = [];
            var contentList = [];

            var urlTemplate = sectionWrapper.source.url.replace('%category%', storage.kinopoiskFolderId);
            var loadPage = function (page) {
                return new Promise(function(resolve, reject) {
                    var request = utils.request({
                        url: urlTemplate.replace('%page%', page)
                    }, function (err, response) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(response.body);
                        }
                    });

                    sectionWrapper.requestList.push({
                        abort: function () {
                            request.abort();
                            reject(new Error('ABORTED'));
                        }
                    });
                }).then(function (body) {
                    var content = contentParser[sectionWrapper.id](body);
                    if (!content) {
                        throw new Error("ERROR");
                    }
                    if (content.requireAuth) {
                        throw new Error("AUTH");
                    }

                    var newCount = 0;
                    for (var i = 0, item; item = content[i]; i++) {
                        if (unicUrlList.indexOf(item.url) === -1) {
                            unicUrlList.push(item.url);
                            contentList.push(item);
                            newCount++;
                        }
                    }

                    if (newCount && limit--) {
                        return loadPage(++page);
                    }
                });
            };

            sectionWrapper.node.classList.remove('section-login');
            sectionWrapper.node.classList.remove('section-error');

            return loadPage(1).then(function () {
                cache.content = contentList;
                return {success: true};
            }).catch(function (err) {
                if (err.message === 'AUTH') {
                    sectionWrapper.node.classList.add('section-login');
                } else {
                    sectionWrapper.node.classList.add('section-error');
                }
                return {success: false, error: err};
            });
        };

        var getSectionContent = function (sectionWrapper) {
            chrome.storage.local.get(sectionWrapper.cacheKey, function (storage) {
                var cache = storage[sectionWrapper.cacheKey] || {};
                sectionWrapper.cache = cache;
                var source = sectionWrapper.source;
                var date = getCacheDate(source.keepAlive);
                if (source.noAutoUpdate) {
                    setContent(sectionWrapper);
                } else
                if (cache.errorTimeout && cache.errorTimeout > parseInt(Date.now() / 1000)) {
                    sectionWrapper.node.classList.add('section-error');
                } else
                if (cache.keepAlive === date || !navigator.onLine) {
                    setContent(sectionWrapper);
                } else {
                    sectionWrapper.node.classList.add('section-loading');
                    cache.keepAlive = date;
                    loadContent(sectionWrapper).then(function (result) {
                        sectionWrapper.node.classList.remove('section-loading');

                        var storageDate = {};
                        storageDate[sectionWrapper.cacheKey] = cache;
                        chrome.storage.local.set(storageDate);

                        setContent(sectionWrapper);
                    });
                }
            });
        };

        var width2fontSize = function (sectionWrapper) {
            var min = 10;
            var max = 13.5;
            var width = sectionWrapper.section.width;
            var maxWidth = sectionWrapper.source.maxWidth;
            if (width >= 60) {
                width -= 60;
                maxWidth -= 60;
            } else {
                return;
            }
            var coefficient = width / maxWidth * 100;
            return (min + ((max - min) / 100 * coefficient)).toFixed(6);
        };

        var calculateSize = function (sectionWrapper) {
            var styleNode = sectionWrapper.styleNode;
            var section = sectionWrapper.section;
            var fontSize = width2fontSize(sectionWrapper);

            var base = 'ul.explore li[data-id=' + JSON.stringify(sectionWrapper.id) + '] > ul.section__body > li';

            var imgSize = base + '{width: ' + section.width + 'px;}';

            var fontStyle = base + ' > div.item__title{' + (fontSize ? 'font-size:' + fontSize + 'px;' : 'display:none;') + '}';

            if (!styleNode) {
                styleNode = sectionWrapper.styleNode = dom.el('style', {
                    class: ['section-style', 'section-style--' + sectionWrapper.id]
                });
                document.body.appendChild(styleNode);
            }
            styleNode.textContent = imgSize + fontStyle;
        };

        var createSection = function (/**section*/section) {
            var sectionWrapper = {};
            sectionWrapper.id = section.id;
            sectionWrapper.source = contentSource[section.id];
            sectionWrapper.section = section;
            sectionWrapper.cacheKey = 'cache_' + section.id;
            sectionWrapper.setup = sectionSetup;
            sectionWrapper.collapse = sectionCollapse;
            sectionWrapper.requestList = [];

            sectionWrapper.cache = {};
            sectionWrapper.currentPage = null;
            sectionWrapper.currentPageEl = null;
            sectionWrapper.minHeight = 0;
            sectionWrapper.displayItemCount = null;
            sectionWrapper.setPage = null;

            if (section.id === 'kpFavorites') {
                sectionWrapper.update = updateKpFavorites;
            }

            sectionWrapper.node = dom.el('li', {
                class: ['section', 'section-' + section.id],
                data: {
                    id: section.id
                },
                append: [
                    dom.el('div', {
                        class: ['section__head'],
                        append: [
                            sectionWrapper.moveNode = dom.el('div', {
                                class: ['section__move']
                            }),
                            dom.el('div', {
                                class: ['section__title'],
                                text: chrome.i18n.getMessage(section.id)
                            }),
                            dom.el('div', {
                                class: ['section__actions'],
                                append: [
                                    section.id !== 'kpFavorites' ? '' : dom.el('a', {
                                        class: 'action__open',
                                        target: '_blank',
                                        title: chrome.i18n.getMessage('goToTheWebsite'),
                                        href: sectionWrapper.source.url.replace('%page%', 1).replace('%category%', storage.kinopoiskFolderId)
                                    }),
                                    !sectionWrapper.update ? '' : dom.el('div', {
                                        class: 'action__update',
                                        title: chrome.i18n.getMessage('update'),
                                        on: ['click', function (e) {
                                            e.preventDefault();
                                            sectionWrapper.update();
                                        }]
                                    }),
                                    dom.el('div', {
                                        class: 'action__setup',
                                        title: chrome.i18n.getMessage('setupView'),
                                        on: ['click', function (e) {
                                            e.preventDefault();
                                            sectionWrapper.setup();
                                        }]
                                    })
                                ]
                            }),
                            sectionWrapper.collapsesNode = dom.el('div', {
                                class: ['section__collapses'],
                                on: ['click', function (e) {
                                    e.preventDefault();
                                    sectionWrapper.collapse();
                                }]
                            })
                        ]
                    }),
                    sectionWrapper.pagesNode = dom.el('ul', {
                        class: ['section__pages']
                    }),
                    sectionWrapper.bodyNode = dom.el('ul', {
                        class: ['section__body']
                    })
                ]
            });

            sectionWrapper.pagesNode.addEventListener('mouseover', function (e) {
                var node = dom.closestNode(this, e.target);
                if (node) {
                    sectionWrapper.setPage(parseInt(node.dataset.page));
                }
            });

            if (!section.show) {
                sectionWrapper.node.classList.add('section-collapsed');
            } else {
                getSectionContent(sectionWrapper);
            }

            calculateSize(sectionWrapper);

            return sectionWrapper;
        };

        var init = function () {
            sections.forEach(function (/**section*/item) {
                var sectionWrapper = createSection(item);
                sectionWrappers.push(sectionWrapper);
                sectionWrapperIdMap[sectionWrapper.id] = sectionWrapper;
                if (item.enable) {
                    exploreNode.appendChild(sectionWrapper.node);
                }
            });
            exploreNode.addEventListener('click', function (e) {
                var target = e.target;
                var el = dom.closest('.item__picture', target);
                var item = el && dom.closest('.section', el);
                if (item) {
                    if (target.classList.contains('action__inFavorite')) {
                        return onInFavorite(el, item, e);
                    }
                    if (target.classList.contains('action__rmFavorite')) {
                        return onRmFavorite(el, item, e);
                    }
                    /*if (el.classList.contains('edit')) {
                        return onEditItem(el, item, e);
                    }*/
                    /*if (el.classList.contains('quality')) {
                        return this.onClickQuality(el, item, e);
                    }*/
                }
            });
        };

        this.show = function () {
            init && init();
            init = null;
            window.addEventListener('resize', onResizeThrottle);
            exploreNode.classList.remove('explore-hide');
        };
        this.hide = function () {
            window.removeEventListener('resize', onResizeThrottle);
            exploreNode.classList.add('explore-hide');
        };
    };
    return Explore;
});