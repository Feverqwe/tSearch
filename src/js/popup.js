/**
 * Created by Anton on 01.03.2015.
 */
var popup = {
    run: function(state) {
        "use strict";
        mono.writeLanguage(mono.language);
    }
};

var define = function(name) {
    if (name === 'jquery') {
        document.body.appendChild(mono.create('script', {src: 'js/jquery-ui.min.js'}));
    }
};
define.amd = {};

mono.storage.get(['autoComplite', 'langCode'], function(storage) {
    "use strict";
    mono.getLanguage(function() {
        if (!storage.hasOwnProperty('autoComplite')) {
            storage.autoComplite = 1;
        }

        popup.run();

        if (storage.autoComplite) {
            document.body.appendChild(mono.create('script', {src: 'js/jquery-2.1.3.min.js'}));
        }
    }, storage.langCode);
});