var options = function() {
    var isFF = window.Application !== undefined && Application.name === "Firefox";
    var isChromeum = (window.chrome !== undefined);
    var dom_cache = {};
    var var_cache = {
        window_scroll_timer: undefined
    };
    var loadSettings = function() {
        var settings = {};
        $.each(engine.def_settings, function(type, attr) {
            if (attr.t === 'checkbox' || attr.t === 'radio' || attr.t === 'number') {
                settings[type] = parseInt(GetSettings(type) || attr.v);
                if (isNaN(settings[type])) {
                    settings[type] = attr.v;
                }
            } else {
                settings[type] = GetSettings(type) || attr.v;
            }
        });
        return settings;
    };
    var settings = loadSettings();
    var profile = $.extend(true,{},engine.getProfileList());
    //profile = {profile_name:{tracker_name:0, tracker_name: 1}}
    var current_profile = GetSettings('currentProfile');
    var set_place_holder = function() {
        $.each(engine.def_settings, function(k, v) {
            if (settings[k] === undefined) {
                settings[k] = v.v;
            }
            if (v.t === "text" || v.t === "number" || v.t === "password") {
                var dom_obj = $('input[name="' + k + '"]');
                dom_obj.removeAttr("value");
                if (settings[k] !== v.v) {
                    dom_obj.attr("value", settings[k]);
                }
                if (v.v !== undefined) {
                    dom_obj.attr("placeholder", v.v);
                }
            } else
            if (v.t === "checkbox") {
                $('input[name="' + k + '"]').prop('checked', settings[k]);
            } else
            if (v.t === "radio") {
                $('input[name="' + k + '"][value="' + settings[k] + '"]').prop('checked', true);
            }
        });
    };
    var write_language = function(language) {
        var selected = (language !== undefined) ? 1 : 0;
        if (language === undefined) {
            language = GetSettings('lang');
        }
        if (language === undefined) {
            language = 'en';
            if (isChromeum && chrome.i18n && chrome.i18n.getMessage("lang") === 'ru') {
                language = 'ru';
            }
        }
        window._lang = get_lang(language);
        dom_cache.select_language.val(language);
        $.each(_lang.settings, function(k, v) {
            var el = $('[data-lang=' + k + ']');
            var el_len = el.length;
            if (el_len === 0) {
                return true;
            }
            for (var i = 0; i < el_len; i++) {
                var obj = el.eq(i);
                var t = obj.prop("tagName");
                if (t === "A" || t === "LEGEND" || t === "SPAN" || t === "LI" || t === "TH" || t === "TD") {
                    obj.text(v);
                } else
                if (t === "INPUT") {
                    obj.val(v);
                } else {
                    console.log(t, v);
                }
            }
        });
        dom_cache.exp_in_cinima.text(_lang.exp_in_cinima);
        dom_cache.exp_films.text(_lang.exp_films);
        dom_cache.exp_serials.text(_lang.exp_serials);
        dom_cache.exp_imdb_in_cinima.text(_lang.exp_imdb_in_cinima);
        dom_cache.exp_imdb_films.text(_lang.exp_imdb_films);
        dom_cache.exp_imdb_serials.text(_lang.exp_imdb_serials);
        dom_cache.exp_games_new.text(_lang.exp_games_new);
        dom_cache.exp_games_best.text(_lang.exp_games_best);
        dom_cache.exp_games_all.text(_lang.exp_games_all);
        if (_lang.t !== "ru") {
            dom_cache.use_english_postername.parents().eq(1).hide();
        } else {
            dom_cache.use_english_postername.parents().eq(1).show();
        }
        if (selected) {
            dom_cache.select_profileList.trigger("change");
        }
    };
    var saveAll = function() {
        SetSettings('lang', dom_cache.select_language.val());
        $.each(engine.def_settings, function(key, value) {
            if (value.t === "text" || value.t === "number") {
                var val = $('input[name="' + key + '"]').val();
                if (val.length === 0) {
                    val = value.v;
                }
                if (value.t === "number") {
                    val = parseInt(val);
                }
                settings[key] = val;
                SetSettings(key, val);
            } else
            if (value.t === "password") {
                settings[key] = $('input[name="' + key + '"]').val();
                SetSettings(key, settings[key]);
            } else
            if (value.t === "checkbox") {
                var val = ($('input[name="' + key + '"]').prop('checked')) ? 1 : 0;
                settings[key] = val;
                SetSettings(key, val);
            } else
            if (value.t === "radio") {
                var val = $('input[name="' + key + '"]:checked').val();
                settings[key] = val;
                SetSettings(key, val);
            }
        });
        saveCurrentProfile();
        SetSettings('profileList', JSON.stringify(profile));
        SetSettings('currentProfile', current_profile);
        if (isChromeum && chrome.extension) {
            //Chrome extension
            var bgp = chrome.extension.getBackgroundPage();
            bgp.bg.update_context_menu();
            if (bgp._type_ext) {
                bgp.update_btn();
            }
        }
        var fromIndex = (document.URL).replace(/.*options.html/, '');
        if (fromIndex.length > 0) {
            window.location = 'index.html';
        }
        set_place_holder();
    };
    var load_costume_torrents = function() {
        dom_cache.custom_list.get(0).textContent = '';
        var customList = JSON.parse(GetSettings('costume_tr') || "[]");
        if (customList.length === 0) {
            dom_cache.custom_list.append($('<td>', {colspan: 4, 'class': 'notorrent', 'data-lang': 51, text: _lang.settings[51]}));
            return;
        }
        var rm_list = [];
        var content = [];
        for (var i = 0, id; id = customList[i]; i++) {
            var json = GetSettings('ct_' + id);
            if (json === undefined) {
                rm_list.push(id);
                continue;
            }
            var customTr = JSON.parse(GetSettings('ct_' + id));
            if (customTr.uid === undefined) {
                rm_list.push(id);
                continue;
            }
            var tracker_icon = $('<div>', {'class': 'tracker_icon'});
            if (customTr.icon.length === 0) {
                tracker_icon.css({'background-color': '#ccc', 'border-radius': '8px'});
            } else
            if (customTr.icon[0] === '#') {
                tracker_icon.css({'background-color': customTr.icon, 'border-radius': '8px'});
            } else {
                tracker_icon.css('background-image', 'url(' + customTr.icon + ')');
            }
            content.push($('<tr>', {'data-id': customTr.uid}).append(
                $('<td>').append(tracker_icon),
                $('<td>').append($('<a>', {href: customTr.root_url, target: '_blank', text: customTr.name})),
                $('<td>', {'class': 'desc', text: customTr.about || ''}),
                $('<td>', {'class': 'action'}).append(
                    $('<input>', {type: 'button', name: 'edit_ctr', value: _lang.settings[52], 'data-lang': 52}),
                    $('<input>', {type: 'button', name: 'rm_ctr', value: _lang.settings[53], 'data-lang': 53})
                )
            ));
        }
        if (rm_list.length > 0) {
            rm_list.forEach(function(id) {
                customList.splice(customList.indexOf(id),1);
            });
            SetSettings('costume_tr', JSON.stringify(customList));
        }
        dom_cache.custom_list.append( content );
    };
    var saveCurrentProfile = function() {
        var current = current_profile;
        var list = engine.getDefList();
        var $active = dom_cache.tracker_list.find('input:checked');
        var active = {};
        for (var i = 0, len = $active.length; i < len; i++) {
            var id = $active.eq(i).closest('tr').data('id');
            if (id === undefined || list[id] === undefined) {
                continue;
            }
            active[id] = 1;
        }
        profile[current] = active;
    };
    var writeProfileList = function(list) {
        dom_cache.select_profileList.get(0).textContent = '';
        var content = [];
        $.each(list, function(text){
            content.push( $('<option>', {text: text, value: text}) );
        });
        if (content.length === 0) {
            profile[_lang.label_def_profile] = undefined;
            writeProfileList(profile);
            return;
        }
        dom_cache.select_profileList.append(content);
    };
    var loadProfile = function(current) {
        if (current === undefined) {
            current = GetSettings('currentProfile');
        }
        if (profile.hasOwnProperty(current)) {
            if (profile[current] === undefined) {
                profile[current] = engine.getDefList();
            }
        } else {
            current = undefined;
            $.each(profile, function(a){
                current = a;
                return 0;
            });
            if (current === undefined) {
                console.warn('can\'t found profile');
                return;
            }
            if (profile[current] === undefined) {
                profile[current] = engine.getDefList();
            }
        }
        current_profile = current;
        dom_cache.select_profileList.children('option[value="'+current+'"]').prop('selected', true);
        dom_cache.tracker_list.children('tr.checked').removeClass('checked').find('input').removeAttr('checked');
        var content = [];
        $.each(profile[current], function(id, status){
            if (status === 0) {
                delete profile[current][id];
                return 1;
            }
            var $item = dom_cache.tracker_list.children('tr[data-id="'+id+'"]').addClass('checked');
            var checkbox = $item.children('td.status').children('input');
            if (checkbox.length === 0) {
                delete profile[current][id];
                return 1;
            }
            checkbox.prop('checked', true);
            content.push($item);
        });
        dom_cache.tracker_list.prepend(content);
    };
    var sortTable = function() {
        var dom_list = dom_cache.tracker_list.children('tr');
        var content = [];
        for (var i = 0, len = dom_list.length; i < len; i++) {
            var item = dom_list.eq(i);
            var state = item.children('td.status').children('input').prop('checked');
            if (state === false) {
                continue;
            }
            content.push(item);
        }
        dom_cache.tracker_list.prepend(content);
    };
    var writeTrackerList = function() {
        dom_cache.tracker_list.get(0).textContent = '';
        var content = [];
        $.each(torrent_lib, function(id, tracker) {
            var flags = [];
            if (!tracker.flags.rs) {
                flags.push($('<div>', {'class': 'cirilic', title: _lang.flag.cirilic}));
            }
            if (tracker.flags.a) {
                flags.push($('<div>', {'class': 'auth', title: _lang.flag.auth}));
            }
            if (tracker.flags.l) {
                flags.push($('<div>', {'class': 'rus', title: _lang.flag.rus}));
            }
            if (flags.length > 0) {
                flags = $('<div>', {'class': 'icons'}).append(flags);
            }
            var tracker_icon = $('<div>', {'class': 'tracker_icon'});
            if (tracker.icon.length === 0) {
                tracker_icon.css({'background-color': '#ccc', 'border-radius': '8px'});
            } else
            if (tracker.icon[0] === '#') {
                tracker_icon.css({'background-color': tracker.icon, 'border-radius': '8px'});
            } else {
                tracker_icon.css('background-image', 'url(' + tracker.icon + ')');
            }
            content.push( $('<tr>',{'data-id': id, 'class':((tracker.uid !== undefined)?'custom':'')}).append(
                $('<td>').append(tracker_icon),
                $('<td>').append(
                    $('<a>', {href: tracker.url, target: '_blank', text: tracker.name})
                ),
                $('<td>', {'class': 'desc'}).append(
                    flags,
                    $('<span>', {text: tracker.about})
                ),
                $('<td>', {'class': 'status'}).append(
                    $('<input>', {type: 'checkbox'})
                )
            ));
        });
        dom_cache.tracker_list.append(content);
    };
    var getBackup = function() {
        var data = $.extend({},localStorage);
        delete data.exp_cache_kp_favorites;
        delete data.exp_cache_kp_in_cinema;
        delete data.exp_cache_kp_popular;
        delete data.exp_cache_kp_serials;
        delete data.exp_cache_imdb_in_cinema;
        delete data.exp_cache_imdb_popular;
        delete data.exp_cache_imdb_serials;
        delete data.exp_cache_gg_games_top;
        delete data.exp_cache_gg_games_new;
        delete data.topList;
        delete data.click_history;
        delete data.history;
        delete data.qualityBoxCache;
        delete data.qualityCache;
        /*
        delete st['explorerCache'];
        delete st['topCache'];
        delete st['search_history'];
        delete st['kinopoiskDeskList'];
        delete st['favoritesDeskList'];
        */
        var json = JSON.stringify(data);
        dom_cache.textarea_backup.val(json);
        return json;
    };
    var settingsRestore = function(text) {
        try {
            var data = JSON.parse(text);
        } catch (err) {
            alert(_lang.str33 + "\n" + err);
            return;
        }
        var click_history = localStorage.click_history;
        var search_history = localStorage.history;
        localStorage.clear();
        if (search_history !== undefined) {
            localStorage.history = history;
        }
        if (click_history !== undefined) {
            localStorage.click_history = click_history;
        }
        for (var item in data) {
            if (data.hasOwnProperty(item) === false) {
                continue;
            }
            var value = data[item];
            if (value === undefined) {
                continue;
            }
            localStorage[item] = value;
        }
        window.location.reload();
    };
    var checkTrList = function(list) {
        dom_cache.tracker_list.children('tr.checked').removeClass('checked').find('input').removeAttr('checked');
        var content = [];
        $.each(list, function(id, state){
            if (state !== 1) {
                return;
            }
            var $item = dom_cache.tracker_list.children('tr[data-id="' + id + '"]')
            $item.addClass('checked').children('td.status').children('input').prop('checked', true);
            content.push($item);
        });
        dom_cache.tracker_list.prepend(content);
    };
    var savePartedBackup = function(chank, content, cb) {
        var content_len = content.length;
        var chank_len = 1024 - (chank + "000").length;
        var number_of_part = Math.floor(content_len / chank_len);
        if (number_of_part >= 512 || content_len >= 102400) {
            console.log('Can\'t save item', chank,', very big size!');
            return;
        }
        var req_exp = new RegExp('.{1,' + chank_len + '}', 'g');
        content = 'LZ' + LZString.compressToBase64(content);
        var arr = content.match(req_exp);
        var arr_l = arr.length;
        var obj = {};
        for (var i = 0; i < arr_l; i++) {
            obj[chank + i] = arr[i];
        }
        obj[chank + "inf"] = arr_l;
        obj[chank + arr_l] = "END";
        chrome.storage.sync.set(obj, cb);
    };
    var clear_broken = function(chank, obj, len) {
        var chank_len = chank.length;
        var rm_list = [];
        $.each(obj, function(k) {
            if (k.substr(0, chank_len) !== chank) {
                return 1;
            }
            if (len === undefined) {
                rm_list.push(k);
                return 1;
            }
            var index = k.substr(chank_len);
            if (index !== "inf" && index > len) {
                rm_list.push(k);
            }
        });
        if (rm_list.length > 0) {
            chrome.storage.sync.remove(rm_list);
            console.log("Garbage: ", rm_list.length);
        }
    };
    var getPartedBackup = function(chank, cb) {
        chrome.storage.sync.get(function(data) {
            var content_len = data[chank + 'inf'];
            if (content_len === undefined) {
                console.log("Item not found!", chank);
                clear_broken(chank, data, content_len);
                cb(undefined);
                return;
            }
            var isBroken = 0;
            var content = '';
            for (var i = 0; i < content_len; i++) {
                var item = data[chank + i];
                if (item === undefined) {
                    console.log("Item is broken!", chank, "Chank", i);
                    isBroken = 1;
                    break;
                }
                content += item;
            }
            if (data[chank + content_len] !== "END") {
                isBroken = 1;
            }
            if (isBroken === 1) {
                clear_broken(chank, data, undefined);
            }
            if (isBroken) {
                cb(undefined);
                return;
            }
            if (content.substr(0, 2) === 'LZ') {
                content = LZString.decompressFromBase64(content.substr(2));
            }
            cb(content);
        });
    };
    return {
        begin: function() {
            engine.loadProfile(undefined);
            dom_cache.window = $(window);
            dom_cache.body = $('body');
            dom_cache.ul_menu = $('ul.menu');
            dom_cache.tracker_list = $('table.tr_table tbody');
            dom_cache.tracker_head = $('table.tr_table thead');
            dom_cache.custom_list = $('table.c_table tbody');
            dom_cache.add_in_omnibox = $('input[name="context_menu"]');
            dom_cache.google_analytics = $('input[name="google_analytics"]');
            dom_cache.allow_favorites_sync = $('input[name="allow_favorites_sync"]');
            dom_cache.clear_cloud_btn = $('input[name="clear_cloud_btn"]');
            dom_cache.clear_cloud = $('input[name="clear_cloud"]');
            dom_cache.search_popup = $('input[name="search_popup"]');
            dom_cache.save_in_cloud = $('input[name="save_in_cloud"]');
            dom_cache.get_from_cloud = $('input[name="get_from_cloud"]');
            dom_cache.select_language = $('select[name="language"]');
            dom_cache.exp_in_cinima = $('[data-lang="exp_in_cinima"]');
            dom_cache.exp_films = $('[data-lang="exp_films"]');
            dom_cache.exp_serials = $('[data-lang="exp_serials"]');
            dom_cache.exp_imdb_in_cinima = $('[data-lang="exp_imdb_in_cinima"]');
            dom_cache.exp_imdb_films = $('[data-lang="exp_imdb_films"]');
            dom_cache.exp_imdb_serials = $('[data-lang="exp_imdb_serials"]');
            dom_cache.exp_games_new = $('[data-lang="exp_games_new"]');
            dom_cache.exp_games_best = $('[data-lang="exp_games_best"]');
            dom_cache.exp_games_all = $('[data-lang="exp_games_all"]');
            dom_cache.use_english_postername = $('input[name="use_english_postername"]');
            dom_cache.select_profileList = $('select[name=tr_lists]');
            dom_cache.backup_form = $('div.backup_form');
            dom_cache.backup_form_links = $('div.backup_form div').eq(0);
            dom_cache.textarea_backup = $('textarea[name="backup"]');
            dom_cache.textarea_restore = $('textarea[name="restore"]');
            dom_cache.profile_input = $('input[name=list_name]');
            dom_cache.profile_btn = $('input[name=add_list]');
            dom_cache.profile_rmlist = $('input[name=rm_list]');
            dom_cache.add_code_btn = $('input[name=add_code]');
            dom_cache.custom_popup = $('div.popup');
            dom_cache.custom_add_btn = $('input[name=ctr_add]');
            dom_cache.custom_edit_btn = $('input[name=ctr_edit]');
            dom_cache.custom_close_btn = $('input[name=close_popup]');
            dom_cache.custom_textarea = dom_cache.custom_popup.children('textarea[name=code]');
            dom_cache.topbtn = $('div.topbtn');
            dom_cache.bottom_save_btn = $('input[name="save"]');
            dom_cache.save_btn = $('li.save_btn');
            dom_cache.save_status = $('div.page.save > div.status');
            dom_cache.html_body = $('html, body');
            write_language();
            dom_cache.ul_menu.on('click', 'a', function(e) {
                e.preventDefault();
                var $this = $(this);
                var page = $this.data('page');
                if (page === undefined) {
                    return;
                }
                dom_cache.ul_menu.find('a.active').removeClass('active');
                $this.addClass('active');
                dom_cache.body.find('div.page.active').removeClass('active');
                dom_cache.body.find('div.' + page).addClass('active');
            });
            if (isFF) {
                //FF
                dom_cache.add_in_omnibox.closest('ul').hide();
            }
            if (!isChromeum) {
                //opera 12 and firefox
                dom_cache.add_in_omnibox.closest('ul').hide();
                dom_cache.google_analytics.closest('ul').hide();
                dom_cache.allow_favorites_sync.closest('ul').hide();
                dom_cache.clear_cloud_btn.hide();
            }
            if (!isChromeum && !isFF) {
                // Opera 12
                dom_cache.search_popup.closest('ul').hide();
            }
            if (isChromeum && chrome.extension !== undefined) {
                //Chromeum extension
                var bgp = chrome.extension.getBackgroundPage();
                if (bgp._type_ext) {
                    return;
                }
                dom_cache.search_popup.closest('ul').hide();
            }
            if (isChromeum && chrome.storage !== undefined) {
                // Chromeum with storage
                dom_cache.clear_cloud.on('click', function() {
                    chrome.storage.sync.clear();
                });
                dom_cache.save_in_cloud.on('click', function() {
                    var _this = this;
                    savePartedBackup("bk_ch_", getBackup(), function(){
                        getPartedBackup("bk_ch_", function(content){
                            if (content === undefined) {
                                dom_cache.get_from_cloud.prop('disabled', true);
                            }
                            $(_this).val(_lang.settings[70]);
                            setTimeout(function() {
                                dom_cache.save_in_cloud.val(_lang.settings[68]);
                            }, 3000);
                            dom_cache.get_from_cloud.prop('disabled', false);
                        });
                    });
                });
                dom_cache.get_from_cloud.on('click', function() {
                    getPartedBackup("bk_ch_", function(content){
                        if (content === undefined) {
                            return;
                        }
                        dom_cache.textarea_restore.val(content);
                    });
                });
                chrome.storage.sync.get("bk_ch_inf", function(val) {
                    if (val.bk_ch_inf !== undefined) {
                        return;
                    }
                    dom_cache.get_from_cloud.prop('disabled', true);
                });
            } else {
                dom_cache.clear_cloud.hide();
                dom_cache.get_from_cloud.hide();
                dom_cache.save_in_cloud.hide();
            }
            dom_cache.tracker_list.sortable({placeholder: "ui-state-highlight",
                stop: function() {
                    saveCurrentProfile();
                }
            });
            set_place_holder();
            load_costume_torrents();
            writeProfileList(profile);
            writeTrackerList();
            loadProfile(current_profile);

            dom_cache.backup_form_links.children('a.backup_tab').on("click", function(e) {
                e.preventDefault();
                dom_cache.backup_form.children('div.restore').slideUp('fast');
                dom_cache.backup_form_links.children('a.restore_tab').removeClass('active');
                dom_cache.backup_form.children('div.backup').slideDown('fast');
                dom_cache.backup_form_links.children('a.backup_tab').addClass('active');
                getBackup();
            });
            dom_cache.backup_form_links.children('a.restore_tab').on("click", function(e) {
                e.preventDefault();
                dom_cache.backup_form.children('div.backup').slideUp('fast');
                dom_cache.backup_form_links.children('a.backup_tab').removeClass('active');
                dom_cache.backup_form.children('div.restore').slideDown('fast');
                dom_cache.backup_form_links.children('a.restore_tab').addClass('active');
            });
            dom_cache.backup_form.children('div.backup').children('input[name=backup]').on("click", function(e) {
                e.preventDefault();
                getBackup();
            });
            dom_cache.backup_form.children('div.restore').children('input[name=restore]').on("click", function(e) {
                e.preventDefault();
                settingsRestore( dom_cache.textarea_restore.val() );
            });
            dom_cache.select_language.on('change', function(e) {
                e.preventDefault();
                write_language($(this).val());
            });
            dom_cache.tracker_head.children('tr').children('th:eq(3)').children('a').eq(0).on("click", function(e) {
                e.preventDefault();
                dom_cache.tracker_list.children('tr').addClass('checked').find('input').prop('checked', true);
                saveCurrentProfile();
            });
            dom_cache.tracker_head.children('tr').children('th:eq(3)').children('a').eq(1).on("click", function(e) {
                e.preventDefault();
                dom_cache.tracker_list.children('tr').removeClass('checked').find('input').removeAttr('checked');
                saveCurrentProfile();
            });
            dom_cache.tracker_head.children('tr').children('th:eq(3)').children('a').eq(2).on("click", function(e) {
                e.preventDefault();
                var list = engine.getDefList();
                checkTrList(list);
                saveCurrentProfile();
            });
            dom_cache.tracker_list.on('change', 'input', function(e) {
                e.preventDefault();
                var $this = $(this);
                if ($this.prop('checked') === true) {
                    $(this).closest('tr').addClass('checked');
                } else {
                    $(this).closest('tr').removeClass('checked');
                }
                saveCurrentProfile();
            });
            dom_cache.select_profileList.on('change', function(e) {
                e.preventDefault();
                var current = $(this).val();
                var list = profile[current];
                if (list === undefined) {
                    loadProfile(current);
                } else {
                    current_profile = current;
                    checkTrList(list);
                }
            });
            dom_cache.profile_input.on('keydown', function(e) {
                if (e.which === 13) {
                    dom_cache.profile_btn.trigger('click');
                }
            });
            dom_cache.profile_btn.on('click', function(e) {
                e.preventDefault();
                var name = dom_cache.profile_input.val();
                if (name.length === 0) {
                    return;
                }
                dom_cache.profile_input.val('');
                profile[name] = undefined;
                writeProfileList(profile);
                loadProfile(name);
            });
            dom_cache.profile_rmlist.on('click', function(e) {
                e.preventDefault();
                delete profile[dom_cache.select_profileList.val()];
                writeProfileList(profile);
                loadProfile();
            });
            dom_cache.add_code_btn.on('click', function() {
                dom_cache.custom_add_btn.parent().show();
                dom_cache.custom_edit_btn.parent().hide();
                dom_cache.custom_popup.toggle();
            });
            dom_cache.custom_close_btn.on('click', function() {
                dom_cache.custom_textarea.val('');
                dom_cache.custom_popup.hide();
            });
            dom_cache.custom_add_btn.on('click', function() {
                var str_code = dom_cache.custom_textarea.val();
                var costume_tr = JSON.parse(GetSettings('costume_tr') || "[]");
                var code = null;
                try {
                    code = JSON.parse(str_code);
                } catch (e) {
                    alert(_lang.settings[55] + "\n" + e);
                    return;
                }
                if (code.uid === undefined) {
                    alert(_lang.settings[56]);
                    return;
                }
                var ex = GetSettings('ct_' + code.uid) || 0;
                var ex_in_list = costume_tr.indexOf(code.uid) !== -1;
                if (ex !== 0 && ex_in_list === true) {
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
                engine.getDefList();
                writeTrackerList();
                loadProfile(current_profile);
                dom_cache.custom_close_btn.trigger('click');
            });
            dom_cache.custom_list.on('click', 'input[name=edit_ctr]', function() {
                dom_cache.custom_edit_btn.parent().show();
                dom_cache.custom_add_btn.parent().hide();
                var uid = $(this).closest('tr').data('id');
                var code = GetSettings('ct_' + uid) || '';
                dom_cache.custom_textarea.val(code);
                dom_cache.custom_popup.data('id', uid).show();
            });
            dom_cache.custom_edit_btn.on('click', function() {
                var uid = dom_cache.custom_popup.data('id');
                dom_cache.custom_popup.data('id', undefined);
                var json = dom_cache.custom_textarea.val();
                var code = undefined;
                try {
                    code = JSON.parse(json);
                } catch (e) {
                    alert(_lang.settings[55] + "\n" + e);
                    return;
                }
                if (uid !== code.uid) {
                    code.uid = parseInt(uid);
                }
                SetSettings('ct_' + code.uid, JSON.stringify(code));
                load_costume_torrents();
                engine.getDefList();
                writeTrackerList();
                loadProfile(current_profile);
                dom_cache.custom_close_btn.trigger('click');
            });
            dom_cache.custom_list.on('click', 'input[name=rm_ctr]', function() {
                var uid = $(this).closest('tr').data('id');
                var customList = JSON.parse(GetSettings('costume_tr') || "[]");
                var index = customList.indexOf(uid);
                if (index === -1) {
                    console.log('Torrent not found! ', uid);
                    return;
                }
                customList.splice(index, 1);
                SetSettings('ct_' + uid, undefined);
                SetSettings('costume_tr', JSON.stringify(customList));
                delete torrent_lib['ct_' + uid];
                load_costume_torrents();
                engine.getDefList();
                writeTrackerList();
                loadProfile(current_profile);
            });
            dom_cache.bottom_save_btn.on('click', function() {
                saveAll();
                dom_cache.save_status.css('background', 'url(images/loading.gif) center center no-repeat');
                setTimeout(function() {
                    dom_cache.save_status.css('background', 'none');
                }, 500);
            });
            dom_cache.save_btn.on('click', function(e) {
                e.preventDefault();
                saveAll();
            });
            dom_cache.window.on('scroll',function() {
                clearTimeout(var_cache.window_scroll_timer);
                var_cache.window_scroll_timer = setTimeout(function() {
                    if (dom_cache.window.scrollTop() > 100) {
                        dom_cache.topbtn.fadeIn('fast');
                    } else {
                        dom_cache.topbtn.fadeOut('fast');
                    }
                }, 250);
            });
            dom_cache.topbtn.on("click", function(e) {
                e.preventDefault();
                window.scrollTo(window.scrollX, 200);
                dom_cache.html_body.animate({
                    scrollTop: 0
                }, 200);
            });
        }
    };
}();
$(function() {
    if (torrent_lib_min === 0) {
        setTimeout(function(){
            options.begin();
        }, 100);
    } else {
        options.begin();
    }
});