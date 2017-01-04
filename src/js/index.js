/**
 * Created by Anton on 31.12.2016.
 */
"use strict";
require.config({
    baseUrl: './js'
});
require([
    './min/promise.min',
    './lib/i18nDom',
    './lib/utils',
    './lib/dom',
    './lib/selectBox',
    './min/EventEmitter.min',
    './min/moment-with-locales.min',
    './min/filesize.min',
    './lib/profileManager',
    './lib/profile'
], function (Promise, i18nDom, utils, dom, selectBox, EventEmitter, moment, filesize, ProfileManager, Profile) {
    i18nDom();

    document.body.classList.remove('loading');
    moment.locale(chrome.i18n.getUILanguage());

    var ee = new EventEmitter();
    var activeProfile = null;
    var searchResults = [];
    var uiState = [];

    (function () {
        var searchInput = document.querySelector('.input__input-search');
        var searchClear = document.querySelector('.input__clear-search');
        var searchSubmit = document.querySelector('.search__submit');

        (function (input, submit) {
            var stateItem = {
                id: 'searchInput',
                discard: function () {
                    input.value = '';
                    input.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
                }
            };

            input.addEventListener('keypress', function(e) {
                if (e.keyCode === 13) {
                    submit.dispatchEvent(new MouseEvent('click', {cancelable: true}));
                }
            });

            input.addEventListener('keyup', function(e) {
                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });
        })(searchInput, searchSubmit);

        utils.bindClearBtn(searchClear, searchInput);

        (function (submit) {
            submit.addEventListener('click', function(e) {
                e.preventDefault();
                var query = searchInput.value.trim();
                ee.trigger('search', [query]);
            });
        })(searchSubmit);

        var initAutoComplete = function (input, submit) {
            var lastHistoryRequest = null;
            var historySuggests = (function () {
                var history = null;
                var initHistory = function (cb) {
                    chrome.storage.local.get({
                        history: []
                    }, function (storage) {
                        history = storage.history;
                        cb && cb();
                    });

                    return {
                        abort: function () {
                            cb = null;
                        }
                    }
                };
                var onGetHistory = function (term, cb) {
                    var termLen = term.length;
                    var termLow = term.toLowerCase();
                    var list = history.filter(function (item) {
                        var query = item.query;
                        if (termLen === 0) {
                            return !!query;
                        } else {
                            return query.toLowerCase().indexOf(termLow) === 0;
                        }
                    }).sort(function(a, b) {
                        a = a.count;
                        b = b.count;
                        return a === b ? 0 : a < b ? 1 : -1;
                    }).map(function (item) {
                        return item.query;
                    });
                    cb(list);
                };
                return function (term, cb) {
                    if (!history) {
                        lastHistoryRequest = initHistory(function () {
                            onGetHistory(term, cb);
                        });
                    } else {
                        onGetHistory(term, cb);
                    }
                };
            })();

            var webSuggests = (function () {
                var cache = {};
                var onGetSuggests = function (term, suggests, cb) {
                    cache[term] = suggests;
                    cb(suggests);
                };
                return function (term, cb) {
                    var _cache = cache[term];
                    if (_cache) {
                        onGetSuggests(term, _cache, cb);
                    } else {
                        lastHistoryRequest = utils.request({
                            url: 'http://suggestqueries.google.com/complete/search',
                            data: {
                                client: 'firefox',
                                q: term
                            },
                            json: true
                        }, function (err, response) {
                            if (!err) {
                                onGetSuggests(term, response.body[1], cb);
                            }
                        });
                    }
                };
            })();

            $(input).autocomplete({
                minLength: 0,
                delay: 100,
                position: {
                    collision: "bottom"
                },
                source: function(query, cb) {
                    if (lastHistoryRequest) {
                        lastHistoryRequest.abort();
                        lastHistoryRequest = null;
                    }

                    var term = query.term;
                    if (!term.length) {
                        historySuggests(term, cb);
                    } else {
                        webSuggests(term, cb);
                    }
                },
                select: function(e, ui) {
                    submit.dispatchEvent(new CustomEvent('click', {cancelable: true, detail: {query: ui.item.value}}));
                },
                create: function() {
                    var hasTopShadow = false;
                    var ac = document.querySelector('ul.ui-autocomplete');
                    ac.addEventListener('scroll', function () {
                        if (this.scrollTop !== 0) {
                            if (hasTopShadow !== true) {
                                hasTopShadow = true;
                                this.style.boxShadow = 'rgba(0, 0, 0, 0.40) -2px 1px 2px 0px inset';
                            }
                        } else
                        if (hasTopShadow !== false) {
                            hasTopShadow = false;
                            this.style.boxShadow = null;
                        }
                    });
                }
            });
        };

        setTimeout(function () {
            require(['./min/jquery-3.1.1.min'], function () {
                require(['./min/jquery-ui.min'], function () {
                    initAutoComplete(searchInput, searchSubmit);
                });
            });
        }, 50);
    })();

    (function () {
        var main = document.querySelector('.menu__btn-main');
        main.addEventListener('click', function (e) {
            e.preventDefault();
            uiState.splice(0).forEach(function (state) {
                state.discard();
            });
            if (uiState.length > 0) {
                console.error('State is not empty!', uiState);
            }
        });
    })();

    (function () {
        var scrollTopVisible = false;
        var scrollTop = document.querySelector('.scroll_top');

        scrollTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo(0, 0);
        });

        window.addEventListener('scroll', function (e) {
            if (window.scrollY > 100) {
                if (!scrollTopVisible) {
                    scrollTopVisible = true;
                    scrollTop.classList.add('scroll_top-show');
                }
            } else {
                if (scrollTopVisible) {
                    scrollTopVisible = false;
                    scrollTop.classList.remove('scroll_top-show');
                }
            }
        });
    })();

    var Filter = function () {
        var inputBoxTimeFilterVisible = false;
        var inputBoxTimeFilter = document.querySelector('.input_box-time-filter');
        var inputWordFilter = document.querySelector('.input__input-word-filter');
        var clearWordFilter = document.querySelector('.input__clear-word-filter');
        var sizeInputFromFilter = document.querySelector('.input__input-size-filter.input__input-range-from');
        var sizeInputToFilter = document.querySelector('.input__input-size-filter.input__input-range-to');
        var selectTimeFilter = document.querySelector('.select__select-time-filter');
        var timeInputFromFilter = document.querySelector('.input__input-time-filter.input__input-range-from');
        var timeInputToFilter = document.querySelector('.input__input-time-filter.input__input-range-to');
        var seedInputFromFilter = document.querySelector('.input__input-seed-filter.input__input-range-from');
        var seedInputToFilter = document.querySelector('.input__input-seed-filter.input__input-range-to');
        var peerInputFromFilter = document.querySelector('.input__input-peer-filter.input__input-range-from');
        var peerInputToFilter = document.querySelector('.input__input-peer-filter.input__input-range-to');

        var timer = null;
        var applyFilter = function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                filter.update();
            }, 150);
        };

        var filters = [];

        (function wordFilter(input, clearWordFilter) {
            var strToRe = function (string) {
                var lowString = string.toLowerCase();
                var i, symbol;
                var part = '';
                var parts = [];
                var isSpace = /\s/;
                for (i = 0; symbol = lowString[i]; i++) {
                    if (isSpace.test(symbol)) {
                        if (lowString[i - 1] !== '\\') {
                            part && parts.push(part);
                            part = '';
                        } else {
                            part = part.substr(0, part.length - 1) + symbol;
                        }
                    } else {
                        part += symbol;
                    }
                }
                part && parts.push(part);

                var list = null;
                var includeList = [];
                var excludeList = [];
                var excludeRe = /^[!-]\w+/;
                var sanitizeText = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;
                for (i = 0; part = parts[i]; i++) {
                    if (excludeRe.test(part)) {
                        list = excludeList;
                        part = part.substr(1);
                    } else {
                        list = includeList;
                    }
                    part = part.replace(sanitizeText, '\\$&');
                    if (list.indexOf(part) === -1) {
                        list.push(part);
                    }
                }

                var sortFn = function(a, b){
                    return a.length > b.length ? -1 : 1;
                };

                excludeList.sort(sortFn);
                includeList.sort(sortFn);

                var result = new Array(3);
                if (excludeList.length) {
                    result[0] = new RegExp(excludeList.join('|'));
                }
                if (includeList.length) {
                    result[1] = new RegExp(includeList.join('|'), 'g');
                    result[2] = includeList.length;
                }
                return (result[0] || result[1]) && result;
            };

            var stateItem = {
                id: 'wordFilter',
                discard: function () {
                    input.value = '';
                    input.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
                }
            };

            var filter = {
                type: 'word',
                re: null
            };

            utils.bindClearBtn(clearWordFilter, input);

            input.addEventListener('keyup', function(e) {
                filter.re = strToRe(this.value);

                var pos = filters.indexOf(filter);
                if (pos !== -1) {
                    filters.splice(pos, 1);
                }

                if (filter.re) {
                    filters.push(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });
        })(inputWordFilter, clearWordFilter);

        (function sizeFilter(inputFrom, inputTo) {
            var stateItem = {
                id: 'sizeFilter',
                discard: function () {
                    inputFrom.value = '';
                    inputTo.value = '';
                    inputTo.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
                }
            };

            var filter = {
                type: 'size',
                min: 0,
                max: 0
            };

            inputFrom.addEventListener('keyup', function(e) {
                filter.min = parseFloat(this.value) * 1024 * 1024 * 1024 || 0;

                var pos = filters.indexOf(filter);
                if (pos !== -1) {
                    filters.splice(pos, 1);
                }

                if (filter.max && filter.min > filter.max) {
                    this.value = '';
                    filter.min = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    filters.push(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            inputTo.addEventListener('keyup', function(e) {
                filter.max = parseFloat(this.value) * 1024 * 1024 * 1024 || 0;

                var pos = filters.indexOf(filter);
                if (pos !== -1) {
                    filters.splice(pos, 1);
                }

                if (filter.min && filter.max < filter.min) {
                    this.value = '';
                    filter.max = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    filters.push(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            utils.bindDblClickClear([inputFrom, inputTo]);
        })(sizeInputFromFilter, sizeInputToFilter);

        (function timeFilter(select, inputBox, inputFrom, inputTo) {
            var stateItem = {
                id: 'timeFilter',
                discard: function () {
                    select.selectedIndex = 0;
                    select.dispatchEvent(new CustomEvent('change', {detail: 'stateReset'}));
                }
            };

            var filter = {
                type: 'date',
                min: 0,
                max: 0
            };

            var selectWrapper = new selectBox(select);

            select.addEventListener('change', function (e) {
                var value = this.value;
                if (value < 0) {
                    if (!inputBoxTimeFilterVisible) {
                        inputBoxTimeFilterVisible = true;
                        inputBox.classList.add('input_box-time-filter-visible');
                    }
                } else {
                    if (inputBoxTimeFilterVisible) {
                        inputBoxTimeFilterVisible = false;
                        inputFrom.value = '';
                        inputTo.value = '';
                        inputBox.classList.remove('input_box-time-filter-visible');
                    }
                }

                var pos = filters.indexOf(filter);
                if (pos !== -1) {
                    filters.splice(pos, 1);
                }

                if (!inputBoxTimeFilterVisible) {
                    filter.max = 0;
                    filter.min = parseInt(this.value) || 0;
                    if (filter.min) {
                        filter.min = parseInt(Date.now() / 1000) - filter.min;
                    }

                    if (filter.min > 0) {
                        filters.push(filter);
                    }
                }

                applyFilter();

                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            inputFrom.addEventListener('keyup', function(e) {
                filter.min = parseInt(this.value && this.dataset.time) || 0;

                var pos = filters.indexOf(filter);
                if (pos !== -1) {
                    filters.splice(pos, 1);
                }

                if (filter.max && filter.min > filter.max) {
                    this.value = '';
                    filter.min = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    filters.push(filter);
                }

                applyFilter();
            });

            inputTo.addEventListener('keyup', function(e) {
                filter.max = parseInt(this.value && this.dataset.time) || 0;

                var pos = filters.indexOf(filter);
                if (pos !== -1) {
                    filters.splice(pos, 1);
                }

                if (filter.min && filter.max < filter.min) {
                    this.value = '';
                    filter.max = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    filters.push(filter);
                }

                applyFilter();
            });

            utils.bindDblClickClear([inputFrom, inputTo]);

            var initDataPicker = function (inputFrom, inputTo) {
                $([inputFrom, inputTo]).datepicker({
                    defaultDate: '0',
                    changeMonth: true,
                    numberOfMonths: 1,
                    prevText: '',
                    nextText: '',
                    firstDay: 1,
                    maxDate: "+1d",
                    hideIfNoPrevNext: true,
                    dateFormat: "yy-mm-dd",
                    onClose: function(date, ui) {
                        var input = ui.input[0];
                        input.dataset.time = Math.round((new Date(date).getTime() / 1000));
                        input.dispatchEvent(new CustomEvent('keyup'));
                    }
                });
            };

            require(['./min/jquery-3.1.1.min'], function () {
                require(['./min/jquery-ui.min'], function () {
                    initDataPicker(inputFrom, inputTo);
                });
            });
        })(selectTimeFilter, inputBoxTimeFilter, timeInputFromFilter, timeInputToFilter);

        (function seedFilter(inputFrom, inputTo) {
            var stateItem = {
                id: 'seedFilter',
                discard: function () {
                    inputFrom.value = '';
                    inputTo.value = '';
                    inputTo.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
                }
            };

            var filter = {
                type: 'seed',
                min: 0,
                max: 0
            };

            inputFrom.addEventListener('keyup', function(e) {
                filter.min = parseInt(this.value) || 0;

                var pos = filters.indexOf(filter);
                if (pos !== -1) {
                    filters.splice(pos, 1);
                }

                if (filter.max && filter.min > filter.max) {
                    this.value = '';
                    filter.min = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    filters.push(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            inputTo.addEventListener('keyup', function(e) {
                filter.max = parseInt(this.value) || 0;

                var pos = filters.indexOf(filter);
                if (pos !== -1) {
                    filters.splice(pos, 1);
                }

                if (filter.min && filter.max < filter.min) {
                    this.value = '';
                    filter.max = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    filters.push(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            utils.bindDblClickClear([inputFrom, inputTo]);
        })(seedInputFromFilter, seedInputToFilter);

        (function peerFilter(inputFrom, inputTo) {
            var stateItem = {
                id: 'peerFilter',
                discard: function () {
                    inputFrom.value = '';
                    inputTo.value = '';
                    inputTo.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
                }
            };

            var filter = {
                type: 'peer',
                min: 0,
                max: 0
            };

            inputFrom.addEventListener('keyup', function(e) {
                filter.min = parseInt(this.value) || 0;

                var pos = filters.indexOf(filter);
                if (pos !== -1) {
                    filters.splice(pos, 1);
                }

                if (filter.max && filter.min > filter.max) {
                    this.value = '';
                    filter.min = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    filters.push(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            inputTo.addEventListener('keyup', function(e) {
                filter.max = parseInt(this.value) || 0;

                var pos = filters.indexOf(filter);
                if (pos !== -1) {
                    filters.splice(pos, 1);
                }

                if (filter.min && filter.max < filter.min) {
                    this.value = '';
                    filter.max = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    filters.push(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            utils.bindDblClickClear([inputFrom, inputTo]);
        })(peerInputFromFilter, peerInputToFilter);

        var unique = function (value, index, self) {
            return self.indexOf(value) === index;
        };

        var filterTypeMap = {
            word: function (filter, torrent) {
                var result = true;
                if (filter.re[0]) {
                    result = !filter.re[0].test(torrent.wordFilterLow);
                }
                if (result && filter.re[1]) {
                    var m = torrent.wordFilterLow.match(filter.re[1]);
                    result = m && m.filter(unique).length === filter.re[2];
                }
                return result;
            },
            size: function (filter, torrent) {
                var result = filter.min === 0 ? true : torrent.size >= filter.min;
                if (result && filter.max) {
                    result = torrent.size <= filter.max;
                }
                return result;
            },
            date: function (filter, torrent) {
                var result = filter.min === 0 ? true : torrent.date >= filter.min;
                if (result && filter.max) {
                    result = torrent.date <= filter.max;
                }
                return result;
            },
            seed: function (filter, torrent) {
                var result = filter.min === 0 ? true : torrent.seed >= filter.min;
                if (result && filter.max) {
                    result = torrent.seed <= filter.max;
                }
                return result;
            },
            peer: function (filter, torrent) {
                var result = filter.min === 0 ? true : torrent.peer >= filter.min;
                if (result && filter.max) {
                    result = torrent.peer <= filter.max;
                }
                return result;
            }
        };

        var styleNode = dom.el('style', {
            class: ['style_filter'],
            text: ''
        });
        document.body.appendChild(styleNode);

        var tableRowSelector = '.table-results .body__row';

        this.update = function () {
            searchResults.forEach(function (table) {
                table.updateFilter();
            });

            updateCounter();

            var style = [];
            var trackerIds = activeProfile.selectedTrackerIds;

            if (filters.length || trackerIds.length) {
                style.push(tableRowSelector + ':not([data-filter="true"]){display: none}');
            }

            styleNode.textContent = style.join('');
        };

        this.getFilterValue = function (/**torrent*/torrent) {
            var trackerIds = activeProfile.selectedTrackerIds;
            var selected = true;
            if (trackerIds.length) {
                selected = trackerIds.indexOf(torrent.trackerId) !== -1;
            }
            return selected && filters.every(function (filter) {
                return filterTypeMap[filter.type](filter, torrent);
            });
        }
    };

    var filter = new Filter();

    (function () {
        var manageProfile = document.querySelector('.button-manage-profile');
        var profileSelect = document.querySelector('.profile__select');
        var trackerList = document.querySelector('.tracker__list');
        var profileSelectWrapper = null;

        trackerList.addEventListener('click', function (e) {
            var child = dom.closestNode(this, e.target);
            if (child) {
                activeProfile.trackerIdTracker[child.dataset.id].select();
            }
        });

        var currentProfileId = null;
        var trackers = {};
        var profiles = [];
        var profileIdProfileMap = {};
        var getProfileId = function () {
            var id = 0;
            while (profileIdProfileMap[id]) {
                id++;
            }
            return id;
        };
        var getDefaultProfile = function () {
            return {
                name: chrome.i18n.getMessage('defaultProfileName'),
                id: getProfileId(),
                trackers: []
            }
        };
        var selectProfileId = function (id) {
            var index = 0;
            profiles.some(function (item, i) {
                if (item.id === id) {
                    index = i;
                    return true;
                }
            });
            if (profileSelect.selectedIndex != index) {
                profileSelect.selectedIndex = index;
            }
        };
        /**
         * @typedef {Object} profile
         * @property {string} name
         * @property {number} id
         * @property {[profileTracker]} trackers
         */
        /**
         * @typedef {Object} profileTracker
         * @property {string} id
         */
        /**
         * @typedef {Object} tracker
         * @property {string} id
         * @property {Object} meta
         * @property {string} meta.name
         * @property {string} meta.version
         * @property {string} [meta.author]
         * @property {string} [meta.description]
         * @property {string} [meta.homepageURL]
         * @property {string} meta.icon
         * @property {string} [meta.icon64]
         * @property {string} meta.updateURL
         * @property {string} meta.downloadURL
         * @property {string} [meta.supportURL]
         * @property {string[]} [meta.require]
         * @property {string[]} [meta.connect]
         * @property {Object} info
         * @property {number} info.lastUpdate
         * @property {string} code
         */



        manageProfile.addEventListener('click', function (e) {
            e.preventDefault();
            new ProfileManager(profiles, profileIdProfileMap, trackers, activeProfile);
        });

        profileSelectWrapper = new selectBox(profileSelect, {
            editBtn: manageProfile
        });

        chrome.storage.local.get({
            currentProfileId: null,
            profiles: [],
            trackers: {}
        }, function (storage) {
            currentProfileId = storage.currentProfileId;
            trackers = storage.trackers;
            profiles = storage.profiles;
            if (profiles.length === 0) {
                profiles.push(getDefaultProfile());
            }
            var elList = profiles.map(function (/**profile*/item) {
                profileIdProfileMap[item.id] = item;
                return dom.el('option', {
                    text: item.name,
                    value: item.id
                });
            });
            dom.el(profileSelect, {
                append: elList
            });
            if (!profileIdProfileMap[currentProfileId]) {
                currentProfileId = profiles[0].id;
            }
            selectProfileId(currentProfileId);

            profileSelectWrapper.update();
            profileSelectWrapper.select();

            if (activeProfile) {
                activeProfile.destroy();
            }
            activeProfile = new Profile(profileIdProfileMap[currentProfileId], trackers, filter, trackerList);

            /*ee.on('search', function (query) {
                activeProfile.trackers.forEach(function (tracker) {
                    tracker.search(query, function (result) {
                        ee.trigger('results', [tracker.id, query, result]);
                    });
                });
            });

            ee.on('abort', function () {
                activeProfile.trackers.forEach(function (tracker) {
                    tracker.abort();
                });
            });*/
        });
    })();

    var Table = function () {
        var cells = ['date', 'title', 'size', 'seed', 'peer'];
        var sortCells = [];


        var unixTimeToString = function (unixtime) {
            return moment(unixtime * 1000).format('lll');
        };

        var unixTimeToFromNow = function (unixtime) {
            return moment(unixtime * 1000).fromNow();
        };

        var sortInsertList = function(tableBody, sortedList, nodeList) {
            "use strict";
            var node;
            var insertItems = [];
            var insertPosition = null;
            var nodes = null;
            var child = null;

            for (var i = 0; node = sortedList[i]; i++) {
                if (nodeList[i] === node) {
                    continue;
                }
                insertPosition = i;

                nodes = document.createDocumentFragment();
                while (sortedList[i] !== undefined && sortedList[i] !== nodeList[i]) {
                    var pos = nodeList.indexOf(sortedList[i], i);
                    if (pos !== -1) {
                        nodeList.splice(pos, 1);
                    }
                    nodeList.splice(i, 0, sortedList[i]);

                    nodes.appendChild(sortedList[i].node);
                    i++;
                }

                insertItems.push([insertPosition, nodes]);
            }

            for (var n = 0; node = insertItems[n]; n++) {
                child = tableBody.childNodes[node[0]];
                if (child !== undefined) {
                    tableBody.insertBefore(node[1], child);
                } else {
                    tableBody.appendChild(node[1]);
                }
            }
        };

        var sortTypeMap = {
            date: function (direction) {
                var moveUp = -1;
                var moveDown = 1;
                if (direction > 0) {
                    moveUp = 1;
                    moveDown = -1;
                }
                return function (/*tableRow*/a, /*tableRow*/b) {
                    a = a.torrent.date;
                    b = b.torrent.date;
                    return a === b ? 0 : a > b ? moveUp : moveDown;
                };
            },
            title: function (direction) {
                var moveUp = -1;
                var moveDown = 1;
                if (direction > 0) {
                    moveUp = 1;
                    moveDown = -1;
                }
                return function (/*tableRow*/a, /*tableRow*/b) {
                    a = a.torrent.title;
                    b = b.torrent.title;
                    return a === b ? 0 : a < b ? moveUp : moveDown;
                };
            },
            size: function (direction) {
                var moveUp = -1;
                var moveDown = 1;
                if (direction > 0) {
                    moveUp = 1;
                    moveDown = -1;
                }
                return function (/*tableRow*/a, /*tableRow*/b) {
                    a = a.torrent.size;
                    b = b.torrent.size;
                    return a === b ? 0 : a > b ? moveUp : moveDown;
                };
            },
            seed: function (direction) {
                var moveUp = -1;
                var moveDown = 1;
                if (direction > 0) {
                    moveUp = 1;
                    moveDown = -1;
                }
                return function (/*tableRow*/a, /*tableRow*/b) {
                    a = a.torrent.seed;
                    b = b.torrent.seed;
                    return a === b ? 0 : a > b ? moveUp : moveDown;
                };
            },
            peer: function (direction) {
                var moveUp = -1;
                var moveDown = 1;
                if (direction > 0) {
                    moveUp = 1;
                    moveDown = -1;
                }
                return function (/*tableRow*/a, /*tableRow*/b) {
                    a = a.torrent.peer;
                    b = b.torrent.peer;
                    return a === b ? 0 : a > b ? moveUp : moveDown;
                };
            }
        };

        var onLickClick = function (target, tableRows) {
            var link = dom.closest('a', target);
            if (link) {
                var type = null;
                /**
                 * @type {tableRow}
                 */
                var row;
                if (link.classList.contains('title')) {
                    type = 'open';
                    row = tableRows[link.dataset.index];
                } else
                if (link.classList.contains('cell__download')) {
                    type = 'download';
                    row = tableRows[link.dataset.index];
                }
                if (row) {
                    var item = {
                        type: type,
                        query: row.query,
                        trackerId: row.torrent.trackerId,
                        title: row.torrent.title,
                        url: row.torrent.url,
                        time: parseInt(Date.now() / 1000)
                    };

                    chrome.storage.local.get({
                        clickHistory: []
                    }, function (storage) {
                        var pos = -1;
                        storage.clickHistory.some(function (item, index) {
                            if (item.query === item.query && item.url === title.url) {
                                pos = index;
                                return true;
                            }
                        });
                        if (pos !== -1) {
                            storage.clickHistory.splice(pos, 1);
                        }
                        storage.clickHistory.unshift(item);
                        storage.clickHistory.splice(300);
                        chrome.storage.local.set(storage);
                    });
                }
            }
        };

        var getHeadRow = function () {
            var wrappedCells = {};
            var sortedCell = null;

            var sort = function (direction) {
                if (this === sortedCell) {
                    if (this.sortDirection > 0) {
                        this.sortDirection = -1;
                    } else {
                        this.sortDirection = 1;
                    }
                } else
                if (sortedCell) {
                    this.sortDirection = 0;
                    sortedCell.node.classList.remove('cell-sort-up');
                    sortedCell.node.classList.remove('cell-sort-down');
                }

                if (direction) {
                    this.sortDirection = direction;
                }

                if (this.sortDirection > 0) {
                    this.node.classList.remove('cell-sort-down');
                    this.node.classList.add('cell-sort-up');
                } else {
                    this.node.classList.remove('cell-sort-up');
                    this.node.classList.add('cell-sort-down');
                }

                sortedCell = this;

                sortCells.splice(0);
                sortCells.push([this.type, this.sortDirection]);

                chrome.storage.local.set({
                    sortCells: sortCells
                });

                insertSortedRows();
            };

            var nodes = dom.el('div', {
                class: ['row', 'head__row'],
                on: ['click', function (e) {
                    var child = dom.closestNode(this, e.target);
                    if (child) {
                        e.preventDefault();
                        var row = wrappedCells[child.dataset.type];
                        row.sort();
                    }
                }]
            });

            cells.forEach(function (type) {
                var node = dom.el('a', {
                    class: ['cell', 'row__cell', 'cell-' + type],
                    href: '#cell-' + type,
                    data: {
                        type: type
                    },
                    append: [
                        dom.el('span', {
                            class: ['cell__title'],
                            text: chrome.i18n.getMessage('row_' + type)
                        }),
                        dom.el('i', {
                            class: ['cell__sort']
                        })
                    ]
                });
                wrappedCells[type] = {
                    type: type,
                    sortDirection: 0,
                    node: node,
                    sort: sort
                };
                nodes.appendChild(node);
            });

            return {
                node: dom.el('div', {
                    class: ['table__head'],
                    append: nodes
                }),
                cellTypeCell: wrappedCells
            };
        };

        var normalizeTorrent = function (trackerId, /**torrent*/torrent) {
            torrent.trackerId = trackerId;
            if (torrent.size) {
                torrent.size = parseInt(torrent.size);
                if (isNaN(torrent.size)) {
                    torrent.size = null;
                }
            }
            if (!torrent.size) {
                torrent.size = 0;
            }

            if (torrent.seed) {
                torrent.seed = parseInt(torrent.seed);
                if (isNaN(torrent.seed)) {
                    torrent.seed = null;
                }
            }
            if (!torrent.seed) {
                torrent.seed = 1;
            }

            if (torrent.peer) {
                torrent.peer = parseInt(torrent.peer);
                if (isNaN(torrent.peer)) {
                    torrent.peer = null;
                }
            }
            if (!torrent.peer) {
                torrent.peer = 0;
            }

            if (torrent.date) {
                torrent.date = parseInt(torrent.date);
                if (isNaN(torrent.date)) {
                    torrent.date = null;
                }
            }
            if (!torrent.date) {
                torrent.date = 0;
            }

            if (!torrent.categoryTitle) {
                torrent.categoryTitle = '';
            }

            torrent.titleLow = torrent.title.toLowerCase();
            torrent.categoryTitleLow = torrent.categoryTitle.toLowerCase();
            torrent.wordFilterLow = torrent.titleLow + ' ' + torrent.categoryTitleLow;

            if (!torrent.categoryUrl) {
                torrent.categoryUrl = '';
            }

            if (!torrent.downloadUrl) {
                torrent.downloadUrl = '';
            }
        };

        /**
         * @typedef {Object} torrent
         * @property {string} [categoryTitle]
         * @property {string} [categoryUrl]
         * @property {string} title
         * @property {string} url
         * @property {number} [size]
         * @property {string} [downloadUrl]
         * @property {number} [seed]
         * @property {number} [peer]
         * @property {number} [date]
         *
         * @property {string} trackerId
         * @property {string} titleLow
         * @property {string} categoryTitleLow
         * @property {string} wordFilterLow
         */
        var getBodyRow = function (/**torrent*/torrent, filterValue, index) {
            var row = dom.el('div', {
                class: ['row', 'body__row'],
                data: {
                    filter: filterValue
                }
            });
            cells.forEach(function (type) {
                if (type === 'date') {
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        title: unixTimeToString(torrent.date),
                        text: unixTimeToFromNow(torrent.date)
                    }))
                } else
                if (type === 'title') {
                    var category = '';
                    if (torrent.categoryTitle) {
                        if (torrent.categoryUrl) {
                            category = dom.el('a', {
                                class: ['category'],
                                target: '_blank',
                                href: torrent.categoryUrl,
                                text: torrent.categoryTitle
                            });
                        } else {
                            category = dom.el('span', {
                                class: ['category'],
                                text: torrent.categoryTitle
                            });
                        }
                    }
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        append: [
                            dom.el('div', {
                                class: ['cell__title'],
                                append: [
                                    dom.el('a', {
                                        class: ['title'],
                                        data: {
                                            index: index
                                        },
                                        target: '_blank',
                                        href: torrent.url,
                                        text: torrent.title
                                    })
                                ]
                            }),
                            category && dom.el('div', {
                                class: ['cell__category'],
                                append: [
                                    category
                                ]
                            })
                        ]
                    }))
                } else
                if (type === 'size') {
                    var downloadLink = filesize(torrent.size);
                    if (torrent.downloadUrl) {
                        downloadLink = dom.el('a', {
                            class: ['cell__download'],
                            data: {
                                index: index
                            },
                            target: '_blank',
                            href: torrent.downloadUrl,
                            text: downloadLink + ' ' + String.fromCharCode(8595)
                        });
                    }
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        append: downloadLink
                    }));
                } else
                if (type === 'seed') {
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        text: torrent.seed
                    }))
                } else
                if (type === 'peer') {
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        text: torrent.peer
                    }))
                }
            });
            return row;
        };

        var head = getHeadRow();
        var body = {
            node: dom.el('div', {
                class: ['body', 'table__body'],
                on: [
                    ['mouseup', function (e) {
                        onLickClick(e.target, tableRows);
                    }]
                ]
            })
        };

        var tableNode = dom.el('div', {
            class: ['table', 'table-results'],
            append: [
                head.node,
                body.node
            ]
        });
        this.node = tableNode;

        chrome.storage.local.get({
            sortCells: []
        }, function (storage) {
            sortCells.splice(0);
            sortCells.push.apply(sortCells, storage.sortCells);
            sortCells.forEach(function (row) {
                head.cellTypeCell[row[0]].sort(row[1]);
            });
        });

        var tableRows = [];
        var tableSortedRows = [];

        var insertSortedRows = function () {
            var sortedRows = tableRows.slice(0);
            sortCells.forEach(function (item) {
                var type = item[0];
                var direction = item[1];
                var sortFn = sortTypeMap[type](direction);
                sortedRows.sort(sortFn);
            });
            sortInsertList(body.node, sortedRows, tableSortedRows);
        };

        var trackerIdCount = {};
        this.counter = trackerIdCount;

        this.insertResults = function (/**trackerWrapper*/tracker, query, results) {
            if (!trackerIdCount[tracker.id]) {
                trackerIdCount[tracker.id] = 0;
            }

            results.forEach(function (torrent) {
                /**
                 * @typedef {Object} tableRow
                 * @property {Element} node
                 * @property {string} query
                 * @property {torrent} torrent
                 * @property {trackerWrapper} tracker
                 * @property {boolean} filterValue
                 */
                normalizeTorrent(tracker.id, torrent);
                var filterValue = filter.getFilterValue(torrent);
                var node = getBodyRow(torrent, filterValue, tableRows.length);
                tableRows.push({
                    node: node,
                    query: query,
                    torrent: torrent,
                    tracker: tracker,
                    filterValue: filterValue
                });
                if (filterValue) {
                    trackerIdCount[tracker.id]++;
                }
            });

            insertSortedRows();
        };

        this.updateFilter = function () {
            var trackerId, filterValue;
            for (trackerId in trackerIdCount){
                trackerIdCount[trackerId] = 0;
            }

            for (var i = 0, /**tableRow*/row; row = tableRows[i]; i++) {
                filterValue = filter.getFilterValue(row.torrent);
                trackerId = row.torrent.trackerId;
                row.filterValue = filterValue;
                row.node.dataset.filter = filterValue;
                if (filterValue) {
                    trackerIdCount[trackerId]++;
                }
            }
        };

        this.destroy = function () {
            var parent = tableNode.parentNode;
            if (parent) {
                parent.removeChild(tableNode);
            }
        };
    };

    (function () {
        ee.on('search', function (query) {
            searchResults.forEach(function (table) {
                table.destroy();
            });

            var table = new Table();
            searchResults.push(table);

            var results = document.querySelector('.results');
            results.textContent = '';
            results.appendChild(table.node);

            activeProfile.trackers.forEach(function (tracker) {
                tracker.worker && tracker.worker.search(query, function (response) {
                    if (!response) {
                        throw new Error('Tracker response is empty!');
                    }

                    if (response.success) {
                        table.insertResults(tracker, query, response.results);
                        updateCounter();
                    }
                });
            });
        });
    })();

    var updateCounter = function () {
        var counter = {};
        searchResults.forEach(function (table) {
            for (var trackerId in table.counter) {
                if (!counter[trackerId]) {
                    counter[trackerId] = 0;
                }
                counter[trackerId] += table.counter[trackerId];
            }
        });
        for (var trackerId in counter) {
            activeProfile.trackerIdTracker[trackerId].count(counter[trackerId]);
        }
    };
});