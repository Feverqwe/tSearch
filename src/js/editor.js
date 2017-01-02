/**
 * Created by Anton on 02.01.2017.
 */
"use strict";
require.config({
    baseUrl: './js'
});
require([
    './min/promise.min',
    './lib/i18nDom',
    './lib/utils',
    './lib/dom',
    './codeMirror/lib/codemirror',
    './codeMirror/mode/javascript/javascript',
    './codeMirror/addon/edit/matchbrackets',
    './codeMirror/addon/edit/closebrackets',
    './codeMirror/addon/comment/continuecomment',
    './codeMirror/addon/selection/active-line'
], function (Promise, i18nDom, utils, dom, CodeMirror) {
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
        var params = [
            'name',
            'version',
            'author',
            'description',
            'homepageURL',
            'icon',
            'icon64',
            'updateURL',
            'downloadURL',
            'supportURL'
        ];
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
                if (m && params.indexOf(m[1]) !== -1) {
                    meta[m[1]] = m[2].trim();
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
        var code = editor.getValue();
        try {
            var meta = parseMeta(code);
        } catch (e) {
            alert("Parse meta error!\n" + e.message);
            throw e;
        }
        var tracker = {
            id: params.id || utils.getUuid(),
            meta: meta,
            info: {},
            code: code
        };
        chrome.storage.local.get({
            trackers: {}
        }, function (storage) {
            var trackers = storage.trackers;
            trackers[tracker.id] = tracker;
            chrome.storage.local.set({
                trackers: trackers
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
        styleActiveLine: true
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
    });
});