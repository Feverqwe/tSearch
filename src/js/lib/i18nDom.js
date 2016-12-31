/**
 * Created by Anton on 31.12.2016.
 */
define(function () {
    "use strict";
    return function () {
        var map = {
            text: 'textContent'
        };
        [].slice.call(document.querySelectorAll('*[data-i18n]')).map(function (node) {
            return {
                node: node,
                details: JSON.parse(node.dataset.i18n)
            };
        }).forEach(function (item) {
            var node = item.node;
            var details = item.details;
            var key, value;
            for (key in details) {
                value = details[key];
                key = map[key] || key;
                node[key] = chrome.i18n.getMessage(value) || node[key];
            }
        });
    };
});