var tracker = [];
var option_mode = false;
var engine = function () {
    var defaultList = [
    /*
     * e = включен по умолчанию
     */
    //русские с реги-ей
    {
        n : 'rutracker',
        e : 1
    },
    {
        n : 'nnm-club', 
        e : 1
    },
    {
        n : 'kinozal', 
        e : 1
    },
    {
        n : 'pornolab', 
        e : 0
    },
    {
        n : 'rustorka', 
        e : 1
    },
    //{
    //    n : 'inmac', 
    //    e : 0
    //},
    {
        n : 'anidub', 
        e : 0
    },
    {
        n : 'free-torrents', 
        e : 1
    },
    {
        n : 'my-hit', 
        e : 0
    },
    {
        n : 'evrl', 
        e : 0
    },
    {
        n: 'youtracker',
        e: 1
    },
    {
        n : 'rgfootball', 
        e : 0
    },
    {
        n : 'mmatracker', 
        e : 0
    },
    {
        n : 'filebase', 
        e : 0
    },
    {
        n : 'x-torrents', 
        e : 0
    },
    {
        n : 'piratbit', 
        e : 0
    },
    {
        n : 'underverse', 
        e : 1
    },
    {
        n : 'libertorrent', 
        e : 0
    },
    {
        n : 'riperam',
        e : 0
    },
    {
        n : 'brodim',
        e : 0
    },
    //с рег-ей иност.
    {
        n : 'hurtom', 
        e : 0
    },
    //локальные
    {
        n : 'torrents.local', 
        e : 0
    },
    {
        n : 'torrents.freedom', 
        e : 0
    },
    {
        n : 'opentorrent', 
        e : 0
    },
    //русские без авт..
    {
        n : 'tfile',
        e : 1
    },
    {
        n : 'fast-torrent', 
        e : 1
    },
    {
        n : 'rutor',
        e : 0
    },
    {
        n : 'opensharing',
        e : 0
    },
    {
        n : 'megashara', 
        e : 0
    },
    {
        n : 'torrentino', 
        e : 0
    },
    {
        n : 'katushka', 
        e : 0
    },
    {
        n: 'btdigg',
        e: 1
    },
    //зарубеж.
    {
        n : 'thepiratebay', 
        e : 0
    },
    {
        n : 'thepiratebay2', 
        e : 0
    },
    {
        n : 'kickass', 
        e : 0
    },
    {
        n : 'bitsnoop', 
        e : 0
    },
    {
        n : 'extratorrent', 
        e : 0
    },
    {
        n : 'isohunt', 
        e : 0
    },
    {
        n : 'fenopy', 
        e : 0
    },
    {
        n : 'torrentz', 
        e : 0
    },
    {
        n : 'mininova', 
        e : 0
    }
    ];
    var categorys = _lang['categorys'];
    var trackerProfiles = (GetSettings('trackerProfiles') !== undefined) ? JSON.parse(GetSettings('trackerProfiles')) : null;
    var defProfile = (GetSettings('defProfile') !== undefined) ? GetSettings('defProfile') : 0;
    var search = function(text,tracker_id,nohistory) {
        if (tracker_id != null) {
            try {
                tracker[tracker_id].find(text);
                view.loadingStatus(0,tracker_id);
            } catch(err) {
                view.loadingStatus(2,tracker_id);
            }
        } else {
            $.each(tracker, function (k, v) {
                try {
                    v.find(text);
                    view.loadingStatus(0,k);
                } catch(err) {
                    view.loadingStatus(2,k);
                }
            });
        }
        if (nohistory == null)
            updateHistory(text);
    }
    var LimitHistory = function () {
        var removeItem = function (title) {
            var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
            if (search_history != null) {
                var count = search_history.length;
                for (var i=0;i<count;i++) {
                    if (search_history[i].title == title) {
                        search_history.splice(i,1);
                        break;
                    }
                }
                SetSettings('search_history',JSON.stringify(search_history));
            }
        }
        var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
        if (search_history == null) return;
        var count = search_history.length;
        if (count >= 200) {
            var order = function (a,b) {
                if (a.time > b.time)
                    return -1;
                if (a.time == b.time)
                    return 0;
                return 1;
            }
            search_history.sort(order);
            var title = search_history[count-1].title;
            search_history = null;
            removeItem(title);
        }
    }
    var updateHistory = function (title) {
        if (title.length == 0) return;
        LimitHistory();
        var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
        if (search_history != null) {
            var count = search_history.length;
            var find = false;
            for (var i=0;i<count;i++) {
                if (search_history[i].title == title) {
                    search_history[i].count = parseInt(search_history[i].count)+1;
                    search_history[i].time = Math.round((new Date()).getTime() / 1000);
                    find = true;
                }
            }
            if (find == false) {
                search_history[count] = {
                    'title' : title,
                    count   : 1,
                    time    : Math.round((new Date()).getTime() / 1000)
                }
            }
        } else {
            search_history = [];
            search_history[0] = {
                'title' : title,
                count   : 1,
                time    : Math.round((new Date()).getTime() / 1000)
            }
        }
        SetSettings('search_history',JSON.stringify(search_history));
        view.AddAutocomplete();
    }
    var loadInternalModule = function (name) {
        var script= document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'tracker/'+name+'.js';
        script.dataset.id='tracker'
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(script, s);
    }
    var loadModules = function (internalTrackers) {
        $('script[data-id=tracker]').remove();
        tracker = [];
        if (internalTrackers == null || option_mode == true)
            var Trackers = defaultList;
        else
            var Trackers = internalTrackers;
        if (Trackers[0].e == null)
        {
            Trackers = defaultList;
        }
        var l = Trackers.length;
        for (var i=0;i<l;i++)
            if (Trackers[i].e || option_mode == true)
                loadInternalModule(Trackers[i].n);
    }
    var loadProfile = function (prof) {
        view.ClearTrackerList();
        if (prof == null)
            prof = defProfile;
        if (trackerProfiles == null) {
            var internalTrackers = (GetSettings('internalTrackers') !== undefined) ? JSON.parse(GetSettings('internalTrackers')) : null;
            trackerProfiles = [{
                Trackers : internalTrackers,
                Title : _lang.label_def_profile //set lang var here
            }]
            SetSettings('trackerProfiles',JSON.stringify(trackerProfiles));
            SetSettings('defProfile',defProfile);
            SetSettings('internalTrackers',null);
        }
        if (trackerProfiles != null) {
            if (trackerProfiles[prof] == null)
                loadModules(null)
            else {
                loadModules(trackerProfiles[prof].Trackers);
                SetSettings('defProfile',prof);
            }
        }
    }
    var getProfileList = function () {
        var arr = [];
        $.each(trackerProfiles, function (k,v) {
            arr[arr.length] = v.Title
        });
        return arr;
    }
    var ModuleLoaded = function (n) {
        v = tracker[n];
        v.setId(n);
        view.addTrackerInList(n);
    }
    return {
        search : function (a,b,c) {
            return search(a,b,c)
        },
        loadProfile : function (a) {
            loadProfile(a);
        },
        ModuleLoaded : function (a) {
            ModuleLoaded(a);
        },
        getProfileList : function () {
            return getProfileList();
        },
        defaultList : defaultList,
        categorys : categorys
    }
}();
$(function () {
    engine.loadProfile();
})