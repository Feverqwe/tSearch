/**
 * Created by Anton on 08.04.2015.
 */
var profileManager = {
    domCache: {
        managerBody: document.getElementById('manager'),
        trackerList: document.querySelector('.mgr-tracker-list'),
        filterInput: document.getElementById('manager_search'),
        filterContainer: document.querySelector('.mgr-tracker-list-filter'),
        counter: document.getElementById('manager_counter'),
        title: document.getElementById('manager_title'),
        profileName: document.getElementById('manager_list_title'),
        closeBtn: document.getElementById('manager_close'),
        removeListBtn: document.getElementById('manager_remove_list'),
        extendView: document.getElementById('manager_extend_view'),
        saveBtn: document.getElementById('manager_save'),
        addCustomTrackerBtn: document.getElementById('manager_add_custom'),
        createCustomTrackerBtn: document.getElementById('manager_create_custom')
    },
    varCache: {
        filterList: {
            all: {lang: 'all'},
            hasList: {lang: 'withoutList'},
            custom: {lang: 'externalList'},
            selected: {selected: 1, lang: 'selectedItems'}
        },
        filterStyle: undefined,
        wordFilterCache: {},
        wordFilterStyle: undefined,
        trackerList: {},
        selectedFilter: undefined,
        currentProfileName: undefined
    },
    updateProfileList: function(currentProfile, changes, cb) {
        "use strict";
        engine.setProfileList(changes, function() {
            engine.prepareProfileList(currentProfile, changes);
            view.writeProfileList();
            view.selectProfile(currentProfile || engine.currentProfile);
            cb && cb();
        });
    },
    filterValueUpdate: function() {
        var trackerList = this.domCache.trackerList;
        var selectCount = trackerList.querySelectorAll('.tracker-item.selected').length;
        if (!selectCount) {
            this.domCache.counter.textContent = mono.language.selectedNothing;
        } else {
            this.domCache.counter.textContent = mono.language.selectedCount + ' ' + selectCount;
        }

        for (var type in this.varCache.filterList) {
            var filterObj = this.varCache.filterList[type];
            if (type === 'all') {
                filterObj.setValue(trackerList.querySelectorAll('.tracker-item').length);
            } else
            if (type === 'selected') {
                filterObj.setValue(selectCount);
            } else
            if (type === 'hasList') {
                filterObj.setValue(trackerList.querySelectorAll('.tracker-item:not(.hasList)').length);
            } else
            if (type === 'custom') {
                filterObj.setValue(trackerList.querySelectorAll('.tracker-item.custom').length);
            }
        }
    },
    orderTrackerList: function () {
        var trackerList = this.domCache.trackerList;

        var tmpSelectedList = trackerList.querySelectorAll(['.tmp-selected', '.tmp-hasList']);
        for (var i = 0, el; el = tmpSelectedList[i]; i++) {
            el.classList.remove('tmp-selected');
            el.classList.remove('tmp-hasList');
        }

        var list = document.createDocumentFragment();
        var selectedList = mono.nodeListToArray(trackerList.querySelectorAll('.tracker-item.selected:not(.not-found)'));
        selectedList = selectedList.concat(mono.nodeListToArray(trackerList.querySelectorAll('.tracker-item.selected.not-found')));
        for (i = 0, el; el = selectedList[i]; i++) {
            list.appendChild(el);
        }
        if (trackerList.firstChild !== null) {
            trackerList.insertBefore(list, trackerList.firstChild);
        } else {
            trackerList.appendChild(list);
        }
    },
    trackerHasListUpdate: function (trackerObj) {
        var state;
        if (trackerObj.selected) {
            state = 1;
        } else {
            for (var profileName in engine.profileList) {
                var trackerList = engine.profileList[profileName];
                if (trackerList.indexOf(trackerObj.id) !== -1) {
                    break;
                }
            }
        }

        if (trackerObj.hasList === state) return;

        if (trackerObj.hasList) {
            trackerObj.el.classList.remove('hasList');
        } else {
            trackerObj.el.classList.add('hasList');
            if (this.varCache.selectedFilter.type === 'hasList') {
                trackerObj.el.classList.add('tmp-hasList');
            }
        }
        trackerObj.hasList = state;
    },
    trackerObjSelect: function(trackerObj, state) {
        "use strict";
        if (trackerObj.selected === state) return;

        if (trackerObj.selected) {
            trackerObj.el.classList.remove('selected');
            if (this.varCache.selectedFilter.type === 'selected') {
                trackerObj.el.classList.add('tmp-selected');
            }
        } else {
            trackerObj.el.classList.add('selected');
        }
        trackerObj.selected = state;
        trackerObj.checkbox.checked = !!state;

        trackerObj.hasListUpdate();

        this.filterValueUpdate();
    },
    getTrackerEl: function(trackerObj, selected, hasList, notFound) {
        "use strict";
        var trackerItem = this.varCache.trackerList[trackerObj.id] = {};
        var classList = ['tracker-item'];
        if (selected) {
            trackerItem.selected = 1;
            classList.push('selected');
        } else {
            trackerItem.selected = 0;
        }
        if (hasList) {
            classList.push('hasList');
        }
        if (trackerObj.code) {
            classList.push('custom');
        }
        trackerItem.hasList = hasList;

        notFound && classList.push('not-found');

        trackerItem.el = mono.create('div', {
            class: classList,
            data: {
                id: trackerObj.id
            },
            append: [
                mono.create('i', {
                    class: 'icon',
                    style: 'background-image: url('+ exKit.getTrackerIconUrl(trackerObj.icon) +')'
                }),
                mono.create('div', {
                    class: 'title',
                    append: mono.create('a', {
                        title: trackerObj.title,
                        text: trackerObj.title,
                        href: trackerObj.search.baseUrl,
                        target: '_blank'
                    })
                }),
                trackerItem.desc = mono.create('span', {
                    class: 'desc',
                    text: trackerObj.desc
                }),
                mono.create('div', {
                    class: 'action',
                    append: [
                        trackerItem.checkbox = mono.create('input', {
                            type: 'checkbox',
                            checked: !!selected
                        }),
                        !trackerItem.code ? undefined : mono.create('a', {
                            class: 'edit',
                            href: '#',
                            on: ['click', function(e) {
                                e.preventDefault();
                                // TODO: Fix me!
                            }]
                        })
                    ]
                })
            ]
        });
        trackerItem.select = this.trackerObjSelect.bind(this, trackerItem);
        trackerItem.hasListUpdate = this.trackerHasListUpdate.bind(this, trackerItem);
        return trackerItem.el;
    },
    writeTrackerList: function(profileName) {
        "use strict";
        var currentProfile = engine.profileList[profileName] || [];
        this.domCache.trackerList.textContent = '';
        mono.create(this.domCache.trackerList, {
            append: function() {
                var list = [];
                var trackerObj, trackerId, profileName, selected, hasList;
                for (var trackerId in engine.trackerLib) {
                    trackerObj = engine.trackerLib[trackerId];

                    hasList = false;
                    for (profileName in engine.profileList) {
                        if (engine.profileList[profileName].indexOf(trackerObj.id) !== -1) {
                            hasList = true;
                            break;
                        }
                    }

                    selected = currentProfile.indexOf(trackerObj.id) !== -1;

                    list.push(this.getTrackerEl(trackerObj, selected, hasList));
                }
                for (var i = 0, trackerId; trackerId = currentProfile[i]; i++) {
                    if (engine.trackerLib.hasOwnProperty(trackerId)) continue;
                    trackerObj = {
                        id: trackerId,
                        icon: '#skull',
                        title: trackerId,
                        search: {
                            baseUrl: 'http://code-tms.blogspot.ru/search?q=' + encodeURIComponent(trackerId)
                        },
                        desc: mono.language.trackerIsNotFound
                    };

                    list.push(this.getTrackerEl(trackerObj, true, true, true));
                }
                return list;
            }.call(this)
        });
    },
    getSelectedTrackerList: function() {
        "use strict";
        var elList = this.domCache.trackerList.querySelectorAll('.tracker-item.selected');
        var list = [];
        for (var i = 0, el; el = elList[i]; i++) {
            list.push(el.dataset.id);
        }
        return list;
    },
    filterBy: function(type) {
        this.varCache.filterList[type].select(1);

        if (this.varCache.filterStyle) {
            this.varCache.filterStyle.parentNode.removeChild(this.varCache.filterStyle);
            this.varCache.filterStyle = undefined;
        }

        if (type === 'selected') {
            this.varCache.filterStyle = mono.create('style', {
                text: '#manager '
                + '.mgr-tracker-list > div:not(.selected) {'
                +    'display: none;'
                + '}'
                + '#manager '
                +    '.mgr-tracker-list > div.tmp-selected {'
                +    'display: block;'
                + '}'
            });
        } else
        if (type === 'hasList') {
            this.varCache.filterStyle = mono.create('style', {
                text: '#manager '
                + '.mgr-tracker-list > div.hasList {'
                +   'display: none;'
                + '}'
                + '#manager '
                +   '.mgr-tracker-list > div.hasList.tmp-hasList {'
                +   'display: block;'
                + '}'
            });
        } else
        if (type === 'custom') {
            this.varCache.filterStyle = mono.create('style', {
                text: '#manager '
                + '.mgr-tracker-list > div:not(.custom) {'
                +   'display: none;'
                + '}'
            });
            this.domCache.managerBody.classList.add('show-tools');
        }

        this.varCache.filterStyle && document.body.appendChild(this.varCache.filterStyle);
    },
    filterSetValue: function(filterObj, value) {
        "use strict";
        if (filterObj.value === value) return;

        filterObj.value = value;
        filterObj.valueEl.textContent = value;
    },
    filterSelect: function(filterObj, state) {
        "use strict";
        if (filterObj.selected === state) return;

        this.varCache.selectedFilter.selected = 0;
        this.varCache.selectedFilter.el.classList.remove('selected');

        if (this.varCache.selectedFilter.type === 'custom') {
            this.domCache.managerBody.classList.remove('show-tools');
        }

        this.varCache.selectedFilter = filterObj;
        filterObj.selected = state;
        this.varCache.selectedFilter.el.classList.add('selected');

        if (state && filterObj.type === 'custom') {
            this.domCache.managerBody.classList.add('show-tools');
        }
    },
    writeFilterList: function() {
        "use strict";
        var filterContainer = this.domCache.filterContainer;
        var list = document.createDocumentFragment();
        for (var type in this.varCache.filterList) {
            var filterObj = this.varCache.filterList[type];
            var classList = [];
            if (filterObj.selected) {
                classList.push('selected');
                this.varCache.selectedFilter = filterObj;
            } else {
                filterObj.selected = 0;
            }
            list.appendChild(filterObj.el = mono.create('a', {
                class: classList,
                data: {
                    type: type
                },
                href: '#',
                text: mono.language[filterObj.lang] + ' ',
                append: filterObj.valueEl = mono.create('i', {
                    text: 0
                })
            }));
            filterObj.type = type;
            filterObj.value = 0;
            filterObj.setValue = this.filterSetValue.bind(this, filterObj);
            filterObj.select = this.filterSelect.bind(this, filterObj);
        }
        filterContainer.insertBefore(list, filterContainer.firstChild);
    },
    onFilterKeyUp: function() {
        "use strict";
        if (this.varCache.wordFilterStyle !== undefined) {
            this.varCache.wordFilterStyle.parentNode.removeChild(this.varCache.wordFilterStyle);
            this.varCache.wordFilterStyle = undefined;

            var elList = this.domCache.trackerList.querySelectorAll('div[data-filtered="true"]');
            for (var i = 0, el; el = elList[i]; i++) {
                el.dataset.filtered = false;
            }
        }

        var request = this.domCache.filterInput.value.toLowerCase().trim();
        if (!request) {
            return;
        }

        if (this.varCache.selectedFilter.type === 'selected') {
            this.filterBy('all');
        }

        var trackerItemList = this.varCache.trackerList;
        var trackerLib = engine.trackerLib;
        var trackerObjList = mono.nodeListToArray(this.domCache.trackerList.querySelectorAll('.tracker-item'));
        trackerObjList.filter(function(el) {
            var id = el.dataset.id;
            var trackerObj = trackerLib[id] || {search: {}};
            var trackerItem = trackerItemList[id];

            var text = this.varCache.wordFilterCache[id];
            if (text === undefined) {
                text = (trackerObj.desc || '').toLowerCase();
                text += ' ' + (trackerObj.search.baseUrl || '').toLowerCase();
                text += ' ' + (trackerObj.title || '').toLowerCase();
                this.varCache.wordFilterCache[id] = text;
            }

            if (text.indexOf(request) !== -1) {
                trackerItem.el.dataset.filtered = true;
                return true;
            }
            return false;
        }.bind(this));

        document.body.appendChild(this.varCache.wordFilterStyle = mono.create('style', {
            text: ''
            + '#manager .mgr-tracker-list > div:not([data-filtered="true"]) {'
            +   'display: none;'
            + '}'
        }));
    },
    once: function() {
        "use strict";
        if (this.once.ready) return;
        this.once.ready = 1;

        this.writeFilterList();

        this.domCache.managerBody.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        this.domCache.closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            this.onHide();
        }.bind(this));

        this.domCache.saveBtn.addEventListener('click', function(e) {
            e.preventDefault();

            var profileName = this.domCache.profileName.value.trim();
            if (!profileName) {
                this.domCache.profileName.classList.add('error');
                setTimeout(function() {
                    this.domCache.profileName.classList.remove('error');
                }.bind(this), 1500);
                return;
            }

            if (this.varCache.currentProfileName) {
                delete engine.profileList[this.varCache.currentProfileName];
            }
            engine.profileList[profileName] = this.getSelectedTrackerList();

            var changes = {
                profileList: engine.profileList
            };

            this.updateProfileList(profileName, changes, function () {
                this.onHide();
            }.bind(this));
        }.bind(this));

        this.domCache.removeListBtn.addEventListener('click', function(e) {
            e.preventDefault();

            delete engine.profileList[this.varCache.currentProfileName];

            var changes = {
                profileList: engine.profileList
            };

            this.updateProfileList(undefined, changes, function () {
                this.onHide();
            }.bind(this));
        }.bind(this));

        this.domCache.filterContainer.addEventListener('click', function(e) {
            var el = e.target;
            if (this === el) return;
            while (el.parentNode !== this) {
                el = el.parentNode;
            }

            var type = el.dataset.type;
            if (!type) return;

            e.preventDefault();
            var _this = profileManager;
            _this.orderTrackerList();
            _this.filterBy(type);
        });

        this.domCache.trackerList.addEventListener('click', function(e) {
            var el = e.target;
            if (el.tagName === 'A') return;

            if (this === el) return;
            while (el.parentNode !== this) {
                el = el.parentNode;
            }

            var _this = profileManager;
            var trackerObj = _this.varCache.trackerList[el.dataset.id];
            trackerObj.select(!trackerObj.selected ? 1 : 0)
        });

        this.domCache.extendView.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.classList.contains('checked')) {
                profileManager.domCache.managerBody.classList.remove('extend');
                this.classList.remove('checked');
            } else {
                profileManager.domCache.managerBody.classList.add('extend');
                this.classList.add('checked');
            }
        });

        this.domCache.addCustomTrackerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var _this = this;
            var $body = showNotification([
                [{label: {text: mono.language.copyAndEnterTrackerCode}}],
                {textarea: {name: 'code'}},
                [
                    {input: {type: "button", value: mono.language.add, name: 'yesBtn', on: ['click', function(e) {
                        e.stopPropagation();
                        var formData = this.getFormData();

                        try {
                            var json = JSON.parse(formData.code);
                        } catch (e) {
                            alert(mono.language.trackerCodeReadError + "\n" + e);
                            return;
                        }

                        if (!json.uid) {
                            alert(mono.language.trackerCodeReadError);
                            return;
                        }

                        this.close();

                        exKit.prepareCustomTracker(json);

                        _this.writeTrackerList(_this.varCache.currentProfileName);
                        _this.filterValueUpdate();
                        _this.filterBy('custom');

                        mono.storage.get('customTorrentList', function(storage) {
                            var customTorrentList = storage.customTorrentList || {};
                            customTorrentList[json.uid] = json;
                            mono.storage.set({customTorrentList: customTorrentList});
                        });
                    }]}},
                    {input: {type: "button", value: mono.language.cancel, name: 'noBtn', on: ['click', function(e) {
                        e.stopPropagation();
                        this.close();
                    }]}}
                ]
            ]);
            $body.addClass('custom-tracker');
            $body.on('click', function(e) {
                e.stopPropagation();
            });
        }.bind(this));

        this.domCache.filterInput.addEventListener('keyup', mono.throttle(profileManager.onFilterKeyUp, 250, this));

        this.domCache.filterInput.addEventListener('dblclick', function() {
            this.value = '';
            this.dispatchEvent(new CustomEvent('keyup'));
        });

        $(this.domCache.trackerList).sortable({
            placeholder: "ui-state-highlight",
            delay: 150
        });
    },
    isShow: function() {
        "use strict";
        return this.domCache.managerBody.classList.contains('show');
    },
    onShow: function() {
        "use strict";
        this.domCache.managerBody.classList.add('show');
        document.body.addEventListener('click', function onBodyClick() {
            document.body.removeEventListener('click', onBodyClick);
            this.onHide();
        }.bind(this));
    },
    onHide: function() {
        "use strict";
        this.domCache.managerBody.classList.remove('show');
        this.varCache.currentProfileName = undefined;
        this.domCache.trackerList.textContent = '';
        this.domCache.profileName.value = '';
        this.domCache.filterInput.dispatchEvent(new CustomEvent('dblclick'));
        if (this.domCache.extendView.classList.contains('checked')) {
            this.domCache.extendView.dispatchEvent(new CustomEvent('click'));
        }
    },
    add: function() {
        "use strict";
        this.once();
        if (this.isShow()) {
            this.onHide();
        }
        this.onShow();

        this.domCache.title.textContent = mono.language.addTrackerList;
        this.domCache.removeListBtn.classList.add('hide');
        this.domCache.profileName.focus();

        this.writeTrackerList();
        this.filterValueUpdate();
        this.filterBy('all');
    },
    edit: function(profileName) {
        "use strict";
        this.once();
        if (this.isShow()) {
            this.onHide();
        }
        this.onShow();

        this.domCache.title.textContent = mono.language.editTrackerList;
        this.varCache.currentProfileName = profileName;
        this.domCache.profileName.value = profileName.replace('%defaultProfileName%', mono.language.defaultProfileName);
        this.domCache.removeListBtn.classList.remove('hide');

        this.writeTrackerList(profileName);
        this.filterValueUpdate();
        this.filterBy('selected');
    }
};