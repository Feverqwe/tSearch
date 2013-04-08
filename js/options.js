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
        allow_favorites_sync: {"v": 0, "t": "checkbox"}
    }
    var trackerProfiles = null;
    var oldProfileID = 0;
    var defProfile = 0;
    var settings = {};
    var settings_load = function() {
        $.each(def_settings, function(k, v) {
            settings[k] = (GetSettings(k) !== undefined) ? parseInt(GetSettings(k)) : v.v;
        });
        trackerProfiles = (GetSettings('trackerProfiles') !== undefined) ? JSON.parse(GetSettings('trackerProfiles')) : null;
        defProfile = oldProfileID = (GetSettings('defProfile') !== undefined) ? GetSettings('defProfile') : 0;
    };
    settings_load();
    var set_place_holder = function() {
        $.each(def_settings, function(k, v) {
            var set = settings;
            if (v.t == "text" || v.t == "number" || v.t == "password") {
                $('input[name="' + k + '"]').removeAttr("value");
                if (k in set && set[k] != v.v) {
                    $('input[name="' + k + '"]').attr("value", set[k]);
                }
                if (v.v != null) {
                    $('input[name="' + k + '"]').attr("placeholder", v.v);
                }
            }
            if (v.t == "checkbox") {
                if (k in set) {
                    $('input[name="' + k + '"]').eq(0)[0].checked = (set[k]) ? 1 : 0;
                } else {
                    $('input[name="' + k + '"]').eq(0)[0].checked = (v.v) ? 1 : 0;
                }
            }
            if (v.t == "radio") {
                if (k in set) {
                    $('input[name="' + k + '"][value="' + v.v + '"]').eq(0)[0].checked = true;
                }
            }
            if (v.t == "array") {
                if (k in set) {

                }
            }
        });
    };






    var addTrackerInList = function(i) {
        var filename = tracker[i].filename;

        var id = $('select[name=tr_lists]').val();
        if (trackerProfiles == null)
            trackerProfiles = [];
        if (trackerProfiles[id] == null) {
            trackerProfiles[id] = {
                Trackers: null,
                Title: _lang.label_def_profile //set lang var here
            }
        }
        var t = trackerProfiles[id].Trackers;
        if (t == null)
            t = engine.defaultList;
        var enable = false;
        var tc = t.length;
        for (var n = 0; n < tc; n++) {
            if (t[n].n == filename)
                enable = t[n].e;
        }
        var flags = '';
        if (!tracker[i].flags.rs)
            flags += '<div class="cirilic" title="' + _lang.flag.cirilic + '"></div>';
        if (tracker[i].flags.a)
            flags += '<div class="auth" title="' + _lang.flag.auth + '"></div>';
        if (tracker[i].flags.l)
            flags += '<div class="rus" title="' + _lang.flag.rus + '"></div>';
        if (flags.length > 0)
            flags = '<div class="icons">' + flags + '</div>';
        $('table.tr_table tbody').append('<tr data-name="' + filename + '"' + '>'
                + '<td><img src="' + tracker[i].icon + '"/></td>'
                + '<td><a href="' + tracker[i].url + '" target="_blank">' + tracker[i].name + '</a>'
                + '</td>'
                + '<td class="desc">' + flags
                + $('<span>' + tracker[i].about + '</span>').text() + '</td>'
                + '<td class="status"><input type="checkbox" name="tracker" ' + ((enable) ? 'checked' : '') + '></td>'
                + '</tr>');
    }
    var saveCurrentProfile = function() {
        var tr = $('table.tr_table tbody').children('tr');
        var trc = tr.length;
        var id = oldProfileID;
        if (trackerProfiles == null || trackerProfiles[id] == null) {
            return 1;
        }
        var internalTrackers = [];
        for (var i = 0; i < trc; i++) {
            var fn = tr.eq(i).attr('data-name');
            var inp = tr.eq(i).children('td.status').children('input');
            internalTrackers[internalTrackers.length] = {
                'n': fn,
                'e': (inp.is(':checked')) ? 1 : 0
            };
        }
        trackerProfiles[id].Trackers = internalTrackers;
        return 1;
    }
    var LoadProfiles = function() {
        var sel = $('select[name=tr_lists]');
        var arr = engine.getProfileList();
        $.each(arr, function(k, v) {
            sel.append('<option value="' + k + '" ' + ((k == defProfile) ? 'selected' : '') + '>' + v + '</option>');
        });
        if (arr.length < 2) {
            $('input[name=rmbtn]').attr('disabled', 'disabled');
        }
    }
    var updateProfileList = function() {
        var sel = $('select[name=tr_lists]');
        sel.empty();
        $.each(trackerProfiles, function(k, v) {
            sel.append('<option value="' + k + '" ' + ((k == oldProfileID) ? 'selected' : '') + '>' + v.Title + '</option>');
        });
        if (trackerProfiles.length < 2)
            $('input[name=rm_list]').attr('disabled', 'disabled')
        else
            $('input[name=rm_list]').ramoveAttr('disabled');
    }




    var saveAll = function() {
        localStorage['lang'] = $('select[name="language"]').val();
        var def = _engine.getDefSettings();
        $.each(def, function(key, value) {
            if (value.t == "text") {
                var val = $('input[name="' + key + '"]').val();
                if (val.length <= 0) {
                    val = $('input[name="' + key + '"]').attr('placeholder');
                }
                localStorage[key] = val;
            } else
            if (value.t == "password") {
                var val = $('input[name="' + key + '"]').val();
                localStorage[key] = val;
            } else
            if (value.t == "checkbox") {
                var val = ($('input[name="' + key + '"]').eq(0)[0].checked) ? 1 : 0;
                localStorage[key] = val;
            } else
            if (value.t == "number") {
                var val = $('input[name="' + key + '"]').val();
                if (val.length <= 0) {
                    val = $('input[name="' + key + '"]').attr('placeholder');
                }
                if (key == "bg_update_interval" || key == "notify_visbl_interval" || key == "mgr_update_interval") {
                    val = val * 1000;
                }
                localStorage[key] = val;
            }
        });
    };
    var getBackup = function() {
        var st = JSON.parse(JSON.stringify(localStorage));
        delete st['explorerCache'];
        delete st['topCache'];
        delete st['length'];
        delete st['search_history'];
        $('textarea[name="backup"]').val(JSON.stringify(st));
    }
    var stngsRestore = function(text) {
        try {
            var rst = JSON.parse(text);
            localStorage.clear();
            for (var key in rst)
            {
                var value = rst[key];
                if (value == undefined || key == 'length')
                    continue;
                localStorage[key] = value;
            }
            write_language();
            set_place_holder();
            //need add save btn & reload settings
        } catch (err) {
            alert(lang_arr.str33 + "\n" + err);
        }
    };
    var make_bakup_form = function() {
        $('div.backup_form div').children('a.backup_tab').click(function(e) {
            e.preventDefault();
            $(this).parents().eq(1).children('div.restore').slideUp('fast');
            $(this).parent().children('a.restore_tab').removeClass('active');
            $(this).parents().eq(1).children('div.backup').slideDown('fast');
            $(this).parent().children('a.backup_tab').addClass('active');
            getBackup();
        });
        $('div.backup_form div').children('a.restore_tab').click(function(e) {
            e.preventDefault();
            $(this).parents().eq(1).children('div.backup').slideUp('fast');
            $(this).parent().children('a.backup_tab').removeClass('active');
            $(this).parents().eq(1).children('div.restore').slideDown('fast');
            $(this).parent().children('a.restore_tab').addClass('active');
        });
        $('div.backup').find('input[name=backup]').click(function(e) {
            e.preventDefault();
            getBackup();
        });
        $('div.restore').find('input[name=restore]').click(function(e) {
            e.preventDefault();
            stngsRestore($(this).parent().children('textarea').val());
            $('textarea[name="backup"]').empty();
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
            if (el.length == 0)
                return true;
            var t = el.prop("tagName");
            if (t == "A" || t == "LEGEND" || t == "SPAN" || t == "LI" || t == "TH") {
                el.text(v);
            } else
            if (t == "INPUT") {
                el.val(v);
            } else
                console.log(t);
        });
    };
    return {
        addTrackerInList: function(a) {
            addTrackerInList(a);
        },
        begin: function() {
            write_language();
            $('select[name="language"]').on('change', function() {
                write_language($(this).val());
            });
            LoadProfiles();
            $('select[name=tr_lists]').on('change', function() {
                if (saveCurrentProfile()) {
                    oldProfileID = $(this).val();
                    engine.loadProfile(oldProfileID);
                }
            });
            $('input[name=add_list]').on('click', function() {
                var name = $(this).parent().children('input[name=list_name]').val();
                if (name.length < 1)
                    return;
                $(this).parent().children('input[name=list_name]').val('');
                trackerProfiles[trackerProfiles.length] = {
                    Trackers: null,
                    Title: name
                };
                if (saveCurrentProfile()) {
                    oldProfileID = trackerProfiles.length - 1;
                    engine.loadProfile(oldProfileID);
                }
                updateProfileList();
            });
            $('input[name=rm_list]').on('click', function() {
                trackerProfiles.splice(oldProfileID, 1);
                oldProfileID = defProfile;
                engine.loadProfile(oldProfileID);
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
            });
            if (chrome && chrome.storage) {
                $('input[name="save_in_cloud"]').on('click', function() {
                    chrome.storage.sync.clear();
                });
            } else {
                $('input[name="clear_cloud"]').css('display', 'none');
            }
            if (navigator.userAgent.search(/Firefox/) != -1) {
                //firefox
                $('div.page.backup').hide();
                $('a[data-page=backup]').hide();
                $('input[name="context_menu"]').parents().eq(1).hide();
                $('input[name="backup_form"]').parents().eq(1).hide();
            } else {
                make_bakup_form();
            }
            if (navigator.userAgent.search(/Opera/) != -1) {
                //opera
                $('input[name="add_in_omnibox"]').parents().eq(1).hide();
                $('input[name="search_popup"]').parents().eq(1).hide();
                $('input[name="google_analytics"]').parents().eq(1).hide();
                $('input[name="allow_favorites_sync"]').parents().eq(1).hide();
                $('input[name="clear_cloud_btn"]').hide();
            }
            if (navigator.userAgent.search(/Chrome/) != -1) {
                //Chrome
                var bgp = chrome.extension.getBackgroundPage();
                if (!bgp._type_ext)
                    $('input[name="search_popup"]').parents().eq(1).hide();
            }
            set_place_holder();
        }
    };
}();
var view = function() {
    return {
        ClearTrackerList: function() {
            $('table.tr_table tbody').empty();
        },
        addTrackerInList: function(i) {
            options.addTrackerInList(i);
        }
    }
}();
$(function() {
    options.begin();
});