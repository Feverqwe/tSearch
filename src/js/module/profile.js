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

    var Profile = function (profile, resultFilter, setTrackerList, ee, storage) {
        var self = this;
        var trackers = storage.trackers;
        var trackerIdTracker = {};
        var wrappedTrackers = [];
        var tables = [];
        var moreEvents = {};

        var multiSelect = false;
        var selectedTracker = null;

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
                if (!multiSelect && state) {
                    if (selectedTracker && selectedTracker !== this) {
                        selectedTracker.select(false);
                    }
                    selectedTracker = this;
                }
            };
            var trackerCount = function (count) {
                this.countNode.textContent = count;
            };
            var trackerStatus = function (status, message) {
                this.iconNode.classList.remove('tracker__icon-loading');
                this.iconNode.classList.remove('tracker__icon-error');
                this.iconNode.title = '';

                if (status === 'error') {
                    this.iconNode.title = message;
                    this.iconNode.classList.add('tracker__icon-error');
                } else
                if (status === 'search') {
                    this.iconNode.classList.add('tracker__icon-loading');
                } else
                if (status === 'success') {
                }
            };
            var trackersNode = document.createDocumentFragment();
            profile.trackers.forEach(function (/**profileTracker*/item) {
                var worker = null;
                /**
                 * @typedef {Object} tracker
                 * @property {string} id
                 * @property {Object} meta
                 * @property {string} meta.name
                 * @property {string} meta.version
                 * @property {string} [meta.author]
                 * @property {string} [meta.description]
                 * @property {string} [meta.homepageURL]
                 * @property {string} meta.icon
                 * @property {string} [meta.icon64]
                 * @property {string} meta.updateURL
                 * @property {string} meta.downloadURL
                 * @property {string} [meta.supportURL]
                 * @property {string[]} [meta.require]
                 * @property {string[]} [meta.connect]
                 * @property {Object} info
                 * @property {number} info.lastUpdate
                 * @property {string} code
                 */
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

                var iconClass = 'icon_' + tracker.id;
                var iconStyleNode = dom.el('style', {
                    text: '.' + iconClass + '{' + 'background-image:url(' + JSON.stringify(tracker.meta.icon64 || tracker.meta.icon) + ')' + '}'
                });

                var countNode;
                var iconNode;
                var node = dom.el('a', {
                    class: 'tracker',
                    href: '#' + tracker.id,
                    data: {
                        id: tracker.id
                    },
                    append: [
                        iconNode = dom.el('div', {
                            class: ['tracker__icon', iconClass],
                            append: [
                                iconStyleNode
                            ]
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
                 * @property {string} name
                 * @property {string} iconClass
                 * @property {Element} node
                 * @property {Element} iconStyleNode
                 * @property {Element} countNode
                 * @property {Element} iconNode
                 * @property {Tracker} worker
                 * @property {boolean} selected
                 * @property {function} select
                 * @property {function} count
                 * @property {function} status
                 */

                var trackerWrapper = {
                    id: tracker.id,
                    name: tracker.meta.name || tracker.id,
                    iconClass: iconClass,
                    node: node,
                    iconStyleNode: iconStyleNode,
                    countNode: countNode,
                    iconNode: iconNode,
                    worker: worker,
                    selected: false,
                    select: trackerSelect,
                    count: trackerCount,
                    status: trackerStatus
                };

                wrappedTrackers.push(trackerWrapper);
                trackerIdTracker[trackerWrapper.id] = trackerWrapper;

                trackersNode.appendChild(node);
            });
            setTrackerList(trackersNode);
        };

        var destroyTables = function (index) {
            tables.splice(index || 0).forEach(function (table) {
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
            wrappedTrackers.forEach(function (/**trackerWrapper*/tracker) {
                tracker.count(counter[tracker.id] || 0);
            });
        };

        var setMoreEvent = function (trackerId, query, response, table) {
            moreEvents[trackerId] = {
                message: response.nextPageRequest,
                query: query
            };
            table.insertMoreBtn(onSearchMore, Object.keys(moreEvents));
        };

        var inHistory = function (query) {
            /**
             * @typedef {Object} historyItem
             * @property {String} query
             * @property {String} profileId
             * @property {number} time
             */

            var item = {
                query: query,
                profileId: profile.id,
                time: parseInt(Date.now() / 1000)
            };

            chrome.storage.local.get({
                history: []
            }, function (storage) {
                var pos = -1;
                storage.history.some(function (item, index) {
                    if (item.query === query) {
                        pos = index;
                        return true;
                    }
                });
                if (pos !== -1) {
                    storage.history.splice(pos, 1);
                }
                storage.history.unshift(item);
                storage.history.splice(500);
                chrome.storage.local.set(storage);
            });
        };

        var createTable = function () {
            var table = new Table(resultFilter, storage);
            tables.push(table);
            tableParent.appendChild(table.node);
            return table;
        };

        var onSearch = function (query) {
            destroyTables();

            var table = createTable();

            wrappedTrackers.forEach(function (tracker) {
                if (tracker.worker) {
                    tracker.status('search');
                    tracker.worker.search(query, function (response) {
                        if (!response) {
                            tracker.status('error', 'Tracker response is empty!');
                            throw new Error('Tracker response is empty!');
                        }

                        if (response.success) {
                            tracker.status('success');
                            table.insertResults(tracker, query, response.results);
                            if (response.nextPageRequest) {
                                setMoreEvent(tracker.id, query, response, table);
                            }
                            updateCounter();
                        } else {
                            tracker.status('error', response.error);
                        }
                    });
                }
            });

            inHistory(query);
        };

        var onSearchMore = function (cb) {
            var onceCb = function () {
                cb && cb();
                cb = null;
            };
            var table = null;
            Object.keys(moreEvents).forEach(function (trackerId) {
                var moreEvent = moreEvents[trackerId];
                delete moreEvents[trackerId];

                var message = moreEvent.message;
                var query = moreEvent.query;
                var tracker = trackerIdTracker[trackerId];
                if (tracker.worker) {
                    tracker.status('search');
                    tracker.worker.sendMessage(message, function (response) {
                        onceCb();

                        if (!response) {
                            tracker.status('error', 'Tracker response is empty!');
                            throw new Error('Tracker response is empty!');
                        }

                        if (response.success) {
                            tracker.status('success');
                            if (!table) {
                                table = createTable();
                            }
                            table.insertResults(tracker, query, response.results);
                            if (response.nextPageRequest) {
                                setMoreEvent(tracker.id, query, response, table);
                            }
                            updateCounter();
                        } else {
                            tracker.status('error', response.error);
                        }
                    });
                }
            });
        };

        var onFilterChange = function () {
            tables.forEach(function (table, index) {
                var result = table.applyFilter();
                if (index > 0 && !result.visible && !result.moreVisible) {
                    table.hide();
                } else {
                    table.show();
                }
            });
            updateCounter();
        };

        var onSelectTracker = function (id) {
            trackerIdTracker[id].select();
        };

        var onReload = function () {
            self.reload();
        };

        var onStateReset = function () {
            destroyTables();
            updateCounter();
        };

        ee.on('reloadProfile', onReload);
        ee.on('selectTracker', onSelectTracker);
        ee.on('filterChange', onFilterChange);
        ee.on('search', onSearch);
        ee.on('stateReset', onStateReset);

        this.id = profile.id;
        this.name = profile.name;
        this.trackers = wrappedTrackers;
        this.trackerIdTracker = trackerIdTracker;
        this.reload = function () {
            self.destroy();
            load();
        };
        this.destroy = function () {
            destroyTables();
            ee.off('stateReset', onStateReset);
            ee.off('reloadProfile', onReload);
            ee.off('selectTracker', onSelectTracker);
            ee.off('filterChange', onFilterChange);
            ee.off('search', onSearch);
            for (var key in moreEvents) {
                delete moreEvents[key];
            }
            wrappedTrackers.splice(0).forEach(function (tracker) {
                tracker.worker && tracker.worker.destroy();
            });
            for (var key in trackerIdTracker) {
                delete trackerIdTracker[key];
            }
            resultFilter.clearTrackerFilter();
        };
        load();
    };
    return Profile;
});