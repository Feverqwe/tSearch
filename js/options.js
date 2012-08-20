var option_mode = true;
var view = function () {
    var HideLeech = (GetSettings('HideLeech') !== undefined) ? parseInt(GetSettings('HideLeech')) : true;
    var HideSeed = (GetSettings('HideSeed') !== undefined) ? parseInt(GetSettings('HideSeed')) : false;
    var ShowIcons = (GetSettings('ShowIcons') !== undefined) ? parseInt(GetSettings('ShowIcons')) : 1;
    var HideZeroSeed = (GetSettings('HideZeroSeed') !== undefined) ? parseInt(GetSettings('HideZeroSeed')) : false;
    var AdvFiltration = (GetSettings('AdvFiltration') !== undefined) ? parseInt(GetSettings('AdvFiltration')) : 2;
    var AutoSetCategory = (GetSettings('AutoSetCategory') !== undefined) ? parseInt(GetSettings('AutoSetCategory')) : true;
    var TeaserFilter = (GetSettings('TeaserFilter') !== undefined) ? parseInt(GetSettings('TeaserFilter')) : false;
    var addTrackerInList = function (i) {
        var filename = tracker[i].filename;
        var t = (GetSettings('internalTrackers') !== undefined) ? JSON.parse(GetSettings('internalTrackers')) : null;
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
        $('input[name="teaserfilter"]').prop('checked',TeaserFilter);
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
        SetSettings('internalTrackers',JSON.stringify(internalTrackers));
        HideZeroSeed = SetSettings('HideZeroSeed',($('input[name="zeroseed"]').is(':checked'))?1:0);
        ShowIcons = SetSettings('ShowIcons',($('input[name="icons"]').is(':checked'))?1:0);
        HideLeech = SetSettings('HideLeech',($('input[name="hideleech"]').is(':checked'))?1:0);
        HideSeed = SetSettings('HideSeed',($('input[name="hideseed"]').is(':checked'))?1:0);
        AutoSetCategory = SetSettings('AutoSetCategory',($('input[name="autosetcategory"]').is(':checked'))?1:0);
        TeaserFilter = SetSettings('TeaserFilter',($('input[name="teaserfilter"]').is(':checked'))?1:0);
        var tmp = $('input[name="typeFiltration"]');
        var tmp_l = tmp.length;
        for (var i = 0;i<tmp_l;i++)
            if (tmp.eq(i).is(':checked'))
            {
                AdvFiltration = SetSettings('AdvFiltration',i);
                break;
            }
        showProgress();
        loadSettings();
        var s = (document.URL).replace(/(.*)options.html/,'');
        if (s!= '') { 
            var s = s.replace(/#back=(.*)/,'$1');
            window.location = 'index.html#s='+s;
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
    $('#internalTrackers').find('th').eq(1).children('a').eq(0).click(function () {
        $('#internalTrackers').children('tbody').find('input[type="checkbox"]').attr('checked','checked');
        return false;
    });
    $('#internalTrackers').find('th').eq(1).children('a').eq(1).click(function () {
        $('#internalTrackers').children('tbody').find('input[type="checkbox"]').removeAttr('checked');
        return false;
    });
    $('#internalTrackers').find('th').eq(1).children('a').eq(2).click(function () {
        $('#internalTrackers').children('tbody').find('input[type="checkbox"]').removeAttr('checked');
        var Trackers = engine.defaultList;
        var l = Trackers.length;
        for (var i=0;i<l;i++)
            if (Trackers[i].e)
                    $('#internalTrackers').children('tbody').children('tr[data-name="'+Trackers[i].n+'"]').find('input[type="checkbox"]').attr('checked','checked');
        return false;
    });
    view.loadSettings();
});