/**
 * Created by Anton on 08.01.2017.
 */
"use strict";
require.config({
    baseUrl: './js',
    paths: {
        jquery: './lib/jquery-3.1.1.min',
        exKit: './module/exKit'
    }
});
require([
    './module/i18nDom',
    './module/utils',
    './module/dom',
    './lib/filesize.min',
    'exKit'
], function (i18nDom, utils, dom, filesize, exKit) {
    i18nDom();

    var magic = {
        domCache: {
            menu: document.getElementById('menu'),
            frame:  document.querySelector('iframe'),
            statusBar: document.getElementById('status_bar')
        },
        varCache: {
            lastXhr: null,
            rootUrl: /([^:]+:\/\/[^\/]+)/,
            $frameDom: null,
            frameDoc: null,
            $frameDoc: null,
            frameSelect: null,
            uid: null
        },
        nodeList: {},
        contentFilter: function(content) {
            return content;
        },
        domFilter: function(fragment) {
            [].slice.call(fragment.querySelectorAll(['script', 'link', 'style', 'iframe'])).forEach(function(node) {
                var newNode = dom.el(node.tagName, {
                    data: {
                        blockNode: 1
                    }
                });
                node.parentNode.replaceChild(newNode, node);
            });

            [].slice.call(fragment.querySelectorAll('*[style]')).forEach(function(node) {
                node.removeAttribute('style');
            });
        },
        openPage: function(url, post, cb) {
            var _this = this;
            post = post || '';
            if (!url) {
                return;
            }

            var query = this.nodeList.search.request.value;

            var encoding = this.nodeList.search.query_encoding.value;
            if (encoding !== 'utf-8') {
                if (encoding === 'cp1251') {
                    query = exKit.funcList.encodeCp1251(query);
                }
            }

            url = url.replace('%search%', query);
            post = post.replace('%search%', query);

            if (_this.varCache.frameDoc) {
                _this.varCache.frameDoc.textContent = '';
            }

            var params = {
                type: 'GET',
                url: url
            };
            if (this.nodeList.search.charset.value) {
                params.mimeType = 'text/plain; charset=' + this.nodeList.search.charset.value;
            }
            if (post) {
                params.type = 'POST';
                params.data = post;
            }

            if (this.varCache.lastXhr) {
                this.varCache.lastXhr.abort();
            }
            this.varCache.lastXhr = utils.request(params, function (err, response) {
                if (err) {
                    cb && cb(false);
                } else {
                    var data = response.body;
                    var domData = exKit.contentFilter(data);

                    var $frameDom = exKit.parseHtml(domData);
                    _this.varCache.$frameDom = $($frameDom);

                    var frameDom = exKit.parseHtml(_this.contentFilter(domData));
                    _this.domFilter(frameDom);

                    var documentElement = _this.domCache.frame.contentDocument.documentElement;
                    _this.varCache.frameDoc = documentElement;
                    _this.varCache.$frameDoc = $(documentElement);
                    documentElement.textContent = '';
                    documentElement.appendChild(frameDom);
                    documentElement.appendChild(dom.el('style', {
                        text: '.kit_select{color:#000 !important;background-color:#FFCC33 !important;cursor:pointer;box-shadow: 0 0 3px red, inset 0 0 3px red !important;}'
                    }));

                    cb && cb(true);
                }
            });
        },
        getHash: function(data) {
            var hash = 0, char_ = null;
            if (data.length === 0) {
                return hash;
            }

            for (var i = 0, len = data.length; i < len; i++) {
                char_ = data.charCodeAt(i);
                hash = ((hash << 5) - hash) + char_;
                hash = hash & hash; // Convert to 32bit integer
            }

            return (hash < 0) ? hash * -1 : hash;
        },
        getRandomColor: function() {
            return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
        },
        getCode: function() {
            var _this = this;
            var nodeList = this.nodeList;
            var selectors = nodeList.selectors;
            var convert = nodeList.convert;

            var getIcon = function() {
                var icon = nodeList.desk.tracker.icon.value;
                if (!icon) {
                    icon = _this.getRandomColor();
                }
                return icon;
            };

            var getCharset = function() {
                var value = null;
                if (nodeList.search.charset.value) {
                    value = 'text/html; charset=' + nodeList.search.charset.value;
                }
                return value;
            };

            var getQueryEncoding = function() {
                var list = [];

                var encoding = nodeList.search.query_encoding.value;
                if (encoding !== 'utf-8') {
                    list.push({name: 'encode', type: encoding});
                }

                if (list.length === 0) {
                    return null;
                }

                return list;
            };

            var getSelectorObj = function(key) {
                var item = selectors[key];

                if (item.enable && !item.enable.checked) {
                    return null;
                }

                var obj = {selector: item.input.value};
                if (item.attr && item.attr.value) {
                    obj.attr = item.attr.value;
                } else
                if (['category_link', 'torrent_link', 'torrent_dl', 'next_page_link'].indexOf(key) !== -1) {
                    obj.attr = 'href';
                }

                if (Object.keys(obj).length === 1) {
                    obj = obj.selector;
                }

                return obj;
            };

            var getSplice = function() {
                var start = parseInt(nodeList.selectors.skip.first.value);
                var end = parseInt(nodeList.selectors.skip.last.value);

                if (!start && !end) {
                    return null;
                }

                if (end !== 0) {
                    end *= -1;
                }

                return [start, end];
            };

            var getOnGetValueObj = function(key) {
                var convertItem = convert[key];
                var list = [];

                if (convertItem) {
                    if (convertItem.regexp && convertItem.regexp.value) {
                        list.push({name: 'replaceRe', re: convertItem.regexp.value, text: convertItem.regexp_text.value});
                    }
                    if (convertItem.today && convertItem.today.checked) {
                        list.push('replaceToday');
                    }
                    if (convertItem.month && convertItem.month.checked) {
                        list.push('replaceMonth');
                    }
                    if (convertItem.format && convertItem.format.value !== '-1') {
                        list.push({name: 'timeFormat', format: convertItem.format.value});
                    }
                    if (convertItem.convert && convertItem.convert.checked) {
                        list.push('convertSize');
                    }
                }

                if (list.length === 0) {
                    return null;
                }

                return list;
            };

            var code = {
                version: 2,
                type: 'kit',
                title: nodeList.desk.tracker.title.value,
                icon: getIcon(),
                desc: nodeList.desk.tracker.desk.value,
                search: {
                    loginUrl: nodeList.auth.url.value,
                    loginFormSelector: nodeList.auth.input.value,
                    searchUrl: nodeList.search.url.value,
                    nextPageSelector: getSelectorObj('next_page_link'),
                    baseUrl: nodeList.search.root.value,
                    requestType: nodeList.search.post.value ? 'POST' : 'GET',
                    requestData: nodeList.search.post.value || null,
                    requestMimeType: getCharset(),
                    onBeforeRequest: getQueryEncoding(),
                    listItemSelector: nodeList.selectors.list.input.value,
                    listItemSplice: getSplice(),
                    torrentSelector: {
                        categoryTitle: getSelectorObj('category_name'),
                        categoryUrl: getSelectorObj('category_link'),
                        title: getSelectorObj('torrent_name'),
                        url: getSelectorObj('torrent_link'),
                        size: getSelectorObj('size'),
                        downloadUrl: getSelectorObj('torrent_dl'),
                        seed: getSelectorObj('seed'),
                        peer: getSelectorObj('peer'),
                        date: getSelectorObj('time')
                    },
                    onGetValue: {
                        categoryTitle: getOnGetValueObj('category_name'),
                        categoryUrl: getOnGetValueObj('category_link'),
                        title: getOnGetValueObj('torrent_name'),
                        url: getOnGetValueObj('torrent_link'),
                        size: getOnGetValueObj('size'),
                        downloadUrl: getOnGetValueObj('torrent_dl'),
                        seed: getOnGetValueObj('seed'),
                        peer: getOnGetValueObj('peer'),
                        date: getOnGetValueObj('time')
                    }
                }
            };

            (function iter(obj) {
                for (var key in obj) {
                    var item = obj[key];
                    if (item === null) {
                        delete obj[key];
                        continue;
                    }

                    if (typeof item === 'object' && !Array.isArray(item)) {
                        iter(item);

                        if (!Object.keys(item).length) {
                            delete obj[key];
                            continue;
                        }
                    }
                }
            })(code);

            code.uid = this.varCache.uid || this.getHash(JSON.stringify(code));

            return JSON.stringify(code);
        },
        clearForm: function() {
            var _this = this;
            var nodeList = this.nodeList;

            if (_this.varCache.frameDoc) {
                _this.varCache.frameDoc.textContent = '';
            }

            this.varCache.$frameDom = null;
            this.varCache.$frameDoc = null;
            this.varCache.frameDoc = null;
            this.varCache.frameSelect = null;
            this.varCache.uid = null;

            nodeList.search.url.value = '';
            nodeList.search.query_encoding.selectedIndex = 0;
            nodeList.search.charset.value = '';
            nodeList.search.post.value = '';
            nodeList.search.root.value = '';

            nodeList.auth.url.value = '';
            nodeList.auth.input.value = '';

            nodeList.desk.tracker.icon.value = '';
            nodeList.desk.tracker.icon_file.value = '';
            nodeList.desk.tracker.icon_pic.dispatchEvent(new CustomEvent('updatePic'));
            nodeList.desk.tracker.title.value = '';
            nodeList.desk.tracker.desk.value = '';

            [].slice.call(document.querySelectorAll('.error')).forEach(function(node) {
                node.classList.remove('error');
            });

            var clearSelector = function(selectorItem) {
                if (selectorItem.table_mode) {
                    selectorItem.table_mode.checked = true;
                }
                if (selectorItem.input) {
                    selectorItem.input.value = '';
                }
                if (selectorItem.output) {
                    selectorItem.output.value = '';
                }
                if (selectorItem.attr) {
                    selectorItem.attr.value = '';
                }
                if (selectorItem.first) {
                    selectorItem.first.value = 0;
                }
                if (selectorItem.last) {
                    selectorItem.last.value = 0;
                }
                if (selectorItem.enable) {
                    selectorItem.enable.checked = false;
                    selectorItem.enable.dispatchEvent(new CustomEvent('change'));
                }
            };

            var clearConvert = function(convertItem) {
                if (convertItem.regexp) {
                    convertItem.regexp.value = '';
                    convertItem.regexp_text.value = '';
                }
                if (convertItem.today) {
                    convertItem.today.checked = false;
                }
                if (convertItem.month) {
                    convertItem.month.checked = false;
                }
                if (convertItem.format) {
                    convertItem.format.selectedIndex = 0;
                }
                if (convertItem.convert) {
                    convertItem.convert.checked = false;
                }
                if (convertItem.original) {
                    convertItem.original.value = '';
                }
                if (convertItem.converted) {
                    convertItem.converted.value = '';
                }
                if (convertItem.result) {
                    convertItem.result.value = '';
                }
            };

            for (var key in nodeList.selectors) {
                var item = nodeList.selectors[key];
                clearSelector(item);
            }

            for (var key in nodeList.convert) {
                var item = nodeList.convert[key];
                clearConvert(item);
            }
        },
        readCode: function(code) {
            var nodeList = this.nodeList;
            var selectors = nodeList.selectors;
            var convert = nodeList.convert;

            if (code.version === 1) {
                code = exKit.convertV1ToV2(code);
            }

            if (code.version !== 2) {
                return;
            }

            if (!code.search) {
                code.search = {};
            }

            var readCharset = function() {
                var m = code.search.requestMimeType && code.search.requestMimeType.match(/charset=(.+)/);
                m = m && m[1];
                return m || '';
            };

            var readQueryEncoding = function() {
                var onBeforeRequest = code.search.onBeforeRequest;
                if (!Array.isArray(onBeforeRequest)) {
                    return;
                }
                onBeforeRequest.some(function(item) {
                    if (item.name === 'encode') {
                        var node = nodeList.search.query_encoding.querySelector('[value="'+item.type+'"]');
                        if (node) {
                            nodeList.search.query_encoding.selectedIndex = node.index;
                            return true;
                        }
                    }
                });
            };

            var readSplice = function() {
                var arr = code.search.listItemSplice;
                if (!Array.isArray(arr)) {
                    return;
                }
                nodeList.selectors.skip.first.value = arr[0];
                if (arr[1] !== 0) {
                    arr[1] *= -1;
                }
                nodeList.selectors.skip.last.value = arr[1];
            };

            var selectorMap = {
                categoryTitle: 'category_name',
                categoryUrl: 'category_link',
                title: 'torrent_name',
                url: 'torrent_link',
                size: 'size',
                downloadUrl: 'torrent_dl',
                seed: 'seed',
                peer: 'peer',
                date: 'time',
                nextPageSelector: 'next_page_link'
            };

            var readSelector = function(key, obj) {
                var selectorItem = selectors[selectorMap[key]];

                if (typeof obj !== 'object') {
                    obj = {selector: obj};
                }

                if (!obj.selector) {
                    return;
                }

                selectorItem.input.value = obj.selector;

                if (selectorItem.attr) {
                    selectorItem.attr.value = obj.attr || '';
                }

                if (selectorItem.enable) {
                    selectorItem.enable.checked = true;
                    selectorItem.enable.dispatchEvent(new CustomEvent('change'));
                }
            };

            var readOnGetValue = function(key, list) {
                var selectorItem = selectors[selectorMap[key]];
                var convertItem = convert[selectorMap[key]];

                if (!Array.isArray(list)) {
                    return;
                }

                list.forEach(function(item) {
                    if (item.name === 'replaceRe') {
                        convertItem.regexp.value = item.re;
                        convertItem.regexp_text.value = item.text;
                    } else
                    if (item === 'replaceToday') {
                        if (convertItem.today) {
                            convertItem.today.checked = true;
                        }
                    } else
                    if (item === 'replaceMonth') {
                        if (convertItem.month) {
                            convertItem.month.checked = true;
                        }
                    } else
                    if (item.name === 'timeFormat') {
                        if (convertItem.format) {
                            var node = convertItem.format.querySelector('[value="'+item.format+'"]');
                            if (node) {
                                convertItem.format.selectedIndex = node.index;
                            }
                        }
                    } else
                    if (item === 'convertSize') {
                        if (convertItem.convert) {
                            convertItem.convert.checked = true;
                        }
                    }
                });
            };

            this.varCache.uid = code.uid;

            nodeList.desk.tracker.title.value = code.title || '';

            nodeList.desk.tracker.icon.value = code.icon || '';
            nodeList.desk.tracker.icon_pic.dispatchEvent(new CustomEvent('updatePic'));

            nodeList.desk.tracker.desk.value = code.desc;

            nodeList.auth.url.value = code.search.loginUrl || '';

            nodeList.auth.input.value = code.search.loginFormSelector || '';

            nodeList.search.url.value = code.search.searchUrl || '';

            nodeList.search.root.value = code.search.baseUrl || '';

            nodeList.search.post.value = code.search.requestData || '';

            nodeList.search.charset.value = readCharset();

            readQueryEncoding();

            selectors.list.input.value = code.search.listItemSelector;

            readSplice();

            readSelector('nextPageSelector', code.search.nextPageSelector);

            for (var key in code.search.torrentSelector) {
                readSelector(key, code.search.torrentSelector[key]);
            }

            for (var key in code.search.onGetValue) {
                readOnGetValue(key, code.search.onGetValue[key]);
            }
        },
        bindSavePage: function() {
            var _this = this;
            var save = this.nodeList.save.code;
            save.write.addEventListener('click', function(e){
                e.preventDefault();

                save.textarea.value = _this.getCode();
            });

            save.read.addEventListener('click', function(e){
                e.preventDefault();

                try {
                    var obj = JSON.parse(save.textarea.value);
                } catch (e) {
                    alert(chrome.i18m.getMessage('kitTrackerCodeReadError') + "\n" + e);
                    return;
                }

                _this.clearForm();
                _this.readCode(obj);
            });
        },
        bindDescPage: function() {
            var _this = this;
            var desc = this.nodeList.desk.tracker;

            desc.icon_file.addEventListener('change', function() {
                var file = this.files[0];
                if (!file) {
                    return;
                }

                var abort = function() {
                    desc.icon.value = '';
                    desc.icon_pic.dispatchEvent(new CustomEvent('updatePic'));
                    desc.icon_file.value = '';
                };

                if (['image/x-icon', 'image/jpeg', 'image/png', 'image/svg'].indexOf(file.type) === -1) {
                    return abort();
                }

                if (file.size > 1024 * 1024) {
                    return abort();
                }

                var reader = new FileReader();
                reader.onloadend = function() {
                    desc.icon.value = reader.result;

                    desc.icon_pic.dispatchEvent(new CustomEvent('updatePic'));
                };
                reader.readAsDataURL(file);
            });

            desc.icon_pic.addEventListener('updatePic', function() {
                var data = desc.icon.value;

                if (!data) {
                    data = _this.getRandomColor();
                }

                this.style.backgroundImage = 'url(' + exKit.getTrackerIconUrl(data) + ')';
            });

            desc.icon_pic.addEventListener('click', function(e) {
                e.preventDefault();

                desc.icon.value = '';
                desc.icon_file.value = '';

                this.dispatchEvent(new CustomEvent('updatePic'));
            });

            desc.icon_pic.dispatchEvent(new CustomEvent('updatePic'));
        },
        getNodePath: function(node, container) {
            var doc = this.varCache.frameDoc;
            var $doc = this.varCache.$frameDoc;
            var path = [];

            var next = function() {
                node = parent;
            };

            var target = node;
            while(node) {
                var parent = node.parentNode;
                if (!parent || parent.nodeType !== 1) {
                    break;
                }

                if (node === container.node) {
                    path.unshift(container.path);
                    break;
                }

                if (node.id && doc.querySelectorAll('#' + node.id).length === 1) {
                    path.unshift('#' + node.id);
                    break;
                }

                var tagName = node.tagName;
                var childNodes = [].slice.call(node.parentNode.childNodes);
                var classList = [].slice.call(node.classList).filter(function(className) {
                    return className !== 'kit_select';
                });

                var nodeList = childNodes.filter(function(node) {
                    return node.tagName === tagName;
                });

                if (nodeList.length === 1 && nodeList[0] === node) {
                    path.unshift(tagName.toLowerCase());
                } else {
                    var list = nodeList.filter(function(node) {
                        return classList.every(function(className) {
                            return node.classList.contains(className);
                        });
                    });

                    if (list.length === 1 && list[0] === node) {
                        var selector = tagName.toLowerCase() + '.' + classList.join('.');
                        path.unshift(selector);

                        if (doc.querySelectorAll(selector).length === 1) {
                            break;
                        } else {
                            next();
                            continue;
                        }
                    }

                    var index = nodeList.indexOf(node);
                    path.unshift(tagName.toLowerCase() + ':eq(' + index + ')');
                }

                next();
            }

            var strPath = path.join('>');

            try {
                var found = $doc.find(strPath);
                if (found.get(0) !== target) {
                    console.error('Doc is not found! ', strPath);
                    throw 'Node is not found!';
                }
            } catch (e) {
                strPath = '';
            }

            return strPath;
        },
        rmDocKitSelect: function() {
            var selectClassName = 'kit_select';
            var frameDoc = this.varCache.frameDoc;
            if (!frameDoc) {
                return;
            }
            [].slice.call(frameDoc.querySelectorAll('.' + selectClassName)).forEach(function(node) {
                node.classList.remove(selectClassName);
            });
        },
        getSelectMode: function(details) {
            var _this = this;
            var selectClassName = 'kit_select';
            var frameDoc = this.varCache.frameDoc;

            var onMouseOver = function(e) {
                var target = e.target;

                if (target.nodeType !== 1) {
                    return;
                }

                if (lastNode) {
                    lastNode.classList.remove(selectClassName);
                }

                lastNode = target;

                target.classList.add(selectClassName);

                var path = _this.getNodePath(target, details.container);
                lastPatch = path;

                _this.domCache.statusBar.textContent = path;

                details.onOver && details.onOver(target, path);
            };

            var stop = function() {
                frameDoc.removeEventListener('mouseover', onMouseOver);
                frameDoc.removeEventListener('click', onClick);
            };

            var onClick = function(e) {
                e.preventDefault();
                stop();

                details.onClick && details.onClick(lastNode, lastPatch);
            };

            var abort = function() {
                stop();

                details.onAbort && details.onAbort();
            };

            var lastNode = null;
            var lastPatch = null;

            this.rmDocKitSelect();

            frameDoc.addEventListener('mouseover', onMouseOver);
            frameDoc.addEventListener('click', onClick);

            if (this.varCache.frameSelect) {
                this.varCache.frameSelect.abort();
                this.varCache.frameSelect = null;
            }

            this.varCache.frameSelect = {
                abort: abort
            }
        },
        bindSelector: function(selectorObj, key) {
            var _this = this;
            var input = selectorObj.input;
            var btn = selectorObj.btn;
            var enable = selectorObj.enable;
            var output = selectorObj.output;
            var attr = selectorObj.attr;
            var tableMode = selectorObj.table_mode;
            var skipFirst = this.nodeList.selectors.skip.first;
            var skipLast = this.nodeList.selectors.skip.last;
            var listInput = _this.nodeList.selectors.list.input;
            var useParentNode = output && key !== 'next_page_link';

            var getStartIndex = function() {
                var index = skipFirst.value;
                index = parseInt(index);
                if (index !== 0 && !index) {
                    skipFirst.classList.add('error');
                    index = 0;
                } else {
                    skipFirst.classList.remove('error');
                }
                return index;
            };

            var getEndIndex = function() {
                var index = skipLast.value;
                index = parseInt(index);
                if (index !== 0 && !index) {
                    skipLast.classList.add('error');
                    index = 0;
                } else {
                    skipLast.classList.remove('error');
                }
                return index * -1;
            };

            var selectNode = function(path, nodeIndex) {
                nodeIndex = nodeIndex || 0;

                var nodeList = null;
                var $frameDoc = _this.varCache.$frameDoc;
                try {
                    if (useParentNode) {
                        nodeList = $frameDoc.find(listInput.value).eq(getStartIndex()).find(path);
                    } else {
                        nodeList = $frameDoc.find(path);
                    }
                } catch (e) {}

                var firstNode = nodeList && nodeList.eq(nodeIndex).get(0);

                if (!firstNode || !firstNode.classList.contains('kit_select')) {
                    _this.rmDocKitSelect();
                }

                if (firstNode) {
                    firstNode.classList.add('kit_select');
                }
            };

            var checkPath = function(path) {
                var nodeList = null;
                var $dom = _this.varCache.$frameDom;
                try {
                    if (useParentNode) {
                        nodeList = $dom.find(listInput.value).eq(getStartIndex()).find(path);
                    } else {
                        nodeList = $dom.find(path);
                    }
                } catch (e) {}

                if (!nodeList || !nodeList.length) {
                    input.classList.add('error');
                    if (output) {
                        output.value = ''
                    }
                } else {
                    input.classList.remove('error');
                    output && setOutput(nodeList[0]);
                }
            };

            var setPath = function(path) {
                if (tableMode && tableMode.checked) {
                    var m = path.match(/(.+>\s*tr)/);
                    m = m && m[1];
                    if (m) {
                        path = m;
                    }
                }

                if (useParentNode && path.indexOf(listInput.value) === 0) {
                    path = path.substr(listInput.value.length).replace(/^:eq\(\d+\)\s*>\s*/, '');
                }

                input.value = path;

                checkPath(path);
            };

            var setOutput = function(node) {
                var result = null;

                attr && attr.classList.remove('error');

                var attrValue = attr && attr.value;
                if (!attrValue && ['category_link', 'torrent_link', 'torrent_dl', 'next_page_link'].indexOf(key) !== -1) {
                    attrValue = 'href';
                }

                if (attrValue) {
                    var value = node.getAttribute(attrValue);
                    if (value === null) {
                        attr && attr.classList.add('error');
                    }
                    result = value || '';
                } else {
                    result = node.textContent;
                }

                result = exKit.contentUnFilter(result);

                var convertItems = ['seed', 'peer', 'size', 'time'];
                if (convertItems.indexOf(key) !== -1) {
                    if (isNaN(parseInt(result))) {
                        output.classList.add('error');
                    } else {
                        output.classList.remove('error');
                    }
                }

                output.value = result;

                if (convertItems.indexOf(key) !== -1) {
                    _this.nodeList.convert[key].regexp.dispatchEvent(new CustomEvent('keyup'));
                }
            };

            btn.addEventListener('click', function() {
                var container = {};
                if (useParentNode) {
                    var $frameDoc = _this.varCache.$frameDoc;
                    container.path = listInput.value + ':eq(' + getStartIndex() + ')';
                    container.parent = $frameDoc.find(container.path).get(0);
                }
                _this.getSelectMode({
                    container: container,
                    onOver: function(node, path) {
                        setPath(path);
                    },
                    onClick: function(node, path) {
                        setPath(path);
                    }
                });
            });

            input.addEventListener('test', function() {
                checkPath(input.value);
            });

            input.addEventListener('keyup', function() {
                checkPath(input.value);
                selectNode(input.value);
            });

            attr && attr.addEventListener('keyup', function() {
                checkPath(input.value);
                selectNode(input.value);
            });

            tableMode && tableMode.addEventListener('change', function() {
                setPath(input.value);
            });

            enable && enable.addEventListener('change', function() {
                var checked = this.checked;
                btn.disabled = !checked;
                input.disabled = !checked;
                if (attr) {
                    attr.disabled = !checked;
                }
            });

            enable && enable.dispatchEvent(new CustomEvent('change'));

            if (key === 'list') {
                input.addEventListener('selectFirstNode', function () {
                    selectNode(input.value, getStartIndex());
                });

                input.addEventListener('selectLastNode', function () {
                    selectNode(input.value, getEndIndex());
                });
            }

            if (output) {
                output.disabled = true;
                output.classList.add('output');
            }

            if (input) {
                input.classList.add('input');
            }

            if (attr) {
                attr.classList.add('attr');
            }

            if (tableMode) {
                tableMode.checked = true;
            }
        },
        bindSelectorPage: function() {
            var _this = this;
            var selectors = this.nodeList.selectors;

            for (var key in selectors) {
                var item = selectors[key];
                if (item.btn && item.input) {
                    this.bindSelector(item, key);
                }
            }

            selectors.skip.first.addEventListener('change', function(){
                for (var key in selectors) {
                    var item = selectors[key];
                    if (item.input && (!item.enable || item.enable && item.enable.checked)) {
                        item.input.dispatchEvent(new CustomEvent('test'));
                        if (key === 'list') {
                            item.input.dispatchEvent(new CustomEvent('selectFirstNode'));
                        }
                    }
                }
            });

            selectors.skip.first.addEventListener('keyup', function() {
                selectors.list.input.dispatchEvent(new CustomEvent('selectFirstNode'));
            });

            selectors.skip.last.addEventListener('change', function(){
                selectors.list.input.dispatchEvent(new CustomEvent('selectLastNode'));
            });

            selectors.skip.last.addEventListener('keyup', function() {
                selectors.list.input.dispatchEvent(new CustomEvent('selectLastNode'));
            });
        },
        bindConvertItem: function(convertObj, key) {
            var _this = this;
            var regexp = convertObj.regexp;
            var regexpText = convertObj.regexp_text;
            var today = convertObj.today;
            var month = convertObj.month;
            var format = convertObj.format;
            var original = convertObj.original;
            var converted = convertObj.converted;
            var convert = convertObj.convert;
            var result = convertObj.result;

            var updateTime = function() {
                var value = _this.nodeList.selectors.time.output.value;
                var rText = regexpText.value;
                var formatValue = format.value;

                var _result = value;
                if (regexp.value) {
                    _result = _result.replace(new RegExp(regexp.value, 'ig'), rText);
                }
                if (today.checked) {
                    _result = exKit.funcList.todayReplace(_result);
                }
                if (month.checked) {
                    _result = exKit.funcList.monthReplace(_result);
                }
                if (formatValue !== '-1') {
                    _result = exKit.funcList.dateFormat(formatValue, _result)
                }
                original.value = value;
                converted.value = _result;
                result.value = new Date(_result * 1000);
            };

            var updateSize = function() {
                var value = _this.nodeList.selectors.size.output.value;
                var rText = regexpText.value;

                var _result = value;
                if (regexp.value) {
                    _result = _result.replace(new RegExp(regexp.value, 'ig'), rText);
                }
                if (convert.checked) {
                    _result = exKit.funcList.sizeFormat(_result);
                }
                original.value = value;
                converted.value = _result;
                result.value = filesize(_result);
            };

            var updateValue = function(type) {
                var value = _this.nodeList.selectors[type].output.value;
                var rText = regexpText.value;

                var _result = value;
                if (regexp.value) {
                    _result = _result.replace(new RegExp(regexp.value, 'ig'), rText);
                }
                original.value = value;
                converted.value = _result;
                result.value = _result;
            };

            regexp.addEventListener('keyup', function() {
                this.classList.remove('error');
                try {
                    new RegExp(this.value, 'ig');
                } catch (e) {
                    this.classList.add('error');
                    return;
                }

                if (key === 'time') {
                    updateTime();
                } else
                if (key === 'size') {
                    updateSize();
                } else
                if (['seed', 'peer'].indexOf(key) !== -1) {
                    updateValue(key);
                }
            });

            regexpText.addEventListener('keyup', function() {
                if (key === 'time') {
                    updateTime();
                } else
                if (key === 'size') {
                    updateSize();
                } else
                if (['seed', 'peer'].indexOf(key) !== -1) {
                    updateValue(key);
                }
            });

            today && today.addEventListener('change', function() {
                updateTime();
            });

            month && month.addEventListener('change', function() {
                updateTime();
            });

            format && format.addEventListener('change', function() {
                updateTime();
            });

            convert && convert.addEventListener('change', function() {
                updateSize();
            });

            if (result) {
                result.disabled = true;
            }
            if (original) {
                original.disabled = true;
            }
            if (converted) {
                converted.disabled = true;
            }
        },
        bindConvertPage: function() {
            var _this = this;
            var convert = this.nodeList.convert;

            for (var key in convert) {
                var item = convert[key];
                this.bindConvertItem(item, key);
            }

            dom.el(this.nodeList.convert.time.format, {
                append: (function(){
                    var list = [];
                    list.push(dom.el('option', {
                        text: '-',
                        value: -1
                    }));
                    var params = exKit.funcList.dateFormat();
                    for (var n = 0, item; item = params[n]; n++) {
                        list.push(dom.el('option', {
                            text: item,
                            value: n
                        }));
                    }
                    return list;
                })()
            });
        },
        bindAuthPage: function() {
            var _this = this;
            var auth = this.nodeList.auth;
            auth.open.addEventListener('click', function(e){
                e.preventDefault();
                _this.openPage(auth.url.value, null, function(isSuccess) {
                    if (isSuccess) {
                        auth.url.classList.remove('error');
                    } else {
                        auth.url.classList.add('error');
                    }
                });
            });

            auth.url.addEventListener('keyup', function(e){
                if (e.keyCode === 13) {
                    auth.open.dispatchEvent(new CustomEvent('click'));
                }
            });

            this.bindSelector(auth);
        },
        bindSearchPage: function() {
            var _this = this;
            var search = this.nodeList.search;
            var updateRootUrl = function() {
                var url = search.url.value.match(_this.varCache.rootUrl);
                url = url && url[1] || '';
                if (url) {
                    url += '/';
                }
                search.root.value = url;
            };

            search.open.addEventListener('click', function(e){
                e.preventDefault();
                _this.openPage(search.url.value, search.post.value, function(isSuccess) {
                    if (isSuccess) {
                        search.url.classList.remove('error');
                    } else {
                        search.url.classList.add('error');
                    }
                });
            });

            search.request.addEventListener('keyup', function(e){
                if (e.keyCode === 13) {
                    search.open.dispatchEvent(new CustomEvent('click'));
                }
            });

            search.url.addEventListener('keyup', function(e){
                updateRootUrl();
                if (e.keyCode === 13) {
                    search.open.dispatchEvent(new CustomEvent('click'));
                }
            });

            search.post.addEventListener('keyup', function(e){
                if (e.keyCode === 13) {
                    search.open.dispatchEvent(new CustomEvent('click'));
                }
            });

            [].slice.call(search.query_encoding.childNodes).forEach(function(node) {
                if (node.nodeType !== 1) {
                    node.parentNode.removeChild(node);
                }
            });
        },
        bindMenu: function() {
            this.domCache.menu.addEventListener('click', function(e) {
                var target = e.target;
                if (target.tagName !== 'A') {
                    return;
                }
                e.preventDefault();

                var activeItem = this.querySelector('.active');
                var activePage = document.querySelector('.page.active');
                if (activeItem && activePage) {
                    activeItem.classList.remove('active');
                    activePage.classList.remove('active');
                }

                var pageName = target.dataset.page;
                target.classList.add('active');
                activePage = document.querySelector('.page.' + pageName);
                activePage.classList.add('active');
            });
        },
        one: function() {
            var _this = this;

            this.bindMenu();

            var dataIdList = [].slice.call(document.querySelectorAll('[data-id]'));
            dataIdList.forEach(function(node) {
                var keyList = node.dataset.id;
                keyList = keyList.split('_').map(function(item) {
                    return item.replace(/([A-Z])/g, '_$1').toLowerCase();
                });
                var key = keyList.pop();
                var obj = _this.nodeList;
                keyList.forEach(function(item, index) {
                    if (!obj[item]) {
                        obj[item] = {};
                    }
                    obj = obj[item];
                });
                obj[key] = node;
            });

            this.bindSearchPage();
            this.bindSelectorPage();
            this.bindConvertPage();
            this.bindAuthPage();
            this.bindDescPage();
            this.bindSavePage();

            document.body.classList.remove('loading');
        }
    };

    magic.one();
});