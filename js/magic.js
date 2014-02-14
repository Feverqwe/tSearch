var magic = function() {
    var status_bar = null;
    var pageDOM = null;
    var select_mode = false;
    var sel_function = function(i) {
    };
    var hov_function = function(i) {
    };
    var xhr = null;
    var contentFilter = function(c) {
        return c.replace(/display[: ]*none/img, '#blockdisp#').replace(/ src=(['"]{0,1})/img, ' src=$1#blockrurl#');
    };
    var open_page = function(url) {
        if (url.length === 0)
            return;
        var iframe = $('iframe');
        if (xhr !== null)
            xhr.abort();
        var post_r = $('input[name=post]').val();
        var search = $('input[name=search_text]').val();
        if ($('input[name=cp1251encode]').prop('checked')) {
            search = encode(search);
        }
        url = url.replace('%search%', search);
        post_r = post_r.replace('%search%', search);
        var obj_req = {
            type: 'GET',
            url: url,
            success: function(data) {
                pageDOM = $($.parseHTML(data));
                iframe[0].contentDocument.all[0].innerHTML = contentFilter(data) + '<style>.kit_select {color:#000 !important;background-color:#FFCC33 !important; cursor:pointer;} td.kit_select { border: 1px dashed red !important; }</style>';
            }
        };
        if (post_r.length > 0) {
            obj_req.type = 'POST';
            obj_req['data'] = post_r;
        }
        xhr = $.ajax(obj_req);
    };
    var empty_all = function() {
        $('div.page.convert').find('input[type=text]').removeClass('error').val('');
        $('div.page.convert').find('input[type=checkbox]').prop('checked', 0);
        $('select[name=date_format] option[value=-1]').prop('selected', 1);
        $('div.page.selectors').find('input[type=text]').removeClass('error').val('');
        $('div.page.selectors').find('input[type=checkbox]').prop('checked', 0);
        $('div.page.auth').find('input[type=text]').removeClass('error').val('');
        $('div.page.auth').find('input[type=checkbox]').prop('checked', 0);
        $('div.page.search').find('input[type=text]').removeClass('error').val('');
        $('div.page.search').find('input[type=checkbox]').prop('checked', 0);
        $('div.page.selectors').find('input[type=number]').val(0);
        $('div.page.desk').find('input[type=text]').val('');
        $('div.page.desk').find('input[type=checkbox]').prop('checked', 0);
    };
    var load_code = function() {
        empty_all();
        var code = null;
        try {
            code = JSON.parse($('textarea[name=code]').val());
        } catch (e) {
            alert(_lang.magic[1] + "\n" + e);
        }
        if (!code)
            return;
        if (code.cat_name !== undefined) {
            $('input[name=category_name]').val(code['cat_name']);
            $('input[name=category_name]').parents().eq(1).find('input[name=status]').prop('checked', 1);
            if (code.cat_alt !== undefined) {
                $('input[name=category_attr]').prop('checked', 1);
                $('input[name=category_attr_value]').val('alt');
            }
            if (code.cat_attr !== undefined) {
                $('input[name=category_attr]').prop('checked', 1);
                $('input[name=category_attr_value]').val(code['cat_attr']);
            }
        }
        if (code.cat_link !== undefined) {
            $('input[name=category_link]').val(code['cat_link']);
            if (code.cat_link_r !== undefined) {
                $('input[name=category_link_base_path]').prop('checked', code['cat_link_r']);
            }
            $('input[name=category_link]').parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if (code.root_url !== undefined) {
            $('input[name=base_path]').val(code['root_url']);
        }
        if (code.search_path !== undefined) {
            $('input[name=search_url]').val(code['search_path']);
        }
        if (code.encode !== undefined) {
            $('input[name=cp1251encode]').prop('checked', code['encode']);
        }
        if (code.post !== undefined) {
            $('input[name=post]').val(code['post']);
        }
        if (code.items !== undefined) {
            $('input[name=item]').val(code['items']);
        }
        if (code.tr_name !== undefined) {
            $('input[name=torrent_name]').val(code['tr_name']);
        }
        if (code.tr_link !== undefined) {
            $('input[name=torrent_link]').val(code['tr_link']);
        }
        if (code.tr_link_r !== undefined) {
            $('input[name=torrent_link_base_path]').prop('checked', code['tr_link_r']);
        }
        if (code.tr_size !== undefined) {
            $('input[name=torrent_size]').val(code['tr_size']);
            if (code.s_c !== undefined) {
                $('input[name=convert_size]').prop('checked', code['s_c']);
            }
            $('input[name=torrent_size]').parents().eq(1).find('input[name=status]').prop('checked', 1);
            if (code.size_r !== undefined) {
                $('input[name=size_regexp]').val(code['size_r']);
                $('input[name=size_regexp_repl]').val(code['size_rp']);
            }
            if (code.size_attr !== undefined) {
                $('input[name=size_attr]').prop('checked', 1);
                $('input[name=size_attr_value]').val(code['size_attr']);
            }
        }
        if (code.tr_dl !== undefined) {
            $('input[name=torrent_dl_link]').val(code['tr_dl']);
            if (code.tr_dl_r !== undefined) {
                $('input[name=torrent_dl_link_base_path]').prop('checked', code['tr_dl_r']);
            }
            $('input[name=torrent_dl_link]').parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if (code.seed !== undefined) {
            $('input[name=seed_count]').val(code['seed']);
            $('input[name=seed_count]').parents().eq(1).find('input[name=status]').prop('checked', 1);
            if (code.seed_r !== undefined) {
                $('input[name=seed_regexp]').val(code['seed_r']);
                $('input[name=seed_regexp_repl]').val(code['seed_rp']);
            }
        }
        if (code.peer !== undefined) {
            $('input[name=peer_count]').val(code['peer']);
            $('input[name=peer_count]').parents().eq(1).find('input[name=status]').prop('checked', 1);
            if (code.peer_r !== undefined) {
                $('input[name=peer_regexp]').val(code['peer_r']);
                $('input[name=peer_regexp_repl]').val(code['peer_rp']);
            }
        }
        if (code.date !== undefined) {
            $('input[name=add_time]').val(code['date']);
            if (code.t_r !== undefined) {
                $('input[name=time_regexp]').val(code['t_r']);
                $('input[name=time_regexp_repl]').val(code['t_r_r']);
            }
            if (code.t_t_r !== undefined) {
                $('input[name=today_replace]').prop('checked', code['t_t_r']);
            }
            if (code.t_m_r !== undefined) {
                $('input[name=month_replace]').prop('checked', code['t_m_r']);
            }
            if (code.t_f !== undefined) {
                $('select[name=date_format] option[value=' + code['t_f'] + ']').prop('selected', 1);
            }
            if (code.date_attr !== undefined) {
                $('input[name=time_attr]').prop('checked', 1);
                $('input[name=time_attr_value]').val(code['date_attr']);
            }
            $('input[name=add_time]').parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if (code.sf !== undefined) {
            $('input[name=skip_first]').val(code['sf']);
        }
        if (code.sl !== undefined) {
            $('input[name=skip_last]').val(code['sl']);
        }
        if (code.auth !== undefined) {
            $('input[name=auth_url]').val(code['auth']);
        }
        if (code.auth_f !== undefined) {
            $('input[name=auth_form]').val(code['auth_f']);
        }
        if (code.icon !== undefined) {
            $('input[name=icon]').val(code['icon']);
        }
        if (code.name !== undefined) {
            $('input[name=tr_name]').val(code['name']);
        }
        if (code.about !== undefined) {
            $('input[name=desk]').val(code['about']);
        }
        if (code.flags !== undefined) {
            $('input[name=need_auth]').prop('checked', code['flags'].a);
            $('input[name=rus]').prop('checked', code['flags'].l);
            if (code['flags'].rs) {
                $('input[name=cirilic]').prop('checked', 1);
            } else {
                $('input[name=cirilic]').prop('checked', 0);
            }

        }
    };
    var make_code = function() {
        var code = {
            'version': 1,
            'type': 'kit',
            'name': $('input[name=tr_name]').val(),
            'icon': $('input[name=icon]').val(),
            'about': $('input[name=desk]').val(),
            'root_url': $('input[name=base_path]').val(),
            'search_path': $('input[name=search_url]').val(),
            'items': $('input[name=item]').val(),
            'tr_name': $('input[name=torrent_name]').val(),
            'tr_link': $('input[name=torrent_link]').val(),
            'flags': {
                a: ($('input[name=need_auth]').prop('checked')) ? 1 : 0,
                l: ($('input[name=rus]').prop('checked')) ? 1 : 0,
                rs: ($('input[name=cirilic]').prop('checked')) ? 1 : 0
            }
        };
        if (typeof (code.icon) !== 'string' || code.icon.length === 0) {
            code.icon = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
        }
        if ($('input[name=post]').val().length > 0) {
            code['post'] = $('input[name=post]').val();
        }
        if ($('input[name=cp1251encode]').prop('checked')) {
            code['encode'] = 1;
        }
        if ($('input[name=category_name]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['cat_name'] = $('input[name=category_name]').val();
            if ($('input[name=category_attr]').prop('checked')) {
                code['cat_attr'] = $('input[name=category_attr_value]').val();
            }
        }
        if ($('input[name=category_link]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['cat_link'] = $('input[name=category_link]').val();
            if ($('input[name=category_link_base_path]').prop('checked')) {
                code['cat_link_r'] = 1;
            }
        }
        if ($('input[name=torrent_link_base_path]').prop('checked')) {
            code['tr_link_r'] = 1;
        }
        if ($('input[name=torrent_size]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['tr_size'] = $('input[name=torrent_size]').val();
            if ($('input[name=convert_size]').prop('checked')) {
                code['s_c'] = 1;
            }
            if ($('input[name=size_regexp]').val().length > 0) {
                code['size_r'] = $('input[name=size_regexp]').val();
                code['size_rp'] = $('input[name=size_regexp_repl]').val();
            }
            if ($('input[name=size_attr]').prop('checked')) {
                code['size_attr'] = $('input[name=size_attr_value]').val();
            }
        }
        if ($('input[name=torrent_dl_link]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['tr_dl'] = $('input[name=torrent_dl_link]').val();
            if ($('input[name=torrent_dl_link_base_path]').prop('checked')) {
                code['tr_dl_r'] = 1;
            }
        }
        if ($('input[name=seed_count]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['seed'] = $('input[name=seed_count]').val();
            if ($('input[name=seed_regexp]').val().length > 0) {
                code['seed_r'] = $('input[name=seed_regexp]').val();
                code['seed_rp'] = $('input[name=seed_regexp_repl]').val();
            }
        }
        if ($('input[name=peer_count]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['peer'] = $('input[name=peer_count]').val();
            if ($('input[name=peer_regexp]').val().length > 0) {
                code['peer_r'] = $('input[name=peer_regexp]').val();
                code['peer_rp'] = $('input[name=peer_regexp_repl]').val();
            }
        }
        if ($('input[name=add_time]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['date'] = $('input[name=add_time]').val();
            if ($('input[name=time_attr]').prop('checked')) {
                code['date_attr'] = $('input[name=time_attr_value]').val();
            }
            if ($('input[name=time_regexp]').val().length > 0) {
                code['t_r'] = $('input[name=time_regexp]').val();
                code['t_r_r'] = $('input[name=time_regexp_repl]').val();
            }
            if ($('input[name=today_replace]').prop('checked')) {
                code['t_t_r'] = 1;
            }
            if ($('input[name=month_replace]').prop('checked')) {
                code['t_m_r'] = 1;
            }
            if ($('select[name=date_format]').val() !== '-1') {
                code['t_f'] = $('select[name=date_format]').val();
            }
        }
        if ($('input[name=skip_first]').val() > 0) {
            code['sf'] = $('input[name=skip_first]').val();
        }
        if ($('input[name=skip_last]').val() > 0) {
            code['sl'] = $('input[name=skip_last]').val();
        }
        if ($('input[name=auth_url]').val().length > 0) {
            code['auth'] = $('input[name=auth_url]').val();
        }
        if ($('input[name=auth_form]').val().length > 0) {
            code['auth_f'] = $('input[name=auth_form]').val();
        }
        code['uid'] = hashCode(JSON.stringify(code));
        $('textarea[name=code]').val(JSON.stringify(code));
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
        status_bar.text(path);
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
        var reg_v = $('input[name=time_regexp]').val();
        var mtime = $('input[name=original_time]').val();
        var onrepl = $('input[name=time_regexp_repl]').val();
        var repl_t = $('input[name=today_replace]').prop('checked');
        var repl_m = $('input[name=month_replace]').prop('checked');
        var f_v = $('select[name=date_format]').val();
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
        $('input[name=converted_time]').val(mtime);
        $('input[name=result_time]').val((new Date(mtime * 1000)));
    };
    var filter_size = function() {
        var type = "size";
        var size = $('input[name=original_size]').val();
        var reg_v = $('input[name=' + type + '_regexp]').val();
        var onrepl = $('input[name=' + type + '_regexp_repl]').val();
        if (reg_v.length > 0) {
            size = size.replace(new RegExp(reg_v, "ig"), onrepl);
        }
        if ($('input[name=convert_size]').prop('checked')) {
            size = ex_kit.format_size(size);
        }
        $('input[name=converted_size]').val(size);
        $('input[name=result_size]').val(bytesToSize(size));
    };
    var filter_seed = function() {
        var type = "seed";
        var reg_v = $('input[name=' + type + '_regexp]').val();
        var ostr = $('input[name=original_' + type + ']').val();
        var onrepl = $('input[name=' + type + '_regexp_repl]').val();
        if (reg_v.length > 0) {
            ostr = ostr.replace(new RegExp(reg_v, "ig"), onrepl);
        }
        $('input[name=converted_' + type + ']').val(ostr);
        $('input[name=result_' + type + ']').val(ostr);
    };
    var filter_peer = function() {
        var type = "peer";
        var reg_v = $('input[name=' + type + '_regexp]').val();
        var ostr = $('input[name=original_' + type + ']').val();
        var onrepl = $('input[name=' + type + '_regexp_repl]').val();
        if (reg_v.length > 0) {
            ostr = ostr.replace(new RegExp(reg_v, "ig"), onrepl);
        }
        $('input[name=converted_' + type + ']').val(ostr);
        $('input[name=result_' + type + ']').val(ostr);
    };
    var write_language = function() {
        $.each(_lang.magic, function(k, v) {
            var el = $('[data-lang=' + k + ']');
            if (el.length === 0)
                return true;
            var t = el.prop("tagName");
            if (t === "A" || t === "LEGEND" || t === "SPAN" || t === "LI" || t === "TH") {
                el.text(v);
            } else
            if (t === "INPUT") {
                el.val(v);
            } else
                console.log(t);
        });
    };
    return {
        begin: function() {
            write_language();
            status_bar = $('div.status_bar');
            $('iframe.web').css('height', $(window).height() - $('div.tools').height() - 4 - $('div.status_bar').height() + 'px');
            $('input[name=open]').on('click', function() {
                var url = $(this).parents().eq(1).find('input[name=search_url]').val();
                open_page(url);
                $('input[name=base_path]').val(url.replace(/(.*)\/[^\/]*$/, '$1/'));
            });
            $('input[name=open_auth]').on('click', function() {
                var url = $(this).parents().eq(1).find('input[name=auth_url]').val();
                open_page(url);
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
                inp.removeClass('error');
                var strip_tr = $('input[name=tr_strip]').prop('checked');
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
            $('input[name=item]').on('keyup', function() {
                var ifr = $($('iframe')[0].contentDocument);
                if (ifr.find($(this).val()).length === 0) {
                    $(this).addClass('error');
                } else {
                    $(this).removeClass('error');
                }
            });
            //auth form
            $('input[name=auth_form_btn]').on('click', function() {
                select_mode = true;
                var ifr = $($('iframe')[0].contentDocument);
                var inp = $('input[name=auth_form]');
                inp.removeClass('error');
                hov_function = function(obj) {
                    inp.val(obj_in_path(obj, ifr));
                };
                sel_function = function(obj) {
                    select_mode = false;
                    ifr.find('.kit_select').removeClass('kit_select');
                };
            });
            $('input[name=auth_form]').on('keyup', function() {
                var ifr = $($('iframe')[0].contentDocument);
                if (ifr.find($(this).val()).length === 0) {
                    $(this).addClass('error');
                } else {
                    $(this).removeClass('error');
                }
            });
            //<

            var keyup_text = function(inp, out, t) {
                var txt = $('input[name=' + out + ']');
                var path = $('input[name=item]').val() + ':eq(' + $('input[name=skip_first]').val() + ')' + '>' + inp.val();
                try {
                    var obj = pageDOM.find(path);
                    var val = '';
                    if (obj.length === 0) {
                        inp.addClass('error');
                    } else {
                        inp.removeClass('error');
                        if (t === 'n') {
                            if (out === "torrent_size_text" && $('input[name=size_attr]').prop('checked')) {
                                val = obj.eq(0).attr($('input[name=size_attr_value]').val());
                            } else
                            if (out === "add_time_text" && $('input[name=time_attr]').prop('checked')) {
                                val = obj.eq(0).attr($('input[name=time_attr_value]').val());
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
                            if (out === "category_name_text" && $('input[name=category_attr]').prop('checked')) {
                                $('input[name=' + out + ']').val(obj.attr($('input[name=category_attr_value]').val()));
                            } else {
                                $('input[name=' + out + ']').val(obj.eq(0).text());
                            }
                        }
                    }
                    if (out === 'peer_count_text') {
                        $('input[name=original_peer]').val(val);
                        filter_peer();
                    }
                    if (out === 'seed_count_text') {
                        $('input[name=original_seed]').val(val);
                        filter_seed();
                    }
                    if (out === 'add_time_text') {
                        $('input[name=original_time]').val(val);
                        filter_date();
                    }
                    if (out === 'torrent_size_text') {
                        $('input[name=original_size]').val(val);
                        filter_size();
                    }
                } catch (e) {
                    inp.addClass('error');
                }
            };
            var click_text = function(inp, out, t) {
                select_mode = true;
                var tr = $('input[name=item]').val();
                //+ ':eq('+$('input[name=skip_first]').val()+')'
                var ifr = $($('iframe')[0].contentDocument);
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
                        if (out === "torrent_size_text" && $('input[name=size_attr]').prop('checked')) {
                            val = obj.attr($('input[name=size_attr_value]').val());
                        } else
                        if (out === "add_time_text" && $('input[name=time_attr]').prop('checked')) {
                            val = obj.attr($('input[name=time_attr_value]').val());
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
                        if (out === "category_name_text" && $('input[name=category_attr]').prop('checked')) {
                            txt.val(obj.attr($('input[name=category_attr_value]').val()));
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
                            $('input[name=original_peer]').val(val);
                            filter_peer();
                        }
                        if (out === 'seed_count_text') {
                            $('input[name=original_seed]').val(val);
                            filter_seed();
                        }
                        if (out === 'add_time_text') {
                            $('input[name=original_time]').val(val);
                            filter_date();
                        }
                        if (out === 'torrent_size_text') {
                            $('input[name=original_size]').val(val);
                            filter_size();
                        }
                    }
                };
            };
            //category
            $('input[name=category_name_btn]').on('click', function() {
                click_text('category_name', 'category_name_text');
            });
            $('input[name=category_name]').on('keyup', function() {
                keyup_text($(this), 'category_name_text');
            });
            $('input[name=category_link_btn]').on('click', function() {
                click_text('category_link', 'category_link_href', 'l');
            });
            $('input[name=category_link]').on('keyup', function() {
                keyup_text($(this), 'category_link_href', 'l');
            });
            //<
            //torrent name
            $('input[name=torrent_name_btn]').on('click', function() {
                click_text('torrent_name', 'torrent_name_text');
            });
            $('input[name=torrent_name]').on('keyup', function() {
                keyup_text($(this), 'torrent_name_text');
            });
            $('input[name=torrent_link_btn]').on('click', function() {
                click_text('torrent_link', 'torrent_link_href', 'l');
            });
            $('input[name=torrent_link]').on('keyup', function() {
                keyup_text($(this), 'torrent_link_href', 'l');
            });
            //<
            //torrent size
            $('input[name=torrent_size_btn]').on('click', function() {
                click_text('torrent_size', 'torrent_size_text', 'n');
            });
            $('input[name=torrent_size]').on('keyup', function() {
                keyup_text($(this), 'torrent_size_text', 'n');
            });
            //<
            //torrent dl link
            $('input[name=torrent_dl_link_btn]').on('click', function() {
                click_text('torrent_dl_link', 'torrent_dl_link_href', 'l');
            });
            $('input[name=torrent_dl_link]').on('keyup', function() {
                keyup_text($(this), 'torrent_dl_link_href', 'l');
            });
            //<
            //seed
            $('input[name=seed_count_btn]').on('click', function() {
                click_text('seed_count', 'seed_count_text', 'n');
            });
            $('input[name=seed_count]').on('keyup', function() {
                keyup_text($(this), 'seed_count_text', 'n');
            });
            //<
            //peer
            $('input[name=peer_count_btn]').on('click', function() {
                click_text('peer_count', 'peer_count_text', 'n');
            });
            $('input[name=peer_count]').on('keyup', function() {
                keyup_text($(this), 'peer_count_text', 'n');
            });
            //<
            //time
            $('input[name=add_time_btn]').on('click', function() {
                click_text('add_time', 'add_time_text', 'n');
            });
            $('input[name=add_time]').on('keyup', function() {
                keyup_text($(this), 'add_time_text', 'n');
            });
            //<
            $('input[name=time_regexp]').on('keyup', function() {
                filter_date();
            });
            $('input[name=time_regexp_repl]').on('keyup', function() {
                filter_date();
            });
            var formats = ex_kit.format_date();
            var f_sel = $('select[name=date_format]');
            var f_l = formats.length;
            f_sel.append('<option value="-1">-</option>');
            for (var n = 0; n < f_l; n++) {
                f_sel.append('<option value="' + n + '">' + formats[n] + '</option>');
            }
            f_sel.on('change', function() {
                filter_date();
            });
            $('input[name=today_replace]').on('change', function() {
                filter_date();
            });
            $('input[name=month_replace]').on('change', function() {
                filter_date();
            });
            $('input[name=convert_size]').on('change', function() {
                filter_size();
            });
            $('input[name=make_code]').on('click', function() {
                make_code();
            });
            $('ul.menu').on('click', 'a', function(e) {
                e.preventDefault();
                $('ul.menu').find('a.active').removeClass('active');
                $(this).addClass('active');
                $('body').find('div.page.active').removeClass('active');
                $('body').find('div.' + $(this).data('page')).addClass('active');
                $(window).trigger('resize');
            });
            $('input[name=load_code]').on('click', function() {
                load_code();
            });
            var type = "seed";
            $('input[name=' + type + '_regexp]').on('keyup', function() {
                filter_seed();
            });
            $('input[name=' + type + '_regexp_repl]').on('keyup', function() {
                filter_seed();
            });
            var type = "peer";
            $('input[name=' + type + '_regexp]').on('keyup', function() {
                filter_peer();
            });
            $('input[name=' + type + '_regexp_repl]').on('keyup', function() {
                filter_peer();
            });
            var type = "size";
            $('input[name=' + type + '_regexp]').on('keyup', function() {
                filter_size();
            });
            $('input[name=' + type + '_regexp_repl]').on('keyup', function() {
                filter_size();
            });
        }
    };
}();
$(function() {
    magic.begin();
});
$(window).on('resize', function() {
    $('iframe.web').css('height', $(window).height() - $('div.tools').height() - 4 - $('div.status_bar').height() + 'px');
});

jQuery.fn.getPath = function(ifr) {
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