var option_mode = true;
var view = function () {
    var HideLeech = (localStorage.HideLeech !== undefined) ? parseInt(localStorage.HideLeech) : true;
    var HideSeed = (localStorage.HideSeed !== undefined) ? parseInt(localStorage.HideSeed) : false;
    var ShowIcons = (localStorage.ShowIcons !== undefined) ? parseInt(localStorage.ShowIcons) : 1;
    var HideZeroSeed = (localStorage.HideZeroSeed !== undefined) ? parseInt(localStorage.HideZeroSeed) : false;
    var AdvFiltration = (localStorage.AdvFiltration !== undefined) ? parseInt(localStorage.AdvFiltration) : 2;
    var AutoSetCategory = (localStorage.AutoSetCategory !== undefined) ? parseInt(localStorage.AutoSetCategory) : true;
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
        $('input[name="zeroseed"]').prop('checked',HideZeroSeed);
        $('input[name="icons"]').prop('checked',ShowIcons);
        $('input[name="hideleech"]').prop('checked',HideLeech);
        $('input[name="hideseed"]').prop('checked',HideSeed);
        $('input[name="typeFiltration"]').eq(AdvFiltration).prop('checked',true);
        $('input[name="autosetcategory"]').prop('checked',AutoSetCategory);
    }
    var save_settings = function () {
        var tr = $('#internalTrackers tbody').children('tr');
        var trc = tr.length;
        var internalTrackers = [];
        for (var i=0;i<trc;i++) {
            var fn = tr.eq(i).attr('data-name');
            var inp = tr.eq(i).children('td.status').children('input');
            internalTrackers[internalTrackers.length] = {
                'n' : fn , 
                'e': (inp.is(':checked'))?1:0
            };
        }
        localStorage.internalTrackers = JSON.stringify(internalTrackers);
        localStorage.HideZeroSeed = HideZeroSeed = ($('input[name="zeroseed"]').is(':checked'))?1:0;
        localStorage.ShowIcons = ShowIcons = ($('input[name="icons"]').is(':checked'))?1:0;
        localStorage.HideLeech = HideLeech = ($('input[name="hideleech"]').is(':checked'))?1:0;
        localStorage.HideSeed = HideSeed = ($('input[name="hideseed"]').is(':checked'))?1:0;
        localStorage.AutoSetCategory = AutoSetCategory = ($('input[name="autosetcategory"]').is(':checked'))?1:0;
        var tmp = $('input[name="typeFiltration"]');
        var tmp_l = tmp.length;
        for (var i = 0;i<tmp_l;i++)
            if (tmp.eq(i).is(':checked'))
            {
                localStorage.AdvFiltration = AdvFiltration = i;
                break;
            }
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