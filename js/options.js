var option_mode = true;
var view = function () {
    var HideLeech = (GetSettings('HideLeech') !== undefined) ? parseInt(GetSettings('HideLeech')) : true;
    var HideSeed = (GetSettings('HideSeed') !== undefined) ? parseInt(GetSettings('HideSeed')) : false;
    var ShowIcons = (GetSettings('ShowIcons') !== undefined) ? parseInt(GetSettings('ShowIcons')) : 1;
    var HideZeroSeed = (GetSettings('HideZeroSeed') !== undefined) ? parseInt(GetSettings('HideZeroSeed')) : false;
    var AdvFiltration = (GetSettings('AdvFiltration') !== undefined) ? parseInt(GetSettings('AdvFiltration')) : 2;
    var AutoSetCategory = (GetSettings('AutoSetCategory') !== undefined) ? parseInt(GetSettings('AutoSetCategory')) : true;
    var TeaserFilter = (GetSettings('TeaserFilter') !== undefined) ? parseInt(GetSettings('TeaserFilter')) : false;
    var add_in_omnibox = (GetSettings('add_in_omnibox') !== undefined) ? parseInt(GetSettings('add_in_omnibox')) : true;
    var context_menu = (GetSettings('context_menu') !== undefined) ? parseInt(GetSettings('context_menu')) : true;
    var search_popup = (GetSettings('search_popup') !== undefined) ? parseInt(GetSettings('search_popup')) : false;
    var t_table_line = 0;
    var trackerProfiles = (GetSettings('trackerProfiles') !== undefined) ? JSON.parse(GetSettings('trackerProfiles')) : null;
    var oldProfileID = 0;
    var defProfile = oldProfileID = (GetSettings('defProfile') !== undefined) ? GetSettings('defProfile') : 0;
    var addTrackerInList = function (i) {
        var filename = tracker[i].filename;
        
        var id = $('div.profile select').val();
        if (trackerProfiles == null || trackerProfiles[id] == null) {
            trackerProfiles[id] = {
                Trackers : null,
                Title : _lang.label_def_profile //set lang var here
            }
        }
        var t = trackerProfiles[id].Trackers;
        if (t == null) t = engine.defaultList;
        var enable = false;
        var tc = t.length;
        for (var n = 0;n<tc;n++) {
            if (t[n].n == filename)
                enable = t[n].e;
        }
        t_table_line++;
        if ((t_table_line % 2) == 0) 
            hh = 'b' 
        else 
            hh = '';
        $('<tr'+((hh.length > 0)?' class="'+hh+'"':'')+' data-name="'+filename+'"/>').append($('<td/>').html('<img src="'+tracker[i].icon+'"/>')).append($('<td/>').html('<a href="'+tracker[i].url+'" target="_blank">'+tracker[i].name+'</a>')).append($('<td class="desc"/>').text(tracker[i].about)).append('<td class="status"><input type="checkbox" name="tracker" '+((enable)?'checked':'')+'></a>').appendTo($('#internalTrackers tbody'));
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
        
        $('input[name="add_in_omnibox"]').prop('checked',add_in_omnibox);
        $('input[name="context_menu"]').prop('checked',context_menu);
        $('input[name="search_popup"]').prop('checked',search_popup);
    }
    var saveCurrentProfile = function () {
        var tr = $('#internalTrackers tbody').children('tr');
        var trc = tr.length;
        
        var id = oldProfileID;
        if (trackerProfiles == null || trackerProfiles[id] == null) {
            return 1;
        }
        var internalTrackers = [];
        for (var i=0;i<trc;i++) {
            var fn = tr.eq(i).attr('data-name');
            var inp = tr.eq(i).children('td.status').children('input');
            internalTrackers[internalTrackers.length] = {
                'n' : fn , 
                'e': (inp.is(':checked'))?1:0
            };
        }
        trackerProfiles[id].Trackers = internalTrackers;
        return 1;
    }
    var save_settings = function () {
        saveCurrentProfile();
        SetSettings('trackerProfiles',JSON.stringify(trackerProfiles));
        HideZeroSeed = SetSettings('HideZeroSeed',($('input[name="zeroseed"]').is(':checked'))?1:0);
        ShowIcons = SetSettings('ShowIcons',($('input[name="icons"]').is(':checked'))?1:0);
        HideLeech = SetSettings('HideLeech',($('input[name="hideleech"]').is(':checked'))?1:0);
        HideSeed = SetSettings('HideSeed',($('input[name="hideseed"]').is(':checked'))?1:0);
        AutoSetCategory = SetSettings('AutoSetCategory',($('input[name="autosetcategory"]').is(':checked'))?1:0);
        TeaserFilter = SetSettings('TeaserFilter',($('input[name="teaserfilter"]').is(':checked'))?1:0);
        
        add_in_omnibox = SetSettings('add_in_omnibox',($('input[name="add_in_omnibox"]').is(':checked'))?1:0);
        context_menu = SetSettings('context_menu',($('input[name="context_menu"]').is(':checked'))?1:0);
        if (navigator.userAgent.search(/Chrome/) > 0) {
            var bgp = chrome.extension.getBackgroundPage();
            bgp.bg.update_context_menu();
            if (bgp._type_ext != null && bgp._type_ext == 1) {
                search_popup = SetSettings('search_popup',($('input[name="search_popup"]').is(':checked'))?1:0);
                bgp.update_btn();
            }
        }
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
        if (s.length > 0) { 
            var s = s.replace(/#back=(.*)/,'$1');
            window.location = 'index.html#s='+s;
        }
    }
    var ClearTrackerList = function () {
        $('#internalTrackers tbody').empty();
    }
    var LoadProfiles = function () {
        $('div.profile select').change(function () {
            if (saveCurrentProfile()) {
                oldProfileID = $(this).val();
                engine.loadProfile(oldProfileID);
            }
        });
        var arr = engine.getProfileList();
        var sel = $('div.profile select');
        $.each(arr, function (k,v) {
            sel.append('<option value="'+k+'" '+((k == defProfile)?'selected':'')+'>'+v+'</option>');
        });
        if (arr.length <= 1)
            $('div.profile input.rmbtn').attr('disabled','disabled');
        $('div.profile input.addbtn').unbind('click').click(function () {
            var name = $(this).parent().children('input[name=new_profile_name]').val();
            if (name.length < 1) return;
            $(this).parent().children('input[name=new_profile_name]').val('');
            trackerProfiles[trackerProfiles.length] = {
                Trackers : null,
                Title : name
            };
            if (saveCurrentProfile()) {
                oldProfileID = trackerProfiles.length-1;
                engine.loadProfile(oldProfileID);
            }
            updateProfileList();
        });
        $('div.profile input.rmbtn').unbind('click').click(function () {
            trackerProfiles.splice(oldProfileID,1);
            oldProfileID = defProfile;
            engine.loadProfile(oldProfileID);
            updateProfileList();
        });
    }
    var updateProfileList = function () {
        sel = $('div.profile select');
        sel.empty();
        $.each(trackerProfiles, function (k,v) {
            sel.append('<option value="'+k+'" '+((k == oldProfileID)?'selected':'')+'>'+v.Title+'</option>');
        });
        if (trackerProfiles.length <= 1)
            $('div.profile input.rmbtn').attr('disabled','disabled')
        else
            $('div.profile input.rmbtn').ramoveAttr('disabled');
    }
    return {
        LoadProfiles : function () {
            LoadProfiles();
        },
        ClearTrackerList : function () {
            ClearTrackerList()
        },
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
    
    $('title').text(_lang.stp_title);
    $('h2').text(_lang.stp_setup);
    $('div.save_panel').children('input').val(_lang.stp_save_btn);
    $('legend[data-lang=1]').text(_lang.stp_legend_1);
    $('legend[data-lang=7]').text(_lang.stp_legend_7);
    $('legend[data-lang=16]').text(_lang.stp_legend_16);
    $('legend[data-lang=20]').text(_lang.stp_legend_20);
    $('th[data-lang=2]').text(_lang.stp_th_2);
    $('th[data-lang=3]').text(_lang.stp_th_3);
    $('a[data-lang=4]').text(_lang.stp_th_4);
    $('a[data-lang=5]').text(_lang.stp_th_5);
    $('a[data-lang=6]').text(_lang.stp_th_6);
    $('span[data-lang=8]').text(_lang.stp_span_8);
    $('span[data-lang=9]').text(_lang.stp_span_9);
    $('span[data-lang=10]').text(_lang.stp_span_10);
    $('span[data-lang=11]').text(_lang.stp_span_11);
    $('span[data-lang=12]').text(_lang.stp_span_12);
    $('span[data-lang=13]').text(_lang.stp_span_13);
    $('span[data-lang=14]').text(_lang.stp_span_14);
    $('span[data-lang=15]').text(_lang.stp_span_15);
    $('span[data-lang=17]').text(_lang.stp_span_17);
    $('span[data-lang=18]').text(_lang.stp_span_18);
    $('span[data-lang=19]').text(_lang.stp_span_19);
    $('option[data-lang=21]').text(_lang.stp_opt_21);
    $('option[data-lang=22]').text(_lang.stp_opt_22);
    $('span[data-lang=23]').text(_lang.stp_opt_23);
    $('div.profile select').attr('title',_lang.label_profile);
    $('legend[data-lang=24]').text(_lang.label_profile);
    $('span[data-lang=26]').text(_lang.spn_26+': ');
    $('input[data-lang=25]').val(_lang.btn_25);
    $('input[data-lang=27]').val(_lang.btn_27);
    
    view.LoadProfiles();
    
    $('select[name=lang]').change(function () {
        if ($(this).val()!=_lang.t) {
            SetSettings('lang',$(this).val());
            top.location.reload();
        }
    });
    $('select[name=lang]').children('option[value='+_lang.t+']').attr('selected','selected');
    
    
    if (navigator.userAgent.search(/Chrome/) < 1) {
        $('input[name="add_in_omnibox"]').parent().hide();
        $('input[name="context_menu"]').parent().hide();
        $('input[name="search_popup"]').parent().hide();
    } else {
        var bgp = chrome.extension.getBackgroundPage();
        if (bgp._type_ext == null || bgp._type_ext == 0)
            $('input[name="search_popup"]').parent().hide();
    }
    $('form[name="save"]').submit(function (event) {
        event.preventDefault();
        view.save_settings();
        return false;
    });
    $('#internalTrackers').find('th').eq(3).children('a').eq(0).click(function (event) {
        event.preventDefault();
        $('#internalTrackers').children('tbody').find('input[type="checkbox"]').attr('checked','checked');
        return false;
    });
    $('#internalTrackers').find('th').eq(3).children('a').eq(1).click(function (event) {
        event.preventDefault();
        $('#internalTrackers').children('tbody').find('input[type="checkbox"]').removeAttr('checked');
        return false;
    });
    $('#internalTrackers').find('th').eq(3).children('a').eq(2).click(function (event) {
        event.preventDefault();
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