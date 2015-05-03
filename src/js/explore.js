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
    contentOptions: {
        favorites: {
            maxWidth: 120
        },
        kp_favorites: {
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/mykp/movies/list/type/%category%/page/%page%/sort/default/vector/desc/vt/all/format/full/perpage/25/',
            baseUrl: "http://www.kinopoisk.ru/film/",
            imgUrl: "http://st.kinopoisk.ru/images/film/",
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_in_cinema: {//new in cinema
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/afisha/new/page/%page%/',
            keepAlive: [2, 4, 6],
            pageEnd: 2,
            pageStart: 0,
            baseUrl: "http://www.kinopoisk.ru/film/",
            imgUrl: "http://st.kinopoisk.ru/images/film/",
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_popular: {
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/popular/day/now/perpage/200/',
            keepAlive: [0, 3],
            baseUrl: "http://www.kinopoisk.ru/film/",
            imgUrl: "http://st.kinopoisk.ru/images/film/",
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        kp_serials: {
            rootUrl: 'http://www.kinopoisk.ru',
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/top/lists/45/',
            keepAlive: [0],
            baseUrl: "http://www.kinopoisk.ru/film/",
            imgUrl: "http://st.kinopoisk.ru/images/film/",
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_in_cinema: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/movies-in-theaters/',
            keepAlive: [2, 4, 6],
            baseUrl: "http://www.imdb.com/title/",
            imgUrl: "http://ia.media-imdb.com/images/",
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_popular: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=feature',
            keepAlive: [0 , 2],
            baseUrl: "http://www.imdb.com/title/",
            imgUrl: "http://ia.media-imdb.com/images/",
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        imdb_serials: {
            rootUrl: 'http://www.imdb.com',
            maxWidth: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=tv_series',
            keepAlive: [0],
            baseUrl: "http://www.imdb.com/title/",
            imgUrl: "http://ia.media-imdb.com/images/",
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=130&rewriteMime=image/jpeg&url='
        },
        gg_games_top: {//best
            rootUrl: 'http://gameguru.ru',
            maxWidth: 120,
            url: 'http://gameguru.ru/pc/games/rated/page%page%/list.html',
            keepAlive: [0],
            pageEnd: 5,
            pageStart: 1,
            baseUrl: "http://gameguru.ru/pc/games/",
            imgUrl: "http://gameguru.ru/f/games/",
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=220&rewriteMime=image/jpeg&url='
        },
        gg_games_new: {//new
            rootUrl: 'http://gameguru.ru',
            maxWidth: 120,
            url: 'http://gameguru.ru/pc/games/released/page%page%/list.html',
            keepAlive: [2, 4],
            pageEnd: 5,
            pageStart: 1,
            baseUrl: "http://gameguru.ru/pc/games/",
            imgUrl: "http://gameguru.ru/f/games/",
            proxyUrl: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=220&rewriteMime=image/jpeg&url='
        }
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
    writeCategoryList: function () {
        for (var i = 0, item; item = engine.explorerOptions[i]; i++) {
            if (!item.enable) continue;

            var source = this.contentOptions[item.type];

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
                class: [!item.s ? 'collapsed' : undefined],
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
                                        append: function(){
                                            "use strict";
                                            var list = [];
                                            for (var i = 1; i < 7; i++) {
                                                list.push(
                                                    mono.create('options', {
                                                        text: i,
                                                        value: i
                                                    })
                                                );
                                            }
                                            return list;
                                        }()
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