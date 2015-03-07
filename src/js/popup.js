/**
 * Created by Anton on 01.03.2015.
 */
var popup = {
    domCache: {
        searchForm: document.getElementById('searchForm'),
        requestInput: document.getElementById('requestInput'),
        cleanBtn: document.getElementById('cleanBtn'),
        searchBtn: document.getElementById('searchBtn')
    },
    once: function() {
        "use strict";
        mono.writeLanguage(mono.language);

        popup.domCache.addEventListener('click', function() {
            popup.domCache.requestInput.value = "";
            popup.domCache.requestInput.d
        });

        popup.domCache.searchForm.addEventListener('input', function() {
            if (this.value.length > 0) {
                popup.domCache.classList.remove('hide');
            } else {
                popup.domCache.classList.add('hide');
            }
        });
    },
    onUiReady: function() {
        "use strict";

    }
};

var define = function(name, func) {
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