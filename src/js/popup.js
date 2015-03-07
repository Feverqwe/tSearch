/**
 * Created by Anton on 01.03.2015.
 */
var popup = {
    varCache: {
        history: [],
        suggestXhr: undefined
    },
    domCache: {
        searchForm: document.getElementById('searchForm'),
        requestInput: document.getElementById('requestInput'),
        clearBtn: document.getElementById('clearBtn'),
        searchBtn: document.getElementById('searchBtn')
    },
    once: function() {
        "use strict";
        mono.writeLanguage(mono.language);

        popup.domCache.requestInput.focus();

        popup.domCache.clearBtn.addEventListener('click', function() {
            popup.domCache.requestInput.value = '';
            popup.domCache.requestInput.dispatchEvent(new CustomEvent('input'));
            popup.domCache.requestInput.focus();
        });

        popup.domCache.requestInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                popup.domCache.clearBtn.classList.add('show');
            } else {
                popup.domCache.clearBtn.classList.remove('show');
            }
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
            list.push(item.title);
        }
        return list;
    },
    onUiReady: function() {
        "use strict";
        $(popup.domCache.requestInput).autocomplete({
            minLength: 0,
            position: {
                collision: "bottom"
            },
            appendTo: popup.domCache.searchForm,
            source: function(request, cb) {
                var value = request.term;
                if (value.length === 0) {
                    return cb(popup.getHistory());
                }
                if (popup.varCache.suggestXhr) {
                    popup.varCache.suggestXhr.abort();
                }
                popup.varCache.suggestXhr = mono.ajax({
                    url: 'http://suggestqueries.google.com/complete/search?client=firefox&q=' + encodeURIComponent(value),
                    dataType: 'json',
                    success: function(data) {
                        cb(data[1]);
                    }
                });
            },
            select: function() {
                popup.domCache.searchBtn.dispatchEvent(new CustomEvent('click'));
            },
            close: function() {
                console.log(document.body.clientHeight);
                // TODO: fox me!
                return;
                if (mono.isFF) {
                    mono.sendMessage({action: 'resize', height: 70}, undefined, "service");
                }
                if (mono.isOpera) {
                    mono.sendMessage({action: 'resize', height: 70});
                    dom_cache.search_input.focus();
                    setTimeout(function() {
                        dom_cache.search_input.focus();
                    }, 100);
                }
                if (mono.isMaxthon) {
                    var rt = window.external.mxGetRuntime();
                    var aa = rt.getActionByName("Torrents MultiSearch");
                    aa.resize(642, 70);
                }
                if (mono.isSafari) {
                    safari.extension.popovers[0].height = 70;
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
        }).data('ui-autocomplete')._resizeMenu = function() {
            // TODO: fix me!
            console.log(document.body.clientHeight);
        };
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
        mono.storage.get('history', function(storage) {
            popup.varCache.history = storage.history || [];
            popup.onUiReady();
        });
    }
};
define.amd = {};

mono.storage.get(['autoComplite', 'langCode'], function(storage) {
    "use strict";
    mono.getLanguage(function() {
        if (!storage.hasOwnProperty('autoComplite')) {
            storage.autoComplite = 1;
        }
        popup.once();

        if (storage.autoComplite) {
            document.body.appendChild(mono.create('script', {src: 'js/jquery-2.1.3.min.js'}));
        }
    }, storage.langCode);
});