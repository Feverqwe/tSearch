/**
 * Created by Anton on 08.03.2015.
 */
var view = {
    domCache: {
        requestInput: document.getElementById('request_input'),
        clearBtn: document.getElementById('clear_btn'),
        searchBtn: document.getElementById('search_btn'),
        seedFilter: document.getElementById('seed_filter'),
        peerFilter: document.getElementById('peer_filter'),
        resultTableHead: document.getElementById('result_table_head'),
        resultTableBody: document.getElementById('result_table_body'),
        resultCategoryContainer: document.getElementById('result_category_container'),
        profileSelect: document.getElementById('profile_select'),
        trackerList: document.getElementById('tracker_list')
    },
    varCache: {
        categoryList: [
            {id: undefined, lang: 'categoryAll'},
            {id:  3, lang: 'categoryFilms'},
            {id:  0, lang: 'categorySerials'},
            {id:  7, lang: 'categoryAnime'},
            {id:  8, lang: 'categoryDocumentary'},
            {id: 11, lang: 'categoryHumor'},
            {id:  1, lang: 'categoryMusic'},
            {id:  2, lang: 'categoryGames'},
            {id:  5, lang: 'categoryBooks'},
            {id:  4, lang: 'categoryCartoons'},
            {id:  6, lang: 'categorySoft'},
            {id:  9, lang: 'categorySport'},
            {id: 10, lang: 'categoryXXX'},
            {id: -1, lang: 'categoryOther'}
        ],
        categoryObj: {},
        resultTableColumnList: [
            {id: 'time',    size: 125, lang: 'columnTime'},
            {id: 'quality', size: 31,  lang: 'columnQuality'},
            {id: 'title',   size: 0,   lang: 'columnTitle'},
            {id: 'size',    size: 80,  lang: 'columnSize'},
            {id: 'seeds',   size: 30,  lang: 'columnSeeds'},
            {id: 'leechs',  size: 30,  lang: 'columnLeechs'}
        ],
        resultSortBy: 1,
        tableSortColumn: 'quality',
        trackerList: {},
        searchResultCounter: {},
        searchResultCache: []
    },
    writeTableHead: function() {
        "use strict";
        var style = '';
        var sortBy = view.varCache.resultSortBy ? 'sortDown' : 'sortUp';
        view.domCache.resultTableHead.appendChild(mono.create('tr', {
            append: (function(){
                var thList = [];
                var hideList = [];
                if (engine.settings.hideSeedColumn) {
                    hideList.push('seeds');
                }
                if (engine.settings.hidePeerColumn) {
                    hideList.push('leechs');
                }
                for (var i = 0, item; item = view.varCache.resultTableColumnList[i]; i++) {
                    if (hideList.indexOf(item.id) !== -1) continue;
                    var order = view.varCache.tableSortColumn === item.id ? sortBy : null;
                    thList.push(mono.create('th', {
                        data: {
                            type: item.id
                        },
                        title: mono.language[item.lang],
                        class: [item.id, order],
                        append: mono.create('span', {
                            text: mono.language[item.lang + 'Short'] || mono.language[item.lang]
                        })
                    }));
                    if (item.size) {
                        style += '#result_table_head th.'+item.id+'{width:'+item.size+'px;}';
                    }
                }
                return thList;
            })()
        }));
        document.body.appendChild(mono.create('style', {
            class: 'thead_size',
            text: style
        }));
    },
    writeProfileList: function() {
        "use strict";
        view.domCache.profileSelect.textContent = '';
        mono.create(view.domCache.profileSelect, {
            append: (function(){
                var elList = [];
                for (var key in engine.profileList) {
                    elList.push(mono.create('option', {
                        text: key.replace('%defaultProfileName%', mono.language.label_def_profile),
                        value: key
                    }));
                }
                elList.push(mono.create('option', {
                    data: {
                        service: 'new'
                    },
                    text: mono.language.word_add
                }));
                return elList;
            })()
        });
    },
    selectProfile: function(profileName) {
        "use strict";
        var option = view.domCache.profileSelect.querySelector('option[value="'+profileName+'"]');
        if (!option) return;
        view.domCache.profileSelect.selectedIndex = option.index;

        var styleContent = '';
        view.domCache.trackerList.textContent = '';
        view.varCache.trackerList = {};
        engine.prepareTrackerList(profileName, function(trackerList) {
            if (view.varCache.trackerListStyle) {
                view.varCache.trackerListStyle.parentNode.removeChild(view.varCache.trackerListStyle);
            }
            for (var i = 0, tracker; tracker = trackerList[i]; i++) {
                var trackerObj = view.varCache.trackerList[tracker.id] = {
                    status: {}
                };
                trackerObj.count = 0;
                view.domCache.trackerList.appendChild(trackerObj.itemEl = mono.create('div', {
                    data: {
                        id: tracker.id
                    },
                    append: [
                        trackerObj.iconEl = mono.create('i', {
                            data: {
                                id: tracker.id
                            },
                            class: ['icon', 'tracker-icon']
                        }),
                        mono.create('a', {
                            text: tracker.title,
                            href: '#'
                        }),
                        trackerObj.countEl = mono.create('i', {
                            class: 'count',
                            text: '0'
                        })
                    ]
                }));
                styleContent += '.tracker-icon[data-id="' + tracker.id + '"] {' +
                    'background-image: url('+ tracker.icon +')' +
                '}';
            }
            document.body.appendChild(view.varCache.trackerListStyle = mono.create('style', {text: styleContent}));
        });
    },
    writeCategory: function() {
        "use strict";
        mono.create(view.domCache.resultCategoryContainer, {
            append: (function() {
                var elList = [];
                for (var i = 0, item; item = view.varCache.categoryList[i]; i++) {
                    view.varCache.categoryObj[item.id] = item;
                    item.count = 0;
                    item.isHidden = 1;
                    var className = 'hide';
                    var data = {};
                    if (item.id === undefined) {
                        data.id = item.id;
                        className = 'selected'
                    }
                    elList.push(item.itemEl = mono.create('div', {
                        class: className,
                        data: data,
                        append: [
                            mono.create('a', {
                                href: '#',
                                text: mono.language[item.lang]
                            }),
                            item.countEl = mono.create('i', {
                                text: 0
                            })
                        ]
                    }));
                }
                return elList;
            })()
        });
    },
    getTrackerList: function() {
        "use strict";
        var trackerList = [];
        var trackerSelectedList = [];
        for (var key in view.varCache.trackerList) {
            if (view.varCache.trackerList[key].selected === 1) {
                trackerSelectedList.push(key);
            }
            trackerList.push(key);
        }
        if (trackerSelectedList.length === 0) {
            trackerSelectedList = null;
        }
        return trackerSelectedList || trackerList;
    },
    writeResultList: function(tracker, request, torrentList) {
        "use strict";
        var searchResultCache = view.varCache.searchResultCache;
        var container = document.createDocumentFragment();
        for (var i = 0, item; item = torrentList[i]; i++) {
            if (engine.settings.hideZeroSeed === 1 && item.seed === 0) {
                continue;
            }
            var cacheItemIndex = searchResultCache.length;
            var cacheItem = {
                id: cacheItemIndex,
                api: item,
                node: mono.create('tr', {
                    data: {
                        id: tracker.id,
                        category: tracker.categoryId,
                        index: cacheItemIndex
                    },
                    append: [
                        mono.create('td', {
                            class: 'time',
                            title: item.date,
                            text: item.date
                        }),
                        mono.create('td', {
                            class: 'quality',
                            text: 0
                        }),
                        mono.create('td', {
                            class: 'title',
                            text: item.title
                        }),
                        mono.create('td', {
                            class: 'size',
                            text: item.size
                        }),
                        engine.settings.hideSeedColumn === 1 ? undefined : mono.create('td', {
                            class: 'seed',
                            text: item.seed
                        }),
                        engine.settings.hidePeerColumn === 1 ? undefined : mono.create('td', {
                            class: 'peer',
                            text: item.peer
                        })
                    ]
                })
            };
            searchResultCache.push(cacheItem);
            container.appendChild(cacheItem.node);

            view.varCache.searchResultCounter.tracker[tracker.id]++;
            view.varCache.searchResultCounter.category[item.categoryId]++;
            view.varCache.searchResultCounter.sum++;
        }
        view.domCache.resultTableBody.appendChild(container);
    },
    onSearchSuccess: function(tracker, request, data) {
        "use strict";
        if (data.requireAuth === 1) {
            view.clearTrackerStatus(tracker.id, ['auth']);
            return view.setTrackerStatus(tracker.id, 'auth', {
                url: tracker.search.loginUrl
            });
        }
        view.clearTrackerStatus(tracker.id);
        view.writeResultList(tracker, request, data.torrentList);
    },
    clearTrackerStatus: function(trackerId, except) {
        "use strict";
        var trackerItem = view.varCache.trackerList[trackerId];
        for (var status in trackerItem.status) {
            if (except && except.indexOf(status) !== -1) continue;
            if (trackerItem.status[status] === undefined) continue;
            trackerItem.status[status].disable();
            trackerItem.status[status] = undefined;
        }
    },
    setTrackerStatus: function(trackerId, status, data) {
        "use strict";
        var trackerItem = view.varCache.trackerList[trackerId];
        if (trackerItem.status[status] !== undefined) return;
        if (status === 'auth') {
            trackerItem.status[status] = (function(itemEl, data) {
                var authEl;
                mono.create(itemEl, {
                   after: authEl = mono.create('div', {
                       class: 'authItem',
                       append: [
                           mono.create('i', {
                               class: ['icon', 'auth']
                           }),
                           mono.create('a', {
                               text: mono.language.btn_login,
                               href: data.url,
                               target: '_blank'
                           })
                       ]
                   })
                });
                return {
                    disable: function() {
                        authEl.parentNode.removeChild(authEl);
                    }
                }
            })(trackerItem.itemEl, data);
        } else
        if (status === 'loading' || status === 'error') {
            trackerItem.status[status] = (function(iconEl, data) {
                iconEl.classList.add(status);
                data && data.statusText && data.status && (iconEl.title = data.statusText + ' (' + data.status + ')');
                return {
                    disable: function() {
                        iconEl.classList.remove(status);
                        data && (iconEl.title = '');
                    }
                }
            })(trackerItem.iconEl, data);
        }
        trackerItem = null;
    },
    onSearchError: function(tracker, xhrStatus, xhrStatusText) {
        "use strict";
        view.clearTrackerStatus(tracker.id);
        view.setTrackerStatus(tracker.id, 'error', {
            status: xhrStatus,
            statusText: xhrStatusText
        });
    },
    onSearchBegin: function(tracker) {
        "use strict";
        view.clearTrackerStatus(tracker.id, ['auth']);
        view.setTrackerStatus(tracker.id, 'loading');

        view.varCache.searchResultCounter.tracker[tracker.id] = 0;
    },
    resetResultCounter: function() {
        "use strict";
        view.varCache.searchResultCache = [];
        view.varCache.searchResultCounter = {
            tracker: {},
            category: (function() {
                "use strict";
                var obj = {};
                var categoryList = view.varCache.categoryList;
                for (var item in categoryList) {
                    var id = categoryList[item].id;
                    obj[id] = 0;
                }
                return obj;
            })(),
            sum: 0
        };

        //TODO: Update dom
    },
    search: function(request) {
        "use strict";
        view.domCache.resultTableBody.textContent = '';
        view.resetResultCounter();
        var trackerList = view.getTrackerList();
        exKit.searchList(trackerList, request, {
            onSuccess: view.onSearchSuccess,
            onError: view.onSearchError,
            onBegin: view.onSearchBegin
        });
    },
    onTrackerListItemClick: function(e) {
        "use strict";
        e.preventDefault();
        var trackerId = this.dataset.id;

        for (var _trackerId in view.varCache.trackerList) {
            if (_trackerId === trackerId) continue;
            var tracker = view.varCache.trackerList[_trackerId];
            if (tracker.selected === 1) {
                tracker.itemEl.classList.remove('selected');
                tracker.selected = 0;
            }
        }

        if (this.classList.contains('selected')) {
            this.classList.remove('selected');
            view.varCache.trackerList[trackerId].selected = 0;
        } else {
            this.classList.add('selected');
            view.varCache.trackerList[trackerId].selected = 1;
        }
    },
    once: function() {
        "use strict";
        mono.writeLanguage(mono.language);
        document.body.classList.remove('loading');
        view.domCache.requestInput.focus();

        view.domCache.clearBtn.addEventListener('click', function() {
            view.domCache.requestInput.value = '';
            view.domCache.requestInput.dispatchEvent(new CustomEvent('input'));
            view.domCache.requestInput.focus();
        });

        view.domCache.requestInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                view.domCache.clearBtn.classList.add('show');
            } else {
                view.domCache.clearBtn.classList.remove('show');
            }
        });

        view.domCache.requestInput.addEventListener('keypress', function(e) {
            if (e.keyCode === 13) {
                view.domCache.searchBtn.dispatchEvent(new CustomEvent('click', {cancelable: true}));
            }
        });

        view.domCache.searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var request = view.domCache.requestInput.value.trim();
            view.search(request);
        });

        view.domCache.trackerList.addEventListener('click', function(e) {
            var el = e.target;
            if (this === el) return;
            while (el.parentNode !== this) {
                el = el.parentNode;
            }

            if (!el.dataset.id) {
                return;
            }
            view.onTrackerListItemClick.call(el, e);
        });

        view.writeTableHead();
        view.writeProfileList();
        view.writeCategory();

        view.selectProfile(engine.currentProfile);
        view.domCache.profileSelect.addEventListener('change', function() {
            var service = this.childNodes[this.selectedIndex].dataset.service;
            if (service) {
                var option = this.querySelector('option[value="'+engine.currentProfile+'"]');
                if (!option) return;
                this.selectedIndex = option.index;
                return;
            }
            view.selectProfile(this.value);
        });

        if (engine.settings.hideSeedColumn === 1) {
            view.domCache.seedFilter.style.display = 'none';
            view.domCache.seedFilter.previousElementSibling.style.display = 'none';
        }

        if (engine.settings.hidePeerColumn === 1) {
            view.domCache.peerFilter.style.display = 'none';
            view.domCache.peerFilter.previousElementSibling.style.display = 'none';
        }

        document.body.appendChild(mono.create('script', {src: 'js/jquery-2.1.3.min.js'}));
    },
    onUiReady: function() {
        "use strict";

    }
};

var define = function(name, func) {
    "use strict";
    if (name === 'jquery') {
        document.body.appendChild(mono.create('script', {src: 'js/jquery-ui.min.js'}));
        return;
    }
    if (name[0] === 'jquery') {
        func(jQuery);
        view.onUiReady();
    }
};
define.amd = {};

engine.init(function() {
    "use strict";
    view.once();
});