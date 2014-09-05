var options = function() {
    "use strict";
    var activePage = undefined;
    var activeItem = undefined;
    var dom_cache = {};
    var listOptions = undefined;
    var saveInputTimer = {};

    var write_language = function(body) {
        var elList = (body || document).querySelectorAll('[data-lang]');
        for (var i = 0, el; el = elList[i]; i++) {
            var langList = el.dataset.lang.split('|');
            for (var m = 0, lang; lang = langList[m]; m++) {
                var args = lang.split(',');
                var locale = _lang[args.shift()];
                if (locale === undefined) {
                    console.log('Lang not found!', el.dataset.lang);
                    continue;
                }
                if (args.length !== 0) {
                    args.forEach(function (item) {
                        if (item === 'sub') {
                            var _el = null;
                            while ( _el === null ? _el = el.firstChild : _el = _el.nextSibling) {
                                if (_el.nodeType === 3) {
                                    break;
                                }
                            }
                            if (_el !== null) {
                                el = _el;
                            } else {
                                console.log('Text node not found!', el.dataset.lang);
                            }
                            return 1;
                        } else
                        if (item === 'text') {
                            el.textContent = locale;
                            return 1;
                        } else
                        if (item === 'html') {
                            el.innerHTML = locale;
                            return 1;
                        }
                        el.setAttribute(item, locale);
                    });
                } else if (el.tagName === 'DIV') {
                    el.setAttribute('title', locale);
                } else if (['A', 'LEGEND', 'SPAN', 'LI', 'TH', 'P', 'OPTION', 'H1', 'H2'].indexOf(el.tagName) !== -1) {
                    el.textContent = locale;
                } else if (el.tagName === 'INPUT') {
                    el.value = locale;
                } else {
                    console.log('Tag name not found!', el.tagName);
                }
            }
        }
    };

    var set_place_holder = function() {
        $.each(engine.def_settings, function(key, defaultValue) {
            var el = document.querySelector('input[data-option="' + key + '"]');
            if (el === null) {
                return console.log('El not found!', key);
            }
            if (['text', 'number', 'password'].indexOf(el.type) !== -1) {
                if (engine.settings[key] !== defaultValue) {
                    el.value = engine.settings[key];
                } else {
                    el.value = '';
                }
                if (defaultValue || defaultValue === '') {
                    el.placeholder = defaultValue;
                }
            } else if (el.type === "checkbox") {
                el.checked = !!engine.settings[key];
            } else if (el.type === "radio") {
                var _el = document.querySelector('input[data-option="' + key + '"][value="'+engine.settings[key]+'"]');
                if (_el !== null) {
                    el = _el;
                }
                el.checked = true;
            }
        });

        mono.storage.get('listOptions', function(storage) {
            listOptions = storage.listOptions;
            try {
                listOptions = JSON.parse(storage.listOptions || '{}');
            } catch (e) {
                listOptions = {};
            }
            $.each(engine.def_listOptions, function(key, value) {
                if (listOptions.hasOwnProperty(key) === false) {
                    listOptions[key] = $.extend({},value);
                }
            });
            writeExploreSections(listOptions);
        });
    };

    var onHashChange = function() {
        var hash = location.hash.substr(1) || 'main';
        var $activeItem = $('a[data-page="'+hash+'"]');
        if ($activeItem.length === 0) {
            $activeItem = $('a[data-page="main"]');
        }
        $activeItem.trigger('click');
    };

    var saveChange = function(e) {
        var el = e.target;
        if (el.tagName !== 'INPUT') {
            return;
        }
        var key = el.dataset.option;
        if (!key) {
            return;
        }
        var value = undefined;
        if (el.type === 'checkbox') {
            value = el.checked ? 1 : 0;
        } else
        if (el.type === 'radio') {
            value = parseInt(el.value);
        } else
        if (el.type === 'number') {
            value = parseInt(el.value);
        } else
        if (['text', 'password'].indexOf(el.type) !== -1) {
            value = el.value;
        }

        var obj = {};
        obj[key] = value;
        mono.storage.set(obj);
        if (key === 'profileListSync') {
            mono.storage.sync.get('profileList', function(storage) {
                if (storage.profileList) {
                    return;
                }
                mono.storage.get('profileList', function(storage) {
                    mono.storage.sync.set(storage);
                });
            });
        }
        if (key === 'enableFavoriteSync') {
            mono.storage.sync.get('exp_cache_favorites', function(storage) {
                if (storage.exp_cache_favorites) {
                    return;
                }
                mono.storage.get('exp_cache_favorites', function(storage) {
                    mono.storage.sync.set(storage);
                });
            });
        }

        if (key === 'contextMenu' || key === 'searchPopup' || key === 'autoComplite') {
            mono.sendMessage('bg_update');
            if (mono.isFF || mono.isOpera) {
                mono.sendMessage('popupUpdate', undefined, 'popup');
            }
        }

    };

    var listOptionsSave = function(e) {
        e.stopPropagation();
        var el = e.target;
        if (el.tagName !== 'INPUT') {
            return;
        }
        var key = el.dataset.listOption;
        if (!key || listOptions.hasOwnProperty(key) === false) {
            return;
        }
        listOptions[key].e = el.checked ? 1 : 0;

        mono.storage.set({listOptions: JSON.stringify(listOptions)});
    };

    var writeExploreSections = function(listOptions) {
        var list = [];
        $.each(listOptions, function(key, value){
            if (key === 'favorites') {
                return 1;
            }
            list.push(
                $('<label>', {text: _lang['exp_items_'+key]}).prepend(
                    $('<input>', {type: 'checkbox', 'data-list-option': key, 'data-option': '', checked: value.e === 1})
                )
            );
        });
        dom_cache.sectionList.empty().append(list);
    };

    var saveTextInput = function(e) {
        var _this = this;
        var key = _this.dataset.option;
        if (!key) {
            return;
        }
        clearTimeout(saveInputTimer[key]);
        saveInputTimer[key] = setTimeout(function() {
            var value = _this.value;
            if (value.length === 0) {
                value = _this.placeholder;
            }
            if (_this.type === 'number') {
                value = parseInt(value);
            }
            var obj = {};
            obj[key] = value;
            mono.storage.set(obj);
        }, 500);
    };

    var bindTextInput = function() {
        var list = document.querySelectorAll('input');
        for (var i = 0, len = list.length; i < len; i++) {
            var item = list[i];
            if ( ['text', 'number', 'password'].indexOf(item.type) !== -1 ) {
                item.addEventListener('input', saveTextInput);
            }
        }
    };

    var getBackupJson = function(cb) {
        mono.storage.get(null, function(storage) {
            for (var key in storage) {
                if (key.substr(0, 9) === 'exp_cache' ||
                    ['topList', 'click_history', 'history', 'optMigrated', 'qualityBoxCache', 'qualityCache'].indexOf(key) !== -1) {
                    delete storage[key];
                }
            }
            cb && cb(JSON.stringify(storage));
        });
    };

    var gcPartedBackup = function(prefix, max) {
        mono.storage.sync.get(null, function(storage) {
            var rmList = [];
            for (var key in storage) {
                var pref = key.substr(0, prefix.length);
                var value = key.substr(prefix.length);
                if (value === 'inf') {
                    continue;
                }
                value = parseInt(value);
                if (pref === prefix && (isNaN(value) || value >= max)) {
                    rmList.push(key);
                }
            }
            mono.storage.sync.remove(rmList);
        });
    };

    var savePartedBackup = function(prefix, json, cb) {
        chrome.runtime.lasterror = undefined;
        json = 'LZ' + LZString.compressToBase64(json);
        var chunkLen = 1024 - prefix.length - 3;
        var regexp = new RegExp('.{1,'+chunkLen+'}', 'g');
        var jsonLen = json.length;
        var number_of_part = Math.floor( jsonLen / chunkLen );
        if (number_of_part >= 512) {
            mono('savePartedBackup','Can\'t save item', prefix,', very big!');
            return;
        }
        var dataList = json.match(regexp);
        var dataListLen = dataList.length;
        var obj = {};
        for (var i = 0, item; i < dataListLen; i++) {
            item = dataList[i];
            obj[prefix+i] = item;
        }
        obj[prefix+'inf'] = dataListLen;
        gcPartedBackup(prefix, dataListLen);
        mono.storage.sync.set(obj, function() {
            if (chrome.runtime.lasterror !== undefined) {
                var message = chrome.runtime.lasterror ? "\n" + chrome.runtime.lasterror.message : '';
                return alert(_lang.optCloudBackupError + message);
            }
            cb && cb();
        });
    };

    var readPartedBackup = function(prefix, cb) {
        mono.storage.sync.get(prefix+'inf', function(storage) {
            var len = storage[prefix+'inf'];
            if (len === undefined) {
                alert(_lang.optRestoreError);
                return;
            }
            var keyList = [];
            for (var i = 0; i < len; i++) {
                keyList.push(prefix+i);
            }
            mono.storage.sync.get(keyList, function(storage) {
                var data = undefined;
                try {
                    var json = '';
                    for (var i = 0; i < len; i++) {
                        json += storage[prefix + i];
                    }
                    if (json.substr(0, 2) === 'LZ') {
                        json = LZString.decompressFromBase64(json.substr(2));
                    } else {
                        json = window.atob(json);
                    }
                    data = JSON.parse(json);
                } catch (error) {
                    return alert(_lang.optRestoreError + "\n" + error);
                }
                cb(data);
            });
        });
    };

    var restoreSettings = function(storage) {
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
            window.location.reload();
        });
    };

    var makeBackupForm = function() {
        dom_cache.backupUpdateBtn.on('click', function() {
            getBackupJson(function(json) {
                dom_cache.backupInp.val( json );
            });
        });
        dom_cache.restoreBtn.on('click', function() {
            mono.storage.get(['history', 'click_history'], function(storage) {
                try {
                    var data = JSON.parse(dom_cache.restoreInp.val());
                } catch (error) {
                    return alert(_lang.optRestoreError + "\n" + error);
                }
                data = $.extend(storage, data);
                restoreSettings(data);
            });
        });
        dom_cache.clearCloudStorageBtn.on('click', function() {
            mono.storage.sync.clear();
            dom_cache.getFromCloudBtn.prop('disabled', true);
        });
        dom_cache.saveInCloudBtn.on('click', function() {
            var _this = this;
            _this.disabled = true;
            setTimeout(function() {
                _this.disabled = false;
            }, 750);
            getBackupJson(function(json) {
                savePartedBackup('bk_ch_', json);
                dom_cache.getFromCloudBtn.prop('disabled', false);
            });
        });
        dom_cache.getFromCloudBtn.on('click', function() {
            readPartedBackup('bk_ch_', function(data) {
                dom_cache.restoreInp.val( JSON.stringify(data) );
            });
        });

    };

    var mgrQuality = function() {
        var defaultRate = wordRate.qualityList;
        var optionList = ['video', 'music', 'game', 'serial', 'mult', 'book'];
        var createWord = function(word) {
            var container = $('<div>', {class: 'item'});
            container.append(
                $('<input>', {type: 'text', value: word}),
                $('<a>', {type: 'button', value: '', class: 'button remove'}).append('<i>')
            );
            return container;
        };
        var createWords = function(list, type) {
            var container = $('<div>', {class: 'wordList', 'data-type': 'list'+type});
            if (type) {
                container.append($('<h4>', {text: 'Words with case:'}));
            } else {
                container.append($('<h4>', {text: 'Words:'}));
            }
            if (list !== undefined) {
                list.forEach(function (word) {
                    container.append(createWord(word));
                });
            }
            container.append(
                $('<div>', {class: 'item'}).append($('<input>', {type: 'button', value: 'Add item', class: 'button new'}))
            );
            return container;
        };
        var getRateOptions = function(optionName) {
            var list = [];
            for (var i = 0, name; name = optionList[i]; i++) {
                list.push(
                    $('<option>', {value: name, selected: optionName === name, text: name})
                );
            }
            return list;
        };
        var createRate = function(key, value) {
            var container = $('<div>', {class: 'item'});
            container.append(
                $('<select>').append(
                    getRateOptions(key)
                ),
                $('<input>', {type: 'number', value: value, placeholder: '0'}),
                $('<a>', {type: 'button', value: '', class: 'button remove'}).append('<i>')
            );
            return container;
        };
        var createRates = function(rateList) {
            var container = $('<div>', {class: 'rateList'});
            container.append(
                $('<h4>', {text: 'Rate list:'})
            );
            if (rateList !== undefined) {
                for (var item in rateList) {
                    container.append(createRate(item, rateList[item]));
                }
            }
            container.append(
                $('<div>', {class: 'item'}).append($('<input>', {type: 'button', value: 'Add item', class: 'button new'}))
            );
            return container;
        };
        var createName = function(name) {
            var container = $('<div>', {class: 'nameItem'});
            container.append(
                $('<h4>', {text: 'Item name:'})
            );
            if (name === undefined) {
                container.append(
                    $('<div>', {class: 'item'}).append($('<input>', {type: 'button', value: 'Add name', class: 'button new'}))
                );
            } else {
                container.append(
                    $('<div>', {class: 'item'}).append(
                        $('<input>', {type: 'text', value: name}),
                        $('<a>', {type: 'button', value: '', class: 'button remove'}).append('<i>')
                    )
                );
            }
            return container;
        };
        var addCreateRateItemBtn = function(type) {
            var container = $('<div>', {class: 'rateItem new', 'data-type': type});
            container.append(
                $('<select>').append(
                    $('<option>', {value: 'sub', text: 'sub'}),
                    $('<option>', {value: 'subBefore', text: 'subBefore'}),
                    $('<option>', {value: 'subAfter', text: 'subAfter'})
                ),
                $('<input>', {type: 'button', value: 'Add new rule', class: 'button new'})
            );
            return container;
        };
        var createItem = function(item, type) {
            var container = $('<div>', {class: 'rateItem', 'data-type': type});
            var configList = $('<div>', {class: 'configList'});
            var list = createWords(item.list, '');
            var listCase = createWords(item.listCase, 'Case');
            var rate = createRates(item.rate);
            var name = createName(item.name);

            configList.append(list, listCase, rate, name);

            configList.append(
                $('<div>', {class: 'subItems'}).append(
                    createRateItems(item.sub, 'sub'),
                    createRateItems(item.subBefore, 'subBefore'),
                    createRateItems(item.subAfter, 'subAfter'),
                    addCreateRateItemBtn()
                )
            );

            var labelWords = Array.prototype.concat(item.list || [], item.listCase || []);
            labelWords = (type?(type + ': '):'') + labelWords.join(', ');

            container.append(
                $('<div>', {class: 'label', text: labelWords}),
                configList
            );
            return container;
        };
        var createRateItems = function(list, type) {
            var itemList = [];
            if (list === undefined) {
                return;
            }
            for (var i = 0, item; item = list[i]; i++) {
                itemList.push(createItem(item, type));
            }
            return itemList;
        };
        dom_cache.qualityList.append(createRateItems(wordRate.qualityList));
        dom_cache.qualityList.on('click', '.label', function() {
            var parent = this.parentNode;
            if (parent.classList.contains('show')) {
                parent.classList.remove('show');
            } else {
                parent.classList.add('show');
            }
        });
    };

    return {
        boot: function() {
            $(options.begin);
        },
        begin: function() {
            write_language();
            dom_cache.container = $('.div.container');
            dom_cache.menu = $('.menu');
            dom_cache.sectionList = $('.sectionList');

            dom_cache.backupUpdateBtn = $('#backupUpdate');
            dom_cache.restoreBtn = $('#restoreBtn');
            dom_cache.saveInCloudBtn = $('#saveInCloud');
            dom_cache.getFromCloudBtn = $('#getFromCloudBtn');
            dom_cache.clearCloudStorageBtn = $('#clearCloudStorage');
            dom_cache.backupInp = $('#backupInp');
            dom_cache.restoreInp = $('#restoreInp');
            dom_cache.qualityList = $('#qualityList');

            set_place_holder();

            document.getElementById('go_home_btn').addEventListener('click', function(e) {
                e.preventDefault();
                window.location = 'index.html';
            });

            if (!mono.isChrome) {
                dom_cache.saveInCloudBtn.hide();
                dom_cache.getFromCloudBtn.hide();
                dom_cache.clearCloudStorageBtn.hide();
                $('input[data-option="enableFavoriteSync"]').parent().hide();
                $('input[data-option="profileListSync"]').parent().hide();
            }
            if (mono.isChrome && mono.isChromeWebApp) {
                //Chromeum app
                $('input[data-option="searchPopup"]').parent().hide();
            }
            if (mono.isFF) {
                $('input[data-option="optDoNotSendStatistics"]').parent().hide();
            }

            if (_lang.t === 'en') {
                $('input[data-option="useEnglishPosterName"]').parent().hide();
            }

            bindTextInput();
            makeBackupForm();

            dom_cache.menu.on('click', 'a', function(e) {
                if (this.classList.contains('active')) {
                    return;
                }
                activeItem && activeItem.classList.remove('active');
                this.classList.add('active');
                activeItem = this;
                activePage && activePage.removeClass('active');
                var page = this.dataset.page;
                var currentPage = $('.page.' + page);
                currentPage.addClass('active');
                activePage = currentPage;
                if (page === 'backup') {
                    dom_cache.backupUpdateBtn.trigger('click');
                }
                if (page === 'restore') {
                    mono.storage.sync.get("bk_ch_inf", function(storage) {
                        if (storage.bk_ch_inf !== undefined) {
                            return;
                        }
                        dom_cache.getFromCloudBtn.prop('disabled', true);
                    });
                }
            });
            window.addEventListener("hashchange", onHashChange);
            onHashChange();
            mgrQuality();
            dom_cache.container.removeClass('loading');

            dom_cache.sectionList[0].addEventListener('click', listOptionsSave);
            document.body.addEventListener('click', saveChange);
        }
    }
}();

mono.pageId = 'tab';
engine.boot(options.boot);