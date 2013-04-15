(function load_tracker(tmp_num) {
tracker[tmp_num] = function () {
    var name = 'YouTracker';
    var filename = 'youtracker';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//+9AP+vJQD//8cZ///fLv//5i7//+su///wLv//9i7///wu////Lv///y////gi///cA////wAAAAAAAAAAAP/ongD/+Z0S//XVu/DKve/zzr3t9dHB7fbSwu320sPt9dLE7fTQw+3vx73u//Df1///5Cz///wAAAAAAAAAAAD/3JQA//+vHu7QwOCOHBz/kBwV/5QjHP+UIxz/lCMb/5MhGP+QHBL/hwkA/9mrpPf///dB////AAAAAAAAAAAA/9uVAP//tB7y2MLgmTIb/544G/+iQCP/okAj/6E9IP+cNBP/lSYD/4kQAP/arpz3////Qf///wAAAAAAAAAAAP/cmQD//7oe9NzE4KJEGP+nSxv/q1Mj/6tSIv+lSBT/u3VP/9OjiP/HjG//7tfG8f//9Dn///8AAAAAAAAAAAD/3p0A///BHvXfxOCpVBH/rlkT/7BdF/+tWA7/pEYA/923kv////+t////ef//7F//+9QK////AAAAAAAAAAAA/9+hAP//yB724sXgsGIJ/7JkBv+2bBH/unUh/7NnC//bton////42v3y4MP/+eup///zHv///wAAAAAAAAAAAP/hpQD//c8e9+PE4LZvAP+0aQD/06Zb/////+T///fa4cKP/7ZtAP+0agD/6Myk9v///0D///8AAAAAAAAAAAD/46sA//zXHvXjveC3cwD/s2kA/9OnSv////6H////XOC/e/2vYAD/sV8A/+zKkvj///9Y////G////xH///8A/+25AP/71h356sney5wo/8eTE//evnD////0fv///1Dp0Zb8yJAL/82PCP/l267+8P//6Oz//OL///+0////F///3QD//8oI///yeP//+6r///6p////ov//8Tf///Ee///3lv//96j////SrP7//2nz8f9v8ev/4/z65f//+isAAAAA//+fAP//gwD//7MC///UAv//2AH/3h8A////AP///wH///8A///+eqf59/9f8Oj/Zu/n/+L8+uX///8rAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AP///3PV////qf/8/63//P/6///h////JwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wD///8j////fP///4X///+G////Xv///wgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAIAHAACABwAAgAcAAIAHAACABwAAgAcAAIAHAACABwAAgAAAAIAAAACAAAAAwUAAAP/AAAD/wAAA//8AAA%3D%3D';
    var url = 'http://youtracker.net/tracker.php';
    var root_url = 'http://youtracker.net/';
    var about = 'Скачать бесплатно и без регистрации торрент Поиск по раздачам';
    var flags = {
        a : 1,
        l : 1,
        rs: 1
    }
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
            /*Сериалы*/[141,142,143],
            /*Музыка*/[103,104,114,106,116,109,119,108,118,408,409,107,117,111,121,105,115,112,122,110,120,113,123,151,150,185,186],
            /*Игры*/[53,59,60,54,238,57,56,55,15,16,24,23,194,17,19,51,49,48,286,289,190,234,20,40,39,41,287,18,33,36,37,38,34,35,25,46,31,30,52,202,21,58,43,42,22,50,32,29,28,27,26,45,44,47],
            /*Кино*/[124,241,207,203,191,192,160,125,163,126,338,337,127,162,128,164,144],
            /*Мультфильмы*/[129,133,131,132,130,152,153,137],
            /*Книги*/[351,405,352,353,354,355,315,316,356,357,358,365,364,363,362,361,360,359,378,377,376,375,374,373,372,371,370,369,368,367,366,388,387,386,385,384,383,382,381,406,380,379,319,320,321,333,332,331,330,329,334,328,327,326,325,324,323,322,395,394,393,392,391,390,389,397,336,396,404,403,402,401,400,399,398,348,349,350,177,184,183,182,181,180,245,178,179],
            /*ПО*/[62,88,89,90,99,100,101,102,61,63,65,64,66,67,68,70,91,69,93,92,335,96,95,94,86,87,98,76,77,78,79,80,81,82,83,97],
            /*Аниме*/[262,172,174,173],
            /*Документальные*/[134,256,254,136,252,253,255,135,288],
            /*Спортивные*/[138]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(f),groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        }
        var readCode = function (c) {
            c = view.contentFilter(c.replace(/div id="adv_header" .*\n.*/img,'div id="adv_header">'));
            var t = view.load_in_sandbox(id,c);
            t = t.find('tr.hl-tr').parent().children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td = t.eq(i).children('td');
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(2).children('a').text(), 
                        'url': root_url+td.eq(2).children('a').attr('href'),
                        'id': calculateCategory(td.eq(2).children('a').attr('href').replace(/.*f=([0-9]*)$/i,"$1"))
                    },
                    'title' : td.eq(3).children('a').eq(0).text(),
                    'url' : root_url+td.eq(3).children('a').eq(0).attr('href'),
                    'size' : td.eq(5).children('u').text(),
                    'dl' : td.eq(5).children('span').children('a').attr('href'),
                    'seeds' : td.eq(6).children('b').text(),
                    'leechs' : td.eq(7).children('b').text(),
                    'time' : td.eq(9).children('u').text()
                }
            }
            return arr;
        }
        var loadPage = function (text) {
            var t = text;
            if (xhr != null)
                xhr.abort();
            xhr = $.ajax({
                type: 'POST',
                url: url,
                cache : false,
                data: {
                    'max':1,
                    'to':1,
                    'nm' : text
                },
                success: function(data) {
                    view.result(id,readCode(data),t);
                },
                error:function (){
                    view.loadingStatus(2,id);
                }
            });
        }
        return {
            getPage : function (a) {
                return loadPage(a);
            }
        }
    }();
    var find = function (text) {
        return web.getPage(text);
    }
    return {
        find : function (a) {
            return find(a);
        },
        setId : function (a) {
            id = a;
        },
        id : id,
        name : name,
        icon : icon,
        about : about,
        url : root_url,
        filename : filename,
        flags : flags
    }
}();
engine.ModuleLoaded(tmp_num);
}(tracker.length));