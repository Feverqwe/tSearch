/**
 * Created by Anton on 02.01.2017.
 */
"use strict";
require.config({
    baseUrl: './js',
    paths: {
        promise: './lib/promise.min',
        EventEmitter: './lib/EventEmitter.min'
    }
});
require([
    'promise',
    'EventEmitter',
    './module/pageController',
    './module/i18nDom',
    './module/utils',
    './module/dom',
    './module/dialog',
    '../codeMirror/lib/codemirror',
    '../codeMirror/mode/javascript/javascript',
    '../codeMirror/addon/edit/matchbrackets',
    '../codeMirror/addon/edit/closebrackets',
    '../codeMirror/addon/comment/continuecomment',
    '../codeMirror/addon/selection/active-line'
], function (Promise, EventEmitter, PageController, i18nDom, utils, dom, Dialog, CodeMirror) {
    new Promise(function (resolve) {
        i18nDom();
        chrome.storage.local.get({
            trackers: {}
        }, resolve);
    }).then(function (storage) {
        document.body.classList.remove('loading');

        var ee = new EventEmitter();

        var editor = null;
        (function () {
            var close = document.querySelector('.head__action-close');
            close.addEventListener('click', function (e) {
                e.preventDefault();
                window.close();
            });

            var save = document.querySelector('.head__action-save');
            save.addEventListener('click', function (e) {
                e.preventDefault();
                var _this = this;
                if (_this.textContent === '...') {
                    return;
                }

                var defText = _this.textContent;
                _this.textContent = '...';
                ee.trigger('save', [function () {
                    setTimeout(function () {
                        _this.textContent = defText;
                    }, 750);
                }]);
            });

            var editorTextarea = document.querySelector('.editor__textarea');
            editor = CodeMirror.fromTextArea(editorTextarea, {
                mode: 'javascript',
                lineWrapping: true,
                lineNumbers: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                continueComments: true,
                styleActiveLine: true,
                extraKeys: {
                    "Ctrl-S": function() {
                        save.dispatchEvent(new MouseEvent('click', {cancelable: true}));
                    },
                    "Cmd-S": function() {
                        save.dispatchEvent(new MouseEvent('click', {cancelable: true}));
                    }
                }
            });
        })();

        var pageController = new PageController();
        (function () {
            var getTitle = function () {
                var id = pageController.get('id');
                if (id) {
                    return 'Edit tracker ' + id;
                } else {
                    return 'New tracker';
                }
            };
            pageController.applyUrl = function () {
                var self = pageController;
                var title = document.title = getTitle();

                var id = self.get('id');
                if (id) {
                    ee.trigger('editTracker', [id])
                } else {
                    ee.trigger('newTracker')
                }

                if (self.get('code')) {
                    ee.trigger('showCodeDialog');
                }

                var url = self.getUrl();
                history.replaceState(null, title, url);
            };
        })();

        (function () {
            var autoUpdateNode = document.querySelector('.option__auto-update');
            autoUpdateNode.addEventListener('change', function () {
                ee.trigger('autoUpdate', [this.checked]);
            });
            ee.on('setAutoUpdate', function (tracker) {
                var state = tracker;
                if (tracker.info.disableAutoUpdate) {
                    state = false;
                }
                autoUpdateNode.checked = !!state;
            });
        })();

        var TrackerEditor = function (tracker) {
            var self = this;
            var info = tracker.info;
            var onSave = function (onReady) {
                var code = editor.getValue();
                var meta = {};

                try {
                    meta = utils.parseMeta(code);
                } catch (e) {
                    alert("Parse meta error!\n" + e.message);
                    throw e;
                }

                var tracker = {
                    id: self.id,
                    meta: meta,
                    info: info,
                    code: code
                };

                ee.trigger('setAutoUpdate', [tracker]);

                chrome.storage.local.get({
                    trackers: {}
                }, function (storage) {
                    storage.trackers[tracker.id] = tracker;

                    chrome.storage.local.set(storage, function () {
                        pageController.clear().set('id', self.id).go();
                        onReady();
                    });
                });
            };

            var onAutoUpdate = function (state) {
                info.disableAutoUpdate = !state;
            };

            ee.on('save', onSave);
            ee.on('autoUpdate', onAutoUpdate);

            this.id = tracker.id || utils.getUuid();
            this.setCode = function (code) {
                editor.setValue(code);
            };
            this.destroy = function () {
                ee.off('save', onSave);
                ee.off('autoUpdate', onAutoUpdate);
            };

            ee.trigger('setAutoUpdate', [tracker]);
            this.setCode(tracker.code);
            editor.focus();
        };

        var trackerEditor = null;

        (function () {
            var currentDialog = null;

            var getTrackerCode = function (trackerObj) {
                var code = [];
                code.unshift('==UserScript==');
                code.push(['@name', trackerObj.title].join(' '));
                if (trackerObj.desc) {
                    code.push(['@description', trackerObj.desc].join(' '));
                }
                if (trackerObj.icon) {
                    code.push(['@icon', trackerObj.icon].join(' '));
                }
                var hostname = /\/\/([^\/]+)/.exec(trackerObj.search.searchUrl);
                if (hostname) {
                    code.push(['@connect', '*://'+hostname[1]+'/*'].join(' '));
                }
                if (trackerObj.search.baseUrl) {
                    code.push(['@trackerURL', trackerObj.search.baseUrl].join(' '));
                }
                code.push(['@version', '1.0'].join(' '));
                code.push(['@require', 'exKit'].join(' '));
                code.push('==/UserScript==');
                code = code.map(function (line) {
                    return ['//', line].join(' ');
                });
                code.push('');
                code.push('var code = ' + JSON.stringify(trackerObj, null, 2) + ';');
                code.push('');
                code.push('API_exKit(code);');
                return code.join('\n');
            };

            var codeDialog = function () {
                var dialog = new Dialog();
                dom.el(dialog.body, {
                    class: ['dialog-code'],
                    append: [
                        dom.el('span', {
                            class: 'dialog__label',
                            text: chrome.i18n.getMessage('enterTrackerCode')
                        }),
                        dialog.addInput(dom.el('textarea', {
                            class: 'dialog__textarea',
                            name: 'code'
                        })),
                        dom.el('div', {
                            class: ['dialog__button_box'],
                            append: [
                                dom.el('a', {
                                    class: ['button', 'button-add'],
                                    href: '#add',
                                    text: chrome.i18n.getMessage('add'),
                                    on: ['click', function (e) {
                                        e.preventDefault();
                                        var values = dialog.getValues();

                                        var code = '';
                                        try {
                                            var trackerObj = JSON.parse(values.code);
                                            code = getTrackerCode(trackerObj);
                                        } catch (e) {
                                            alert('Error!\n' + e.message);
                                        }

                                        trackerEditor.setCode(code);

                                        dialog.destroy();
                                    }]
                                }),
                                dom.el('a', {
                                    class: ['button', 'button-cancel'],
                                    href: '#cancel',
                                    text: chrome.i18n.getMessage('cancel'),
                                    on: ['click', function (e) {
                                        e.preventDefault();
                                        dialog.destroy();
                                    }]
                                })
                            ]
                        })
                    ]
                });
                dialog.show();
                return dialog;
            };
            ee.on('showCodeDialog', function () {
                if (currentDialog) {
                    currentDialog.destroy();
                }
                currentDialog = codeDialog();
            });
        })();

        (function () {
            var getNewTrackerCode = function () {
                var code = [];
                code.unshift('==UserScript==');
                code.push(['@name', 'New Tracker'].join(' '));
                code.push(['@version', '1.0'].join(' '));
                code.push(['@connect', ''].join(' '));
                code.push('==/UserScript==');
                code = code.map(function (line) {
                    return ['//', line].join(' ');
                });
                code.push('');
                return code.join('\n');
            };

            ee.on('editTracker', function (id) {
                if (trackerEditor && trackerEditor.id === id) {
                    return;
                }

                if (trackerEditor) {
                    trackerEditor.destroy();
                }

                var tracker = storage.trackers[id];
                if (!tracker) {
                    alert('Tracker id not exists!');
                    return pageController.clear().go();
                }

                trackerEditor = new TrackerEditor(tracker);
            });

            ee.on('newTracker', function () {
                if (trackerEditor) {
                    trackerEditor.destroy();
                }

                var tracker = {
                    meta: {},
                    info: {},
                    code: getNewTrackerCode()
                };
                trackerEditor = new TrackerEditor(tracker);
            });
        })();

        pageController.applyUrl();
    });
});