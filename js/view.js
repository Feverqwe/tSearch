var view = function () {
    var trackerFilter = null;
    var keywordFilter = null;
    var categoryFilter = null;
    var categorys = null;
    var lastFilterWord = '';
    var autoMove = null;
    var HideLeech = (GetSettings('HideLeech') !== undefined) ? parseInt(GetSettings('HideLeech')) : true;
    var HideSeed = (GetSettings('HideSeed') !== undefined) ? parseInt(GetSettings('HideSeed')) : false;
    var ShowIcons = (GetSettings('ShowIcons') !== undefined) ? parseInt(GetSettings('ShowIcons')) : true;
    var HideZeroSeed = (GetSettings('HideZeroSeed') !== undefined) ? parseInt(GetSettings('HideZeroSeed')) : false;
    var AdvFiltration = (GetSettings('AdvFiltration') !== undefined) ? parseInt(GetSettings('AdvFiltration')) : 2;
    var TeaserFilter = (GetSettings('TeaserFilter') !== undefined) ? parseInt(GetSettings('TeaserFilter')) : false;
    var update_table = {
        timer: null,
        time: null
    };
    var auth = function (s,t) {
        $('ul.trackers').children('li[data-id="'+t+'"]').children('ul').remove();
        if (!s)
            $('ul.trackers').children('li[data-id="'+t+'"]').append('<ul><li><a href="'+tracker[t].login_url+'" target="_blank">'+_lang['btn_login']+'</a></li></ul>');
    }
    var clear_table = function () {
        $('#rez_table').children('tbody').empty();
        $('div.filter').children('input').val('');
        keywordFilter = null;
        lastFilterWord = '';
        $('div.filter div.btn').hide();
        $('ul.trackers li a.selected').removeClass('selected');
        $('ul.trackers li').attr('data-count',0);
        updateTrackerCount();
        trackerFilter = null;
        updateCategorys();
    }
    var loadingStatus  = function (s,t) {
        var tracker_img = $('ul.trackers').children('li[data-id="'+t+'"]').children('div.tracker_icon');
        switch (s) {
            case 0:
                tracker_img.css('background-image','url(images/loading.gif)');
                break;
            case 1:
                tracker_img.removeAttr('style');
                break;
            case 2:
                tracker_img.css('background-image','url(images/error.png)');
                break;
        }
    }
    var addTrackerInList = function (i) {
        $('body').append('<style>div.tracker_icon.num'+i+' { background-image: url('+tracker[i].icon+'); }</style>');
        $('<li data-id="'+i+'"/>').append($('<div class="tracker_icon num'+i+'" data-count="0"/>')).append($('<a href="#">'+tracker[i].name+'</a>').click(function() {
            if ($(this).attr('class') == 'selected') {
                $(this).removeClass('selected');
                trackerFilter = null;
            } else {
                $('ul.trackers li a.selected').removeClass('selected');
                $(this).addClass('selected');
                trackerFilter = $(this).parent('li').attr('data-id');
            }
            updateCategorys();
            $('ul.categorys').children('li.selected').trigger('click');
            return false;
        })).append('<i/>').appendTo($('ul.trackers'));
    }
    function isInt(n) {
        if (n == undefined || n === undefined) return false;
        return n % 1 === 0;
    }
    var write_result = function (t,a,s) {
        var c = '';
        $('#rez_table').children('tbody').children('tr[data-tracker="'+t+'"]').remove();
        var s_s = contentFilter(s.replace(/\s+/g," ").replace(/</g,"&lt;").replace(/>/g,"&gt;"));
        var sum = 0;
        $.each(a, function (k,v) {
            var quality = {
                seed : 0,
                name : 0,
                video : 0,
                music : 0,
                game : 0,
                value : 0
            };
            if (HideZeroSeed && v.seeds == 0) return true;
            var title = filterText(s_s,v.title);
            if (TeaserFilter) {
                var Teaser = ((/Трейлер/i).test(title.n))?1:
                ((/Тизер/i).test(title.n))?1:
                ((/Teaser/i).test(title.n))?1:
                ((/Trailer/i).test(title.n))?1:
                0;
                if (Teaser == 1) return true;
                if (v.category.title != null) {
                    Teaser = ((/Трейлер/i).test(v.category.title))?1:
                    ((/Тизер/i).test(v.category.title))?1:
                    ((/Teaser/i).test(v.category.title))?1:
                    ((/Trailer/i).test(v.category.title))?1:
                    0;
                    if (Teaser == 1) return true;
                }
            }
            if (v.title == undefined || !isInt(v.size) || !isInt(v.seeds) 
                || !isInt(v.leechs) || !isInt(v.time) || !isInt(v.category.id)
                || (v.category.title != null && v.category.title == undefined)
                || (v.category.url != null && v.category.url == undefined)
                || (v.dl != null && v.dl == undefined)
                ) {
                console.log('Tracker '+tracker[t].name+' have problem!');
                console.log('#debug start');
                console.log(v);
                console.log('#debug end');
                return true;
            }
            sum++;
            quality.name = title.r;
            title = title.n;
            var filter = '';
            var fk = 0;
            if (trackerFilter!=null && trackerFilter != t) filter = 'style="display: none;"';
            if (categoryFilter!=null && categoryFilter != v.category.id) filter = 'style="display: none;"';
            if (keywordFilter!=null) {
                var keyword = $.trim($('div.filter').children('input').val()).replace(/\s+/g," ");
                if (title==filterTextCheck(keyword,title)) 
                    filter = 'style="display: none;"';
                else
                    fk = 1;
            }
            quality.seed = (v.seeds>0)?100:0;//(v.seeds>50)?5:(v.seeds>10)?4:(v.seeds>0)?3:0;
            quality.video = 
            ((/Blu-ray|Blu-Ray/).test(title))?100:
            ((/BD-Remux|BDRemux|1080p|1080i/).test(title))?90:
            ((/BD-Rip|BDRip/).test(title))?80:
            ((/HDTV-Rip|HDTVRip|DTheater-Rip|HDTVRip|720p/).test(title))?70:
            ((/LowHDRip/).test(title))?30:
            ((/HDTV|HDRip|DVDRip/).test(title))?60:
            ((/DVD/).test(title))?50:
            ((/TVRip|WEBRip|WEB-DLRip|WEB-DL|SATRip|HQRip|DVB|IPTVRip/).test(title))?40:
            ((/TeleSynch|DVDScr/).test(title))?20:
            ((/CAMRip|CamRip/).test(title))?10:
            ((/TS/).test(title))?20:
            0;
            quality.video += ((/5.1/).test(title))?3:0;
            quality.video += ((/original/i).test(title))?2:0;
            quality.video += ((/rus sub|Sub|subs/).test(title))?1:0;
            quality.music = 
            ((/flac|alac|lossless/i).test(title))?90:
            ((/320.?kbps/i).test(title))?80:
            ((/256.?kbps/i).test(title))?60:
            ((/192.?kbps/i).test(title))?50:
            ((/128.?kbps/i).test(title))?40:
            ((/AAC/).test(title))?30:
            ((/mp3/i).test(title))?20:
            0;
            quality.game = ((/Repack/i).test(title))?50:((/\[Native\]/i).test(title))?80:((/\[L\]/).test(title))?100:0;
            quality.value = quality.seed+quality.name+quality.video+quality.music+quality.game;
            c = c + '<tr '+filter+' data-kf="'+fk+'" data-tracker="'+t+'" data-c="'+v.category.id+'">'
            +'<td class="time" data-value="'+v.time+'" title="'+unixintimetitle(v.time)+'">'+unixintime(v.time)+'</td>'
            +'<td class="quality" data-value="'+quality.value+'" data-qgame="'+quality.game+'" data-qseed="'+quality.seed+'" data-qname="'+quality.name+'" data-qvideo="'+quality.video+'" data-qmusic="'+quality.music+'"><div class="progress"><div style="width:'+(quality.value/10)+'px"></div><span title="'+quality.value+'">'+quality.value+'</span></div></td>'
            +'<td class="name"><div class="title"><a href="'+v.url+'" target="_blank">'+title+'</a>'+
            ((v.category.title == null && ShowIcons)?'<div class="tracker_icon num'+t+'" title="'+tracker[t].name+'"></div>':'')
            +'</div>'
            +((v.category.title != null)?'<ul><li class="category">'+((v.category.url == null)?v.category.title:'<a href="'+v.category.url+'" target="blank">'+v.category.title+'</a>')+'</li>'+((ShowIcons)?'<li><div class="tracker_icon num'+t+'" title="'+tracker[t].name+'"></div></li>':'')+'</ul>':'')
            +'</td>'
            +'<td class="size" data-value="'+v.size+'">'+((v.dl != null)?'<a href="'+v.dl+'" target="_blank">'+bytesToSize(v.size)+' ↓</a>':bytesToSize(v.size))+'</td>'
            +((!HideSeed)?'  <td class="seeds" data-value="'+v.seeds+'">'+v.seeds+'</td>':'')
            +((!HideLeech)?'  <td class="leechs" data-value="'+v.leechs+'">'+v.leechs+'</td>':'')
            +'</tr>';
        });
        updateTrackerResultCount(t,sum);
        loadingStatus(1,t);
        if (sum > 0) {
            $('#rez_table').children('tbody').append(contentUnFilter(c));
            table_update_timer(1);
        }
    }
    var table_update_timer = function (a) {
        var time = new Date().getTime();
        if (a == undefined) {
            //выполнятеся от таймера
            if (time-update_table.time > 200) {
                //обновление сортровки
                $('#rez_table').trigger("update");
                //обновление категории
                updateCategorys();
                update_table.timer = null;
            } else {
                clearTimeout(update_table.timer);
                update_table.timer = setTimeout(table_update_timer, 200);
            }
        } else {
            //выполнфется тригером
            if (update_table.time == null)
                updateCategorys();
            update_table.time = time;
            clearTimeout(update_table.timer);
            update_table.timer = setTimeout(table_update_timer, 200);
        }
    }
    var bytesToSize = function (bytes,nan) {
        //переводит байты в строчки
        var sizes = _lang['size_list'];
        if (nan==null) nan = 'n/a';
        if (bytes == 0) return nan;
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i == 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        }
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
    var utiemonstr = function (shtamp) {
        //преврящает TimeShtamp в строчку
        var dt = new Date(shtamp * 1000);
        var m = dt.getMonth()+1;
        if (m.toString().length==1)
            m = '0'+m.toString();
        var d = dt.getDate();
        if (d.toString().length==1)
            d = '0'+d.toString();
        var h = dt.getHours();
        if (h.toString().length==1)
            h = '0'+h.toString();
        var mi = dt.getMinutes();
        if (mi.toString().length==1)
            mi = '0'+mi.toString();
        var sec = dt.getSeconds();
        if (sec.toString().length==1)
            sec = '0'+sec.toString();
        //var time = '';
        //if (h!='00' && mi!='00' && sec != '00')
        //    time = ' '+h+':'+mi+':'+sec;
        var t = d+'-'+m+'-'+dt.getFullYear();//+time;
        return t;
    }
    var unixintimetitle = function (i) {
        if (i == 0) 
            return '∞';
        else
            return utiemonstr(i);
    }
    var round_day_unixtime= function (i) {
        var dt = new Date(i * 1000);
        return Math.round(new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()).getTime() / 1000);
    }
    var getHandM_unixtime= function (i) {
        var dt = new Date(i * 1000);
        return addZero(dt.getHours())+':'+addZero(dt.getMinutes());
    }
    var addZero = function (i) {
        if (i<10) return '0'+i;
        return i;
    }
    var unixintime = function (utime)
    {
        //выписывает отсчет времени из unixtime
        var now_time = Math.round((new Date()).getTime() / 1000);
        var theDate = utiemonstr(utime);
        if (utime == 0) return '∞';
        var i = now_time - utime;
        if (i<0) return theDate;
        var day = Math.floor(i/60/60/24);
        var week = Math.floor(day/7);
        //var month = Math.floor(day/30);
        //week = Math.floor((day-30*month)/7);
        var day_sec = day*60*60*24;
        var hour = Math.floor((i -day_sec)/60/60);
        var minutes = Math.floor((i - day_sec - hour*60*60)/60);
        var seconds = Math.floor((i - day_sec - hour*60*60 - minutes*60));
        day = Math.floor(day - 7*week);
        if (week>0 ) return theDate;
        //var str_month = (month<5)?(month<2)?                    ' месяц':   ' месяца':  ' месяцев';
        var str_week = ' '+((week<5)?(week<2)?(week<1)?              _lang.times.week1:  _lang.times.week2:  _lang.times.week3: _lang.times.week4);
        var str_day = ' '+((day<5)?(day<2)?(day<1)?                  _lang.times.day1:   _lang.times.day2:   _lang.times.day3:  _lang.times.day4);
        var str_hour = ' '+((hour<5)?(hour<2)?(hour<1)?              _lang.times.hour1:  _lang.times.hour2:  _lang.times.hour3: _lang.times.hour4);
        var str_minutes = ' '+_lang.times.min;
        var str_seconds = ' '+_lang.times.sec;
        //if (month>0)
        //    return month + str_month+((week>0)?' и '+week+str_week:'')+' назад';
        //if (week>0)
        //    return week + str_week+' назад';
        var d_te = (new Date()).getDate();
        var t_te = (new Date(utime*1000)).getDate();
        if (day == 0 && d_te != t_te) day = 1;
        if (day>0)
            if (day == 1)
                return _lang.times.yest+' '+getHandM_unixtime(utime);
            else
                return day+str_day+' '+_lang.times.old;
        if (hour>0)
            if (hour > 1)
                return _lang.times.today+' '+getHandM_unixtime(utime);
            else
                return hour+str_hour+' '+_lang.times.old;
        if (minutes>0)
            return minutes+str_minutes+' '+_lang.times.old;
        if (seconds>0)
            return seconds+str_seconds+' '+_lang.times.old;
        return theDate;
    }
    var updateTrackerResultCount = function (t,c,l) {
        if (l == null && c == null) {
            var c = $('ul.trackers li[data-id="'+t+'"]').attr('data-count');
            if (c == null) c = 0;
            $('ul.trackers').children('li[data-id="'+t+'"]').children('i').html('('+c+')');
        } else
        if (l == null) {
            $('ul.trackers').children('li[data-id="'+t+'"]').attr('data-count',c).children('i').html('('+c+')');
        }else {
            if (l == 1)
                $('ul.trackers').children('li[data-id="'+t+'"]').children('i').html('('+c+')');
        }
    }
    var contentFilter = function (c) {
        var c = c.replace(/\/\//img,'#blockurl#').replace(/script/img,'#blockscr#');
        return c;
    }
    var contentUnFilter = function (c) {
        var c = c.replace(/#blockurl#/img,'//').replace(/#blockscr#/img,'script');
        return c;
    }
    var filterText = function (s,t) {
        var s = $.trim(s).replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        var new_name = t.replace(/</g,"&lt;").replace(/>/g,"&gt;");
        var rate = 0;
        var new_name2 = new_name;
        rate = ((new RegExp(s,"i")).test(new_name))?100:0;
        var left = 0;
        if (s != '') {
            var tmp = s.split(" ");
            new_name = new_name.replace(new RegExp('('+tmp.join('|')+')',"ig"),"<b>$1</b>");
            left = new_name2.toLowerCase().indexOf(tmp[0].toLowerCase()+' ');
            if (left > 0 && new_name2.substr(left-1, 1) != ' ') left = 71;
        }
        if (new_name2 != new_name) {
            if (rate == 0)
                rate = 80;
            
            if (left < 0)
                rate = 30;
            else
            if (left > 70)
                rate = 30;
            else 
                rate -= left;
        }
        return {
            n:new_name,
            r:rate
        };
    }
    var filterTextCheck = function (s,t) {
        if (s == '') return 'a';
        var r = t;
        if (AdvFiltration == 1) {
            var tmp = s.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1").split(" ");
            if ((new RegExp(tmp.join('|'),"i")).test(t))
                r = 'a';
        } else 
        if (AdvFiltration == 2) {
            var tmp = s.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1").split(" ");
            var tmp_l = tmp.length;
            var trgr = true;
            for (var i=0;i<tmp_l;i++) {
                if (!(new RegExp(tmp[i],"i")).test(t)) {
                    trgr = false;
                    break;
                }
            }
            if (trgr)
                r = 'a';
        }
        else {
            var tmp = s.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1").split(",");
            var tmp_l = tmp.length;
            var trgr = true;
            for (var i=0;i<tmp_l;i++) {
                if (!(new RegExp(tmp[i],"i")).test(t)) {
                    trgr = false;
                    break;
                }
            }
            if (trgr)
                r = 'a';
        }
        return r;
    }
    var updateTrackerCount = function () {
        var li = $('ul.trackers').children('li');
        var t_c = li.length;
        for (var i = 0; i < t_c; i++) {
            var id = li.eq(i).attr('data-id');
            if (keywordFilter==null)
                updateTrackerResultCount(id);
            else
            if (keywordFilter!=null) {
                var count = $('#rez_table').children('tbody').children('tr[data-tracker="'+id+'"][data-kf="1"]').length;
                updateTrackerResultCount(id,count,1);
            }
        }
    }
    var updateCategorys = function () {
        var sum = 0;
        var count_c = categorys.length;
        for (var i=0;i<count_c;i++) {
            var filter = '[data-c="'+categorys[i]+'"]';
            if (trackerFilter!=null)
                filter += '[data-tracker="'+trackerFilter+'"]';
            if (keywordFilter!=null)
                filter += '[data-kf="1"]';
            var count = $('#rez_table').children('tbody').children('tr'+filter).length;
            if (count > 0) {
                $('ul.categorys').children('li[data-id="'+categorys[i]+'"]').css('display','inline-block').children('i').html('('+count+')');
                sum += count;
            } else {
                $('ul.categorys').children('li[data-id="'+categorys[i]+'"]').css('display','none');
            }
        }
        $('ul.categorys').children('li').eq(0).children('i').html('('+sum+')');
        if (autoMove != null) {
            var item =  $('ul.categorys').children('li[data-id="'+autoMove+'"]');
            if (item.css('display') == 'inline-block'){
                $('ul.categorys').children('li.selected').removeClass('selected');
                item.addClass('selected');
                item.trigger('click');
                autoMove = null;
            }
        }
        if ($('ul.categorys').children('li.selected').css('display') == 'none') {
            var category =  $('ul.categorys').children('li.selected').attr('data-id');
            $('ul.categorys').children('li.selected').removeClass('selected');
            $('ul.categorys').children('li').eq(0).addClass('selected');
            $('ul.categorys').children('li.selected').trigger('click');
            autoMove = (category==null)?null:category;
        }
    }
    var tableFilter = function (keyword) {
        if (keyword != $('div.filter').children('input').val()) return;
        $('div.filter div.btn').css('background-image','url(images/loading.gif)');
        keyword = $.trim(keyword).replace(/\s+/g," ");
        if (keyword == '') {
            $('div.filter').children('input').val('');
            keywordFilter = null;
            $('ul.categorys').children('li.selected').trigger('click');
            updateCategorys();
            updateTrackerCount();
            $('div.filter div.btn').hide();
            return;
        }
        keywordFilter = keyword;
        if (keywordFilter != lastFilterWord) {
            //lastFilterCache = null;
            lastFilterWord = keyword;
            //поиск и фильтрация контента
            var tr = $('#rez_table').children('tbody').children('tr');
            var tr_count = tr.length;
            for (var i = 0;i<tr_count;i++) {
                var tr_eq = tr.eq(i);
                var name = tr_eq.children('td.name').children('div.title').children('a').text();
                var f_name = filterTextCheck(keyword,name);
                if (name != f_name)
                    tr_eq.attr('data-kf',1);
                else
                    tr_eq.attr('data-kf',0);
            }
        }
        $('ul.categorys').children('li.selected').trigger('click');
        updateCategorys();
        updateTrackerCount();
        $('div.filter div.btn').css('background-image','url(images/clear.png)');
    }
    var triggerBlank = function () {
        $('body,html').scrollTop();
        $('div.result_panel').css('display','none');
        $('div.explore').css('display','block');
        view.clear_table();
        $('form[name="search"]').children('input[type=text]').val('');
        document.title = 'Torrents MultiSearch'; 
        window.location = '#s=';
        global_wl_hash = location.hash;
        $('form[name="search"]').children('input[type="text"]').val('').focus();
        explore.getLoad();
    }
    var triggerSearch = function (keyword) {
        $('body,html').scrollTop();
        $('div.result_panel').css('display','block');
        $('div.explore').css('display','none');
        var sel_tr = $('ul.trackers li a.selected').parent().data('id');
        if (sel_tr == null || sel_tr == undefined)
            sel_tr = null;
        view.clear_table();
        if (sel_tr != null)
            $('ul.trackers li[data-id='+sel_tr+']').children('a').addClass('selected');
        keyword = $.trim(keyword);
        if ($('form[name="search"]').children('input[type="text"]').val() != keyword)
            $('form[name="search"]').children('input[type="text"]').val(keyword);
        document.title = keyword +' :: '+'TMS'; 
        window.location = '#s='+keyword;
        global_wl_hash = location.hash;
        engine.search(keyword,sel_tr);
        return false;
    }
    var load_category = function (c) {
        $('ul.categorys').empty()
        var count = c.length;
        categorys = [];
        for (var i = 0;i<count;i++){
            categorys[categorys.length] = c[i][0];
            $('ul.categorys').append('<li data-id="'+c[i][0]+'">'+c[i][1]+'<i></i></li>');
        }
        $('ul.categorys').prepend('<li class="selected">'+_lang['cat_all']+' <i></i></li>');
    }
    var AddAutocomplete = function () {
        var AutocompleteArr = [];
        var order = function (a,b) {
            if (a.count > b.count)
                return -1;
            if (a.count == b.count)
                return 0;
            return 1;
        }
        var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
        if (search_history != null) {
            search_history.sort(order);
            var count = search_history.length;
            for (var i=0;i<count;i++) {
                AutocompleteArr[AutocompleteArr.length] = search_history[i].title;
            }
        }
        $( 'input[type="text"][name="s"]' ).autocomplete( "destroy" ).autocomplete({
            source: AutocompleteArr,
            minLength: 0,
            select: function(event, ui) {
                view.triggerSearch(ui.item.value);
            },
            position:{
                at:"bottom",
                at:"bottom",
                collision:"bottom"
            }
        });
        $('input[type="text"][name="s"]').autocomplete( "close" );
    }
    return {
        result : function (t,a,s) {
            return write_result(t,a,s);
        },
        contentFilter : function (a) {
            return contentFilter(a);
        },
        contentUnFilter : function (a) {
            return contentUnFilter(a);
        },
        clear_table : function () {
            clear_table()
        },
        auth : function (s,id) {
            auth(s,id)
        },
        addTrackerInList : function (a) {
            addTrackerInList(a);
        },
        loadingStatus : function (a,b) {
            loadingStatus(a,b);
        },
        tableFilter : function (a) {
            tableFilter(a);
        },
        triggerSearch : function (a) {
            triggerSearch(a);
        },
        triggerBlank : function () {
            triggerBlank();
        },
        trackerFilter : function () { 
            return trackerFilter;
        },
        keywordFilter : function () { 
            return keywordFilter;
        },
        setCatFilter : function (a) {
            categoryFilter = a;
        },
        getCatFilter : function () {
            return categoryFilter;
        },
        SetAutoMove : function (a) {
            autoMove = a;
        },
        HideLeech : function (a) {
            return HideLeech;
        },
        HideSeed : function (a) {
            return HideSeed;
        },
        load_category : function (a) {
            load_category(a);
        },
        AddAutocomplete : function () {
            AddAutocomplete();
        }
    }
}();
var myTextExtraction = function(node)  
{
    if ($(node).attr('data-value')!=null) {
        if ($(node).attr('data-qname') != null) {
            var c = view.getCatFilter();
            var val = parseInt($(node).attr('data-value'));
            if (c == null) return val;
            if (c == 3||c==0||c==7||c==8||c==4) {
                val = val-parseInt($(node).attr('data-qgame'))-parseInt($(node).attr('data-qmusic'));
            } else 
            if (c == 1) {
                val = val-parseInt($(node).attr('data-qgame'))-parseInt($(node).attr('data-qvideo'));
            } else
            if (c == 2) {
                val = val-parseInt($(node).attr('data-qmusic'))-parseInt($(node).attr('data-qvideo'));
            }
            return val;
        } else         
            return $(node).attr('data-value');
    }
    if ($(node).children('div.title')!=null)
        return $(node).children('div.title').text();
    return $(node).html();
}
$(function () {
    
    
    $('form[name=search]').children('.sbutton').val(_lang['btn_form']);
    $('div.right').children('.main').attr('title',_lang['btn_main']);
    $('div.right').children('.history').attr('title',_lang['btn_history']);
    $('div.tracker_list').children('p').text(_lang['btn_tracker_list']);
    $('div.tracker_list').children('p').eq(0).text(_lang['tracker_list']);
    $('div.tracker_list').children('div.setup').attr('title',_lang['btn_tracker_list']);
    $('div.filter').children('p').eq(0).text(_lang['filter']);
    $('div.filter').children('div.btn').attr('title',_lang['btn_filter']);
    $('#rez_table').find('th.time').text(_lang['table'].time);
    $('#rez_table').find('th.quality').text(_lang['table'].quality[0]);
    $('#rez_table').find('th.quality').attr('title',_lang['table'].quality[1]);
    $('#rez_table').find('th.name').text(_lang['table'].title);
    $('#rez_table').find('th.size').text(_lang['table'].size);
    $('#rez_table').find('th.seeds').text(_lang['table'].seeds[0]);
    $('#rez_table').find('th.seeds').attr('title',_lang['table'].seeds[1]);
    $('#rez_table').find('th.leechs').text(_lang['table'].leechs[0]);
    $('#rez_table').find('th.leechs').attr('title',_lang['table'].leechs[1]);
    $('div.topbtn').attr('title',_lang['btn_up']);
    
    view.load_category(engine.categorys);
    if (view.HideLeech()) {
        $('th.leechs').remove();
    }
    if (view.HideSeed()) {
        $('th.seeds').remove();
    }
    $('form[name="search"]').submit(function (event) {
        event.preventDefault();
        view.triggerSearch($(this).children('input[type="text"]').val());
        return false;
    });
    $('ul.categorys').on('click','li', function (event) {
        if (event.isTrigger != true)
            view.SetAutoMove(null);
        var trackerFilter = view.trackerFilter();
        var keywordFilter = view.keywordFilter();
        var id = $(this).attr('data-id');
        view.setCatFilter(id);
        $('ul.categorys').children('li.selected').removeClass('selected');
        $(this).addClass('selected');
        $('#rez_table').children('tbody').children('tr').css('display','none');
        var filter = '';
        if (id != null)
            filter += '[data-c="'+id+'"]';
        if (trackerFilter!=null)
            filter += '[data-tracker="'+trackerFilter+'"]';
        if (keywordFilter!=null)
            filter += '[data-kf="1"]';
        $('#rez_table').children('tbody').children('tr'+filter).css('display','table-row');
        $('#rez_table').trigger("update");
    });
    $('ul.categorys').children('li').css('display','none').eq(0).css('display','inline-block');
    try {
        $('#rez_table').tablesorter({
            textExtraction: myTextExtraction,
            widgets: ['zebra'],
            sortList: (GetSettings('Order') !== undefined) ? JSON.parse(GetSettings('Order')) :  [[1,1]],
            autosorter: true,
            onsort: function (s) {
                SetSettings('Order',JSON.stringify(s));
            }
        });
    } catch(err) {}
    $('form[name="search"]').children('input').eq(0).focus();
    $('div.filter input').keyup(function () {
        var t = $(this).val();
        $('div.filter div.btn').css('background-image','url(images/loading.gif)');
        if (t.length > 0) {
            $('div.filter div.btn').show();
        }
        window.setTimeout(function(){
            view.tableFilter(t);
        }, 1000);
    });
    $('div.filter div.btn').click(function () {
        $('div.filter input').val('');
        view.tableFilter('');
    });
    var s = (document.URL).replace(/(.*)index.html/,'').replace(/#s=(.*)/,'$1');
    if (s != '') {
        $('form[name="search"]').children('input[type="text"]').val(s);
    }
    $('div.tracker_list div.setup').click(function () {
        window.location = 'options.html#back='+$.trim($('form[name="search"]').children('input[type="text"]').val());
    });
    $('input.sbutton.main').click(function (){
        view.triggerBlank();
    });
    $('input.sbutton.history').click(function (){
        window.location = 'history.html';//'#back='+$.trim($('form[name=search]').children('input[type=text]').val());
    });
    view.AddAutocomplete();
    $('div.topbtn').hide();
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('div.topbtn').fadeIn('fast');
        } else {
            $('div.topbtn').fadeOut('fast');
        }
    });
    $('div.topbtn').click(function (event) {
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0
        }, 200);
        return false;
    });
});
$(window).load(function () {
    var s = (document.URL).replace(/.*index.html/,'').replace(/#s=(.*)/,'$1');
    if (s != '') {
        view.triggerSearch(decodeURIComponent(s));
    } else {
        view.triggerBlank();
    }
});
var global_wl_hash = location.hash;
$(window).on('hashchange', function() {
    if (location.hash != global_wl_hash)
    {
        $(window).trigger('load');
        global_wl_hash = location.hash;
    }
});