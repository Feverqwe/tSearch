/**
 * Created by Anton on 02.01.2017.
 */
"use strict";
(function () {
    var PageController = require('./module/pageController');
    var i18nDom = require('./module/i18nDom');
    var utils = require('./module/utils');
    var dom = require('./module/dom');
    var Dialog = require('./module/dialog');
    var counter = require('./module/counter');
    var CodeMirror = require('../codeMirror/lib/codemirror');

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
                    onReady();
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
                                            if (trackerObj.version === 1) {
                                                trackerObj = exKit.convertV1ToV2(trackerObj);
                                            }
                                            code = utils.trackerObjToUserScript(trackerObj);
                                        } catch (err) {
                                            alert('Error!\n' + err.message);
                                            throw err;
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

            var getEmptyTracker = function () {
                return {
                    meta: {},
                    info: {},
                    code: getNewTrackerCode()
                };
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
                    tracker = getEmptyTracker();
                    tracker.id = id;
                    alert('Tracker id not exists!');
                }

                trackerEditor = new TrackerEditor(tracker);
            });

            ee.on('newTracker', function () {
                if (trackerEditor) {
                    trackerEditor.destroy();
                }

                var tracker = getEmptyTracker();
                trackerEditor = new TrackerEditor(tracker);
            });
        })();

        pageController.applyUrl();

        counter();
    });
})();