var view = function () {
    var trackerFilter = null;
    var keywordFilter = null;
    var lastFilterWord = '';
    //var lastFilterCache = null;
    var ShowIcons = (localStorage.ShowIcons !== undefined) ? parseInt(localStorage.ShowIcons) : true;
    var AdvFiltration = (localStorage.AdvFiltration !== undefined) ? parseInt(localStorage.AdvFiltration) : true;
    var auth = function (s,t) {
        $('ul.trackers').children('li[data-id="'+t+'"]').children('ul').remove();
        if (!s)
            $('ul.trackers').children('li[data-id="'+t+'"]').append('<ul><li><a href="'+tracker[t].login_url+'" target="_blank">Войти</a></li></ul>');
    }
    var clear_table = function () {
        $('#rez_table').children('tbody').empty();
        $('div.filter').children('input').val('');
        lastFilterWord = '';
        $('ul.trackers li a.selected').removeClass('selected');
        trackerFilter = null;
        $('ul.categorys').children('li').removeClass('selected').eq(0).addClass('selected');
    }
    var loadingStatus  = function (s,t) {
        var tracker_img = $('ul.trackers').children('li[data-id="'+t+'"]').children('div.tracker_icon');
        switch (s) {
            case 0:
                tracker_img.css('background-image','url(/images/loading.gif)');
                break;
            case 1:
                tracker_img.removeAttr('style');
                break;
            case 2:
                tracker_img.css('background-image','url(/images/error.png)');
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
                trackerFilter = $(this).parent('li').data('id');
            }
            updateCategorys();
            $('ul.categorys').children('li.selected').trigger('click');
            return false;
        })).append('<i/>').appendTo($('ul.trackers'));
    }
    var write_result = function (t,a,s) {
        var c = '';
        $('#rez_table').children('tbody').children('tr[data-tracker='+t+']').remove();
        updateTrackerResultCount(t,a.length);
        var s_s = s.replace(/\s+/g," ");
        $.each(a, function (k,v) {
            var title = filterText(s_s,v.title);
            c = c + '<tr data-kf="0" data-tracker="'+t+'" data-c="'+v.category.id+'">'
            +'  <td class="time" data-value="'+v.time+'">'+unixintime(v.time)+'</td>'
            +'  <td class="name"><div class="title"><a href="'+v.url+'" target="_blank">'+title+'</a>'+
            ((v.category.title == null && ShowIcons)?'<div class="tracker_icon num'+t+'" title="'+tracker[t].name+'"></div>':'')
            +'</div>'
            +((v.category.title != null)?'<ul><li class="category">'+((v.category.url == null)?v.category.title:'<a href="'+v.category.url+'" target="blank">'+v.category.title+'</a>')+'</li>'+((ShowIcons)?'<li><div class="tracker_icon num'+t+'" title="'+tracker[t].name+'"></div></li>':'')+'</ul>':'')
            +'</td>'
            +'  <td class="size" data-value="'+v.size+'">'+((v.dl != null)?'<a href="'+v.dl+'" target="_blank">'+bytesToSize(v.size)+' ↓</a>':bytesToSize(v.size))+'</td>'
            +'  <td class="seeds" data-value="'+v.seeds+'">'+v.seeds+'</td>'
            +'  <td class="leechs" data-value="'+v.leechs+'">'+v.leechs+'</td>'
            +'</tr>';
        });
        $('#rez_table').children('tbody').append(contentUnFilter(c));
        $('#rez_table').trigger("update");
        loadingStatus(1,t);
        updateCategorys();
    }
    var bytesToSize = function (bytes,nan) {
        //переводит байты в строчки
        var sizes = ['б', 'Кб', 'Мб', 'Гб', 'Тб', 'Пб', 'Eb', 'Zb', 'Yb'];
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
        var t = d+'-'+m+'-'+dt.getFullYear();
        return t;
    }
    var unixintime = function (i)
    {
        //выписывает отсчет времени из unixtime
        var now_time = Math.round((new Date()).getTime() / 1000);
        theDate = utiemonstr(i);
        if (i == 0) return '∞';
        i = now_time - i;
        if (i<0) return theDate;
        var day = Math.floor(i/60/60/24);
        var week = Math.floor(day/7);
        var month = Math.floor(day/30);
        week = Math.floor((day-30*month)/7);
        var hour = Math.floor((i - day*60*60*24)/60/60);
        var minutes = Math.floor((i - day*60*60*24 - hour*60*60)/60);
        var seconds = Math.floor((i - day*60*60*24 - hour*60*60 - minutes*60));
        day = Math.floor(i/60/60/24 - 7*week);
        if (month>1) return theDate;
        var str_month = (month<5)?(month<2)?                    ' месяц':   ' месяца':  ' месяцев';
        var str_week = (week<5)?(week<2)?(week<1)?              ' недель':  ' неделя':  ' недели':  ' недель';
        var str_day = (day<5)?(day<2)?(day<1)?                  ' дней':    ' день':    ' дня':     ' дней';
        var str_hour = (hour<5)?(hour<2)?(hour<1)?              ' часов':   ' час':     ' часа':    ' часов';
        var str_minutes = (minutes<5)?(minutes<2)?(minutes<1)?  ' минут':   ' минута':  ' минуты':  ' минут';
        var str_seconds = (seconds<5)?(seconds<2)?(seconds<1)?  ' секунд':  ' секунда': ' секунды': ' секунд';
        if (month>0)
            return month + str_month+' '+ week+str_week;
        if (week>0)
            return week + str_week+' '+ day+str_day;
        if (day>0)
            return day+str_day+' '+hour+str_hour;
        if (hour>0)
            return hour+str_hour+' '+minutes+str_minutes;
        if (minutes>0)
            return minutes+str_minutes+' '+seconds+str_seconds;
        if (seconds>0)
            return seconds+str_seconds;
        return theDate;
    }
    var updateTrackerResultCount = function (t,c,l) {
        if (l == null && c == null) {
            var c = $('ul.trackers li[data-id="'+t+'"]').data('count');
            $('ul.trackers').children('li[data-id="'+t+'"]').children('i').html('('+c+')');
        } else
        if (l == null)
            $('ul.trackers').children('li[data-id="'+t+'"]').attr('data-count',c).children('i').html('('+c+')');
        else 
        if (l == 1)
            $('ul.trackers').children('li[data-id="'+t+'"]').children('i').html('('+c+')');
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
        var s = $.trim(s);
        var new_name = t.replace(/</g,"&lt;").replace(/>/g,"&gt;");
        if (s != '') {
            var tmp = s.split(" ");
            new_name = new_name.replace(new RegExp('('+tmp.join('|')+')',"ig"),"<b>$1</b>");
        }
        return new_name;
    }
    var filterTextCheck = function (s,t) {
        if (s == '') return 'a';
        var r = t;
        if (AdvFiltration) {
            var tmp = s.split(" ");
            if (t.replace(new RegExp(tmp.join('|'),"i"),'') != t)
                r = 'a';
        } else {
            if (t.replace(new RegExp(s,"i"),'') != t)
                r = 'a';
        }
        return r;
    }
    var updateTrackerCount = function () {
        var li = $('ul.trackers').children('li');
        var t_c = li.length;
        for (var i = 0; i < t_c; i++) {
            var id = li.eq(i).data('id');
            if (keywordFilter==null)
                updateTrackerResultCount(id);
            else
            if (keywordFilter!=null) {
                var count = $('#rez_table').children('tbody').children('tr[data-tracker='+id+'][data-kf=1]').length;
                updateTrackerResultCount(id,count,1);
            }
        }
    }
    var updateCategorys = function () {
        var sum = 0;
        var nl = $('ul.categorys').children('li').length;
        for (var i=0;i<nl-1;i++) {
            if (trackerFilter!=null && keywordFilter==null)
                var count = $('#rez_table').children('tbody').children('tr[data-c='+i+'][data-tracker='+trackerFilter+']').length;
            else
            if (keywordFilter!=null && trackerFilter==null)
                var count = $('#rez_table').children('tbody').children('tr[data-c='+i+'][data-kf=1]').length;
            else
            if (keywordFilter!=null && trackerFilter!=null)
                var count = $('#rez_table').children('tbody').children('tr[data-c='+i+'][data-tracker='+trackerFilter+'][data-kf=1]').length;
            else
                var count = $('#rez_table').children('tbody').children('tr[data-c='+i+']').length;
            if (count > 0) {
                $('ul.categorys').children('li[data-id="'+i+'"]').css('display','inline-block').children('i').html('('+count+')');
                sum += count;
            } else {
                $('ul.categorys').children('li[data-id="'+i+'"]').css('display','none');
            }
        }
        $('ul.categorys').children('li').eq(0).children('i').html('('+sum+')');
        updateTrackerCount();        
    }
    var tableFilter = function (keyword) {
        if (keyword != $('div.filter').children('input').val()) return;
        $('div.filter div.btn').css('background-image','url(/images/loading.gif)');
        keyword = $.trim(keyword).replace(/\s+/g," ");
        if (keyword == '') {
            $('div.filter').children('input').val('');
            keywordFilter = null;
            $('ul.categorys').children('li.selected').trigger('click');
            updateCategorys();
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
        $('div.filter div.btn').css('background-image','url(/images/clear.png)');
    }
    var triggerSearch = function (keyword) {
        view.clear_table();
        keyword = $.trim(keyword);
        $('form[name=search]').children('input[type=text]').val(keyword);
        document.title = keyword +' :: '+'TMS'; 
        window.location = '#s='+keyword;
        engine.search(keyword);
    }
    return {
        result : function (t,a,s) {
            return write_result(t,a,s);
        },
        contentFilter : function (a) {
            return contentFilter(a);
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
        trackerFilter : function () { 
            return trackerFilter;
        },
        keywordFilter : function () { 
            return keywordFilter;
        }
    }
}();
var myTextExtraction = function(node)  
{
    if ($(node).attr('data-value')!=null)
        return $(node).attr('data-value');
    if ($(node).children('div.title')!=null)
        return $(node).children('div.title').text();
    return $(node).html();
}
$(function () {
    $('form[name=search]').submit(function () {
        view.triggerSearch($(this).children('input[type=text]').val());
        return false;
    });
    var t = $('ul.categorys').children('li');
    var l = t.length;
    for (var n = 0;n<l;n++) {
        t.eq(n).click(function () {
            var trackerFilter = view.trackerFilter();
            var keywordFilter = view.keywordFilter();
            var id = $(this).data('id');
            $('ul.categorys').children('li').removeClass('selected');
            $(this).addClass('selected');
            
            if (id == null){
                $('#rez_table').children('tbody').children('tr').css('display','none');
                if (trackerFilter!=null && keywordFilter!=null) {
                    $('#rez_table').children('tbody').children('tr[data-tracker='+trackerFilter+'][data-kf=1]').css('display','table-row');
                }else
                if (trackerFilter!=null && keywordFilter==null) {
                    $('#rez_table').children('tbody').children('tr[data-tracker='+trackerFilter+']').css('display','table-row');
                }else
                if (trackerFilter==null && keywordFilter!=null) {
                    $('#rez_table').children('tbody').children('tr[data-kf=1]').css('display','table-row');
                }else
                    $('#rez_table').children('tbody').children('tr').css('display','table-row');
            } else {
                $('#rez_table').children('tbody').children('tr').css('display','none');
                if (trackerFilter!=null && keywordFilter!=null) {
                    $('#rez_table').children('tbody').children('tr[data-c='+id+'][data-tracker='+trackerFilter+'][data-kf=1]').css('display','table-row');
                }else
                if (trackerFilter!=null && keywordFilter==null) {
                    $('#rez_table').children('tbody').children('tr[data-c='+id+'][data-tracker='+trackerFilter+']').css('display','table-row');
                }else
                if (trackerFilter==null && keywordFilter!=null) {
                    $('#rez_table').children('tbody').children('tr[data-c='+id+'][data-kf=1]').css('display','table-row');
                }else
                    $('#rez_table').children('tbody').children('tr[data-c='+id+'][data-c='+id+']').css('display','table-row');
            }
            $('#rez_table').trigger("update");
        });
    }
    $('ul.categorys').children('li').css('display','none').eq(0).css('display','inline-block');
    try {
        $('#rez_table').tablesorter({
            textExtraction: myTextExtraction,
            widgets: ['zebra'],
            sortList: (localStorage.Order !== undefined) ? JSON.parse(localStorage.Order) :  [[0,1]],
            autosorter: true,
            onsort: function (s) {
                localStorage.Order = JSON.stringify(s);
            }
        });
    } catch(err) {}
    $('form[name=search]').children('input').eq(0).focus();
    $('div.filter input').keyup(function () {
        var t = $(this).val();
        $('div.filter div.btn').css('background-image','url(/images/loading.gif)');
        if (t.length > 0) {
            $('div.filter div.btn').show();
        }
        window.setTimeout(function(){
            //var tmp = t;
            view.tableFilter(t);
        }, 1000);
    });
    $('div.filter div.btn').click(function () {
        $('div.filter input').val('');
        view.tableFilter('');
    //$(this).hide();
    });
    var s = (document.URL).replace(/(.*)index.html/,'').replace(/#s=(.*)/,'$1');
    if (s != '') {
        $('form[name=search]').children('input[type=text]').val(s);
    }
    $('div.tracker_list div.setup').click(function () {
        window.location = '/options.html#back='+$.trim($('form[name=search]').children('input[type=text]').val());
    });
});
$(window).load(function () {
    var s = (document.URL).replace(/(.*)index.html/,'').replace(/#s=(.*)/,'$1');
    if (s != '') {
        view.triggerSearch(s);
    }
});