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

    /*
    var trackerListManager = $( document.getElementById('trackerListManager') );
    var trackerList = trackerListManager.find('.mgr_tracker_list');
    var filterContainer = trackerListManager.find('.mgr_tracker_list_filter');
    var filterStyle = undefined;
    var wordFilterStyle = undefined;
    var advancedStyle = undefined;
    var filterInput = filterContainer.children('input');
    var footerCounter = trackerListManager.find('.mgr_footer > span');
    var title = trackerListManager.find('.mgr_header .title');
    var closeBtn = trackerListManager.find('.mgr_header > a.close');
    var removeListBtn = trackerListManager.find('.mgr_sub_header > a.remove_list');
    var advancedView = trackerListManager.find('.mgr_footer > input.advanced');
    var saveBtn = trackerListManager.find('.mgr_footer > input.save');
    var listName = trackerListManager.find('.mgr_sub_header > input');
    var addCustomTracker = trackerListManager.find('.mgr_custom_tools > .add_custom_tracker');
    var createCustomTracker = trackerListManager.find('.mgr_custom_tools .create_custom_tracker').parent();

    if (mono.isFF) {
        createCustomTracker.css('display', 'none');
    }
    if (mono.isWebApp) {
        createCustomTracker.on('click', function(e) {
            e.preventDefault();
            notify.call({focusYes: true}, [{type: 'note', fragment: mono.parseTemplate(_lang.webAppFunctionUnavailable)}], _lang.wordYes, _lang.wordNoNotNow, function() {
                if (arguments[0] === undefined) return;
                $(document).trigger('installExtensionMenu');
            });
        });
    }

    var selfCurrentProfile = '';
    var onHideCb = undefined;
    var descCache = {};
    var editMode = 1;

    closeBtn.on('click', function(e) {
        e.preventDefault();
        onHide(1);
    });
    advancedView.on('click', function() {
        if (advancedStyle !== undefined) {
            advancedStyle.remove();
        }
        if (this.classList.contains('checked')) {
            this.classList.remove('checked');
            return;
        }
        this.classList.add('checked');
        dom_cache.body.append( advancedStyle = $('<style>', {text: '#trackerListManager '
        + '.mgr_tracker_list .options {'
        + 'display: block;'
        + '}'
        }) );
    });
    removeListBtn.on('click', function(e) {
        e.preventDefault();
        if (editMode) {
            delete engine.profileList[selfCurrentProfile];

            var changes = {};
            changes.profileList = JSON.stringify(engine.profileList);
            mono.storage.set(changes);

            if (engine.settings.profileListSync === 1) {
                mono.storage.sync.set({profileList: JSON.stringify(engine.profileList)});
            }
        }
        onHide(2);
    });
    var webAppFilterList = !mono.isWebApp ? undefined : function(list, proxyList) {
        var webAppAllowList = engine.webAppSupportList().all;
        var rmList = [];
        var i, item;
        for (i = 0; item = list[i]; i++) {
            if ( webAppAllowList.indexOf(item) === -1 && proxyList[item] === undefined ) {
                rmList.push(item);
            }
        }
        for (i = 0; item = rmList[i]; i++) {
            list.splice(list.indexOf(item), 1);
        }
        if (rmList.length > 0) {
            notify.call({focusYes: true}, [{
                type: 'note',
                fragment: mono.parseTemplate(_lang.webAppTrackersUnavailable)
            }], _lang.wordYes, _lang.wordNoNotNow, function () {
                if (arguments[0] === undefined) return;
                $(document).trigger('installExtensionMenu');
            });
        }
        return list;
    };
    saveBtn.on('click', function(e) {
        e.preventDefault();

        var elList = trackerList.children('.selected');
        var list = [];
        for (var i = 0, el; el = elList[i]; i++) {
            var id = el.dataset.id;
            list.push(id);
        }

        var proxyList = {};
        elList = trackerList.find('input[name="use_proxy"]:checked');
        for (var i = 0, el; el = elList[i]; i++) {
            id = el.dataset.tracker;
            var value = parseInt(el.value);
            proxyList[id] = (value > 0) ? value : undefined;
        }

        if (mono.isWebApp) {
            list = webAppFilterList(list, proxyList);
        }

        var newListName = listName.val();
        if (!newListName) {
            listName.addClass('error');
            setTimeout(function() {
                listName.removeClass('error');
            }, 1500);
            return;
        }

        if (selfCurrentProfile !== newListName) {
            delete engine.profileList[selfCurrentProfile];
            selfCurrentProfile = newListName;
        }
        engine.profileList[selfCurrentProfile] = list;
        engine.setProxyList(proxyList);

        var changes = {};
        changes.profileList = JSON.stringify(engine.profileList);
        changes.proxyList = proxyList;
        mono.storage.set(changes);

        if (engine.settings.profileListSync === 1) {
            mono.storage.sync.set({profileList: JSON.stringify(engine.profileList)});
        }

        onHide(selfCurrentProfile);
    });

    var numbersUpdate = function() {
        var selectCount = trackerList.children('.selected').length;
        if (!selectCount) {
            footerCounter.text(_lang.mgrNothingSelected);
        } else {
            footerCounter.text(_lang.mgrSelectedN+' '+selectCount);
        }

        var links = filterContainer.children('a');
        for (var i = 0, el; el = links[i]; i++) {
            var type = el.dataset.type;
            var numContainer = el.querySelectorAll('span')[1];
            if (type === 'all') {
                numContainer.textContent = trackerList.children().length;
            } else
            if (type === 'selected') {
                numContainer.textContent = selectCount;
            } else
            if (type === 'unused') {
                numContainer.textContent = trackerList.children('[data-used="false"]').length;
            } else
            if (type === 'custom') {
                numContainer.textContent = trackerList.children('.custom').length;
            }
        }
    };

    var filterListBy = function(type) {
        var_cache.mgrFilterBy = type;
        trackerListManager.removeClass('show_tools');
        if (filterStyle !== undefined) {
            filterStyle.remove();
        }
        if (type === 'all') {
            filterStyle = undefined;
        } else
        if (type === 'selected') {
            dom_cache.body.append(
                filterStyle = $('<style>', {text: '#trackerListManager '
                + '.mgr_tracker_list > div:not(.selected) {'
                + 'display: none;'
                + '}'
                + '#trackerListManager '
                + '.mgr_tracker_list > div.tmp_selected {'
                + 'display: block;'
                + '}'
                })
            );
        } else
        if (type === 'unused') {
            dom_cache.body.append(
                filterStyle = $('<style>', {text: '#trackerListManager '
                + '.mgr_tracker_list > div[data-used="true"] {'
                + 'display: none;'
                + '}'
                + '#trackerListManager '
                + '.mgr_tracker_list > div.tmp_used[data-used="true"] {'
                + 'display: block;'
                + '}'
                })
            );
        } else
        if (type === 'custom') {
            dom_cache.body.append(
                filterStyle = $('<style>', {text: '#trackerListManager '
                + '.mgr_tracker_list > div:not(.custom) {'
                + 'display: none;'
                + '}'
                })
            );
            trackerListManager.addClass('show_tools');
        }
    };

    filterInput.on('input', function() {
        var elList;
        if (wordFilterStyle !== undefined) {
            wordFilterStyle.remove();
            elList = trackerList.children('div[data-filtered="true"]');
            for (var i = 0, el; el = elList[i]; i++) {
                el.dataset.filtered = false;
            }
        }
        var request = this.value.toLowerCase();
        if (!request) {
            return;
        }
        if (var_cache.mgrFilterBy === 'selected') {
            filterContainer.children('a.selected').removeClass('selected');
            filterContainer.children('a:eq(0)').addClass('selected');
            filterListBy(filterContainer.children('a.selected').data('type'));
        }
        elList = trackerList.children('div').filter(function(index, el) {
            var id = el.dataset.id;
            var text = descCache[id];
            var url = el.childNodes[1].firstChild.getAttribute('href') || '';
            if (text === undefined) {
                text = el.childNodes[1].textContent.toLowerCase();
                text += ' ' + url.toLowerCase();
                text += ' ' + el.childNodes[2].firstChild.textContent.toLowerCase();
                descCache[id] = text;
            }
            return text.indexOf(request) !== -1;
        });
        for (var i = 0, el; el = elList[i]; i++) {
            el.dataset.filtered = true;
        }
        dom_cache.body.append(wordFilterStyle = $('<style>', {text: '#trackerListManager '
        + '.mgr_tracker_list > div:not([data-filtered="true"]) {'
        + 'display: none;'
        + '}'
        }) );
    });
    filterInput.on('dblclick', function() {
        filterInput.val('').trigger('input');
    });


    filterContainer.on('click', 'a', function(e) {
        e.preventDefault();
        filterContainer.children('a.selected').removeClass('selected');
        this.classList.add('selected');
        orderTrackerList(1);
        filterListBy(this.dataset.type);
        filterInput.val('').trigger('input');
        trackerList.scrollTop(0);
    });

    trackerList.on('click', 'div.tracker_item', function(e) {
        var $this = $(this);
        var checkbox = $this.find('input.tracker_state');
        if (['INPUT', 'LABEL', 'A'].indexOf(e.target.tagName) !== -1) {
            return;
        }
        checkbox[0].checked = !checkbox[0].checked;
        checkbox.trigger('change');
    });

    var hasTopShadow = false;
    trackerList[0].addEventListener('wheel', function(e) {
        if (this.scrollHeight === this.clientHeight) {
            return;
        }
        if (e.wheelDeltaY > 0 && this.scrollTop === 0) {
            e.preventDefault();
        } else
        if (e.wheelDeltaY < 0 && this.scrollHeight - (this.offsetHeight + this.scrollTop) <= 0) {
            e.preventDefault();
        }
    });
    trackerList[0].addEventListener('scroll', function() {
        if (this.scrollTop !== 0) {
            if (hasTopShadow) {
                return;
            }
            hasTopShadow = true;
            this.style.boxShadow = 'rgba(0, 0, 0, 0.40) -2px 1px 2px 0px inset';
        } else {
            if (!hasTopShadow) {
                return;
            }
            hasTopShadow = false;
            this.style.boxShadow = '';
        }
    });

    var onCustomTorrentChange = function() {
        trackerList.empty();

        filterInput.val('');
        if (wordFilterStyle !== undefined) {
            wordFilterStyle.remove();
        }
        wordFilterStyle = undefined;

        writeTrackerList();
        orderTrackerList();
        filterListBy(var_cache.mgrFilterBy);
        numbersUpdate();
    };

    var add_custom_tracker = function(e) {
        e.preventDefault();
        notify([{type: 'textarea', text: _lang.enter_tracker_code}], _lang.apprise_btns0, _lang.apprise_btns1,
            function(arr) {
                if (!arr || !arr[0]) {
                    return;
                }
                var code = undefined;
                try {
                    code = JSON.parse(arr[0]);
                } catch (e) {
                    alert(_lang.magic_1 + "\n" + e);
                    return;
                }
                if (code.uid === undefined) {
                    alert(_lang.word_error);
                    return;
                }
                mono.storage.get('customTorrentList', function(storage) {
                    var customTorrentList = storage.customTorrentList || {};
                    if (customTorrentList['ct_'+code.uid] !== undefined) {
                        alert(_lang.codeExists);
                        return;
                    }
                    customTorrentList['ct_'+code.uid] = code;
                    mono.storage.set({customTorrentList: customTorrentList}, function() {
                        engine.reloadCustomTorrentList(onCustomTorrentChange);
                    });
                });
            }
        );
    };
    addCustomTracker.on('click', add_custom_tracker);

    var edit_custom_tracker = function(e) {
        e.preventDefault();
        var id = this.dataset.id;
        var uid = id.substr(3);
        mono.storage.get('customTorrentList', function(storage) {
            var customTorrentList = storage.customTorrentList;
            var code = JSON.stringify(customTorrentList[id]);
            notify([{type: 'textarea', value: code, text: _lang.enter_tracker_code}], _lang.apprise_btns0, _lang.apprise_btns1,
                function(arr) {
                    if (!arr || !arr[0]) {
                        return;
                    }
                    var code = undefined;
                    try {
                        code = JSON.parse(arr[0]);
                    } catch (e) {
                        alert(_lang.magic_1 + "\n" + e);
                        return;
                    }
                    if (uid !== code.uid) {
                        code.uid = parseInt(uid);
                    }
                    customTorrentList['ct_' + code.uid] = code;
                    mono.storage.set({customTorrentList: customTorrentList}, function() {
                        engine.reloadCustomTorrentList(onCustomTorrentChange);
                    });
                }
            );
        });
    };

    var remove_custom_tracker = function(e) {
        e.preventDefault();
        var id = this.dataset.id;
        mono.storage.get('customTorrentList', function(storage) {
            var customTorrentList = storage.customTorrentList;
            delete customTorrentList[id];
            delete torrent_lib[id];
            mono.storage.set({customTorrentList: customTorrentList}, function() {
                engine.reloadCustomTorrentList(onCustomTorrentChange);
            });
        });
    };

    var getTrackerDom = function( id, tracker, tracker_icon, options ) {
        var link = undefined;
        if (tracker === undefined) {
            var uid = (id.substr(0, 3) === 'ct_')?id.substr(3):undefined;
            tracker = {
                name: id,
                about: _lang.trackerNotFound,
                notFound: 1
            };
            if (uid !== undefined) {
                link = [' ',$('<a>', {href: 'http://code-tms.blogspot.ru/search?q=' + uid, text: _lang.findNotFound, target: "_blank"})];
            }
        }
        if (tracker_icon === undefined) {
            tracker_icon = $('<div>', {'class': 'tracker_icon'}).css({'background-color': ( (tracker.notFound !== undefined) ?'rgb(253, 0, 0)':'#ccc' ), 'border-radius': '8px'});
        }
        var isCustom = tracker.uid !== undefined;
        var customActionList = undefined;
        if (isCustom) {
            customActionList = $('<div>', {class: 'actionList'}).append(
                $('<a>', {class: 'custom_tracker_edit', 'data-id': id, href: '#', title: _lang.custom_tracker_edit}).on('click', edit_custom_tracker),
                $('<a>', {class: 'custom_tracker_remove', 'data-id': id, href: '#', title: _lang.custom_tracker_remove}).on('click', remove_custom_tracker)
            )
        }

        var useState = false;
        for (var profile in engine.profileList) {
            if (engine.profileList[profile].indexOf(id) !== -1) {
                useState = true;
                break;
            }
        }

        var selected = false;
        if (editMode) {
            if (engine.profileList[selfCurrentProfile].indexOf(id) !== -1) {
                selected = true;
            }
        } else {
            var defList = engine.defaultProfileTorrentList();
            if (defList.indexOf(id) !== -1) {
                selected = true;
            }
        }

        var $item = undefined;
        return $item = $('<div>',{'data-used': useState, 'data-id': id, 'class':'tracker_item'+(selected?' selected':'')+( isCustom?' custom':((tracker.notFound !== undefined)?' not_found custom': '') )}).append(
            $('<div>').append(tracker_icon.attr('title', tracker.name)),
            $('<div>', {class: 'title', title: tracker.name}).append(
                $('<a>', {href: tracker.url, target: '_blank', text: tracker.name})
            ),
            $('<div>', {'class': 'infoContainer'}).append(
                $('<div>', {class: 'description', title: tracker.about, text: tracker.about}).append(link),
                customActionList,
                $('<div>', {class: 'options'}).append(options)
            ),
            $('<div>', {'class': 'status'}).append(
                $('<input>', {type: 'checkbox', class: "tracker_state", checked: selected}).on('change', function() {
                    if (this.checked) {
                        $item.addClass('selected');
                        $item.removeClass('tmp_selected');
                        $item[0].dataset.used = true;
                        $item.addClass('tmp_used');
                    } else {
                        $item.removeClass('selected');
                        $item.addClass('tmp_selected');
                        $item.removeClass('tmp_used');
                        $item[0].dataset.used = false;
                    }
                    numbersUpdate();
                })
            )
        )
    };

    var orderTrackerList = function(custom) {
        var tmp_list = trackerList.children('div');
        for (var i = 0, el; el = tmp_list[i]; i++) {
            el.classList.remove('tmp_selected');
            el.classList.remove('tmp_used');
        }

        var list = [];
        if (!custom && editMode === 1) {
            engine.profileList[selfCurrentProfile].forEach(function (id) {
                var el = trackerList.children('div[data-id="' + id + '"]');
                if (el.length === 0) {
                    trackerList.append(
                        el = getTrackerDom( id )
                    );
                }
                list.push(el);
            });
        } else {
            list = trackerList.children('.selected');
        }
        trackerList.prepend(list);
    };

    var writeTrackerList = function() {
        var list = [];
        $.each(torrent_lib, function(id, tracker) {
            var flags = [];
            if (!tracker.flags.rs) {
                flags.push($('<div>', {'class': 'cirilic', title: _lang.flag_cirilic}));
            }
            if (tracker.flags.a) {
                flags.push($('<div>', {'class': 'auth', title: _lang.flag_auth}));
            }
            if (tracker.flags.l) {
                flags.push($('<div>', {'class': 'rus', title: _lang.flag_rus}));
            }
            if (flags.length > 0) {
                flags = $('<div>', {'class': 'icons'}).append(flags);
            }
            var useProxy = $('<form>').prepend(
                _lang.mgrUseProxy + ':',
                $('<label>', {text: _lang.word_no}).prepend(
                    $('<input>', {
                        type: "radio",
                        name: "use_proxy",
                        'data-tracker': id,
                        value: "0",
                        checked: engine.proxyList[id] === undefined
                    })
                ),
                $('<label>', {text: 'URL'}).prepend(
                    $('<input>', {
                        type: "radio",
                        name: "use_proxy",
                        'data-tracker': id,
                        value: "1",
                        checked: engine.proxyList[id] === 1,
                        disabled: (tracker.flags.proxy)?false:true
                    })
                ),
                $('<label>', {text: 'Host'}).prepend(
                    $('<input>', {
                        type: "radio",
                        name: "use_proxy",
                        'data-tracker': id,
                        value: "2",
                        checked: engine.proxyList[id] === 2,
                        disabled: engine.settings.proxyHost?false:true
                    })
                )
            );
            var tracker_icon = $('<div>', {'class': 'tracker_icon'});
            if (!tracker.icon) {
                tracker_icon.css({'background-color': '#ccc', 'border-radius': '8px'});
            } else
            if (tracker.icon[0] === '#') {
                tracker_icon.css({'background-color': tracker.icon, 'border-radius': '8px'});
            } else {
                tracker_icon.css('background-image', 'url(' + tracker.icon + ')');
            }
            list.push( getTrackerDom( id, tracker, tracker_icon, [flags, useProxy] ) );
        });
        trackerList.append(list);
    };

    var onHide = function(state) {
        if (typeof state === 'number') {
            state += editMode?5:0;
        }
        onHideCb && onHideCb(state);
        onHideCb = undefined;

        filterInput.val('');

        selfCurrentProfile = '-';

        document.body.removeEventListener('click', selfHide);

        trackerList.empty();
        if (filterStyle !== undefined) {
            filterStyle.remove();
        }
        if (wordFilterStyle !== undefined) {
            wordFilterStyle.remove();
        }
        filterStyle = undefined;
        wordFilterStyle = undefined;

        filterContainer.children('a.selected').removeClass('selected');
        filterContainer.children('a:eq(3)').addClass('selected');
        filterListBy(filterContainer.children('a.selected').data('type'));

        numbersUpdate();

        trackerListManager.hide();
    };

    var selfHide = function() {
        document.body.removeEventListener('click', selfHide);
        onHide(1);
    };

    return {
        show: function(isEditMode, cb) {
            if (trackerListManager[0].style.display === 'block') {
                return;
            }

            onHideCb = cb;
            editMode = isEditMode;
            if (!editMode) {
                selfCurrentProfile = undefined;
                title.text(_lang.mgrTitleNew);
                removeListBtn.hide();
                listName.val('');
            } else {
                selfCurrentProfile = currentProfile;
                title.text(_lang.mgrTitleEdit);
                var n = 0;
                for (var item in engine.profileList) {
                    n++;
                    if (n > 1) {
                        break;
                    }
                }
                if (n > 1) {
                    removeListBtn.show();
                } else {
                    removeListBtn.hide();
                }
                listName.val(selfCurrentProfile);
            }


            writeTrackerList();
            orderTrackerList();
            numbersUpdate();

            filterListBy(filterContainer.children('a.selected').data('type'));

            trackerList.sortable({
                placeholder: "ui-state-highlight",
                delay: 150
            });

            trackerListManager[0].addEventListener('click', function(e) {
                e.stopPropagation();
            });

            document.body.removeEventListener('click', selfHide);
            setTimeout(function() {
                document.body.addEventListener('click', selfHide);
            }, 100);

            trackerListManager.show();

            if (mono.isOpera) {
                trackerListManager.css('left', ((dom_cache.body.width() - trackerListManager.width()) / 2) + 'px' );
            }
        }
    }
    */
};