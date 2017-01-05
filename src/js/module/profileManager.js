/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
define([
    './utils',
    './dom'
], function (utils, dom) {
    var ProfileManager = function (profiles, trackers) {
        var self = this;
        var layer = null;
        var profileIdProfileMap = {};
        profiles.forEach(function (item) {
            profileIdProfileMap[item.id] = item;
        });

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

            var profilesNode = null;
            return dom.el(document.createDocumentFragment(), {
                append: [
                    getHeader(chrome.i18n.getMessage('manageProfiles')),
                    dom.el('div', {
                        class: ['manager__sub_header', 'manager__sub_header-profiles'],
                        append: [
                            dom.el('a', {
                                class: ['manager__new_profile'],
                                href: '#new_profile',
                                text: chrome.i18n.getMessage('newProfile'),
                                on: ['click', function (e) {
                                    e.preventDefault();
                                    var profile = self.getDefaultProfile(profileIdProfileMap);
                                    layer.content.textContent = '';
                                    layer.content.appendChild(getProfile(profile, trackers));
                                }]
                            })
                        ]
                    }),
                    profilesNode = dom.el('div', {
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
                            var profileId, profile;
                            if (target.dataset.action === 'edit') {
                                e.preventDefault();
                                profileId = target.parentNode.dataset.id;
                                profile = profileIdProfileMap[profileId];
                                layer.content.textContent = '';
                                layer.content.appendChild(getProfile(profile, trackers));
                            } else
                            if (target.dataset.action === 'remove') {
                                e.preventDefault();
                                var profileNode = target.parentNode;
                                profileNode.parentNode.removeChild(profileNode);
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
                                var _profiles = [];
                                [].slice.call(profilesNode.childNodes).forEach(function (profileNode) {
                                    var id = profileNode.dataset.id;
                                    var profile = profileIdProfileMap[id];
                                    _profiles.push(profile);
                                });
                                chrome.storage.local.set({
                                    profiles: _profiles
                                }, function () {
                                    close();
                                    self.onSave();
                                });
                            }]
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

            var profileName = null;
            var trackersNode = null;
            var removedTrackerIds = [];
            return dom.el(document.createDocumentFragment(), {
                append: [
                    getHeader(chrome.i18n.getMessage('manageProfile')),
                    dom.el('div', {
                        class: 'manager__sub_header',
                        append: [
                            dom.el('div', {
                                class: ['profile__input'],
                                append: [
                                    profileName = dom.el('input', {
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
                            var trackerId;
                            if (target.dataset.action === 'edit') {
                                e.preventDefault();
                                trackerId = target.parentNode.dataset.id;
                                chrome.tabs.create({
                                    url: 'editor.html#' + utils.param({
                                        id: trackerId
                                    })
                                });
                            } else
                            if (target.dataset.action === 'remove') {
                                e.preventDefault();
                                var trackerNode = target.parentNode;
                                trackerId = trackerNode.dataset.id;
                                trackerNode.parentNode.removeChild(trackerNode);
                                removedTrackerIds.push(trackerId);
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
                                profile.name = profileName.value;
                                profile.trackers = profileTrackers;

                                if (profiles.indexOf(profile) === -1) {
                                    profiles.push(profile);
                                    profileIdProfileMap[profile.id] = profile;
                                }

                                removedTrackerIds.forEach(function (id) {
                                    delete trackers[id];
                                });

                                chrome.storage.local.set({
                                    profiles: profiles,
                                    trackers: trackers
                                }, function () {
                                    close();
                                    self.onSave();
                                });
                            }]
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

        this.onClose = function () {

        };

        this.onSave = function () {

        };

        this.show = function () {
            layer = createLayer();
            document.body.appendChild(layer.node);
        };
    };
    ProfileManager.prototype.getProfileId = function (profileIdProfileMap) {
        var id = 0;
        while (profileIdProfileMap[id]) {
            id++;
        }
        return id;
    };
    ProfileManager.prototype.getDefaultProfile = function (profileIdProfileMap) {
        return {
            name: chrome.i18n.getMessage('defaultProfileName'),
            id: this.getProfileId(profileIdProfileMap),
            trackers: []
        }
    };
    return ProfileManager;
});