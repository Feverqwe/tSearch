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
        trackerList: {}
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
        for (var key in view.varCache.trackerList) {
            trackerList.push(key);
        }
        return trackerList;
    },
    onSearchSuccess: function(tracker, data) {
        "use strict";
        if (data.requireAuth === 1) {
            view.clearTrackerStatus(tracker.id, ['auth']);
            return view.setTrackerStatus(tracker.id, 'auth', {
                url: tracker.search.loginUrl
            });
        }
        view.clearTrackerStatus(tracker.id);
        console.log(tracker.id, data);
    },
    onSearchError: function(tracker, xhrStatus, xhrStatusText) {
        "use strict";
        view.clearTrackerStatus(tracker.id);
        view.setTrackerStatus(tracker.id, 'error', {
            status: xhrStatus,
            statusText: xhrStatusText
        });
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
                               text: '{login}',
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
                data && (iconEl.title = data.statusText + '(' + data.status + ')');
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
    onSearchBegin: function(tracker) {
        "use strict";
        view.clearTrackerStatus(tracker.id, ['auth']);
        view.setTrackerStatus(tracker.id, 'loading');
    },
    search: function(request) {
        "use strict";
        var trackerList = view.getTrackerList();
        exKit.searchList(trackerList, request, {
            onSuccess: view.onSearchSuccess,
            onError: view.onSearchError,
            onBegin: view.onSearchBegin
        })
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
                view.domCache.searchBtn.dispatchEvent(new CustomEvent('click'));
            }
        });

        view.domCache.searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var request = view.domCache.requestInput.value.trim();
            view.search(request);
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