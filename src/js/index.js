/**
 * Created by Anton on 31.12.2016.
 */
"use strict";
require.config({
    baseUrl: './js'
});
require([
    './lib/promise.min',
    './module/i18nDom',
    './module/utils',
    './module/dom',
    './module/selectBox',
    './lib/EventEmitter.min',
    './module/profileManager',
    './module/profile',
    './module/filter'
], function (Promise, i18nDom, utils, dom, selectBox, EventEmitter, ProfileManager, Profile, Filter) {
    i18nDom();

    document.body.classList.remove('loading');

    var ee = new EventEmitter();

    (function () {
        var searchInput = document.querySelector('.input__input-search');
        var searchClear = document.querySelector('.input__clear-search');
        var searchSubmit = document.querySelector('.search__submit');

        (function (input, submit) {
            var discard = function () {
                input.value = '';
                input.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
            };

            input.addEventListener('keypress', function(e) {
                if (e.keyCode === 13) {
                    submit.dispatchEvent(new MouseEvent('click', {cancelable: true}));
                }
            });

            input.addEventListener('keyup', function(e) {
                if (e.detail !== 'stateReset') {
                    ee.once('stateReset', discard);
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
            require(['./lib/jquery-3.1.1.min'], function () {
                require(['./lib/jquery-ui.min'], function () {
                    initAutoComplete(searchInput, searchSubmit);
                });
            });
        }, 50);
    })();

    (function () {
        var main = document.querySelector('.menu__btn-main');
        main.addEventListener('click', function (e) {
            e.preventDefault();
            ee.trigger('stateReset');
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

    var resultFilter = new Filter(ee);

    (function (resultFilter) {
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
                resultFilter.update();
            }, 150);
        };

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
                for (i = 0; part = parts[i]; i++) {
                    if (excludeRe.test(part)) {
                        list = excludeList;
                        part = part.substr(1);
                    } else {
                        list = includeList;
                    }
                    part = utils.sanitizeTextRe(part);
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

            var discard = function () {
                input.value = '';
                input.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
            };

            var filter = {
                type: 'word',
                re: null
            };

            utils.bindClearBtn(clearWordFilter, input);

            input.addEventListener('keyup', function(e) {
                filter.re = strToRe(this.value);

                if (filter.re) {
                    resultFilter.add(filter);
                } else {
                    resultFilter.remove(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset') {
                    ee.once('stateReset', discard);
                }
            });
        })(inputWordFilter, clearWordFilter);

        (function sizeFilter(inputFrom, inputTo) {
            var discard = function () {
                inputFrom.value = '';
                inputTo.value = '';
                inputFrom.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
                inputTo.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
            };

            var filter = {
                type: 'size',
                min: 0,
                max: 0
            };

            inputFrom.addEventListener('keyup', function(e) {
                filter.min = parseFloat(this.value) * 1024 * 1024 * 1024;

                if (isNaN(filter.min) || filter.max && filter.min > filter.max) {
                    this.value = '';
                    filter.min = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    resultFilter.add(filter);
                } else {
                    resultFilter.remove(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset') {
                    ee.once('stateReset', discard);
                }
            });

            inputTo.addEventListener('keyup', function(e) {
                filter.max = parseFloat(this.value) * 1024 * 1024 * 1024;

                if (isNaN(filter.max) || filter.min && filter.max < filter.min) {
                    this.value = '';
                    filter.max = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    resultFilter.add(filter);
                } else {
                    resultFilter.remove(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset') {
                    ee.once('stateReset', discard);
                }
            });

            utils.bindDblClickClear([inputFrom, inputTo]);
        })(sizeInputFromFilter, sizeInputToFilter);

        (function timeFilter(select, inputBox, inputFrom, inputTo) {
            var discard = function () {
                select.selectedIndex = 0;
                select.dispatchEvent(new CustomEvent('change', {detail: 'stateReset'}));
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

                if (!inputBoxTimeFilterVisible) {
                    filter.max = 0;
                    filter.min = parseInt(this.value) || 0;
                    if (filter.min) {
                        filter.min = parseInt(Date.now() / 1000) - filter.min;
                    }

                    if (filter.min > 0) {
                        resultFilter.add(filter);
                    } else {
                        resultFilter.remove(filter);
                    }
                } else {
                    resultFilter.remove(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset') {
                    ee.once('stateReset', discard);
                }
            });

            inputFrom.addEventListener('keyup', function(e) {
                filter.min = parseInt(this.value && this.dataset.time) || 0;

                if (filter.max && filter.min > filter.max) {
                    this.value = '';
                    filter.min = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    resultFilter.add(filter);
                } else {
                    resultFilter.remove(filter);
                }

                applyFilter();
            });

            inputTo.addEventListener('keyup', function(e) {
                filter.max = parseInt(this.value && this.dataset.time) || 0;

                if (filter.min && filter.max < filter.min) {
                    this.value = '';
                    filter.max = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    resultFilter.add(filter);
                } else {
                    resultFilter.remove(filter);
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

            setTimeout(function () {
                require(['./lib/jquery-3.1.1.min'], function () {
                    require(['./lib/jquery-ui.min'], function () {
                        initDataPicker(inputFrom, inputTo);
                    });
                });
            }, 50);
        })(selectTimeFilter, inputBoxTimeFilter, timeInputFromFilter, timeInputToFilter);

        (function seedFilter(inputFrom, inputTo) {
            var discard = function () {
                inputFrom.value = '';
                inputTo.value = '';
                inputFrom.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
                inputTo.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
            };

            var filter = {
                type: 'seed',
                min: 0,
                max: 0
            };

            inputFrom.addEventListener('keyup', function(e) {
                filter.min = parseInt(this.value);

                if (isNaN(filter.min) || filter.max && filter.min > filter.max) {
                    this.value = '';
                    filter.min = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    resultFilter.add(filter);
                } else {
                    resultFilter.remove(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset') {
                    ee.once('stateReset', discard);
                }
            });

            inputTo.addEventListener('keyup', function(e) {
                filter.max = parseInt(this.value);

                if (isNaN(filter.max) || filter.min && filter.max < filter.min) {
                    this.value = '';
                    filter.max = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    resultFilter.add(filter);
                } else {
                    resultFilter.remove(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset') {
                    ee.once('stateReset', discard);
                }
            });

            utils.bindDblClickClear([inputFrom, inputTo]);
        })(seedInputFromFilter, seedInputToFilter);

        (function peerFilter(inputFrom, inputTo) {
            var discard = function () {
                inputFrom.value = '';
                inputTo.value = '';
                inputFrom.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
                inputTo.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
            };

            var filter = {
                type: 'peer',
                min: 0,
                max: 0
            };

            inputFrom.addEventListener('keyup', function(e) {
                filter.min = parseInt(this.value);

                if (isNaN(filter.min) || filter.max && filter.min > filter.max) {
                    this.value = '';
                    filter.min = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    resultFilter.add(filter);
                } else {
                    resultFilter.remove(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset') {
                    ee.once('stateReset', discard);
                }
            });

            inputTo.addEventListener('keyup', function(e) {
                filter.max = parseInt(this.value);

                if (isNaN(filter.max) || filter.min && filter.max < filter.min) {
                    this.value = '';
                    filter.max = 0;
                }

                if (filter.min > 0 || filter.max > 0) {
                    resultFilter.add(filter);
                } else {
                    resultFilter.remove(filter);
                }

                applyFilter();

                if (e.detail !== 'stateReset') {
                    ee.once('stateReset', discard);
                }
            });

            utils.bindDblClickClear([inputFrom, inputTo]);
        })(peerInputFromFilter, peerInputToFilter);
    })(resultFilter);

    (function () {
        var manageProfile = document.querySelector('.button-manage-profile');
        var profileSelect = document.querySelector('.profile__select');
        var trackerList = document.querySelector('.tracker__list');
        var profileSelectWrapper = null;

        trackerList.addEventListener('click', function (e) {
            var child = dom.closestNode(this, e.target);
            if (child) {
                ee.trigger('selectTracker', [child.dataset.id]);
            }
        });

        var activeProfile = null;
        var currentProfileId = null;
        var trackers = {};
        var profiles = [];
        var profileIdProfileMap = {};
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
            var cloneProfiles = JSON.parse(JSON.stringify(profiles));
            var pm = new ProfileManager(cloneProfiles, trackers);
            pm.onProfilesSave = function () {
                ee.trigger('reloadProfiles');
            };
            pm.onProfileSave = function (_profile, trackers) {
                var profile = profileIdProfileMap[_profile.id];
                if (profile) {
                    for (var key in _profile) {
                        profile[key] = _profile[key];
                    }
                } else {
                    profiles.push(_profile);
                    profileIdProfileMap[_profile.id] = _profile;
                }
                chrome.storage.local.set({
                    profiles: profiles
                }, function () {
                    ee.trigger('reloadProfile');
                });
            };
            pm.show();
        });

        profileSelectWrapper = new selectBox(profileSelect, {
            editBtn: manageProfile
        });

        var loadProfiles = function () {
            chrome.storage.local.get({
                currentProfileId: null,
                profiles: [],
                trackers: {}
            }, function (storage) {
                currentProfileId = storage.currentProfileId;
                trackers = storage.trackers;
                profiles = storage.profiles;
                if (profiles.length === 0) {
                    profiles.push(ProfileManager.prototype.getDefaultProfile(profileIdProfileMap));
                }

                profileSelect.textContent = '';
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

                activeProfile = new Profile(profileIdProfileMap[currentProfileId], trackers, resultFilter, trackerList, ee);
            });
        };

        ee.on('reloadProfiles', function () {
            loadProfiles();
        });

        loadProfiles();
    })();
});