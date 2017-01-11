/**
 * Created by Anton on 31.12.2016.
 */
"use strict";
require.config({
    baseUrl: './js',
    paths: {
        promise: './lib/promise.min'
    }
});
require([
    'promise',
    './module/i18nDom',
    './module/dom',
    './module/utils',
    './lib/moment-with-locales.min',
    './module/highlight'
], function (Promise, i18nDom, dom, utils, moment, highlight) {
    new Promise(function (resolve) {
        moment.locale(chrome.i18n.getUILanguage());
        i18nDom();
        chrome.storage.local.get({
            history: [],
            clickHistory: []
        }, resolve);
    }).then(function (storage) {
        document.body.classList.remove('loading');

        (function (history, clickHistory) {
            var cloneHistory = history.slice(0);

            var queryClickHistoryItemMap = {};
            clickHistory.forEach(function (/**clickHistoryItem*/clickHistoryItem) {
                var query = clickHistoryItem.query.trim();
                if (!queryClickHistoryItemMap[query]) {
                    queryClickHistoryItemMap[query] = [];
                }
                queryClickHistoryItemMap[query].push(clickHistoryItem);
            });

            dom.el(document.querySelector('.history'), {
                append: cloneHistory.map(function (/**historyItem*/historyItem, index) {
                    var query = historyItem.query;
                    var queryClickHistory = queryClickHistoryItemMap[query] || [];
                    var map = highlight.getMap(query);
                    return dom.el('div', {
                        class: ['history__item'],
                        append: [
                            dom.el('div', {
                                class: ['item', 'item-query'],
                                data: {
                                    index: index
                                },
                                append: [
                                    dom.el('a', {
                                        class: ['item__remove'],
                                        data: {
                                            action: 'remove-query'
                                        },
                                        href: '#remove',
                                        title: chrome.i18n.getMessage('remove')
                                    }),
                                    dom.el('a', {
                                        class: ['item__link'],
                                        href: 'index.html' + '#' + utils.hashParam({
                                            query: query,
                                            profileId: historyItem.profileId
                                        }),
                                        text: !query ? JSON.stringify(query) : query
                                    })
                                ]
                            }),
                            dom.el('div', {
                                class: ['click_history', 'item__click_history'],
                                append: queryClickHistory.map(function (/**clickHistoryItem*/item, index) {
                                    return dom.el('div', {
                                        class: ['item', 'item-click_history'],
                                        data: {
                                            index: index
                                        },
                                        append: [
                                            dom.el('a', {
                                                class: ['item__remove'],
                                                data: {
                                                    action: 'remove-click_history'
                                                },
                                                href: '#remove',
                                                title: chrome.i18n.getMessage('remove')
                                            }),
                                            dom.el('span', {
                                                class: ['item__date'],
                                                text: moment(item.time * 1000).format('lll')
                                            }),
                                            dom.el('a', {
                                                class: ['item__link'],
                                                target: '_blank',
                                                href: item.url,
                                                append: [
                                                    highlight.insert(item.title, map)
                                                ]
                                            })
                                        ]
                                    });
                                }),
                                on: ['click', function (e) {
                                    var link = dom.closest('a', e.target);
                                    if (link) {
                                        if (link.dataset.action === 'remove-click_history') {
                                            e.preventDefault();
                                            var node = link.parentNode;
                                            var item = queryClickHistory[node.dataset.index];
                                            var pos = clickHistory.indexOf(item);
                                            if (pos !== -1) {
                                                clickHistory.splice(pos, 1);
                                                chrome.storage.local.set({
                                                    clickHistory: clickHistory
                                                }, function () {
                                                    node.parentNode.removeChild(node);
                                                });
                                            }
                                        }
                                    }
                                }]
                            })
                        ]
                    });
                }),
                on: ['click', function (e) {
                    var link = dom.closest('a', e.target);
                    if (link) {
                        if (link.dataset.action === 'remove-query') {
                            e.preventDefault();
                            var node = link.parentNode;
                            var item = cloneHistory[node.dataset.index];
                            var pos = history.indexOf(item);
                            if (pos !== -1) {
                                history.splice(pos, 1);
                                chrome.storage.local.set({
                                    history: history
                                }, function () {
                                    var historyItem = node.parentNode;
                                    historyItem.parentNode.removeChild(historyItem);
                                });
                            }
                        }
                    }
                }]
            });
        })(storage.history, storage.clickHistory);
    });
});