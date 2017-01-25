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
    './module/highlight',
    './module/counter'
], function (Promise, i18nDom, dom, utils, moment, highlight, counter) {
    new Promise(function (resolve) {
        moment.locale(chrome.i18n.getUILanguage());
        i18nDom();
        chrome.storage.local.get({
            history: [],
            clickHistory: []
        }, resolve);
    }).then(function (storage) {
        document.body.classList.remove('loading');

        var getEmptyItem = function () {
            return dom.el('div', {
                class: ['history_empty'],
                append: [
                    dom.el('span', {
                        text: chrome.i18n.getMessage('historyEmpty')
                    })
                ]
            });
        };

        var load = function (history, clickHistory) {
            var cloneHistory = history.slice(0);

            var queryClickHistoryItemMap = {};
            clickHistory.forEach(function (/**clickHistoryItem*/clickHistoryItem) {
                var query = clickHistoryItem.query.trim();
                if (!queryClickHistoryItemMap[query]) {
                    queryClickHistoryItemMap[query] = [];
                }
                queryClickHistoryItemMap[query].push(clickHistoryItem);
            });

            var historyNode = dom.el('div', {
                class: ['history']
            });
            if (!cloneHistory.length) {
                historyNode.appendChild(getEmptyItem());
            } else
            dom.el(historyNode, {
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
                    if (link && link.dataset.action === 'remove-query') {
                        e.preventDefault();
                        var node = link.parentNode;

                        var item = cloneHistory[node.dataset.index];
                        var pos = history.indexOf(item);
                        if (pos !== -1) {
                            history.splice(pos, 1);
                        }

                        var queryClickHistory = queryClickHistoryItemMap[item.query] || [];
                        queryClickHistory.forEach(function (item) {
                            var pos = clickHistory.indexOf(item);
                            if (pos !== -1) {
                                clickHistory.splice(pos, 1);
                            }
                        });

                        chrome.storage.local.set({
                            history: history,
                            clickHistory: clickHistory
                        }, function () {
                            var historyItemNode = node.parentNode;
                            var parent = historyItemNode.parentNode;
                            parent.removeChild(historyItemNode);
                            if (parent.childNodes.length === 0) {
                                parent.appendChild(getEmptyItem());
                            }
                        });
                    }
                }]
            });

            var previewHistoryNode = document.querySelector('.history');
            previewHistoryNode.parentNode.replaceChild(historyNode, previewHistoryNode);
        };

        load(storage.history, storage.clickHistory);

        chrome.storage.onChanged.addListener(function(changes) {
            var history = storage.history;
            var changeHistory = changes.history;
            var clickHistory = storage.clickHistory;
            var changeClickHistory = changes.clickHistory;
            var hasChanges = false;
            if (changeHistory && JSON.stringify(changeHistory.newValue) !== JSON.stringify(history)) {
                history.splice(0);
                history.push.apply(history, changeHistory.newValue);
                hasChanges = true;
            }
            if (changeClickHistory && JSON.stringify(changeClickHistory.newValue) !== JSON.stringify(clickHistory)) {
                clickHistory.splice(0);
                clickHistory.push.apply(clickHistory, changeClickHistory.newValue);
                hasChanges = true;
            }
            if (hasChanges) {
                load(storage.history, storage.clickHistory);
            }
        });

        counter();
    });
});