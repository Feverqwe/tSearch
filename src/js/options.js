var options = {
    activePage: null,
    activeItem: undefined,
    domCache: {
        backupUpdateBtn: $('#backupUpdate'),
        restoreBtn: $('#restoreBtn'),
        saveInCloudBtn: $('#saveInCloud'),
        getFromCloudBtn: $('#getFromCloudBtn'),
        clearCloudStorageBtn: $('#clearCloudStorage'),
        backupInp: $('#backupInp'),
        restoreInp: $('#restoreInp')
    },

    defaultSettings: {},
    settings: {},

    set_place_holder: function() {
        "use strict";
        for (var key in options.defaultSettings) {
            var defaultValue = options.defaultSettings[key];
            var el = document.querySelector('input[data-option="' + key + '"]');
            if (el === null) {
                console.log('El not found!', key);
                continue;
            }
            if (['text', 'number', 'password'].indexOf(el.type) !== -1) {
                if (options.settings[key] !== defaultValue) {
                    el.value = options.settings[key];
                } else {
                    el.value = '';
                }
                if (defaultValue || defaultValue === '' || defaultValue === 0) {
                    el.placeholder = defaultValue;
                }
            } else if (el.type === "checkbox") {
                el.checked = !!options.settings[key];
            } else if (el.type === "radio") {
                var _el = document.querySelector('input[data-option="' + key + '"][value="'+options.settings[key]+'"]');
                if (_el !== null) {
                    el = _el;
                }
                el.checked = true;
            }
        }
    },
    onHashChange: function() {
        "use strict";
        var hash = location.hash.substr(1) || 'client';
        var activeItem = document.querySelector('a[data-page="'+hash+'"]');
        if (activeItem === null) {
            activeItem = document.querySelector('a[data-page="main"]');
        }
        activeItem.dispatchEvent(new CustomEvent('click', {bubbles: true}));
    },
    saveChange: function(e) {
        "use strict";
        var el = e.target;
        if (el.tagName !== 'INPUT') {
            return;
        }
        var key = el.dataset.option;
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

        var cb = this.cb;
        mono.storage.set(obj, function() {
            // TODO: Fix me
            /*mono.sendMessage({action: 'reloadSettings'}, cb);*/
        });
    },
    getBackupJson: function(cb) {
        "use strict";
        mono.storage.get(null, function(storage) {
            cb && cb(JSON.stringify(storage));
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
            mono.sendMessage({action: 'reloadSettings'}, function() {
                window.location.reload();
            });
        });
    },
    makeBackupForm: function() {
        "use strict";
        options.domCache.backupUpdateBtn.on('click', function() {
            options.getBackupJson(function(json) {
                options.domCache.backupInp.val( json );
            });
        });
        options.domCache.restoreBtn.on('click', function() {
            try {
                var data = JSON.parse(options.domCache.restoreInp.val());
            } catch (error) {
                return alert(options.language.OV_FL_ERROR + "\n" + error);
            }
            options.restoreSettings(data);
        });
        options.domCache.clearCloudStorageBtn.on('click', function() {
            mono.storage.sync.clear();
            options.domCache.getFromCloudBtn.prop('disabled', true);
        });
        options.domCache.saveInCloudBtn.on('click', function() {
            var _this = this;
            _this.disabled = true;
            setTimeout(function() {
                _this.disabled = false;
            }, 750);
            options.getBackupJson(function(json) {
                mono.storage.sync.set({backup: json}, function() {
                    options.domCache.getFromCloudBtn.prop('disabled', false);
                });
            });
        });
        options.domCache.getFromCloudBtn.on('click', function() {
            mono.storage.sync.get('backup', function(storage) {
                options.domCache.restoreInp.val( storage.backup );
            });
        });
    },
    once: function() {
        "use strict";
        engine.init(function() {
            options.settings = engine.settings;
            options.defaultSettings = engine.defaultSettings;
            options.language = mono.language.langCode;

            var langSelect = document.getElementById("language");
            var langPos = ['ru', 'en'].indexOf(options.language.lang);
            if (langPos === -1) {
                langPos = 1;
            }
            langSelect.selectedIndex = langPos;
            langSelect.addEventListener('change', function() {
                var index = langSelect.selectedIndex;
                var option = langSelect.childNodes[index];
                var lang = option.value;
                /*TODO: Fix me!
                 mono.storage.set({language: lang}, function() {
                 mono.sendMessage({action: 'reloadSettings'}, function() {
                 location.reload();
                 });
                 });*/
            });

            mono.writeLanguage(mono.language);

            options.set_place_holder();

            if (!mono.isChrome) {
                options.domCache.saveInCloudBtn.hide();
                options.domCache.getFromCloudBtn.hide();
                options.domCache.clearCloudStorageBtn.hide();
            }

            options.makeBackupForm();

            options.domCache.menu = document.querySelector('.menu');
            options.domCache.menu.addEventListener('click', function(e) {
                var el = e.target;
                if (el.tagName !== 'A') return;

                if (el.classList.contains('active')) {
                    return;
                }
                options.activeItem && options.activeItem.classList.remove('active');
                options.activeItem = el;
                options.activeItem.classList.add('active');
                options.activePage && options.activePage.classList.remove('active');
                var page = el.dataset.page;
                options.activePage = document.querySelector('.page.' + page);
                options.activePage.classList.add('active');
                if (page === 'backup') {
                    options.domCache.backupUpdateBtn.trigger('click');
                }
                if (page === 'restore') {
                    mono.storage.sync.get('backup', function(storage) {
                        if (storage.backup !== undefined) {
                            return;
                        }
                        options.domCache.getFromCloudBtn.prop('disabled', true);
                    });
                }
            });
            window.addEventListener("hashchange", options.onHashChange);
            options.onHashChange();

            document.body.addEventListener('click', options.saveChange);
        });
    }
};
options.once();