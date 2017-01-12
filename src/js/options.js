/**
 * Created by Anton on 31.12.2016.
 */
"use strict";
require.config({
    baseUrl: './js',
    paths: {
        promise: './lib/promise.min'
    }
});
require([
    'promise',
    './module/i18nDom',
    './module/utils',
    './module/dom',
    './module/explore',
    './lib/jszip.min'
], function (Promise, i18nDom, utils, dom, Explore, JSZip) {
    new Promise(function (resolve) {
        i18nDom();
        chrome.storage.local.get({
            hidePeerRow: true,
            hideSeedRow: false,
            categoryWordFilter: true,
            contextMenu: true,
            disablePopup: false,
            invertIcon: false,
            eSections: [],
            favoriteSync: true,
            originalPosterName: false,
            kpFolderId: '1'
        }, resolve);
    }).then(function (storage) {
        document.body.classList.remove('loading');

        (function () {
            var bgReload = function () {
                chrome.runtime.sendMessage({action: 'reload'});
            };
            var onChangeOption = {
                contextMenu: bgReload,
                disablePopup: bgReload,
                invertIcon: bgReload
            };
            [].slice.call(document.querySelectorAll('[data-option]')).forEach(function (node) {
                var option = node.dataset.option;
                if (node.type === 'checkbox') {
                    node.checked = !!storage[option];
                    node.addEventListener('click', function () {
                        var _storage = {};
                        _storage[option] = storage[option] = !!node.checked;
                        chrome.storage.local.set(_storage, function () {
                            var onChange = onChangeOption[option];
                            onChange && onChange();
                        });
                    });
                } else
                if (node.type === 'text') {
                    node.value = storage[option];
                    node.addEventListener('keyup', utils.throttle(function () {
                        var _storage = {};
                        _storage[option] = storage[option] = node.value;
                        chrome.storage.local.set(_storage);
                    }, 250));
                }
            });
        })();

        (function () {
            var sectionsNode = document.querySelector('.mainPage__sections');

            var sections = storage.eSections;
            var idSectionMap = {};
            sections.forEach(function (item) {
                idSectionMap[item.id] = item;
            });
            Explore.prototype.insertDefaultSections(idSectionMap, sections);

            sections.forEach(function (section) {
                if (section.id === 'favorites') {
                    return;
                }
                sectionsNode.appendChild(dom.el('div', {
                    class: 'option',
                    append: [
                        dom.el('label', {
                            append: [
                                dom.el('input', {
                                    type: 'checkbox',
                                    checked: section.enable,
                                    on: ['click', function () {
                                        section.enable = this.checked;
                                        chrome.storage.local.set({
                                            eSections: sections
                                        });
                                    }]
                                }),
                                dom.el('span', {
                                    text: chrome.i18n.getMessage(section.id)
                                })
                            ]
                        })
                    ]
                }))
            })
        })();

        (function () {
            var exportZip = document.querySelector('.backup__export-zip');
            var importZip = document.querySelector('.backup__import-zip');

            var downloadBlob = function (blob) {
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'tmsBackup.zip';
                a.click();
                setTimeout(function () {
                    URL.revokeObjectURL(url);
                });
            };

            var writeFile = function () {
                return new Promise(function (resolve) {
                    chrome.storage.local.get(null, resolve);
                }).then(function (storage) {
                    var zip = new JSZip();
                    for (var key in storage) {
                        if (/^cache/.test(key) && key !== 'cache__favorites') {
                            continue;
                        }
                        zip.file(key + '.json', JSON.stringify(storage[key]));
                    }
                    return zip.generateAsync({
                        type:"blob",
                        compression: 'DEFLATE',
                        compressionOptions: {
                            level: 9
                        }
                    });
                }).then(function(blob) {
                    downloadBlob(blob);
                }).catch(function (err) {
                    console.error('Compress error', err);
                    alert('Write file error! ' + err.message);
                })
            };

            var readFile = function (file) {
                return JSZip.loadAsync(file).then(function (zip) {
                    var storage = {};
                    var promiseList = [];
                    zip.forEach(function (relativePath, zipEntry) {
                        var key = /(.+)\.json/i.exec(zipEntry.name);
                        if (key) {
                            key = key[1];
                            var promise = zip.file(relativePath).async("string").then(function (value) {
                                try {
                                    storage[key] = JSON.parse(value);
                                } catch (err) {
                                    console.error('Read file error!', relativePath, err);
                                }
                            });
                            promiseList.push(promise);
                        }
                    });
                    return Promise.all(promiseList).then(function () {
                        return new Promise(function (resolve) {
                            chrome.storage.local.set(storage, resolve);
                        });
                    });
                }).catch(function (err) {
                    console.error('Read file error', err);
                    alert('Read file error! ' + err.message);
                });
            };

            exportZip.addEventListener('click', function (e) {
                e.preventDefault();
                var _this = this;
                var defText = _this.textContent;
                _this.textContent = '...';
                writeFile().then(function () {
                    _this.textContent = defText;
                });
            });

            importZip.addEventListener('click', function (e) {
                e.preventDefault();
                var _this = this;
                var defText = _this.textContent;
                var input = dom.el('input', {
                    style: {
                        display: 'none'
                    },
                    type: 'file',
                    on: ['change', function (e) {
                        var file = e.target.files[0];
                        _this.textContent = '...';
                        readFile(file).then(function () {
                            _this.textContent = defText;
                        });
                    }]
                });
                input.click();
            });
        })();

        (function () {
            var activePage = null;
            var options = document.querySelector('.options');
            var activeItem = null;

            var sections = document.querySelector('.sections');
            sections.addEventListener('click', function(e) {
                var link = dom.closest('a', e.target);
                if (link) {
                    activePage && activePage.classList.remove('page-visible');
                    activeItem.classList.remove('item-active');
                    activeItem = link;
                    link.classList.add('item-active');

                    var type = link.dataset.page;
                    var page = document.querySelector('.page.page-' + type);
                    page.classList.add('page-visible');
                    activePage = page;
                }
            });

            activeItem = document.querySelector('.sections a[href="' + location.hash + '"]');
            if (!activeItem) {
                activeItem = document.querySelector('.sections a[href="#basic"]');
            }
            activeItem.dispatchEvent(new MouseEvent('click', {
                cancelable: true,
                bubbles: true
            }));
        })();
    });
});