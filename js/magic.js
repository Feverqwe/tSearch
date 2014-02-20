var magic = function() {
    var dom_cache = {};
    var var_cache = {
        xhr: undefined
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
    var contentFilter = function(c) {
        return c.replace(/display[: ]*none/img, '#blockdisp#').replace(/ src=(['"]?)/img, ' src=$1#blockrurl#');
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
                var_cache.pageDOM = $($.parseHTML(data));
                dom_cache.iframe[0].contentDocument.all[0].innerHTML = contentFilter(data) + '<style>.kit_select {color:#000 !important;background-color:#FFCC33 !important; cursor:pointer;} td.kit_select { border: 1px dashed red !important; }</style>';
            }
        };
        if (post.length > 0) {
            obj_req.type = 'POST';
            obj_req.data = post;
        }
        var_cache.xhr = $.ajax(obj_req);
    };
    var loadDom = function(item, value) {
        for (var i in value) {
            if ( value.hasOwnProperty(i) === false ) {
                continue;
            }
            var name = item+'_'+i;
            value[i] = $('input[name='+name+'],select[name='+name+'],textarea[name='+name+']');
            if (value[i].length !== 1) {
                console.log('Error:', 'count:', value[i].length, name);
                return;
            }
            if (i === 'btn') {
                value[i].data('type', item);
                value[i].on('click', function(e){
                    e.preventDefault();
                    //включать выделятор
                    // do...
                });
            } else if (i === 'input') {
                value[i].data('type', item);
                value[i].on('keyup', function(e){
                    e.preventDefault();
                    //обновлять text поле, подсвечивание при ошибке
                    // do...
                });
            } else if (i === 'enable') {
                value[i].data('type', item);
                value[i].on('click', function(e){
                    e.preventDefault();
                    var $this = $(this);
                    //если включено включать поля input и прочие на строке
                    // do...
                });
            } else if (i === 'attr_enable') {
                value[i].data('type', item);
                value[i].on('click', function(e){
                    e.preventDefault();
                    var $this = $(this);
                    //если включено включать поле attr на строке
                    // do...
                });
            }
        }
    };
    return {
        begin: function() {
            dom_cache.window = $(window);
            dom_cache.body = $('body');
            dom_cache.menu = $('ul.menu');
            dom_cache.pages = $('div.body');
            dom_cache.iframe = $('iframe');
            $.each(input_list, function(item, value){
                if (item === 'selectors' || item === 'convert' || item === 'desk' || item === 'save') {
                    $.each(value, function(subItem, value){
                        loadDom(subItem, value);
                    });
                    return 1;
                }
                loadDom(item, value);
            });

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
        }
    };
}();
$(function() {
    magic.begin();
});

$.fn.getPath = function(ifr) {
    if (this.length !== 1)
        return;
    var path, node = this;
    while (node.length) {
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
        name = name.toLowerCase();
        var tag = name;
        if (realNode.id) {
            if (ifr) {
                if (tag !== 'tr' && ifr.find(tag + '[id=' + realNode.id + ']').length === 1) {
                    return '#' + realNode.id + (path ? '>' + path : '');
                } else {
                    name += '[id=' + realNode.id + ']';
                }
            } else {
                return name + '#' + realNode.id + (path ? '>' + path : '');
            }
        } else if (realNode.className) {
            name += ('.' + realNode.className.split(/\s+/).join('.')).replace('.kit_select', '');
            if (ifr.find(name).length === 1) {
                return name + (path ? '>' + path : '');
            }
        }

        var parent = node.parent();
        var siblings_no_class = parent.children(tag);
        var siblings = siblings_no_class;
        try {
            siblings = parent.children(name);
        } catch (e) {
            name = tag;
        }
        if (siblings_no_class.length === 1) {
            name = tag;
        } else {
            if (siblings.length > 1) {
                name += ':eq(' + siblings.index(node) + ')';
            }
        }
        if ($.inArray(tag, ['table', 'div']) !== -1 && ifr.find(tag).length === 1) {
            return name + (path ? '>' + path : '');
        }
        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
};