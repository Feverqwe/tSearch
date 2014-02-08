var tracker = [];
var engine = function() {
    var loaded_custom_tr = {};
    var trackerProfiles = JSON.parse(GetSettings('trackerProfiles') || "[]");
    var defProfile = function() {
        /* функция отдает текущий ID профиля
         * если нету - создает если нету новый профиль.
         * если нету ID - создает тоже.
         */
        var val = 0;
        if (trackerProfiles.length === 0) {
            trackerProfiles.push({
                Trackers: undefined,
                Title: _lang.label_def_profile
            });
            SetSettings('trackerProfiles', JSON.stringify(trackerProfiles));
            SetSettings('defProfile', 0);
            val = 0;
        } else {
            val = parseInt(GetSettings('defProfile') || 0);
            if (val >= trackerProfiles.length) {
                val = 0;
                SetSettings('defProfile', val);
            }
        }
        return val;
    }();
    var search = function(text, tracker_id, nohistory) {
        /*
         * функция выполняет многопоточный поиск по трекерам
         * text - запрос
         * tracker_id - id трекера, если нету - поиск во всех трекерах в списке.
         * nohistory - если 1 то история не пишется.
         */
        if (tracker_id !== null) {
            try {
                tracker[tracker_id].find(text);
                view.loadingStatus(0, tracker_id);
            } catch (err) {
                view.loadingStatus(2, tracker_id);
            }
        } else {
            $.each(tracker, function(k, v) {
                try {
                    v.find(text);
                    view.loadingStatus(0, k);
                } catch (err) {
                    view.loadingStatus(2, k);
                }
            });
        }
        if (nohistory === undefined) {
            updateHistory(text);
        }
    };
    var LimitHistory = function() {
        /*
         * Если история более х запросов удаляются самые старые.
         */
        var removeItem = function(title) {
            /*
             * Удаляет элемент из истории по названию.
             */
            var search_history = JSON.parse(GetSettings('search_history') || "[]");
            if (search_history.length > 0) {
                var count = search_history.length;
                for (var i = 0; i < count; i++) {
                    if (search_history[i].title === title) {
                        search_history.splice(i, 1);
                        break;
                    }
                }
                SetSettings('search_history', JSON.stringify(search_history));
            }
        };
        var search_history = JSON.parse(GetSettings('search_history') || "[]");
        if (search_history.length < 1)
            return;
        var count = search_history.length;
        if (count >= 200) {
            var order = function(a, b) {
                if (a.time > b.time)
                    return -1;
                if (a.time === b.time)
                    return 0;
                return 1;
            };
            search_history.sort(order);
            var title = search_history[count - 1].title;
            search_history = null;
            removeItem(title);
        }
    };
    var updateHistory = function(title) {
        /*
         * добавляет поисковый запрос в историю.
         * если такой запрос уже есть - увеличивает кол-во попаданий и обновляет дату запроса.
         */
        if (title.length === 0)
            return;
        LimitHistory();
        var search_history = JSON.parse(GetSettings('search_history') || "[]");
        if (search_history.length > 0) {
            var count = search_history.length;
            var find = false;
            for (var i = 0; i < count; i++) {
                if (search_history[i].title === title) {
                    search_history[i].count = parseInt(search_history[i].count) + 1;
                    search_history[i].time = Math.round((new Date()).getTime() / 1000);
                    find = true;
                }
            }
            if (find === false) {
                search_history[count] = {
                    title: title,
                    count: 1,
                    time: Math.round((new Date()).getTime() / 1000)
                };
            }
        } else {
            search_history = [];
            search_history[0] = {
                title: title,
                count: 1,
                time: Math.round((new Date()).getTime() / 1000)
            };
        }
        SetSettings('search_history', JSON.stringify(search_history));
        view.AddAutocomplete();
    };
    var clone_obj = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };
    var getProfileList = function() {
        /*
         * получает список профилей.
         */
        var arr = [];
        $.each(trackerProfiles, function(k, v) {
            arr.push(v.Title);
        });
        return arr;
    };
    var loadCostumeModule = function(uid) {
        /*
         * загружает пользовательский модуль.
         */
        var num = loaded_custom_tr[uid];
        if (num !== undefined) {
            ModuleLoaded(num);
            return;
        }
        var ct = GetSettings('ct_' + uid);
        if (ct === undefined) {
            //удалить из списка итп, конь в вакуме
            return;
        }
        ct = JSON.parse(ct);
        num = torrent_lib.length;
        loaded_custom_tr[uid] = num;
        torrent_lib[num] = function(ct) {
            var id = null;
            var me = ct;
            var icon = (me.icon !== undefined) ? me.icon : null;
            var name = (me.name !== undefined) ? me.name : '-no name-';
            var about = (me.about !== undefined) ? me.about : '';
            var root_url = (me.root_url !== undefined) ? me.root_url : null;
            var short_url = (me.root_url !== undefined) ? me.root_url.replace(/http(s?):\/\/([^\/]*)\/?.*$/, 'http$1://$2') : null;
            var login_url = (me.auth !== undefined) ? me.auth : null;
            var filename = me.uid;
            var uid = me.uid;
            var tests = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            var flags = (me.flags !== undefined) ? me.flags : {
                a: 0,
                l: 0,
                rs: 1
            };
            var xhr = null;
            var kit = function() {
                var readCode = function(c) {
                    c = view.contentFilter(c);
                    var t = view.load_in_sandbox(id, c);
                    var ex_cat = (me.cat_name !== undefined) ? 1 : 0;
                    var ex_link = (me.cat_link !== undefined) ? 1 : 0;
                    var ex_link_r = (me.cat_link_r !== undefined && me.cat_link_r) ? 1 : 0;
                    var ex_tr_link_r = (me.tr_link_r !== undefined && me.tr_link_r) ? 1 : 0;
                    var ex_tr_size = (me.tr_size !== undefined) ? 1 : 0;
                    var ex_tr_size_c = (me.s_c !== undefined && me.s_c) ? 1 : 0;
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


                    if (ex_auth_f) {
                        if ((t.find(me.auth_f)).length > 0) {
                            view.auth(0, id);
                            return [];
                        } else {
                            view.auth(1, id);
                        }
                    }
                    t = t.find(me.items);
                    var l = t.length - ((me.sl !== undefined) ? me.sl : 0);
                    var arr = [];
                    var s = (me.sf !== undefined) ? me.sf : 0;
                    var er = [0, 0, 0, 0, 0, 0, 0, 0];
                    for (var i = s; i < l; i++) {
                        var td = t.eq(i);
                        var obj = {};
                        obj['category'] = {id: -1};
                        if (ex_cat) {
                            if (me.cat_alt !== undefined) {
                                obj['category']['title'] = (td.find(me.cat_name)).attr('alt');
                            } else if (me.cat_attr !== undefined) {
                                obj['category']['title'] = (td.find(me.cat_name)).attr(me.cat_attr);
                            } else {
                                obj['category']['title'] = (td.find(me.cat_name)).text();
                            }
                            if (obj['category']['title'] === undefined || obj['category']['title'].length === 0) {
                                obj['category']['title'] = null;
                                er[0] += 1;
                            } else
                            if (ex_link) {
                                obj['category']['url'] = (td.find(me.cat_link)).attr('href');
                                if (obj['category']['url'] === undefined) {
                                    obj['category']['url'] = null;
                                    er[1] += 1;
                                } else
                                if (ex_link_r) {
                                    if (obj['category']['url'][0] === '/') {
                                        obj['category']['url'] = short_url + obj['category']['url'];
                                    } else {
                                        obj['category']['url'] = root_url + obj['category']['url'];
                                    }
                                }
                            }
                        }
                        obj['title'] = (td.find(me.tr_name)).text();
                        if (obj['title'].length === 0) {
                            er[2] += 1;
                            continue;
                        }
                        obj['url'] = (td.find(me.tr_link)).attr('href');
                        if (obj['url'] === undefined) {
                            er[3] += 1;
                            continue;
                        }
                        obj['url'] = obj['url'].replace(/[\r\n]+/g, "");
                        if (ex_tr_link_r) {
                            if (obj['url'][0] === '/') {
                                obj['url'] = short_url + obj['url'];
                            } else {
                                obj['url'] = root_url + obj['url'];
                            }
                        }
                        if (ex_tr_size) {
                            if (me.size_attr !== undefined) {
                                obj['size'] = (td.find(me.tr_size)).attr(me.size_attr);
                            } else {
                                obj['size'] = (td.find(me.tr_size)).text();
                            }
                            if (obj['size'].length !== 0) {
                                obj['size'] = obj['size'].replace(/[\r\n]+/g, "");
                                if (ex_size_regexp) {
                                    obj['size'] = obj['size'].replace(new RegExp(me.size_r, "ig"), me.size_rp);
                                }
                                if (ex_tr_size_c) {
                                    obj['size'] = ex_kit.format_size(obj['size']);
                                }
                            }
                            if (!ex_kit.isNumber(obj['size'])) {
                                obj['size'] = 0;
                                er[4] += 1;
                            }
                        } else {
                            obj['size'] = 0;
                        }
                        if (ex_tr_dl) {
                            obj['dl'] = (td.find(me.tr_dl)).attr('href');
                            if (obj['dl'] !== undefined) {
                                obj['dl'] = obj['dl'].replace(/[\r\n]+/g, "");
                            }
                            if (obj['dl'] === undefined) {
                                er[5] += 1;
                                obj['dl'] = null;
                            } else
                            if (ex_tr_dl_r) {
                                if (obj['dl'][0] === '/') {
                                    obj['dl'] = short_url + obj['dl'];
                                } else {
                                    obj['dl'] = root_url + obj['dl'];
                                }
                            }
                        }
                        if (ex_seed) {
                            obj['seeds'] = (td.find(me.seed)).text();
                            if (obj['seeds'].length !== 0) {
                                obj['seeds'] = obj['seeds'].replace(/[\r\n]+/g, "");
                                if (ex_seed_regexp) {
                                    obj['seeds'] = obj['seeds'].replace(new RegExp(me.seed_r, "ig"), me.seed_rp);
                                }
                            }
                            if (!ex_kit.isNumber(obj['seeds'])) {
                                obj['seeds'] = 1;
                                er[6] += 1;
                            }
                        } else {
                            obj['seeds'] = 1;
                        }
                        if (ex_peer) {
                            obj['leechs'] = (td.find(me.peer)).text();
                            if (obj['leechs'].length !== 0) {
                                obj['leechs'] = obj['leechs'].replace(/[\r\n]+/g, "");
                                if (ex_peer_regexp) {
                                    obj['leechs'] = obj['leechs'].replace(new RegExp(me.peer_r, "ig"), me.peer_rp);
                                }
                            }
                            if (!ex_kit.isNumber(obj['leechs'])) {
                                obj['leechs'] = 0;
                                er[7] += 1;
                            }
                        } else {
                            obj['leechs'] = 0;
                        }
                        if (ex_date) {
                            if (me.date_attr !== undefined) {
                                obj['time'] = (td.find(me.date)).attr(me.date_attr);
                            } else {
                                obj['time'] = (td.find(me.date)).text();
                            }
                            if (obj['time'].length !== 0) {
                                obj['time'] = obj['time'].replace(/[\r\n]+/g, "");
                                if (ex_date_regexp) {
                                    obj['time'] = obj['time'].replace(new RegExp(me.t_r, "ig"), me.t_r_r);
                                }
                                if (ex_t_t_r) {
                                    obj['time'] = ex_kit.today_replace(obj['time'], me.t_f);
                                }
                                if (ex_t_m_r) {
                                    obj['time'] = ex_kit.month_replace(obj['time']);
                                }
                                if (ex_t_f) {
                                    obj['time'] = ex_kit.format_date(me.t_f, obj['time']);
                                }
                            }
                            if (!ex_kit.isNumber(obj['time'])) {
                                er[8] += 1;
                                obj['time'] = 0;
                            }
                        } else {
                            obj['time'] = 0;
                        }
                        arr.push(obj);
                    }
                    if (er.join(',') !== '0,0,0,0,0,0,0,0') {
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
                            msg += "\n" + er[4] + ' - sile size fix';
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
                    var t = (me.encode !== undefined && me.encode) ? ex_kit.in_cp1251(text) : text;
                    if (xhr !== null)
                        xhr.abort();
                    var obj_req = {
                        type: 'GET',
                        url: me.search_path.replace('%search%', t),
                        cache: false,
                        success: function(data) {
                            view.result(id, readCode(data), t);
                        },
                        error: function() {
                            view.loadingStatus(2, id);
                        }
                    };
                    if (me.post !== undefined && me.post.length > 0) {
                        obj_req.type = 'POST';
                        obj_req.data = me.post.replace('%search%', t);
                    }
                    xhr = $.ajax(obj_req);
                };
                return {
                    getPage: function(a) {
                        return loadPage(a);
                    }
                };
            }();
            var find = function(text) {
                kit.getPage(text);
            };
            return {
                find: function(a) {
                    find(a);
                },
                setId: function(a) {
                    id = a;
                },
                id: undefined,
                name: name,
                icon: icon,
                about: about,
                url: root_url,
                filename: filename,
                flags: flags,
                login_url: login_url,
                uid: uid,
                tests: tests
            };
        }(ct);
        ModuleLoaded(num);
    };
    var loadInternalModule = function(filename) {
        /*
         * загрузка встроенного модуля по названию.
         */
        for (var i = 0, len = torrent_lib.length; i < len; i++) {
            if (torrent_lib[i].filename === filename) {
                ModuleLoaded(i);
                break;
            }
        }
    };
    var ModuleLoaded = function(num) {
        /*
         * вызывается когда модуль загрузился.
         */
        var n = tracker.length;
        tracker[n] = torrent_lib[num];
        tracker[n].setId(n);
        //bug fix >
        tracker[n].id = n;
        //<
        view.addTrackerInList(n);
    };
    var wrapAllCustomTrList = function (list) {
        var _list = list.splice(0);
        for (var i = 0, tr; tr = window.torrent_lib[i]; i++) {
            var found = false;
            for (var n = 0, ex_tr; ex_tr = _list[n]; n++) {
                if (tr.uid !== undefined) {
                    found = tr.uid === ex_tr.uid;
                } else {
                    found = tr.filename === ex_tr.n;
                }
                if (found === true) {
                    break;
                }
            }
            if (found === true) {
                continue;
            }
            var obj = {
                e: 0,
                n: tr.filename,
                uid: tr.uid
            };
            if (tr.uid === undefined) {
                delete obj.uid;
            }
            _list.push(obj);
        }
        return _list;
    };
    var getDefaultList = function () {
        var def;
        if (_lang.t === "ru") {
            def = ['nnm-club', 'rutracker', 'kinozal', 'rutor', 'rustorka', 'hdclub', 'tfile', 'fast-torrent', 'opensharing', 'btdigg'];
        } else {
            def = ['bitsnoop', 'extratorrent', 'fenopy', 'torrentz', 'thepiratebay', 'kickass'];
        }
        var list = [];
        def.forEach(function(item) {
            list.push({e: 1, n: item});
        });
        return list;
    };
    var loadProfileModules = function(torrentList) {
        /*
         * Загружает можули из массива торрентов профиля.
         */
        if (torrentList === undefined || torrentList.length === 0) {
            torrentList = getDefaultList();
        }
        var noSkip = false;
        if (window.options !== undefined) {
            torrentList = wrapAllCustomTrList(torrentList);
            noSkip = true;
        }
        for (var i = 0, item; item = torrentList[i]; i++) {
            if (item.e === 0 && noSkip === false) {
                continue;
            }
            if (item.uid !== undefined) {
                loadCostumeModule(item.uid);
                continue;
            }
            loadInternalModule(item.n);
        }
    };
    var loadProfile = function(profile) {
        /*
         * загрузка ID профиля
         */
        profile = parseInt(profile);
        view.ClearTrackerList();
        if (isNaN(profile)) {
            profile = defProfile;
        }
        if (trackerProfiles[profile] === undefined) {
            loadProfileModules();
        } else {
            loadProfileModules(trackerProfiles[profile].Trackers);
            SetSettings('defProfile', profile);
        }
    };
    return {
        //need view and options
        loadProfile: loadProfile,
        //need view
        getProfileList: getProfileList,
        search: search,
        //need options:
        getDefList: function () {
            return wrapAllCustomTrList(getDefaultList());
        }
    };
}();