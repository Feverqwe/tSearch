/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
define([
    './dom',
    './tracker',
    './table'
], function (dom, Tracker, Table) {
    var tableParent = document.querySelector('.results');

    var Profile = function (profile, trackers, resultFilter, trackerList, ee) {
        var self = this;
        var trackerIdTracker = {};
        var wrappedTrackers = [];
        var tables = [];
        var load = function () {
            var trackerSelect = function (state) {
                if (state === undefined) {
                    state = !this.selected;
                } else {
                    state = !!state;
                }
                if (this.selected !== state) {
                    this.selected = state;
                    if (state) {
                        this.node.classList.add('tracker-selected');
                        resultFilter.addTracker(this.id);
                    } else {
                        this.node.classList.remove('tracker-selected');
                        resultFilter.removeTracker(this.id);
                    }

                    resultFilter.update();
                }
            };
            var trackerCount = function (count) {
                this.countNode.textContent = count;
            };
            var trackersNode = document.createDocumentFragment();
            profile.trackers.forEach(function (/**profileTracker*/item) {
                var worker = null;
                var tracker = trackers[item.id];
                if (tracker) {
                    worker = new Tracker(tracker);
                } else {
                    tracker = {
                        id: item.id,
                        meta: {},
                        info: {},
                        code: ''
                    }
                }

                var countNode;
                var node = dom.el('div', {
                    class: 'tracker',
                    data: {
                        id: tracker.id
                    },
                    append: [
                        dom.el('img', {
                            class: 'tracker__icon',
                            src: tracker.meta.icon64 || tracker.meta.icon,
                            on: ['error', function () {
                                this.src = './img/blank.svg';
                            }]
                        }),
                        dom.el('div', {
                            class: 'tracker__name',
                            text: tracker.meta.name || tracker.id
                        }),
                        countNode = dom.el('div', {
                            class: 'tracker__counter',
                            text: 0
                        })
                    ]
                });

                /**
                 * @typedef trackerWrapper
                 * @property {string} id
                 * @property {Element} node
                 * @property {Element} countNode
                 * @property {Worker} worker
                 * @property {boolean} selected
                 * @property {function} select
                 * @property {function} count
                 */

                var trackerWrapper = {
                    id: tracker.id,
                    node: node,
                    countNode: countNode,
                    worker: worker,
                    selected: false,
                    select: trackerSelect,
                    count: trackerCount
                };

                wrappedTrackers.push(trackerWrapper);
                trackerIdTracker[trackerWrapper.id] = trackerWrapper;

                trackersNode.appendChild(node);
            });
            trackerList.textContent = '';
            trackerList.appendChild(trackersNode);
        };

        var destroyTables = function () {
            tables.forEach(function (table) {
                table.destroy();
            });
        };

        var updateCounter = function () {
            var counter = {};
            var tableCounter, trackerId;
            for (var i = 0, table; table = tables[i]; i++) {
                tableCounter = table.counter;
                for (trackerId in tableCounter) {
                    if (!counter[trackerId]) {
                        counter[trackerId] = 0;
                    }
                    counter[trackerId] += tableCounter[trackerId];
                }
            }
            for (var trackerId in counter) {
                trackerIdTracker[trackerId].count(counter[trackerId]);
            }
        };

        var onSearch = function (query) {
            destroyTables();

            var table = new Table(resultFilter);
            tables.push(table);
            tableParent.appendChild(table.node);

            wrappedTrackers.forEach(function (tracker) {
                tracker.worker && tracker.worker.search(query, function (response) {
                    if (!response) {
                        throw new Error('Tracker response is empty!');
                    }

                    if (response.success) {
                        table.insertResults(tracker, query, response.results);
                        updateCounter();
                    }
                });
            });
        };

        var onFilterChange = function () {
            tables.forEach(function (table) {
                table.applyFilter();
            });
            updateCounter();
        };

        var onSelectTracker = function (id) {
            trackerIdTracker[id].select();
        };

        var onReload = function () {
            self.reload();
        };

        ee.on('reloadProfile', onReload);
        ee.on('selectTracker', onSelectTracker);
        ee.on('filterChange', onFilterChange);
        ee.on('search', onSearch);

        this.id = profile.id;
        this.trackers = wrappedTrackers;
        this.trackerIdTracker = trackerIdTracker;
        this.reload = function () {
            self.destroy();
            load();
        };
        this.destroy = function () {
            destroyTables();
            ee.off('reloadProfile', onReload);
            ee.off('selectTracker', onSelectTracker);
            ee.off('filterChange', onFilterChange);
            ee.off('search', onSearch);
            trackers.splice(0).forEach(function (tracker) {
                tracker.worker && tracker.worker.destroy();
            });
            for (var key in trackerIdTracker) {
                delete trackerIdTracker[key];
            }
        };
        load();
    };
    return Profile;
});