var magic = function() {
    var dom_cache = {};
    var var_cache = {
        xhr: undefined,
        block_href:  new RegExp('\\/\\/','img'),
        block_src:   new RegExp(' src=([\'"]?)','img'),
        unblock_src: new RegExp('data:image\\/gif,base64#blockrurl#','mg'),
        unblock_href:new RegExp('\\/\\/about:blank#blockurl#','mg'),
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
            root: undefined
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
        content = content.replace(/<(\/?)script[^>]*/img,'<$1code data-script="1"');
        content = content.replace(/display[: ]{1,}none/img, '').replace(/visibility[: ]{1,}hidden/img, '');
        content = content.replace(var_cache.block_href, '//about:blank#blockurl#').replace(var_cache.block_src, ' src=$1data:image/gif,base64#blockrurl#');
        return content;
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
                dom_cache.iframe[0].contentDocument.all[0].innerHTML = contentFilter(data) +
                    '<style>' +
                        '.kit_select {color:#000 !important;background-color:#FFCC33 !important; cursor:pointer;}' +
                        'td.kit_select { border: 1px dashed red !important; }' +
                        'code[data-script="1"] {display: none;}' +
                    '</style>';
            }
        };
        if (post.length > 0) {
            obj_req.type = 'POST';
            obj_req.data = post;
        }
        var_cache.xhr = $.ajax(obj_req);
    };
    var loadDom = function(itemName, value, parent) {
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
            if (i === 'btn') {
                value[i].on('click', function(e){
                    e.preventDefault();
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
                        }
                        if (path_text[0] === undefined) {
                            path_text[0] = path;
                            item.input.addClass('error');
                        }
                        item.input.val(path_text[0]);
                    }, itemName, parent);
                });
            } else if (i === 'input') {
                value[i].on('keyup', function(e){
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
                    }
                    if (path_text[0] === undefined) {
                        item.input.addClass('error');
                    }
                });
            } else if (i === 'enable') {
                value[i].on('click', function(e){
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
                value[i].on('click', function(e){
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
                value[i].on('keyup', function(e){
                    var item;
                    if (parent !== undefined) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    item.input.trigger('keyup');
                });
            } else if (i === 'regexp') {
                value[i].on('keyup', function(e){
                    var item;
                    if (parent !== undefined) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    //обновление времени
                    //do..
                });
            } else if (i === 'regexp_text') {
                value[i].on('keyup', function(e){
                    var item;
                    if (parent !== undefined) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    //обновление времени
                    //do..
                });
            } else if (i === 'format') {
                value[i].on('change', function(e){
                    var item;
                    if (parent !== undefined) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    //обновление времени
                    //do..
                });
            } else if (i === 'today') {
                value[i].on('change', function(e){
                    var item;
                    if (parent !== undefined) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    //обновление времени
                    //do..
                });
            } else if (i === 'month') {
                value[i].on('change', function(e){
                    var item;
                    if (parent !== undefined) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    //обновление времени
                    //do..
                });
            } else if (i === 'convert') {
                value[i].on('change', function(e){
                    var item;
                    if (parent !== undefined) {
                        item = input_list[parent][itemName];
                    } else {
                        item = input_list[itemName];
                    }
                    // обновление размера
                    //do..
                });
            }
        }
        if (value.enable !== undefined) {
            value.input.prop('disabled', true);
            value.btn.prop('disabled', true);
            if (value.attr_enable !== undefined) {
                value.attr_enable.prop('disabled', true);
            }
            if (value.add_root !== undefined) {
                value.add_root.prop('disabled', true);
            }
        }
        if (value.attr_enable !== undefined) {
            value.attr.prop('disabled', true);
        }
        if (value.original !== undefined) {
            value.original.prop('disabled', true);
            value.converted.prop('disabled', true);
        }
        if (value.result !== undefined) {
            value.result.prop('disabled', true);
        }
    };
    var updateTimeConverter = function() {
        
    };
    var updateSizeConverter = function() {

    };
    var updatePeerConverter = function() {

    };
    var updateSeedConverter = function() {

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
                path = path.replace(/(.*)>tr.*$/, '$1>tr');
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
                path = path.replace(var_cache.list_input_value, '').replace(/^[^>]*>(.*)$/,'$1');
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
                    return (/[^\w]{1,}/).test(a) === false;
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
                var index = childs.index(node);
                if (parent.children(tag).index(node) === index) {
                    name = tag;
                }
                name += ':eq(' + index + ')';
            }
            path = name + (path ? '>' + path : '');
            node = parent;
        }
        return path;
    };
    return {
        begin: function() {
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
                var $this = $(this);
                var type = $this.data('type');
                loadUrl(input_list.search.url.val(), type);
            });
            input_list.auth.open.on('click', function(e){
                e.preventDefault();
                loadUrl(input_list.auth.url.val());
            });
            input_list.search.url.val('http://rutracker.org/forum/tracker.php?nm=%search%');
            input_list.search.request.val('Harry Potter');
            input_list.search.request.on('keyup', function(e){
                if (e.keyCode === 13) {
                    input_list.search.open.trigger('click');
                }
            });
            input_list.selectors.skip.first.on('change', function(){
                $.each(input_list.selectors, function(itemName, item){
                    if (item.output !== undefined) {
                        item.input.trigger('keyup');
                    }
                });
            });
        }
    };
}();
$(function() {
    magic.begin();
});