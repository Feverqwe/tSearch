/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
define([
    './utils',
    './dom'
], function (utils, dom) {
    var ProfileManager = function (profiles, profileIdProfileMap, trackers, global) {
        var layer = null;

        var getHeader = function (title) {
            return dom.el('div', {
                class: 'manager__header',
                append: [
                    dom.el('div', {
                        class: 'header__title',
                        text: title
                    }),
                    dom.el('a', {
                        href: '#close',
                        class: 'header__close',
                        text: chrome.i18n.getMessage('close'),
                        on: ['click', function (e) {
                            e.preventDefault();
                            close();
                        }]
                    })
                ]
            });
        };

        var getFooter = function (childNodes) {
            return dom.el('div', {
                class: 'manager__footer',
                append: childNodes
            });
        };

        var getLayer = function () {
            var content;
            var node = dom.el('div', {
                class: 'manager__layer',
                append: [
                    content = dom.el('div', {
                        class: 'manager'
                    })
                ]
            });
            return {
                node: node,
                content: content
            }
        };

        var getProfiles = function (profiles) {
            var getProfileItem = function (profile) {
                return dom.el('div', {
                    class: 'item',
                    data: {
                        id: profile.id
                    },
                    append: [
                        dom.el('div', {
                            class: 'item__name',
                            text: profile.name
                        }),
                        dom.el('a', {
                            class: 'item__action',
                            href: '#edit',
                            data: {
                                action: 'edit'
                            },
                            text: chrome.i18n.getMessage('edit')
                        }),
                        dom.el('a', {
                            class: 'item__action',
                            href: '#remove',
                            data: {
                                action: 'remove'
                            },
                            text: chrome.i18n.getMessage('remove')
                        })
                    ]
                });
            };
            return dom.el(document.createDocumentFragment(), {
                append: [
                    getHeader(chrome.i18n.getMessage('manageProfiles')),
                    dom.el('div', {
                        class: 'manager__profiles',
                        append: (function () {
                            var list = [];
                            profiles.forEach(function (/**profile*/profile) {
                                list.push(getProfileItem(profile))
                            });
                            return list;
                        })(),
                        on: ['click', function (e) {
                            var target = e.target;
                            if (target.dataset.action === 'edit') {
                                e.preventDefault();
                                var profileId = target.parentNode.dataset.id;
                                var profile = profileIdProfileMap[profileId];
                                layer.content.textContent = '';
                                layer.content.appendChild(getProfile(profile, trackers));
                            }
                        }]
                    }),
                    getFooter([
                        dom.el('a', {
                            href: '#save',
                            class: ['manager__footer__btn'],
                            text: chrome.i18n.getMessage('save')
                        })
                    ])
                ]
            });
        };

        var getProfile = function (/**profile*/profile, trackers) {
            var getTrackerItem = function (tracker, checked, exists) {
                return dom.el('div', {
                    class: 'item',
                    data: {
                        id: tracker.id
                    },
                    append: [
                        dom.el('input', {
                            class: 'item__checkbox',
                            type: 'checkbox',
                            checked: checked
                        }),
                        dom.el('div', {
                            class: 'item__name',
                            text: tracker.meta.name || tracker.id
                        }),
                        !exists || !tracker.meta.updateURL ? '' : dom.el('a', {
                                class: 'item__action',
                                href: '#update',
                                data: {
                                    action: 'update'
                                },
                                text: chrome.i18n.getMessage('update')
                            }),
                        dom.el('a', {
                            class: 'item__action',
                            href: '#edit',
                            data: {
                                action: 'edit'
                            },
                            text: chrome.i18n.getMessage('edit')
                        }),
                        dom.el('a', {
                            class: 'item__action',
                            href: '#remove',
                            data: {
                                action: 'remove'
                            },
                            text: chrome.i18n.getMessage('remove')
                        })
                    ]
                })
            };

            var trackersNode = null;
            return dom.el(document.createDocumentFragment(), {
                append: [
                    getHeader(chrome.i18n.getMessage('manageProfile')),
                    dom.el('div', {
                        class: 'manager__profile',
                        append: [
                            dom.el('div', {
                                class: ['profile__input'],
                                append: [
                                    dom.el('input', {
                                        class: ['input__input'],
                                        type: 'text',
                                        value: profile.name
                                    })
                                ]
                            })
                        ]
                    }),
                    trackersNode = dom.el('div', {
                        class: 'manager__trackers',
                        append: (function () {
                            var list = [];
                            var idList = [];
                            profile.trackers.forEach(function (/**profileTracker*/profileTracker) {
                                var tracker = trackers[profileTracker.id];
                                var exists = !!tracker;
                                if (!tracker) {
                                    tracker = {
                                        id: profileTracker.id,
                                        meta: {}
                                    }
                                }
                                idList.push(tracker.id);
                                list.push(getTrackerItem(tracker, true, exists))
                            });
                            Object.keys(trackers).forEach(function (/**tracker*/trackerId) {
                                var tracker = trackers[trackerId];
                                if (idList.indexOf(tracker.id) === -1) {
                                    list.push(getTrackerItem(tracker, false, true))
                                }
                            });
                            return list;
                        })(),
                        on: ['click', function (e) {
                            var target = e.target;
                            if (target.dataset.action === 'edit') {
                                e.preventDefault();
                                var trackerId = target.parentNode.dataset.id;
                                chrome.tabs.create({
                                    url: 'editor.html#' + utils.param({
                                        id: trackerId
                                    })
                                });
                            }
                        }]
                    }),
                    getFooter([
                        dom.el('a', {
                            href: '#save',
                            class: ['manager__footer__btn'],
                            text: chrome.i18n.getMessage('save'),
                            on: ['click', function (e) {
                                e.preventDefault();
                                var profileTrackers = [];
                                [].slice.call(trackersNode.childNodes).forEach(function (trackerNode) {
                                    var id = trackerNode.dataset.id;
                                    var checkbox = trackerNode.querySelector('.item__checkbox');
                                    var checked = checkbox.checked;
                                    if (checked) {
                                        profileTrackers.push({
                                            id: id
                                        })
                                    }
                                });
                                profile.trackers = profileTrackers;
                                chrome.storage.local.set({
                                    profiles: profiles
                                }, function () {
                                    global.activeProfile.reload();
                                });
                            }]
                        }),
                        dom.el('a', {
                            href: '#update',
                            class: ['manager__footer__btn'],
                            text: chrome.i18n.getMessage('update')
                        })
                    ])
                ]
            });
        };

        var createLayer = function () {
            var layer = getLayer();
            layer.content.appendChild(getProfiles(profiles));
            return layer;
        };

        var close = function () {
            layer.node.parentNode.removeChild(layer.node);
        };

        layer = createLayer();
        document.body.appendChild(layer.node);
    };
    return ProfileManager;
});