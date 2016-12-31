/**
 * Created by Anton on 31.12.2016.
 */
define(function () {
    "use strict";
    return function () {
        var map = {
            text: 'textContent'
        };
        [].slice.call(document.querySelectorAll('*[data-i18n]')).forEach(function (node) {
            var details = JSON.parse(node.dataset.i18n);
            var key, value;
            for (key in details) {
                value = details[key];
                key = map[key] || key;
                node[key] = chrome.i18n.getMessage(value) || node[key];
            }
        });
    };
});