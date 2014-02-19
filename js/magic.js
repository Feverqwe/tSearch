var magic = function() {
    var dom_cache = {};
    var var_cache = {};
    var pageDOM = null;
    var select_mode = false;
    var sel_function = function(i) {
    };
    var hov_function = function(i) {
    };
    var xhr = undefined;
    var contentFilter = function(c) {
        return c.replace(/display[: ]*none/img, '#blockdisp#').replace(/ src=(['"]{0,1})/img, ' src=$1#blockrurl#');
    };
    var open_page = function(url) {
        if (url.length === 0) {
            return;
        }
        if (xhr !== undefined) {
            xhr.abort();
        }
        var post_r = dom_cache.post.val();
        var search = dom_cache.search_text.val();
        if (dom_cache.cp1251encode.prop('checked')) {
            search = encode(search);
        }
        url = url.replace('%search%', search);
        post_r = post_r.replace('%search%', search);
        var obj_req = {
            type: 'GET',
            url: url,
            success: function(data) {
                pageDOM = $($.parseHTML(data));
                dom_cache.iframe[0].contentDocument.all[0].innerHTML = contentFilter(data) + '<style>.kit_select {color:#000 !important;background-color:#FFCC33 !important; cursor:pointer;} td.kit_select { border: 1px dashed red !important; }</style>';
            }
        };
        if (post_r.length > 0) {
            obj_req.type = 'POST';
            obj_req['data'] = post_r;
        }
        xhr = $.ajax(obj_req);
    };
    var empty_all = function() {
        dom_cache.page_convert.find('input[type=text]').removeClass('error').val('');
        dom_cache.page_convert.find('input[type=checkbox]').prop('checked', 0);
        dom_cache.date_format.children('option[value=-1]').prop('selected', 1);
        dom_cache.page_selectors.find('input[type=text]').removeClass('error').val('');
        dom_cache.page_selectors.find('input[type=checkbox]').prop('checked', 0);
        dom_cache.page_auth.find('input[type=text]').removeClass('error').val('');
        dom_cache.page_auth.find('input[type=checkbox]').prop('checked', 0);
        dom_cache.page_search.find('input[type=text]').removeClass('error').val('');
        dom_cache.page_search.find('input[type=checkbox]').prop('checked', 0);
        dom_cache.page_selectors.find('input[type=number]').val(0);
        dom_cache.page_desk.find('input[type=text]').val('');
        dom_cache.page_desk.find('input[type=checkbox]').prop('checked', 0);
    };
    var load_code = function() {
        empty_all();
        var code = null;
        try {
            code = JSON.parse(dom_cache.code.val());
        } catch (e) {
            alert(_lang.magic[1] + "\n" + e);
        }
        if (!code)
            return;
        if (code.cat_name !== undefined) {
            dom_cache.category_name.val(code['cat_name']);
            dom_cache.category_name.parents().eq(1).find('input[name=status]').prop('checked', 1);
            if (code.cat_alt !== undefined) {
                dom_cache.category_attr.prop('checked', 1);
                dom_cache.category_attr_value.val('alt');
            }
            if (code.cat_attr !== undefined) {
                dom_cache.category_attr.prop('checked', 1);
                dom_cache.category_attr_value.val(code['cat_attr']);
            }
        }
        if (code.cat_link !== undefined) {
            dom_cache.category_link.val(code['cat_link']);
            if (code.cat_link_r !== undefined) {
                dom_cache.category_link_base_path.prop('checked', code['cat_link_r']);
            }
            dom_cache.category_link.parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if (code.root_url !== undefined) {
            dom_cache.base_path.val(code['root_url']);
        }
        if (code.search_path !== undefined) {
            dom_cache.search_url.val(code['search_path']);
        }
        if (code.encode !== undefined) {
            dom_cache.cp1251encode.prop('checked', code['encode']);
        }
        if (code.post !== undefined) {
            dom_cache.post.val(code['post']);
        }
        if (code.items !== undefined) {
            dom_cache.item.val(code['items']);
        }
        if (code.tr_name !== undefined) {
            dom_cache.torrent_name.val(code['tr_name']);
        }
        if (code.tr_link !== undefined) {
            dom_cache.torrent_link.val(code['tr_link']);
        }
        if (code.tr_link_r !== undefined) {
            dom_cache.torrent_link_base_path.prop('checked', code['tr_link_r']);
        }
        if (code.tr_size !== undefined) {
            dom_cache.torrent_size.val(code['tr_size']);
            if (code.s_c !== undefined) {
                dom_cache.convert_size.prop('checked', code['s_c']);
            }
            dom_cache.torrent_size.parents().eq(1).find('input[name=status]').prop('checked', 1);
            if (code.size_r !== undefined) {
                dom_cache.size_regexp.val(code['size_r']);
                dom_cache.size_regexp_repl.val(code['size_rp']);
            }
            if (code.size_attr !== undefined) {
                dom_cache.size_attr.prop('checked', 1);
                dom_cache.size_attr_value.val(code['size_attr']);
            }
        }
        if (code.tr_dl !== undefined) {
            dom_cache.torrent_dl_link.val(code['tr_dl']);
            if (code.tr_dl_r !== undefined) {
                dom_cache.torrent_dl_link_base_path.prop('checked', code['tr_dl_r']);
            }
            dom_cache.torrent_dl_link.parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if (code.seed !== undefined) {
            dom_cache.seed_count.val(code['seed']);
            dom_cache.seed_count.parents().eq(1).find('input[name=status]').prop('checked', 1);
            if (code.seed_r !== undefined) {
                dom_cache.seed_regexp.val(code['seed_r']);
                dom_cache.seed_regexp_repl.val(code['seed_rp']);
            }
        }
        if (code.peer !== undefined) {
            dom_cache.peer_count.val(code['peer']);
            dom_cache.peer_count.parents().eq(1).find('input[name=status]').prop('checked', 1);
            if (code.peer_r !== undefined) {
                dom_cache.peer_regexp.val(code['peer_r']);
                dom_cache.peer_regexp_repl.val(code['peer_rp']);
            }
        }
        if (code.date !== undefined) {
            dom_cache.add_time.val(code['date']);
            if (code.t_r !== undefined) {
                dom_cache.time_regexp.val(code['t_r']);
                dom_cache.time_regexp_repl.val(code['t_r_r']);
            }
            if (code.t_t_r !== undefined) {
                dom_cache.today_replace.prop('checked', code['t_t_r']);
            }
            if (code.t_m_r !== undefined) {
                dom_cache.month_replace.prop('checked', code['t_m_r']);
            }
            if (code.t_f !== undefined) {
                $('select[name=date_format] option[value=' + code['t_f'] + ']').prop('selected', 1);
            }
            if (code.date_attr !== undefined) {
                dom_cache.time_attr.prop('checked', 1);
                dom_cache.time_attr_value.val(code['date_attr']);
            }
            dom_cache.add_time.parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if (code.sf !== undefined) {
            dom_cache.skip_first.val(code['sf']);
        }
        if (code.sl !== undefined) {
            dom_cache.skip_last.val(code['sl']);
        }
        if (code.auth !== undefined) {
            dom_cache.auth_url.val(code['auth']);
        }
        if (code.auth_f !== undefined) {
            dom_cache.auth_form.val(code['auth_f']);
        }
        if (code.icon !== undefined) {
            dom_cache.icon.val(code['icon']);
        }
        if (code.name !== undefined) {
            dom_cache.tr_name.val(code['name']);
        }
        if (code.about !== undefined) {
            dom_cache.desk.val(code['about']);
        }
        if (code.flags !== undefined) {
            dom_cache.need_auth.prop('checked', code['flags'].a);
            dom_cache.rus.prop('checked', code['flags'].l);
            if (code['flags'].rs) {
                dom_cache.cirilic.prop('checked', 1);
            } else {
                dom_cache.cirilic.prop('checked', 0);
            }

        }
    };
    var make_code = function() {
        var code = {
            'version': 1,
            'type': 'kit',
            'name': dom_cache.tr_name.val(),
            'icon': dom_cache.icon.val(),
            'about': dom_cache.desk.val(),
            'root_url': dom_cache.base_path.val(),
            'search_path': dom_cache.search_url.val(),
            'items': dom_cache.item.val(),
            'tr_name': dom_cache.torrent_name.val(),
            'tr_link': dom_cache.torrent_link.val(),
            'flags': {
                a: (dom_cache.need_auth.prop('checked')) ? 1 : 0,
                l: (dom_cache.rus.prop('checked')) ? 1 : 0,
                rs: (dom_cache.cirilic.prop('checked')) ? 1 : 0
            }
        };
        if (typeof (code.icon) !== 'string' || code.icon.length === 0) {
            code.icon = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
        }
        if (dom_cache.post.val().length > 0) {
            code['post'] = dom_cache.post.val();
        }
        if (dom_cache.cp1251encode.prop('checked')) {
            code['encode'] = 1;
        }
        if (dom_cache.category_name.parents().eq(1).find('input[name=status]').prop('checked')) {
            code['cat_name'] = dom_cache.category_name.val();
            if (dom_cache.category_attr.prop('checked')) {
                code['cat_attr'] = dom_cache.category_attr_value.val();
            }
        }
        if (dom_cache.category_link.parents().eq(1).find('input[name=status]').prop('checked')) {
            code['cat_link'] = dom_cache.category_link.val();
            if (dom_cache.category_link_base_path.prop('checked')) {
                code['cat_link_r'] = 1;
            }
        }
        if (dom_cache.torrent_link_base_path.prop('checked')) {
            code['tr_link_r'] = 1;
        }
        if (dom_cache.torrent_size.parents().eq(1).find('input[name=status]').prop('checked')) {
            code['tr_size'] = dom_cache.torrent_size.val();
            if (dom_cache.convert_size.prop('checked')) {
                code['s_c'] = 1;
            }
            if (dom_cache.size_regexp.val().length > 0) {
                code['size_r'] = dom_cache.size_regexp.val();
                code['size_rp'] = dom_cache.size_regexp_repl.val();
            }
            if (dom_cache.size_attr.prop('checked')) {
                code['size_attr'] = dom_cache.size_attr_value.val();
            }
        }
        if (dom_cache.torrent_dl_link.parents().eq(1).find('input[name=status]').prop('checked')) {
            code['tr_dl'] = dom_cache.torrent_dl_link.val();
            if (dom_cache.torrent_dl_link_base_path.prop('checked')) {
                code['tr_dl_r'] = 1;
            }
        }
        if (dom_cache.seed_count.parents().eq(1).find('input[name=status]').prop('checked')) {
            code['seed'] = dom_cache.seed_count.val();
            if (dom_cache.seed_regexp.val().length > 0) {
                code['seed_r'] = dom_cache.seed_regexp.val();
                code['seed_rp'] = dom_cache.seed_regexp_repl.val();
            }
        }
        if (dom_cache.peer_count.parents().eq(1).find('input[name=status]').prop('checked')) {
            code['peer'] = dom_cache.peer_count.val();
            if (dom_cache.peer_regexp.val().length > 0) {
                code['peer_r'] = dom_cache.peer_regexp.val();
                code['peer_rp'] = dom_cache.peer_regexp_repl.val();
            }
        }
        if (dom_cache.add_time.parents().eq(1).find('input[name=status]').prop('checked')) {
            code['date'] = dom_cache.add_time.val();
            if (dom_cache.time_attr.prop('checked')) {
                code['date_attr'] = dom_cache.time_attr_value.val();
            }
            if (dom_cache.time_regexp.val().length > 0) {
                code['t_r'] = dom_cache.time_regexp.val();
                code['t_r_r'] = dom_cache.time_regexp_repl.val();
            }
            if (dom_cache.today_replace.prop('checked')) {
                code['t_t_r'] = 1;
            }
            if (dom_cache.month_replace.prop('checked')) {
                code['t_m_r'] = 1;
            }
            if (dom_cache.date_format.val() !== '-1') {
                code['t_f'] = dom_cache.date_format.val();
            }
        }
        if (dom_cache.skip_first.val() > 0) {
            code['sf'] = dom_cache.skip_first.val();
        }
        if (dom_cache.skip_last.val() > 0) {
            code['sl'] = dom_cache.skip_last.val();
        }
        if (dom_cache.auth_url.val().length > 0) {
            code['auth'] = dom_cache.auth_url.val();
        }
        if (dom_cache.auth_form.val().length > 0) {
            code['auth_f'] = dom_cache.auth_form.val();
        }
        code['uid'] = hashCode(JSON.stringify(code));
        dom_cache.code.val(JSON.stringify(code));
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
    var obj_in_path = function(obj, ifr) {
        var path = obj.getPath(ifr);
        dom_cache.status_bar.text(path);
        return path;
    };
    var bytesToSize = function(bytes, nan) {
        var sizes = _lang['size_list'];
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
            else if (Ucode === 1025) {
                Acode = 168;
                ExitValue = "%" + Acode.toString(16);
            }
            else if (Ucode === 1105) {
                Acode = 184;
                ExitValue = "%" + Acode.toString(16);
            }
            else if (Ucode === 32) {
                Acode = 32;
                ExitValue = "%" + Acode.toString(16);
            }
            else if (Ucode === 10) {
                Acode = 10;
                ExitValue = "%0A";
            }
            else {
                ExitValue = s;
            }
            text = text + ExitValue;
        }
        return text;
    };
    var filter_date = function() {
        var reg_v = dom_cache.time_regexp.val();
        var mtime = dom_cache.original_time.val();
        var onrepl = dom_cache.time_regexp_repl.val();
        var repl_t = dom_cache.today_replace.prop('checked');
        var repl_m = dom_cache.month_replace.prop('checked');
        var f_v = dom_cache.date_format.val();
        if (reg_v.length > 0) {
            mtime = mtime.replace(new RegExp(reg_v, "ig"), onrepl);
        }
        if (repl_t) {
            mtime = ex_kit.today_replace(mtime, f_v);
        }
        if (repl_m) {
            mtime = ex_kit.month_replace(mtime);
        }
        if (f_v !== "-1") {
            mtime = ex_kit.format_date(f_v, mtime);
        }
        dom_cache.converted_time.val(mtime);
        dom_cache.result_time.val((new Date(mtime * 1000)));
    };
    var filter_size = function() {
        var size = dom_cache.original_size.val();
        var reg_v = dom_cache.size_regexp.val();
        var onrepl = dom_cache.size_regexp_repl.val();
        if (reg_v.length > 0) {
            size = size.replace(new RegExp(reg_v, "ig"), onrepl);
        }
        if (dom_cache.convert_size.prop('checked')) {
            size = ex_kit.format_size(size);
        }
        dom_cache.converted_size.val(size);
        dom_cache.result_size.val(bytesToSize(size));
    };
    var filter_seed = function() {
        var reg_v = dom_cache.seed_regexp.val();
        var ostr = dom_cache.original_seed.val();
        var onrepl = dom_cache.seed_regexp_repl.val();
        if (reg_v.length > 0) {
            ostr = ostr.replace(new RegExp(reg_v, "ig"), onrepl);
        }
        dom_cache.converted_seed.val(ostr);
        dom_cache.result_seed.val(ostr);
    };
    var filter_peer = function() {
        var reg_v = dom_cache.peer_regexp.val();
        var ostr = dom_cache.original_peer.val();
        var onrepl = dom_cache.peer_regexp_repl.val();
        if (reg_v.length > 0) {
            ostr = ostr.replace(new RegExp(reg_v, "ig"), onrepl);
        }
        dom_cache.converted_peer.val(ostr);
        dom_cache.result_peer.val(ostr);
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
            dom_cache.menu = $('ul.menu');
            dom_cache.body = $('body');
            dom_cache.dev_tools = $('div.tools');
            dom_cache.status_bar = $('div.status_bar');
            dom_cache.iframe = $('iframe');
            dom_cache.input_open = $('input[name=open]');
            dom_cache.search_url = $('input[name=search_url]');
            dom_cache.base_path = $('input[name=base_path]');
            dom_cache.open_auth = $('input[name=open_auth]');
            dom_cache.auth_url = $('input[name=auth_url]');
            dom_cache.post = $('input[name=post]');
            dom_cache.item_btn = $('input[name=item_btn]');
            dom_cache.item = $('input[name=item]');
            dom_cache.tr_strip = $('input[name=tr_strip]');
            dom_cache.auth_form_btn = $('input[name=auth_form_btn]');
            dom_cache.auth_form = $('input[name=auth_form]');
            dom_cache.skip_first = $('input[name=skip_first]');
            dom_cache.size_attr = $('input[name=size_attr]');
            dom_cache.size_attr_value = $('input[name=size_attr_value]');
            dom_cache.time_attr = $('input[name=time_attr]');
            dom_cache.time_attr_value = $('input[name=time_attr_value]');
            dom_cache.category_attr = $('input[name=category_attr]');
            dom_cache.category_attr_value = $('input[name=category_attr_value]');
            dom_cache.original_peer = $('input[name=original_peer]');
            dom_cache.original_seed = $('input[name=original_seed]');
            dom_cache.original_time = $('input[name=original_time]');
            dom_cache.original_size = $('input[name=original_size]');
            dom_cache.category_name_btn = $('input[name=category_name_btn]');
            dom_cache.category_name = $('input[name=category_name]');
            dom_cache.category_link_btn = $('input[name=category_link_btn]');
            dom_cache.category_link = $('input[name=category_link]');
            dom_cache.torrent_name_btn = $('input[name=torrent_name_btn]');
            dom_cache.torrent_name = $('input[name=torrent_name]');
            dom_cache.torrent_link_btn = $('input[name=torrent_link_btn]');
            dom_cache.torrent_link = $('input[name=torrent_link]');
            dom_cache.torrent_size_btn = $('input[name=torrent_size_btn]');
            dom_cache.torrent_size = $('input[name=torrent_size]');
            dom_cache.torrent_dl_link_btn = $('input[name=torrent_dl_link_btn]');
            dom_cache.torrent_dl_link = $('input[name=torrent_dl_link]');
            dom_cache.seed_count_btn = $('input[name=seed_count_btn]');
            dom_cache.seed_count = $('input[name=seed_count]');
            dom_cache.peer_count_btn = $('input[name=peer_count_btn]');
            dom_cache.peer_count = $('input[name=peer_count]');
            dom_cache.add_time_btn = $('input[name=add_time_btn]');
            dom_cache.add_time = $('input[name=add_time]');
            dom_cache.time_regexp = $('input[name=time_regexp]');
            dom_cache.time_regexp_repl = $('input[name=time_regexp_repl]');
            dom_cache.date_format = $('select[name=date_format]');
            dom_cache.today_replace = $('input[name=today_replace]');
            dom_cache.month_replace = $('input[name=month_replace]');
            dom_cache.convert_size = $('input[name=convert_size]');
            dom_cache.make_code = $('input[name=make_code]');
            dom_cache.load_code = $('input[name=load_code]');
            dom_cache.seed_regexp = $('input[name=seed_regexp]');
            dom_cache.seed_regexp_repl = $('input[name=seed_regexp_repl]');
            dom_cache.peer_regexp = $('input[name=peer_regexp]');
            dom_cache.peer_regexp_repl = $('input[name=peer_regexp_repl]');
            dom_cache.size_regexp = $('input[name=size_regexp]');
            dom_cache.size_regexp_repl = $('input[name=size_regexp_repl]');
            dom_cache.search_text = $('input[name=search_text]');
            dom_cache.cp1251encode = $('input[name=cp1251encode]');
            dom_cache.page_convert = $('div.page.convert');
            dom_cache.page_selectors = $('div.page.selectors');
            dom_cache.page_auth = $('div.page.auth');
            dom_cache.page_search = $('div.page.search');
            dom_cache.page_desk = $('div.page.desk');
            dom_cache.code = $('textarea[name=code]');
            dom_cache.category_link_base_path = $('input[name=category_link_base_path]');
            dom_cache.torrent_link_base_path = $('input[name=torrent_link_base_path]');
            dom_cache.torrent_dl_link_base_path = $('input[name=torrent_dl_link_base_path]');
            dom_cache.skip_last = $('input[name=skip_last]');
            dom_cache.icon = $('input[name=icon]');
            dom_cache.tr_name = $('input[name=tr_name]');
            dom_cache.desk = $('input[name=desk]');
            dom_cache.need_auth = $('input[name=need_auth]');
            dom_cache.rus = $('input[name=rus]');
            dom_cache.cirilic = $('input[name=cirilic]');
            dom_cache.converted_time = $('input[name=converted_time]');
            dom_cache.result_time = $('input[name=result_time]');
            dom_cache.converted_size = $('input[name=converted_size]');
            dom_cache.result_size = $('input[name=result_size]');
            dom_cache.converted_seed = $('input[name=converted_seed]');
            dom_cache.result_seed = $('input[name=result_seed]');
            dom_cache.converted_peer = $('input[name=converted_peer]');
            dom_cache.result_peer = $('input[name=result_peer]');

            dom_cache.iframe.css('height', dom_cache.window.height() - dom_cache.dev_tools.height() - 4 - dom_cache.status_bar.height() + 'px');
            dom_cache.input_open.on('click', function() {
                var url = dom_cache.search_url.val();
                open_page(url);
                dom_cache.base_path.val(url.replace(/(.*)\/[^\/]*$/, '$1/'));
            });
            dom_cache.open_auth.on('click', function() {
                var url = dom_cache.auth_url.val();
                open_page(url);
            });
            $(dom_cache.iframe[0].contentDocument).on('mouseenter', '*', function() {
                if (!select_mode)
                    return;
                var obj = $(this);
                obj.addClass('kit_select').parents().removeClass('kit_select');
                hov_function(obj);
            }).on("mouseleave", '*', function() {
                if (!select_mode) {
                    return;
                }
                $(this).removeClass('kit_select');
            }).on("click", '*', function(e) {
                e.preventDefault();
                if (!select_mode) {
                    return;
                }
                sel_function($(this));
            });
            dom_cache.item_btn.on('click', function() {
                select_mode = true;
                var ifr = $(dom_cache.iframe[0].contentDocument);
                var inp = dom_cache.item;
                inp.removeClass('error');
                var strip_tr = dom_cache.tr_strip.prop('checked');
                hov_function = function(obj) {
                    if (strip_tr) {
                        inp.val(obj_in_path(obj, ifr).replace(/(.*)>tr.*$/, '$1>tr'));
                    } else {
                        inp.val(obj_in_path(obj, ifr));
                    }
                };
                sel_function = function(obj) {
                    select_mode = false;
                    ifr.find('.kit_select').removeClass('kit_select');
                };
            });
            dom_cache.item.on('keyup', function() {
                var ifr = $(dom_cache.iframe[0].contentDocument);
                if (ifr.find($(this).val()).length === 0) {
                    $(this).addClass('error');
                } else {
                    $(this).removeClass('error');
                }
            });
            //auth form
            dom_cache.auth_form_btn.on('click', function() {
                select_mode = true;
                var ifr = $(dom_cache.iframe[0].contentDocument);
                var inp = dom_cache.auth_form;
                inp.removeClass('error');
                hov_function = function(obj) {
                    inp.val(obj_in_path(obj, ifr));
                };
                sel_function = function(obj) {
                    select_mode = false;
                    ifr.find('.kit_select').removeClass('kit_select');
                };
            });
            dom_cache.auth_form.on('keyup', function() {
                var ifr = $(dom_cache.iframe[0].contentDocument);
                if (ifr.find($(this).val()).length === 0) {
                    $(this).addClass('error');
                } else {
                    $(this).removeClass('error');
                }
            });
            //<

            var keyup_text = function(inp, out, t) {
                var txt = $('input[name=' + out + ']');
                var path = dom_cache.item.val() + ':eq(' + dom_cache.skip_first.val() + ')' + '>' + inp.val();
                try {
                    var obj = pageDOM.find(path);
                    var val = '';
                    if (obj.length === 0) {
                        inp.addClass('error');
                    } else {
                        inp.removeClass('error');
                        if (t === 'n') {
                            if (out === "torrent_size_text" && dom_cache.size_attr.prop('checked')) {
                                val = obj.eq(0).attr(dom_cache.size_attr_value.val());
                            } else
                            if (out === "add_time_text" && dom_cache.time_attr.prop('checked')) {
                                val = obj.eq(0).attr(dom_cache.time_attr_value.val());
                            } else {
                                val = obj.eq(0).text();
                            }
                            txt.val(val);
                            if (!ex_kit.isNumber(val)) {
                                txt.addClass('error');
                            } else {
                                txt.removeClass('error');
                            }
                        } else
                        if (t === 'l') {
                            $('input[name=' + out + ']').val(obj.eq(0).attr('href'));
                        } else {
                            if (out === "category_name_text" && dom_cache.category_attr.prop('checked')) {
                                $('input[name=' + out + ']').val(obj.attr(dom_cache.category_attr_value.val()));
                            } else {
                                $('input[name=' + out + ']').val(obj.eq(0).text());
                            }
                        }
                    }
                    if (out === 'peer_count_text') {
                        dom_cache.original_peer.val(val);
                        filter_peer();
                    }
                    if (out === 'seed_count_text') {
                        dom_cache.original_seed.val(val);
                        filter_seed();
                    }
                    if (out === 'add_time_text') {
                        dom_cache.original_time.val(val);
                        filter_date();
                    }
                    if (out === 'torrent_size_text') {
                        dom_cache.original_size.val(val);
                        filter_size();
                    }
                } catch (e) {
                    inp.addClass('error');
                }
            };
            var click_text = function(inp, out, t) {
                select_mode = true;
                var tr = dom_cache.item.val();
                //+ ':eq('+$('input[name=skip_first]').val()+')'
                var ifr = $(dom_cache.iframe[0].contentDocument);
                var inpv = $('input[name=' + inp + ']');
                var txt = $('input[name=' + out + ']');
                inpv.removeClass('error');
                hov_function = function(obj) {
                    var o_path = obj_in_path(obj, ifr);
                    var path = o_path.replace(tr, '');
                    if (path.length !== o_path.length) {
                        path = path.replace(/^[^>]*>(.*)$/, '$1');
                    } else {
                        inpv.val('');
                        txt.val('');
                        return;
                    }
                    inpv.val(path);
                    if (t === 'n') {
                        var val = '';
                        if (out === "torrent_size_text" && dom_cache.size_attr.prop('checked')) {
                            val = obj.attr(dom_cache.size_attr_value.val());
                        } else
                        if (out === "add_time_text" && dom_cache.time_attr.prop('checked')) {
                            val = obj.attr(dom_cache.time_attr_value.val());
                        } else {
                            val = obj.text();
                        }
                        txt.val(val);
                        if (!ex_kit.isNumber(val)) {
                            txt.addClass('error');
                        } else {
                            txt.removeClass('error');
                        }
                    } else
                    if (t === 'l') {
                        txt.val(obj.attr('href'));
                    } else {
                        if (out === "category_name_text" && dom_cache.category_attr.prop('checked')) {
                            txt.val(obj.attr(dom_cache.category_attr_value.val()));
                        } else {
                            txt.val(obj.text());
                        }
                    }
                };
                sel_function = function(obj) {
                    select_mode = false;
                    ifr.find('.kit_select').removeClass('kit_select');
                    if (t === 'n') {
                        var val = obj.text();
                        if (out === 'peer_count_text') {
                            dom_cache.original_peer.val(val);
                            filter_peer();
                        }
                        if (out === 'seed_count_text') {
                            dom_cache.original_seed.val(val);
                            filter_seed();
                        }
                        if (out === 'add_time_text') {
                            dom_cache.original_time.val(val);
                            filter_date();
                        }
                        if (out === 'torrent_size_text') {
                            dom_cache.original_size.val(val);
                            filter_size();
                        }
                    }
                };
            };
            //category
            dom_cache.category_name_btn.on('click', function() {
                click_text('category_name', 'category_name_text');
            });
            dom_cache.category_name.on('keyup', function() {
                keyup_text($(this), 'category_name_text');
            });
            dom_cache.category_link_btn.on('click', function() {
                click_text('category_link', 'category_link_href', 'l');
            });
            dom_cache.category_link.on('keyup', function() {
                keyup_text($(this), 'category_link_href', 'l');
            });
            //<
            //torrent name
            dom_cache.torrent_name_btn.on('click', function() {
                click_text('torrent_name', 'torrent_name_text');
            });
            dom_cache.torrent_name.on('keyup', function() {
                keyup_text($(this), 'torrent_name_text');
            });
            dom_cache.torrent_link_btn.on('click', function() {
                click_text('torrent_link', 'torrent_link_href', 'l');
            });
            dom_cache.torrent_link.on('keyup', function() {
                keyup_text($(this), 'torrent_link_href', 'l');
            });
            //<
            //torrent size
            dom_cache.torrent_size_btn.on('click', function() {
                click_text('torrent_size', 'torrent_size_text', 'n');
            });
            dom_cache.torrent_size.on('keyup', function() {
                keyup_text($(this), 'torrent_size_text', 'n');
            });
            //<
            //torrent dl link
            dom_cache.torrent_dl_link_btn.on('click', function() {
                click_text('torrent_dl_link', 'torrent_dl_link_href', 'l');
            });
            dom_cache.torrent_dl_link.on('keyup', function() {
                keyup_text($(this), 'torrent_dl_link_href', 'l');
            });
            //<
            //seed
            dom_cache.seed_count_btn.on('click', function() {
                click_text('seed_count', 'seed_count_text', 'n');
            });
            dom_cache.seed_count.on('keyup', function() {
                keyup_text($(this), 'seed_count_text', 'n');
            });
            //<
            //peer
            dom_cache.peer_count_btn.on('click', function() {
                click_text('peer_count', 'peer_count_text', 'n');
            });
            dom_cache.peer_count.on('keyup', function() {
                keyup_text($(this), 'peer_count_text', 'n');
            });
            //<
            //time
           dom_cache.add_time_btn.on('click', function() {
                click_text('add_time', 'add_time_text', 'n');
            });
            dom_cache.add_time.on('keyup', function() {
                keyup_text($(this), 'add_time_text', 'n');
            });
            //<
            dom_cache.time_regexp.on('keyup', function() {
                filter_date();
            });
            dom_cache.time_regexp_repl.on('keyup', function() {
                filter_date();
            });
            var formats = ex_kit.format_date();
            var f_sel = dom_cache.date_format;
            var f_l = formats.length;
            f_sel.append($('<option>',{value: -1, text: '-'}));
            for (var n = 0; n < f_l; n++) {
                f_sel.append($('<option>',{value: n, text: formats[n]}));
            }
            f_sel.on('change', function() {
                filter_date();
            });
            dom_cache.today_replace.on('change', function() {
                filter_date();
            });
            dom_cache.month_replace.on('change', function() {
                filter_date();
            });
            dom_cache.convert_size.on('change', function() {
                filter_size();
            });
            dom_cache.make_code.on('click', function() {
                make_code();
            });
            dom_cache.menu.on('click', 'a', function(e) {
                e.preventDefault();
                dom_cache.menu.find('a.active').removeClass('active');
                $(this).addClass('active');
                dom_cache.body.find('div.page.active').removeClass('active');
                dom_cache.body.find('div.' + $(this).data('page')).addClass('active');
                dom_cache.window.trigger('resize');
            });
            dom_cache.load_code.on('click', function() {
                load_code();
            });
            dom_cache.seed_regexp.on('keyup', function() {
                filter_seed();
            });
            dom_cache.seed_regexp_repl.on('keyup', function() {
                filter_seed();
            });
            dom_cache.peer_regexp.on('keyup', function() {
                filter_peer();
            });
            dom_cache.peer_regexp_repl.on('keyup', function() {
                filter_peer();
            });
            dom_cache.size_regexp.on('keyup', function() {
                filter_size();
            });
            dom_cache.size_regexp_repl.on('keyup', function() {
                filter_size();
            });
            dom_cache.window.on('resize', function() {
                dom_cache.iframe.css('height', dom_cache.window.height() - dom_cache.dev_tools.height() - 4 - dom_cache.status_bar.height() + 'px');
            });
        }
    };
}();
$(function() {
    magic.begin();
});

$.fn.getPath = function(ifr) {
    var no_id = ['tr'];
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
        if (!name || name === '#document')
            break;
        name = name.toLowerCase();
        var tag = name;
        if (realNode.id) {
            if (ifr) {
                if ($.inArray(tag, no_id) === -1 && ifr.find(tag + '[id=' + realNode.id + ']').length === 1) {
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