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