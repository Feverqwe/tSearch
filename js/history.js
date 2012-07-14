var view = function () {
    var search_history = null;
    var noHistory = function () {
        $('ol.list').html('<center>Истории поиска пока нет</center>');
    }
    var order = function (a,b) {
        if (a.time > b.time)
            return -1;
        if (a.time == b.time)
            return 0;
        return 1;
    }
    var getResult = function () {
        search_history = (localStorage.search_history !== undefined) ? JSON.parse(localStorage.search_history) : null;
        $('ol.list').empty();
        if (search_history == null) {
            noHistory();
            return;
        }
        var count = search_history.length;
        if (count == 0) {
            noHistory();
            return;
        }
        search_history.sort(order);
        var content = '';
        for (var i=0;i<count;i++) {
            content += '<li data-id='+i+'>'
            +'<div class="remove"><div class="rm_btn" title="Удалить"></div></div>'
            +'<div class="time" title="'+unixintimetitle(search_history[i].time)+'">'+unixintime(search_history[i].time)+'</div>'
            +'<div class="title"><a href="index.html#s='+search_history[i].title+'">'+search_history[i].title+'</a></div>'
            +'</li>';
        }
        $('ol.list').html(content);
        updateBtns();
    }
    var updateBtns = function () {
        $('div.rm_btn').unbind('click').click(function (){
            $(this).parents().eq(1).hide('fast', function () {
                var id = $(this).data('id');
                var title = search_history[id].title;
                removeItem(title);
            });
        });
    }
    var removeItem = function (title) {
        search_history = (localStorage.search_history !== undefined) ? JSON.parse(localStorage.search_history) : null;
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
        getResult();
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
        var t = d+'-'+m+'-'+dt.getFullYear()+' '+h+':'+mi+':'+sec;
        return t;
    }
    var unixintimetitle = function (i) {
        if (i == 0) 
            return '∞';
        else
            return utiemonstr(i);
    }
    var unixintime = function (shtamp)
    {
        //преврящает TimeShtamp в строчку
        var dt = new Date(shtamp * 1000);
        var today = false;
        if ((new Date()).toDateString() == dt.toDateString())
            today = true;
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
        if (today) {
            var t = h+':'+mi;
        } else 
            var t = d+'-'+m+'-'+dt.getFullYear();
        return t;
    }
    return {
        getResult : function () {
            getResult()
        }
    }
}();
$(function (){
    $('input.sbutton.main').click(function (){
        //var s = (document.URL).replace(/(.*)history.html/,'');
        //if (s!= '')
        //    var s = s.replace(/#back=(.*)/,'$1');
        window.location = '/index.html#s='//+s;
    });
    view.getResult();
});