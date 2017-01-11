/**
 * Created by Anton on 31.12.2016.
 */
"use strict";
require.config({
    baseUrl: './js',
    paths: {
        jquery: './lib/jquery-3.1.1.min',
        jqueryUi: './lib/jquery-ui.min',
        moment: './lib/moment-with-locales.min'
    }
});
require([
    './lib/promise.min',
    './module/i18nDom',
    './module/utils',
    './module/dom',
    './module/selectBox',
    './lib/EventEmitter.min',
    './module/profileManager',
    './module/resultFilter',
    './module/profileController',
    './module/pageController',
    './module/explore'
], function (Promise, i18nDom, utils, dom, selectBox, EventEmitter, ProfileManager, ResultFilter, ProfileController, PageController, Explore) {
    new Promise(function (resolve) {
        i18nDom();
        chrome.storage.local.get({
            trackerListHeight: 200,
            currentProfileId: null,
            hidePeerRow: false,
            hideSeedRow: false,
            categoryWordFilter: true,
            profiles: [],
            trackers: {},
            history: [],
            sortCells: [],
            checkUpdateTime: 0,

            eSections: [],
            kpFolderId: '1',
            enableFavoriteSync: true,
            originalPosterName: false,
            syncProfiles: true
        }, function (storage) {
            if (storage.syncProfiles) {
                chrome.storage.sync.get('profiles', function (syncStorage) {
                    if (syncStorage.profiles) {
                        storage.profiles = syncStorage.profiles;
                    }
                    resolve(storage);
                });
            } else {
                resolve(storage);
            }
        });
    }).then(function (storage) {
        document.body.classList.remove('loading');

        var ee = new EventEmitter();

        var pageController = new PageController();
        (function (pageController) {
            var getTitle = function () {
                var title;
                var query = pageController.get('query');
                if (typeof query === 'string') {
                    title = JSON.stringify(query) + ' :: TMS';
                } else {
                    title = 'Torrents MultiSearch';
                }
                return title;
            };
            pageController.applyUrl = function () {
                var self = pageController;
                var title = document.title = getTitle();

                var profileId = self.get('profileId');
                ee.trigger('selectProfileById', [profileId]);

                var query = self.get('query');
                if (typeof query === 'string') {
                    ee.trigger('setSearchQuery', [query]);
                    ee.trigger('search', [query]);
                } else {
                    ee.trigger('stateReset');
                }

                var url = self.getUrl();

                history.replaceState(null, title, url);
            };
        })(pageController);

        (function () {
            var exploreNode = document.querySelector('.explore');
            var explore = new Explore(storage, exploreNode);
            ee.on('stateReset', function () {
                explore.show();
            });
            ee.on('search', function () {
                explore.hide();
            });
        })();

        (function () {
            var searchInput = document.querySelector('.input__input-search');
            var searchClear = document.querySelector('.input__clear-search');
            var searchSubmit = document.querySelector('.search__submit');

            ee.on('setSearchQuery', function (query) {
                searchInput.value = query;
                searchInput.dispatchEvent(new CustomEvent('keyup'));
            });

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

            (function (submit, input) {
                submit.addEventListener('click', function(e) {
                    e.preventDefault();
                    var query = '';
                    if (e.detail && e.detail.query) {
                        query = e.detail.query;
                    } else {
                        query = input.value;
                    }
                    query = query.trim();
                    pageController
                        .set('profileId', profileController.profile.id)
                        .set('query', query)
                        .go();
                });
            })(searchSubmit, searchInput);

            var initAutoComplete = function (input, submit) {
                var lastHistoryRequest = null;
                var historySuggests = (function () {
                    var history = null;
                    var initHistory = function (cb) {
                        setTimeout(function () {
                            cb(history = storage.history);
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

                var $input = $(input);

                searchSubmit.addEventListener('click', function () {
                    $input.autocomplete('close');
                    $input.autocomplete('disable');
                    setTimeout(function() {
                        $input.autocomplete('enable');
                    }, 1000);
                });

                $input.autocomplete({
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
                        e.preventDefault();
                        submit.dispatchEvent(new CustomEvent('click', {cancelable: true, detail: {query: input.value}}));
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
                require(['jquery'], function () {
                    require(['jqueryUi'], function () {
                        initAutoComplete(searchInput, searchSubmit);
                    });
                });
            }, 50);
        })();

        (function () {
            var main = document.querySelector('.menu__btn-main');
            main.addEventListener('click', function (e) {
                e.preventDefault();
                pageController
                    .clear()
                    .go();
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

        var resultFilter = new ResultFilter(ee);

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
                    require(['jquery'], function () {
                        require(['jqueryUi'], function () {
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

                if (storage.hideSeedRow) {
                    dom.closest('.parameter-filter', inputFrom).style.display = 'none';
                }

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

                if (storage.hidePeerRow) {
                    dom.closest('.parameter-filter', inputFrom).style.display = 'none';
                }

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

        var profileController = new ProfileController(storage, ee, ProfileManager, resultFilter, storage.syncProfiles);

        (function (profileController) {
            var manageProfile = document.querySelector('.button-manage-profile');
            var profileSelect = document.querySelector('.profile__select');
            var trackerList = document.querySelector('.tracker__list');
            var profileSelectWrapper = null;

            trackerList.parentNode.style.height = storage.trackerListHeight + 'px';
            trackerList.style.height = storage.trackerListHeight  + 'px';

            manageProfile.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var pm = new ProfileManager(utils.clone(storage.profiles), profileController, utils.clone(storage.trackers), ee);
                pm.show();
            });

            profileSelectWrapper = new selectBox(profileSelect, {
                editBtn: manageProfile
            });

            trackerList.addEventListener('click', function (e) {
                e.preventDefault();
                var child = dom.closest('a', e.target);
                if (child) {
                    if (child.dataset.id) {
                        ee.trigger('selectTracker', [child.dataset.id]);
                    }
                }
            });

            profileSelect.addEventListener('change', function () {
                var id = profileController.getProfileById(this.value).id;
                chrome.storage.local.set({
                    currentProfileId: storage.currentProfileId = id
                }, function () {
                    ee.trigger('selectProfileById', [id]);
                });
            });

            profileController.setSelectOptions = function (profiles) {
                profileSelect.textContent = '';
                dom.el(profileSelect, {
                    append: profiles.map(function (/**profile*/item) {
                        return dom.el('option', {
                            text: item.name,
                            value: item.id
                        });
                    })
                });
                profileSelectWrapper.update();
            };

            profileController.setSelectValue = function (profiles, id) {
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
                profileSelectWrapper.syncSelectedIndex();
            };

            profileController.setTrackerList = function (trackersNode) {
                trackerList.textContent = '';
                trackerList.appendChild(trackersNode);
            };

            profileController.load();

            var initResizable = function () {
                $(trackerList.parentNode).resizable({
                    minHeight: 56,
                    handles: 's',
                    alsoResize: trackerList,
                    stop: function(e, ui) {
                        chrome.storage.local.set({
                            trackerListHeight: ui.size.height
                        });
                    }
                });
            };

            setTimeout(function () {
                require(['jquery'], function () {
                    require(['jqueryUi'], function () {
                        initResizable();
                    });
                });
            }, 50);
        })(profileController);

        (function () {
            var now = parseInt(Date.now() / 1000);
            if (now - storage.checkUpdateTime > 24 * 60 * 60) {
                chrome.runtime.sendMessage({action: 'update'}, function (result) {
                    console.debug('Update', result);
                    result.success && chrome.storage.local.set({
                        checkUpdateTime: storage.checkUpdateTime = now
                    });
                });
            }

            chrome.storage.onChanged.addListener(function(changes, areaName) {
                var history = storage.history;
                var changeHistory = changes.history;
                if (changeHistory) {
                    var newHistory = changeHistory.newValue;
                    history.splice(0);
                    history.push.apply(history, newHistory);
                }

                var trackers = storage.trackers;
                var changeTrackers = changes.trackers;
                if (changeTrackers) {
                    var newTrackers = changeTrackers.newValue;
                    var diff = utils.getDiffObj(trackers, newTrackers);

                    diff.removed.forEach(function (id) {
                        delete trackers[id];
                        // console.debug('trackerRemoved', id);
                        ee.trigger('trackerRemoved', [id]);
                    });

                    diff.modified.forEach(function (id) {
                        var oldTracker = trackers[id];
                        var newTracker = newTrackers[id];
                        var diff = utils.getDiffObj(oldTracker, newTracker);

                        diff.modified.forEach(function (key) {
                            oldTracker[key] = newTracker[key];
                        });

                        if (diff.modified.length) {
                            // console.debug('trackerChange', id, diff.modified);
                            ee.trigger('trackerChange', [id, diff.modified]);
                        }
                    });

                    diff.new.forEach(function (id) {
                        trackers[id] = newTrackers[id];
                        // console.debug('trackerInsert', id);
                        ee.trigger('trackerInsert', [id]);
                    });
                }

                var profiles = storage.profiles;
                var changeProfiles = changes.profiles;
                if (changeProfiles) {
                    var newProfiles = changeProfiles.newValue;

                    var oldProfileIds = profiles.map(function (item) {
                        return item.id;
                    });

                    var newProfileIds = newProfiles.map(function (item) {
                        return item.id;
                    });

                    oldProfileIds.slice(0).forEach(function (oldStaticItem, oldPos) {
                        var newPos = newProfileIds.indexOf(oldStaticItem);
                        if (newPos === -1) {
                            oldProfileIds.splice(oldPos, 1);
                            var profile = profiles.splice(oldPos, 1)[0];
                            // console.debug('profileRemoved', profile.id);
                            ee.trigger('profileRemoved', [profile.id]);
                        }
                    });

                    newProfileIds.forEach(function (newStaticItem, newPos) {
                        var newItem = newProfiles[newPos];
                        var oldPos = oldProfileIds.indexOf(newStaticItem);
                        if (oldPos === -1) {
                            oldProfileIds.splice(newPos, 1, newStaticItem);
                            profiles.splice(newPos, 1, newItem);
                            // console.debug('profileInsert', newItem.id);
                            ee.trigger('profileInsert', [newItem.id]);
                        } else
                        if (oldPos !== newPos) {
                            oldProfileIds.splice(oldPos, 1);
                            oldProfileIds.splice(newPos, 0, newStaticItem);
                            profiles.splice(oldPos, 1);
                            profiles.splice(newPos, 0, newItem);
                            // console.debug('profilesSortChange');
                            ee.trigger('profilesSortChange');
                        }
                    });

                    profiles.forEach(function (profile, index) {
                        var newProfile = newProfiles[index];
                        var diff = utils.getDiffObj(profile, newProfile);
                        diff.modified.forEach(function (key) {
                            profile[key] = newProfile[key];
                        });
                        if (diff.modified.length) {
                            // console.debug('profileFieldChange', profile.id, diff.modified);
                            ee.trigger('profileFieldChange', [profile.id, diff.modified]);
                        }
                    });
                }
            });
        })();

        pageController.applyUrl();
    });
});