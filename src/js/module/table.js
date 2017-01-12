/**
 * Created by Anton on 05.01.2017.
 */
"use strict";
define([
    'promise',
    './dom',
    '../lib/filesize.min',
    './highlight',
    './rate'
], function (Promise, dom, filesize, highlight, rate) {
    var moment = null;
    var unixTimeToString = function (unixtime) {
        return unixtime <= 0 ? '∞' : moment(unixtime * 1000).format('lll');
    };
    var unixTimeToFromNow = function (unixtime) {
        return unixtime <= 0 ? '∞' : moment(unixtime * 1000).fromNow();
    };

    var sortInsertList = function(tableBody, sortedList, nodeList) {
        var node;
        var insertItems = [];
        var insertPosition = null;
        var nodes = null;
        var child = null;

        for (var i = 0; node = sortedList[i]; i++) {
            if (nodeList[i] === node) {
                continue;
            }
            insertPosition = i;

            nodes = document.createDocumentFragment();
            while (sortedList[i] !== undefined && sortedList[i] !== nodeList[i]) {
                var pos = nodeList.indexOf(sortedList[i], i);
                if (pos !== -1) {
                    nodeList.splice(pos, 1);
                }
                nodeList.splice(i, 0, sortedList[i]);

                nodes.appendChild(sortedList[i].node);
                i++;
            }

            insertItems.push([insertPosition, nodes]);
        }

        for (var n = 0; node = insertItems[n]; n++) {
            child = tableBody.childNodes[node[0]];
            if (child !== undefined) {
                tableBody.insertBefore(node[1], child);
            } else {
                tableBody.appendChild(node[1]);
            }
        }
    };

    var sortTypeMap = {
        date: function (direction) {
            var moveUp = -1;
            var moveDown = 1;
            if (direction > 0) {
                moveUp = 1;
                moveDown = -1;
            }
            return function (/*tableRow*/a, /*tableRow*/b) {
                var _a = a.torrent.date;
                var _b = b.torrent.date;
                return _a === _b ? 0 : _a > _b ? moveUp : moveDown;
            };
        },
        quality: function (direction) {
            var moveUp = -1;
            var moveDown = 1;
            if (direction > 0) {
                moveUp = 1;
                moveDown = -1;
            }
            return function (/*tableRow*/a, /*tableRow*/b) {
                var _a = a.torrent.quality;
                var _b = b.torrent.quality;
                return _a === _b ? 0 : _a > _b ? moveUp : moveDown;
            };
        },
        title: function (direction) {
            var moveUp = -1;
            var moveDown = 1;
            if (direction > 0) {
                moveUp = 1;
                moveDown = -1;
            }
            return function (/*tableRow*/a, /*tableRow*/b) {
                var _a = a.torrent.title;
                var _b = b.torrent.title;
                return _a === _b ? 0 : _a < _b ? moveUp : moveDown;
            };
        },
        size: function (direction) {
            var moveUp = -1;
            var moveDown = 1;
            if (direction > 0) {
                moveUp = 1;
                moveDown = -1;
            }
            return function (/*tableRow*/a, /*tableRow*/b) {
                var _a = a.torrent.size;
                var _b = b.torrent.size;
                return _a === _b ? 0 : _a > _b ? moveUp : moveDown;
            };
        },
        seed: function (direction) {
            var moveUp = -1;
            var moveDown = 1;
            if (direction > 0) {
                moveUp = 1;
                moveDown = -1;
            }
            return function (/*tableRow*/a, /*tableRow*/b) {
                var _a = a.torrent.seed;
                var _b = b.torrent.seed;
                return _a === _b ? 0 : _a > _b ? moveUp : moveDown;
            };
        },
        peer: function (direction) {
            var moveUp = -1;
            var moveDown = 1;
            if (direction > 0) {
                moveUp = 1;
                moveDown = -1;
            }
            return function (/*tableRow*/a, /*tableRow*/b) {
                var _a = a.torrent.peer;
                var _b = b.torrent.peer;
                return _a === _b ? 0 : _a > _b ? moveUp : moveDown;
            };
        }
    };

    var onLickClick = function (target, tableRows) {
        var link = dom.closest('a', target);
        if (link) {
            var type = null;
            /**
             * @type {tableRow}
             */
            var row;
            if (link.classList.contains('title')) {
                type = 'open';
                row = tableRows[link.dataset.index];
            } else
            if (link.classList.contains('cell__download')) {
                type = 'download';
                row = tableRows[link.dataset.index];
            }
            if (row) {
                /**
                 * @typedef {Object} clickHistoryItem
                 * @property {String} type
                 * @property {String} query
                 * @property {String} trackerId
                 * @property {String} title
                 * @property {String} url
                 * @property {number} time
                 */
                var item = {
                    type: type,
                    query: row.query,
                    trackerId: row.torrent.trackerId,
                    title: row.torrent.title,
                    url: row.torrent.url,
                    time: parseInt(Date.now() / 1000)
                };

                chrome.storage.local.get({
                    clickHistory: []
                }, function (storage) {
                    var pos = -1;
                    storage.clickHistory.some(function (_item, index) {
                        if (_item.query === item.query && _item.url === item.url) {
                            pos = index;
                            return true;
                        }
                    });
                    if (pos !== -1) {
                        storage.clickHistory.splice(pos, 1);
                    }
                    storage.clickHistory.unshift(item);
                    storage.clickHistory.splice(500);
                    chrome.storage.local.set(storage);
                });
            }
        }
    };

    var Table = function (resultFilter, storage) {
        var self = this;
        var cells = ['date', 'quality', 'title', 'size', 'seed', 'peer'];
        if (storage.hidePeerRow) {
            cells.splice(cells.indexOf('peer'), 1);
        }
        if (storage.hideSeedRow) {
            cells.splice(cells.indexOf('seed'), 1);
        }

        var sortCells = storage.sortCells;

        var trackerIdCount = {};

        var getHeadRow = function () {
            var wrappedCells = {};
            var sortedCell = null;

            var sort = function (direction) {
                if (this === sortedCell) {
                    if (this.sortDirection > 0) {
                        this.sortDirection = -1;
                    } else {
                        this.sortDirection = 1;
                    }
                } else
                if (sortedCell) {
                    this.sortDirection = 0;
                    sortedCell.node.classList.remove('cell-sort-up');
                    sortedCell.node.classList.remove('cell-sort-down');
                }

                if (direction) {
                    this.sortDirection = direction;
                }

                if (this.sortDirection > 0) {
                    this.node.classList.remove('cell-sort-down');
                    this.node.classList.add('cell-sort-up');
                } else {
                    this.node.classList.remove('cell-sort-up');
                    this.node.classList.add('cell-sort-down');
                }

                sortedCell = this;

                sortCells.splice(0);
                sortCells.push([this.type, this.sortDirection]);

                chrome.storage.local.set({
                    sortCells: sortCells
                });

                insertSortedRows();
            };

            var nodes = dom.el('div', {
                class: ['row', 'head__row'],
                on: ['click', function (e) {
                    var child = dom.closestNode(this, e.target);
                    if (child) {
                        e.preventDefault();
                        var row = wrappedCells[child.dataset.type];
                        row.sort();
                    }
                }]
            });

            cells.forEach(function (type) {
                var name = chrome.i18n.getMessage('row_' + type);
                var nameShort = chrome.i18n.getMessage('row_' + type + '__short') || name;

                var node = dom.el('a', {
                    class: ['cell', 'row__cell', 'cell-' + type],
                    href: '#cell-' + type,
                    data: {
                        type: type
                    },
                    append: [
                        dom.el('span', {
                            class: ['cell__title'],
                            title: name,
                            text: nameShort
                        }),
                        dom.el('i', {
                            class: ['cell__sort']
                        })
                    ]
                });
                wrappedCells[type] = {
                    type: type,
                    sortDirection: 0,
                    node: node,
                    sort: sort
                };
                nodes.appendChild(node);
            });

            return {
                node: dom.el('div', {
                    class: ['table__head'],
                    append: nodes
                }),
                cellTypeCell: wrappedCells
            };
        };

        var normalizeTorrent = function (trackerId, /**torrent*/torrent) {
            torrent.trackerId = trackerId;
            if (torrent.size) {
                torrent.size = parseInt(torrent.size);
                if (isNaN(torrent.size)) {
                    torrent.size = null;
                }
            }
            if (!torrent.size) {
                torrent.size = 0;
            }

            if (torrent.seed) {
                torrent.seed = parseInt(torrent.seed);
                if (isNaN(torrent.seed)) {
                    torrent.seed = null;
                }
            }
            if (!torrent.seed) {
                torrent.seed = 1;
            }

            if (torrent.peer) {
                torrent.peer = parseInt(torrent.peer);
                if (isNaN(torrent.peer)) {
                    torrent.peer = null;
                }
            }
            if (!torrent.peer) {
                torrent.peer = 0;
            }

            if (torrent.date) {
                torrent.date = parseInt(torrent.date);
                if (isNaN(torrent.date)) {
                    torrent.date = null;
                }
            }
            if (!torrent.date) {
                torrent.date = -1;
            }

            if (!torrent.categoryTitle) {
                torrent.categoryTitle = '';
            }

            if (!torrent.title || !torrent.url) {
                console.debug('[' + trackerId + ']', 'Skip torrent:', torrent);
                return true;
            }

            torrent.titleLow = torrent.title.toLowerCase();
            torrent.categoryTitleLow = torrent.categoryTitle.toLowerCase();
            torrent.wordFilterLow = torrent.titleLow;

            if (storage.categoryWordFilter) {
                torrent.wordFilterLow = torrent.categoryTitleLow + ' ' + torrent.wordFilterLow;
            }

            if (!torrent.categoryUrl) {
                torrent.categoryUrl = '';
            }

            if (!torrent.downloadUrl) {
                torrent.downloadUrl = '';
            }

            return false;
        };

        /**
         * @typedef {Object} torrent
         * @property {string} [categoryTitle]
         * @property {string} [categoryUrl]
         * @property {string} title
         * @property {string} url
         * @property {number} [size]
         * @property {string} [downloadUrl]
         * @property {number} [seed]
         * @property {number} [peer]
         * @property {number} [date]
         *
         * @property {number} quality
         * @property {string} trackerId
         * @property {string} titleLow
         * @property {string} categoryTitleLow
         * @property {string} wordFilterLow
         */
        var getBodyRow = function (/**trackerWrapper*/tracker, /**torrent*/torrent, filterValue, index, highlightMap) {
            var row = dom.el('div', {
                class: ['row', 'body__row'],
                data: {
                    filter: filterValue
                }
            });
            cells.forEach(function (type) {
                if (type === 'date') {
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        title: unixTimeToString(torrent.date),
                        text: unixTimeToFromNow(torrent.date)
                    }))
                } else
                if (type === 'quality') {
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        text: parseInt(torrent.quality)
                    }))
                } else
                if (type === 'title') {
                    var category = '';
                    if (torrent.categoryTitle) {
                        if (torrent.categoryUrl) {
                            category = dom.el('a', {
                                class: ['category'],
                                target: '_blank',
                                href: torrent.categoryUrl,
                                text: torrent.categoryTitle
                            });
                        } else {
                            category = dom.el('span', {
                                class: ['category'],
                                text: torrent.categoryTitle
                            });
                        }
                    }
                    var trackerIcon = dom.el('div', {
                        class: ['tracker__icon', tracker.iconClass],
                        title: tracker.name
                    });
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        append: [
                            dom.el('div', {
                                class: ['cell__title'],
                                append: [
                                    dom.el('a', {
                                        class: ['title'],
                                        data: {
                                            index: index
                                        },
                                        target: '_blank',
                                        href: torrent.url,
                                        append: [
                                            highlight.insert(torrent.title, highlightMap)
                                        ]
                                    }),
                                    trackerIcon
                                ]
                            }),
                            category && dom.el('div', {
                                class: ['cell__category'],
                                append: [
                                    category,
                                    trackerIcon
                                ]
                            })
                        ]
                    }))
                } else
                if (type === 'size') {
                    var downloadLink = filesize(torrent.size);
                    if (torrent.downloadUrl) {
                        downloadLink = dom.el('a', {
                            class: ['cell__download'],
                            data: {
                                index: index
                            },
                            target: '_blank',
                            href: torrent.downloadUrl,
                            text: downloadLink + ' ' + String.fromCharCode(8595)
                        });
                    }
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        append: downloadLink
                    }));
                } else
                if (type === 'seed') {
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        text: torrent.seed
                    }))
                } else
                if (type === 'peer') {
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        text: torrent.peer
                    }))
                }
            });
            return row;
        };

        var tableRows = [];
        var tableSortedRows = [];

        var insertSortedRows = function () {
            var sortedRows = tableRows.slice(0);
            sortCells.forEach(function (item) {
                var type = item[0];
                var direction = item[1];
                var sortFn = sortTypeMap[type](direction);
                sortedRows.sort(sortFn);
            });
            sortInsertList(body.node, sortedRows, tableSortedRows);
        };

        var head = null;
        var body = null;
        var footer = null;

        this.counter = trackerIdCount;
        this.node = null;

        this.load = function () {
            var promise = Promise.resolve();
            if (!moment) {
                promise = promise.then(function () {
                    return new Promise(function (resolve) {
                        require(['moment'], function (_moment) {
                            moment = _moment;
                            moment.locale(chrome.i18n.getUILanguage());
                            resolve();
                        });
                    });
                });
            }
            return promise.then(function () {
                head = getHeadRow();
                body = {
                    node: dom.el('div', {
                        class: ['body', 'table__body'],
                        on: [
                            ['mouseup', function (e) {
                                onLickClick(e.target, tableRows);
                            }]
                        ]
                    })
                };
                footer = {
                    node: dom.el('div', {
                        class: ['footer', 'table__footer']
                    }),
                    more: null
                };
                self.node = dom.el('div', {
                    class: ['table', 'table-results'],
                    append: [
                        head.node,
                        body.node,
                        footer.node
                    ]
                });

                sortCells.forEach(function (row) {
                    head.cellTypeCell[row[0]].sort(row[1]);
                });
            });
        };

        this.insertResults = function (/**trackerWrapper*/tracker, query, results) {
            var visibleCount = 0;
            if (!trackerIdCount[tracker.id]) {
                trackerIdCount[tracker.id] = {
                    filtered: 0,
                    all: 0
                };
            }

            var highlightMap = highlight.getMap(query);
            var rateScheme = rate.getScheme(query);

            results.forEach(function (torrent) {
                /**
                 * @typedef {Object} tableRow
                 * @property {Element} node
                 * @property {string} query
                 * @property {torrent} torrent
                 * @property {trackerWrapper} tracker
                 * @property {boolean} filterValue
                 */
                var skip = normalizeTorrent(tracker.id, torrent);
                if (!skip) {
                    var filterValue = resultFilter.getFilterValue(torrent);
                    torrent.quality = rate.getRate(torrent, rateScheme);
                    var node = getBodyRow(tracker, torrent, filterValue, tableRows.length, highlightMap);
                    tableRows.push({
                        node: node,
                        query: query,
                        torrent: torrent,
                        tracker: tracker,
                        filterValue: filterValue
                    });
                    trackerIdCount[tracker.id].all++;
                    if (filterValue) {
                        visibleCount++;
                        trackerIdCount[tracker.id].filtered++;
                    }
                }
            });

            insertSortedRows();

            if (visibleCount === 0) {
                self.hide();
            } else {
                self.show();
            }
        };

        this.insertMoreBtn = function (searchMore, trackerIds) {
            var loading = false;
            var more = footer.more;
            if (!more) {
                more = footer.more = {};
            }
            more.trackerIds = trackerIds;
            if (!more.node) {
                more.node = dom.el('a', {
                    class: ['loadMore', 'search__submit', 'footer__loadMore'],
                    href: '#more',
                    text: chrome.i18n.getMessage('loadMore'),
                    on: ['click', function (e) {
                        e.preventDefault();
                        var _this = this;
                        if (!loading) {
                            loading = true;
                            _this.classList.add('loadMore-loading');
                            searchMore(function () {
                                _this.parentNode && _this.parentNode.removeChild(_this);
                                footer.more = null;
                            });
                        }
                    }]
                });
                more.show = true;
                footer.node.appendChild(more.node);
            }
        };

        this.applyFilter = function () {
            var visibleCount = 0;
            var trackerId, filterValue;
            for (trackerId in trackerIdCount){
                trackerIdCount[trackerId] = {
                    filtered: 0,
                    all: 0
                };
            }

            for (var i = 0, /**tableRow*/row; row = tableRows[i]; i++) {
                filterValue = resultFilter.getFilterValue(row.torrent);
                trackerId = row.torrent.trackerId;
                row.filterValue = filterValue;
                row.node.dataset.filter = filterValue;
                trackerIdCount[trackerId].all++;
                if (filterValue) {
                    visibleCount++;
                    trackerIdCount[trackerId].filtered++;
                }
            }

            var more = footer.more;
            if (more) {
                var isHidden = more.trackerIds.every(function (id) {
                    return !resultFilter.isFilteredTracker(id);
                });
                if (isHidden) {
                    if (more.show) {
                        more.node.classList.add('loadMore-hidden');
                        more.show = false;
                    }
                } else
                if (!more.show) {
                    more.node.classList.remove('loadMore-hidden');
                    more.show = true;
                }
            }

            if (visibleCount === 0) {
                self.hide();
            } else {
                self.show();
            }
        };
        this.visible = true;
        this.show = function () {
            if (!self.visible) {
                self.node.classList.remove('table-hide');
                self.visible = true;
            }
        };
        this.hide = function () {
            if (self.visible) {
                self.node.classList.add('table-hide');
                self.visible = false;
            }
        };
        this.destroy = function () {
            var parent = self.node.parentNode;
            if (parent) {
                parent.removeChild(self.node);
            }
        };
    };
    return Table;
});