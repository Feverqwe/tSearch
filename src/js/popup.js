/**
 * Created by Anton on 01.03.2015.
 */
var popup = {
    varCache: {
        history: [],
        suggestXhr: undefined,
        autocompleteCache: {},
        autocompleteLastFocus: ''
    },
    domCache: {
        searchForm: document.getElementById('search_form'),
        requestInput: document.getElementById('request_input'),
        clearBtn: document.getElementById('clear_btn'),
        searchBtn: document.getElementById('search_btn')
    },
    once: function() {
        "use strict";
        mono.writeLanguage(mono.language);

        document.body.classList.remove('loading');

        popup.domCache.requestInput.focus();

        window.addEventListener('resize', function(e) {
            var height = !mono.isSafari ? document.body.scrollHeight : document.body.clientHeight;
            if (height < 72) {
                height = 72;
            }
            mono.resizePopup(650, height);
            if (mono.isOpera) {
                setTimeout(function() {
                    popup.domCache.requestInput.focus();
                }, 100);
            }
        });

        popup.domCache.clearBtn.addEventListener('click', function() {
            popup.domCache.requestInput.value = '';
            popup.domCache.requestInput.dispatchEvent(new CustomEvent('keyup'));
            popup.domCache.requestInput.focus();
        });

        popup.domCache.requestInput.addEventListener('keyup', function() {
            if (this.value.length > 0) {
                popup.domCache.clearBtn.classList.add('show');
            } else {
                popup.domCache.clearBtn.classList.remove('show');
            }
        });

        popup.domCache.requestInput.addEventListener('keypress', function(e) {
            if (e.keyCode === 13) {
                popup.domCache.searchBtn.dispatchEvent(new CustomEvent('click', {cancelable: true}));
            }
        });

        popup.domCache.searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var request = popup.domCache.requestInput.value.trim();
            if (typeof e.detail === 'string' && e.detail) {
                request = e.detail.trim();
            }
            if (request) {
                request = '#?' + mono.hashParam({
                    search: request
                });
            }
            var url = 'index.html' + request;
            mono.openTab(url);
            if (mono.isFF || mono.isSafari) {
                mono.closePopup();
            }
            popup.domCache.clearBtn.dispatchEvent(new CustomEvent('click'));
        });
    },
    getHistory: function() {
        "use strict";
        var history = popup.varCache.history;
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
    onUiReady: function() {
        "use strict";
        (popup.domCache.$requestInput = $(popup.domCache.requestInput)).autocomplete({
            minLength: 0,
            delay: 100,
            position: {
                collision: "bottom"
            },
            appendTo: popup.domCache.searchForm,
            source: function(request, cb) {
                var value = request.term;
                if (value.length === 0) {
                    return cb(popup.getHistory());
                }
                if (!popup.varCache.autoComplite) {
                    return cb();
                }
                if (popup.varCache.suggestXhr) {
                    popup.varCache.suggestXhr.abort();
                }
                if (popup.varCache.autocompleteCache[value] !== undefined) {
                    return cb(popup.varCache.autocompleteCache[value]);
                }
                popup.varCache.suggestXhr = mono.ajax({
                    url: 'http://suggestqueries.google.com/complete/search?client=firefox&q=' + encodeURIComponent(value),
                    dataType: 'json',
                    success: function(data) {
                        popup.varCache.autocompleteCache[value] = data[1];
                        cb(data[1]);
                    }
                });
            },
            focus: function() {
                popup.varCache.autocompleteLastFocus = arguments[1].item.value;
            },
            select: function() {
                arguments[1].item.value = popup.varCache.autocompleteLastFocus;
                popup.domCache.searchBtn.dispatchEvent(new CustomEvent('click', {cancelable: true, detail: arguments[1].item.value}));
            },
            close: function() {
                window.dispatchEvent(new CustomEvent('resize'));
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
        }).data('ui-autocomplete')._resizeMenu = function() {
            window.dispatchEvent(new CustomEvent('resize'));
        };
        popup.domCache.requestInput.addEventListener('keyup', function() {
            popup.varCache.autocompleteLastFocus = this.value;
        });
    },
    update: function() {
        "use strict";
        mono.storage.get(['langCode', 'searchHistory'], function(storage) {
            if (Array.isArray(storage.searchHistory)) {
                popup.varCache.history = storage.searchHistory;
            }
            if (storage.hasOwnProperty('langCode') && storage.langCode !== mono.language.langCode) {
                mono.getLanguage(function () {
                    mono.writeLanguage(mono.language);
                }, storage.langCode);
            }
        });
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
        popup.onUiReady();
    }
};
define.amd = {};

mono.onMessage(function(msg) {
    "use strict";
    if (msg.action === 'empty') {
        popup.domCache.$requestInput.autocomplete('close');
        popup.domCache.clearBtn.dispatchEvent(new CustomEvent('click'));
        popup.update();
    } else
    if (msg.action === 'reload') {
        document.location.reload();
    }
});


mono.storage.get(['autoComplite', 'langCode', 'searchHistory'], function(storage) {
    "use strict";
    if (Array.isArray(storage.searchHistory)) {
        popup.varCache.history = storage.searchHistory;
    }
    mono.getLanguage(function () {
        popup.once();
        if (!storage.hasOwnProperty('autoComplite')) {
            storage.autoComplite = 1;
        }

        popup.varCache.autoComplite = storage.autoComplite;

        document.body.appendChild(mono.create('script', {src: 'js/jquery-2.1.4.min.js'}));
    }, storage.langCode);
});