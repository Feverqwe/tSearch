/**
 * Created by Anton on 31.12.2016.
 */
"use strict";
require.config({
    baseUrl: './js'
});
require([
    './lib/promise.min',
    './module/i18nDom',
    './module/utils',
    './module/dom'
], function (Promise, i18nDom, utils, dom) {
    new Promise(function (resolve) {
        i18nDom();
        chrome.storage.local.get({
            hidePeerRow: false,
            hideSeedRow: false,
            categoryWordFilter: true,
            contextMenu: true,
            disablePopup: false,
            invertIcon: false
        }, resolve);
    }).then(function (storage) {
        document.body.classList.remove('loading');

        var Page = function (type) {
            var self = this;
            var basePage = function () {
                var options = {
                    hidePeerRow: 'boolean',
                    hideSeedRow: 'boolean',
                    categoryWordFilter: 'boolean',
                    contextMenu: 'boolean',
                    disablePopup: 'boolean',
                    invertIcon: 'boolean'
                };
                Object.keys(options).forEach(function (option) {
                    var type = options[option];
                    if (type === 'boolean') {
                        return dom.el('input', {
                            type: 'checkbox',

                        })
                    }
                });
            };
            var content = [];
            if (type === 'base') {
                content = basePage();
            }
            this.node = dom.el('div', {
                class: ['options__page', 'page-' + type],
                append: content
            });
            this.destroy = function () {

            };
        };

        (function () {
            var activePage = null;
            var options = document.querySelector('.options');
            var activeItem = document.querySelector('.sections .item-active');

            var sections = document.querySelector('.sections');
            sections.addEventListener('click', function(e) {
                var link = dom.closest('a', e.target);
                if (link) {
                    e.preventDefault();

                    activePage && activePage.classList.remove('page-visible');
                    activeItem.classList.remove('item-active');
                    activeItem = link;
                    link.classList.add('item-active');

                    var type = link.dataset.page;
                    var page = document.querySelector('.page.page-' + type);
                    page.classList.add('page-visible');
                    activePage = page;
                }
            });

            activeItem.dispatchEvent(new MouseEvent('click', {
                cancelable: true,
                bubbles: true
            }));
        })();

        (function () {
            var bgReload = function () {
                chrome.runtime.sendMessage({action: 'reload'});
            };
            var onChangeOption = {
                contextMenu: bgReload,
                disablePopup: bgReload,
                invertIcon: bgReload
            };
            [].slice.call(document.querySelectorAll('[data-option]')).forEach(function (node) {
                var option = node.dataset.option;
                node.checked = !!storage[option];
                node.addEventListener('click', function () {
                    var _storage = {};
                    if (node.type === 'checkbox') {
                        _storage[option] = storage[option] = !!node.checked;
                    }
                    chrome.storage.local.set(_storage, function () {
                        var onChange = onChangeOption[option];
                        onChange && onChange();
                    });
                });
            });
        })();
    });
});