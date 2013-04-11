var tracker = [];
var engine = function() {
    var defaultList = [
        /*
         * e = включен по умолчанию
         */
        //русские с реги-ей
        {
            n: 'rutracker',
            e: 1
        },
        {
            n: 'nnm-club',
            e: 1
        },
        {
            n: 'kinozal',
            e: 1
        },
        {
            n: 'piratca',
            e: 0
        },
        {
            n: 'tapochek',
            e: 0
        },
        {
            n: 'bestrepack',
            e: 0
        },
        {
            n: 'pornolab',
            e: 0
        },
        {
            n: 'rustorka',
            e: 1
        },
        {
            n: 'inmac',
            e: 0
        },
        {
            n: 'anidub',
            e: 0
        },
        {
            n: 'free-torrents',
            e: 1
        },
        {
            n: 'my-hit',
            e: 0
        },
        {
            n: 'evrl',
            e: 0
        },
        {
            n: 'youtracker',
            e: 1
        },
        {
            n: 'rgfootball',
            e: 0
        },
        {
            n: 'mmatracker',
            e: 0
        },
        {
            n: 'filebase',
            e: 0
        },
        {
            n: 'x-torrents',
            e: 0
        },
        {
            n: 'piratbit',
            e: 0
        },
        {
            n: 'underverse',
            e: 1
        },
        {
            n: 'libertorrent',
            e: 0
        },
        {
            n: 'riperam',
            e: 0
        },
        {
            n: 'brodim',
            e: 0
        },
        {
            n: 'hdclub',
            e: 0
        },
        {
            n: 'bigfangroup',
            e: 0
        },
        //с рег-ей иност.
        {
            n: 'hurtom',
            e: 0
        },
        //локальные
        {
            n: 'torrents.local',
            e: 0
        },
        {
            n: 'torrents.freedom',
            e: 0
        },
        {
            n: 'opentorrent',
            e: 0
        },
        //русские без авт..
        {
            n: 'torrentmac',
            e: 0
        },
        {
            n: 'tfile',
            e: 1
        },
        {
            n: 'fast-torrent',
            e: 1
        },
        {
            n: 'rutor',
            e: 0
        },
        {
            n: 'opensharing',
            e: 0
        },
        {
            n: 'megashara',
            e: 0
        },
        {
            n: 'torrentino',
            e: 0
        },
        {
            n: 'katushka',
            e: 0
        },
        {
            n: 'btdigg',
            e: 1
        },
        //зарубеж.
        {
            n: 'thepiratebay',
            e: 0
        },
        {
            n: 'thepiratebay2',
            e: 0
        },
        {
            n: 'kickass',
            e: 0
        },
        {
            n: 'bitsnoop',
            e: 0
        },
        {
            n: 'extratorrent',
            e: 0
        },
        {
            n: 'isohunt',
            e: 0
        },
        {
            n: 'fenopy',
            e: 0
        },
        {
            n: 'torrentz',
            e: 0
        },
        {
            n: 'mininova',
            e: 0
        }
    ];
    var costume_tr = null; //load when add costume torrent function
    var categorys = _lang['categorys'];
    var trackerProfiles = (GetSettings('trackerProfiles') !== undefined) ? JSON.parse(GetSettings('trackerProfiles')) : null;
    var defProfile = (GetSettings('defProfile') !== undefined) ? GetSettings('defProfile') : 0;
    var search = function(text, tracker_id, nohistory) {
        if (tracker_id != null) {
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
        if (nohistory == null)
            updateHistory(text);
    }
    var LimitHistory = function() {
        var removeItem = function(title) {
            var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
            if (search_history != null) {
                var count = search_history.length;
                for (var i = 0; i < count; i++) {
                    if (search_history[i].title == title) {
                        search_history.splice(i, 1);
                        break;
                    }
                }
                SetSettings('search_history', JSON.stringify(search_history));
            }
        }
        var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
        if (search_history == null)
            return;
        var count = search_history.length;
        if (count >= 200) {
            var order = function(a, b) {
                if (a.time > b.time)
                    return -1;
                if (a.time == b.time)
                    return 0;
                return 1;
            }
            search_history.sort(order);
            var title = search_history[count - 1].title;
            search_history = null;
            removeItem(title);
        }
    }
    var updateHistory = function(title) {
        if (title.length == 0)
            return;
        LimitHistory();
        var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
        if (search_history != null) {
            var count = search_history.length;
            var find = false;
            for (var i = 0; i < count; i++) {
                if (search_history[i].title == title) {
                    search_history[i].count = parseInt(search_history[i].count) + 1;
                    search_history[i].time = Math.round((new Date()).getTime() / 1000);
                    find = true;
                }
            }
            if (find == false) {
                search_history[count] = {
                    'title': title,
                    count: 1,
                    time: Math.round((new Date()).getTime() / 1000)
                }
            }
        } else {
            search_history = [];
            search_history[0] = {
                'title': title,
                count: 1,
                time: Math.round((new Date()).getTime() / 1000)
            }
        }
        SetSettings('search_history', JSON.stringify(search_history));
        view.AddAutocomplete();
    }
    var loadCostumeModule = function(uid) {
        if ($.inArray(uid, costume_tr) == -1) {
            return;
        }
        var ct = GetSettings('ct_' + uid);
        if (!ct) {
            //удалить из списка итп, конь в вакуме
            return;
        }
        ct = JSON.parse(ct);
        var l = tracker.length;
        tracker[l] = function(ct) {
            var id = null;
            var me = ct;
            var icon = ('icon' in me) ? me.icon : null;
            var name = ('name' in me) ? me.name : '-no name-';
            var about = ('about' in me) ? me.about : '';
            var root_url = ('root_url' in me) ? me.root_url : null;
            var login_url = ('auth' in me) ? me.auth : null;
            var filename = me.uid;
            var uid = me.uid;
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
                    var ex_t_m_r = ('t_m_r' in me) ? 1 : 0;
                    var ex_t_f = ('t_f' in me && me.t_f != -1) ? 1 : 0;
                    var ex_auth_f = ('auth_f' in me) ? 1 : 0;

                    if (ex_auth_f) {
                        if ((t.find(me.auth_f)).length > 0) {
                            view.auth(0, id);
                            return [];
                        } else {
                            view.auth(1, id);
                        }
                    }
                    t = t.find(me.items)
                    var l = t.length - (('sl' in me) ? me.sl : 0);
                    var arr = [];
                    var s = ('sf' in me) ? me.sf : 0;
                    for (var i = s; i < l; i++) {
                        var td = t.eq(i);
                        var obj = {};
                        obj['category'] = {id: -1}
                        if (ex_cat) {
                            obj['category']['title'] = (td.find(me.cat_name)).text();
                            if (ex_link) {
                                obj['category']['url'] = ((ex_link_r) ? root_url : '') + (td.find(me.cat_link)).attr('href');
                            }
                        }
                        obj['title'] = (td.find(me.tr_name)).text();
                        obj['url'] = ((ex_tr_link_r) ? root_url : '') + (td.find(me.tr_link)).attr('href');
                        if (ex_tr_size) {
                            obj['size'] = (td.find(me.tr_size)).text();
                            if (ex_tr_size_c) {
                                obj['size'] = ex_kit.format_size(obj['size']);
                            }
                        } else {
                            obj['size'] = 0;
                        }
                        if (ex_tr_dl) {
                            obj['dl'] = ((ex_tr_dl_r) ? root_url : '') + (td.find(me.tr_dl)).attr('href');
                        }
                        if (ex_seed) {
                            obj['seeds'] = (td.find(me.seed)).text();
                            if (!ex_kit.isNumber(obj['seeds'])) {
                                obj['seeds'] = 1;
                            }
                        } else {
                            obj['seeds'] = 1;
                        }
                        if (ex_peer) {
                            obj['leechs'] = (td.find(me.peer)).text();
                            if (!ex_kit.isNumber(obj['leechs'])) {
                                obj['leechs'] = 0;
                            }
                        } else {
                            obj['leechs'] = 0;
                        }
                        if (ex_date) {
                            obj['time'] = (td.find(me.date)).text();
                            if (ex_date_regexp) {
                                obj['time'] = obj['time'].replace(new RegExp(me.t_r, "ig"), me.t_r_r);
                            }
                            if (ex_t_m_r) {
                                obj['time'] = ex_kit.month_replace(obj['time']);
                            }
                            if (ex_t_f) {
                                obj['time'] = ex_kit.format_date(me.t_f, obj['time']);
                            }
                        } else {
                            obj['time'] = 0;
                        }
                        arr[arr.length] = obj
                    }
                    return arr;
                }
                var loadPage = function(text) {
                    var t = ('encode' in me && me.encode) ? ex_kit.in_cp1251(text) : text;
                    if (xhr != null)
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
                    }
                    if ('post' in me && me.post.length > 0) {
                        obj_req.type = 'POST';
                        obj_req.data = me.post.replace('%search%', t);
                    }
                    xhr = $.ajax(obj_req);
                }
                return {
                    getPage: function(a) {
                        return loadPage(a);
                    }
                }
            }();
            var find = function(text) {
                kit.getPage(text);
            }
            var setId = function(a) {
                id = a;
            }
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
                uid: uid
            }
        }(ct);
        engine.ModuleLoaded(l);
    }
    function clone_obj(obj) {
        if (null == obj || "object" != typeof obj)
            return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr))
                copy[attr] = obj[attr];
        }
        return copy;
    }
    var addCostumTr = function(a) {
        var b = clone_obj(a);
        costume_tr = (GetSettings('costume_tr') !== undefined) ? JSON.parse(GetSettings('costume_tr')) : [];
        var l = costume_tr.length;
        for (var i = 0; i < l; i++) {
            var tr = (GetSettings('ct_' + costume_tr[i]) !== undefined) ? JSON.parse(GetSettings('ct_' + costume_tr[i])) : null;
            if (tr == null)
                continue;
            b[b.length] = {
                e: 0,
                n: tr.name,
                uid: tr.uid
            }
        }
        return b
    }
    var loadInternalModule = function(name) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'tracker/' + name + '.js';
        script.dataset.id = 'tracker'
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(script, s);
    }
    var loadModules = function(internalTrackers) {
        $('script[data-id=tracker]').remove();
        tracker = [];
        if (internalTrackers == null || "options" in window) {
            var Trackers = addCostumTr(defaultList);
        } else {
            var Trackers = internalTrackers;
        }
        if (Trackers[0].e == null)
        {
            Trackers = addCostumTr(defaultList);
        }
        var l = Trackers.length;
        for (var i = 0; i < l; i++) {
            if (Trackers[i].e || "options" in window) {
                if ('uid' in Trackers[i]) {
                    loadCostumeModule(Trackers[i].uid);
                } else {
                    loadInternalModule(Trackers[i].n);
                }
            }
        }
    }
    var loadProfile = function(prof) {
        view.ClearTrackerList();
        if (prof == null) {
            prof = defProfile;
        }
        if (trackerProfiles == null) {
            var internalTrackers = (GetSettings('internalTrackers') !== undefined) ? JSON.parse(GetSettings('internalTrackers')) : null;
            trackerProfiles = [{
                    Trackers: internalTrackers,
                    Title: _lang.label_def_profile
                }]
            SetSettings('trackerProfiles', JSON.stringify(trackerProfiles));
            SetSettings('defProfile', defProfile);
            SetSettings('internalTrackers', null);
        }
        if (trackerProfiles[prof] == null) {
            loadModules(null)
        } else {
            loadModules(trackerProfiles[prof].Trackers);
            SetSettings('defProfile', prof);
        }
    }
    var getProfileList = function() {
        var arr = [];
        $.each(trackerProfiles, function(k, v) {
            arr[arr.length] = v.Title
        });
        return arr;
    }
    var ModuleLoaded = function(n) {
        v = tracker[n];
        v.setId(n);
        view.addTrackerInList(n);
    }
    return {
        search: function(a, b, c) {
            return search(a, b, c)
        },
        loadProfile: function(a) {
            loadProfile(a);
        },
        ModuleLoaded: function(a) {
            ModuleLoaded(a);
        },
        getProfileList: function() {
            return getProfileList();
        },
        defaultList: addCostumTr(defaultList),
        categorys: categorys
    }
}();
$(function() {
    engine.loadProfile();
});
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
    var isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    return {
        isNumber: function(a) {
            return isNumber(a);
        },
        in_cp1251: function(a) {
            return in_cp1251(a)
        },
        format_size: function(a) {
            return format_size(a);
        },
        month_replace: function(a) {
            return month_replace(a);
        },
        format_date: function(a, b) {
            return format_date(a, b)
        }
    }
}();