/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
(function () {
    var utils = require('./utils');
    var dom = require('./dom');

    var ProfileManager = function (profiles, profileController, trackers, ee, sync) {
        var self = this;
        var layer = null;

        var syncProfiles = function (cb) {
            if (sync) {
                chrome.storage.sync.set({
                    profiles: profiles
                }, cb);
            } else {
                cb();
            }
        };

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
                            class: 'item__move'
                        }),
                        dom.el('div', {
                            class: 'item__name',
                            text: profile.name
                        }),
                        dom.el('a', {
                            class: ['item__action', 'item__button', 'button-edit'],
                            href: '#edit',
                            data: {
                                action: 'edit'
                            },
                            title: chrome.i18n.getMessage('edit')
                        }),
                        dom.el('a', {
                            class: ['item__action', 'item__button', 'button-remove'],
                            href: '#remove',
                            data: {
                                action: 'remove'
                            },
                            title: chrome.i18n.getMessage('remove')
                        })
                    ]
                });
            };

            var profilesNode = null;
            var node = dom.el(document.createDocumentFragment(), {
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
                                    var profile = self.getDefaultProfile(profileController);
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
                                profile = null;
                                profiles.some(function (_profile) {
                                    if (_profile.id == profileId) {
                                        profile = _profile;
                                    }
                                });
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
                            class: ['button', 'manager__footer__btn'],
                            text: chrome.i18n.getMessage('save'),
                            on: ['click', function (e) {
                                e.preventDefault();

                                var profileIdMap = {};
                                profiles.forEach(function (profile) {
                                    profileIdMap[profile.id] = profile;
                                });

                                var newProfiles = [];
                                [].slice.call(profilesNode.childNodes).forEach(function (profileNode) {
                                    var id = profileNode.dataset.id;
                                    newProfiles.push(profileIdMap[id]);
                                });

                                chrome.storage.local.set({
                                    profiles: newProfiles
                                }, function () {
                                    syncProfiles(function () {
                                        close();
                                    });
                                });
                            }]
                        })
                    ])
                ]
            });

            require('jqueryUi');
            var $profilesNode = $(profilesNode);
            $profilesNode.sortable({
                axis: 'y',
                handle: '.item__move',
                scroll: false
            });

            return node;
        };

        var getProfile = function (/**profile*/profile, trackers) {
            var getTrackerItem = function (tracker, checked, exists) {
                var checkboxNode;
                var versionNode;
                return dom.el('div', {
                    class: 'item',
                    data: {
                        id: tracker.id
                    },
                    append: [
                        dom.el('div', {
                            class: 'item__move'
                        }),
                        dom.el('div', {
                            class: 'item__checkbox',
                            append: [
                                checkboxNode = dom.el('input', {
                                    type: 'checkbox',
                                    checked: checked
                                })
                            ]
                        }),
                        dom.el('img', {
                            class: ['item__icon'],
                            src: tracker.meta.icon || tracker.meta.icon64,
                            on: ['error', function () {
                                this.src = './img/blank.svg'
                            }]
                        }),
                        dom.el('div', {
                            class: 'item__name',
                            text: tracker.meta.name || tracker.id
                        }),
                        !tracker.meta.version ? '' : versionNode = dom.el('div', {
                            class: 'item__version',
                            text: tracker.meta.version
                        }),
                        (!tracker.meta.updateURL && !tracker.meta.downloadURL) ? '' : dom.el('a', {
                            class: ['item__update', 'item__button', 'button-update'],
                            href: '#update',
                            data: {
                                action: 'update'
                            },
                            title: chrome.i18n.getMessage('update'),
                            on: ['click', function (e) {
                                e.preventDefault();
                                var defText = versionNode.textContent;
                                versionNode.textContent = '...';
                                chrome.runtime.sendMessage({
                                    action: 'update',
                                    id: tracker.id,
                                    force: true
                                }, function (response) {
                                    if (!response.success) {
                                        versionNode.textContent = defText;
                                    } else {
                                        var result = response.results[0];
                                        if (!result.success) {
                                            versionNode.textContent = result.message;
                                        } else {
                                            versionNode.textContent = result.version;
                                        }
                                    }
                                })
                            }]
                        }),
                        !tracker.meta.supportURL ? '' : dom.el('a', {
                            class: ['item__homepage', 'item__button', 'button-support'],
                            target: '_blank',
                            href: tracker.meta.supportURL
                        }),
                        !tracker.meta.homepageURL ? '' : dom.el('a', {
                            class: ['item__homepage', 'item__button', 'button-home'],
                            target: '_blank',
                            href: tracker.meta.homepageURL
                        }),
                        !tracker.meta.author ? '' : dom.el('div', {
                                class: 'item__author',
                                text: tracker.meta.author
                            }),
                        dom.el('a', {
                            class: ['item__action', 'item__button', 'button-edit'],
                            href: '#edit',
                            data: {
                                action: 'edit'
                            },
                            title: chrome.i18n.getMessage('edit')
                        }),
                        dom.el('a', {
                            class: ['item__action', 'item__button', 'button-remove'],
                            href: '#remove',
                            data: {
                                action: 'remove'
                            },
                            title: chrome.i18n.getMessage('remove')
                        })
                    ],
                    on: ['click', function (e) {
                        var child = dom.closestNode(this, e.target);
                        if (e.target === this || child && child.classList.contains('item__name')) {
                            checkboxNode.checked = !checkboxNode.checked;
                        }
                    }]
                })
            };

            var profileName = null;
            var trackersNode = null;
            var removedTrackerIds = [];

            var getTrackerList = function () {
                var fragment = document.createDocumentFragment();
                var idList = [];
                profile.trackers.forEach(function (/**profileTracker*/profileTracker) {
                    var tracker = trackers[profileTracker.id];
                    var exists = !!tracker;
                    if (!tracker) {
                        tracker = {
                            id: profileTracker.id,
                            meta: {},
                            info: {}
                        }
                    }
                    if (removedTrackerIds.indexOf(tracker.id) === -1) {
                        idList.push(tracker.id);
                        fragment.appendChild(getTrackerItem(tracker, true, exists));
                    }
                });
                Object.keys(trackers).forEach(function (/**tracker*/trackerId) {
                    var tracker = trackers[trackerId];
                    if (removedTrackerIds.indexOf(tracker.id) === -1) {
                        if (idList.indexOf(tracker.id) === -1) {
                            fragment.appendChild(getTrackerItem(tracker, false, true))
                        }
                    }
                });
                return fragment;
            };

            onTrackersUpdate = function () {
                trackersNode.textContent = '';
                trackersNode.appendChild(getTrackerList());
            };

            var node = dom.el(document.createDocumentFragment(), {
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
                        append: getTrackerList(),
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
                            class: ['button', 'manager__footer__btn'],
                            text: chrome.i18n.getMessage('save'),
                            on: ['click', function (e) {
                                e.preventDefault();
                                var profileTrackers = [];
                                [].slice.call(trackersNode.childNodes).forEach(function (trackerNode) {
                                    var id = trackerNode.dataset.id;
                                    var checkbox = trackerNode.querySelector('.item__checkbox input');
                                    var checked = checkbox.checked;
                                    if (checked) {
                                        profileTrackers.push({
                                            id: id
                                        })
                                    }
                                });

                                var cloneProfiles = utils.clone(profiles);
                                var cloneProfile = utils.getItemId(cloneProfiles, profile.id);
                                if (!cloneProfile) {
                                    cloneProfile = profile;
                                    cloneProfiles.push(profile);
                                }

                                cloneProfile.name = profileName.value;
                                cloneProfile.trackers = profileTrackers;

                                var cloneTrackers = utils.clone(trackers);
                                removedTrackerIds.forEach(function (id) {
                                    delete cloneTrackers[id];
                                });

                                chrome.storage.local.set({
                                    profiles: cloneProfiles,
                                    trackers: cloneTrackers
                                }, function () {
                                    syncProfiles(function () {
                                        close();
                                    });
                                });
                            }]
                        }),
                        dom.el('a', {
                            href: '#add',
                            class: ['button', 'manager__footer__btn'],
                            text: chrome.i18n.getMessage('add'),
                            on: ['click', function (e) {
                                e.preventDefault();
                                chrome.tabs.create({
                                    url: 'editor.html'
                                });
                            }]
                        }),
                        dom.el('a', {
                            href: '#addTrackerCode',
                            class: ['button', 'manager__footer__btn'],
                            text: chrome.i18n.getMessage('addTrackerCode'),
                            on: ['click', function (e) {
                                e.preventDefault();
                                chrome.tabs.create({
                                    url: 'editor.html#code=true'
                                });
                            }]
                        }),
                        dom.el('a', {
                            href: '#createCode',
                            class: ['button', 'manager__footer__btn'],
                            text: chrome.i18n.getMessage('createCode'),
                            on: ['click', function (e) {
                                e.preventDefault();
                                chrome.tabs.create({
                                    url: 'magic.html'
                                });
                            }]
                        })
                    ])
                ]
            });

            require('jqueryUi');
            var $trackersNode = $(trackersNode);
            $trackersNode.sortable({
                axis: 'y',
                handle: '.item__move',
                scroll: false
            });
            return node;
        };

        var createLayer = function () {
            var layer = getLayer();
            layer.content.appendChild(getProfiles(profiles));
            return layer;
        };

        var onTrackersUpdate = null;
        var onTrackersUpdateListener = function () {
            onTrackersUpdate && onTrackersUpdate();
        };
        var onTrackersChangeListener = function (id, changes) {
            if (changes.indexOf('meta') !== -1) {
                onTrackersUpdate && onTrackersUpdate();
            }
        };

        var close = function () {
            ee.off('trackerRemoved', onTrackersUpdateListener);
            ee.off('trackerInsert', onTrackersUpdateListener);
            ee.off('trackerChange', onTrackersChangeListener);
            document.removeEventListener('click', closeEvent, true);
            layer.node.parentNode.removeChild(layer.node);
        };

        var closeEvent = function (e) {
            if (!layer.node.contains(e.target)) {
                close();
            }
        };

        this.show = function () {
            layer = createLayer();
            document.body.appendChild(layer.node);
            document.addEventListener('click', closeEvent, true);
            ee.on('trackerRemoved', onTrackersUpdateListener);
            ee.on('trackerInsert', onTrackersUpdateListener);
            ee.on('trackerChange', onTrackersChangeListener);
        };
    };
    ProfileManager.prototype.getDefaultProfile = function (profileController) {
        var trackers = null;
        if (/^ru-?/.test(chrome.i18n.getUILanguage())) {
            trackers = ['nnmclub', 'rutracker', 'kinozal', 'rutor', 'hdclub', 'tfile', 'opentorrent'];
        } else {
            trackers = ['bitsnoop', 'extratorrent', 'thepiratebay'];
        }
        return {
            name: chrome.i18n.getMessage('defaultProfileName'),
            id: profileController.getProfileId(),
            trackers: trackers.map(function (name) {
                return {id: name};
            })
        }
    };
    module.exports = ProfileManager;
})();