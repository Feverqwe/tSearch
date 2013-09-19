var options = function() {
    var def_settings = {
        HideLeech: {"v": 1, "t": "checkbox"},
        HideSeed: {"v": 0, "t": "checkbox"},
        ShowIcons: {"v": 1, "t": "checkbox"},
        SubCategoryFilter: {"v": 0, "t": "checkbox"},
        HideZeroSeed: {"v": 0, "t": "checkbox"},
        AdvFiltration: {"v": 2, "t": "radio"},
        AutoSetCategory: {"v": 0, "t": "checkbox"},
        TeaserFilter: {"v": 1, "t": "checkbox"},
        add_in_omnibox: {"v": 1, "t": "checkbox"},
        context_menu: {"v": 1, "t": "checkbox"},
        search_popup: {"v": 1, "t": "checkbox"},
        AutoComplite_opt: {"v": 1, "t": "checkbox"},
        use_english_postername: {"v": 0, "t": "checkbox"},
        google_proxy: {"v": 0, "t": "checkbox"},
        google_analytics: {"v": 0, "t": "checkbox"},
        autoSetCat: {"v": 1, "t": "checkbox"},
        allow_get_description: {"v": 1, "t": "checkbox"},
        allow_favorites_sync: {"v": 0, "t": "checkbox"},
        sub_select_enable: {"v": 1, "t": "checkbox"}
    };
    var currentProfileID = 0;
    var defProfile = 0;
    var trackerProfiles = null;
    var settings = {};
    var settings_load = function() {
        $.each(def_settings, function(k, v) {
            settings[k] = (GetSettings(k) !== undefined) ? parseInt(GetSettings(k)) : v.v;
        });
        if (currentProfileID === 0) {
            defProfile = currentProfileID = (GetSettings('defProfile') !== undefined) ? parseInt(GetSettings('defProfile')) : 0;
        } else {
            defProfile = (GetSettings('defProfile') !== undefined) ? parseInt(GetSettings('defProfile')) : 0;
        }
        trackerProfiles = (GetSettings('trackerProfiles') !== undefined) ? JSON.parse(GetSettings('trackerProfiles')) : null;
    };
    settings_load();
    var set_place_holder = function() {
        settings_load();
        $.each(def_settings, function(k, v) {
            var set = settings;
            if (v.t === "text" || v.t === "number" || v.t === "password") {
                $('input[name="' + k + '"]').removeAttr("value");
                if (k in set && set[k] != v.v) {
                    $('input[name="' + k + '"]').attr("value", set[k]);
                }
                if (v.v != null) {
                    $('input[name="' + k + '"]').attr("placeholder", v.v);
                }
            }
            if (v.t === "checkbox") {
                if (k in set) {
                    $('input[name="' + k + '"]').eq(0)[0].checked = (set[k]) ? 1 : 0;
                } else {
                    $('input[name="' + k + '"]').eq(0)[0].checked = (v.v) ? 1 : 0;
                }
            }
            if (v.t === "radio") {
                if (k in set) {
                    $('input[name="' + k + '"][value="' + set[k] + '"]').eq(0)[0].checked = true;
                } else {
                    $('input[name="' + k + '"][value="' + v.v + '"]').eq(0)[0].checked = true;
                }
            }
        });
        updateProfileList();
    };
    var addTrackerInList = function(i) {
        var filename = tracker[i].filename;
        var id = currentProfileID;
        if (trackerProfiles === null) {
            return;
        }
        if (trackerProfiles[id] === undefined) {
            return;
        }
        var t = trackerProfiles[id].Trackers;
        if (t === undefined || t === null) {
            t = engine.defaultList;
        }
        var enable = false;
        var tc = t.length;
        for (var n = 0; n < tc; n++) {
            if (t[n].n === filename) {
                enable = t[n].e;
                break;
            }
        }
        var flags = '';
        if (!tracker[i].flags.rs) {
            flags += '<div class="cirilic" title="' + _lang.flag.cirilic + '"></div>';
        }
        if (tracker[i].flags.a) {
            flags += '<div class="auth" title="' + _lang.flag.auth + '"></div>';
        }
        if (tracker[i].flags.l) {
            flags += '<div class="rus" title="' + _lang.flag.rus + '"></div>';
        }
        if (flags.length > 0) {
            flags = '<div class="icons">' + flags + '</div>';
        }
        $('table.tr_table tbody').append('<tr data-id="' + i + '" data-name="' + tracker[i].filename + '"' + '>'
                + '<td><div class="tracker_icon" ' +
                ((tracker[i].icon.length === 0 || tracker[i].icon[0] === '#') ? 'style="background-color: ' + ((tracker[i].icon.length !== 0) ? tracker[i].icon : '#ccc') + ';border-radius: 8px;"' : 'style="background-image: url(' + tracker[i].icon + ');"')
                + '"></div></td>'
                + '<td><a href="' + tracker[i].url + '" target="_blank">' + tracker[i].name + '</a>'
                + '</td>'
                + '<td class="desc">' + flags
                + $('<span>' + tracker[i].about + '</span>').text() + '</td>'
                + '<td class="status"><input type="checkbox" name="tracker" ' + ((enable) ? 'checked' : '') + '></td>'
                + '</tr>');
    };
    var saveCurrentProfile = function() {
        var tr = $('table.tr_table tbody').children('tr');
        var trc = tr.length;
        var id = currentProfileID;
        var internalTrackers = [];
        for (var i = 0; i < trc; i++) {
            var inp = tr.eq(i).children('td.status').children('input');
            if (inp.is(':checked') === false) {
                continue;
            }
            var tr_id = tr.eq(i).attr('data-id');
            var fn = tracker[tr.eq(i).attr('data-id')].filename;
            var obj = {
                'n': fn,
                'e': 1
            };
            var uid = null;
            if ('uid' in tracker[tr_id]) {
                uid = tracker[tr_id].uid;
                obj['uid'] = uid;
            }
            internalTrackers.push(obj);
        }
        trackerProfiles[id].Trackers = internalTrackers;
        return 1;
    };
    var LoadProfiles = function() {
        var sel = $('select[name=tr_lists]');
        var arr = engine.getProfileList();
        $.each(arr, function(k, v) {
            sel.append('<option value="' + k + '" ' + ((k === defProfile) ? 'selected' : '') + '>' + v + '</option>');
        });
        if (arr.length < 2) {
            $('input[name=rm_list]').attr('disabled', 'disabled');
        }
    };
    var updateProfileList = function() {
        var sel = $('select[name=tr_lists]');
        sel.empty();
        $.each(trackerProfiles, function(k, v) {
            sel.append('<option value="' + k + '" ' + ((k === currentProfileID) ? 'selected' : '') + '>' + v.Title + '</option>');
        });
        if (trackerProfiles.length < 2) {
            $('input[name=rm_list]').attr('disabled', 'disabled');
        } else {
            $('input[name=rm_list]').removeAttr('disabled');
        }
    };
    var saveAll = function() {
        SetSettings('lang', $('select[name="language"]').val());
        $.each(def_settings, function(key, value) {
            if (value.t === "text") {
                var val = $('input[name="' + key + '"]').val();
                if (val.length <= 0) {
                    val = $('input[name="' + key + '"]').attr('placeholder');
                }
                SetSettings(key, val);
            } else
            if (value.t === "password") {
                var val = $('input[name="' + key + '"]').val();
                SetSettings(key, val);
            } else
            if (value.t === "checkbox") {
                var val = ($('input[name="' + key + '"]').eq(0)[0].checked) ? 1 : 0;
                SetSettings(key, val);
            } else
            if (value.t === "number") {
                var val = $('input[name="' + key + '"]').val();
                if (val.length <= 0) {
                    val = $('input[name="' + key + '"]').attr('placeholder');
                }
                SetSettings(key, val);
            } else
            if (value.t === "radio") {
                var val = $('input[name="' + key + '"]:checked').val();
                SetSettings(key, val);
            }
        });
        saveCurrentProfile();
        SetSettings('trackerProfiles', JSON.stringify(trackerProfiles));
        if (navigator.userAgent.search(/Chrome/) !== -1) {
            var bgp = chrome.extension.getBackgroundPage();
            bgp.bg.update_context_menu();
            if (bgp._type_ext) {
                SetSettings('search_popup', ($('input[name="search_popup"]').is(':checked')) ? 1 : 0);
                bgp.update_btn();
            }
            SetSettings('allow_favorites_sync', ($('input[name="allow_favorites_sync"]').is(':checked')) ? 1 : 0);
        }
        set_place_holder();
        var s = (document.URL).replace(/(.*)options.html/, '');
        if (s.length > 0) {
            var s = s.replace(/^#back=(.*)/, '$1');
            window.location = 'index.html#s=' + s;
        }
    };
    var getBackup = function() {
        var st = JSON.parse(JSON.stringify(localStorage));
        delete st['explorerCache'];
        delete st['topCache'];
        delete st['length'];
        delete st['search_history'];
        $('textarea[name="backup"]').val(JSON.stringify(st));
        return JSON.stringify(st);
    };
    var makePartedBackup = function() {
        var chank_name = "bk_ch_";
        var back = getBackup();
        var full_len = back.length;
        var chank_len = 1024 - (chank_name + "000").length - 1;
        var number_of_part = Math.round(full_len / chank_len);
        if (number_of_part >= 512 || full_len >= 102400) {
            console.log("Can't save backup, very big size!");
            return null;
        }
        var req_exp = new RegExp(".{1," + chank_len + "}", "g");
        var arr = back.match(req_exp);
        var arr_l = arr.length;
        var obj = {};
        for (var i = 0; i < arr_l; i++) {
            obj[chank_name + i] = arr[i];
        }
        obj[chank_name + "inf"] = arr_l;
        obj[chank_name + arr_l] = "END";
        return obj;
    };
    var getPartedBackup = function() {
        chrome.storage.sync.get(function(data) {
            var chank_name = "bk_ch_";
            var inf = 0;
            if (chank_name + "inf" in data) {
                inf = data[chank_name + "inf"];
            } else {
                $('input[name="get_from_cloud"]')[0].disabled = true;
                console.log("Backup not found!");
                return null;
            }
            var back = "";
            var broken = 0;
            for (var i = 0; i < inf; i++) {
                if (chank_name + i in data) {
                    back += data[chank_name + i];
                } else {
                    console.log("Backup is broken!", "Chank", i);
                }
            }
            if (data[chank_name + inf] !== "END") {
                broken = 1;
            }
            if (broken) {
                chrome.storage.sync.remove(chank_name + "inf");
                inf = -1;
            }
            $.each(data, function(k, v) {
                if (k.substr(0, 6) === chank_name) {
                    if (k.substr(6) !== "inf" && k.substr(6) > inf) {
                        chrome.storage.sync.remove(k);
                    }
                }
            });
            if (broken) {
                $('input[name="get_from_cloud"]')[0].disabled = true;
                return null;
            }
            $('textarea[name="restore"]').val(back);
        });
    };
    var stngsRestore = function(text) {
        try {
            var rst = JSON.parse(text);
            localStorage.clear();
            for (var key in rst)
            {
                var value = rst[key];
                if (value === undefined || key === 'length')
                    continue;
                localStorage[key] = value;
            }
            write_language();
            set_place_holder();
            load_costume_torrents();
            updateProfileList();
            engine.loadProfile(currentProfileID);
            //need add save btn & reload settings
        } catch (err) {
            alert(_lang.str33 + "\n" + err);
        }
    };
    var make_bakup_form = function() {
        $('div.backup_form div').children('a.backup_tab').on("click", function(e) {
            e.preventDefault();
            $(this).parents().eq(1).children('div.restore').slideUp('fast');
            $(this).parent().children('a.restore_tab').removeClass('active');
            $(this).parents().eq(1).children('div.backup').slideDown('fast');
            $(this).parent().children('a.backup_tab').addClass('active');
            getBackup();
        });
        $('div.backup_form div').children('a.restore_tab').on("click", function(e) {
            e.preventDefault();
            $(this).parents().eq(1).children('div.backup').slideUp('fast');
            $(this).parent().children('a.backup_tab').removeClass('active');
            $(this).parents().eq(1).children('div.restore').slideDown('fast');
            $(this).parent().children('a.restore_tab').addClass('active');
        });
        $('div.backup').find('input[name=backup]').on("click", function(e) {
            e.preventDefault();
            getBackup();
        });
        $('div.restore').find('input[name=restore]').on("click", function(e) {
            e.preventDefault();
            stngsRestore($(this).parent().children('textarea').val());
            $('textarea[name="backup"]').val('');
        });
    };
    var write_language = function(language) {
        if (!language) {
            language = (GetSettings('lang') !== undefined) ? GetSettings('lang') : 'ru';
        }
        _lang = get_lang(language);
        var lang = _lang.settings;
        $('select[name="language"]').val(language);
        $.each(lang, function(k, v) {
            var el = $('[data-lang=' + k + ']');
            if (el.length === 0)
                return true;
            var t = el.prop("tagName");
            if (t === "A" || t === "LEGEND" || t === "SPAN" || t === "LI" || t === "TH" || t === "TD") {
                el.text(v);
            } else
            if (t === "INPUT") {
                el.val(v);
            } else
                console.log(t, v);
        });
    };
    var load_costume_torrents = function() {
        $('table.c_table tbody').empty();
        var costume_tr = (GetSettings('costume_tr') !== undefined) ? JSON.parse(GetSettings('costume_tr')) : [];
        var c = costume_tr.length;
        if (c === 0) {
            $('table.c_table tbody').html('<td colspan="4" class="notorrent" data-lang="51">' + _lang.settings[51] + '</td>');
        } else
            for (var i = 0; i < c; i++) {
                var tr = (GetSettings('ct_' + costume_tr[i]) !== undefined) ? JSON.parse(GetSettings('ct_' + costume_tr[i])) : null;
                if (tr === null) {
                    costume_tr.splice(i, 1);
                    SetSettings('costume_tr', JSON.stringify(costume_tr));
                    if (costume_tr.length === 0) {
                        $('table.c_table tbody').html('<td colspan="4" class="notorrent" data-lang="51">' + _lang.settings[51] + '</td>');
                    }
                    continue;
                }
                $('table.c_table tbody').append('<tr " data-uid="' + tr.uid + '"' + '>'
                        + '<td><div class="tracker_icon" ' +
                        ((tr.icon.length === 0 || tr.icon[0] === '#') ? 'style="background-color: ' + ((tr.icon.length !== 0) ? tr.icon : '#ccc') + ';border-radius: 8px;"' : 'style="background-image: url(' + tr.icon + ')"')
                        + '></div></td>'
                        + '<td><a href="' + tr.root_url + '" target="_blank">' + tr.name + '</a>'
                        + '</td>'
                        + '<td class="desc">' + (('about' in tr) ? tr.about : '') + '</td>'
                        + '<td class="action"><input type="button" name="edit_ctr" value="' + _lang.settings[52] + '" data-lang="52"><input type="button" name="rm_ctr" value="' + _lang.settings[53] + '" data-lang="53"></td>'
                        + '</tr>');
            }
    };
    return {
        LoadProfiles: function() {
            LoadProfiles();
        },
        addTrackerInList: function(a) {
            addTrackerInList(a);
        },
        begin: function() {
            write_language();
            $('select[name="language"]').on('change', function() {
                write_language($(this).val());
            });
            //LoadProfiles();
            $('table.tr_table').find('th').eq(3).children('a').eq(0).on("click", function(event) {
                event.preventDefault();
                $('table.tr_table').children('tbody').find('input[type="checkbox"]').prop('checked', 'checked');
                return false;
            });
            $('table.tr_table').find('th').eq(3).children('a').eq(1).on("click", function(event) {
                event.preventDefault();
                $('table.tr_table').children('tbody').find('input[type="checkbox"]').removeAttr('checked');
                return false;
            });
            $('table.tr_table').find('th').eq(3).children('a').eq(2).on("click", function(event) {
                event.preventDefault();
                $('table.tr_table').children('tbody').find('input[type="checkbox"]').removeAttr('checked');
                var Trackers = engine.defaultList;
                var l = Trackers.length;
                var tb = $('table.tr_table').children('tbody');
                for (var i = 0; i < l; i++) {
                    if (Trackers[i].e) {
                        tb.children('tr[data-name="' + Trackers[i].n + '"]').find('input[type="checkbox"]')[0].checked = true;
                    }
                }
                return false;
            });
            $('select[name=tr_lists]').on('change', function() {
                $('table.tr_table').parent().css('min-height', $('table.tr_table').height() + 'px');
                if (saveCurrentProfile()) {
                    currentProfileID = $(this).val();
                    engine.loadProfile(currentProfileID);
                }
            });
            $('input[name=add_list]').on('click', function() {
                var name = $(this).parents().eq(1).find('input[name=list_name]').val();
                if (name.length < 1)
                    return;
                $(this).parents().eq(1).find('input[name=list_name]').val('');
                trackerProfiles.push({
                    Trackers: null,
                    Title: name
                });
                if (saveCurrentProfile()) {
                    currentProfileID = trackerProfiles.length - 1;
                    engine.loadProfile();
                }
                updateProfileList();
            });
            $('input[name=rm_list]').on('click', function() {
                trackerProfiles.splice(currentProfileID, 1);
                defProfile = currentProfileID = currentProfileID - 1;
                if (currentProfileID >= trackerProfiles.length) {
                    defProfile = currentProfileID = 0;
                }
                engine.loadProfile(currentProfileID);
                updateProfileList();
            });
            $('ul.menu').on('click', 'a', function(e) {
                e.preventDefault();
                $('ul.menu').find('a.active').removeClass('active');
                $(this).addClass('active');
                $('body').find('div.page.active').removeClass('active');
                $('body').find('div.' + $(this).data('page')).addClass('active');
            });
            $('input[name="save"]').on('click', function() {
                saveAll();
                $('div.page.save > div.status').css('background', 'url(images/loading.gif) center center no-repeat').text('');
                window.setTimeout(function() {
                    $('div.page.save > div.status').css('background', 'none').text('');
                }, 200);
            });
            if (navigator.userAgent.search(/Firefox/) !== -1) {
//firefox
                $('div.page.backup').hide();
                $('a[data-page=backup]').hide();
                $('input[name="context_menu"]').parents().eq(1).hide();
                $('input[name="backup_form"]').parents().eq(1).hide();
            } else {
                make_bakup_form();
            }
            if (navigator.userAgent.search(/Opera/) !== -1) {
//opera
                $('input[name="add_in_omnibox"]').parents().eq(1).hide();
                $('input[name="search_popup"]').parents().eq(1).hide();
                $('input[name="google_analytics"]').parents().eq(1).hide();
                $('input[name="allow_favorites_sync"]').parents().eq(1).hide();
                $('input[name="clear_cloud_btn"]').hide();
            }
            if (navigator.userAgent.search(/Chrome/) !== -1) {
//Chrome
                var bgp = chrome.extension.getBackgroundPage();
                if (!bgp._type_ext) {
                    $('input[name="search_popup"]').parents().eq(1).hide();
                }
                if (chrome && chrome.storage) {
                    $('input[name="clear_cloud"]').on('click', function() {
                        chrome.storage.sync.clear();
                    });
                    $('input[name="save_in_cloud"]').on('click', function() {
                        var obj = makePartedBackup();
                        if (obj === null) {
                            return;
                        }
                        chrome.storage.sync.set(obj);
                        $(this).val(_lang.settings[70]);
                        window.setTimeout(function() {
                            $('input[name="save_in_cloud"]').val(_lang.settings[68]);
                        }, 3000);
                        $('input[name="get_from_cloud"]')[0].disabled = false;
                    });
                    $('input[name="get_from_cloud"]').on('click', function() {
                        getPartedBackup();
                    });
                    chrome.storage.sync.get("bk_ch_inf",
                            function(val) {
                                if ("bk_ch_inf" in val === false) {
                                    $('input[name="get_from_cloud"]').eq(0)[0].disabled = true;
                                }
                            }
                    );
                }
            } else {
                $('input[name="clear_cloud"]').css('display', 'none');
                $('input[name="get_from_cloud"]').css('display', 'none');
                $('input[name="save_in_cloud"]').css('display', 'none');
            }
            set_place_holder();
            $('input[name=add_code]').on('click', function() {
                $('input[name=ctr_add]').parent().show();
                $('input[name=ctr_edit]').parent().hide();
                $('div.popup').toggle();
            });
            $('input[name=close_popup]').on('click', function() {
                $('textarea[name=code]').val('');
                $('div.popup').hide();
            });
            $(window).trigger('resize');
            $('input[name=ctr_add]').on('click', function() {
                var str_code = $('textarea[name=code]').val();
                var costume_tr = (GetSettings('costume_tr') !== undefined) ? JSON.parse(GetSettings('costume_tr')) : [];
                var code = null;
                try {
                    code = JSON.parse(str_code);
                } catch (e) {
                    alert(_lang.settings[55] + "\n" + e);
                }
                if ('uid' in code === false) {
                    alert(_lang.settings[56]);
                    return;
                }
                SetSettings('ct_' + code.uid, str_code);
                if ($.inArray(code.uid, costume_tr) !== -1) {
                    alert(_lang.settings[54]);
                    return;
                } else {
                    costume_tr.push(code.uid);
                    SetSettings('costume_tr', JSON.stringify(costume_tr));
                }
                code = null;
                load_costume_torrents();
                $('select[name=tr_lists]').trigger('change');
                $('div.popup').find('input[name=close_popup]').trigger('click');
            });
            $('input[name=ctr_edit]').on('click', function() {
                var uid = $('div.popup').attr('data-uid');
                $('div.popup').removeAttr('data-uid');
                var str_code = $('textarea[name=code]').val();
                var code = null;
                try {
                    code = JSON.parse(str_code);
                } catch (e) {
                    alert(_lang.settings[55] + "\n" + e);
                }
                if ('uid' in code === false || uid !== code.uid) {
                    code.uid = parseInt(uid);
                }
                SetSettings('ct_' + code.uid, JSON.stringify(code));
                code = null;
                load_costume_torrents();
                $('select[name=tr_lists]').trigger('change');
                $('div.popup').find('input[name=close_popup]').trigger('click');
            });
            $('table.c_table').on('click', 'input[name=edit_ctr]', function() {
                $('input[name=ctr_edit]').parent().show();
                $('input[name=ctr_add]').parent().hide();
                var uid = $(this).parents().eq(1).attr('data-uid');
                var code = (GetSettings('ct_' + uid) !== undefined) ? GetSettings('ct_' + uid) : '';
                $('textarea[name=code]').val(code);
                $('div.popup').show();
                $('div.popup').attr('data-uid', uid);
            });
            $('table.c_table').on('click', 'input[name=rm_ctr]', function() {
                var uid = $(this).parents().eq(1).attr('data-uid');
                var costume_tr = (GetSettings('costume_tr') !== undefined) ? JSON.parse(GetSettings('costume_tr')) : [];
                var index = $.inArray(parseInt(uid), costume_tr);
                if (index === -1)
                    return;
                costume_tr.splice(index, 1);
                SetSettings('ct_' + uid, null);
                SetSettings('costume_tr', JSON.stringify(costume_tr));
                load_costume_torrents();
                $('select[name=tr_lists]').trigger('change');
            });
            load_costume_torrents();
            $('table.tr_table tbody').sortable({placeholder: "ui-state-highlight"});
            $('table.tr_table tbody').disableSelection();
        }
    };
}();
var view = function() {
    return {
        ClearTrackerList: function() {
            if ($('select[name=tr_lists]').val() === undefined) {
                options.LoadProfiles();
            }
            $('table.tr_table tbody').empty();
        },
        addTrackerInList: function(i) {
            options.addTrackerInList(i);
        }
    };
}();
$(function() {
    options.begin();
});
$(window).on('resize', function() {
    $('div.popup').css('left', ($('html').width() / 2 - $('div.popup').width() / 2) + 'px');
});