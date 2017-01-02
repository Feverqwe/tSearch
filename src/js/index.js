/**
 * Created by Anton on 31.12.2016.
 */
"use strict";
require.config({
    baseUrl: './js'
});
require(['./min/promise.min', './lib/i18nDom', './lib/utils', './lib/dom', './lib/selectBox'], function (Promise, i18nDom, utils, dom, selectBox) {
    i18nDom();

    document.body.classList.remove('loading');

    var uiState = [];

    var bindClearBtn = function (clear, input, details) {
        details = details || {};
        var clearIsVisible = false;
        input.addEventListener('keyup', function() {
            if (this.value.length > 0) {
                if (!clearIsVisible) {
                    clearIsVisible = true;
                    clear.classList.add('input__clear_visible');
                }
            } else {
                if (clearIsVisible) {
                    clearIsVisible = false;
                    clear.classList.remove('input__clear_visible');
                }
            }
        });

        clear.addEventListener('click', function (e) {
            e.preventDefault();
            input.value = '';
            input.dispatchEvent(new CustomEvent('keyup'));
            input.focus();
        });
    };

    var bindDblClickClear = function (nodeList) {
        if (!Array.isArray(nodeList)) {
            nodeList = [nodeList];
        }
        nodeList.forEach(function (node) {
            node.addEventListener('dblclick', function() {
                this.value = '';
            });
        });
    };

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

        bindClearBtn(searchClear, searchInput);

        (function (submit) {
            submit.addEventListener('click', function(e) {
                e.preventDefault();
                var query = '';
                if (e.detail && e.detail.query) {
                    query = e.detail.query;
                } else {
                    query = searchInput.value;
                }
                query = query.trim();
                if (query) {
                    query = '#?' + utils.hashParam({
                            query: query
                        });
                }
                var url = 'index.html' + query;
                chrome.tabs.create({url: url});
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

        (function wordFilter(input, clearWordFilter) {
            var stateItem = {
                id: 'wordFilter',
                discard: function () {
                    input.value = '';
                    input.dispatchEvent(new CustomEvent('keyup', {detail: 'stateReset'}));
                }
            };

            bindClearBtn(clearWordFilter, input);

            input.addEventListener('keyup', function(e) {
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

            inputFrom.addEventListener('keyup', function(e) {
                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            inputTo.addEventListener('keyup', function(e) {
                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            bindDblClickClear([inputFrom, inputTo]);
        })(sizeInputFromFilter, sizeInputToFilter);

        (function timeFilter(select, inputBox, inputFrom, inputTo) {
            var stateItem = {
                id: 'timeFilter',
                discard: function () {
                    select.selectedIndex = 0;
                    select.dispatchEvent(new CustomEvent('change', {detail: 'stateReset'}));
                }
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
                    // apply time template filters
                }

                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            inputFrom.addEventListener('keyup', function(e) {

            });

            inputTo.addEventListener('keyup', function(e) {

            });

            bindDblClickClear([inputFrom, inputTo]);
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

            inputFrom.addEventListener('keyup', function(e) {
                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            inputTo.addEventListener('keyup', function(e) {
                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            bindDblClickClear([inputFrom, inputTo]);
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

            inputFrom.addEventListener('keyup', function(e) {
                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            inputTo.addEventListener('keyup', function(e) {
                if (e.detail !== 'stateReset' && uiState.indexOf(stateItem) === -1) {
                    uiState.push(stateItem);
                }
            });

            bindDblClickClear([inputFrom, inputTo]);
        })(peerInputFromFilter, peerInputToFilter);
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

    (function () {
        var manageProfile = document.querySelector('.button-manage-profile');
        var profileSelect = document.querySelector('.profile__select');
        var profileSelectWrapper = null;

        var profile = null;
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
                trackers: [
                    {id: 'rutracker'},
                    {id: 'nnmclub'},
                    {id: 'kinozal'},
                    {id: 'tapochek'},
                    {id: 'rutor'}
                ]
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
         * @property {string} meta.connect
         * @property {Object} info
         * @property {number} info.lastUpdate
         * @property {string} code
         */

        var Transport = function (transport) {
            var emptyFn = function () {};
            var onceFn = function (cb, scope) {
                return function () {
                    if (cb) {
                        var context = scope || this;
                        cb.apply(context, arguments);
                        cb = null;
                    }
                };
            };

            var callbackId = 0;
            var callbackIdCallback = {};

            this.onMessage = function (cb) {
                transport.onMessage(function (msg) {
                    if (msg.responseId) {
                        return callbackIdCallback[msg.responseId](msg.message);
                    }

                    var response;
                    if (msg.callbackId) {
                        response = onceFn(function (message) {
                            transport.sendMessage({
                                responseId: msg.callbackId,
                                message: message
                            });
                        });
                    } else {
                        response = emptyFn;
                    }
                    var result = cb(msg.message, response);
                    if (result !== true) {
                        response();
                    }
                });
            };
            this.sendMessage = function (message, callback) {
                var msg = {
                    message: message
                };
                if (callback) {
                    msg.callbackId = ++callbackId;
                    callbackIdCallback[msg.callbackId] = function (message) {
                        delete callbackIdCallback[msg.callbackId];
                        callback(message);
                    };
                }
                transport.sendMessage(msg);
            };
        };
        var FrameWorker = function () {
            var self = this;
            var stack = [];
            var frame = null;
            var contentWindow = null;

            var load = function () {
                frame = document.createElement('iframe');
                frame.src = 'sandbox.html';
                frame.style.display = 'none';
                frame.onload = function () {
                    contentWindow = frame.contentWindow;
                    while (stack.length) {
                        self.postMessage(stack.shift());
                    }
                };
                document.body.appendChild(frame);
            };

            this.postMessage = function (msg) {
                if (contentWindow) {
                    contentWindow.postMessage(msg, '*');
                } else {
                    stack.push(msg);
                }
            };

            var msgListener = function(event) {
                if (event.source === contentWindow) {
                    if (self.onmessage) {
                        self.onmessage(event.data);
                    }
                }
            };
            window.addEventListener("message", msgListener);

            this.onmessage = null;
            this.terminate = function () {
                frame.parentNode.removeChild(frame);
                window.removeEventListener("message", msgListener);
                self.onmessage = null;
            };

            load();
        };
        var Profile = function (profile) {
            var Tracker = function (/**tracker*/tracker) {
                var worker = null;
                var transport = null;
                var load = function () {
                    worker = new FrameWorker();
                    transport = new Transport({
                        sendMessage: function (msg) {
                            worker.postMessage(msg);
                        },
                        onMessage: function (cb) {
                            worker.onmessage = function (data) {
                                cb(data);
                            }
                        }
                    });
                    transport.onMessage(function (msg, response) {
                        if (msg.action === 'init') {
                            response(tracker.code);
                        } else {
                            console.error('msg', tracker.id, msg);
                        }
                    });
                };
                this.sendMessage = function (message) {
                    transport.sendMessage(message);
                };
                this.reload = function () {
                    worker.terminate();
                    load();
                };
                this.destroy = function () {
                    worker.terminate();
                };
                load();
            };
            var workers = [];
            profile.trackers.forEach(function (/**profileTracker*/item) {
                var tracker = trackers[item.id] || {
                    id: item.id,
                    code: '(' + function () {
                    }.toString() + ')();'
                };
                if (tracker) {
                    workers.push(new Tracker(tracker));
                }
            });
            this.destroy = function () {
                workers.forEach(function (myWorker) {
                    myWorker.destroy();
                })
            };
        };

        manageProfile.addEventListener('click', function (e) {
            e.preventDefault();
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

            if (profile) {
                profile.destroy();
            }
            profile = new Profile(profileIdProfileMap[currentProfileId]);
        });
    })();

    window.resetState = function () {
        uiState.splice(0).forEach(function (state) {
            state.discard();
        });
        if (uiState.length > 0) {
            console.error('State is not empty!', uiState);
        }
    };
});