var magic = function() {
    "use strict";
    var var_cache = {
        xhr: undefined,
        block_href:  /\/\//gim,
        block_src:   / src=(['"]?)/gim,
        unblock_src: /data:image\/gif,base64#blockrurl#/gm,
        unblock_href:/\/\/about:blank#blockurl#/gm,
        stripPath:   /(.*)>tr.*$/,
        stripPathSel:/^[^>]*>(.*)$/,
        root:        /(.*)\/[^\/]*$/,
        stScript:    /<script/gim,
        enScript:    /<\/script/gim,
        rmDisp:      /display[: ]+none/gim,
        rmVis:       /visibility[: ]+hidden/gim,
        ifContent: undefined,
        writePath: undefined,
        list_input_value: undefined,
        list_input_dom: undefined,
        pageDOM: undefined
    };
    var contentFilter = function(content) {
        content = content.replace(var_cache.stScript, '<textarea data-script="1"');
        content = content.replace(var_cache.enScript, '</textarea');
        content = content.replace(var_cache.rmDisp, '').replace(var_cache.rmVis, '');
        content = content.replace(var_cache.block_href, '//about:blank#blockurl#').replace(var_cache.block_src, ' src=$1data:image/gif,base64#blockrurl#');
        return content;
    };
    var make_code = function() {
        var code = {
            version: 1,
            type: 'kit',
            name: input_list.desk.tracker.title.val(),
            icon: input_list.desk.tracker.icon.val(),
            about: input_list.desk.tracker.desk.val(),
            root_url: input_list.search.root.val(),
            search_path: input_list.search.url.val(),
            items: input_list.selectors.list.input.val(),
            tr_name: input_list.selectors.torrent_name.input.val(),
            tr_link: input_list.selectors.torrent_link.input.val()
        };
        if (!code.icon) {
            code.icon = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
        }
        code.post = input_list.search.post.val();
        if (!code.post) {
            delete code.post;
        }
        code.charset = input_list.search.charset.val();
        if (!code.charset) {
            delete code.charset;
        }
        if (input_list.search.cp1251.prop('checked')) {
            code.encode = 1;
        }
        if (input_list.selectors.category_name.enable.prop('checked')) {
            code.cat_name = input_list.selectors.category_name.input.val();
            if (input_list.selectors.category_name.attr_enable.prop('checked')) {
                code.cat_attr = input_list.selectors.category_name.attr.val();
            }
        }
        if (input_list.selectors.category_link.enable.prop('checked')) {
            code.cat_link = input_list.selectors.category_link.input.val();
            if (input_list.selectors.category_link.add_root.prop('checked')) {
                code.cat_link_r = 1;
            }
        }
        if (input_list.selectors.torrent_link.add_root.prop('checked')) {
            code.tr_link_r = 1;
        }
        if (input_list.selectors.torrent_size.enable.prop('checked')) {
            code.tr_size = input_list.selectors.torrent_size.input.val();
            if (input_list.convert.size.convert.prop('checked')) {
                code.s_c = 1;
            }
            if (input_list.convert.size.regexp.val().length > 0) {
                code.size_r = input_list.convert.size.regexp.val();
                code.size_rp = input_list.convert.size.regexp_text.val();
            }
            if (input_list.selectors.torrent_size.attr_enable.prop('checked')) {
                code.size_attr = input_list.selectors.torrent_size.attr.val();
            }
        }
        if (input_list.selectors.torrent_dl.enable.prop('checked')) {
            code.tr_dl = input_list.selectors.torrent_dl.input.val();
            if (input_list.selectors.torrent_dl.add_root.prop('checked')) {
                code.tr_dl_r = 1;
            }
        }
        if (input_list.selectors.seed.enable.prop('checked')) {
            code.seed = input_list.selectors.seed.input.val();
            if (input_list.convert.seed.regexp.val().length > 0) {
                code.seed_r = input_list.convert.seed.regexp.val();
                code.seed_rp = input_list.convert.seed.regexp_text.val();
            }
        }
        if (input_list.selectors.peer.enable.prop('checked')) {
            code.peer = input_list.selectors.peer.input.val();
            if (input_list.convert.peer.regexp.val().length > 0) {
                code.peer_r = input_list.convert.peer.regexp.val();
                code.peer_rp = input_list.convert.peer.regexp_text.val();
            }
        }
        if (input_list.selectors.time.enable.prop('checked')) {
            code.date = input_list.selectors.time.input.val();
            if (input_list.selectors.time.attr_enable.prop('checked')) {
                code.date_attr = input_list.selectors.time.attr.val();
            }
            if (input_list.convert.time.regexp.val().length > 0) {
                code.t_r = input_list.convert.time.regexp.val();
                code.t_r_r = input_list.convert.time.regexp_text.val();
            }
            if (input_list.convert.time.today.prop('checked')) {
                code.t_t_r = 1;
            }
            if (input_list.convert.time.month.prop('checked')) {
                code.t_m_r = 1;
            }
            if (input_list.convert.time.format.val() !== '-1') {
                code.t_f = parseInt(input_list.convert.time.format.val());
            }
        }
        if (input_list.selectors.skip.first.val() > 0) {
            code.sf = parseInt(input_list.selectors.skip.first.val());
        }
        if (input_list.selectors.skip.last.val() > 0) {
            code.sl = parseInt(input_list.selectors.skip.last.val());
        }
        code.auth = input_list.auth.url.val();
        if (!code.auth) {
            delete code.auth;
        }
        code.auth_f = input_list.auth.input.val();
        if (!code.auth_f) {
            delete code.auth_f;
        }
        code.uid = hashCode(JSON.stringify(code));
        var tracker_code = JSON.stringify(code);
        input_list.save.code.textarea.val(tracker_code);
    };
    var read_code = function() {
        form_empty();
        var code;
        try {
            code = JSON.parse(input_list.save.code.textarea.val());
        } catch (e) {
            alert(mono.language.magic_1 + "\n" + e);
        }
        if (code === undefined) {
            return;
        }
        if (code.cat_name !== undefined) {
            input_list.selectors.category_name.input.val(code.cat_name);
            input_list.selectors.category_name.enable.prop('checked', false).trigger('click');
            if (code.cat_alt !== undefined) {
                input_list.selectors.category_name.attr_enable.prop('checked', false).trigger('click');
                input_list.selectors.category_name.attr.val('alt');
            }
            if (code.cat_attr !== undefined) {
                input_list.selectors.category_name.attr_enable.prop('checked', false).trigger('click');
                input_list.selectors.category_name.attr.val(code.cat_attr);
            }
        }
        if (code.cat_link !== undefined) {
            input_list.selectors.category_link.input.val(code.cat_link);
            input_list.selectors.category_link.add_root.prop('checked', code.cat_link_r !== undefined);
            input_list.selectors.category_link.enable.prop('checked', false).trigger('click');
        }
        if (code.root_url !== undefined) {
            input_list.search.root.val(code.root_url);
        }
        if (code.search_path !== undefined) {
            input_list.search.url.val(code.search_path);
        }
        if (code.encode !== undefined) {
            input_list.search.cp1251.prop('checked', code.encode);
        }
        if (code.charset !== undefined) {
            input_list.search.charset.val(code.charset);
        }
        if (code.post !== undefined) {
            input_list.search.post.val(code.post);
        }
        if (code.items !== undefined) {
            input_list.selectors.list.input.val(code.items);
            var_cache.list_input_value = code.items;
        }
        if (code.tr_name !== undefined) {
            input_list.selectors.torrent_name.input.val(code.tr_name);
        }
        if (code.tr_link !== undefined) {
            input_list.selectors.torrent_link.input.val(code.tr_link);
        }
        if (code.tr_link_r !== undefined) {
            input_list.selectors.torrent_link.add_root.prop('checked', true);
        }
        if (code.tr_size !== undefined) {
            input_list.selectors.torrent_size.input.val(code.tr_size);
            if (code.s_c !== undefined) {
                input_list.convert.size.convert.prop('checked', code.s_c);
            }
            input_list.selectors.torrent_size.enable.prop('checked', false).trigger('click');
            if (code.size_r !== undefined) {
                input_list.convert.size.regexp.val(code.size_r);
                input_list.convert.size.regexp_text.val(code.size_rp);
            }
            if (code.size_attr !== undefined) {
                input_list.selectors.torrent_size.attr_enable.prop('checked', false).trigger('click');
                input_list.selectors.torrent_size.attr.val(code.size_attr);
            }
        }
        if (code.tr_dl !== undefined) {
            input_list.selectors.torrent_dl.input.val(code.tr_dl);
            input_list.selectors.torrent_dl.add_root.prop('checked', code.tr_dl_r !== undefined);
            input_list.selectors.torrent_dl.enable.prop('checked', false).trigger('click');
        }
        if (code.seed !== undefined) {
            input_list.selectors.seed.input.val(code.seed);
            input_list.selectors.seed.enable.prop('checked', false).trigger('click');
            if (code.seed_r !== undefined) {
                input_list.convert.seed.regexp.val(code.seed_r);
                input_list.convert.seed.regexp_text.val(code.seed_rp);
            }
        }
        if (code.peer !== undefined) {
            input_list.selectors.peer.input.val(code.peer);
            input_list.selectors.peer.enable.prop('checked', false).trigger('click');
            if (code.peer_r !== undefined) {
                input_list.convert.peer.regexp.val(code.peer_r);
                input_list.convert.peer.regexp_text.val(code.peer_rp);
            }
        }
        if (code.date !== undefined) {
            input_list.selectors.time.input.val(code.date);
            input_list.selectors.time.enable.prop('checked', false).trigger('click');
            if (code.t_r !== undefined) {
                input_list.convert.time.regexp.val(code.t_r);
                input_list.convert.time.regexp_text.val(code.t_r_r);
            }
            if (code.t_t_r !== undefined) {
                input_list.convert.time.today.prop('checked', code.t_t_r);
            }
            if (code.t_m_r !== undefined) {
                input_list.convert.time.month.prop('checked', code.t_m_r);
            }
            if (code.t_f !== undefined) {
                input_list.convert.time.format.children('option[value=' + code.t_f + ']').prop('selected', true);
            }
            if (code.date_attr !== undefined) {
                input_list.selectors.time.attr_enable.prop('checked', false).trigger('click');
                input_list.selectors.time.attr.val(code.date_attr);
            }
        }
        if (code.sf !== undefined) {
            input_list.selectors.skip.first.val(code.sf);
        }
        if (code.sl !== undefined) {
            input_list.selectors.skip.last.val(code.sl);
        }
        if (code.auth !== undefined) {
            input_list.auth.url.val(code.auth);
        }
        if (code.auth_f !== undefined) {
            input_list.auth.input.val(code.auth_f);
        }
        if (code.icon !== undefined) {
            input_list.desk.tracker.icon.val(code.icon);
        }
        if (code.name !== undefined) {
            input_list.desk.tracker.title.val(code.name);
        }
        if (code.about !== undefined) {
            input_list.desk.tracker.desk.val(code.about);
        }
        dom_cache.menu.querySelector('a').dispatchEvent(new CustomEvent('click'));
    };
    var bindNodeList = function(itemName, nodeObj, parent, empty) {
        for (var key in nodeObj) {
            var node = nodeObj[key];
            if (empty) {
                var tagName = node.tagName;
                if (tagName === 'INPUT' && node.type === 'text' && key !== 'request') {
                    node.value = '';
                    node.classList.remove('error');
                } else
                if (tagName === 'INPUT' && node.type === 'checkbox') {
                    node.checked = false;
                } else
                if (tagName === 'INPUT' && node.type === 'number') {
                    node.value = 0;
                } else
                if (tagName === 'SELECT') {
                    node.selectedIndex = 0;
                }
                continue;
            }

            if (key === 'btn') {
                node.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (!var_cache.pageDOM) {
                        return;
                    }
                    selectMode(function(path, itemName, parent){
                        var path_text = onPathChange(path, itemName, parent);
                        var item = null;
                        if (parent) {
                            item = inputNodeList[parent][itemName];
                        } else {
                            item = inputNodeList[itemName];
                        }
                        item.input.classList.remove('error');
                        if (item.output) {
                            item.output.classList.remove('error');
                            if (!path_text[1]) {
                                item.output.classList.add('error');
                            }
                            if (itemName === 'torrent_size' ||
                                itemName === 'seed' ||
                                itemName === 'peer' ||
                                itemName === 'time') {
                                if (isNaN(parseInt(path_text[1]))) {
                                    item.output.classList.add('error');
                                }
                            }
                            item.output.value = path_text[1];
                            if (itemName === 'time') {
                                updateTimeConverter();
                            } else if (itemName === 'torrent_size') {
                                updateSizeConverter();
                            } else if (itemName === 'seed') {
                                updateSeedConverter();
                            } else if (itemName === 'peer') {
                                updatePeerConverter();
                            }
                        }
                        if (!path_text[0]) {
                            path_text[0] = path;
                            item.input.classList.add('error');
                        }
                        item.input.value = path_text[0];
                    }, itemName, parent);
                });
            }

            if (key === 'input') {
                node.addEventListener('keyup', function(){
                    if (!var_cache.pageDOM) {
                        return;
                    }
                    var item = null;
                    if (parent) {
                        item = inputNodeList[parent][itemName];
                    } else {
                        item = inputNodeList[itemName];
                    }
                    item.input.classList.remove('error');
                    if (!this.value) {
                        return;
                    }
                    var path_text = onPathChange(this.value, itemName, parent, 1);
                    if (item.output) {
                        item.output.classList.remove('error');
                        if (!path_text[1]) {
                            item.output.classList.add('error');
                        }
                        if (itemName === 'torrent_size' ||
                            itemName === 'seed' ||
                            itemName === 'peer' ||
                            itemName === 'time') {
                            if (isNaN(parseInt(path_text[1]))) {
                                item.output.classList.add('error');
                            }
                        }
                        item.output.value = path_text[1];
                        if (itemName === 'time') {
                            updateTimeConverter();
                        } else if (itemName === 'torrent_size') {
                            updateSizeConverter();
                        } else if (itemName === 'seed') {
                            updateSeedConverter();
                        } else if (itemName === 'peer') {
                            updatePeerConverter();
                        }
                    }
                    if (!path_text[0]) {
                        item.input.classList.add('error');
                    }
                });
            }

            if (key === 'enable') {
                node.addEventListener('change', function(){
                    var item = null;
                    if (parent) {
                        item = inputNodeList[parent][itemName];
                    } else {
                        item = inputNodeList[itemName];
                    }
                    item.btn.disabled = !this.checked;
                    item.input.disabled = !this.checked;
                    if (item.attr_enable) {
                        item.attr_enable.disabled = !this.checked;
                        if (!this.checked) {
                            item.attr.disabled = true;
                        } else
                        if (item.attr_enable.checked) {
                            item.attr.disabled = false;
                        }
                    }
                    if (item.add_root) {
                        item.add_root.disabled = !this.checked;
                    }
                });
            }

            if (key === 'attr_enable') {
                node.addEventListener('change', function(){
                    var item = null;
                    if (parent) {
                        item = inputNodeList[parent][itemName];
                    } else {
                        item = inputNodeList[itemName];
                    }
                    item.attr.disabled = !this.checked;
                    item.input.dispatchEvent(new CustomEvent('keyup'));
                });
            }

            if (key === 'attr') {
                node.addEventListener('keyup', function(){
                    var item = null;
                    if (parent) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    item.input.dispatchEvent(new CustomEvent('keyup'));
                });
            }

            if (key === 'regexp') {
                node.addEventListener('keyup', function(){
                    if (itemName === 'time') {
                        updateTimeConverter();
                    } else if (itemName === 'size') {
                        updateSizeConverter();
                    } else if (itemName === 'peer') {
                        updatePeerConverter();
                    } else if (itemName === 'seed') {
                        updateSeedConverter();
                    }
                });
            }

            if (key === 'regexp_text') {
                node.addEventListener('keyup', function(){
                    if (itemName === 'time') {
                        updateTimeConverter();
                    } else if (itemName === 'size') {
                        updateSizeConverter();
                    } else if (itemName === 'peer') {
                        updatePeerConverter();
                    } else if (itemName === 'seed') {
                        updateSeedConverter();
                    }
                });
            }

            if (key === 'format') {
                node.addEventListener('change', function(){
                    updateTimeConverter();
                });
            }

            if (key === 'today') {
                node.addEventListener('change', function(){
                    updateTimeConverter();
                });
            }

            if (key === 'month') {
                node.addEventListener('change', function(){
                    updateTimeConverter();
                });
            }

            if (key === 'convert') {
                node.addEventListener('change', function(){
                    updateSizeConverter();
                });
            }
        }

        if (nodeObj.input) {
            nodeObj.input.classList.add('input');
        }

        if (nodeObj.enable) {
            nodeObj.enable.checked = false;
            nodeObj.input.disabled = true;
            nodeObj.btn.disabled = true;
            if (nodeObj.attr_enable) {
                nodeObj.attr_enable.disabled = true;
                nodeObj.attr.classList.add('attr');
            }
            if (nodeObj.add_root) {
                nodeObj.add_root.disabled = true;
            }
        }

        if (nodeObj.output) {
            nodeObj.output.disabled = true;
            nodeObj.output.classList.add('output')
        }

        if (nodeObj.attr_enable) {
            nodeObj.attr_enable.checked = false;
            nodeObj.attr.disabled = true;
        }

        if (nodeObj.original) {
            nodeObj.original.disabled = true;
            nodeObj.converted.disabled = true;
        }

        if (nodeObj.result) {
            nodeObj.result.disabled = true;
        }

        if (nodeObj.table_mode) {
            nodeObj.table_mode.checked = true;
        }

        if (nodeObj.cp1251) {
            nodeObj.cp1251.checked = false;
        }
    };
    var form_empty = function() {
        for (var key in input_list) {
            var item = input_list[key];
            if (item.subSection) {
                for (var subKey in item) {
                    if (subKey === 'subSection') {
                        continue;
                    }
                    var subItem = item[subKey];
                    bindNodeList(subKey, subItem, key, 1);
                }
            } else {
                bindNodeList(key, item, null, 1);
            }
        }
        dom_cache.iframe.contentDocument.all[0].innerHTML = '';
        var_cache.pageDOM = undefined;
        var_cache.ifContent = undefined;
        var_cache.writePath = undefined;
        var_cache.list_input_dom = undefined;
    };
    var updateTimeConverter = function() {
        var text = input_list.selectors.time.output.val();
        input_list.convert.time.original.val( text );
        var value_regexp = input_list.convert.time.regexp.val();
        var value_regexp_text = input_list.convert.time.regexp_text.val();
        var isTodayReplace = input_list.convert.time.today.prop('checked');
        var isMonthReplace = input_list.convert.time.month.prop('checked');
        var timeFormat = parseInt(input_list.convert.time.format.val());
        if (value_regexp) {
            var regexp = new RegExp(value_regexp, 'ig');
            text = text.replace(regexp, value_regexp_text);
        }
        if (isTodayReplace) {
            text = ex_kit.today_replace(text, timeFormat);
        }
        if (isMonthReplace) {
            text = ex_kit.month_replace(text);
        }
        if (timeFormat !== -1) {
            text = ex_kit.format_date(timeFormat, text);
        }
        input_list.convert.time.converted.val(text);
        input_list.convert.time.result.val( new Date(text * 1000) );
    };
    var updateSizeConverter = function() {
        var text = input_list.selectors.torrent_size.output.val();
        input_list.convert.size.original.val( text );
        var value_regexp = input_list.convert.size.regexp.val();
        var value_regexp_text = input_list.convert.size.regexp_text.val();
        var isConvert = input_list.convert.size.convert.prop('checked');
        if (value_regexp) {
            var regexp = new RegExp(value_regexp, 'ig');
            text = text.replace(regexp, value_regexp_text);
        }
        if (isConvert) {
            text = ex_kit.format_size(text);
        }
        input_list.convert.size.converted.val( text );
        input_list.convert.size.result.val( bytesToSize(text) );
    };
    var updatePeerConverter = function() {
        var text = input_list.selectors.peer.output.val();
        input_list.convert.peer.original.val( text );
        var value_regexp = input_list.convert.peer.regexp.val();
        var value_regexp_text = input_list.convert.peer.regexp_text.val();
        if (value_regexp) {
            var regexp = new RegExp(value_regexp, 'ig');
            text = text.replace(regexp, value_regexp_text);
        }
        input_list.convert.peer.converted.val( text );
        input_list.convert.peer.result.val( parseInt(text) );
    };
    var updateSeedConverter = function() {
        var text = input_list.selectors.seed.output.val();
        input_list.convert.seed.original.val( text );
        var value_regexp = input_list.convert.seed.regexp.val();
        var value_regexp_text = input_list.convert.seed.regexp_text.val();
        if (value_regexp) {
            var regexp = new RegExp(value_regexp, 'ig');
            text = text.replace(regexp, value_regexp_text);
        }
        input_list.convert.seed.converted.val( text );
        input_list.convert.seed.result.val( parseInt(text) );
    };
    var onPathChange = function(path, itemName, parent, noStripPath) {
        var item;
        if (parent) {
            item = inputNodeList[parent][itemName];
        } else {
            item = inputNodeList[itemName];
        }
        if (item.table_mode) {
            if (!noStripPath && item.table_mode.checked) {
                path = path.replace(var_cache.stripPath, '$1>tr');
            }
            var_cache.list_input_dom = var_cache.pageDOM.find(path);
            if (var_cache.list_input_dom.length === 0) {
                console.log('Path in DOM not found!', path);
                return [];
            }
            var_cache.list_input_value = path;
        }
        if (item.output) {
            if (!var_cache.list_input_value) {
                return [];
            }
            if (!noStripPath) {
                path = path.replace(var_cache.list_input_value, '').replace(var_cache.stripPathSel,'$1');
            }
            var el = var_cache.list_input_dom.eq(inputNodeList.selectors.skip.first.value).find(path);
            if (el.length === 0){
                return [];
            }
            var text = '';
            if (item.attr_enable && item.attr_enable.checked) {
                var attr = item.attr.value;
                if (!attr) {
                    return [];
                }
                text = el.attr(attr);
            } else {
                if (itemName === 'category_link' ||
                    itemName === 'torrent_link' ||
                    itemName === 'torrent_dl') {
                    text = el.attr('href');
                } else {
                    text = el.text();
                }
            }
        } else
        if (!item.table_mode) {
            if (var_cache.pageDOM.find(path).length === 0) {
                console.log('error',path);
                path = '';
            }
        }
        return [path, text];
    };
    var selectMode = function(cb, itemName, parent) {
        if (var_cache.ifContent === undefined) {
            var_cache.ifContent = $(dom_cache.iframe).contents();
        }
        var_cache.ifContent.off();
        var_cache.ifContent.on('mouseenter', '*', function(e){
            e.preventDefault();
            var path = getPath($(this));
            var_cache.ifContent.find('.kit_select').removeClass('kit_select');
            this.classList.add("kit_select");
            if (path === undefined) {
                return;
            }
            dom_cache.status_bar.textContent = path;
            cb(path, itemName, parent);
        });
        var_cache.ifContent.on('click', function(e){
            e.preventDefault();
            var path = getPath($(this));
            var_cache.ifContent.find('.kit_select').removeClass('kit_select');
            var_cache.ifContent.off();
            if (path === undefined) {
                return;
            }
            dom_cache.status_bar.textContent = path;
            cb(path, itemName, parent);
        })
    };
    var getPath = function($node) {
        if ($node.length !== 1) {
            return;
        }
        var container = var_cache.ifContent;
        var path;
        while ($node.length !== 0) {
            var node = $node[0];
            if (node.nodeType !== 1) {
                break;
            }
            var tagName = node.tagName.toLowerCase();
            var tag = tagName;
            // on IE8, nodeName is '#document' at the top level, but we don't need that
            var parent = $node.parent();
            var cacheParentFindTag = parent.find(tag);
            if (node.id) {
                if (container !== undefined) {
                    if (tag !== 'TR' && container.find('#' + node.id).length === 1) {
                        return '#' + node.id + (path !== undefined ? '>' + path : '');
                    } else if (cacheParentFindTag.length !== 1) {
                        tagName += '[id=' + node.id + ']';
                    }
                } else {
                    return tagName + '#' + node.id + (path !== undefined ? '>' + path : '');
                }
            } else if (node.className !== undefined) {
                var classList = node.className.split(/\s+/);
                classList = classList.filter(function(a){
                    if (!a || a === 'kit_select') {
                        return 0;
                    }
                    return node.classList.contains(a);
                });
                if (classList.length > 0) {
                    tagName += '.' + classList.join('.');
                    if (container.find(tagName).length === 1){
                        return tagName + (path !== undefined ? '>' + path : '');
                    }
                }
            }
            if (cacheParentFindTag.length === 1) {
                tagName = tag;
            } else {
                var childs = parent.find(tagName);
                if (childs.length !== 1) {
                    var index = childs.index($node);
                    if (cacheParentFindTag.index($node) === index) {
                        tagName = tag;
                    }
                    tagName += ':eq(' + index + ')';
                }
            }
            path = tagName + (path ? '>' + path : '');
            $node = parent;
        }
        return path;
    };
    var hashCode = function(s) {
        var hash = 0, i, char_;
        if (s.length === 0)
            return hash;
        for (i = 0; i < s.length; i++) {
            char_ = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + char_;
            hash = hash & hash; // Convert to 32bit integer
        }
        return (hash < 0) ? hash * -1 : hash;
    };
    var bytesToSize = function(sizeList, bytes, nan) {
        "use strict";
        nan = nan || 'n/a';
        if (bytes <= 0) {
            return nan;
        }
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i === 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + sizeList[i];
        }
        var toFixed = 0;
        if (i > 2) {
            toFixed = 2;
        }
        return (bytes / Math.pow(1024, i)).toFixed(toFixed) + ' ' + sizeList[i];
    };
    return {
        domCache: {
            menu: document.getElementById('menu'),
            frame:  document.querySelector('iframe'),
            statusBar: document.getElementById('status_bar')
        },
        varCache: {
            xhr: null,
            block_href:  /\/\//gim,
            block_src:   / src=(['"]?)/gim,
            unblock_src: /data:image\/gif,base64#blockrurl#/gm,
            unblock_href:/\/\/about:blank#blockurl#/gm,
            stripPath:   /(.*)>tr.*$/,
            stripPathSel:/^[^>]*>(.*)$/,
            ifContent: null,
            writePath: null,
            list_input_value: null,
            list_input_dom: null,

            rmDisplayNode:      /display\s*:\s*['"]*none['"]*/gim,
            rmVisibilityHidden:       /visibility\s*:\s*['"]*hidden['"]*/gim,
            rootUrl: /([^:]+:\/\/[^\/]+)/,
            $frameDom: null,
            frameDoc: null,
            frameSelect: null
        },
        nodeList: {},
        contentFilter: function(content) {
            content = content.replace(this.varCache.rmDisplayNode, '');
            content = content.replace(this.varCache.rmVisibilityHidden, '');
            return content;
        },
        domFilter: function(fragment) {
            [].slice.call(fragment.querySelectorAll(['script', 'link', 'style'])).forEach(function(node) {
                var newNode = mono.create(node.tagName, {
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
        openPage: function(url, post) {
            var _this = this;
            post = post || '';
            if (!url) {
                return;
            }

            var query = this.nodeList.search.request.value;
            if (this.nodeList.search.cp1251.checked) {
                query = exKit.funcList.encodeCp1251(query);
            }
            url = url.replace('%search%', query);
            post = post.replace('%search%', query);

            var params = {
                type: 'GET',
                url: url,
                success: function(data) {
                    var domData = exKit.contentFilter(data);

                    var $frameDom = exKit.parseHtml(domData);
                    _this.varCache.$frameDom = $($frameDom);

                    var frameDom = exKit.parseHtml(_this.contentFilter(domData));
                    _this.domFilter(frameDom);

                    var documentElement = _this.domCache.frame.contentDocument.documentElement;
                    _this.varCache.frameDoc = documentElement;
                    documentElement.textContent = '';
                    documentElement.appendChild(frameDom);
                    documentElement.appendChild(mono.create('style', {
                        text: '.kit_select{color:#000 !important;background-color:#FFCC33 !important;cursor:pointer;box-shadow: 0 0 3px red, inset 0 0 3px red !important;}'
                    }));
                }
            };
            if (this.nodeList.search.charset.value) {
                params.mimeType = 'text/plain; charset=' + this.nodeList.search.charset.value;
            }
            if (post) {
                params.type = 'POST';
                params.data = post;
            }
            params.safe = true;

            if (this.varCache.lastXhr) {
                this.varCache.lastXhr.abort();
            }
            this.varCache.lastXhr = mono.ajax(params);
        },
        getNodePath: function(node) {
            var doc = this.varCache.frameDoc;
            var path = [];

            var next = function() {
                node = parent;
            };

            var target = node;
            while(node) {
                var parent = node.parentNode;
                if (!parent) {
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
                        path.unshift(tagName.toLowerCase() + '.' + classList.join('.').toLowerCase());
                        next();
                        continue;
                    }

                    var index = nodeList.indexOf(node) + 1;
                    path.unshift(tagName.toLowerCase() + ':nth-child(' + index + ')');
                }

                next();
            }

            var strPath = path.join('>');

            try {
                var found = doc.querySelector(strPath);
                if (found !== target) {
                    console.error('Doc is not found! ', strPath);
                    throw '';
                }
            } catch (e) {
                strPath = '';
            }

            return strPath;
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

                var path = _this.getNodePath(target);
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

            [].slice.call(frameDoc.querySelectorAll('.' + selectClassName)).forEach(function(node) {
                node.classList.remove(selectClassName);
            });

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
            var addRoot = selectorObj.add_root;
            var tableMode = selectorObj.table_mode;
            var skipFirst = this.nodeList.selectors.skip.first;
            var listInput = _this.nodeList.selectors.list.input;

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

            var checkPath = function(path) {
                var nodeList = null;
                var $dom = _this.varCache.$frameDom;
                if (output) {
                    nodeList = $dom.find(listInput.value).eq(getStartIndex()).find(path);
                } else {
                    nodeList = $dom.find(path);
                }
                if (!nodeList.length) {
                    input.classList.add('error');
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

                if (output && path.indexOf(listInput.value) === 0) {
                    path = path.substr(listInput.value.length).replace(/^:nth-child\(\d+\)\s*>\s*/, '');
                }

                input.value = path;

                checkPath(path);
            };

            var setOutput = function(node) {
                var result = null;
                attr && attr.classList.remove('error');
                if (attr && attr.value) {
                    var value = node.getAttribute(attr.value);
                    if (value === null) {
                        attr.classList.add('error');
                    }
                    result = value || '';
                } else
                if (['category_link', 'torrent_link', 'torrent_dl'].indexOf(key) !== -1) {
                    result = node.getAttribute('href') || '';
                } else {
                    result = node.textContent;
                }

                if (['seed', 'peer', 'torrent_size', 'time'].indexOf(key) !== -1) {
                    if (isNaN(parseInt(result))) {
                        output.classList.add('error');
                    } else {
                        output.classList.remove('error');
                    }
                }

                output.value = result;
            };

            btn.addEventListener('click', function() {
                _this.getSelectMode({
                    onOver: function(node, path) {
                        setPath(path);
                    },
                    onClick: function(node, path) {
                        setPath(path);
                    }
                });
            });

            input.addEventListener('keyup', function() {
                checkPath(input.value);
            });

            attr && attr.addEventListener('keyup', function() {
                checkPath(input.value);
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
                if (addRoot) {
                    addRoot.disabled = !checked;
                }
            });

            enable && enable.dispatchEvent(new CustomEvent('change'));

            if (output) {
                output.disabled = true;
                output.classList.add('output');
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
                        item.input.dispatchEvent(new CustomEvent('keyup'));
                    }
                }
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
                var formatValue = parseInt(format.value);

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
                if (formatValue !== -1) {
                    _result = exKit.funcList.dateFormat(formatValue, _result)
                }
                original.value = value;
                converted.value = _result;
                result.value = new Date(_result * 1000);
            };

            regexp.addEventListener('keyup', function() {
                this.classList.remove('error');
                try {
                    new RegExp(this.value, 'ig');
                } catch (e) {
                    this.classList.add('error');
                    return;
                }

                updateTime();
            });

            regexpText.addEventListener('keyup', function() {
                updateTime();
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
        },
        bindConvertPage: function() {
            var _this = this;
            var convert = this.nodeList.convert;

            for (var key in convert) {
                var item = convert[key];
                this.bindConvertItem(item, key);
            }

            mono.create(this.nodeList.convert.time.format, {
                append: (function(){
                    var list = [];
                    list.push(mono.create('option', {
                        text: '-',
                        value: -1
                    }));
                    var params = exKit.funcList.dateFormat();
                    for (var n = 0, item; item = params[n]; n++) {
                        list.push(mono.create('option', {
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
                _this.openPage(auth.url.value);
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
                updateRootUrl();
                _this.openPage(search.url.value, search.post.value);
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
            mono.writeLanguage(mono.language);
            bytesToSize = bytesToSize.bind(null, mono.language.sizeList.split(','));

            this.bindMenu();

            var dataIdList = [].slice.call(document.querySelectorAll('[data-id]'));
            dataIdList.forEach(function(node) {
                var keyList = node.dataset.id;
                keyList = keyList.split('_').map(function(item) {
                    return item.replace(/([A-Z])/, '_$1').toLowerCase();
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

            return;

            input_list.save.code.write.on('click', function(e){
                e.preventDefault();
                make_code();
            });

            input_list.save.code.read.on('click', function(e){
                e.preventDefault();
                read_code();
            });
        }
    };
}();
engine.init(function() {
    "use strict";
    $(function () {
        magic.one();
    });
});