var magic = function() {
    var select_mode = false;
    var sel_function = function(i) {
    };
    var hov_function = function(i) {
    };
    var xhr = null;
    var contentFilter = function(c) {
        var c = c.replace(/script/img, 'noscript').replace(/display[: ]*none/img, '#blockdisp#');
        return c;
    }
    var isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    var open_page = function(url) {
        var iframe = $('iframe');
        if (xhr != null)
            xhr.abort();
        var post_r = $('input[name=post]').val();
        var search = $('input[name=search_text]').val();
        if (post_r.length == 0 && $('input[name=cp1251encode]').prop('checked')) {
            search = encode(search);
        }
        url = url.replace('%search%', search);
        post_r = post_r.replace('%search%', search);
        xhr = $.ajax({
            type: (post_r.length > 0) ? 'POST' : 'GET',
            url: url,
            data: post_r,
            success: function(data) {
                var iframedoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
                iframedoc.body.innerHTML = contentFilter(data) + '<style>.kit_select {color:#000 !important;background-color:#FFCC33 !important; cursor:pointer;} td.kit_select { border: 1px dashed red !important; }</style>';
            }
        });
    }
    var make_code = function() {
        var code = {
            'version': 1,
            'name' : 'noname',
            'icon': '',
            'root_url': $('input[name=base_path]').val(),
            'search_path': $('input[name=search_url]').val(),
            'encode': $('input[name=cp1251encode]').prop('checked'),
            'post':  $('input[name=post]').val(),
            'items': $('input[name=item]').val(),
        }
        if ( $('input[name=category_name]').parents().eq(1).find('input[name=status]').prop('checked') ) {
            code['cat_name'] = $('input[name=category_name]').val();
            code['cat_link'] = $('input[name=category_link]').val()
            code['cat_link_r'] = $('input[name=category_link_base_path]').prop('checked');
        }
        code['tr_name'] = $('input[name=torrent_name]').val();
        code['tr_link'] = $('input[name=torrent_link]').val();
        code['tr_link_r'] = $('input[name=torrent_link_base_path]').prop('checked');
        if ( $('input[name=torrent_size]').parents().eq(1).find('input[name=status]').prop('checked') ) {
            code['tr_size'] = $('input[name=torrent_size]').val();
        }
        if ( $('input[name=torrent_dl_link]').parents().eq(1).find('input[name=status]').prop('checked') ) {
            code['tr_dl'] = $('input[name=torrent_dl_link]').val();
            code['tr_dl_r'] = $('input[name=torrent_dl_link_base_path]').prop('checked');
        }
        if ( $('input[name=seed_count]').parents().eq(1).find('input[name=status]').prop('checked') ) {
            code['seed'] = $('input[name=seed_count]').val();
        }
        if ( $('input[name=peer_count]').parents().eq(1).find('input[name=status]').prop('checked') ) {
            code['pees'] = $('input[name=peer_count]').val();
        }
        if ( $('input[name=add_time]').parents().eq(1).find('input[name=status]').prop('checked') ) {
            code['date'] = $('input[name=add_time]').val();
        }
        if ( $('input[name=skip_first]').parents().eq(1).find('input[name=status]').prop('checked') ) {
            code['sf'] = $('input[name=skip_first]').val();
        }
        if ( $('input[name=skip_last]').parents().eq(1).find('input[name=status]').prop('checked') ) {
            code['sl'] = $('input[name=skip_last]').val();
        }
        if ( $('input[name=time_regexp]').val().length > 0 ) {
            code['t_r'] = $('input[name=time_regexp]').val();
            code['t_r_r'] = $('input[name=time_regexp_repl]').val();
        }
        if ( $('input[name=month_replace]').prop('checked') ) {
            code['t_m_r'] = 1;
        }
        if ( $('input[name=mount_replace_short]').val()!=-1 ) {
            code['t_m_r'] = $('input[name=mount_replace_short]').val();
        }
        if ( $('input[name=convert_size]').prop('checked') ) {
            code['s_c'] = 1;
        }
        $('textarea').html(JSON.stringify(code));
    }
    var obj_in_path = function(obj, ifr) {
        var path = obj.getPath(ifr);
        return path;
    }
    var format_size = function(s) {
        var size = s.replace(/[^0-9.кбмгтkmgtb]/ig, '');
        var t = size.replace(/кб|kb/i, '');
        if (t.length != size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024);
        }
        var t = size.replace(/мб|mb/i, '');
        if (t.length != size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024 * 1024);
        }
        var t = size.replace(/гб|gb/i, '');
        if (t.length != size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024 * 1024 * 1024);
        }
        var t = size.replace(/tб|tb/i, '');
        if (t.length != size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024 * 1024 * 1024 * 1024);
        }
        return 0;
    }
    var bytesToSize = function(bytes, nan) {
        var sizes = _lang['size_list'];
        if (nan == null)
            nan = 'n/a';
        if (bytes == 0)
            return nan;
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i == 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        }
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
    var format_date = function(f, t) {
        if (f == null) {
            return ['2013-04-31[ 07[:03[:27]]]', '31-04-2013[ 07[:03[:27]]]', 'n day ago']
        }
        if (f == 0 || f == '2013-04-31[ 07[:03[:27]]]') {
            var dd = t.replace(/[^0-9]/g, ' ').replace(/\s+/g, ' ').split(' ');
            for (var i = 0; i < 6; i++) {
                if (dd[i] == null) {
                    dd[i] = 0;
                }
            }
            if (dd[0] < 10) {
                dd[0] = '200' + dd[0];
            }
            if (dd[0] < 100) {
                dd[0] = '20' + dd[0];
            }
            return Math.round((new Date(parseInt(dd[0]), parseInt(dd[1]) - 1, parseInt(dd[2]), parseInt(dd[3]), parseInt(dd[4]), parseInt(dd[5]))).getTime() / 1000);
        }
        if (f == 1 || f == '31-04-2013[ 07[:03[:27]]]') {
            var dd = t.replace(/[^0-9]/g, ' ').replace(/\s+/g, ' ').split(' ');
            for (var i = 0; i < 6; i++) {
                if (dd[i] == null) {
                    dd[i] = 0;
                }
            }
            if (dd[2] < 10) {
                dd[2] = '200' + dd[2];
            }
            if (dd[2] < 100) {
                dd[2] = '20' + dd[2];
            }
            return Math.round((new Date(parseInt(dd[2]), parseInt(dd[1]) - 1, parseInt(dd[0]), parseInt(dd[3]), parseInt(dd[4]), parseInt(dd[5]))).getTime() / 1000);
        }
        if (f == 2 || f == 'n day ago') {
            var old = parseFloat(t.replace(/[^0-9.]/g, '')) * 24 * 60 * 60;
            return Math.round((new Date()).getTime() / 1000) - old;
        }
    }
    function month_replace(t) {
        return t.replace(/янв/i, '1').replace(/фев/i, '2').replace(/мар/i, '3')
                .replace(/апр/i, '4').replace(/мая/i, '5').replace(/июн/i, '6')
                .replace(/июл/i, '7').replace(/авг/i, '8').replace(/сен/i, '9')
                .replace(/окт/i, '10').replace(/ноя/i, '11').replace(/дек/i, '12')
                .replace(/Jan/i, '1').replace(/Feb/i, '2').replace(/Mar/i, '3')
                .replace(/Apr/i, '4').replace(/May/i, '5').replace(/Jun/i, '6')
                .replace(/Jul/i, '7').replace(/Aug/i, '8').replace(/Sep/i, '9')
                .replace(/Oct/i, '10').replace(/Nov/i, '11').replace(/Dec/i, '12');
    }
    var encode = function(sValue) {
        var text = "", Ucode, ExitValue, s;
        for (var i = 0; i < sValue.length; i++) {
            s = sValue.charAt(i);
            Ucode = s.charCodeAt(0);
            var Acode = Ucode;
            if (Ucode > 1039 && Ucode < 1104) {
                Acode -= 848;
                ExitValue = "%" + Acode.toString(16);
            }
            else if (Ucode == 1025) {
                Acode = 168;
                ExitValue = "%" + Acode.toString(16);
            }
            else if (Ucode == 1105) {
                Acode = 184;
                ExitValue = "%" + Acode.toString(16);
            }
            else if (Ucode == 32) {
                Acode = 32;
                ExitValue = "%" + Acode.toString(16);
            }
            else if (Ucode == 10) {
                Acode = 10;
                ExitValue = "%0A";
            }
            else {
                ExitValue = s;
            }
            text = text + ExitValue;
        }
        return text;
    }
    return {
        begin: function() {
            $('iframe.web').css('height', $(window).height() - $('div.tools').height() - 4 + 'px');
            $('input[name=open]').on('click', function() {
                var url = $(this).parents().eq(1).find('input[name=search_url]').val();
                open_page(url);
                $('input[name=base_path]').val(url.replace(/(.*)\/[^\/]*$/, '$1/'));
            });
            $($('iframe')[0].contentDocument).on('mouseenter', '*', function() {
                if (!select_mode)
                    return;
                var obj = $(this);
                obj.addClass('kit_select').parents().removeClass('kit_select');
                hov_function(obj);
            }).on("mouseleave", '*', function() {
                if (!select_mode)
                    return;
                $(this).removeClass('kit_select');
            }).on("click", '*', function(e) {
                e.preventDefault();
                if (!select_mode)
                    return;
                sel_function($(this));
            });
            $('input[name=item_btn]').on('click', function() {
                select_mode = true;
                var ifr = $($('iframe')[0].contentDocument);
                var inp = $('input[name=item]');
                hov_function = function(obj) {
                    inp.val(obj_in_path(obj, ifr).replace(/(.*)>tr.*$/, '$1>tr'));
                    inp.removeClass('error');
                }
                sel_function = function(obj) {
                    select_mode = false;
                    ifr.find('.kit_select').removeClass('kit_select');
                    inp.val(obj_in_path(obj, ifr).replace(/(.*)>tr.*$/, '$1>tr'));
                    inp.removeClass('error');
                }
            });
            $('input[name=item]').on('keyup', function() {
                var ifr = $($('iframe')[0].contentDocument);
                if (ifr.find($(this).val()).length == 0) {
                    $(this).addClass('error');
                } else {
                    $(this).removeClass('error');
                }
            });

            var keyup_text = function(inp, out) {
                var ifr = $($('iframe')[0].contentDocument);
                var path = $('input[name=item]').val() + '>' + inp.val();
                try {
                    var obj = ifr.find(path);
                    if (obj.length == 0) {
                        inp.addClass('error');
                    } else {
                        inp.removeClass('error');
                        $('input[name=' + out + ']').val(obj.eq(0).text());
                    }
                } catch (e) {
                    inp.addClass('error');
                }
            };
            var keyup_link = function(inp, out) {
                var ifr = $($('iframe')[0].contentDocument);
                var path = $('input[name=item]').val() + '>' + inp.val();
                try {
                    var obj = ifr.find(path);
                    if (obj.length == 0) {
                        inp.addClass('error');
                    } else {
                        inp.removeClass('error');
                        $('input[name=' + out + ']').val(obj.eq(0).attr('href'));
                    }
                } catch (e) {
                    inp.addClass('error');
                }
            };

            var keyup_num = function(inp, out) {
                var ifr = $($('iframe')[0].contentDocument);
                var path = $('input[name=item]').val() + '>' + inp.val();
                try {
                    var obj = ifr.find(path);
                    if (obj.length == 0) {
                        inp.addClass('error');
                    } else {
                        inp.removeClass('error');
                        var val = obj.eq(0).text();
                        $('input[name=' + out + ']').val(val);
                        if (!isNumber(val)) {
                            inp.addClass('error');
                        } else {
                            inp.removeClass('error');
                        }
                    }
                    if (out == 'add_time_text') {
                        $('input[name=original_time]').val(val);
                        $('input[name=converted_time]').val(val);
                    }
                    if (out == 'torrent_size_text') {
                        $('input[name=original_size]').val(val);
                    }
                } catch (e) {
                    inp.addClass('error');
                }
            }
            var click_text = function(opath, otext) {
                select_mode = true;
                var tr = $('input[name=item]').val() + '>';
                var ifr = $($('iframe')[0].contentDocument);
                var inp = $('input[name=' + opath + ']');
                var txt = $('input[name=' + otext + ']');
                hov_function = function(obj) {
                    var o_path = obj_in_path(obj, ifr);
                    var path = o_path.replace(tr, '');
                    if (o_path.length == path.length)
                        return;
                    inp.val(path);
                    txt.val(obj.text());
                    inp.removeClass('error');
                }
                sel_function = function(obj) {
                    select_mode = false;
                    ifr.find('.kit_select').removeClass('kit_select');
                    var o_path = obj_in_path(obj, ifr);
                    var path = o_path.replace(tr, '');
                    if (o_path.length == path.length)
                        return;
                    inp.val(path);
                    txt.val(obj.text());
                    inp.removeClass('error');
                }
            }
            var click_link = function(opath, otext) {
                select_mode = true;
                var tr = $('input[name=item]').val() + '>';
                var ifr = $($('iframe')[0].contentDocument);
                var inp = $('input[name=' + opath + ']');
                var txt = $('input[name=' + otext + ']');
                hov_function = function(obj) {
                    var o_path = obj_in_path(obj, ifr);
                    var path = o_path.replace(tr, '');
                    if (o_path.length == path.length)
                        return;
                    inp.val(path);
                    txt.val(obj.attr('href'));
                    inp.removeClass('error');
                }
                sel_function = function(obj) {
                    select_mode = false;
                    ifr.find('.kit_select').removeClass('kit_select');
                    var o_path = obj_in_path(obj, ifr);
                    var path = o_path.replace(tr, '');
                    if (o_path.length == path.length)
                        return;
                    inp.val(path);
                    txt.val(obj.attr('href'));
                    inp.removeClass('error');
                }
            }
            var click_num = function(opath, otext) {
                select_mode = true;
                var tr = $('input[name=item]').val() + '>';
                var ifr = $($('iframe')[0].contentDocument);
                var inp = $('input[name=' + opath + ']');
                var txt = $('input[name=' + otext + ']');
                hov_function = function(obj) {
                    var o_path = obj_in_path(obj, ifr);
                    var path = o_path.replace(tr, '');
                    if (o_path.length == path.length)
                        return;
                    inp.val(path);
                    inp.removeClass('error');
                    var val = obj.text();
                    txt.val(val);
                    if (!isNumber(val)) {
                        txt.addClass('error');
                    } else {
                        txt.removeClass('error');
                    }
                }
                sel_function = function(obj) {
                    select_mode = false;
                    ifr.find('.kit_select').removeClass('kit_select');
                    var o_path = obj_in_path(obj, ifr);
                    var path = o_path.replace(tr, '');
                    if (o_path.length == path.length)
                        return;
                    inp.val(path);
                    inp.removeClass('error');
                    var val = obj.text();
                    txt.val(val);
                    if (!isNumber(val)) {
                        txt.addClass('error');
                    } else {
                        txt.removeClass('error');
                    }
                    if (otext == 'add_time_text') {
                        $('input[name=original_time]').val(val);
                        $('input[name=converted_time]').val(val);
                    }
                    if (otext == 'torrent_size_text') {
                        $('input[name=original_size]').val(val);
                    }
                }
            }
            //category
            $('input[name=category_name_btn]').on('click', function() {
                click_text('category_name', 'category_name_text')
            });
            $('input[name=category_name]').on('keyup', function() {
                keyup_text($(this), 'category_name_text');
            });
            $('input[name=category_link_btn]').on('click', function() {
                click_link('category_link', 'category_link_href');
            });
            $('input[name=category_link]').on('keyup', function() {
                keyup_link($(this), 'category_link_href');
            });
            //<
            //torrent name
            $('input[name=torrent_name_btn]').on('click', function() {
                click_text('torrent_name', 'torrent_name_text')
            });
            $('input[name=torrent_name]').on('keyup', function() {
                keyup_text($(this), 'torrent_name_text');
            });
            $('input[name=torrent_link_btn]').on('click', function() {
                click_link('torrent_link', 'torrent_link_href');
            });
            $('input[name=torrent_link]').on('keyup', function() {
                keyup_link($(this), 'torrent_link_href');
            });
            //<
            //torrent size
            $('input[name=torrent_size_btn]').on('click', function() {
                click_num('torrent_size', 'torrent_size_text')
            });
            $('input[name=torrent_size]').on('keyup', function() {
                keyup_num($(this), 'torrent_size_text');
            });
            //<
            //torrent dl link
            $('input[name=torrent_dl_link_btn]').on('click', function() {
                click_link('torrent_dl_link', 'torrent_dl_link_href');
            });
            $('input[name=torrent_dl_link]').on('keyup', function() {
                keyup_link($(this), 'torrent_dl_link_href');
            });
            //<
            //seed
            $('input[name=seed_count_btn]').on('click', function() {
                click_num('seed_count', 'seed_count_text')
            });
            $('input[name=seed_count]').on('keyup', function() {
                keyup_num($(this), 'seed_count_text');
            });
            //<
            //peer
            $('input[name=peer_count_btn]').on('click', function() {
                click_num('peer_count', 'peer_count_text');
            });
            $('input[name=peer_count]').on('keyup', function() {
                keyup_num($(this), 'peer_count_text');
            });
            //<
            //time
            $('input[name=add_time_btn]').on('click', function() {
                click_num('add_time', 'add_time_text');
            });
            $('input[name=add_time]').on('keyup', function() {
                keyup_num($(this), 'add_time_text');
            });
            //<
            var filter_date = function() {
                var reg_v = $('input[name=time_regexp]').val();
                var mtime = $('input[name=original_time]').val();
                var onrepl = $('input[name=time_regexp_repl]').val();
                var repl_m = $('input[name=month_replace]').prop('checked');
                var f_v = $('select[name=mount_replace_short]').val();
                if (reg_v.length > 0) {
                    mtime = mtime.replace(new RegExp(reg_v, "ig"), onrepl)
                }
                if (repl_m) {
                    mtime = month_replace(mtime);
                }
                if (f_v != -1) {
                    mtime = format_date(f_v, mtime);
                }
                $('input[name=converted_time]').val(mtime);
                $('input[name=result_time]').val((new Date(mtime * 1000)));
            }
            $('input[name=time_regexp]').on('keyup', function() {
                filter_date();
            });
            $('input[name=time_regexp_repl]').on('keyup', function() {
                filter_date();
            });
            var formats = format_date();
            var f_sel = $('select[name=mount_replace_short]');
            var f_l = formats.length;
            f_sel.append('<option value="-1">-</option>')
            for (var n = 0; n < f_l; n++) {
                f_sel.append('<option value="' + n + '">' + formats[n] + '</option>')
            }
            f_sel.on('change', function() {
                filter_date();
            });
            $('input[name=month_replace]').on('change', function() {
                filter_date();
            });
            $('input[name=convert_size]').on('change', function() {
                var size = $('input[name=original_size]').val();
                if ($(this).prop('checked')) {
                    size = format_size(size);
                }
                $('input[name=converted_size]').val(size);
                $('input[name=result_size]').val(bytesToSize(size));
            });
            $('input[name=status]').prop('checked', 'checked');
            $('input[name=make_code]').on('click', function() {
                make_code();
            })
        }
    }
}();
$(function() {
    magic.begin();
});
$(window).on('resize', function() {
    $('iframe.web').css('height', $(window).height() - $('div.tools').height() - 4 + 'px');
});
jQuery.fn.getPath = function(ifr) {
    var no_class = ['td', 'tr', 'tbody']
    var no_eq = ['tr']
    if (this.length != 1)
        throw 'Requires one element.';
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
        if (!name || name == '#document')
            break;
        name = name.toLowerCase();
        var tag = name;
        if (realNode.id) {
            if (ifr) {
                if (ifr.find(name + '#' + realNode.id).length == 1) {
                    return name + '#' + realNode.id + (path ? '>' + path : '');
                } else {
                    name += '#' + realNode.id;
                }
            } else {
                return name + '#' + realNode.id + (path ? '>' + path : '');
            }
        } else if (realNode.className && $.inArray(tag, no_class) == -1) {
            name += '.' + realNode.className.split(/\s+/).join('.');
        }

        var parent = node.parent();
        var siblings_no_class = parent.children(tag);
        try {
            var siblings = parent.children(name);
        } catch (e) {
            var siblings = siblings_no_class;
            name = tag;
        }
        if (siblings_no_class.length == 1) {
            name = tag;
        } else {
            if (siblings.length > 1 && $.inArray(tag, no_eq) == -1) {
                name += ':eq(' + siblings.index(node) + ')';
            }
        }
        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
};