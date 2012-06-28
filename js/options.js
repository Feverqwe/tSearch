var option_mode = true;
var view = function () {
    var ShowIcons = (localStorage.ShowIcons !== undefined) ? parseInt(localStorage.ShowIcons) : 1;
    var AdvFiltration = (localStorage.AdvFiltration !== undefined) ? parseInt(localStorage.AdvFiltration) : 1;
    var addTrackerInList = function (i) {
        var filename = tracker[i].filename;
        var t = (localStorage.internalTrackers !== undefined) ? JSON.parse(localStorage.internalTrackers) : null;
        if (t == null) t = engine.defaultList;
        var tc = t.length;
        var enable = false;
        for (var n = 0;n<tc;n++) {
            if (t[n].n == filename)
                enable = t[n].e;
        }
        $('<tr data-name="'+filename+'"/>').append($('<td/>').text(tracker[i].name)).append('<td class="status"><input type="checkbox" name="tracker" '+((enable)?'checked':'')+'></a>').appendTo($('#internalTrackers tbody'));
    }
    var showProgress = function () {
        $('div.progress').css('display','inline-block');
        window.setTimeout(function () {
            $('div.progress').css('display','none');
        }, 1000);
    }
    var loadSettings = function () {
        $('input[name="icons"]').prop('checked',ShowIcons);
        $('input[name="AdvFiltration"]').prop('checked',AdvFiltration);
    }
    var save_settings = function () {
        var tr = $('#internalTrackers tbody').children('tr');
        var trc = tr.length;
        var internalTrackers = [];
        for (var i=0;i<trc;i++) {
            var fn = tr.eq(i).data('name');
            var inp = tr.eq(i).children('td.status').children('input');
            internalTrackers[internalTrackers.length] = {
                'n' : fn , 
                'e': (inp.is(':checked'))?1:0
                };
        }
        localStorage.internalTrackers = JSON.stringify(internalTrackers);
        localStorage.ShowIcons = ShowIcons = ($('input[name="icons"]').is(':checked'))?1:0;
        localStorage.AdvFiltration = AdvFiltration = ($('input[name="AdvFiltration"]').is(':checked'))?1:0;
        showProgress();
        loadSettings();
        var s = (document.URL).replace(/(.*)options.html/,'');
        if (s!= '') { 
            var s = s.replace(/#back=(.*)/,'$1');
            window.location = '/index.html#s='+s;
        }
    }
    return {
        addTrackerInList : function (a) {
            addTrackerInList(a);
        },
        save_settings : function () {
            save_settings();
        },
        loadSettings : function () {
            loadSettings();
        }
    }
}();
$(function () {
    $('form[name="save"]').submit(function () {
        view.save_settings();
        return false;
    });
    view.loadSettings();
});