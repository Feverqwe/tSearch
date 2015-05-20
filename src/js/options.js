var options = {
    activePage: null,
    activeItem: undefined,
    domCache: {
        backupUpdateBtn: document.getElementById('backupUpdate'),
        restoreBtn: document.getElementById('restoreBtn'),
        saveInCloudBtn: document.getElementById('saveInCloud'),
        getFromCloudBtn: document.getElementById('getFromCloudBtn'),
        clearCloudStorageBtn: document.getElementById('clearCloudStorage'),
        backupInp: document.getElementById('backupInp'),
        restoreInp: document.getElementById('restoreInp'),
        langSelect: document.getElementById("language"),
        sectionList: document.querySelector('.sectionList'),
        proxyList: document.querySelector('.proxyList')
    },

    defaultSettings: {},
    settings: {},

    set_place_holder: function() {
        "use strict";
        for (var key in engine.defaultSettings) {
            var defaultValue = engine.defaultSettings[key];
            var el = document.querySelector('input[data-option="' + key + '"]');
            if (el === null) {
                console.log('El not found!', key);
                continue;
            }
            if (['text', 'number', 'password'].indexOf(el.type) !== -1) {
                if (this.settings[key] !== defaultValue) {
                    el.value = this.settings[key];
                } else {
                    el.value = '';
                }
                if (defaultValue || defaultValue === '' || defaultValue === 0) {
                    el.placeholder = defaultValue;
                }
            } else if (el.type === "checkbox") {
                el.checked = !!this.settings[key];
            } else if (el.type === "radio") {
                var _el = document.querySelector('input[data-option="' + key + '"][value="'+this.settings[key]+'"]');
                if (_el !== null) {
                    el = _el;
                }
                el.checked = true;
            }
        }
    },
    onHashChange: function() {
        "use strict";
        var defaultPage = 'general';
        var hash = location.hash.substr(1) || defaultPage;
        var activeItem = document.querySelector('a[data-page="'+hash+'"]');
        if (activeItem === null) {
            activeItem = document.querySelector('a[data-page="'+defaultPage+'"]');
        }
        activeItem.dispatchEvent(new CustomEvent('click', {bubbles: true, cancelable: true, detail: 'force'}));
    },
    saveChange: function(e) {
        "use strict";
        var el = e.target;
        if (el.tagName !== 'INPUT') {
            return;
        }
        var key = el.dataset.option;
        if (!key) {
            var section = el.dataset.section;
            engine.explorerOptionsObj[section].enable = el.checked ? 1 : 0;
            mono.storage.set({explorerOptions: engine.explorerOptions});
        }
        if (key && el.type === 'checkbox' || section) {
            var label = el.parentNode;
            if (label.classList.contains('hasChanges')) {
                label.classList.remove('hasChanges');
            } else {
                label.classList.add('hasChanges');
            }
        }
        if (!key) {
            return;
        }
        var value;
        if (el.type === 'checkbox') {
            value = el.checked ? 1 : 0;
        } else
        if (el.type === 'radio') {
            value = parseInt(el.value);
        } else
        if (el.type === 'number') {
            var number = parseInt(el.value);
            if (isNaN(number)) {
                number = parseInt(el.placeholder);
            }
            var min = parseInt(el.min);
            if (!isNaN(min) && number < min) {
                number = min;
                el.value = number;
            }
            if (isNaN(number)) {
                return;
            }
            value = number;
        } else
        if (['text', 'password'].indexOf(el.type) !== -1) {
            value = el.value;
            var placehoder = el.placeholder;
            if (!value && placehoder) {
                value = placehoder;
            }
        }

        var obj = {};
        obj[key] = value;

        mono.storage.set(obj, function() {
            if (obj.hasOwnProperty('contextMenu') || obj.hasOwnProperty('searchPopup')) {
                mono.sendMessage('reloadSettings');
            }
        });
    },
    getBackupJson: function(cb) {
        "use strict";
        mono.storage.get(null, function(storage) {
            var objList = {};
            for (var key in storage) {
                if (['searchHistory', 'explorerQualityList', 'topList'].indexOf(key) !== -1) {
                    continue;
                }
                if (key.substr(0, 8) === 'expCache') {
                    continue;
                }
                objList[key] = storage[key];
            }
            cb && cb(JSON.stringify(objList));
        });
    },
    restoreSettings: function(storage) {
        "use strict";
        mono.storage.clear();
        var data = {};
        for (var item in storage) {
            var value = storage[item];
            if (storage.hasOwnProperty(item) === false || value === null) {
                continue;
            }
            data[item] = value;
        }
        mono.storage.set(data, function() {
            mono.sendMessage('reloadSettings', function() {
                window.location.reload();
            });
        });
    },
    bindBackupForm: function() {
        "use strict";
        this.domCache.backupUpdateBtn.addEventListener('click', function() {
            this.getBackupJson(function(json) {
                this.domCache.backupInp.value = json;
            }.bind(this));
        }.bind(this));
        this.domCache.restoreBtn.addEventListener('click', function() {
            try {
                var data = JSON.parse(this.domCache.restoreInp.value);
            } catch (error) {
                return alert(mono.language.error + "\n" + error);
            }
            this.restoreSettings(data);
        }.bind(this));
        this.domCache.clearCloudStorageBtn.addEventListener('click', function() {
            mono.storage.sync.clear();
            this.domCache.getFromCloudBtn.disabled = true;
        }.bind(this));
        this.domCache.saveInCloudBtn.addEventListener('click', function() {
            this.disabled = true;
            setTimeout(function() {
                this.disabled = false;
            }.bind(this), 750);

            var _this = options;
            _this.getBackupJson(function(json) {
                mono.storage.sync.set({backup: json}, function() {
                    _this.domCache.getFromCloudBtn.disabled = false;
                });
            });
        });
        this.domCache.getFromCloudBtn.addEventListener('click', function() {
            mono.storage.sync.get('backup', function(storage) {
                this.domCache.restoreInp.value = storage.backup;
            }.bind(this));
        }.bind(this));
    },
    saveProxyList: function() {
        "use strict";
        mono.storage.set({proxyList: engine.settings.proxyList});
    },
    writeProxyList: function() {
        "use strict";
        this.domCache.proxyList.textContent = '';
        mono.create(this.domCache.proxyList, {
            append: (function() {
                var list = [];
                engine.settings.proxyList.forEach(function(item, index) {
                    var itemEl;
                    list.push(itemEl = mono.create('div', {
                        class: 'item',
                        append: [
                            mono.create('div', {
                                class: 'host-options',
                                append: [
                                    mono.create('div', {
                                        class: 'info',
                                        append: [
                                            mono.create('span', {
                                                text: mono.language.workExample + ' '
                                            }),
                                            mono.create('span', {
                                                text: '{protocol}://{host}.3s3s.org/{path}'
                                            })
                                        ]
                                    })
                                ]
                            }),
                            mono.create('div', {
                                class: 'url-options',
                                append: [
                                    mono.create('div', {
                                        class: 'info',
                                        append: [
                                            mono.create('span', {
                                                text: mono.language.onlyGetMethod
                                            })
                                        ]
                                    })
                                ]
                            }),
                            mono.create('label', {
                                append: [
                                    mono.create('span', {
                                        text: mono.language.label + ' '
                                    }),
                                    mono.create('input', {
                                        type: 'text',
                                        class: 'label',
                                        value: item.label,
                                        on: ['keyup', mono.debounce(function() {
                                            item.label = this.value;
                                            options.saveProxyList();
                                        })]
                                    }),
                                    index < 2 ? undefined : mono.create('a', {
                                        class: 'delete btn',
                                        text: mono.language.delete,
                                        href: '#',
                                        on: ['click', function(e) {
                                            e.preventDefault();
                                            engine.settings.proxyList.splice(index, 1);
                                            options.saveProxyList();
                                            options.writeProxyList();
                                        }]
                                    })
                                ]
                            }),
                            mono.create('label', {
                                append: [
                                    mono.create('span', {
                                        text: 'URL:'
                                    }),
                                    mono.create('input', {
                                        type: 'text',
                                        class: 'url',
                                        value: item.url,
                                        on: ['keyup', mono.debounce(function() {
                                            item.url = this.value;
                                            options.saveProxyList();
                                        })]
                                    })
                                ]
                            }),
                            mono.create('form', {
                                class: 'proxy-type',
                                append: [
                                    mono.create('span', {
                                        text: mono.language.type
                                    }),
                                    mono.create('label', {
                                        append: [
                                            mono.create('input', {
                                                type: 'radio',
                                                name: 'proxyType',
                                                value: '0',
                                                checked: item.type === 0
                                            }),
                                            mono.create('span', {
                                                text: 'URL'
                                            })
                                        ]
                                    }),
                                    mono.create('label', {
                                        append: [
                                            mono.create('input', {
                                                type: 'radio',
                                                name: 'proxyType',
                                                value: '1',
                                                checked: item.type === 1
                                            }),
                                            mono.create('span', {
                                                text: 'Host'
                                            })
                                        ]
                                    })
                                ],
                                on: ['change', function(e) {
                                    var el = e.target;
                                    if (el.name === 'proxyType') {
                                        if (el.value === '0') {
                                            itemEl.classList.add('url-show');
                                            itemEl.classList.remove('host-show');
                                        } else {
                                            itemEl.classList.remove('url-show');
                                            itemEl.classList.add('host-show');
                                        }
                                    }
                                    if (isNaN(parseInt(el.value))) {
                                        return;
                                    }
                                    item.type = parseInt(el.value);
                                    options.saveProxyList();
                                }]
                            }),
                            mono.create('div', {
                                class: 'host-options',
                                append: [
                                    mono.create('label', {
                                        append: [
                                            mono.create('input', {
                                                type: 'checkbox',
                                                data: {
                                                    param: 'fixSpaces'
                                                },
                                                checked: !!item.fixSpaces
                                            }),
                                            mono.create('span', {
                                                text: mono.language.fixSpaces
                                            })
                                        ],
                                        on: ['change', function(e) {
                                            var el = e.target;
                                            var key = el.dataset.param;
                                            if (!key) {
                                                return;
                                            }
                                            item[key] = el.checked ? 1 : 0;
                                            options.saveProxyList();
                                        }]
                                    })
                                ]
                            })
                        ],
                        onCreate: function() {
                            if (item.type === 0) {
                                this.classList.add('url-show');
                            } else {
                                this.classList.add('host-show');
                            }
                        }
                    }));
                });
                list.push(mono.create('a', {
                    class: 'add btn',
                    href: '#',
                    text: mono.language.add,
                    on: ['click', function(e) {
                        e.preventDefault();
                        engine.settings.proxyList.push({
                            label: 'new',
                            url: '',
                            type: 0
                        });
                        options.saveProxyList();
                        options.writeProxyList();
                    }]
                }));
                return list;
            })()
        });
    },
    once: function() {
        "use strict";
        mono.writeLanguage(mono.language);
        document.body.classList.remove('loading');

        this.settings = engine.settings;

        engine.explorerOptions.concat(engine.defaultExplorerOptions).forEach(function createSection(item) {
            if (createSection.list === undefined) {
                createSection.list = [];
            }
            if (createSection.list.indexOf(item.type) !== -1) {
                return;
            }
            createSection.list.push(item.type);
            if (item.type === 'favorites') {
                return;
            }
            this.domCache.sectionList.appendChild(mono.create('label', {
                append: [
                    mono.create('input', {
                        type: 'checkbox',
                        data: {
                            section: item.type
                        },
                        checked: !!item.enable
                    }),
                    mono.create('span', {
                        text: mono.language[item.lang]
                    })
                ]
            }));
        }.bind(this));

        this.writeProxyList();

        mono.rmChildTextNodes(this.domCache.langSelect);
        this.domCache.langSelect.selectedIndex = this.domCache.langSelect.querySelector('[value="'+mono.language.langCode+'"]').index;
        this.domCache.langSelect.addEventListener('change', function() {
            var option = this.childNodes[this.selectedIndex];
            var langCode = option.value;
            mono.storage.set({langCode: langCode}, function () {
                location.reload();
            });
        });

        this.set_place_holder();

        if (!mono.isChrome) {
            this.domCache.saveInCloudBtn.style.display = 'none';
            this.domCache.getFromCloudBtn.style.display = 'none';
            this.domCache.clearCloudStorageBtn.style.display = 'none';
        }

        this.bindBackupForm();

        this.domCache.menu = document.querySelector('.menu');
        this.domCache.menu.addEventListener('click', function(e) {
            if (e.detail === 'force') {
                e.preventDefault();
            }
            var el = e.target;
            if (el.tagName !== 'A') return;

            if (el.classList.contains('active')) {
                return;
            }
            this.activeItem && this.activeItem.classList.remove('active');
            this.activeItem = el;
            el.classList.add('active');
            this.activePage && this.activePage.classList.remove('active');
            var page = el.dataset.page;
            this.activePage = document.querySelector('.page.' + page);
            this.activePage.classList.add('active');
            if (page === 'backup') {
                this.domCache.backupUpdateBtn.dispatchEvent(new CustomEvent('click'));
            }
            if (page === 'restore') {
                mono.storage.sync.get('backup', function(storage) {
                    if (storage.backup !== undefined) {
                        return;
                    }
                    this.domCache.getFromCloudBtn.disabled = true;
                }.bind(this));
            }
        }.bind(this));
        window.addEventListener("hashchange", this.onHashChange);
        this.onHashChange();

        document.body.addEventListener('click', this.saveChange);

        document.querySelector('input[data-option="kinopoiskFolderId"]').addEventListener('change', mono.debounce(this.saveChange));
    }
};
engine.init(function() {
    options.once();
});