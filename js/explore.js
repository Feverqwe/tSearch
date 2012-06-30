var explore = function () {
    var xhr = null;
    var sesizeimg = function (i) {
        i = i.replace('/sm_film/','/film/');
        return i;
    }
    var readCode = function (c) {
        c = view.contentFilter(c);
        var t = $(c).find('div.filmsListNew').children('div.item');
        t.find('div.threeD').remove();
        var l = t.length;
        var arr = [];
        var i = 0;
        for (i = 0;i<l;i++) {
            var item = t.eq(i).children('div');
            arr[arr.length] = {
                'img' : sesizeimg(item.eq(0).children('a').children('img').attr('src')),
                'name' : item.eq(1).children('div.name').children('a').text(),
                'url' : item.eq(1).children('div.name').children('a').attr('href')
            }
        }
        return arr;
    }
    var load_afisha = function () {
        var url = 'http://www.kinopoisk.ru/level/8/view/main/';
        if (xhr != null)
            xhr.abort();
        xhr = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                show_afisha(readCode(data));
            //view.result(readCode(data));
            },
            error:function (xhr, ajaxOptions, thrownError){
                
            }
        });
    }
    var movebleCalculate = function (a) {
        var tmp_size = a.length*7;
        var st = '';
        if (tmp_size > 140) {
            if (tmp_size < 150)
                st = 'moveble150';
            else if (tmp_size < 200)
                st = 'moveble200';
            else if (tmp_size < 250)
                st = 'moveble250';
            else if (tmp_size < 300)
                st = 'moveble300';
            else if (tmp_size < 350)
                st = 'moveble350';
            else if (tmp_size < 400)
                st = 'moveble400';
            else if (tmp_size < 450)
                st = 'moveble450';
            else if (tmp_size < 500)
                st = 'moveble500';
            else if (tmp_size < 550)
                st = 'moveble550';
            else if (tmp_size > 550)
                st = 'moveble600';
        }
        return ' '+st;
    }
    var show_afisha = function (content) {
        var c = '';
        $.each(content, function (k,v) {
            c += '<div class="poster"><div class="image"><img src="'+v.img+'"/></div><div class="title'+movebleCalculate(v.name)+'">'+v.name+'</div></div>';
            });
        $('div.explore').append(view.contentUnFilter(c));
    }
    return {
        getAfisha : function () {
            return load_afisha();
        }
    }
}();