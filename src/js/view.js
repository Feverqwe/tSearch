/**
 * Created by Anton on 08.03.2015.
 */
var view = {
    domCache: {
        searchForm: document.getElementById('search_form'),
        requestInput: document.getElementById('request_input'),
        clearBtn: document.getElementById('clear_btn'),
        searchBtn: document.getElementById('search_btn'),
        resultTableHead: document.getElementById('result_table_head'),
        resultTableBody: document.getElementById('result_table_body'),
        categoryContainer: document.getElementById('result_category_container'),
        profileSelect: document.getElementById('profile_select'),
        trackerList: document.getElementById('tracker_list'),
        trackerListBlock: document.querySelector('.tracker-list-block'),
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
        peerFilterMax: document.getElementById('peer_filter_to'),
        mainBtn: document.getElementById('main_btn'),
        editProfile: document.getElementById('edit_profile')
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
        tableHeadColumnList: [
            {id: 'date',    size: 100, lang: 'columnTime'},
            {id: 'quality', size: 31,  lang: 'columnQuality'},
            {id: 'title',   size: 0,   lang: 'columnTitle'},
            {id: 'size',    size: 80,  lang: 'columnSize'},
            {id: 'seed',    size: 30,  lang: 'columnSeeds'},
            {id: 'peer',    size: 30,  lang: 'columnLeechs'}
        ],
        tableHeadColumnObjList: {},
        tableOrderIndex: 1,
        tableSortColumnId: 'quality',
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
        filterStyle: undefined,
        lastSortedList: [],
        requestObj: {},
        suggestXhr: undefined,
        filterRangeList: ['wordFilterInput', 'sizeFilterMin',
            'sizeFilterMax', 'timeFilterMin',
            'timeFilterMax', 'seedFilterMin', 'seedFilterMax',
            'peerFilterMin', 'peerFilterMax'],
        selectBox: undefined,
        timeFilterSelectBox: undefined,
        $requestInput: undefined,
        historyObj: {},
        historyList: [],
        historyLimit: 50,
        historyLinksListLimit: 20,
        locationHash: undefined
    },
    setColumnOrder: function (columnObj) {
        var tableHeadList = view.varCache.tableHeadColumnObjList;
        var classList = ['sortUp', 'sortDown'];
        var currentColumnId = view.varCache.tableSortColumnId;
        var currentColumn;
        if (columnObj.id !== currentColumnId && (currentColumn = tableHeadList[currentColumnId])) {
            columnObj.orderIndex = currentColumn.orderIndex;
            currentColumn.orderIndex = undefined;
            currentColumn.node.classList.remove(classList[columnObj.orderIndex]);
        } else {
            columnObj.node.classList.remove(classList[columnObj.orderIndex]);
            columnObj.orderIndex = columnObj.orderIndex ? 0 : 1;
        }

        columnObj.orderIndex = view.varCache.tableOrderIndex = columnObj.orderIndex ? 1 : 0;
        view.varCache.tableSortColumnId = columnObj.id;
        columnObj.node.classList.add(classList[columnObj.orderIndex]);

        mono.storage.set({
            sortColumn: columnObj.id,
            sortOrder: columnObj.orderIndex
        });

        view.sortResults();
    },
    writeTableHead: function() {
        "use strict";
        var style = '';
        view.domCache.resultTableHead.appendChild(mono.create('tr', {
            append: (function(){
                var thList = [];
                var hideList = [];
                if (engine.settings.hideSeedColumn) {
                    hideList.push('seed');
                }
                if (engine.settings.hidePeerColumn) {
                    hideList.push('peer');
                }
                var columnObjList = view.varCache.tableHeadColumnObjList;
                for (var i = 0, item; item = view.varCache.tableHeadColumnList[i]; i++) {
                    if (hideList.indexOf(item.id) !== -1) continue;
                    var orderIndex = view.varCache.tableSortColumnId !== item.id ? undefined : view.varCache.tableOrderIndex;
                    var columnObj = columnObjList[item.id] = {
                        id: item.id,
                        orderIndex: orderIndex
                    };
                    thList.push(columnObj.node = mono.create('th', {
                        data: {
                            id: item.id
                        },
                        title: mono.language[item.lang],
                        class: item.id + '-column',
                        append: [
                            mono.create('span', {
                                text: mono.language[item.lang + 'Short'] || mono.language[item.lang]
                            }),
                            mono.create('i', {
                                class: 'arrow'
                            })
                        ]
                    }));
                    columnObj.setOrder = view.setColumnOrder.bind(null, columnObj);
                    orderIndex !== undefined && columnObj.setOrder();
                    if (item.size) {
                        style += '#result_table_head th.'+item.id+'-column'+'{width:'+item.size+'px;}';
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
        view.varCache.filter.trackerList = undefined;
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
        view.filterUpdate();
        view.varCache.selectBox && view.varCache.selectBox.update();
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
            /* single tracker select mode >>> */
            var lastSelectedTracker = view.varCache.trackerList[this.lastSelectId];
            if (lastSelectedTracker) {
                lastSelectedTracker.setSelect(0);
            }
            this.lastSelectId = trackerObj.id;
            /* <<< */

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
    selectProfile: function(profileName, cb) {
        "use strict";
        var option = view.domCache.profileSelect.querySelector('option[value="'+profileName+'"]');
        if (!option) return;

        exKit.searchProgressListClear();

        view.domCache.profileSelect.selectedIndex = option.index;
        view.varCache.selectBox && view.varCache.selectBox.update();

        var options = {
            lastSelectId: undefined
        };
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
                trackerObj.setSelect = view.setTrackerSelect.bind(options, trackerObj);
                styleContent += '.tracker-icon[data-id="' + tracker.id + '"] {' +
                    'background-image: url('+ exKit.getTrackerIconUrl(tracker.icon) +')' +
                '}';
            }
            document.body.appendChild(view.varCache.trackerListStyle = mono.create('style', {text: styleContent}));

            mono.storage.set({currentProfile: engine.currentProfile = profileName});
            cb && cb();
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
            var selectedItem = view.varCache.categoryObjList[this.selectedId];
            if (selectedItem) {
                selectedItem.setSelect(0);
            }
            this.selectedId = categoryObj.id;

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
        var options = {};
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
                        className = 'selected';
                        options.selectedId = categoryObj.id;
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
                            ' ',
                            categoryObj.countEl = mono.create('i', {
                                text: 0
                            })
                        ]
                    }));
                    categoryObj.setCount = view.setCategoryCount.bind(null, categoryObj);
                    categoryObj.setSelect = view.setCategorySelect.bind(options, categoryObj);
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
    bytesToString: function(sizeList, bytes, nan) {
        "use strict";
        nan = nan || 'n/a';
        if (bytes <= 0) {
            return nan;
        }
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i === 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + sizeList[i];
        }
        var toFixed = 0;
        if (i > 2) {
            toFixed = 2;
        }
        return (bytes / Math.pow(1024, i)).toFixed(toFixed) + ' ' + sizeList[i];
    },
    formatSize: function(value) {
        "use strict";
        if (value === undefined) {
            value = 'n/a';
        }
        return view.bytesToString(value, 'n/a');
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
    onSort: function(columnId, by, A, B) {
        "use strict";
        var a = A.api[columnId];
        var b = B.api[columnId];

        if (a === b) {
            return 0;
        } else
        if (a === undefined) {
            return (by === 1) ? -1 : 1;
        } else
        if (a === -1) {
            if (b === undefined) {
                return (by === 1) ? 1 : -1;
            } else {
                return (by === 1) ? -1 : 1;
            }
        } else
        if (a < b) {
            return (by === 1) ? -1 : 1;
        } else
        if (a > b) {
            return (by === 1) ? 1 : -1;
        }
    },
    sortInsertList: function(sortedList, currentList) {
        "use strict";
        var newPaste = [];
        var fromIndex = null;
        var elList = null;

        for (var i = 0, item; item = sortedList[i]; i++) {
            if (currentList[i] === item) {
                continue;
            }
            fromIndex = i;

            elList = document.createDocumentFragment();
            while (sortedList[i] !== undefined && sortedList[i] !== currentList[i]) {
                var pos = currentList.indexOf(sortedList[i], i);
                if (pos !== -1) {
                    currentList.splice(pos, 1);
                }
                currentList.splice(i, 0, sortedList[i]);

                elList.appendChild(sortedList[i].node);
                i++;
            }

            newPaste.push({
                pos: fromIndex,
                list: elList
            });
        }

        var table = view.domCache.resultTableBody;
        for (var n = 0, item; item = newPaste[n]; n++) {
            if (item.pos === 0) {
                var firstChild = table.firstChild;
                if (firstChild === null) {
                    table.appendChild(item.list);
                } else {
                    table.insertBefore(item.list, firstChild)
                }
            } else
            if (table.childNodes[item.pos] !== undefined) {
                table.insertBefore(item.list, table.childNodes[item.pos]);
            } else {
                table.appendChild(item.list);
            }
        }

        view.varCache.lastSortedList = currentList;
    },
    sortResults: function(columnId, orderIndex) {
        "use strict";
        columnId = view.varCache.tableSortColumnId;
        orderIndex = view.varCache.tableOrderIndex;

        var searchResultCache = view.varCache.searchResultCache;
        var sortedList = searchResultCache.slice(0);
        sortedList.sort(view.onSort.bind(undefined, columnId, orderIndex));

        view.sortInsertList(sortedList, view.varCache.lastSortedList);
    },
    hlCodeToArrayR: {
        charList: /(\([^\)]*\)|\[[^\]]*]|<[^>]*>)/g,
        tagListR: /{\/?[bs]}|&#123;|&#125;/g,
        fAngle: /{([^}]*)}/g,
        deDbl: /\{\/s}(\s*)\{s}|\{\/b}(\s*)\{b}/g,
        bTagList: ['{b}', '{/b}']
    },
    hlCodeToArray: function(code) {
        "use strict";
        var bTagList = view.hlCodeToArrayR.bTagList;
        code = code.replace(view.hlCodeToArrayR.fAngle, function(tag) {
            if (bTagList.indexOf(tag) !== -1) {
                return tag;
            }
            return '&#123;'+tag+'&#125;';
        });
        code = code.replace(view.hlCodeToArrayR.charList, '{s}$1{/s}');
        code = code.replace(view.hlCodeToArrayR.deDbl, '$1$2');

        var list = [];
        var lastPos = 0;
        code.replace(view.hlCodeToArrayR.tagListR, function(tag, pos) {
            if (pos > 0 && lastPos !== pos) {
                var str = code.substr(lastPos, pos - lastPos);
                list.push(str);
            }

            var tagLen = tag.length;
            lastPos = pos + tagLen;
            var isClose = 0;

            if (tag[0] === '&') {
                if (tag[4] === '3') {
                    tag = 'span';
                    list.push([isClose, tag]);
                    list.push('{');
                    return;
                } else
                if (tag[4] === '5') {
                    list.push('}');
                    tag = 'span';
                    isClose = 1;
                    list.push([isClose, tag]);
                    return;
                }
            }

            var index = 0;
            if (tag[1] === '/') {
                isClose = 1;
                index += 1;
            }
            if (tag[index + 1] === 's') {
                tag = 'span';
            } else {
                tag = 'b';
            }
            list.push([isClose, tag]);
        });

        if (lastPos !== code.length) {
            list.push(code.substr(lastPos));
        }

        return list;
    },
    hlTextToFragment: function(code, requestObj) {
        "use strict";
        code = rate.hlRequest(code, requestObj);
        var list = view.hlCodeToArray(code);

        var base = '';
        var desc = '';
        var fragment, root, level = 0;
        fragment = root = document.createDocumentFragment();
        for (var i = 0, len = list.length; i < len; i++) {
            var item = list[i];
            if (typeof item === 'string') {
                fragment.appendChild(document.createTextNode(item));
                if (level === 0) {
                    base += item;
                } else {
                    desc += item + ' ';
                }
                continue;
            }
            if (item[0] === 1) {
                fragment = fragment.parentNode || root;
                if (item[1] !== 'b') {
                    level--;
                }
                continue;
            }
            fragment.appendChild(fragment = mono.create(item[1]));
            if (item[1] !== 'b') {
                level++;
            }
        }
        return {node: root, base: $.trim(base), desc: desc};
    },
    writeResultList: function(tracker, torrentList) {
        "use strict";
        var filter = view.getFilterStyleState();
        var searchResultCounter = view.varCache.searchResultCounter;
        var searchResultCache = view.varCache.searchResultCache;
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

            var titleObj = view.hlTextToFragment(torrentObj.title, view.varCache.requestObj);
            var ratingObj = rate.rateText(view.varCache.requestObj, titleObj, torrentObj);
            torrentObj.quality = ratingObj.sum;
            cacheItem.rating = ratingObj;

            cacheItem.node = mono.create('tr', {
                data: {
                    id: tracker.id,
                    category: itemCategoryId,
                    index: cacheItemIndex,
                    filter: cacheItem.filter
                },
                append: [
                    mono.create('td', {
                        class: 'date-column',
                        title: view.timeStampToDate(torrentObj.date, 'hh:mm' + ' ' + mono.language.dateFormatL),
                        text: view.timeStampToTimeAgo(torrentObj.date)
                    }),
                    mono.create('td', {
                        class: 'quality-column',
                        text: parseInt(torrentObj.quality)
                    }),
                    mono.create('td', {
                        class: 'title-column',
                        append: [
                            mono.create('span', {
                                class: 'title',
                                append: [
                                    mono.create('a', {
                                        append: titleObj.node,
                                        href: torrentObj.url,
                                        target: '_blank'
                                    }),
                                    torrentObj.categoryTitle ? undefined : mono.create('i', {
                                        class: ['icon', 'tracker-icon'],
                                        title: tracker.title,
                                        data: {
                                            id: tracker.id
                                        }
                                    })
                                ]
                            }),
                            !torrentObj.categoryTitle ? undefined : mono.create('span', {
                                class: 'category',
                                append: [
                                    mono.create('a', {
                                        href: torrentObj.categoryUrl,
                                        target: '_blank',
                                        text: torrentObj.categoryTitle
                                    }),
                                    mono.create('i', {
                                        class: ['icon', 'tracker-icon'],
                                        title: tracker.title,
                                        data: {
                                            id: tracker.id
                                        }
                                    })
                                ]
                            })
                        ]
                    }),
                    mono.create('td', {
                        class: 'size-column',
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
                        class: 'seed-column',
                        text: view.formatSeedPeer(torrentObj.seed)
                    }),
                    engine.settings.hidePeerColumn === 1 ? undefined : mono.create('td', {
                        class: 'peer-column',
                        text: view.formatSeedPeer(torrentObj.peer)
                    })
                ]
            });
            searchResultCache.push(cacheItem);

            if (filter === undefined || cacheItem.filter === filter) {
                searchResultCounter.tracker[tracker.id]++;
                searchResultCounter.category[itemCategoryId]++;
                searchResultCounter.sum++;
            }
        }
        view.sortResults();
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
        view.writeResultList(tracker, data.torrentList);
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
    prepareRequestR: {
        spaceR: /[\s\xA0]/g,
        yearR: /^(?:19|2[01])[0-9]{2}$/g,
        splitR: /\s+/
    },
    prepareRequest: function(request) {
        "use strict";
        var prep = view.prepareRequestR;
        request = $.trim(request.replace(prep.spaceR, ' '));

        var obj = view.varCache.requestObj = {};
        var currentYear = (new Date).getFullYear();
        var yearList = [];
        var hlWordList = [];
        var hlWordLowList = [];
        var hlWordCaseListR = [];
        var hlWordNoYearList = [];
        var hlWordNoYearListR = [];
        var wordList = request.split(prep.splitR);
        for (var i = 0, len = wordList.length; i < len; i++) {
            var word = wordList[i];
            if (word.length === 0) continue;
            var wordLow = word.toLowerCase();
            var rWord = word.replace(view.filterWordR.text2safeR, '\\$1');
            hlWordCaseListR.push(rWord.toLowerCase());
            hlWordLowList.push(wordLow);
            hlWordList.push(word);
            var isYear = prep.yearR.test(word);
            if (isYear) {
                if (word > currentYear) continue;
                yearList.push(word);
                continue;
            }
            hlWordNoYearList.push(word);
            hlWordNoYearListR.push(rWord);
        }

        obj.request = request;
        obj.historyKey = $.trim(request.toLowerCase());

        if (hlWordList.length > 0) {
            obj.hlWordList = hlWordList;
            obj.hlWordLowList = hlWordLowList;
            obj.hlWordR = new RegExp(hlWordCaseListR.sort(function(a,b){return a.length > b.length ? 0 : 1}).join('|'), 'ig');

            obj.hlWordCaseRate = 200 / hlWordList.length;
            obj.hlWordRate = obj.hlWordCaseRate * 0.95;

            obj.unOrderWordCaseRate =  obj.hlWordCaseRate * 0.70;
            obj.unOrderWordRate = obj.hlWordRate * 0.60;

            obj.notFirstWordCaseRate = obj.hlWordCaseRate * 0.90;
            obj.notFirstWordRate = obj.hlWordRate * 0.80;

            obj.notSpaceSlitCaseRate = obj.hlWordCaseRate * 0.90;
            obj.notSpaceSlitRate = obj.hlWordRate * 0.80;
        }
        if (hlWordNoYearList.length > 0) {
            obj.hlWordNoYearR = new RegExp(hlWordNoYearListR.join('|'), 'ig');
        }
        if (yearList.length > 0) {
            obj.year = yearList;
            obj.yearR = new RegExp(yearList.join('|'), 'g');
        }

        return request;
    },
    inHistory: function() {
        "use strict";
        var historyList = view.varCache.historyList;
        var requestObj = view.varCache.requestObj;
        var now = parseInt(Date.now() / 1000);
        var history = view.varCache.historyObj;
        var historyObj;
        if ((historyObj = history[requestObj.historyKey]) === undefined) {
            historyList.splice(view.varCache.historyLimit);
            historyList.unshift(historyObj = history[requestObj.historyKey] = {
                key: requestObj.historyKey,
                linkList: [],
                // createTime: now,
                count: 0
            });
        } else {
            historyList.splice(historyList.indexOf(historyObj), 1);
            historyList.unshift(historyObj);
        }
        historyObj.request = requestObj.request;
        historyObj.profileName = engine.currentProfile;
        historyObj.trackerList = this.varCache.filter.trackerList;
        historyObj.lastRequestTime = now;
        historyObj.count++;

        mono.storage.set({searchHistory: historyList});
    },
    inLinkHistory: function(torrentObj) {
        "use strict";
        var history = view.varCache.historyObj;
        var requestObj = view.varCache.requestObj;
        var historyObj = history[requestObj.historyKey];
        if (historyObj === undefined) return;

        var linkObj, linkObjPos;
        for (var i = 0, item; item = historyObj.linkList[i]; i++) {
            if (item.url === torrentObj.api.url) {
                linkObj = item;
                linkObjPos = i;
                break;
            }
        }

        var now = parseInt(Date.now() / 1000);
        if (linkObj === undefined) {
            historyObj.linkList.splice(view.varCache.historyLinksListLimit);
            historyObj.linkList.unshift(linkObj = {
                id: torrentObj.id,
                url: torrentObj.api.url
                // insertTime: now,
                // count: 0
            });
        } else {
            historyObj.linkList.splice(linkObjPos, 1);
            historyObj.linkList.unshift(linkObj);
        }

        linkObj.title = torrentObj.api.title;
        linkObj.clickTime = now;
        // linkObj.count++;

        mono.storage.set({searchHistory: view.varCache.historyList});
    },
    setLocationUrl: function(hash, title, baseUrl) {
        var previewHash = this.varCache.locationHash;
        this.varCache.locationHash = hash;
        if (history.state === null || previewHash.length < 2) {
            history.replaceState({hash: hash}, title, baseUrl);
        } else
        if (history.state.hash !== hash) {
            history.pushState({hash: hash}, title, baseUrl);
        }
    },
    setLocation: function(request, params) {
        "use strict";
        var base = 'index.html';
        var hash = '#';
        if (request === undefined) {
            this.setLocationUrl(hash, document.title, base+hash);
            return;
        }
        hash += '?' + mono.param({
            search: request,
            params: JSON.stringify(params)
        });
        this.setLocationUrl(hash, document.title, base+hash);
    },
    onUrlChange: function() {
        "use strict";
        this.varCache.locationHash = location.hash;
        var args = mono.parseParam(location.hash);
        try {
            args.params = !args.params ? {} : JSON.parse(args.params);
        } catch (e) {
            args.params = {};
        }

        var profileName = engine.profileList[args.params.profileName] ? args.params.profileName : engine.currentProfile;
        view.selectProfile(profileName, function() {
            if (args.params.trackerList) {
                for (var i = 0, trackerId; trackerId = args.params.trackerList[i]; i++) {
                    var trackerObj = this.varCache.trackerList[trackerId];
                    if (trackerObj === undefined) continue;
                    trackerObj.setSelect(1);
                }
            }
            if (!args.search) {
                return this.setMainState(1);
            }
            this.freezAutocomplete();
            view.domCache.requestInput.value = args.search;
            view.search(args.search, 1);
        }.bind(this));
    },
    setDocumentTitle: function(fromHistory, request, trackerList) {
        "use strict";
        if (request === undefined) {
            document.title = mono.language.appTitle;
            !fromHistory && this.setLocation();
            return;
        }
        var trackerList = trackerList.map(function(trackerId) {
            return engine.trackerLib[trackerId].title;
        }).join(', ');
        var titleRequest = !request ? '""' : request;
        document.title = titleRequest + ' :: ' + trackerList + ' :: TMS';
        !fromHistory && this.setLocation(request, {
            profileName: engine.currentProfile,
            trackerList: this.varCache.filter.trackerList
        });
    },
    search: function(request, fromHistory) {
        "use strict";
        view.setSearchState();
        view.domCache.resultTableBody.textContent = '';
        view.varCache.searchResultCache = [];
        view.resultCounterReset();
        request = view.prepareRequest(request);
        view.inHistory();
        var trackerList = view.getTrackerList();
        this.setDocumentTitle(fromHistory, request, trackerList);
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

        trackerObj.setSelect(trackerObj.selected ? 0 : 1);
    },
    onCategoryListItemClick: function(e) {
        "use strict";
        e.preventDefault();
        var categoryId = this.dataset.id;
        var categoryObj = view.varCache.categoryObjList[categoryId];

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
    clearFilter: function() {
        "use strict";
        for (var i = 0, list = view.varCache.filterRangeList, type; type = list[i]; i++) {
            view.domCache[type].value = '';
        }
        view.domCache.wordFilterInput.value = '';
        view.domCache.timeFilterSelect.selectedIndex = 0;
        view.domCache.timeFilterSelect.dispatchEvent(new CustomEvent('change'));
        view.varCache.timeFilterSelectBox.update();

        for (var trackerId in view.varCache.trackerList) {
            var trackerObj = view.varCache.trackerList[trackerId];
            trackerObj.setSelect(0);
        }

        view.filterUpdate();
    },
    bindFilterRange: function() {
        "use strict";
        for (var i = 0, list = view.varCache.filterRangeList, type; type = list[i]; i++) {
            view.domCache[type].addEventListener('keyup', mono.throttle(view.onChangeFilter.bind(view.domCache[type], type), 250));
        }
    },
    onTableHeadColumnClick: function(e) {
        "use strict";
        e.preventDefault();
        var id = this.dataset.id;
        view.varCache.tableHeadColumnObjList[id].setOrder();
    },
    getHistory: function() {
        "use strict";
        var history = view.varCache.historyList;
        history.sort(function(a,b){
            if (a.count === b.count) {
                return 0;
            } else if (a.count < b.count) {
                return 1;
            } else {
                return -1;
            }
        });
        var list = [];
        for (var i = 0, item; item = history[i]; i++) {
            if (item.request.length === 0) continue;
            list.push(item.request);
        }
        return list;
    },
    setSearchState: function() {
        "use strict";
        document.body.classList.remove('home');
    },
    setMainState: function(fromHistory) {
        "use strict";
        this.setDocumentTitle(fromHistory);

        view.varCache.searchResultCache.splice(0);
        view.varCache.lastSortedList.splice(0);

        view.clearFilter();
        document.body.classList.add('home');
        view.domCache.clearBtn.dispatchEvent(new CustomEvent('click'));
    },
    prepareHistory: function() {
        "use strict";
        var historyList = view.varCache.historyList = engine.history;
        var historyObj = view.varCache.historyObj;
        for (var i = 0, item; item = historyList[i]; i++) {
            historyObj[item.key] = item;
        }
    },
    freezAutocomplete: function() {
        "use strict";
        if (!view.varCache.$requestInput) return;

        view.varCache.$requestInput.autocomplete('close');
        view.varCache.$requestInput.autocomplete('disable');
        setTimeout(function() {
            view.varCache.$requestInput.autocomplete('enable');
        }, 1000);
    },
    onRequestInput: function() {
        "use strict";
        if (view.domCache.requestInput.value.length > 0) {
            view.domCache.clearBtn.classList.add('show');
        } else {
            view.domCache.clearBtn.classList.remove('show');
        }
    },
    once: function() {
        "use strict";
        view.varCache.tableSortColumnId = engine.settings.sortColumn;
        view.varCache.tableOrderIndex = engine.settings.sortOrder ? 0 : 1;
        mono.language.size_filter += ' ' + mono.language.sizeList.split(',')[3];
        mono.writeLanguage(mono.language);
        document.body.classList.remove('loading');
        view.domCache.requestInput.focus();

        view.bytesToString = view.bytesToString.bind(null, mono.language.sizeList.split(','));

        view.domCache.mainBtn.addEventListener('click', function(e) {
            e.preventDefault();

            view.freezAutocomplete();
            view.setMainState();
        });

        view.domCache.clearBtn.addEventListener('click', function() {
            view.domCache.requestInput.value = '';
            view.domCache.requestInput.dispatchEvent(new CustomEvent('keyup'));
            view.domCache.requestInput.focus();
        });

        view.domCache.requestInput.addEventListener('keyup', view.onRequestInput);

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

        view.domCache.resultTableHead.addEventListener('click', function(e) {
            var el = e.target;
            var _this = this.firstChild;
            if (this === el) return;
            while (el.parentNode !== _this) {
                el = el.parentNode;
            }

            view.onTableHeadColumnClick.call(el, e);
        });

        view.domCache.resultTableBody.addEventListener('click', function(e) {
            var el = e.target;
            while (el !== this && el.tagName !== 'A') {
                el = el.parentNode;
            }

            if (el === this) return;
            if (!el.classList.contains('download') && !el.parentNode.classList.contains('title')) {
                return;
            }

            while (el.parentNode !== this) {
                el = el.parentNode;
            }

            var index = el.dataset.index;
            var searchResultCache = view.varCache.searchResultCache;
            view.inLinkHistory(searchResultCache[index]);
        });

        view.writeTableHead();

        this.domCache.trackerListBlock.style.height = engine.settings.trackerListHeight + 'px';
        this.domCache.trackerList.style.height = engine.settings.trackerListHeight - 9 + 'px';
        view.writeProfileList();

        view.writeCategory();

        view.selectProfile(engine.currentProfile);
        view.domCache.profileSelect.addEventListener('change', function() {
            var service = this.childNodes[this.selectedIndex].dataset.service;
            if (service) {
                var option = this.querySelector('option[value="'+engine.currentProfile+'"]');
                if (!option) return;
                this.selectedIndex = option.index;
                view.varCache.selectBox && view.varCache.selectBox.update();

                profileManager.add();
                return;
            }
            view.selectProfile(this.value);
        });

        view.domCache.editProfile.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (profileManager.isShow()) {
                return profileManager.onHide();
            }
            profileManager.edit(view.domCache.profileSelect.value);
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

        view.varCache.timeFilterSelectBox = selectBox.wrap(view.domCache.timeFilterSelect);

        if (engine.settings.hideSeedColumn === 1) {
            view.domCache.seedFilter.style.display = 'none';
            view.domCache.seedFilter.previousElementSibling.style.display = 'none';
        }

        if (engine.settings.hidePeerColumn === 1) {
            view.domCache.peerFilter.style.display = 'none';
            view.domCache.peerFilter.previousElementSibling.style.display = 'none';
        }

        view.varCache.selectBox = selectBox.wrap(view.domCache.profileSelect);

        rate.init();
        view.prepareHistory();

        if (window.onpopstate === null) {
            window.addEventListener('popstate', function() {
                if (location.hash === this.varCache.locationHash) {
                    return;
                }
                this.onUrlChange();
            }.bind(this), false);
        } else {
            window.addEventListener('hashchange', function() {
                if (location.hash === this.varCache.locationHash){
                    return;
                }
                this.onUrlChange();
            }.bind(this));
        }

        document.body.appendChild(mono.create('script', {src: 'js/jquery-2.1.3.min.js'}));
    },
    onJqReady: function() {
        "use strict";
        view.domCache.searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var request = this.domCache.requestInput.value.trim();
            this.search(request);

            this.freezAutocomplete();
        }.bind(this));

        this.onUrlChange();
    },
    onUiReady: function() {
        "use strict";
        $(document).off('mouseup');

        (view.varCache.$requestInput = $(view.domCache.requestInput)).autocomplete({
            minLength: 0,
            position: {
                collision: "bottom"
            },
            source: function(request, cb) {
                var value = request.term;
                if (value.length === 0) {
                    return cb(view.getHistory());
                }
                if (view.varCache.suggestXhr) {
                    view.varCache.suggestXhr.abort();
                }
                view.varCache.suggestXhr = mono.ajax({
                    url: 'http://suggestqueries.google.com/complete/search?client=firefox&q=' + encodeURIComponent(value),
                    dataType: 'json',
                    success: function(data) {
                        cb(data[1]);
                    }
                });
            },
            select: function() {
                view.domCache.requestInput.value = arguments[1].item.value;
                view.domCache.searchBtn.dispatchEvent(new CustomEvent('click', {cancelable: true}));
            },
            close: function() {
                mono.resizePopup(undefined, document.body.clientHeight);
                if (mono.isOpera) {
                    setTimeout(function() {
                        view.domCache.requestInput.focus();
                    }, 100);
                }
            },
            create: function() {
                var hasTopShadow = 0;
                mono.create(document.querySelector('ul.ui-autocomplete'), {
                    on: ['scroll', function() {
                        if (this.scrollTop !== 0) {
                            if (hasTopShadow === 1) {
                                return;
                            }
                            hasTopShadow = 1;

                            this.style.boxShadow = 'rgba(0, 0, 0, 0.40) -2px 1px 2px 0px inset';
                            return;
                        }
                        if (hasTopShadow === 0) {
                            return;
                        }
                        hasTopShadow = 0;

                        this.style.boxShadow = null;
                    }]
                });
            },
            messages: {
                noResults: '',
                results: function() {}
            }
        });

        (this.domCache.$trackerListBlock = $(this.domCache.trackerListBlock)).resizable({
            minHeight: 56,
            handles: 's',
            alsoResize: this.domCache.trackerList,
            stop: function(e, ui) {
                mono.storage.set({trackerListHeight: ui.size.height});
            }
        });
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