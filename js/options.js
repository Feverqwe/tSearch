var options = function() {
    var def_settings = {
        HideLeech: {"v": 1, "t": "checkbox"},
        HideSeed: {"v": 0, "t": "checkbox"},
        ShowIcons: {"v": 1, "t": "checkbox"},
        SubCategoryFilter: {"v": 0, "t": "checkbox"},
        HideZeroSeed: {"v": 0, "t": "checkbox"},
        AdvFiltration: {"v": 2, "t": "radio"},
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
        sub_select_enable: {"v": 1, "t": "checkbox"},
        kinopoisk_category: {"v": 1, "t": "checkbox"},
        kinopoisk_f_id: {"v": 1, "t": "number"}
    };
    var loadSettings = function() {
        var settings = {};
        $.each(def_settings, function(k, v) {
            settings[k] = parseInt(GetSettings(k) || v.v);
        });
        return settings;
    };
    var settings = loadSettings();
    var sandbox_trackerProfiles = JSON.parse(GetSettings('trackerProfiles'));
    var tmp_vars = {};
    currentProfile = {};
    var set_place_holder = function() {
        settings = loadSettings();
        $.each(def_settings, function(k, v) {
            var set = settings;
            if (v.t === "text" || v.t === "number" || v.t === "password") {
                $('input[name="' + k + '"]').removeAttr("value");
                if (k in set && set[k] != v.v) {
                    $('input[name="' + k + '"]').attr("value", set[k]);
                }
                if (v.v !== null && v.v !== undefined) {
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
    };
    var addTrackerInList = function(i) {
        var Tracker = tracker[i];
        var profileTrackers = sandbox_trackerProfiles[currentProfile.id].Trackers;
        if (profileTrackers === undefined || profileTrackers === null) {
            profileTrackers = engine.defaultList;
        }
        var enable = false;
        var tc = profileTrackers.length;
        for (var n = 0; n < tc; n++) {
            if (profileTrackers[n].n === Tracker.filename) {
                enable = profileTrackers[n].e;
                break;
            }
        }
        var flags = [];
        if (!Tracker.flags.rs) {
            flags.push('<div class="cirilic" title="' + _lang.flag.cirilic + '"></div>');
        }
        if (Tracker.flags.a) {
            flags.push('<div class="auth" title="' + _lang.flag.auth + '"></div>');
        }
        if (Tracker.flags.l) {
            flags.push('<div class="rus" title="' + _lang.flag.rus + '"></div>');
        }
        if (flags.length > 0) {
            flags = '<div class="icons">' + flags.join('') + '</div>';
        }
        var icon = '';
        if (Tracker.icon.length === 0) {
            icon += 'style="background-color:#ccc' + ';border-radius: 8px;"';
        } else
        if (Tracker.icon[0] === '#') {
            icon += 'style="background-color:' + Tracker.icon + ';border-radius: 8px;"';
        } else {
            icon += 'style="background-image: url(' + Tracker.icon + ');"';
        }
        $('table.tr_table tbody').append('<tr data-id="' + i + '" data-name="' + Tracker.filename + '"' + '>'
                + '<td><div class="tracker_icon" ' + icon + '></div></td>'
                + '<td><a href="' + Tracker.url + '" target="_blank">' + Tracker.name + '</a>'
                + '</td>'
                + '<td class="desc">' + flags
                + $('<span>' + Tracker.about + '</span>').text() + '</td>'
                + '<td class="status"><input type="checkbox" name="tracker" ' + ((enable) ? 'checked' : '') + '></td>'
                + '</tr>');
    };
    var write_language = function(language) {
        if (language === undefined) {
            language = GetSettings('lang') || 'ru';
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
        var empty_list = '<td colspan="4" class="notorrent" data-lang="51">' + _lang.settings[51] + '</td>';
        tmp_vars.c_tracker_list.empty();
        var costume_tr = JSON.parse(GetSettings('costume_tr') || "[]");
        var c = costume_tr.length;
        if (c === 0) {
            tmp_vars.c_tracker_list.html(empty_list);
        } else {
            for (var i = 0; i < c; i++) {
                var Tracker = JSON.parse(GetSettings('ct_' + costume_tr[i]) || {});
                if (Tracker.uid === undefined) {
                    continue;
                }
                var icon = '';
                if (Tracker.icon.length === 0) {
                    icon += 'style="background-color:#ccc' + ';border-radius: 8px;"';
                } else
                if (Tracker.icon[0] === '#') {
                    icon += 'style="background-color:' + Tracker.icon + ';border-radius: 8px;"';
                } else {
                    icon += 'style="background-image: url(' + Tracker.icon + ');"';
                }
                tmp_vars.c_tracker_list.append('<tr data-uid="' + Tracker.uid + '">'
                        + '<td><div class="tracker_icon" ' + icon + '></div></td>'
                        + '<td><a href="' + Tracker.root_url + '" target="_blank">' + Tracker.name + '</a>'
                        + '</td>'
                        + '<td class="desc">' + (('about' in Tracker) ? Tracker.about : '') + '</td>'
                        + '<td class="action"><input type="button" name="edit_ctr" value="' + _lang.settings[52] + '" data-lang="52"><input type="button" name="rm_ctr" value="' + _lang.settings[53] + '" data-lang="53"></td>'
                        + '</tr>');
            }
        }
    };
    var getBackup = function() {
        var st = JSON.parse(JSON.stringify(localStorage));
        delete st['explorerCache'];
        delete st['topCache'];
        delete st['length'];
        delete st['search_history'];
        delete st['kinopoiskDeskList'];
        delete st['favoritesDeskList'];
        $('textarea[name="backup"]').val(JSON.stringify(st));
        return JSON.stringify(st);
    };
    var settingsRestore = function(text) {
        try {
            var rst = JSON.parse(text);
            localStorage.clear();
            for (var key in rst)
            {
                var value = rst[key];
                if (value === undefined || value === null || key === 'length')
                    continue;
                localStorage[key] = value;
            }
            write_language();
            set_place_holder();
            load_costume_torrents();
            sandbox_trackerProfiles = JSON.parse(GetSettings('trackerProfiles') || "[]");
            if (sandbox_trackerProfiles.length === 0) {
                document.location.reload();
                return;
            }
            updateProfileList(0);
        } catch (err) {
            alert(_lang.str33 + "\n" + err);
        }
    };
    var makePartedBackup = function() {
        var chank_name = "bk_ch_";
        var back = getBackup();
        var full_len = back.length;
        var chank_len = 1024 - (chank_name + "000").length - 1;
        var number_of_part = Math.round(full_len / chank_len);
        if (number_of_part >= 512 || full_len >= 102400) {
            console.log("Can't save backup, very big size!");
            return undefined;
        }
        var req_exp = new RegExp(".{1," + chank_len + "}", "g");
        back = 'LZ' + LZString.compressToBase64(back);
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
    var getPartedBackup = function(test) {
        chrome.storage.sync.get(function(data) {
            var chank_name = "bk_ch_";
            var clear_broken = function(chank_name, obj, len) {
                var l = 0;
                $.each(obj, function(k) {
                    if (k.substr(0, 6) === chank_name) {
                        if ((k.substr(6) !== "inf") && k.substr(6) > len) {
                            chrome.storage.sync.remove(k);
                            l++;
                        }
                    }
                });
                if (l > 0) {
                    console.log("Removed garbage: ", l);
                }
            };
            var inf = 0;
            if (chank_name + "inf" in data) {
                inf = data[chank_name + "inf"];
            } else {
                $('input[name="get_from_cloud"]')[0].disabled = true;
                console.log("Backup not found!");
                clear_broken(chank_name, data, inf);
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
            clear_broken(chank_name, data, inf);
            if (broken) {
                $('input[name="get_from_cloud"]')[0].disabled = true;
                return null;
            }

            if (back.substr(0, 2) === 'LZ') {
                back = LZString.decompressFromBase64(back.substr(2));
            }
            if (test === undefined) {
                $('textarea[name="restore"]').val(back);
            }
        });
    };
    var saveCurrentProfile = function() {
        var pid = currentProfile.id;
        var checked_torrents = tmp_vars.tracker_list.find('input[name="tracker"]:checked');
        var checked_torrents_length = checked_torrents.length;
        var TrackerList = [];
        for (var i = 0; i < checked_torrents_length; i++) {
            var item = checked_torrents.eq(i).closest('tr');
            var id = item.attr('data-id');
            var fn = tracker[id].filename;
            var obj = {
                'n': fn,
                'e': 1
            };
            if ('uid' in tracker[id]) {
                obj['uid'] = tracker[id].uid;
            }
            TrackerList.push(obj);
        }
        sandbox_trackerProfiles[pid].Trackers = TrackerList;
    };
    var updateProfileList = function(id) {
        var sel = $('select[name=tr_lists]');
        sel.empty();
        var sel_id = (id === undefined) ? currentProfile.id : id;
        $.each(sandbox_trackerProfiles, function(k, v) {
            sel.append('<option value="' + k + '" ' + ((k === sel_id) ? 'selected' : '') + '>' + v.Title + '</option>');
        });
        if (sandbox_trackerProfiles.length < 2) {
            $('input[name=rm_list]').attr('disabled', 'disabled');
        } else {
            $('input[name=rm_list]').removeAttr('disabled');
        }
        if (id !== undefined) {
            currentProfile = sandbox_trackerProfiles[id];
            currentProfile.id = id;
            SetSettings('defProfile', currentProfile.id);
            engine.loadProfile(id);
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
        SetSettings('trackerProfiles', JSON.stringify(sandbox_trackerProfiles));
        if (navigator.userAgent.search(/Chrome/) !== -1) {
            var bgp = chrome.extension.getBackgroundPage();
            bgp.bg.update_context_menu();
            if (bgp._type_ext) {
                SetSettings('search_popup', ($('input[name="search_popup"]').is(':checked')) ? 1 : 0);
                bgp.update_btn();
            }
            SetSettings('allow_favorites_sync', ($('input[name="allow_favorites_sync"]').is(':checked')) ? 1 : 0);
        }
        var s = (document.URL).replace(/(.*)options.html/, '');
        if (s.length > 0) {
            var s = s.replace(/^#back=(.*)/, '$1');
            window.location = 'index.html#s=' + s;
        } else {
            set_place_holder();
            sandbox_trackerProfiles = JSON.parse(GetSettings('trackerProfiles'));
            updateProfileList(currentProfile.id);
        }
    };
    return {
        begin: function() {
            write_language();
            tmp_vars.tracker_list = $('table.tr_table tbody');
            tmp_vars.c_tracker_list = $('table.c_table tbody');
            tmp_vars.tracker_list.disableSelection();
            $('ul.menu').on('click', 'a', function(e) {
                e.preventDefault();
                $('ul.menu').find('a.active').removeClass('active');
                $(this).addClass('active');
                $('body').find('div.page.active').removeClass('active');
                $('body').find('div.' + $(this).data('page')).addClass('active');
            });
            if (navigator.userAgent.search(/Opera/) !== -1 || navigator.userAgent.search(/Firefox/) !== -1) {
                //opera and firefox
                $('input[name="add_in_omnibox"]').parents().eq(1).hide();
                $('input[name="search_popup"]').parents().eq(1).hide();
                $('input[name="google_analytics"]').parents().eq(1).hide();
                $('input[name="allow_favorites_sync"]').parents().eq(1).hide();
                $('input[name="clear_cloud_btn"]').hide();
            } else
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
                        if (obj === undefined) {
                            return;
                        }
                        chrome.storage.sync.set(obj);
                        getPartedBackup(1);

                        $(this).val(_lang.settings[70]);
                        setTimeout(function() {
                            $('input[name="save_in_cloud"]').val(_lang.settings[68]);
                        }, 3000);
                        $('input[name="get_from_cloud"]').get(0).disabled = false;
                    });
                    $('input[name="get_from_cloud"]').on('click', function() {
                        getPartedBackup();
                    });
                    chrome.storage.sync.get("bk_ch_inf",
                            function(val) {
                                if ("bk_ch_inf" in val === false) {
                                    $('input[name="get_from_cloud"]').eq(0).get(0).disabled = true;
                                }
                            }
                    );
                }
            } else {
                $('input[name="clear_cloud"]').css('display', 'none');
                $('input[name="get_from_cloud"]').css('display', 'none');
                $('input[name="save_in_cloud"]').css('display', 'none');
            }
            tmp_vars.tracker_list.sortable({placeholder: "ui-state-highlight",
                stop: function() {
                    saveCurrentProfile();
                }
            });
            set_place_holder();
            load_costume_torrents();
            updateProfileList(parseInt(GetSettings('defProfile') || 0));

            //backup >>>>>>>>>>>>>>>>>>
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
                settingsRestore($(this).parent().children('textarea').val());
                $('textarea[name="backup"]').val('');
            });
            //<<<<<<<<<<<<<<<<<<
            //torrent-list head
            $('select[name="language"]').on('change', function() {
                write_language($(this).val());
            });
            $('table.tr_table').find('th').eq(3).children('a').eq(0).on("click", function(event) {
                event.preventDefault();
                $('table.tr_table').children('tbody').find('input[type="checkbox"]').prop('checked', 'checked');
                saveCurrentProfile();
            });
            $('table.tr_table').find('th').eq(3).children('a').eq(1).on("click", function(event) {
                event.preventDefault();
                $('table.tr_table').children('tbody').find('input[type="checkbox"]').removeAttr('checked');
                saveCurrentProfile();
            });
            $('table.tr_table').find('th').eq(3).children('a').eq(2).on("click", function(event) {
                event.preventDefault();
                $('table.tr_table').children('tbody').find('input[type="checkbox"]').removeAttr('checked');
                var Trackers = engine.defaultList;
                var l = Trackers.length;
                var tb = tmp_vars.tracker_list;
                for (var i = 0; i < l; i++) {
                    if (Trackers[i].e) {
                        tb.children('tr[data-name="' + Trackers[i].filename + '"]').find('input[type="checkbox"]').get(0).checked = true;
                    }
                }
                saveCurrentProfile();
            });
            //<<<<<<<<<<<<<<<<<<<<<<<<
            tmp_vars.tracker_list.on('change', 'td.status input', function() {
                saveCurrentProfile();
            });
            $('select[name=tr_lists]').on('change', function() {
                tmp_vars.tracker_list.parent().css('min-height', tmp_vars.tracker_list.height() + 'px');
                var id = parseInt($(this).val());
                currentProfile = sandbox_trackerProfiles[id];
                currentProfile.id = id;
                engine.loadProfile(id);
            });
            $('input[name=add_list]').on('click', function() {
                var input = $(this).closest('ul').find('input[name=list_name]');
                var name = input.val();
                if (name.length === 0)
                    return;
                input.val('');
                sandbox_trackerProfiles.push({
                    Trackers: null,
                    Title: name
                });
                updateProfileList(sandbox_trackerProfiles.length - 1);
            });
            $('input[name=rm_list]').on('click', function() {
                sandbox_trackerProfiles.splice(currentProfile.id, 1);
                var id = sandbox_trackerProfiles.length - 1;
                updateProfileList(id);
            });
            $('input[name="save"]').on('click', function() {
                saveAll();
                $('div.page.save > div.status').css('background', 'url(images/loading.gif) center center no-repeat');
                setTimeout(function() {
                    $('div.page.save > div.status').css('background', 'none');
                }, 500);
            });
            //all about costume code
            $('input[name=add_code]').on('click', function() {
                $('input[name=ctr_add]').parent().show();
                $('input[name=ctr_edit]').parent().hide();
                $('div.popup').toggle();
            });
            $('input[name=close_popup]').on('click', function() {
                $('textarea[name=code]').val('');
                $('div.popup').hide();
            });
            $('input[name=ctr_add]').on('click', function() {
                var str_code = $('textarea[name=code]').val();
                var costume_tr = JSON.parse(GetSettings('costume_tr') || "[]");
                var code = null;
                try {
                    code = JSON.parse(str_code);
                } catch (e) {
                    alert(_lang.settings[55] + "\n" + e);
                    return;
                }
                if ('uid' in code === false) {
                    alert(_lang.settings[56]);
                    return;
                }
                var ex = GetSettings('ct_' + code.uid) || 0;
                var ex_in_list = costume_tr.indexOf(code.uid) !== -1;
                if (ex && ex_in_list) {
                    alert(_lang.settings[54]);
                    return;
                } else {
                    SetSettings('ct_' + code.uid, str_code);
                    if (ex_in_list === false) {
                        costume_tr.push(code.uid);
                        SetSettings('costume_tr', JSON.stringify(costume_tr));
                    }
                }
                load_costume_torrents();
                $('select[name=tr_lists]').trigger('change');
                $('div.popup').find('input[name=close_popup]').trigger('click');
            });
            $('input[name=ctr_edit]').on('click', function() {
                var popup = $('div.popup');
                var uid = popup.attr('data-uid');
                popup.removeAttr('data-uid');
                var str_code = $('textarea[name=code]').val();
                var code = null;
                try {
                    code = JSON.parse(str_code);
                } catch (e) {
                    alert(_lang.settings[55] + "\n" + e);
                    return;
                }
                if (uid !== code.uid) {
                    code.uid = parseInt(uid);
                }
                SetSettings('ct_' + code.uid, JSON.stringify(code));
                load_costume_torrents();
                $('select[name=tr_lists]').trigger('change');
                $('div.popup').find('input[name=close_popup]').trigger('click');
            });
            $('table.c_table').on('click', 'input[name=edit_ctr]', function() {
                $('input[name=ctr_edit]').parent().show();
                $('input[name=ctr_add]').parent().hide();
                var uid = $(this).closest('tr').attr('data-uid');
                var code = GetSettings('ct_' + uid) || '';
                $('textarea[name=code]').val(code);
                var popup = $('div.popup');
                popup.show();
                popup.attr('data-uid', uid);
            });
            $('table.c_table').on('click', 'input[name=rm_ctr]', function() {
                var uid = parseInt($(this).closest('tr').attr('data-uid'));
                var costume_tr = JSON.parse(GetSettings('costume_tr') || "[]");
                var index = $.inArray(uid, costume_tr);
                if (index === -1) {
                    return;
                }
                costume_tr.splice(index, 1);
                SetSettings('ct_' + uid, null);
                SetSettings('costume_tr', JSON.stringify(costume_tr));
                load_costume_torrents();
                $('select[name=tr_lists]').trigger('change');
            });
            $(window).on('resize', function() {
                $('div.popup').css('left', ($('html').width() / 2 - $('div.popup').width() / 2) + 'px');
            }).trigger('resize');
            //<<<<<<<<<<<<<<<<<
        },
        addTrackerInList: addTrackerInList
    };
}();
var view = function() {
    return {
        ClearTrackerList: function() {
            $('table.tr_table tbody').empty();
        },
        addTrackerInList: options.addTrackerInList
    };
}();
$(function() {
    options.begin();
});