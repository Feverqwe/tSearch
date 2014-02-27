var engine = function() {
    var def_settings = {
        HideLeech: {v: 1, t: "checkbox"},
        HideSeed: {v: 0, t: "checkbox"},
        ShowIcons: {v: 1, t: "checkbox"},
        SubCategoryFilter: {v: 1, t: "checkbox"},
        HideZeroSeed: {v: 0, t: "checkbox"},
        AdvFiltration: {v: 2, t: "radio"},
        TeaserFilter: {v: 1, t: "checkbox"},
        add_in_omnibox: {v: 1, t: "checkbox"},
        context_menu: {v: 1, t: "checkbox"},
        search_popup: {v: 1, t: "checkbox"},
        AutoComplite_opt: {v: 1, t: "checkbox"},
        use_english_postername: {v: 0, t: "checkbox"},
        google_analytics: {v: 0, t: "checkbox"},
        autoSetCat: {v: 1, t: "checkbox"},
        allow_get_description: {v: 1, t: "checkbox"},
        allow_favorites_sync: {v: 1, t: "checkbox"},
        sub_select_enable: {v: 1, t: "checkbox"},
        kinopoisk_f_id: {v: 1, t: "number"},
        filter_panel_to_left: {v: 1, t: "checkbox"},
        hideTopSearch: {v: 0, t: "checkbox"}
    };
    var def_listOptions = {
        favorites: { e: 1, s: 1, w: 100, c: 1 },
        kp_favorites: { e: 1, s: 1, w: 100, c: 1 },
        kp_in_cinema: { e: 1, s: 1, w: 100, c: 1 },
        kp_popular: { e: 1, s: 1, w: 100, c: 2 },
        kp_serials: { e: 1, s: 1, w: 100, c: 1 },
        imdb_in_cinema: { e: 1, s: 1, w: 100, c: 1 },
        imdb_popular: { e: 1, s: 1, w: 100, c: 2 },
        imdb_serials: { e: 1, s: 1, w: 100, c: 1 },
        gg_games_top: { e: 1, s: 1, w: 100, c: 1 },
        gg_games_new: { e: 1, s: 1, w: 100, c: 1 }
    };
    if (window._lang !== undefined) {
        if ( _lang.t === 'en' ) {
            def_settings.hideTopSearch.v = 1;
            def_listOptions.kp_favorites.e = 0;
            def_listOptions.kp_in_cinema.e = 0;
            def_listOptions.kp_popular.e = 0;
            def_listOptions.kp_serials.e = 0;
        } else {
            def_listOptions.imdb_in_cinema.e = 0;
            def_listOptions.imdb_popular.e = 0;
            def_listOptions.imdb_serials.e = 0;
        }
    }
    var var_cache = {
        block_href:  new RegExp('\\/\\/','img'),
        block_src:   new RegExp(' src=([\'"]?)','img'),
        unblock_src: new RegExp('data:image\\/gif,base64#blockrurl#','mg'),
        unblock_href:new RegExp('\\/\\/about:blank#blockurl#','mg'),
        rn: new RegExp('[\\r\\n]+','g')
    };
    var historyList = [];
    var isFF = window.Application !== undefined && Application.name === "Firefox";
    var currentTrList = {};
    var profileList = JSON.parse(GetSettings('profileList') || '{}');
    var getDefaultList = function () {
        var list;
        if (_lang.t === "ru") {
            list = {'nnm-club': 1, rutracker: 1, kinozal: 1, rutor: 1, rustorka: 1, hdclub: 1, tfile: 1, 'fast-torrent': 1, opensharing: 1, btdigg: 1};
        } else {
            list = {bitsnoop: 1, extratorrent: 1, fenopy: 1, torrentz: 1, thepiratebay: 1, kickass: 1};
        }
        return list;
    };
    var migrate = function() {
        var storage = $.extend({},localStorage);
        var new_storage = {};
        var favoritesList = JSON.parse(storage.favoritesList || '[]');
        if (favoritesList.length > 0) {
            var exp_cache_favorites = {content:[]};
            favoritesList.forEach(function(item) {
                exp_cache_favorites.content.push({title: item.name, url: item.url, img: item.img});
            });
            new_storage.exp_cache_favorites = JSON.stringify(exp_cache_favorites);
        }
        if (storage.search_history !== null || storage.search_history !== undefined) {
            new_storage.history = storage.search_history;
        }
        $.each(storage, function(key, value) {
            if (key.substr(0, 3) === 'ct_') {
                if (value !== null && value !== undefined) {
                    new_storage[key] = value;
                }
            } else if ( ['hideTopSearch', 'filter_panel_to_left', 'kinopoisk_f_id',
                'sub_select_enable', 'allow_favorites_sync', 'allow_get_description',
                'autoSetCat', 'use_english_postername', 'AutoComplite_opt',
                'search_popup', 'context_menu', 'add_in_omnibox', 'TeaserFilter',
                'AdvFiltration', 'HideZeroSeed', 'SubCategoryFilter', 'ShowIcons',
                'HideSeed', 'HideLeech', 'costume_tr', 'lang', 'torrent_list_r', 'torrent_list_h'
            ].indexOf(key) !== -1) {
                if (value !== null && value !== undefined) {
                    new_storage[key] = value;
                }
            }
        });
        var newProfiles = {};
        var new_profile_len = 0;
        var trList = JSON.parse(storage.trackerProfiles || '[]');
        trList.forEach(function(item){
            if (item.Title === undefined) {
                return 1;
            }
            var len = 0;
            var list = {};
            if (item.Trackers !== null) {
                item.Trackers.forEach(function(itm){
                    if (itm.e === undefined || itm.n === undefined || itm.e !== 1) {
                        return 1;
                    }
                    list[itm.n] = 1;
                    len++;
                });
            }
            if (len === 0) {
                return 1;
            }
            newProfiles[item.Title] = list;
            new_profile_len++;
        });
        if ( new_profile_len > 0 ){
            new_storage.profileList = JSON.stringify(newProfiles);
        }
        if (window.chrome !== undefined) {
            chrome.storage.local.clear();
            chrome.storage.sync.clear();
        }
        localStorage.clear();
        $.each(new_storage, function(key, value){
            if (value === undefined) {
                return 1;
            }
            localStorage[key] = value;
        });
        window.location.reload();
    };
    if ( GetSettings('defProfile') !== undefined ) {
        migrate();
        return;
    }
    var migrate2 = function() {
        var pre = 'exp_cache_';
        var storage = {};
        storage[pre+'favorites'] = GetSettings(pre+'favorites');
        storage[pre+'kp_favorites'] = GetSettings(pre+'kp_favorites');
        storage['qualityBoxCache'] = GetSettings('qualityBoxCache');
        storage['qualityCache'] = GetSettings('qualityCache');
        storage['click_history'] = GetSettings('click_history');
        storage['history'] = GetSettings('history');
        SetStorageSettings(storage);
        SetSettings(pre+'favorites', undefined);
        SetSettings(pre+'kp_favorites', undefined);
        SetSettings(pre+'kp_in_cinema', undefined);
        SetSettings(pre+'kp_popular', undefined);
        SetSettings(pre+'kp_serials', undefined);
        SetSettings(pre+'imdb_in_cinema', undefined);
        SetSettings(pre+'imdb_popular', undefined);
        SetSettings(pre+'imdb_serials', undefined);
        SetSettings(pre+'gg_games_top', undefined);
        SetSettings(pre+'gg_games_new', undefined);
        SetSettings('topList', undefined);
        SetSettings('qualityBoxCache', undefined);
        SetSettings('qualityCache', undefined);
        SetSettings('click_history', undefined);
        SetSettings('history', undefined);
    };
    if ( window.chrome !== undefined && (
                GetSettings('click_history') !== undefined ||
                GetSettings('history') !== undefined ||
                GetSettings('gg_games_new') !== undefined
            )
        ) {
        migrate2();
    }
    GetStorageSettings('history', function(storage){
        historyList = JSON.parse(storage.history || '[]');
        if (engine !== undefined && engine.history !== undefined) {
            engine.history = historyList;
        }
    });
    var loadModule = function(uid) {
        /*
         * загружает пользовательский модуль.
         */
        var ct = GetSettings(uid);
        if (ct === undefined || ct === 'undefined') {
            return;
        }
        ct = JSON.parse(ct);
        torrent_lib[uid] = function() {
            var me = $.extend({},ct);
            var icon = (me.icon !== undefined) ? me.icon : '';
            var name = (me.name !== undefined) ? me.name : '-no name-';
            var about = (me.about !== undefined) ? me.about : '';
            var root_url = (me.root_url !== undefined) ? me.root_url : '';
            var short_url = (me.root_url !== undefined) ? me.root_url.replace(/http(s?):\/\/([^\/]*)\/?.*$/, 'http$1://$2') : '';
            var login_url = (me.auth !== undefined) ? me.auth : '';
            var uid = me.uid;
            var custom_id = 'ct_' + me.uid;
            var tests = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            var flags = (me.flags !== undefined) ? me.flags : {
                a: 0,
                l: 0,
                rs: 1
            };
            var xhr = undefined;
            var kit = function() {
                var ex_cat = (me.cat_name !== undefined) ? 1 : 0;
                var ex_link = (me.cat_link !== undefined) ? 1 : 0;
                var ex_link_r = (me.cat_link_r !== undefined) ? 1 : 0;
                var ex_tr_link_r = (me.tr_link_r !== undefined) ? 1 : 0;
                var ex_tr_size = (me.tr_size !== undefined) ? 1 : 0;
                var ex_tr_size_c = (me.s_c !== undefined) ? 1 : 0;
                var ex_tr_dl = (me.tr_dl !== undefined) ? 1 : 0;
                var ex_tr_dl_r = (me.tr_dl_r !== undefined) ? 1 : 0;
                var ex_seed = (me.seed !== undefined) ? 1 : 0;
                var ex_peer = (me.peer !== undefined) ? 1 : 0;
                var ex_date = (me.date !== undefined) ? 1 : 0;
                var ex_date_regexp = (me.t_r !== undefined && me.t_r_r !== undefined) ? 1 : 0; //t_r t_r_r
                var ex_size_regexp = (me.size_r !== undefined && me.size_rp !== undefined) ? 1 : 0;
                var ex_seed_regexp = (me.seed_r !== undefined && me.seed_rp !== undefined) ? 1 : 0;
                var ex_peer_regexp = (me.peer_r !== undefined && me.peer_rp !== undefined) ? 1 : 0;
                var ex_t_m_r = (me.t_m_r !== undefined) ? 1 : 0;
                var ex_t_t_r = (me.t_t_r !== undefined) ? 1 : 0;
                var ex_t_f = (me.t_f !== undefined && me.t_f !== "-1") ? 1 : 0; //me.t_f is string from JSON
                var ex_auth_f = (me.auth_f !== undefined) ? 1 : 0;
                var ex_encode = (me.encode !== undefined) ? 1 : 0;
                var ex_post = (me.post !== undefined) ? 1 : 0;
                var ex_charset = (me.charset !== undefined) ? 1 : 0;
                if (me.cat_alt !== undefined) {
                    me.cat_attr = 'alt';
                    delete me.cat_alt;
                }
                if (ex_date_regexp === 1) {
                    me.t_r = new RegExp(me.t_r, "ig");
                }
                if (ex_size_regexp === 1) {
                    me.size_r = new RegExp(me.size_r, "ig");
                }
                if (ex_seed_regexp === 1) {
                    me.seed_r = new RegExp(me.seed_r, "ig");
                }
                if (ex_peer_regexp === 1) {
                    me.peer_r = new RegExp(me.peer_r, "ig");
                }

                if (ex_cat === 0) {
                    tests[1] = 1;
                    tests[2] = 1;
                }
                if (ex_link === 0) {
                    tests[2] = 1;
                }
                if (ex_tr_dl === 0) {
                    tests[5] = 1;
                }
                var readCode = function(data) {
                    data = contentFilter(data);
                    var $content = load_in_sandbox(data);

                    if (ex_auth_f === 1) {
                        if (($content.find(me.auth_f)).length === 0) {
                            view.auth(1, custom_id);
                        } else {
                            view.auth(0, custom_id);
                            return [];
                        }
                    }
                    $content = $content.find(me.items);
                    var len = $content.length - ((me.sl !== undefined) ? me.sl : 0);
                    var arr = [];
                    var start = (me.sf !== undefined) ? me.sf : 0;
                    var er = [0, 0, 0, 0, 0, 0, 0, 0];
                    for (var i = start; i < len; i++) {
                        var item = $content.eq(i);
                        var obj = {category: {id: -1}};
                        if (ex_cat === 1) {
                            if (me.cat_attr !== undefined) {
                                obj.category.title = (item.find(me.cat_name)).attr(me.cat_attr);
                            } else {
                                obj.category.title = (item.find(me.cat_name)).text();
                            }
                            if (obj.category.title === undefined || obj.category.title.length === 0) {
                                obj.category.title = undefined;
                                er[0] += 1;
                            } else if (ex_link === 1) {
                                obj.category.url = (item.find(me.cat_link)).attr('href');
                                if (obj.category.url === undefined) {
                                    er[1] += 1;
                                } else if (ex_link_r === 1) {
                                    if (obj.category.url[0] === '/') {
                                        obj.category.url = short_url + obj.category.url;
                                    } else {
                                        obj.category.url = root_url + obj.category.url;
                                    }
                                }
                            }
                        }
                        obj.title = (item.find(me.tr_name)).text();
                        if (obj.title.length === 0) {
                            er[2] += 1;
                            continue;
                        }
                        obj.url = (item.find(me.tr_link)).attr('href');
                        if (obj.url === undefined) {
                            er[3] += 1;
                            continue;
                        }
                        obj.url = obj.url.replace(var_cache.rn, '');
                        if (ex_tr_link_r === 1) {
                            if (obj.url[0] === '/') {
                                obj.url = short_url + obj.url;
                            } else {
                                obj.url = root_url + obj.url;
                            }
                        }
                        if (ex_tr_size === 1) {
                            if (me.size_attr !== undefined) {
                                obj.size = (item.find(me.tr_size)).attr(me.size_attr);
                            } else {
                                obj.size = (item.find(me.tr_size)).text();
                            }
                            if (obj.size !== undefined && obj.size.length !== 0) {
                                obj.size = obj.size.replace(var_cache.rn, ' ');
                                if (ex_size_regexp === 1) {
                                    obj.size = obj.size.replace(me.size_r, me.size_rp);
                                }
                                if (ex_tr_size_c === 1) {
                                    obj.size = ex_kit.format_size(obj.size);
                                }
                            }
                            if (!ex_kit.isNumber(obj.size)) {
                                obj.size = 0;
                                er[4] += 1;
                            }
                        } else {
                            obj.size = 0;
                        }
                        if (ex_tr_dl === 1) {
                            obj.dl = (item.find(me.tr_dl)).attr('href');
                            if (obj.dl !== undefined) {
                                obj.dl = obj.dl.replace(var_cache.rn, '');
                                if (ex_tr_dl_r === 1) {
                                    if (obj.dl[0] === '/') {
                                        obj.dl = short_url + obj.dl;
                                    } else {
                                        obj.dl = root_url + obj.dl;
                                    }
                                }
                            } else {
                                er[5] += 1;
                            }
                        }
                        if (ex_seed === 1) {
                            obj.seeds = (item.find(me.seed)).text();
                            if (obj.seeds.length !== 0) {
                                obj.seeds = obj.seeds.replace(var_cache.rn, ' ');
                                if (ex_seed_regexp === 1) {
                                    obj.seeds = obj.seeds.replace(me.seed_r, me.seed_rp);
                                }
                            }
                            if (!ex_kit.isNumber(obj.seeds)) {
                                obj.seeds = 1;
                                er[6] += 1;
                            }
                        } else {
                            obj.seeds = 1;
                        }
                        if (ex_peer === 1) {
                            obj.leechs = (item.find(me.peer)).text();
                            if (obj.leechs.length !== 0) {
                                obj.leechs = obj.leechs.replace(var_cache.rn, ' ');
                                if (ex_peer_regexp === 1) {
                                    obj.leechs = obj.leechs.replace(me.peer_r, me.peer_rp);
                                }
                            }
                            if (!ex_kit.isNumber(obj.leechs)) {
                                obj.leechs = 0;
                                er[7] += 1;
                            }
                        } else {
                            obj.leechs = 0;
                        }
                        if (ex_date === 1) {
                            if (me.date_attr !== undefined) {
                                obj.time = (item.find(me.date)).attr(me.date_attr);
                            } else {
                                obj.time = (item.find(me.date)).text();
                            }
                            if (obj.time !== undefined && obj.time.length !== 0) {
                                obj.time = obj.time.replace(var_cache.rn, ' ');
                                if (ex_date_regexp === 1) {
                                    obj.time = obj.time.replace(me.t_r, me.t_r_r);
                                }
                                if (ex_t_t_r === 1) {
                                    obj.time = ex_kit.today_replace(obj.time, me.t_f);
                                }
                                if (ex_t_m_r === 1) {
                                    obj.time = ex_kit.month_replace(obj.time);
                                }
                                if (ex_t_f === 1) {
                                    obj.time = ex_kit.format_date(me.t_f, obj.time);
                                }
                            }
                            if (!ex_kit.isNumber(obj.time)) {
                                er[8] += 1;
                                obj.time = 0;
                            }
                        } else {
                            obj.time = 0;
                        }
                        arr.push(obj);
                    }
                    if (Math.max.apply(null,er) !== 0) {
                        var msg = 'Tracker ' + me.name + ' have problem!';
                        if (er[2])
                            msg += "\n" + er[2] + ' - torrent title skip';
                        if (er[3])
                            msg += "\n" + er[3] + ' - torrent url skip';
                        if (er[0])
                            msg += "\n" + er[0] + ' - category title fix';
                        if (er[1])
                            msg += "\n" + er[1] + ' - category url fix';
                        if (er[4])
                            msg += "\n" + er[4] + ' - size fix';
                        if (er[5])
                            msg += "\n" + er[5] + ' - dl link fix';
                        if (er[6])
                            msg += "\n" + er[6] + ' - seeds fix';
                        if (er[7])
                            msg += "\n" + er[7] + ' - leechs fix';
                        if (er[8])
                            msg += "\n" + er[8] + ' - time fix';
                        console.warn(msg);
                    }
                    return arr;
                };
                var loadPage = function(text) {
                    var request = (ex_encode === 1) ? ex_kit.in_cp1251(text) : text;
                    if (xhr !== undefined)
                        xhr.abort();
                    var obj_req = {
                        type: 'GET',
                        url: me.search_path.replace('%search%', request),
                        cache: false,
                        success: function(data) {
                            view.result(custom_id, readCode(data), text);
                        },
                        error: function() {
                            view.loadingStatus(2, custom_id);
                        }
                    };
                    if (ex_charset) {
                        obj_req.beforeSend = function(xhr) {
                            xhr.overrideMimeType("text/plain; charset="+me.charset);
                        }
                    }
                    if (ex_post === 1) {
                        obj_req.type = 'POST';
                        obj_req.data = me.post.replace('%search%', request);
                    }
                    xhr = $.ajax(obj_req);
                };
                return {
                    getPage: loadPage
                };
            }();
            return {
                find: function(text) {
                    kit.getPage(text);
                },
                stop: function(){
                    if (xhr !== undefined) {
                        xhr.abort();
                    }
                    //view.loadingStatus(1, uid);
                },
                name: name,
                icon: icon,
                about: about,
                url: root_url,
                flags: flags,
                login_url: login_url,
                uid: uid,
                tests: tests
            };
        }();
    };
    var wrapAllCustomTrList = function (list) {
        var _list = $.extend({}, list);
        var custom_list = JSON.parse(GetSettings('costume_tr') || '[]');
        custom_list.forEach(function(item) {
            var key = 'ct_'+item;
            if (_list[key] === undefined) {
                _list[key] = 0;
            }
            if (window.torrent_lib[key] === undefined) {
                loadModule(key);
            }
        });
        for (var key in window.torrent_lib) {
            if (window.torrent_lib.hasOwnProperty(key) === false) {
                continue;
            }
            if (_list[key] === undefined) {
                _list[key] = 0;
            }
        }
        return _list;
    };
    var loadTrList = function(trList) {
        /*
         * Загружает можули из массива торрентов профиля.
         */
        if (trList === undefined) {
            trList = getDefaultList();
        }
        var noSkip = false;
        if (window.options !== undefined) {
            trList = wrapAllCustomTrList(trList);
            noSkip = true;
        }
        currentTrList = {};
        $.each(trList, function(k, v){
            if (v === 0 && noSkip === false) {
                return 1;
            }
            if (window.torrent_lib[k] === undefined) {
                loadModule(k);
            }
            if (window.torrent_lib[k] !== undefined) {
                currentTrList[k] = window.torrent_lib[k];
            }
        });
    };
    var createProfile = function(title) {
        if (title === undefined) {
            title = _lang.label_def_profile;
        }
        profileList[title] = undefined;
        SetSettings('profileList', JSON.stringify(profileList));
        return title;
    };
    var loadProfile = function(title, cb) {
        /*
         * загрузка профиля
         */
        if (title === undefined) {
            title = GetSettings('currentProfile');
        }
        if (title === undefined) {
            var first;
            for (var key in profileList) {
                if (profileList.hasOwnProperty(key) === false) {
                    continue;
                }
                if (first === undefined) {
                    first = key;
                }
            }
            if (first === undefined) {
                title = createProfile(title);
            } else {
                title = first;
            }
        }
        loadTrList(profileList[title]);
        SetSettings('currentProfile', title);
        if (cb !== undefined) {
            cb(currentTrList);
        }
    };
    var getProfileList = function() {
        return profileList;
    };
    var search = function(text, trackers, nohistory) {
        /*
         * функция выполняет многопоточный поиск по трекерам
         * text - запрос
         * tracker_id - id трекера, если нету - поиск во всех трекерах в списке.
         * nohistory - если 1 то история не пишется.
         */
        if (trackers === undefined || trackers.length === 0) {
            $.each(currentTrList, function(k, tracker) {
                try {
                    view.loadingStatus(0, k);
                    tracker.find(text);
                } catch (err) {
                    view.loadingStatus(2, k);
                }
            });
        } else {
            trackers.forEach(function(tracker) {
                try {
                    view.loadingStatus(0, tracker);
                    currentTrList[tracker].find(text);
                } catch (err) {
                    view.loadingStatus(2, tracker);
                }
            });
        }
        if (nohistory === undefined) {
            updateHistory(text, trackers);
        }
    };
    var stop = function() {
        $.each(currentTrList, function(k, tracker) {
            tracker.stop();
            view.loadingStatus(1, k);
        });
    };
    var updateHistory = function(title, trackers) {
        var limit = 100;
        if (window.chrome !== undefined) {
            limit = 500;
        }
        /*
         * добавляет поисковый запрос в историю.
         * если такой запрос уже есть - увеличивает кол-во попаданий и обновляет дату запроса.
         */
        if (title.length === 0) {
            return;
        }
        var trackers = (trackers.length > 0)?trackers:undefined;
        var trackers_names;
        if (trackers !== undefined) {
            trackers_names = [];
            trackers.forEach(function(item) {
                if (currentTrList[item] === undefined) {
                    return 1;
                }
                trackers_names.push( currentTrList[item].name );
            });
        }
        var found = false;
        var oldest_time;
        var oldest_item;
        for (var i = 0, item; item = historyList[i]; i++) {
            if (found === false && item.title === title) {
                item.count += 1;
                item.time = parseInt((new Date()).getTime() / 1000);
                item.trackers = trackers;
                item.trackers_names = trackers_names;
                found = true;
            }
            if (oldest_time === undefined || oldest_time > item.time) {
                oldest_time = item.time;
                oldest_item = i;
            }
        }
        if (found === false) {
            historyList.push({
                title: title,
                count: 1,
                time: parseInt((new Date()).getTime() / 1000),
                trackers: trackers,
                trackers_names: trackers_names
            });
        }
        var historyList_len = historyList.length;
        if (historyList.length > limit) {
            historyList.splice(oldest_item, 1);
        }
        if (historyList_len - 1 > limit) {
            historyList = historyList.slice(-limit);
        }
        SetStorageSettings({history: JSON.stringify(historyList)});
    };
    var contentFilter = function(content) {
        return content.replace(var_cache.block_href, '//about:blank#blockurl#').replace(var_cache.block_src, ' src=$1data:image/gif,base64#blockrurl#');
    };
    var contentUnFilter = function(content) {
        return content.replace(var_cache.unblock_src, '').replace(var_cache.unblock_href, '//');
    };
    if (isFF) {
        var parseHTML = function(doc, html, allowStyle, baseURI, isXML) {
            var PARSER_UTILS = "@mozilla.org/parserutils;1";
            // User the newer nsIParserUtils on versions that support it.
            if (PARSER_UTILS in Components.classes) {
                var parser = Components.classes[PARSER_UTILS]
                    .getService(Components.interfaces.nsIParserUtils);
                if ("parseFragment" in parser)
                    return parser.parseFragment(html, allowStyle ? parser.SanitizerAllowStyle : 0,
                        !!isXML, baseURI, doc.documentElement);
            }
            return Components.classes["@mozilla.org/feed-unescapehtml;1"]
                .getService(Components.interfaces.nsIScriptableUnescapeHTML)
                .parseFragment(html, !!isXML, baseURI, doc.documentElement);
        };
    }
    var load_in_sandbox = function(content) {
        var $safe_content;
        if (isFF) {
            content = content.replace(/href=/img, "data-href=");
            var safe_content = parseHTML(document, content);
            $safe_content = $('<html>').append(safe_content);
            var links = $safe_content.find('a');
            for (var n = 0, links_len = links.length; n < links_len; n++) {
                var link = links.eq(n);
                link.attr('href', link.attr('data-href')).removeAttr('data-href');
            }
        } else {
            $safe_content = $($.parseHTML(content));
        }
        return $safe_content;
    };
    return {
        //need modules
        contentFilter: contentFilter,
        contentUnFilter: contentUnFilter,
        load_in_sandbox: load_in_sandbox,
        //need view and options
        loadProfile: loadProfile,
        def_settings: def_settings,
        def_listOptions: def_listOptions,
        //need view
        getProfileList: getProfileList,
        search: search,
        stop: stop,
        history: historyList,
        //need options:
        getDefList: function () {
            return wrapAllCustomTrList(getDefaultList());
        }
    };
}();
$.ajaxSetup({
    global: true,
    jsonp: false
});