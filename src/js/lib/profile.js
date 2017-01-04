/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
define([
    './dom',
    './tracker'
], function (dom, Tracker) {
    var Profile = function (profile, trackers, filter, trackerList) {
        var self = this;
        var trackerIdTracker = {};
        var wrappedTrackers = [];
        var selectedTrackerIds = [];
        var load = function () {
            var trackerSelect = function (state) {
                if (state === undefined) {
                    state = !this.selected;
                } else {
                    state = !!state;
                }
                if (this.selected !== state) {
                    this.selected = state;
                    var pos = selectedTrackerIds.indexOf(this.id);
                    if (pos !== -1) {
                        selectedTrackerIds.splice(pos, 1);
                    }
                    if (state) {
                        this.node.classList.add('tracker-selected');
                        selectedTrackerIds.push(this.id);
                    } else {
                        this.node.classList.remove('tracker-selected');
                    }

                    filter.update();
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
        load();
        this.reload = function () {
            self.destroy();
            load();
        };
        this.id = profile.id;
        this.trackers = wrappedTrackers;
        this.trackerIdTracker = trackerIdTracker;
        this.selectedTrackerIds = selectedTrackerIds;
        this.destroy = function () {
            trackers.splice(0).forEach(function (tracker) {
                tracker.worker && tracker.worker.destroy();
            });
            for (var key in trackerIdTracker) {
                delete trackerIdTracker[key];
            }
        };
    };
    return Profile;
});