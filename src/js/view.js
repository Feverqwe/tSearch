/**
 * Created by Anton on 08.03.2015.
 */
var view = {
    domCache: {
        requestInput: document.getElementById('request_input'),
        clearBtn: document.getElementById('clear_btn'),
        searchBtn: document.getElementById('search_btn'),
        resultTableHead: document.getElementById('result_table_head'),
        resultTableBody: document.getElementById('result_table_body'),
        categoryContainer: document.getElementById('result_category_container'),
        profileSelect: document.getElementById('profile_select'),
        trackerList: document.getElementById('tracker_list'),
        wordFilterInput: document.getElementById('word_filter_input'),
        sizeFilterMin: document.getElementById('size_filter_from'),
        sizeFilterMax: document.getElementById('size_filter_to'),
        timeFilterSelect: document.getElementById('time_filter_select'),
        timeFilterRange: document.getElementById('time_filter_range'),
        timeFilterMin: document.getElementById('time_filter_from'),
        timeFilterMax: document.getElementById('time_filter_to'),
        seedFilter: document.getElementById('seed_filter'),
        peerFilter: document.getElementById('peer_filter'),
        seedFilterMin: document.getElementById('seed_filter_from'),
        seedFilterMax: document.getElementById('seed_filter_to'),
        peerFilterMin: document.getElementById('peer_filter_from'),
        peerFilterMax: document.getElementById('peer_filter_to')
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
        searchResultCounter: {
            tracker: {},
            category: {},
            sum: 0
        },
        searchResultCache: [],
        trackerListStyle: undefined,
        filter: {
            trackerList: undefined,
            category: undefined,
            word: undefined,
            size: undefined,
            date: undefined,
            seed: undefined,
            peer: undefined
        },
        filterStyle: undefined
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
    filterUpdate: function() {
        "use strict";
        var searchResultCache = view.varCache.searchResultCache;
        var trackerList = view.varCache.filter.trackerList || [];
        var searchResultCounter = view.varCache.searchResultCounter;
        view.resultCounterCategoryReset();
        view.resultCounterTrackerReset();
        var filter = view.getFilterStyleState();
        for (var i = 0, cacheItem; cacheItem = searchResultCache[i]; i++) {
            var _filter = view.getFilterState(cacheItem.api);
            if (filter === undefined || _filter === filter) {
                searchResultCounter.tracker[cacheItem.id]++;
                if (trackerList.length === 0 || trackerList.indexOf(cacheItem.id) !== -1) {
                    searchResultCounter.category[cacheItem.api.categoryId]++;
                    searchResultCounter.sum++;
                }
            }
            if (_filter === cacheItem.filter) {
                continue;
            }
            cacheItem.node.dataset.filter = cacheItem.filter = _filter;
        }

        trackerList = trackerList.map(function(trackerId) {
            return ':not([data-id="'+trackerId+'"])';
        });
        trackerList = trackerList.join('');

        var stylePath = '#result_table_body ';
        var styleText = (!filter ? '' : stylePath+'tr:not([data-filter="'+filter+'"]){display: none;}') +
            (view.varCache.filter.category === undefined ? '' : stylePath+'tr:not([data-category="'+view.varCache.filter.category+'"]){display: none;}') +
            (!trackerList ? '' : stylePath+'tr'+trackerList+'{display: none;}');

        view.resultCounterUpdate();

        if (view.varCache.filterStyle) {
            if (view.varCache.filterStyle.textContent === styleText) {
                return;
            }
            view.varCache.filterStyle.parentNode.removeChild(view.varCache.filterStyle);
            view.varCache.filterStyle = undefined;
        }

        if (!styleText) return;

        document.body.appendChild(view.varCache.filterStyle = mono.create('style', {
            text: styleText
        }));
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
        view.filterUpdate();
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

            view.filterUpdate();
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
    getTrackerList: function(selected) {
        "use strict";
        var trackerList = [];
        var trackerSelectedList = [];
        for (var trackerId in view.varCache.trackerList) {
            if (view.varCache.trackerList[trackerId].selected === 1) {
                trackerSelectedList.push(trackerId);
            }
            trackerList.push(trackerId);
        }
        if (trackerSelectedList.length === 0) {
            trackerSelectedList = null;
        }
        return trackerSelectedList || selected || trackerList;
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
    arrUnique: function (value, index, self) {
        return self.indexOf(value) === index;
    },
    getFilterStyleState: function() {
        "use strict";
        var list = [0,0,0,0,0];

        var noZero = false;
        var filter = view.varCache.filter;
        var cList = ['word', 'size', 'date', 'seed', 'peer'];
        for (var i = 0, type; type = cList[i]; i++) {
            var item = filter[type];
            if (item === undefined) continue;
            list[i] = 1;
            noZero = true;
        }

        return noZero ? list.join() : undefined;
    },
    getFilterState: function(torrentObj) {
        "use strict";
        var list = [0,0,0,0,0];

        var filter = view.varCache.filter;
        if (filter.word !== undefined) {
            var includeCount = null;
            var filterString = torrentObj.lowerTitle;
            if (engine.settings.subCategoryFilter === 1) {
                filterString += ' ' + torrentObj.lowerCategoryTitle;
            }
            if ((filter.word[0] === null || !filter.word[0].test(filterString)) &&
                (filter.word[1] === null || (includeCount = filterString.match(filter.word[1]))) &&
                (includeCount === null || includeCount.filter(view.arrUnique).length === filter.word[2])) {
                list[0] = 1;
            }
        }
        var cList = ['size', undefined, 'seed', 'peer'];
        if (typeof filter.date === 'number' && torrentObj.date >= filter.date) {
            list[2] = 1;
        } else {
            cList[1] = 'date';
        }
        for (var i = 0, len = cList.length; i < len; i++) {
            var item = cList[i];
            if (filter[item] !== undefined &&
                (filter[item][0] === null || torrentObj[item] >= filter[item][0]) &&
                (filter[item][1] === null || torrentObj[item] <= filter[item][1])) {
                list[i + 1] = 1;
            }
        }

        return list.join();
    },
    timeStampToDate: function(seconds, format) {
        "use strict";
        format = format || mono.language.dateFormatL;
        var _date = new Date(seconds * 1000);
        var month = _date.getMonth() + 1;
        var date = _date.getDate();
        if (month < 10) {
            month = '0'+month;
        }
        if (date < 10) {
            date = '0'+date;
        }
        var hour = _date.getHours();
        if (hour < 10) {
            hour = '0'+hour;
        }
        var minutes = _date.getMinutes();
        if (minutes < 10) {
            minutes = '0'+minutes;
        }

        var list = {'MM': month, 'DD': date, 'YYYY': _date.getFullYear(), 'hh': hour, 'mm': minutes};
        for (var key in list) {
            format = format.replace(key, list[key]);
        }
        return format;
    },
    timeAgoEn: function(d, h, m, s, seconds) {
        "use strict";
        var strDay = (d === 1) ? 'day' : 'days';
        var strHour = ([1,21].indexOf(h) !== -1) ? 'hour' : 'hours';
        var strMinutes = 'minutes';
        var strSeconds = 'seconds';
        var ago = 'ago';
        if (d > 0) {
            if (d === 1) {
                return 'Yesterday' + ' ' + view.timeStampToDate(seconds, 'hh:mm');
            } else if (d === 1) {
                return mono.capitalize(strDay) + ' ' + ago;
            } else {
                return d + ' ' + strDay + ' ' + ago;
            }
        }
        if (h > 0) {
            if (h > 3) {
                return 'Today' + ' ' + view.timeStampToDate(seconds, 'hh:mm');
            } else
            if (h === 1) {
                return mono.capitalize(strHour) + ' ' + ago;
            } else {
                return h + ' ' + strHour + ' ' + ago;
            }
        }
        if (m > 0) {
            return m + ' ' + strMinutes + ' ' + ago;
        }
        if (s > 0) {
            return s + ' ' + strSeconds + ' ' + ago;
        }
        return view.timeStampToDate(seconds);
    },
    timeAgoRu: function(d, h, m, s, seconds) {
        "use strict";
        var strDay = (d === 1) ? 'день' : (d < 5) ? 'дня' : 'дней';
        var strHour = ([1,21].indexOf(h) !== -1) ? 'час' : ([2,3,4,22,23,24].indexOf(h) !== -1) ? 'часа' : 'часов';
        var strMinutes = 'мин.';
        var strSeconds = 'сек.';
        var ago = 'назад';
        if (d > 0) {
            if (d === 1) {
                return 'Вчера' + ' ' + view.timeStampToDate(seconds, 'hh:mm');
            } else if (d === 1) {
                return mono.capitalize(strDay) + ' ' + ago;
            } else {
                return d + ' ' + strDay + ' ' + ago;
            }
        }
        if (h > 0) {
            if (h > 3) {
                return 'Сегодня' + ' ' + view.timeStampToDate(seconds, 'hh:mm');
            } else
            if (h === 1) {
                return mono.capitalize(strHour) + ' ' + ago;
            } else {
                return h + ' ' + strHour + ' ' + ago;
            }
        }
        if (m > 0) {
            return m + ' ' + strMinutes + ' ' + ago;
        }
        if (s > 0) {
            return s + ' ' + strSeconds + ' ' + ago;
        }
        return view.timeStampToDate(seconds);
    },
    timeStampToTimeAgo: function(seconds) {
        "use strict";
        if (seconds <= 0) {
            return '∞';
        }
        var now = parseInt(Date.now() / 1000);
        var diff = now - seconds;
        if (diff < 0) {
            return view.timeStampToDate(seconds);
        }
        var countDays = Math.floor(diff / 60 / 60 / 24);
        var countWeek = Math.floor(countDays / 7);
        if (countWeek > 0) {
            return view.timeStampToDate(seconds);
        }
        var countDaysSeconds = countDays * 60 * 60 * 24;
        var countHour = Math.floor((diff - countDaysSeconds) / 60 / 60);
        var countHourSeconds = countHour * 60 * 60;
        var countMinutes = Math.floor((diff - countDaysSeconds - countHourSeconds) / 60);
        var countMinutesSeconds = countMinutes * 60;
        var countSeconds = Math.floor(diff - countDaysSeconds - countHourSeconds - countMinutesSeconds);

        if (mono.language.langCode === 'ru') {
            return view.timeAgoRu(countDays, countHour, countMinutes, countSeconds, seconds);
        } else {
            return view.timeAgoEn(countDays, countHour, countMinutes, countSeconds, seconds);
        }
    },
    writeResultList: function(tracker, request, torrentList) {
        "use strict";
        var searchResultCounter = view.varCache.searchResultCounter;
        var searchResultCache = view.varCache.searchResultCache;
        var container = document.createDocumentFragment();
        for (var i = 0, torrentObj; torrentObj = torrentList[i]; i++) {
            if (engine.settings.hideZeroSeed === 1 && torrentObj.seed === 0) {
                continue;
            }
            var itemCategoryId = torrentObj.categoryId === undefined ? -1 : torrentObj.categoryId;
            var cacheItemIndex = searchResultCache.length;
            var cacheItem = {
                index: cacheItemIndex,
                api: torrentObj,
                id: tracker.id
            };
            torrentObj.lowerTitle = torrentObj.title.toLowerCase();
            torrentObj.lowerCategoryTitle = torrentObj.categoryTitle.toLowerCase();
            cacheItem.filter = view.getFilterState(torrentObj);
            cacheItem.node = mono.create('tr', {
                data: {
                    id: tracker.id,
                    category: itemCategoryId,
                    index: cacheItemIndex,
                    filter: cacheItem.filter
                },
                append: [
                    mono.create('td', {
                        class: 'time',
                        title: view.timeStampToDate(torrentObj.date, 'hh:mm' + ' ' + mono.language.dateFormatL),
                        text: view.timeStampToTimeAgo(torrentObj.date)
                    }),
                    mono.create('td', {
                        class: 'quality',
                        text: 0
                    }),
                    mono.create('td', {
                        append: [
                            mono.create('a', {
                                class: 'title',
                                text: torrentObj.title,
                                href: torrentObj.url,
                                target: '_blank'
                            }),
                            !torrentObj.categoryTitle ? undefined : mono.create('a', {
                                class: 'category',
                                text: torrentObj.categoryTitle,
                                href: torrentObj.categoryUrl,
                                target: '_blank'
                            })
                        ]
                    }),
                    mono.create('td', {
                        class: 'size',
                        append: [
                            !torrentObj.downloadUrl ? view.formatSize(torrentObj.size) : mono.create('a', {
                                class: 'download',
                                text: view.formatSize(torrentObj.size) + ' ↓',
                                href: torrentObj.downloadUrl,
                                target: '_blank'
                            })
                        ]
                    }),
                    engine.settings.hideSeedColumn === 1 ? undefined : mono.create('td', {
                        class: 'seed',
                        text: view.formatSeedPeer(torrentObj.seed)
                    }),
                    engine.settings.hidePeerColumn === 1 ? undefined : mono.create('td', {
                        class: 'peer',
                        text: view.formatSeedPeer(torrentObj.peer)
                    })
                ]
            });
            searchResultCache.push(cacheItem);
            container.appendChild(cacheItem.node);

            searchResultCounter.tracker[tracker.id]++;
            searchResultCounter.category[itemCategoryId]++;
            searchResultCounter.sum++;
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
    resultCounterTrackerReset: function() {
        "use strict";
        for (var trackerId in view.varCache.trackerList) {
            view.varCache.searchResultCounter.tracker[trackerId] = 0;
        }
    },
    resultCounterCategoryReset: function() {
        "use strict";
        view.varCache.searchResultCounter.category = (function() {
            var obj = {};
            var categoryList = view.varCache.categoryList;
            for (var item in categoryList) {
                var id = categoryList[item].id;
                obj[id] = 0;
            }
            return obj;
        })();
        view.varCache.searchResultCounter.sum = 0;
    },
    resultCounterReset: function() {
        "use strict";
        view.varCache.searchResultCounter.tracker = {};
        view.resultCounterCategoryReset();
        view.resultCounterUpdate();
    },
    search: function(request) {
        "use strict";
        view.domCache.resultTableBody.textContent = '';
        view.varCache.searchResultCache = [];
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
    filterWordR: {
        text2safeR: /([{})(\][\\\.^$\|\?\+])/g
    },
    filterWordToReg: function(word) {
        "use strict";
        var mWord = word.toLowerCase().replace(/\\\s/g, '&nbsp;');
        var wordList = mWord.split(/\s+/);
        var includeList = [];
        var excludeList = [];
        var typeList;
        var isEmpty = true;
        for (var i = 0, len = wordList.length; i < len; i++) {
            mWord = wordList[i].replace(/&nbsp;/g, ' ');
            if (mWord.length > 1 && ['-', '!'].indexOf(mWord[0]) !== -1) {
                mWord = mWord.substr(1);
                typeList = excludeList;
            } else
            if (mWord.length > 0) {
                typeList = includeList;
            } else {
                continue;
            }
            mWord = mWord.replace(view.filterWordR.text2safeR, '\\$1');
            typeList.push(mWord);
            isEmpty = false;
        }
        if (isEmpty) return;

        return [excludeList.length === 0 ? null : new RegExp(excludeList.join('|')), includeList.length === 0 ? null : new RegExp(includeList.join('|'), 'g'), includeList.length, word];
    },
    onChangeFilter: function(type) {
        "use strict";
        var isRange;
        var index = 0;
        var key;
        var value;
        if (type === 'wordFilterInput') {
            view.varCache.filter.word = this.value || undefined;
            if (view.varCache.filter.word !== undefined) {
                view.varCache.filter.word = view.filterWordToReg(view.varCache.filter.word);
            }
        } else
        if (type === 'sizeFilterMin' || (type === 'sizeFilterMax' && (index = 1))) {
            isRange = 1;
            key = 'size';
            value = parseFloat(this.value) * 1024 * 1024 * 1024;
        } else
        if (type === 'timeFilterMin' || (type === 'timeFilterMax' && (index = 1))) {
            isRange = 1;
            key = 'date';
            value = parseInt(this.dataset.date);
        } else
        if (type === 'seedFilterMin' || (type === 'seedFilterMax' && (index = 1))) {
            isRange = 1;
            key = 'seed';
            value = parseInt(this.value);
            if (value <= 0) {
                value = null;
            }
        } else
        if (type === 'peerFilterMin' || (type === 'peerFilterMax' && (index = 1))) {
            isRange = 1;
            key = 'peer';
            value = parseInt(this.value);
            if (value <= 0) {
                value = null;
            }
        }
        if (isRange) {
            if (typeof view.varCache.filter[key] !== 'object') {
                view.varCache.filter[key] = [null, null];
            }
            if (isNaN(value)) {
                value = null;
            }
            view.varCache.filter[key][index] = value;

            if (view.varCache.filter[key][0] === null && view.varCache.filter[key][1] === null) {
                view.varCache.filter[key] = undefined;
            }
        }
        view.filterUpdate();
    },
    rmChildTextNodes: function(el) {
        "use strict";
        var index = 0;
        var node;
        while (node = el.childNodes[index]) {
            if (node.nodeType !== 3) {
                index++;
                continue;
            }
            el.removeChild(node);
        }
    },
    bindFilterRange: function() {
        "use strict";
        for (var i = 0, list = ['wordFilterInput', 'sizeFilterMin',
            'sizeFilterMax', 'timeFilterMin',
            'timeFilterMax', 'seedFilterMin', 'seedFilterMax',
            'peerFilterMin', 'peerFilterMax'], type; type = list[i]; i++) {
            view.domCache[type].addEventListener('keyup', mono.throttle(view.onChangeFilter.bind(view.domCache[type], type), 250));
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

        view.bindFilterRange();

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

        view.rmChildTextNodes(view.domCache.timeFilterSelect);
        view.domCache.timeFilterSelect.addEventListener('change', function() {
            if (this.value === 'range') {
                view.domCache.timeFilterRange.classList.add('show');
                view.domCache.timeFilterMin.dispatchEvent(new CustomEvent('keyup'));
                return;
            }
            view.domCache.timeFilterRange.classList.remove('show');
            var date;
            var seconds = parseInt(this.childNodes[this.selectedIndex].dataset.seconds);
            if (seconds === 0) {
                date = undefined
            } else {
                date = parseInt(Date.now() / 1000) - seconds;
            }
            view.varCache.filter.date = date;
            view.filterUpdate();
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
        $(document).off('mouseup');
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

var define = function(name, func, getFunc) {
    "use strict";
    if (name === 'jquery') {
        getFunc()(document).ready(function() {
            view.onJqReady();
            document.body.appendChild(mono.create('script', {src: 'js/jquery-ui.min.js'}));
        });
    } else
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