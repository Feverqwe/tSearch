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
        hideTopSearch: {v: 0, t: "checkbox"},
        no_blank_dl_link: {v: 0, t: "checkbox"},
        noTransitionLinks: {v: 1, t: "checkbox"},
        noTransition: {v: 0, t: "checkbox"},
        torrent_list_r: {v: 0, t: 'hidden'}
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
    var var_cache = {
        block_href:  new RegExp('\\/\\/','img'),
        block_src:   new RegExp(' src=([\'"]?)','img'),
        unblock_src: new RegExp('data:image\\/gif,base64#blockrurl#','mg'),
        unblock_href:new RegExp('\\/\\/about:blank#blockurl#','mg'),
        rn: new RegExp('[\\r\\n]+','g'),
        historyLimit: 500
    };

    var history = [];
    var profileList = {};
    var settings = {};

    var lastTrackerList = [];

    var defaultProfileTorrentList = function () {
        var list;
        if (_lang.t === "ru") {
            list = ['nnm-club', 'rutracker', 'kinozal', 'rutor', 'hdclub', 'tfile', 'fast-torrent', 'opensharing', 'btdigg'];
        } else {
            list = ['bitsnoop', 'extratorrent', 'fenopy', 'torrentz', 'thepiratebay', 'kickass'];
        }
        return list;
    };

    var loadModule = function(uid, code) {
        /*
         * загружает пользовательский модуль.
         */
        if (torrent_lib[uid] !== undefined) {
            return;
        }
        torrent_lib[uid] = function() {
            var me = code;
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
                if (me.cat_alt) {
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
                        obj_req.mimeType = "text/plain; charset="+me.charset;
                    }
                    if (ex_post === 1) {
                        obj_req.type = 'POST';
                        obj_req.data = me.post.replace('%search%', request);
                    }
                    xhr = engine.ajax(obj_req);
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

    var search = function(text, trackers, nohistory) {
        /*
         * функция выполняет многопоточный поиск по трекерам
         * text - запрос
         * tracker_id - id трекера, если нету - поиск во всех трекерах в списке.
         * nohistory - если 1 то история не пишется.
         */
        lastTrackerList = trackers.slice(0);
        trackers.forEach(function(tracker) {
            try {
                view.loadingStatus(0, tracker);
                torrent_lib[tracker].find(text);
            } catch (err) {
                view.loadingStatus(2, tracker);
            }
        });
        if (nohistory) {
            return;
        }
        updateHistory(text, (trackers.length === 1) ? trackers : []);
    };

    var stop = function() {
        lastTrackerList.forEach(function(tracker) {
            torrent_lib[tracker].stop();
            view.loadingStatus(1, tracker);
        });
    };

    var updateHistory = function(title, trackers) {
        /*
         * добавляет поисковый запрос в историю.
         * если такой запрос уже есть - увеличивает кол-во попаданий и обновляет дату запроса.
         */
        if (!title) {
            return;
        }
        var trackers_names = [];
        trackers.forEach(function(tracker) {
            trackers_names.push( torrent_lib[tracker].name );
        });
        var found = false;
        var oldest_time;
        var oldest_item;
        for (var i = 0, item; item = history[i]; i++) {
            if (found === false && item.title === title) {
                item.count += 1;
                item.time = parseInt(Date.now() / 1000);
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
            history.push({
                title: title,
                count: 1,
                time: parseInt(Date.now() / 1000),
                trackers: trackers,
                trackers_names: trackers_names
            });
        }
        var historyList_len = history.length;
        if (historyList_len > var_cache.historyLimit) {
            history.splice(oldest_item, 1);
        }
        if (historyList_len - 1 > var_cache.historyLimit) {
            history.splice(var_cache.historyLimit);
        }
        mono.storage.set({history: history});
    };

    var contentFilter = function(content) {
        return content.replace(var_cache.block_href, '//about:blank#blockurl#').replace(var_cache.block_src, ' src=$1data:image/gif,base64#blockrurl#');
    };

    var contentUnFilter = function(content) {
        return content.replace(var_cache.unblock_src, '').replace(var_cache.unblock_href, '//');
    };

    var load_in_sandbox = function(content) {
        var $safe_content;
        $safe_content = $($.parseHTML(content));
        return $safe_content;
    };

    var ajax = function(obj) {
        var url = obj.url;

        var method = obj.type || 'GET';
        method.toUpperCase();

        var data = obj.data;

        if (data && typeof data !== "string") {
            data = $.param(data);

            if (method === 'GET') {
                url += ( (url.indexOf('?') === -1)?'?':'&' ) + data;
                data = undefined;
            }
        }

        if (obj.cache === false && ['GET','HEAD'].indexOf(method) !== -1) {
            var nc = '_=' + Date.now();
            url += ( (url.indexOf('?') === -1)?'?':'&' ) + nc;
        }

        var xhr;
        if (mono.isFF) {
            xhr = {};
            xhr.open = [method, url, true];
        } else {
            xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
        }

        if (obj.dataType) {
            xhr.responseType = obj.dataType.toLowerCase();
        }

        if (!obj.headers) {
            obj.headers = {};
        }

        if (obj.contentType) {
            obj.headers["Content-Type"] = obj.contentType;
        }

        if (data && !obj.headers["Content-Type"]) {
            obj.headers["Content-Type"] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }

        if (mono.isFF) {
            xhr.headers = obj.headers;
            xhr.mimeType = obj.mimeType;
            xhr.data = data;
            xhr.id = Math.floor((Math.random() * 10000) + 1);

            mono.sendMessage({action: 'xhr', data: xhr}, function(_xhr) {
                xhr.status = _xhr.status;
                xhr.statusText = _xhr.statusText;
                xhr.response = _xhr.response;
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    return obj.success && obj.success(xhr.response);
                }
                obj.error && obj.error();
            }, "service");

            xhr.abort = function() {
                mono.sendMessage({action: 'xhrAbort', data: xhr.id}, undefined, "service");
            }
        } else {
            if (obj.mimeType) {
                xhr.overrideMimeType(obj.mimeType);
            }
            if (obj.headers) {
                for (var key in obj.headers) {
                    xhr.setRequestHeader(key, obj.headers[key]);
                }
            }
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    return obj.success && obj.success((obj.dataType) ? xhr.response : xhr.responseText);
                }
                obj.error && obj.error();
            };
            xhr.onerror = obj.error;
            xhr.send(data);
        }

        return xhr;
    };

    var loadSettings = function(cb) {
        var settings = {};
        var changes = [];
        for (var key in def_settings) {
            changes.push(key);
        }
        mono.storage.get(changes, function(storage) {
            for (var key in engine.def_settings) {
                var def_item = engine.def_settings[key];
                var value = storage[key];
                if (value === undefined) {
                    value = def_item.v;
                }
                if (['checkbox', 'radio', 'number'].indexOf(def_item.t) !== -1 ) {
                    settings[key] = parseInt(value);
                } else {
                    settings[key] = value;
                }
            }
        });
        cb && cb(settings);
    };

    var prepareProfileList = function () {
        var first = undefined;
        for (var profile in profileList) {
            first = profile;
            break;
        }
        if (first === undefined) {
            first = _lang.label_def_profile;
        }
        if (profileList[first] === undefined) {
            profileList[first] = defaultProfileTorrentList();
        }
    };

    var fastMigration = function(lStorage) {
        var settings = {};
        for (var key in engine.def_settings) {
            var def_item = engine.def_settings[key];
            var value = lStorage[key];
            if (value === undefined) {
                value = def_item.v;
            }
            var value = parseInt(value);
            if (!isNaN(value)) {
                settings[key] = value;
            }
        }

        try {
            var customTorrentList = {};
            var costume_tr = lStorage.costume_tr;
            if (costume_tr) {
                costume_tr = JSON.parse(costume_tr);
                costume_tr.forEach(function (tracker) {
                    var code = lStorage['ct_' + tracker];
                    try {
                        var obj = JSON.parse(code);
                        customTorrentList['ct_' + obj.uid] = obj;
                    } catch (e) {

                    }
                });
            }
            settings.customTorrentList = customTorrentList;
        } catch (e) {};

        if (['ru', 'en'].indexOf(lStorage.lang) !== -1) {
            settings.lang = lStorage.lang;
        }

        try {
            var listOptions = lStorage.listOptions;
            listOptions = JSON.parse(listOptions);
            settings.listOptions = JSON.stringify( listOptions );
        } catch (e) {};

        var profileList = {};
        try {
            var profiles = JSON.parse(lStorage.profileList);
            for (var item in profiles) {
                profileList[item] = [];
                if (!profiles[item]) {
                    continue;
                }
                for (var key in profiles[item]) {
                    if (profiles[item][key] !== 1) {
                        continue;
                    }
                    profileList[item].push(key);
                }
            }
            settings.profileList = JSON.stringify( profileList );
        } catch (e) {};

        var currentProfile = lStorage.currentProfile;
        if (profileList[currentProfile]) {
            settings.currentProfile = currentProfile;
        }

        mono.storage.set(settings, function() {
            lStorage.migrated = true;
            window.location.reload();
        });
    };

    return {
        //need modules
        contentFilter: contentFilter,
        contentUnFilter: contentUnFilter,
        load_in_sandbox: load_in_sandbox,
        ajax: ajax,
        //need view and options
        def_settings: def_settings,
        def_listOptions: def_listOptions,
        //need view
        search: search,
        stop: stop,
        //need options:
        fastMigration: fastMigration,
        defaultProfileTorrentList: defaultProfileTorrentList,
        loadSettings: loadSettings,
        reloadCustomTorrentList: function(cb) {
            mono.storage.get(['customTorrentList'], function(storage) {
                if (storage.customTorrentList) {
                    var torrentList = storage.customTorrentList;
                    for (var uid in torrentList) {
                        loadModule(uid, torrentList[uid]);
                    }
                }
                cb && cb();
            });
        },
        boot: function(cb) {
            if (mono.isChrome) {
                var_cache.historyLimit = 200;
            }

            if (mono.isChrome || mono.isOpera) {
                if (!localStorage.migrated) {
                    fastMigration(localStorage);
                }
            }

            mono.storage.get(['customTorrentList', 'profileList', 'history', 'lang', 'google_analytics'], function(storage) {

                storage.google_analytics !== 1 && window.counter && counter();

                _lang = get_lang(storage.lang || navigator.language.substr(0, 2));

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

                if (typeof storage.history === 'string') {
                    storage.history = JSON.parse(storage.history);
                }

                engine.history = history = storage.history || [];

                engine.profileList = profileList = JSON.parse( storage.profileList || '{}' );
                prepareProfileList();

                if (storage.customTorrentList) {
                    var torrentList = storage.customTorrentList;
                    for (var uid in torrentList) {
                        loadModule(uid, torrentList[uid]);
                    }
                }

                loadSettings(function (_settings) {
                    engine.settings = settings = _settings;
                    cb && cb();
                });
            });
        }
    };
}();