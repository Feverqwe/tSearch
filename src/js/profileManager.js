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
        advancedView: document.getElementById('manager_advanced_view'),
        saveBtn: document.getElementById('manager_save'),
        addCustomTrackerBtn: document.getElementById('manager_add_custom'),
        createCustomTrackerBtn: document.getElementById('manager_create_custom')
    },
    varCache: {
        filter: undefined,
        filterStyle: undefined,
        wordFilterCache: undefined,
        wordFilterStyle: undefined,
        filterEl: null
    },
    updateProfileList: function(currentProfile, changes, cb) {
        "use strict";
        engine.setProfileList(changes, function() {
            engine.prepareProfileList(engine.currentProfile, changes);
            view.writeProfileList();
            view.selectProfile(engine.currentProfile);

            cb && cb();
        });
    },
    numbersUpdate: function() {
        var $trackerList = $(this.domCache.trackerList);
        var selectCount = $trackerList.children('.selected').length;
        if (!selectCount) {
            this.domCache.counter.text(mono.language.mgrNothingSelected);
        } else {
            this.domCache.counter.text(mono.language.mgrSelectedN + ' ' + selectCount);
        }

        var elList = this.domCache.filterContainer.querySelectorAll('a[data-type] > i');
        for (var i = 0, el; el = elList[i]; i++) {
            var type = el.parentNode.dataset.type;
            if (type === 'all') {
                el.textContent = $trackerList.children().length;
            } else
            if (type === 'selected') {
                el.textContent = selectCount;
            } else
            if (type === 'unused') {
                el.textContent = $trackerList.children(':not(.inList)').length;
            } else
            if (type === 'custom') {
                el.textContent = $trackerList.children('.custom').length;
            }
        }
    },
    filterBy: function(type) {
        this.varCache.filter = type;
        this.domCache.managerBody.classList.remove('show-tools');
        if (this.varCache.filterStyle) {
            this.varCache.filterStyle.parentNode.removeChild(this.varCache.filterStyle);
            this.varCache.filterStyle = undefined;
        }

        if (type === 'selected') {
            this.varCache.filterStyle = mono.create('style', {
                text: '#manager '
                + '.mgr-tracker-list > div:not(.selected) {'
                    + 'display: none;'
                + '}'
                + '#manager '
                + '.mgr-tracker-list > div.tmp-selected {'
                    + 'display: block;'
                + '}'
            });
        } else
        if (type === 'unused') {
            this.varCache.filterStyle = mono.create('style', {
                text: '#manager '
                + '.mgr-tracker-list > div.inList {'
                + 'display: none;'
                + '}'
                + '#manager '
                + '.mgr-tracker-list > div.inList.tmp-used {'
                + 'display: block;'
                + '}'
            });
        } else
        if (type === 'custom') {
            this.varCache.filterStyle = mono.create('style', {
                text: '#manager '
                + '.mgr-tracker-list > div:not(.custom) {'
                + 'display: none;'
                + '}'
            });
            this.domCache.managerBody.classList.add('show-tools');
        }

        this.varCache.filterStyle && document.body.appendChild(this.varCache.filterStyle);
    },
    orderTrackerList: function (custom, editMode) {
        var trackerList = this.domCache.trackerList;
        var childNodes = trackerList.childNodes;
        for (var i = 0, el; el = childNodes[i]; i++) {
            el.classList.remove('tmp_selected');
            el.classList.remove('tmp_used');
        }

        var list = document.createDocumentFragment();
        if (!custom && editMode === 1) {
            engine.profileList[engine.currentProfile].forEach(function (id) {
                var el = trackerList.querySelector('div[data-id="' + id + '"]');
                if (el === null) {
                    trackerList.appendChild(
                        el = this.getTrackerEl(id)
                    );
                }
                list.appendChild(el);
            });
        } else {
            var selectedList = trackerList.querySelectorAll('.selected');
            for (i = 0, el; el = selectedList[i]; i++) {
                list.appendChild(el);
            }
        }
        if (trackerList.firstChild !== null) {
            trackerList.insertBefore(list, trackerList.firstChild);
        } else {
            trackerList.appendChild(list);
        }
    },
    onFilter: function (el, type) {
        if (this.varCache.filterEl !== null) {
            this.varCache.filterEl.classList.remove('selected');
        }
        this.varCache.filterEl = el;
        el.classList.add('selected');
        this.orderTrackerList(1);
        this.filterBy(type);
        this.domCache.filterInput.value = '';
        this.domCache.filterInput.dispatchEvent(new CustomEvent('keyup'));
        this.domCache.trackerList.scrollTop = 0;
    },
    getTrackerEl: function(trackerObj, selected, inList) {
        "use strict";
        var classList = ['tracker-item'];
        selected && classList.push('selected');
        inList && classList.push('inList');
        return mono.create('div', {
            class: classList,
            data: {
                id: trackerObj.id
            },
            append: [
                mono.create('i', {
                    class: 'icon',
                    style: 'background-image: url('+trackerObj.icon+')'
                }),
                mono.create('a', {
                    class: 'title',
                    title: trackerObj.title,
                    text: trackerObj.title,
                    href: trackerObj.search.baseUrl,
                    target: '_blank'
                }),
                mono.create('span', {
                    class: 'desc',
                    text: trackerObj.desc
                }),
                mono.create('div', {
                    append: [
                        mono.create('input', {
                            type: 'checkbox',
                            checked: !!selected
                        }),
                        mono.create('a', {
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
    },
    writeTrackerList: function() {
        "use strict";
        var currentProfile = engine.profileList[engine.currentProfile] || [];
        this.domCache.trackerList.textContent = '';
        mono.create(this.domCache.trackerList, {
            append: function() {
                var list = [];
                for (var trackerId in engine.trackerLib) {
                    var trackerObj = engine.trackerLib[trackerId];

                    var inList = false;
                    for (var profileName in engine.profileList) {
                        if (engine.profileList[profileName].indexOf(trackerObj.id) !== -1) {
                            inList = true;
                            break;
                        }
                    }

                    var selected = currentProfile.indexOf(trackerObj.id) !== -1;

                    list.push(this.getTrackerEl(trackerObj, selected, inList));
                }
                return list;
            }.call(this)
        });
    },
    once: function() {
        "use strict";
        if (this.once.ready) return;
        this.once.ready = 1;

        this.domCache.closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            this.onHide();
        }.bind(this));

        this.domCache.saveBtn.addEventListener('click', function(e) {
            e.preventDefault();

            var elList = this.domCache.trackerList.querySelectorAll('.selected');
            var list = [];
            for (var i = 0, el; el = elList[i]; i++) {
                list.push(el.dataset.id);
            }

            var profileName = $.trim(this.domCache.profileName.value);
            if (!profileName) {
                this.domCache.profileName.addClass('error');
                setTimeout(function() {
                    this.domCache.profileName.removeClass('error');
                }.bind(this), 1500);
                return;
            }

            engine.profileList[profileName] = list;

            var changes = {
                profileList: engine.profileList
            };

            this.updateProfileList(profileName, changes, function () {
                onHide();
            });
        }.bind(this));

        this.domCache.removeListBtn.addEventListener('click', function(e) {
            e.preventDefault();
            delete engine.profileList[engine.currentProfile];

            var changes = {
                profileList: engine.profileList
            };

            this.updateProfileList(engine.currentProfile, changes, function () {
                this.onHide();
            }.bind(this));
        }.bind(this));

        this.varCache.filterEl = this.domCache.filterContainer.querySelector('.selected');
        this.domCache.filterContainer.addEventListener('click', function(e) {
            var el = e.target;
            if (this === el) return;
            while (el.parentNode !== this) {
                el = el.parentNode;
            }

            e.preventDefault();
            var _this = profileManager;
            _this.onFilter(el, el.dataset.type);
        });

        this.domCache.filterInput.addEventListener('keyup', function() {
            var _this = profileManager;

            if (_this.varCache.wordFilterStyle !== undefined) {
                _this.varCache.wordFilterStyle.parentNode.removeChild(_this.varCache.wordFilterStyle);
                _this.varCache.wordFilterStyle = undefined;

                var elList = _this.domCache.trackerList.querySelectorAll('div[data-filtered="true"]');
                for (var i = 0, el; el = elList[i]; i++) {
                    el.dataset.filtered = false;
                }
            }

            var request = $.trim(this.value.toLowerCase());
            if (!request) {
                return;
            }

            if (_this.varCache.filter === 'selected') {
                _this.varCache.filterEl.classList.remove('selected');
                _this.varCache.filterEl = _this.domCache.filterContainer.querySelector('a');
                _this.varCache.filterEl.dispatchEvent(new CustomEvent('click'));
            }

            var $trackerList = $(_this.domCache.trackerList);
            $trackerList.children('div').filter(function(index, el) {
                var id = el.dataset.id;
                var url = el.childNodes[1].firstChild.getAttribute('href') || '';

                var text = this.varCache.wordFilterCache[id];
                if (text === undefined) {
                    text = el.childNodes[1].textContent.toLowerCase();
                    text += ' ' + url.toLowerCase();
                    text += ' ' + el.childNodes[2].firstChild.textContent.toLowerCase();
                    this.varCache.wordFilterCache[id] = text;
                }

                if (text.indexOf(request) !== -1) {
                    el.dataset.filtered = true;
                    return true;
                }
                return false;
            }.bind(_this));

            document.body.append(_this.varCache.wordFilterStyle = mono.create('style', {
                text: '#manager '
                + '.mgr-tracker-list > div:not([data-filtered="true"]) {'
                + 'display: none;'
                + '}'
            }));
        });
        this.domCache.filterInput.addEventListener('dblclick', function() {
            this.value = '';
            this.dispatchEvent(new CustomEvent('keyup'));
        });


    },
    onHide: function() {
        "use strict";
        this.domCache.managerBody.classList.remove('show');
    },
    add: function() {
        "use strict";
        this.once();
        this.domCache.managerBody.classList.add('show');

        this.writeTrackerList();
    }
};