var magic = function() {
    var dom_cache = {};
    var var_cache = {
        xhr: undefined,
        block_href:  new RegExp('\\/\\/','img'),
        block_src:   new RegExp(' src=([\'"]?)','img'),
        unblock_src: new RegExp('data:image\\/gif,base64#blockrurl#','mg'),
        unblock_href:new RegExp('\\/\\/about:blank#blockurl#','mg'),
        stripPath:   new RegExp('(.*)>tr.*$'),
        stripPathSel:new RegExp('^[^>]*>(.*)$'),
        root:        new RegExp('(.*)\\/[^\\/]*$'),
        stScript:    new RegExp('<script', 'img'),
        enScript:    new RegExp('<\\/script', 'img'),
        rmDisp:      new RegExp('display[: ]{1,}none','img'),
        rmVis:       new RegExp('visibility[: ]{1,}hidden','img'),
        ifContent: undefined,
        writePath: undefined,
        list_input_value: undefined,
        list_input_dom: undefined,
        pageDOM: undefined
    };
    var input_list = {
        search: {
            url: undefined,
            open: undefined,
            request: undefined,
            cp1251: undefined,
            post: undefined,
            root: undefined,
            charset: undefined
        },
        auth: {
            url: undefined,
            open: undefined,
            input: undefined,
            btn: undefined
        },
        selectors: {
            list: {
                input: undefined,
                table_mode: undefined,
                btn: undefined
            },
            category_name: {
                enable: undefined,
                input: undefined,
                output: undefined,
                attr_enable: undefined,
                attr: undefined,
                btn: undefined
            },
            category_link: {
                enable: undefined,
                input: undefined,
                output: undefined,
                add_root: undefined,
                btn: undefined
            },
            torrent_name: {
                input: undefined,
                output: undefined,
                btn: undefined
            },
            torrent_link: {
                input: undefined,
                output: undefined,
                add_root: undefined,
                btn: undefined
            },
            torrent_size: {
                enable: undefined,
                input: undefined,
                output: undefined,
                attr_enable: undefined,
                attr: undefined,
                btn: undefined
            },
            torrent_dl: {
                enable: undefined,
                input: undefined,
                output: undefined,
                add_root: undefined,
                btn: undefined
            },
            seed: {
                enable: undefined,
                input: undefined,
                output: undefined,
                btn: undefined
            },
            peer: {
                enable: undefined,
                input: undefined,
                output: undefined,
                btn: undefined
            },
            time: {
                enable: undefined,
                input: undefined,
                output: undefined,
                attr_enable: undefined,
                attr: undefined,
                btn: undefined
            },
            skip: {
                first: undefined,
                last: undefined
            }
        },
        convert: {
            time: {
                regexp: undefined,
                regexp_text: undefined,
                today: undefined,
                month: undefined,
                format: undefined,
                original: undefined,
                converted: undefined,
                result: undefined
            },
            size: {
                regexp: undefined,
                regexp_text: undefined,
                convert: undefined,
                original: undefined,
                converted: undefined,
                result: undefined
            },
            seed: {
                regexp: undefined,
                regexp_text: undefined,
                original: undefined,
                converted: undefined,
                result: undefined
            },
            peer: {
                regexp: undefined,
                regexp_text: undefined,
                original: undefined,
                converted: undefined,
                result: undefined
            }
        },
        desk: {
            tracker: {
                icon: undefined,
                title: undefined,
                desk: undefined,
                isCirilic: undefined,
                needAuth: undefined,
                isRus: undefined
            }
        },
        save: {
            code: {
                write: undefined,
                read: undefined,
                textarea: undefined
            }
        }
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
            tr_link: input_list.selectors.torrent_link.input.val(),
            flags: {
                a: (input_list.desk.tracker.needAuth.prop('checked')) ? 1 : 0,
                l: (input_list.desk.tracker.isRus.prop('checked')) ? 1 : 0,
                rs: (input_list.desk.tracker.isCirilic.prop('checked')) ? 1 : 0
            }
        };
        if (code.icon.length === 0) {
            code.icon = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
        }
        code.post = input_list.search.post.val();
        if (code.post.length === 0) {
            delete code.post;
        }
        if (input_list.search.charset.val().length > 0) {
            code.charset = input_list.search.charset.val();
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
        if (input_list.auth.url.val().length > 0) {
            code.auth = input_list.auth.url.val();
        }
        if (input_list.auth.input.val().length > 0) {
            code.auth_f = input_list.auth.input.val();
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
            alert(_lang.magic[1] + "\n" + e);
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
            input_list.selectors.time.enable.prop('checked', false).trigger('click');
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
        if (code.flags !== undefined) {
            input_list.desk.tracker.needAuth.prop('checked', code.flags.a);
            input_list.desk.tracker.isRus.prop('checked', code.flags.l);
            input_list.desk.tracker.isCirilic.prop('checked', code.flags.rs);
        }
        dom_cache.menu.children().eq(0).children('a').trigger('click');
    };
    var loadUrl = function(url, type) {
        if (url.length === 0) {
            return;
        }
        if (var_cache.xhr !== undefined) {
            var_cache.xhr.abort();
        }
        var post = (type === 'search')?input_list.search.post.val():'';
        var request = input_list.search.request.val();
        if (input_list.search.cp1251.prop('checked')) {
            request = ex_kit.in_cp1251(request);
        }
        url = url.replace('%search%', request);
        post = post.replace('%search%', request);
        var obj_req = {
            type: 'GET',
            url: url,
            success: function(data) {
                var_cache.ifContent = undefined;
                var_cache.pageDOM = $($.parseHTML(data));
                if (var_cache.list_input_value !== undefined && var_cache.list_input_value.length > 0) {
                    var_cache.list_input_dom = var_cache.pageDOM.find(var_cache.list_input_value);
                }
                dom_cache.iframe[0].contentDocument.all[0].innerHTML = contentFilter(data) +
                    '<style>' +
                        '.kit_select {color:#000 !important;background-color:#FFCC33 !important; cursor:pointer;}' +
                        'td.kit_select { border: 1px dashed red !important; }' +
                        'textarea[data-script="1"] {display: none;}' +
                    '</style>';
            }
        };
        var charset = input_list.search.charset.val();
        if (charset.length > 0) {
            obj_req.mimeType = "text/plain; charset="+charset;
        }
        if (post.length > 0) {
            obj_req.type = 'POST';
            obj_req.data = post;
        }
        var_cache.xhr = engine.ajax(obj_req);
    };
    var loadDom = function(itemName, value, parent, empty) {
        for (var i in value) {
            if ( value.hasOwnProperty(i) === false ) {
                continue;
            }
            var name = itemName+'_'+i;
            value[i] = $('input[name='+name+'],select[name='+name+'],textarea[name='+name+']');
            if (value[i].length !== 1) {
                console.log('Error:', 'count:', value[i].length, name);
                return;
            }
            if (empty !== undefined) {
                var tagName = value[i].get(0).tagName;
                if (tagName === 'INPUT' && value[i].attr('type') === 'text' && i !== 'request') {
                    value[i].val('').removeClass('error');
                } else if (tagName === 'SELECT') {
                    value[i].children('option[value=-1]').prop('selected', true);
                } else if (tagName === 'INPUT' && value[i].attr('type') === 'checkbox') {
                    value[i].prop('checked', false);
                } else if (tagName === 'INPUT' && value[i].attr('type') === 'number') {
                    value[i].val(0);
                }
                continue;
            }
            if (i === 'btn') {
                value[i].on('click', function(e){
                    e.preventDefault();
                    if (var_cache.pageDOM === undefined) {
                        return;
                    }
                    //включать выделятор
                    // do...
                    selectMode(function(path, itemName, parent){
                        var path_text = onPathChange(path, itemName, parent);
                        var item;
                        if (parent !== undefined) {
                            item = input_list[parent][itemName];
                        } else {
                            item = input_list[itemName];
                        }
                        item.input.removeClass('error');
                        if (item.output !== undefined) {
                            item.output.removeClass('error');
                            if (path_text[1] === undefined) {
                                path_text[1] = '';
                                item.output.addClass('error');
                            }
                            if (itemName === 'torrent_size' ||
                                itemName === 'seed' ||
                                itemName === 'peer' ||
                                itemName === 'time') {
                                if (isNaN(parseInt(path_text[1]))) {
                                    item.output.addClass('error');
                                }
                            }
                            item.output.val(path_text[1]);
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
                        if (path_text[0] === undefined) {
                            path_text[0] = path;
                            item.input.addClass('error');
                        }
                        item.input.val(path_text[0]);
                    }, itemName, parent);
                });
            } else if (i === 'input') {
                value[i].on('keyup', function(){
                    if (var_cache.pageDOM === undefined) {
                        return;
                    }
                    var item;
                    if (parent !== undefined) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    item.input.removeClass('error');
                    if (this.value.length === 0) {
                        return;
                    }
                    var path_text = onPathChange(this.value, itemName, parent, 1);
                    if (item.output !== undefined) {
                        item.output.removeClass('error');
                        if (path_text[1] === undefined) {
                            path_text[1] = '';
                            item.output.addClass('error');
                        }
                        if (itemName === 'torrent_size' ||
                            itemName === 'seed' ||
                            itemName === 'peer' ||
                            itemName === 'time') {
                            if (isNaN(parseInt(path_text[1]))) {
                                item.output.addClass('error');
                            }
                        }
                        item.output.val(path_text[1]);
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
                    if (path_text[0] === undefined) {
                        item.input.addClass('error');
                    }
                });
            } else if (i === 'enable') {
                value[i].on('click', function(){
                    var item;
                    if (parent !== undefined) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    item.btn.prop('disabled', !this.checked);
                    item.input.prop('disabled', !this.checked);
                    if (value.attr_enable !== undefined) {
                        value.attr_enable.prop('disabled', !this.checked);
                    }
                    if (value.add_root !== undefined) {
                        value.add_root.prop('disabled', !this.checked);
                    }
                });
            } else if (i === 'attr_enable') {
                value[i].on('click', function(){
                    var item;
                    if (parent !== undefined) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    item.attr.prop('disabled', !this.checked);
                    item.input.trigger('keyup');
                });
            } else if (i === 'attr') {
                value[i].on('keyup', function(){
                    var item;
                    if (parent !== undefined) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    item.input.trigger('keyup');
                });
            } else if (i === 'regexp') {
                value[i].on('keyup', function(){
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
            } else if (i === 'regexp_text') {
                value[i].on('keyup', function(){
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
            } else if (i === 'format') {
                value[i].on('change', function(){
                    updateTimeConverter();
                });
            } else if (i === 'today') {
                value[i].on('change', function(){
                    updateTimeConverter();
                });
            } else if (i === 'month') {
                value[i].on('change', function(){
                    updateTimeConverter();
                });
            } else if (i === 'convert') {
                value[i].on('change', function(){
                    // for size
                    updateSizeConverter();
                });
            }
        }
        if (value.input !== undefined) {
            value.input.addClass('input');
        }
        if (value.enable !== undefined) {
            value.enable.prop('checked', false);
            value.input.prop('disabled', true);
            value.btn.prop('disabled', true);
            if (value.attr_enable !== undefined) {
                value.attr_enable.prop('disabled', true);
                value.attr.addClass('attr')
            }
            if (value.add_root !== undefined) {
                value.add_root.prop('disabled', true);
            }
        }
        if (value.output !== undefined) {
            value.output.prop('disabled', true);
            value.output.addClass('output')
        }
        if (value.attr_enable !== undefined) {
            value.attr_enable.prop('checked', false);
            value.attr.prop('disabled', true);
        }
        if (value.original !== undefined) {
            value.original.prop('disabled', true);
            value.converted.prop('disabled', true);
        }
        if (value.result !== undefined) {
            value.result.prop('disabled', true);
        }
        if (value.table_mode !== undefined) {
            value.table_mode.prop('checked', true);
        }
        if (value.cp1251 !== undefined) {
            value.cp1251.prop('checked', false);
        }
    };
    var form_empty = function() {
        $.each(input_list, function(item, value){
            if (item === 'selectors' || item === 'convert' || item === 'desk' || item === 'save') {
                $.each(value, function(subItem, value){
                    loadDom(subItem, value, item, 1);
                });
                return 1;
            }
            loadDom(item, value, undefined, 1);
        });
        dom_cache.iframe[0].contentDocument.all[0].innerHTML = '';
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
        if (value_regexp.length > 0) {
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
        if (value_regexp.length > 0) {
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
        if (value_regexp.length > 0) {
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
        if (value_regexp.length > 0) {
            var regexp = new RegExp(value_regexp, 'ig');
            text = text.replace(regexp, value_regexp_text);
        }
        input_list.convert.seed.converted.val( text );
        input_list.convert.seed.result.val( parseInt(text) );
    };
    var onPathChange = function(path, itemName, parent, noStripPath) {
        var item;
        if (parent !== undefined) {
            item = input_list[parent][itemName];
        } else {
            item = input_list[itemName];
        }
        if (item.table_mode !== undefined) {
            if (noStripPath === undefined && item.table_mode.prop('checked')) {
                path = path.replace(var_cache.stripPath, '$1>tr');
            }
            var_cache.list_input_dom = var_cache.pageDOM.find(path);
            if (var_cache.list_input_dom.length === 0) {
                console.log('Path in DOM not found!', path);
                return [];
            }
            var_cache.list_input_value = path;
        }
        if (item.output !== undefined) {
            if (var_cache.list_input_value === undefined) {
                return [];
            }
            if (noStripPath === undefined) {
                path = path.replace(var_cache.list_input_value, '').replace(var_cache.stripPathSel,'$1');
            }
            var el = var_cache.list_input_dom.eq(input_list.selectors.skip.first.val()).find(path);
            if (el.length === 0){
                return [];
            }
            var text;
            if (item.attr_enable !== undefined && item.attr_enable.prop('checked')) {
                var attr = item.attr.val();
                if (attr.length === 0) {
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
        if (item.table_mode === undefined) {
            if (var_cache.pageDOM.find(path).length === 0) {
                console.log('error',path)
                path = undefined;
            }
        }
        return [path, text];
    };
    var selectMode = function(cb, itemName, parent) {
        if (var_cache.ifContent === undefined) {
            var_cache.ifContent = $(dom_cache.iframe.contents());
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
            dom_cache.status_bar.text(path);
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
            dom_cache.status_bar.text(path);
            cb(path, itemName, parent);
        })
    };
    var getPath = function(node) {
        if (node.length !== 1) {
            return;
        }
        var content = var_cache.ifContent;
        var path;
        while (node.length !== 0) {
            var realNode = node[0];
            var name = (
                    // IE9 and non-IE
                    realNode.localName ||
                    // IE <= 8
                    realNode.tagName ||
                    realNode.nodeName
                );
            // on IE8, nodeName is '#document' at the top level, but we don't need that
            if (name === undefined || name === '#document') {
                break;
            }
            var parent = node.parent();
            var tag = name;
            if (realNode.id !== undefined && realNode.id.length > 0) {
                if (content !== undefined) {
                    if (tag !== 'TR' && content.find('#' + realNode.id).length === 1) {
                        return '#' + realNode.id + (path !== undefined ? '>' + path : '');
                    } else if (parent.children(tag).length !== 1) {
                        name += '[id=' + realNode.id + ']';
                    }
                } else {
                    return name + '#' + realNode.id + (path !== undefined ? '>' + path : '');
                }
            } else if (realNode.className !== undefined) {
                var classList = realNode.className.split(/\s+/);
                classList = classList.filter(function(a){
                    if (a === 'kit_select' || a.length === 0) {
                        return 0;
                    }
                    var s = (/[^\w-]{1,}/).test(a);
                    return s === false;
                });
                if (classList.length > 0) {
                    name += ('.' + classList.join('.'));
                    if (name !== tag) {
                        if (content.find(name).length === 1){
                            return name + (path !== undefined ? '>' + path : '');
                        }
                    }
                }
            }
            if (parent.children(tag).length === 1) {
                name = tag;
            } else {
                var childs = parent.children(name);
                if (childs.length !== 1) {
                    var index = childs.index(node);
                    if (parent.children(tag).index(node) === index) {
                        name = tag;
                    }
                    name += ':eq(' + index + ')';
                }
            }
            path = name + (path ? '>' + path : '');
            node = parent;
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
    var bytesToSize = function(bytes, nan) {
        //переводит байты в строчки
        var sizes = _lang.size_list;
        if (nan === undefined)
            nan = 'n/a';
        if (bytes <= 0)
            return nan;
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i === 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        }
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    };
    var write_language = function() {
        $.each(_lang.magic, function(k, v) {
        var el = $('[data-lang=' + k + ']');
        if (el.length === 0) {
                return true;
            }
        var t = el.prop("tagName");
        if (t === "A" || t === "LEGEND" || t === "SPAN" || t === "LI" || t === "TH") {
                el.text(v);
            } else
            if (t === "INPUT") {
                el.val(v);
            } else {
                console.log(t);
            }
        });
    };
    return {
        begin: function() {
            write_language();
            dom_cache.window = $(window);
            dom_cache.body = $('body');
            dom_cache.menu = $('ul.menu');
            dom_cache.pages = $('div.body');
            dom_cache.iframe = $('iframe');
            dom_cache.status_bar = $('div.status_bar');
            dom_cache.select_time_format = $('select[name=time_format]');
            $.each(input_list, function(item, value){
                if (item === 'selectors' || item === 'convert' || item === 'desk' || item === 'save') {
                    $.each(value, function(subItem, value){
                        loadDom(subItem, value, item);
                    });
                    return 1;
                }
                loadDom(item, value);
            });
            dom_cache.select_time_format.append(
                $('<option>', {text: '-', value: -1}),
                (function(){
                    var list = [];
                    var params = ex_kit.format_date();
                    for (var n = 0, item; item = params[n]; n++) {
                        list.push(
                            $('<option>',{value: n, text: item})
                        );
                    }
                    return list;
                })()
            );
            dom_cache.menu.on('click', 'a', function(e) {
                e.preventDefault();
                var $this = $(this);
                var page = $this.data('page');
                dom_cache.menu.children('.active').removeClass('active');
                dom_cache.pages.children('.page.active').removeClass('active');
                $this.parent().addClass('active');
                dom_cache.pages.children('.page.'+page).addClass('active');
            });
            input_list.search.open.on('click', function(e){
                e.preventDefault();
                var type = 'search';
                input_list.search.root.val(input_list.search.url.val().replace(var_cache.root, '$1/'));
                loadUrl(input_list.search.url.val(), type);
            });
            input_list.auth.open.on('click', function(e){
                e.preventDefault();
                loadUrl(input_list.auth.url.val());
            });
            input_list.search.request.on('keyup', function(e){
                if (e.keyCode === 13) {
                    input_list.search.open.trigger('click');
                }
            });
            input_list.search.url.on('keyup', function(e){
                var root = this.value.replace(var_cache.root, '$1/');
                input_list.search.root.val(root);
            });
            input_list.auth.url.on('keyup', function(e){
                if (e.keyCode === 13) {
                    input_list.auth.open.trigger('click');
                }
            });
            input_list.selectors.skip.first.on('change', function(){
                $.each(input_list.selectors, function(itemName, item){
                    if (item.output !== undefined) {
                        item.input.trigger('keyup');
                    }
                });
            });
            input_list.save.code.write.on('click', function(e){
                e.preventDefault();
                make_code();
            });
            input_list.save.code.read.on('click', function(e){
                e.preventDefault();
                read_code();
            });
            if (window.opera !== undefined) {
                dom_cache.window.on('resize', function(){
                    dom_cache.iframe.css('height', dom_cache.window.height() - 304);
                });
                dom_cache.window.trigger('resize');
            }
        }
    };
}();
mono.pageId = 'tab';
mono.noAddon && mono.onMessage(function() {});
mono.localStorage(function () {
    window._lang = get_lang(mono.localStorage.get('lang') || navigator.language.substr(0, 2));
    $(function () {
        magic.begin();
    });
}, 1);