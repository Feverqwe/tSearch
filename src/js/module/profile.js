/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
define([
    '../lib/promise.min',
    './dom',
    './tracker',
    './table'
], function (Promise, dom, Tracker, Table) {
    var tableParent = document.querySelector('.results');

    var Profile = function (profile, resultFilter, setTrackerList, ee, storage) {
        var self = this;
        var trackers = storage.trackers;
        var multiSelect = false;
        var trackerIdTracker = {};
        var wrappedTrackers = [];
        var tables = [];
        var moreEvents = {};

        var selectedTracker = null;
        var selectedTrackerIds = [];

        var trackerSelect = function (state, noUpdate) {
            if (state === undefined) {
                state = !this.selected;
            } else {
                state = !!state;
            }

            if (this.selected !== state) {
                this.selected = state;

                if (!multiSelect && state) {
                    if (selectedTracker && selectedTracker !== this) {
                        selectedTracker.select(false, true);
                    }
                    selectedTracker = this;
                }

                var pos = selectedTrackerIds.indexOf(this.id);
                if (state) {
                    this.node.classList.add('tracker-selected');
                    resultFilter.addTracker(this.id);
                    if (pos === -1) {
                        selectedTrackerIds.push(this.id);
                    }
                } else {
                    this.node.classList.remove('tracker-selected');
                    resultFilter.removeTracker(this.id);
                    if (pos !== -1) {
                        selectedTrackerIds.splice(pos, 1);
                    }
                }

                !noUpdate && resultFilter.update();
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

        var trackerAuth = function (response) {
            var _this = this;
            var url = response.url;
            var authNode = dom.el('a', {
                class: ['tracker__login'],
                target: '_blank',
                href: url,
                title: chrome.i18n.getMessage('login'),
                on: ['click', function (e) {
                    e.stopPropagation();
                }]
            });
            _this.countNode.classList.add('counter-hidden');
            _this.node.insertBefore(authNode, _this.countNode);
            _this.auth = {
                node: authNode,
                destroy: function () {
                    _this.countNode.classList.remove('counter-hidden');
                    authNode.parentNode.removeChild(authNode);
                    _this.auth = null;
                }
            };
        };

        var load = function () {
            ee.on('profileFieldChange', onProfileFieldChange);
            ee.on('selectTracker', onSelectTracker);
            ee.on('filterChange', onFilterChange);
            ee.on('search', onSearch);
            ee.on('stateReset', onStateReset);

            self.id = profile.id;
            self.name = profile.name;

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
                 * @property {string} [meta.trackerURL]
                 * @property {string} meta.icon
                 * @property {string} [meta.icon64]
                 * @property {string} meta.updateURL
                 * @property {string} meta.downloadURL
                 * @property {string} [meta.supportURL]
                 * @property {string[]} [meta.require]
                 * @property {string[]} meta.connect
                 * @property {Object} info
                 * @property {number} info.lastUpdate
                 * @property {string} code
                 */
                var tracker = trackers[item.id];
                if (tracker) {
                    worker = new Tracker(tracker);
                    worker.load();
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
                if (tracker.meta.trackerURL) {
                    iconNode = dom.el('a', {
                        class: ['tracker__icon', iconClass, 'tracker__link'],
                        target: '_blank',
                        href: tracker.meta.trackerURL,
                        on: ['click', function (e) {
                            e.stopPropagation();
                        }]
                    });
                } else {
                    iconNode = dom.el('div', {
                        class: ['tracker__icon', iconClass]
                    });
                }
                iconNode.appendChild(iconStyleNode);
                var node = dom.el('a', {
                    class: 'tracker',
                    href: '#' + tracker.id,
                    data: {
                        id: tracker.id
                    },
                    append: [
                        iconNode,
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
                    status: trackerStatus,
                    auth: null,
                    setAuth: trackerAuth
                };

                wrappedTrackers.push(trackerWrapper);
                trackerIdTracker[trackerWrapper.id] = trackerWrapper;

                trackersNode.appendChild(node);
            });
            setTrackerList(trackersNode);

            ee.on('trackerChange', onTrackerChange);
        };

        var onTrackerChange = function (id, changes) {
            var trackerWrapper = trackerIdTracker[id];
            if (trackerWrapper && changes.indexOf('code') !== -1) {
                trackerWrapper.worker.safeReload();
            }
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
            return table.load().then(function () {
                tables.push(table);
                tableParent.appendChild(table.node);
                return table;
            });
        };

        var onSearch = function (query) {
            destroyTables();

            createTable().then(function (table) {
                wrappedTrackers.forEach(function (tracker) {
                    if (selectedTrackerIds.length && selectedTrackerIds.indexOf(tracker.id) === -1) {
                        return;
                    }

                    if (tracker.worker) {
                        tracker.status('search');
                        tracker.auth && tracker.auth.destroy();
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
                            } else
                            if (response.error === 'AUTH') {
                                tracker.setAuth(response);
                                tracker.status('success');
                            } else
                            if (response.message === 'ABORT') {
                                tracker.status('success');
                            } else {
                                tracker.status('error', response.name + ': ' + response.message);
                            }
                        });
                    }
                });
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
                            var promise = Promise.resolve();
                            if (!table) {
                                promise = promise.then(function () {
                                    return createTable();
                                });
                            }
                            promise.then(function (table) {
                                table.insertResults(tracker, query, response.results);
                                if (response.nextPageRequest) {
                                    setMoreEvent(tracker.id, query, response, table);
                                }
                                updateCounter();
                            });
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

        var abort = function () {
            wrappedTrackers.forEach(function (wrappedTracker) {
                wrappedTracker.worker.abort();
            });
        };

        var onStateReset = function () {
            abort();
            destroyTables();
            updateCounter();
        };

        var onProfileFieldChange = function (id, changes) {
            if (id === self.id && changes.indexOf('trackers') !== -1) {
                self.reload();
            }
        };

        this.trackers = wrappedTrackers;

        this.reload = function () {
            self.destroy();
            load();
        };
        this.destroy = function () {
            ee.off('profileFieldChange', onProfileFieldChange);
            ee.off('trackerChange', onTrackerChange);
            ee.off('stateReset', onStateReset);
            ee.off('selectTracker', onSelectTracker);
            ee.off('filterChange', onFilterChange);
            ee.off('search', onSearch);

            destroyTables();

            selectedTracker = null;
            selectedTrackerIds.splice(0);

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