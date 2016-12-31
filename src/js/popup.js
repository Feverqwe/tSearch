/**
 * Created by Anton on 31.12.2016.
 */
"use strict";
require(['./js/lib/i18nDom', './js/lib/utils'], function (i18nDom, utils) {
    i18nDom();

    var input =  document.querySelector('.input__input');
    var clear =  document.querySelector('.input__clear');
    var submit =  document.querySelector('.search__submit');

    (function () {
        input.addEventListener('keyup', function() {
            if (this.value.length > 0) {
                clear.classList.add('input__clear_visible');
            } else {
                clear.classList.remove('input__clear_visible');
            }
        });

        input.addEventListener('keypress', function(e) {
            if (e.keyCode === 13) {
                submit.dispatchEvent(new MouseEvent('click', {cancelable: true}));
            }
        });
    })();

    (function () {
        clear.addEventListener('click', function (e) {
            e.preventDefault();
            input.value = '';
            input.dispatchEvent(new CustomEvent('keyup'));
            input.focus();
        });
    })();

    (function () {
        submit.addEventListener('click', function(e) {
            e.preventDefault();
            var query = '';
            if (e.detail && e.detail.query) {
                query = e.detail.query;
            } else {
                query = input.value;
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
    })();

    document.body.classList.remove('loading');
    document.querySelector('*[autofocus]').focus();

    var loadAutoComplete = function () {
        require(['./js/min/jquery-3.1.1.min'], function () {
            require(['./js/min/jquery-ui.min'], function () {
                var historySuggests = (function () {
                    var history = null;
                    var initHistory = function (cb) {
                        chrome.storage.local.get({
                            history: []
                        }, function (storage) {
                            history = storage.history;
                            cb();
                        });
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
                            initHistory(function () {
                                onGetHistory(term, cb);
                            });
                        } else {
                            onGetHistory(term, cb);
                        }
                    };
                })();

                var webSuggests = (function () {
                    var cache = {};
                    var lastRequest = null;
                    var onGetSuggests = function (term, suggests, cb) {
                        cache[term] = suggests;
                        cb(suggests);
                    };
                    return function (term, cb) {
                        if (lastRequest) {
                            lastRequest.abort();
                            lastRequest = null;
                        }

                        var _cache = cache[term];
                        if (_cache) {
                            onGetSuggests(term, _cache, cb);
                        } else {
                            lastRequest = utils.request({
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
            });
        });
    };
    setTimeout(function () {
        loadAutoComplete();
    }, 50);
});