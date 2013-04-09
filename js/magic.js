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
    var obj_in_path = function(obj, ifr) {
        var path = obj.getPath(ifr);
        return path;
    }
    var format_date = function(f, t) {
        if (f == '2013-04-31[ 07[:03[:27]]]') {
            var dd = t.replace(/[^0-9]/g,' ').replace(/\s+/g,' ').split(' ');
            for (var i = 0; i < 6; i++) {
                if (dd[i] == null) {
                    dd[i] = 0;
                }
            }
            return Math.round((new Date(parseInt(dd[0]), parseInt(dd[1]) - 1, parseInt(dd[2]), parseInt(dd[3]), parseInt(dd[4]), parseInt(dd[5]))).getTime() / 1000);
        }
        if (f == '31-04-2013 [ 07[:03[:27]]]') {
            var dd = t.replace(/[^0-9]/g,' ').replace(/\s+/g,' ').split(' ');
            for (var i = 0; i < 6; i++) {
                if (dd[i] == null) {
                    dd[i] = 0;
                }
            }
            return Math.round((new Date(parseInt(dd[2]), parseInt(dd[1]) - 1, parseInt(dd[0]), parseInt(dd[3]), parseInt(dd[4]), parseInt(dd[5]))).getTime() / 1000);
        }
        if (f == 'n day ago') {
            var old = parseFloat(t.replace(/[^0-9.]/g,'')) * 24 * 60 * 60;
            return Math.round((new Date()).getTime() / 1000) - old;
        }
    }
    function month_replace(i) {
        return t.replace(/января/i, '1').replace(/февраля/i, '2').replace(/марта/i, '3')
                .replace(/апреля/i, '4').replace(/мая/i, '5').replace(/июня/i, '6')
                .replace(/июля/i, '7').replace(/августа/i, '8').replace(/сентября/i, '9')
                .replace(/октября/i, '10').replace(/ноября/i, '11').replace(/декабря/i, '12')
                .replace(/January/i, '1').replace(/February/i, '2').replace(/March/i, '3')
                .replace(/April/i, '4').replace(/May/i, '5').replace(/June/i, '6')
                .replace(/July/i, '7').replace(/August/i, '8').replace(/September/i, '9')
                .replace(/October/i, '10').replace(/November/i, '11').replace(/December/i, '12');
    }
    function month_replace_short(i) {
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
                var url = $(this).parents().eq(1).find('input[name=url]').val();
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
            $('input[name=time_regexp]').on('keyup', function() {
                var val = $(this).val();
                var mtime = $('input[name=original_time]').val();
                var onrepl = $('input[name=time_regexp_repl]').val();
                $('input[name=converted_time]').val(mtime.replace(new RegExp(val, "ig"), onrepl));
            });
            $('input[name=time_regexp_repl]').on('keyup', function() {
                $('input[name=time_regexp]').trigger('keyup');
            });
            
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