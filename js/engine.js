var tracker = [];
if (GetSettings('debug') !== "1") {
    console.log = function() {
    };
}
var engine = function() {
    var makeDefaultList = function() {
        def = ['bitsnoop','extratorrent','fenopy','torrentz','thepiratebay','isohunt','kickass'];
        if (_lang['t'] === "ru") {
            def = ['nnm-club', 'rutracker', 'kinozal', 'rutor', 'rustorka', 'youtracker', 'hdclub', 'tfile', 'fast-torrent', 'opensharing', 'btdigg'];
        }
        var all = ['anidub', 'bestrepack', 'bigfangroup', 'bitsnoop', 'brodim', 'btdigg', 'evrl', 'extratorrent', 'fast-torrent', 'fenopy', 'filebase', 'free-torrents', 'hdclub', 'hurtom', 'inmac', 'isohunt', 'katushka', 'kickass', 'kinozal', 'libertorrent', 'megashara', 'mininova', 'nnm-club', 'opensharing', 'opentorrent', 'piratbit', 'piratca', 'rgfootball', 'riperam', 'rustorka', 'rutor', 'rutracker', 'tapochek', 'tfile', 'thepiratebay', 'thepiratebay2', 'torrentmac', 'torrents.freedom', 'torrents.local', 'torrentz', 'underverse', 'x-torrents', 'youtracker'];
        var torrentList = [];
        def.forEach(function(item) {
            torrentList.push({e: 1, n: item});
        });
        all.forEach(function(item) {
            if (def.indexOf(item) === -1) {
                torrentList.push({e: 0, n: item});
            }
        });
        return torrentList;
    };
    var defaultList = makeDefaultList();
    var costume_tr = null;
    var trackerProfiles = JSON.parse(GetSettings('trackerProfiles') || "[]");
    var defProfile = function() {
        var val = 0;
        if (trackerProfiles.length === 0) {
            trackerProfiles.push({
                Trackers: null,
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
        var removeItem = function(title) {
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
        var arr = [];
        $.each(trackerProfiles, function(k, v) {
            arr.push(v.Title);
        });
        return arr;
    };
    var loadCostumeModule = function(uid) {
        if ($.inArray(uid, costume_tr) === -1) {
            return;
        }
        var ct = GetSettings('ct_' + uid);
        if (ct === undefined) {
            //удалить из списка итп, конь в вакуме
            return;
        }
        ct = JSON.parse(ct);
        var l = torrent_lib.length;
        torrent_lib[l] = function(ct) {
            var id = null;
            var me = ct;
            var icon = ('icon' in me) ? me.icon : null;
            var name = ('name' in me) ? me.name : '-no name-';
            var about = ('about' in me) ? me.about : '';
            var root_url = ('root_url' in me) ? me.root_url : null;
            var short_url = ('root_url' in me) ? me.root_url.replace(/http(s?):\/\/([^\/]*)\/?.*$/, 'http$1://$2') : null;
            var login_url = ('auth' in me) ? me.auth : null;
            var filename = me.uid;
            var uid = me.uid;
            var tests = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            var flags = ('flags' in me) ? me.flags : {
                a: 0,
                l: 0,
                rs: 1
            };
            var xhr = null;
            var kit = function() {
                var readCode = function(c) {
                    c = view.contentFilter(c);
                    var t = view.load_in_sandbox(id, c);
                    var ex_cat = ('cat_name' in me) ? 1 : 0;
                    var ex_link = ('cat_link' in me) ? 1 : 0;
                    var ex_link_r = ('cat_link_r' in me && me.cat_link_r) ? 1 : 0;
                    var ex_tr_link_r = ('tr_link_r' in me && me.tr_link_r) ? 1 : 0;
                    var ex_tr_size = ('tr_size' in me) ? 1 : 0;
                    var ex_tr_size_c = ('s_c' in me && me.s_c) ? 1 : 0;
                    var ex_tr_dl = ('tr_dl' in me) ? 1 : 0;
                    var ex_tr_dl_r = ('tr_dl_r' in me) ? 1 : 0;
                    var ex_seed = ('seed' in me) ? 1 : 0;
                    var ex_peer = ('peer' in me) ? 1 : 0;
                    var ex_date = ('date' in me) ? 1 : 0;
                    var ex_date_regexp = ('t_r' in me && 't_r_r' in me) ? 1 : 0; //t_r t_r_r
                    var ex_size_regexp = ('size_r' in me && 'size_rp' in me) ? 1 : 0;
                    var ex_seed_regexp = ('seed_r' in me && 'seed_rp' in me) ? 1 : 0;
                    var ex_peer_regexp = ('peer_r' in me && 'peer_rp' in me) ? 1 : 0;
                    var ex_t_m_r = ('t_m_r' in me) ? 1 : 0;
                    var ex_t_t_r = ('t_t_r' in me) ? 1 : 0;
                    var ex_t_f = ('t_f' in me && me.t_f !== "-1") ? 1 : 0; //me.t_f is string from JSON
                    var ex_auth_f = ('auth_f' in me) ? 1 : 0;

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
                    var l = t.length - (('sl' in me) ? me.sl : 0);
                    var arr = [];
                    var s = ('sf' in me) ? me.sf : 0;
                    var er = [0, 0, 0, 0, 0, 0, 0, 0];
                    for (var i = s; i < l; i++) {
                        var td = t.eq(i);
                        var obj = {};
                        obj['category'] = {id: -1};
                        if (ex_cat) {
                            if ('cat_alt' in me) {
                                obj['category']['title'] = (td.find(me.cat_name)).attr('alt');
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
                            obj['size'] = (td.find(me.tr_size)).text();
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
                            obj['time'] = (td.find(me.date)).text();
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
                        console.log('Tracker ' + me.name + ' have problem!');
                        if (er[2])
                            console.log(er[2] + ' - torrent title skip');
                        if (er[3])
                            console.log(er[3] + ' - torrent url skip');
                        if (er[0])
                            console.log(er[0] + ' - cotegory title fix');
                        if (er[1])
                            console.log(er[1] + ' - cotegory url fix');
                        if (er[4])
                            console.log(er[4] + ' - sile size fix');
                        if (er[5])
                            console.log(er[5] + ' - dl link fix');
                        if (er[6])
                            console.log(er[6] + ' - seeds fix');
                        if (er[7])
                            console.log(er[7] + ' - leechs fix');
                        if (er[8])
                            console.log(er[8] + ' - time fix');
                    }
                    return arr;
                };
                var loadPage = function(text) {
                    var t = ('encode' in me && me.encode) ? ex_kit.in_cp1251(text) : text;
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
                    if ('post' in me && me.post.length > 0) {
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
            var setId = function(a) {
                id = a;
            };
            return {
                find: function(a) {
                    find(a);
                },
                setId: function(a) {
                    id = a;
                },
                id: id,
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
        ModuleLoaded(l);
    };
    var loadInternalModule = function(filename) {
        if (compression) {
            var c = torrent_lib.length;
            for (var i = 0; i < c; i++) {
                if (torrent_lib[i].filename === filename) {
                    ModuleLoaded(i);
                    break;
                }
            }
        } else {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'tracker/' + filename + '.js';
            script.dataset.id = 'tracker';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(script, s);
        }
    };
    var ModuleLoaded = function(num) {
        //Call from js-file tracker-module on load!
        var n = tracker.length;
        tracker[n] = torrent_lib[num];
        tracker[n].setId(n);
        //bug fix >
        tracker[n].id = n;
        //<
        view.addTrackerInList(n);
    };
    var addCostumTr = function(originalList) {
        //add in internal-tracker list costume torrents
        var newList = clone_obj(originalList);
        costume_tr = JSON.parse(GetSettings('costume_tr') || "[]");
        var l = costume_tr.length;
        for (var i = 0; i < l; i++) {
            var tr = JSON.parse(GetSettings('ct_' + costume_tr[i]) || "{}");
            if (tr.uid === undefined)
                continue;
            newList.push({
                e: 0,
                n: tr.uid,
                uid: tr.uid
            });
        }
        return newList;
    };
    var loadProfileModules = function(torrentList) {
        tracker = [];
        if (torrentList === null || torrentList.length === 0) {
            torrentList = addCostumTr(defaultList);
        }
        if (compression === 0) {
            $('script[data-id=tracker]').remove();
            torrent_lib = [];
        }

        var optionsMode = 0;
        if ("options" in window) {
            optionsMode = 1;
            var en_a = [];
            var defTrackers = addCostumTr(defaultList);
        }
        var Trackers = torrentList;
        var len = Trackers.length;
        for (var i = 0; i < len; i++) {
            if (Trackers[i].e) {
                if ('uid' in Trackers[i]) {
                    loadCostumeModule(Trackers[i].n);
                } else {
                    loadInternalModule(Trackers[i].n);
                }
                if (optionsMode) {
                    en_a.push(Trackers[i].n);
                }
            }
        }
        if (optionsMode) {
            var len = defTrackers.length;
            for (var i = 0; i < len; i++) {
                if (en_a.indexOf(defTrackers[i].n) === -1) {
                    if ('uid' in defTrackers[i]) {
                        loadCostumeModule(defTrackers[i].n);
                    } else {
                        loadInternalModule(defTrackers[i].n);
                    }
                }
            }
        }
    };
    var loadProfile = function(profile) {
        profile = parseInt(profile);
        view.ClearTrackerList();
        if (profile === undefined || isNaN(profile)) {
            profile = defProfile;
        }
        if (trackerProfiles[profile] === undefined) {
            loadProfileModules(null);
        } else {
            loadProfileModules(trackerProfiles[profile].Trackers);
            SetSettings('defProfile', profile);
        }
    };
    return {
        search: search,
        loadProfile: loadProfile,
        ModuleLoaded: ModuleLoaded,
        getProfileList: getProfileList,
        defaultList: addCostumTr(defaultList),
        getDefList: makeDefaultList
    };
}();
var ex_kit = function() {
    var in_cp1251 = function(sValue) {
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
    var format_size = function(s) {
        var size = s.toLowerCase().replace(/[^0-9.,кбмгтkmgtb]/g, '').replace(',', '.');
        var t = size.replace(/кб|kb/, '');
        if (t.length !== size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024);
        }
        var t = size.replace(/мб|mb/, '');
        if (t.length !== size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024 * 1024);
        }
        var t = size.replace(/гб|gb/, '');
        if (t.length !== size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024 * 1024 * 1024);
        }
        var t = size.replace(/тб|tb/, '');
        if (t.length !== size.length) {
            t = parseFloat(t);
            return Math.round(t * 1024 * 1024 * 1024 * 1024);
        }
        return 0;
    };
    function today_replace(t, f) {
        f = parseInt(f);
        t = t.toLowerCase();
        if ((/сейчас|now/).test(t)) {
            return Math.round((new Date()).getTime() / 1000);
        }
        var tt = new Date();
        var tty = new Date((Math.round(tt.getTime() / 1000) - 24 * 60 * 60) * 1000);
        if (f === 0) {
            var today = tt.getFullYear() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getDate() + ' ';
            var yesterday = tty.getFullYear() + ' ' + (tty.getMonth() + 1) + ' ' + tty.getDate() + ' ';
        } else {
            var today = tt.getDate() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getFullYear() + ' ';
            var yesterday = tty.getDate() + ' ' + (tty.getMonth() + 1) + ' ' + tty.getFullYear() + ' ';
        }
        t = t.replace(/сегодня|today/, today).replace(/вчера|yesterday/, yesterday);
        return t;
    }
    function month_replace(t) {
        return t.toLowerCase().replace(/янв/, '1').replace(/фев/, '2').replace(/мар/, '3')
                .replace(/апр/, '4').replace(/мая/, '5').replace(/июн/, '6')
                .replace(/июл/, '7').replace(/авг/, '8').replace(/сен/, '9')
                .replace(/окт/, '10').replace(/ноя/, '11').replace(/дек/, '12')
                //fix
                .replace(/май/, '5')
                //<fix
                .replace(/jan/, '1').replace(/feb/, '2').replace(/mar/, '3')
                .replace(/apr/, '4').replace(/may/, '5').replace(/jun/, '6')
                .replace(/jul/, '7').replace(/aug/, '8').replace(/sep/, '9')
                .replace(/oct/, '10').replace(/nov/, '11').replace(/dec/, '12');
    }
    var format_date = function(f, t) {
        if (f === undefined) {
            return ['2013-04-31[[[ 07]:03]:27]', '31-04-2013[[[ 07]:03]:27]', 'n day ago'];
        }
        f = parseInt(f);
        if (f === 0) { // || f === '2013-04-31[[[ 07]:03]:27]') {
            var dd = t.replace(/[^0-9]/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
            for (var i = 0; i < 6; i++) {
                if (dd[i] === undefined) {
                    dd[i] = 0;
                } else {
                    dd[i] = parseInt(dd[i]);
                    if (isNaN(dd[i])) {
                        if (i < 3) {
                            return 0;
                        } else {
                            dd[i] = 0;
                        }
                    }
                }
            }
            if (dd[0] < 10) {
                dd[0] = '200' + dd[0];
            } else
            if (dd[0] < 100) {
                dd[0] = '20' + dd[0];
            }
            return Math.round((new Date(dd[0], dd[1] - 1, dd[2], dd[3], dd[4], dd[5])).getTime() / 1000);
        }
        if (f === 1) { //  || f === '31-04-2013[[[ 07]:03]:27]') {
            var dd = t.replace(/[^0-9]/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
            for (var i = 0; i < 6; i++) {
                if (dd[i] === undefined) {
                    dd[i] = 0;
                } else {
                    dd[i] = parseInt(dd[i]);
                    if (isNaN(dd[i])) {
                        if (i < 3) {
                            return 0;
                        } else {
                            dd[i] = 0;
                        }
                    }
                }
            }
            if (dd[2] < 10) {
                dd[2] = '200' + dd[2];
            } else
            if (dd[2] < 100) {
                dd[2] = '20' + dd[2];
            }
            return Math.round((new Date(dd[2], dd[1] - 1, dd[0], dd[3], dd[4], dd[5])).getTime() / 1000);
        }
        if (f === 2) { //  || f === 'n day ago') {
            var old = parseFloat(t.replace(/[^0-9.]/g, '')) * 24 * 60 * 60;
            return Math.round((new Date()).getTime() / 1000) - old;
        }
    };
    var isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    return {
        isNumber: isNumber,
        in_cp1251: in_cp1251,
        format_size: format_size,
        month_replace: month_replace,
        format_date: format_date,
        today_replace: today_replace
    };
}();