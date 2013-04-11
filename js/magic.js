var magic = function() {
    var select_mode = false;
    var sel_function = function(i) {
    };
    var hov_function = function(i) {
    };
    var xhr = null;
    var contentFilter = function(c) {
        var c = c.replace(/script/img, 'noscript').replace(/display[: ]*none/img, '#blockdisp#').replace(/ src=(['"]{0,1})/img, ' src=$11.png#blockrurl#');
        return c;
    }
    var isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    var open_page = function(url) {
        if (url.length == 0)
            return;
        var iframe = $('iframe');
        if (xhr != null)
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
                iframe[0].contentDocument.all[0].innerHTML = contentFilter(data) + '<style>.kit_select {color:#000 !important;background-color:#FFCC33 !important; cursor:pointer;} td.kit_select { border: 1px dashed red !important; }</style>';
            }
        };
        if (post_r.length > 0) {
            obj_req.type = 'POST';
            obj_req['data'] = post_r;
        }
        xhr = $.ajax(obj_req);
    }
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
    }
    var load_code = function() {
        empty_all();
        var code = null;
        try {
            code = JSON.parse($('textarea[name=code]').val());
        } catch (e) {
            alert('Ошибка загрузки!' + "\n" + e)
        }
        if (!code)
            return;
        if ('cat_name' in code) {
            $('input[name=category_name]').val(code['cat_name']);
            $('input[name=category_name]').parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if ('cat_link' in code) {
            $('input[name=category_link]').val(code['cat_link']);
            if ('cat_link_r' in code) {
                $('input[name=category_link_base_path]').prop('checked', code['cat_link_r']);
            }
            $('input[name=category_link]').parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if ('root_url' in code) {
            $('input[name=base_path]').val(code['root_url']);
        }
        if ('search_path' in code) {
            $('input[name=search_url]').val(code['search_path']);
        }
        if ('encode' in code) {
            $('input[name=cp1251encode]').prop('checked', code['encode']);
        }
        if ('post' in code) {
            $('input[name=post]').val(code['post']);
        }
        if ('items' in code) {
            $('input[name=item]').val(code['items']);
        }
        if ('tr_name' in code) {
            $('input[name=torrent_name]').val(code['tr_name']);
        }
        if ('tr_link' in code) {
            $('input[name=torrent_link]').val(code['tr_link']);
        }
        if ('tr_link_r' in code) {
            $('input[name=torrent_link_base_path]').prop('checked', code['tr_link_r']);
        }
        if ('tr_size' in code) {
            $('input[name=torrent_size]').val(code['tr_size']);
            if ('s_c' in code) {
                $('input[name=convert_size]').prop('checked', code['s_c']);
            }
            $('input[name=torrent_size]').parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if ('tr_dl' in code) {
            $('input[name=torrent_dl_link]').val(code['tr_dl']);
            if ('tr_dl_r' in code) {
                $('input[name=torrent_dl_link_base_path]').prop('checked', code['tr_dl_r']);
            }
            $('input[name=torrent_dl_link]').parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if ('seed' in code) {
            $('input[name=seed_count]').val(code['seed']);
            $('input[name=seed_count]').parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if ('peer' in code) {
            $('input[name=peer_count]').val(code['peer']);
            $('input[name=peer_count]').parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if ('date' in code) {
            $('input[name=add_time]').val(code['date']);
            if ('t_r' in code) {
                $('input[name=time_regexp]').val(code['t_r']);
            }
            if ('t_r_r' in code) {
                $('input[name=time_regexp_repl]').val(code['t_r_r']);
            }
            if ('t_m_r' in code) {
                $('input[name=month_replace]').prop('checked', code['t_m_r']);
            }
            if ('t_f' in code) {
                $('select[name=date_format] option[value=' + code['t_f'] + ']').prop('selected', 1);
            }
            $('input[name=add_time]').parents().eq(1).find('input[name=status]').prop('checked', 1);
        }
        if ('sf' in code) {
            $('input[name=skip_first]').val(code['sf']);
        }
        if ('sl' in code) {
            $('input[name=skip_last]').val(code['sl']);
        }
        if ('auth' in code) {
            $('input[name=auth_url]').val(code['auth']);
        }
        if ('auth_f' in code) {
            $('input[name=auth_form]').val(code['auth_f']);
        }
    }
    var make_code = function() {
        var code = {
            'version': 1,
            'type': 'kit',
            'name': 'noname',
            'icon': '',
            'root_url': $('input[name=base_path]').val(),
            'search_path': $('input[name=search_url]').val(),
            'items': $('input[name=item]').val(),
            'tr_name': $('input[name=torrent_name]').val(),
            'tr_link': $('input[name=torrent_link]').val()
        }
        if ($('input[name=post]').val().length > 0) {
            code['post'] = $('input[name=post]').val();
        }
        if ($('input[name=cp1251encode]').prop('checked')) {
            code['encode'] = 1;
        }
        if ($('input[name=category_name]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['cat_name'] = $('input[name=category_name]').val();
        }
        if ($('input[name=category_link]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['cat_link'] = $('input[name=category_link]').val()
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
        }
        if ($('input[name=torrent_dl_link]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['tr_dl'] = $('input[name=torrent_dl_link]').val();
            if ($('input[name=torrent_dl_link_base_path]').prop('checked')) {
                code['tr_dl_r'] = 1;
            }
        }
        if ($('input[name=seed_count]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['seed'] = $('input[name=seed_count]').val();
        }
        if ($('input[name=peer_count]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['peer'] = $('input[name=peer_count]').val();
        }
        if ($('input[name=add_time]').parents().eq(1).find('input[name=status]').prop('checked')) {
            code['date'] = $('input[name=add_time]').val();
            if ($('input[name=time_regexp]').val().length > 0) {
                code['t_r'] = $('input[name=time_regexp]').val();
                code['t_r_r'] = $('input[name=time_regexp_repl]').val();
            }
            if ($('input[name=month_replace]').prop('checked')) {
                code['t_m_r'] = 1;
            }
            if ($('select[name=date_format]').val() != -1) {
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
    }
    var hashCode = function(s) {
        var hash = 0, i, char;
        if (s.length == 0)
            return hash;
        for (i = 0; i < s.length; i++) {
            char = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return (hash < 0) ? hash * -1 : hash;
    };
    var obj_in_path = function(obj, ifr) {
        var path = obj.getPath(ifr);
        return path;
    }
    var format_size = function(s) {
        var size = s.replace(/[^0-9.,кбмгтkmgtb]/ig, '');
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
        var t = size.replace(/тб|tb/i, '');
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
            return ['2013-04-31[[[ 07]:03]:27]', '31-04-2013[[[ 07]:03]:27]', 'n day ago']
        }
        if (f == 0 || f == '2013-04-31[[[ 07]:03]:27]') {
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
        if (f == 1 || f == '31-04-2013[[[ 07]:03]:27]') {
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
                .replace(/jan/i, '1').replace(/feb/i, '2').replace(/mar/i, '3')
                .replace(/apr/i, '4').replace(/may/i, '5').replace(/jun/i, '6')
                .replace(/jul/i, '7').replace(/aug/i, '8').replace(/sep/i, '9')
                .replace(/oct/i, '10').replace(/nov/i, '11').replace(/dec/i, '12');
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
    var filter_date = function() {
        var reg_v = $('input[name=time_regexp]').val();
        var mtime = $('input[name=original_time]').val();
        var onrepl = $('input[name=time_regexp_repl]').val();
        var repl_m = $('input[name=month_replace]').prop('checked');
        var f_v = $('select[name=date_format]').val();
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
    var filter_size = function() {
        var size = $('input[name=original_size]').val();
        if ($('input[name=convert_size]').prop('checked')) {
            size = format_size(size);
        }
        $('input[name=converted_size]').val(size);
        $('input[name=result_size]').val(bytesToSize(size));
    }
    return {
        begin: function() {
            $('iframe.web').css('height', $(window).height() - $('div.tools').height() - 4 + 'px');
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
                hov_function = function(obj) {
                    inp.val(obj_in_path(obj, ifr).replace(/(.*)>tr.*$/, '$1>tr'));
                }
                sel_function = function(obj) {
                    select_mode = false;
                    ifr.find('.kit_select').removeClass('kit_select');
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
            //auth form
            $('input[name=auth_form_btn]').on('click', function() {
                select_mode = true;
                var ifr = $($('iframe')[0].contentDocument);
                var inp = $('input[name=auth_form]');
                inp.removeClass('error');
                hov_function = function(obj) {
                    inp.val(obj_in_path(obj, ifr));
                }
                sel_function = function(obj) {
                    select_mode = false;
                    ifr.find('.kit_select').removeClass('kit_select');
                }
            });
            $('input[name=auth_form]').on('keyup', function() {
                var ifr = $($('iframe')[0].contentDocument);
                if (ifr.find($(this).val()).length == 0) {
                    $(this).addClass('error');
                } else {
                    $(this).removeClass('error');
                }
            });
            //<

            var keyup_text = function(inp, out, t) {
                var txt = $('input[name=' + out + ']');
                var ifr = $($('iframe')[0].contentDocument);
                var path = $('input[name=item]').val() + ':eq(' + $('input[name=skip_first]').val() + ')' + '>' + inp.val();
                try {
                    var obj = ifr.find(path);
                    var val = '';
                    if (obj.length == 0) {
                        inp.addClass('error');
                    } else {
                        inp.removeClass('error');
                        if (t == 'n') {
                            val = obj.eq(0).text();
                            txt.val(val);
                            if (!isNumber(val)) {
                                txt.addClass('error');
                            } else {
                                txt.removeClass('error');
                            }
                        } else
                        if (t == 'l') {
                            $('input[name=' + out + ']').val(obj.eq(0).attr('href'));
                        } else {
                            $('input[name=' + out + ']').val(obj.eq(0).text());
                        }
                    }
                    if (out == 'add_time_text') {
                        $('input[name=original_time]').val(val);
                        filter_date();
                    }
                    if (out == 'torrent_size_text') {
                        $('input[name=original_size]').val(val);
                        filter_size();
                    }
                } catch (e) {
                    inp.addClass('error');
                }
            };
            var click_text = function(opath, otext, t) {
                select_mode = true;
                var tr = $('input[name=item]').val();
                //+ ':eq('+$('input[name=skip_first]').val()+')'
                var ifr = $($('iframe')[0].contentDocument);
                var inp = $('input[name=' + opath + ']');
                var txt = $('input[name=' + otext + ']');
                inp.removeClass('error');
                hov_function = function(obj) {
                    var o_path = obj_in_path(obj, ifr)
                    var path = o_path.replace(tr, '').replace(/^[^>]*>(.*)$/, '$1');
                    var val = '';
                    if (o_path.length == path.length)
                        return;
                    inp.val(path);
                    if (t == 'n') {
                        var val = obj.text();
                        txt.val(val);
                        if (!isNumber(val)) {
                            txt.addClass('error');
                        } else {
                            txt.removeClass('error');
                        }
                    } else
                    if (t == 'l') {
                        txt.val(obj.attr('href'));
                    } else {
                        txt.val(obj.text());
                    }
                }
                sel_function = function(obj) {
                    select_mode = false;
                    ifr.find('.kit_select').removeClass('kit_select');
                    if (t == 'n') {
                        var val = obj.text();
                        if (otext == 'add_time_text') {
                            $('input[name=original_time]').val(val);
                            filter_date();
                        }
                        if (otext == 'torrent_size_text') {
                            $('input[name=original_size]').val(val);
                            filter_size();
                        }
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
                click_text('category_link', 'category_link_href', 'l');
            });
            $('input[name=category_link]').on('keyup', function() {
                keyup_text($(this), 'category_link_href', 'l');
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
                click_text('torrent_link', 'torrent_link_href', 'l');
            });
            $('input[name=torrent_link]').on('keyup', function() {
                keyup_text($(this), 'torrent_link_href', 'l');
            });
            //<
            //torrent size
            $('input[name=torrent_size_btn]').on('click', function() {
                click_text('torrent_size', 'torrent_size_text', 'n')
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
                click_text('seed_count', 'seed_count_text', 'n')
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
            var formats = format_date();
            var f_sel = $('select[name=date_format]');
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
            });
            $('input[name=load_code]').on('click', function() {
                load_code();
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
    no_id = ['tr']
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
                if ($.inArray(tag, no_id) == -1 && ifr.find('#' + realNode.id).length == 1) {
                    return '#' + realNode.id + (path ? '>' + path : '');
                } else {
                    name += '#' + realNode.id;
                }
            } else {
                return name + '#' + realNode.id + (path ? '>' + path : '');
            }
        } else if (realNode.className) {
            name += ('.' + realNode.className.split(/\s+/).join('.')).replace('.kit_select', '');
            if (ifr.find(name).length == 1) {
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
        if (siblings_no_class.length == 1) {
            name = tag;
        } else {
            if (siblings.length > 1) {
                name += ':eq(' + siblings.index(node) + ')';
            }
        }
        if ($.inArray(tag, ['table', 'div']) != -1 && ifr.find(name).length == 1) {
            return name + (path ? '>' + path : '');
        }
        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
};