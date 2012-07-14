var tracker = [];
var option_mode = false;
var engine = function () {
    var defaultList = [
    {
        n : 'tfile',
        e : 1
    },

    {
        n : 'rutracker',
        e : 1
    },


    {
        n : 'rutor',
        e : 1
    },


    {
        n : 'opensharing',
        e : 1
    },


    {
        n : 'nnm-club', 
        e : 1
    },

    {
        n : 'megashara', 
        e : 1
    },

    {
        n : 'kinozal', 
        e : 1
    },

    {
        n : 'torrents.local', 
        e : 0
    },

    {
        n : 'pornolab', 
        e : 0
    },

    {
        n : 'torrents.freedom', 
        e : 0
    },

    {
        n : 'thepiratebay', 
        e : 1
    },

    {
        n : 'rustorka', 
        e : 1
    },

    {
        n : 'inmac', 
        e : 0
    }
    ];
    var categorys = [
    [3,'Фильмы'],
    [0,'Сериалы'],
    [7,'Анимэ'],
    [8,'Док. и юмор'],
    [1,'Музыка'],
    [2,'Игры'],
    [5,'Книги'],
    [4,'Мультфтльмы'],
    [6,'ПО'],
    [9,'Спорт'],
    [10,'Порно'],
    [-1,'Прочие']
    ];
    var internalTrackers = (localStorage.internalTrackers !== undefined) ? JSON.parse(localStorage.internalTrackers) : null;
    var search = function(text) {
        $.each(tracker, function (k, v) {
            try {
                v.find(text);
                view.loadingStatus(0,k);
            } catch(err) {
                view.loadingStatus(2,k);
            }
        });
        updateHistory(text);
    }
    var LimitHistory = function () {
        var removeItem = function (title) {
            var search_history = (localStorage.search_history !== undefined) ? JSON.parse(localStorage.search_history) : null;
            if (search_history != null) {
                var count = search_history.length;
                for (var i=0;i<count;i++) {
                    if (search_history[i].title == title) {
                        search_history.splice(i,1);
                        break;
                    }
                }
                localStorage.search_history = JSON.stringify(search_history);
            }
        }
        var search_history = (localStorage.search_history !== undefined) ? JSON.parse(localStorage.search_history) : null;
        if (search_history == null) return;
        var count = search_history.length;
        if (count >= 50) {
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
        if (title == '') return;
        LimitHistory();
        var search_history = (localStorage.search_history !== undefined) ? JSON.parse(localStorage.search_history) : null;
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
        localStorage.search_history = JSON.stringify(search_history);
        view.AddAutocomplete();
    }
    var loadInternalModule = function (name) {
        var script= document.createElement('script');
        script.async= 'async';
        script.src= '/tracker/'+name+'.js';
        document.head.appendChild(script);
    }
    var loadExternalModule = function (url) {
        var script= document.createElement('script');
        script.async= 'async';
        script.src= url;
        document.head.appendChild(script);
    }
    var loadModules = function () {
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
    var ModuleLoaded = function (n) {
        v = tracker[n];
        v.setId(n);
        view.addTrackerInList(n);
    }
    return {
        search : function (a) {
            return search(a)
        },
        loadModules : function () {
            loadModules();
        },
        ModuleLoaded : function (a) {
            ModuleLoaded(a);
        },
        defaultList : defaultList,
        categorys : categorys
    }
}();
$(function () {
    engine.loadModules();
})