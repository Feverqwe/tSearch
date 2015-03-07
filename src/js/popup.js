/**
 * Created by Anton on 01.03.2015.
 */
var popup = {
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