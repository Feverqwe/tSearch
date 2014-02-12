var engine = function() {
    var var_cache = {
        block_href:  new RegExp('\\/\\/','img'),
        block_src:   new RegExp(' src=([\'"]?)','img'),
        unblock_src: new RegExp('data:image\\/gif,base64#blockrurl#','mg'),
        unblock_href:new RegExp('\\/\\/about:blank#blockurl#','mg'),
        rn: new RegExp('[\\r\\n]+','g')
    };
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
    var loadModule = function(uid) {
        /*
         * загружает пользовательский модуль.
         */
        var ct = GetSettings(uid);
        if (ct === undefined) {
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
                var ex_encode = (me.encode !== undefined && me.encode) ? 1 : 0;
                var ex_post = (me.post !== undefined && me.post.length !== 0) ? 1 : 0;
                if (me.cat_alt !== undefined) {
                    me.cat_attr = 'alt';
                }
                delete me.cat_alt;

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
                var readCode = function(c) {
                    c = contentFilter(c);
                    var t = load_in_sandbox(c);

                    if (ex_auth_f === 1) {
                        if ((t.find(me.auth_f)).length !== 0) {
                            view.auth(0, uid);
                            return [];
                        } else {
                            view.auth(1, uid);
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
                        obj.category = {id: -1};
                        if (ex_cat === 1) {
                            if (me.cat_attr !== undefined) {
                                obj.category.title = (td.find(me.cat_name)).attr(me.cat_attr);
                            } else {
                                obj.category.title = (td.find(me.cat_name)).text();
                            }
                            if (obj.category.title === undefined || obj.category.title.length === 0) {
                                obj.category.title = undefined;
                                er[0] += 1;
                            } else
                            if (ex_link === 1) {
                                obj.category.url = (td.find(me.cat_link)).attr('href');
                                if (obj.category.url === undefined) {
                                    er[1] += 1;
                                } else
                                if (ex_link_r === 1) {
                                    if (obj.category.url[0] === '/') {
                                        obj.category.url = short_url + obj.category.url;
                                    } else {
                                        obj.category.url = root_url + obj.category.url;
                                    }
                                }
                            }
                        }
                        obj.title = (td.find(me.tr_name)).text();
                        if (obj.title.length === 0) {
                            er[2] += 1;
                            continue;
                        }
                        obj.url = (td.find(me.tr_link)).attr('href');
                        if (obj.url === undefined) {
                            er[3] += 1;
                            continue;
                        }
                        obj.url = obj.url.replace(var_cache.rn, "");
                        if (ex_tr_link_r === 1) {
                            if (obj.url[0] === '/') {
                                obj.url = short_url + obj.url;
                            } else {
                                obj.url = root_url + obj.url;
                            }
                        }
                        if (ex_tr_size === 1) {
                            if (me.size_attr !== undefined) {
                                obj.size = (td.find(me.tr_size)).attr(me.size_attr);
                            } else {
                                obj.size = (td.find(me.tr_size)).text();
                            }
                            if (obj.size !== undefined && obj.size.length !== 0) {
                                obj.size = obj.size.replace(var_cache.rn, "");
                                if (ex_size_regexp === 1) {
                                    obj.size = obj.size.replace(new RegExp(me.size_r, "ig"), me.size_rp);
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
                            obj.dl = (td.find(me.tr_dl)).attr('href');
                            if (obj.dl !== undefined) {
                                obj.dl = obj.dl.replace(var_cache.rn, "");
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
                            obj.seeds = (td.find(me.seed)).text();
                            if (obj.seeds.length !== 0) {
                                obj.seeds = obj.seeds.replace(var_cache.rn, "");
                                if (ex_seed_regexp === 1) {
                                    obj.seeds = obj.seeds.replace(new RegExp(me.seed_r, "ig"), me.seed_rp);
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
                            obj.leechs = (td.find(me.peer)).text();
                            if (obj.leechs.length !== 0) {
                                obj.leechs = obj.leechs.replace(var_cache.rn, "");
                                if (ex_peer_regexp === 1) {
                                    obj.leechs = obj.leechs.replace(new RegExp(me.peer_r, "ig"), me.peer_rp);
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
                                obj.time = (td.find(me.date)).attr(me.date_attr);
                            } else {
                                obj.time = (td.find(me.date)).text();
                            }
                            if (obj.time !== undefined && obj.time.length !== 0) {
                                obj.time = obj.time.replace(var_cache.rn, "");
                                if (ex_date_regexp === 1) {
                                    obj.time = obj.time.replace(new RegExp(me.t_r, "ig"), me.t_r_r);
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
                    var t = (ex_encode === 1) ? ex_kit.in_cp1251(text) : text;
                    if (xhr !== undefined)
                        xhr.abort();
                    var obj_req = {
                        type: 'GET',
                        url: me.search_path.replace('%search%', t),
                        cache: false,
                        success: function(data) {
                            view.result(uid, readCode(data), t);
                        },
                        error: function() {
                            view.loadingStatus(2, uid);
                        }
                    };
                    if (ex_post === 1) {
                        obj_req.type = 'POST';
                        obj_req.data = me.post.replace('%search%', t);
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
        var costume_tr = JSON.parse(GetSettings('costume_tr') || '[]');
        costume_tr.forEach(function(item) {
            var key = 'ct_'+item;
            if (_list[key] === undefined) {
                _list[key] = 0;
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
            currentTrList[k] = window.torrent_lib[k];
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
                    tracker.find(text);
                    view.loadingStatus(0, k);
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
            updateHistory(text);
        }
    };
    var stop = function() {
        $.each(currentTrList, function(k, tracker) {
            tracker.stop();
        });
    };
    var updateHistory = function(title) {
        /*
         * добавляет поисковый запрос в историю.
         * если такой запрос уже есть - увеличивает кол-во попаданий и обновляет дату запроса.
         */
        if (title.length === 0) {
            return;
        }
        var historyList = JSON.parse(GetSettings('history') || '[]');
        var found = false;
        var oldest_time;
        var oldest_item;
        for (var i = 0, item; item = historyList[i]; i++) {
            if (found === false && item.title === title) {
                item.count += 1;
                item.time = (new Date()).getTime();
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
                time: (new Date()).getTime()
            });
        }
        if (historyList.length > 200) {
            historyList.splice(oldest_item, 1);
        }
        SetSettings('history', JSON.stringify(historyList));
        //view.AddAutocomplete();
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
        //need view
        getProfileList: getProfileList,
        search: search,
        stop: stop,
        //need options:
        getDefList: function () {
            return wrapAllCustomTrList(getDefaultList());
        }
    }
}();