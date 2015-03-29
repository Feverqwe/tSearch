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
        categoryContainer: document.getElementById('result_category_container'),
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
        categoryObjList: {},
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
        searchResultCache: [],
        trackerListStyle: undefined,
        filter: {
            trackerList: undefined,
            category: undefined,
            word: undefined,
            size: undefined,
            data: undefined,
            seed: undefined,
            peer: undefined
        }
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
    setTrackerCount: function(trackerObj, count) {
        "use strict";
        if (trackerObj.count === count) return;
        trackerObj.count = count;
        trackerObj.countEl.textContent = count;
    },
    setTrackerStatus: function(trackerObj, status, data) {
        "use strict";
        if (trackerObj.status[status] !== undefined) return;
        if (status === 'auth') {
            trackerObj.status[status] = (function(itemEl, data) {
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
            })(trackerObj.itemEl, data);
        } else
        if (status === 'loading' || status === 'error') {
            trackerObj.status[status] = (function(iconEl, status, data) {
                iconEl.classList.add(status);
                data && data.statusText && data.status && (iconEl.title = data.statusText + ' (' + data.status + ')');
                return {
                    disable: function() {
                        iconEl.classList.remove(status);
                        data && (iconEl.title = '');
                    }
                }
            })(trackerObj.iconEl, status, data);
        }
        trackerObj = null;
    },
    resetTrackerStatus: function(trackerObj, except) {
        "use strict";
        for (var status in trackerObj.status) {
            if (except !== undefined && except.indexOf(status) !== -1) continue;
            if (trackerObj.status[status] === undefined) continue;
            trackerObj.status[status].disable();
            trackerObj.status[status] = undefined;
        }
    },
    setTrackerSelect: function(trackerObj, state) {
        "use strict";
        if (state === trackerObj.selected) return;
        if (view.varCache.filter.trackerList === undefined) {
            view.varCache.filter.trackerList = [];
        }
        var pos = view.varCache.filter.trackerList.indexOf(trackerObj.id);
        if (state) {
            trackerObj.itemEl.classList.add('selected');
            trackerObj.selected = 1;

            (pos === -1) && view.varCache.filter.trackerList.push(trackerObj.id);
        } else {
            trackerObj.itemEl.classList.remove('selected');
            trackerObj.selected = 0;

            (pos !== -1) && view.varCache.filter.trackerList.splice(pos, 1);
        }
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
                trackerObj.id = tracker.id;
                trackerObj.count = 0;
                trackerObj.selected = 0;
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
                trackerObj.setCount = view.setTrackerCount.bind(null, trackerObj);
                trackerObj.setStatus = view.setTrackerStatus.bind(null, trackerObj);
                trackerObj.resetStatus = view.resetTrackerStatus.bind(null, trackerObj);
                trackerObj.setSelect = view.setTrackerSelect.bind(null, trackerObj);
                styleContent += '.tracker-icon[data-id="' + tracker.id + '"] {' +
                    'background-image: url('+ tracker.icon +')' +
                '}';
            }
            document.body.appendChild(view.varCache.trackerListStyle = mono.create('style', {text: styleContent}));
        });
    },
    setCategoryCount: function(categoryObj, count) {
        "use strict";
        if (categoryObj.count === count) return;

        categoryObj.count = count;
        categoryObj.countEl.textContent = count;
        if (count === 0) {
            categoryObj.isHidden = 1;
            categoryObj.itemEl.classList.add('hide');
        } else {
            categoryObj.isHidden = 0;
            categoryObj.itemEl.classList.remove('hide');
        }
    },
    setCategorySelect: function(categoryObj, state) {
        "use strict";
        if (state === categoryObj.selected) return;
        if (state) {
            categoryObj.itemEl.classList.add('selected');
            categoryObj.selected = 1;
            view.varCache.filter.category = categoryObj.id;

            //TODO: Filer update!
        } else {
            categoryObj.itemEl.classList.remove('selected');
            categoryObj.selected = 0;
        }
    },
    writeCategory: function() {
        "use strict";
        mono.create(view.domCache.categoryContainer, {
            append: (function() {
                var elList = [];
                for (var i = 0, categoryObj; categoryObj = view.varCache.categoryList[i]; i++) {
                    view.varCache.categoryObjList[categoryObj.id] = categoryObj;
                    categoryObj.count = 0;
                    categoryObj.isHidden = 1;
                    var className = 'hide';
                    var data = {};
                    if (categoryObj.id === undefined) {
                        className = 'selected'
                    } else {
                        data.id = categoryObj.id;
                    }
                    elList.push(categoryObj.itemEl = mono.create('div', {
                        class: className,
                        data: data,
                        append: [
                            mono.create('a', {
                                href: '#',
                                text: mono.language[categoryObj.lang]
                            }),
                            categoryObj.countEl = mono.create('i', {
                                text: 0
                            })
                        ]
                    }));
                    categoryObj.setCount = view.setCategoryCount.bind(null, categoryObj);
                    categoryObj.setSelect = view.setCategorySelect.bind(null, categoryObj);
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
    formatSeedPeer: function(value) {
        "use strict";
        if (value === undefined) {
            value = '-';
        }
        return value;
    },
    formatSize: function(value) {
        "use strict";
        if (value === undefined) {
            value = 'n/a';
        }
        return value;
    },
    writeResultList: function(tracker, request, torrentList) {
        "use strict";
        var searchResultCache = view.varCache.searchResultCache;
        var container = document.createDocumentFragment();
        for (var i = 0, item; item = torrentList[i]; i++) {
            if (engine.settings.hideZeroSeed === 1 && item.seed === 0) {
                continue;
            }
            var itemCategoryId = item.categoryId === undefined ? -1 : item.categoryId;
            var cacheItemIndex = searchResultCache.length;
            var cacheItem = {
                id: cacheItemIndex,
                api: item,
                node: mono.create('tr', {
                    data: {
                        id: tracker.id,
                        category: itemCategoryId,
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
                            append: [
                                mono.create('a', {
                                    class: 'title',
                                    text: item.title,
                                    href: item.url,
                                    target: '_blank'
                                }),
                                !item.categoryTitle ? undefined : mono.create('a', {
                                    class: 'category',
                                    text: item.categoryTitle,
                                    href: item.categoryUrl,
                                    target: '_blank'
                                })
                            ]
                        }),
                        mono.create('td', {
                            class: 'size',
                            append: [
                                !item.downloadUrl ? view.formatSize(item.size) : mono.create('a', {
                                    class: 'download',
                                    text: view.formatSize(item.size) + ' ↓',
                                    href: item.downloadUrl,
                                    target: '_blank'
                                })
                            ]
                        }),
                        engine.settings.hideSeedColumn === 1 ? undefined : mono.create('td', {
                            class: 'seed',
                            text: view.formatSeedPeer(item.seed)
                        }),
                        engine.settings.hidePeerColumn === 1 ? undefined : mono.create('td', {
                            class: 'peer',
                            text: view.formatSeedPeer(item.peer)
                        })
                    ]
                })
            };
            searchResultCache.push(cacheItem);
            container.appendChild(cacheItem.node);

            view.varCache.searchResultCounter.tracker[tracker.id]++;
            view.varCache.searchResultCounter.category[itemCategoryId]++;
            view.varCache.searchResultCounter.sum++;
        }
        view.domCache.resultTableBody.appendChild(container);
        view.resultCounterUpdate();
    },
    onSearchSuccess: function(tracker, request, data) {
        "use strict";
        if (data.requireAuth === 1) {
            view.resetTrackerStatusById(tracker.id, ['auth']);
            return view.setTrackerStatusById(tracker.id, 'auth', {
                url: tracker.search.loginUrl
            });
        }
        view.resetTrackerStatusById(tracker.id);
        view.writeResultList(tracker, request, data.torrentList);
    },
    resetTrackerStatusById: function(trackerId, except) {
        "use strict";
        var trackerObj = view.varCache.trackerList[trackerId];
        trackerObj.resetStatus(except);
    },
    setTrackerStatusById: function(trackerId, status, data) {
        "use strict";
        var trackerObj = view.varCache.trackerList[trackerId];
        trackerObj.setStatus(status, data);
    },
    onSearchError: function(tracker, xhrStatus, xhrStatusText) {
        "use strict";
        view.resetTrackerStatusById(tracker.id);
        view.setTrackerStatusById(tracker.id, 'error', {
            status: xhrStatus,
            statusText: xhrStatusText
        });
    },
    onSearchBegin: function(tracker) {
        "use strict";
        view.resetTrackerStatusById(tracker.id, ['auth']);
        view.setTrackerStatusById(tracker.id, 'loading');

        view.varCache.searchResultCounter.tracker[tracker.id] = 0;
    },
    resultCounterUpdate: function() {
        "use strict";
        var count;
        var searchResultCounter = view.varCache.searchResultCounter;
        var trackerList = view.varCache.trackerList;
        for (var trackerId in trackerList) {
            var trackerObj = trackerList[trackerId];
            count = searchResultCounter.tracker[trackerId] || 0;
            trackerObj.setCount(count);
        }

        var categoryObjList = view.varCache.categoryObjList;
        for (var categoryId in view.varCache.categoryObjList) {
            var categoryObj = categoryObjList[categoryId];
            if (categoryId === 'undefined') {
                count = searchResultCounter.sum;
            } else {
                count = searchResultCounter.category[categoryId] || 0;
            }
            categoryObj.setCount(count);
        }
    },
    resultCounterReset: function() {
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

        view.resultCounterUpdate();
    },
    search: function(request) {
        "use strict";
        view.domCache.resultTableBody.textContent = '';
        view.resultCounterReset();
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
        var trackerObj = view.varCache.trackerList[trackerId];

        for (var _trackerId in view.varCache.trackerList) {
            if (_trackerId === trackerId) continue;
            view.varCache.trackerList[_trackerId].setSelect(0);
        }

        trackerObj.setSelect(trackerObj.selected ? 0 : 1);
    },
    onCategoryListItemClick: function(e) {
        "use strict";
        e.preventDefault();
        var categoryId = this.dataset.id;
        var categoryObj = view.varCache.categoryObjList[categoryId];

        for (var _categoryObj in view.varCache.categoryObjList) {
            if (_categoryObj === categoryId) continue;
            view.varCache.categoryObjList[_categoryObj].setSelect(0);
        }

        categoryObj.setSelect(1);
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

        view.domCache.categoryContainer.addEventListener('click', function(e) {
            var el = e.target;
            if (this === el) return;
            while (el.parentNode !== this) {
                el = el.parentNode;
            }

            view.onCategoryListItemClick.call(el, e);
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
    onJqReady: function() {
        "use strict";
        view.domCache.searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var request = view.domCache.requestInput.value.trim();
            view.search(request);
        });
    },
    onUiReady: function() {
        "use strict";

    }
};

var define = function(name, func) {
    "use strict";
    if (name === 'jquery') {
        view.onJqReady();
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