/**
 * Created by Anton on 02.01.2017.
 */
"use strict";
require.config({
    baseUrl: './js'
});
require([
    './lib/promise.min',
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
], function (Promise, i18nDom, utils, dom, Dialog, CodeMirror) {
    i18nDom();

    document.body.classList.remove('loading');

    var params = utils.parseUrl(location.hash.substr(1), {
        params: true
    });

    var close = document.querySelector('.head__action-close');
    close.addEventListener('click', function (e) {
        e.preventDefault();
        window.close();
    });

    var parseMeta = function (code) {
        var meta = {};
        var readMeta = false;
        var params = {
            name: 'string',
            version: 'string',
            author: 'string',
            description: 'string',
            homepageURL: 'string',
            icon: 'string',
            icon64: 'string',
            updateURL: 'string',
            downloadURL: 'string',
            supportURL: 'string',
            require: 'array',
            connect: 'array'
        };
        code.split(/\r?\n/).some(function (line) {
            if (!/^\s*\/\//.test(line)) {
                return;
            }
            if (!readMeta && /[=]+UserScript[=]+/.test(line)) {
                readMeta = true;
            }
            if (readMeta && /[=]+\/UserScript[=]+/.test(line)) {
                readMeta = false;
                return true;
            }
            if (readMeta) {
                var m = /^\s*\/\/\s*@([A-Za-z0-9]+)\s+(.+)$/.exec(line);
                if (m) {
                    var key = m[1];
                    var value = m[2].trim();
                    var type = params[key];
                    if (type === 'string') {
                        meta[key] = value;
                    } else
                    if (type === 'array') {
                        if (!meta[key]) {
                            meta[key] = [];
                        }
                        meta[key].push(value);
                    }
                }
            }
        });
        if (!Object.keys(meta).length) {
            throw new Error("Meta data is not found!");
        }
        if (!meta.name) {
            throw new Error("Name field is not found!");
        }
        if (!meta.version) {
            throw new Error("Version field is not found!");
        }
        return meta;
    };

    var save = document.querySelector('.head__action-save');
    save.addEventListener('click', function (e) {
        e.preventDefault();
        var _this = this;
        var code = editor.getValue();
        try {
            var meta = parseMeta(code);
        } catch (e) {
            alert("Parse meta error!\n" + e.message);
            throw e;
        }
        var id = params.id || utils.getUuid();
        var tracker = {
            id: id,
            meta: meta,
            info: {},
            code: code
        };

        var defText = _this.textContent;
        _this.textContent = '...';
        chrome.storage.local.get({
            trackers: {}
        }, function (storage) {
            var trackers = storage.trackers;
            trackers[tracker.id] = tracker;
            chrome.storage.local.set({
                trackers: trackers
            }, function () {
                params.id = id;
                location.hash = utils.param({
                    id: id
                });
                _this.textContent = defText;
            });
        });
    });

    var editorTextarea = document.querySelector('.editor__textarea');
    var editor = CodeMirror.fromTextArea(editorTextarea, {
        mode: 'javascript',
        lineWrapping: true,
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        continueComments: true,
        styleActiveLine: true,
        extraKeys: {
            "Ctrl-S": function() {
                save.dispatchEvent(new MouseEvent('click'));
            }
        }
    });

    var getNewTrackerCode = function () {
        var code = [];
        code.unshift('==UserScript==');
        code.push(['@name', 'New Tracker'].join(' '));
        code.push(['@version', '1.0'].join(' '));
        code.push('==/UserScript==');
        code = code.map(function (line) {
            return ['//', line].join(' ');
        });
        code.push('');
        return code.join('\n');
    };

    var insertTrackerCode = function (trackerObj) {
        var code = [];
        code.unshift('==UserScript==');
        code.push(['@name', trackerObj.title].join(' '));
        if (trackerObj.desc) {
            code.push(['@description', trackerObj.desc].join(' '));
        }
        if (trackerObj.icon) {
            code.push(['@icon', trackerObj.icon].join(' '));
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
        editor.setValue(code.join('\n'));
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

                                try {
                                    var trackerObj = JSON.parse(values.code);
                                    insertTrackerCode(trackerObj);
                                } catch (e) {
                                    alert('Error!\n' + e.message);
                                }

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
    };

    chrome.storage.local.get({
        trackers: {}
    }, function (storage) {
        var trackers = storage.trackers;
        var tracker = null;
        if (params.id) {
            tracker = trackers[params.id];
        }
        var code = '';
        if (!tracker) {
            code = getNewTrackerCode();
        } else {
            code = tracker.code;
        }
        editor.setValue(code);

        if (params.code) {
            codeDialog();
        }
    });
});