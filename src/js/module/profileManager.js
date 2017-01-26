/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
define([
    './utils',
    './dom'
], function (utils, dom) {
    var ProfileManager = function (profiles, profileController, trackers, ee, sync) {
        var self = this;

        var syncProfiles = function (newProfiles, cb) {
            if (sync) {
                chrome.storage.sync.set({
                    profiles: newProfiles
                }, cb);
            } else {
                cb();
            }
        };

        var Blank = function () {
            var self = this;
            var titleNode;
            var bodyNode;
            var footerNode;
            var node = dom.el('div', {
                class: 'manager__layer',
                append: [
                    dom.el('div', {
                        class: 'manager',
                        append: [
                            dom.el('div', {
                                class: 'manager__header',
                                append: [
                                    titleNode = dom.el('div', {
                                        class: 'header__title'
                                    }),
                                    dom.el('a', {
                                        href: '#close',
                                        class: 'header__close',
                                        text: chrome.i18n.getMessage('close'),
                                        on: ['click', function (e) {
                                            e.preventDefault();
                                            self.destroy();
                                        }]
                                    })
                                ]
                            }),
                            bodyNode = dom.el('div', {
                                class: 'manager__body'
                            }),
                            footerNode = dom.el('div', {
                                class: 'manager__footer'
                            })
                        ]
                    })
                ]
            });

            var closeEvent = function (e) {
                if (!node.contains(e.target)) {
                    self.destroy();
                }
            };

            var onDestroyFnList = [];

            this.node = node;
            this.titleNode = titleNode;
            this.bodyNode = bodyNode;
            this.footerNode = footerNode;
            this.show = function (isReplace) {
                !isReplace && document.body.appendChild(node);
                document.addEventListener('click', closeEvent, true);
            };
            this.destroy = function (isReplace) {
                !isReplace && node.parentNode.removeChild(node);
                document.removeEventListener('click', closeEvent, true);

                var fn;
                while (fn = onDestroyFnList.shift()) {
                    fn();
                }
            };
            this.onDestroy = function (cb) {
                onDestroyFnList.push(cb);
            };
            this.replace = function (newBlank) {
                self.destroy(true);
                node.parentNode.replaceChild(newBlank.node, node);
                newBlank.show(true);
            };
        };

        var getProfileEditor = function (/**profile*/profile) {
            var blankObj = new Blank();

            blankObj.titleNode.textContent = chrome.i18n.getMessage('manageProfile');

            var profileNameNode = null;

            blankObj.bodyNode.appendChild(dom.el('div', {
                class: 'manager__sub_header',
                append: [
                    dom.el('div', {
                        class: ['profile__input'],
                        append: [
                            profileNameNode = dom.el('input', {
                                class: ['input__input'],
                                type: 'text',
                                value: profile.name
                            })
                        ]
                    })
                ]
            }));

            var getTrackerItemNode = function (tracker, checked) {
                var classList = ['item'];
                if (checked) {
                    classList.push('item__selected');
                }
                return dom.el('div', {
                    class: classList,
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
                                dom.el('input', {
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
                        !tracker.meta.version ? '' : dom.el('div', {
                                class: 'item__version',
                                text: tracker.meta.version
                            }),
                        (!tracker.meta.updateURL && !tracker.meta.downloadURL) ? '' : dom.el('a', {
                                class: ['item__update', 'item__button', 'button-update'],
                                href: '#update',
                                data: {
                                    action: 'update'
                                },
                                title: chrome.i18n.getMessage('update')
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
                    ]
                });
            };

            var trackerSetChecked = function (checked) {
                this.checked = checked;
                var checkboxNode = this.node.querySelector('.item__checkbox input');
                if (checked) {
                    this.node.classList.add('item__selected');
                    checkboxNode.checked = true;
                } else {
                    this.node.classList.remove('item__selected');
                    checkboxNode.checked = false;
                }
            };

            var getTrackerList = function () {
                var removedTrackerIds = [];
                var trackerIdItem = {};

                var trackerRefresh = function () {
                    var newTracker = trackers[this.id];
                    var newNode = getTrackerItemNode(newTracker, this.checked);
                    this.node.parentNode.replaceChild(newNode, this.node);
                    this.node = newNode;
                };

                var trackerRemove = function () {
                    var parent = this.node.parentNode;
                    if (parent) {
                        parent.removeChild(this.node);
                    }
                };

                var node = dom.el('div', {
                    class: 'manager__trackers',
                    append: (function () {
                        var list = [];
                        profile.trackers.forEach(function (/**profileTracker*/profileTracker) {
                            var tracker = trackers[profileTracker.id];
                            if (!tracker) {
                                tracker = {
                                    id: profileTracker.id,
                                    meta: {},
                                    info: {}
                                }
                            }
                            var trackerItem = {
                                id: tracker.id,
                                setChecked: trackerSetChecked,
                                checked: true,
                                node: getTrackerItemNode(tracker, true),
                                refresh: trackerRefresh,
                                remove: trackerRemove
                            };
                            trackerIdItem[trackerItem.id] = trackerItem;
                            list.push(trackerItem.node);
                        });
                        Object.keys(trackers).forEach(function (/**tracker*/trackerId) {
                            var tracker = trackers[trackerId];
                            if (!trackerIdItem[tracker.id]) {
                                var trackerItem = {
                                    id: tracker.id,
                                    setChecked: trackerSetChecked,
                                    checked: false,
                                    node: getTrackerItemNode(tracker, false),
                                    refresh: trackerRefresh,
                                    remove: trackerRemove
                                };
                                trackerIdItem[trackerItem.id] = trackerItem;
                                list.push(trackerItem.node);
                            }
                        });
                        return list;
                    })(),
                    on: ['click', function (e) {
                        var target = e.target;
                        var itemNode = dom.closestNode(this, target);
                        var trackerItem = trackerIdItem[itemNode && itemNode.dataset.id];
                        if (trackerItem) {
                            var trackerId = trackerItem.id;
                            if (target.dataset.action === 'edit') {
                                e.preventDefault();
                                chrome.tabs.create({
                                    url: 'editor.html#' + utils.param({
                                        id: trackerId
                                    })
                                });
                            } else
                            if (target.dataset.action === 'remove') {
                                e.preventDefault();
                                var trackerNode = target.parentNode;
                                trackerNode.parentNode.removeChild(trackerNode);
                                removedTrackerIds.push(trackerId);
                            } else
                            if (target.dataset.action === 'update') {
                                e.preventDefault();
                                var versionNode = trackerItem.node.querySelector('.item__version');
                                var defText = versionNode.textContent;
                                versionNode.textContent = '...';
                                chrome.runtime.sendMessage({
                                    action: 'update',
                                    id: trackerId,
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
                                });
                            } else
                            if (target.type === 'checkbox' && target.parentNode.classList.contains('item__checkbox')) {
                                trackerItem.setChecked(target.checked);
                            } else
                            if (target.classList.contains('item') || target.classList.contains('item__name')) {
                                e.preventDefault();
                                trackerItem.setChecked(!trackerItem.checked);
                            }
                        }
                    }]
                });

                require(['jquery'], function () {
                    require(['jqueryUi'], function () {
                        var $node = $(node);
                        $node.sortable({
                            axis: 'y',
                            handle: '.item__move',
                            scroll: false
                        });
                    });
                });
                
                return {
                    node: node,
                    refreshTracker: function (id) {
                        trackerIdItem[id].refresh();
                    },
                    removeTracker: function (id) {
                        trackerIdItem[id].remove();
                    },
                    getTrackers: function () {
                        var cloneTrackers = utils.clone(trackers);
                        removedTrackerIds.forEach(function (id) {
                            delete cloneTrackers[id];
                        });
                        return cloneTrackers;
                    },
                    getProfileTrackers: function () {
                        var profileTrackers = [];
                        [].slice.call(node.childNodes).forEach(function (trackerNode) {
                            var id = trackerNode.dataset.id;
                            var trackerItem = trackerIdItem[id];
                            if (trackerItem.checked) {
                                profileTrackers.push({
                                    id: id
                                });
                            }
                        });
                        return profileTrackers;
                    }
                }
            };
            var trackersList = getTrackerList();
            blankObj.bodyNode.appendChild(trackersList.node);

            var onTrackerInsert = function () {
                var newTrackerList = getTrackerList();
                trackersList.node.parentNode.replaceChild(newTrackerList.node, trackersList.node);
                trackersList = newTrackerList;
            };

            blankObj.footerNode.appendChild(dom.el(document.createDocumentFragment(), {
                append: [
                    dom.el('a', {
                        href: '#save',
                        class: ['button', 'manager__footer__btn'],
                        text: chrome.i18n.getMessage('save'),
                        on: ['click', function (e) {
                            e.preventDefault();

                            var cloneProfiles = utils.clone(profiles);
                            var cloneProfile = utils.getItemId(cloneProfiles, profile.id);
                            if (!cloneProfile) {
                                cloneProfile = profile;
                                cloneProfiles.push(profile);
                            }

                            cloneProfile.name = profileNameNode.value;
                            cloneProfile.trackers = trackersList.getProfileTrackers();

                            var cloneTrackers = trackersList.getTrackers();

                            chrome.storage.local.set({
                                profiles: cloneProfiles,
                                trackers: cloneTrackers
                            }, function () {
                                syncProfiles(cloneProfiles, function () {
                                    blankObj.destroy();
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
                ]
            }));

            var onTrackerChange = function (id, changes) {
                if (changes.indexOf('meta') !== -1) {
                    trackersList.refreshTracker(id);
                }
            };

            var onTrackerRemoved = function (id) {
                trackersList.removeTracker(id);
            };

            var onProfileFieldChange = function (id, changes) {
                if (id === profile.id) {
                    if (changes.indexOf('name') !== -1) {
                        profileNameNode.value = profile.name;
                    }
                    if (changes.indexOf('trackers') !== -1) {
                        onTrackerInsert();
                    }
                }
            };

            ee.on('trackerChange', onTrackerChange);
            ee.on('trackerRemoved', onTrackerRemoved);
            ee.on('trackerInsert', onTrackerInsert);
            ee.on('profileFieldChange', onProfileFieldChange);

            blankObj.onDestroy(function () {
                ee.off('trackerChange', onTrackerChange);
                ee.off('trackerRemoved', onTrackerRemoved);
                ee.off('trackerInsert', onTrackerInsert);
                ee.off('profileFieldChange', onProfileFieldChange);
            });

            return blankObj;
        };

        var getProfileChooser = function () {
            var blankObj = new Blank();

            blankObj.titleNode.textContent = chrome.i18n.getMessage('manageProfiles');

            blankObj.bodyNode.appendChild(dom.el('div', {
                class: ['manager__sub_header', 'manager__sub_header-profiles'],
                append: [
                    dom.el('a', {
                        class: ['manager__new_profile'],
                        href: '#new_profile',
                        text: chrome.i18n.getMessage('newProfile'),
                        on: ['click', function (e) {
                            e.preventDefault();
                            var profile = self.getDefaultProfile(profileController);
                            blankObj.replace(getProfileEditor(profile));
                        }]
                    })
                ]
            }));

            var getProfileItemNode = function (profile) {
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

            var profileRemove = function () {
                var parent = this.node.parentNode;
                if (parent) {
                    parent.removeChild(this.node);
                }
            };

            var profileRefresh = function () {
                var _this = this;
                var newProfile = null;
                profiles.some(function (profile) {
                    if (_this.id === profile.id) {
                        newProfile = profile;
                        return true;
                    }
                });
                var newNode = getProfileItemNode(newProfile);
                this.node.parentNode.replaceChild(newNode, this.node);
                this.node = newNode;
            };

            var getProfileList = function () {
                var profileIdItem = {};
                var node = dom.el('div', {
                    class: 'manager__profiles',
                    append: (function () {
                        var list = [];
                        profiles.forEach(function (/**profile*/profile) {
                            var profileObj = {
                                id: profile.id,
                                node: getProfileItemNode(profile),
                                refresh: profileRefresh,
                                remove: profileRemove
                            };
                            profileIdItem[profileObj.id] = profileObj;
                            list.push(profileObj.node)
                        });
                        return list;
                    })(),
                    on: ['click', function (e) {
                        var target = e.target;
                        var profileId, profile = null;
                        if (target.dataset.action === 'edit') {
                            e.preventDefault();
                            profileId = target.parentNode.dataset.id;
                            profiles.some(function (_profile) {
                                if (_profile.id == profileId) {
                                    profile = _profile;
                                }
                            });
                            blankObj.replace(getProfileEditor(profile));
                        } else
                        if (target.dataset.action === 'remove') {
                            e.preventDefault();
                            var profileNode = target.parentNode;
                            profileNode.parentNode.removeChild(profileNode);
                        }
                    }]
                });

                require(['jquery'], function () {
                    require(['jqueryUi'], function () {
                        var $node = $(node);
                        $node.sortable({
                            axis: 'y',
                            handle: '.item__move',
                            scroll: false
                        });
                    });
                });

                return {
                    node: node,
                    refreshProfile: function (id) {
                        profileIdItem[id].refresh();
                    },
                    removeProfile: function (id) {
                        profileIdItem[id].remove();
                    },
                    getProfiles: function () {
                        var profileIdMap = {};
                        profiles.forEach(function (profile) {
                            profileIdMap[profile.id] = profile;
                        });

                        var newProfiles = [];
                        [].slice.call(node.childNodes).forEach(function (profileNode) {
                            var id = profileNode.dataset.id;
                            newProfiles.push(profileIdMap[id]);
                        });
                        return newProfiles;
                    }
                };
            };

            var profilesList = getProfileList();
            blankObj.bodyNode.appendChild(profilesList.node);

            blankObj.footerNode.appendChild(dom.el('a', {
                href: '#save',
                class: ['button', 'manager__footer__btn'],
                text: chrome.i18n.getMessage('save'),
                on: ['click', function (e) {
                    e.preventDefault();

                    var newProfiles = profilesList.getProfiles();

                    chrome.storage.local.set({
                        profiles: newProfiles
                    }, function () {
                        syncProfiles(newProfiles, function () {
                            blankObj.destroy();
                        });
                    });
                }]
            }));

            var onProfileRemoved = function (id) {
                profilesList.removeProfile(id);
            };

            var onProfileFieldChange = function (id, changes) {
                if (changes.indexOf('name') !== -1) {
                    profilesList.refreshProfile(id);
                }
            };

            var refreshProfileList = function () {
                var newProfilesList = getProfileList();
                blankObj.bodyNode.replaceChild(newProfilesList.node, profilesList.node);
                profilesList = newProfilesList;
            };

            ee.on('profileRemoved', onProfileRemoved);
            ee.on('profileFieldChange', onProfileFieldChange);
            ee.on('profileInsert', refreshProfileList);
            ee.on('profilesSortChange', refreshProfileList);

            blankObj.onDestroy(function () {
                ee.off('profileRemoved', onProfileRemoved);
                ee.off('profileFieldChange', onProfileFieldChange);
                ee.off('profileInsert', refreshProfileList);
                ee.off('profilesSortChange', refreshProfileList);
            });

            return blankObj;
        };

        this.show = function () {
            getProfileChooser().show();
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
    return ProfileManager;
});