var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'NoNaMe';
    var filename = 'nnm-club';
    var id = null;
    var icon = 'http://nnm-club.ru/favicon.ico';
    var url = 'http://nnm-club.ru/';
    var root_url = 'http://nnm-club.ru/forum/';
    var xhr = null;
    var web = function () {
        var calculateSize = function (s) {
            var s = jQuery.trim(s.split('::')[2]);
            s = s.split(' ')[1]+s.split(' ')[2];
            s = s.replace(',','.');
            var size = s.replace(' ','');
            var t = size.replace('KB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024);
            }
            var t = size.replace('MB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024);
            }
            var t = size.replace('GB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024);
            }
            var t = size.replace('TB','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024*1024);
            }
            return 0;
        }
        var calculateCategory = function (n) {
            var n = (n).replace(/(.*)c=([0-9*])/i,"$2");
            var groups_arr = [
            /* Сериалы */[6],
            /* Музыка */[2],
            /* Игры */[9],
            /* Фильмы */[10,11,12,13],
            /* Мультфтльмы */[7],
            /* Книги */[4],
            /* ПО */[3],
            /* Анимэ */[1],
            /* Прочие */[], //other
            /* Док. и юмор */[5],
            /* Спорт */[]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(n),groups_arr[i]) > -1) {
                    return i;
                }
            return 8;
        }
        var calculateTime = function (t) {
            var t = t.replace('Янв','1').replace('Фев','2').replace('Мар','3')
            .replace('Апр','4').replace('Май','5').replace('Июн','6')
            .replace('Июл','7').replace('Авг','8').replace('Сен','9')
            .replace('Окт','10').replace('Ноя','11').replace('Дек','12');
            t = (t.replace(':',' ')).replace(':',' ');
            var dd = t.split(' ');
            return Math.round((new Date(parseInt(dd[2]),parseInt(dd[1])-1,parseInt('1'+dd[0])-100,parseInt('1'+dd[3])-100,parseInt('1'+dd[4])-100,parseInt('1'+dd[5])-100)).getTime() / 1000);
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c).find('table.forumline').eq(9).parent().children('table');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 1;i<l;i++) {
                var tr = t.eq(i).children('tbody').children('tr');
                arr[arr.length] = {
                    'category' : {
                        'title' : tr.eq(2).children('td').children('span').children('a').eq(0).children('img').attr('title'),
                        'url' : root_url+tr.eq(2).children('td').children('span').children('a').eq(0).attr('href'),
                        'id': calculateCategory(tr.eq(2).children('td').children('span').children('a').eq(0).attr('href')) //calculateCategory(td.eq(0).children('a').eq(0).attr('href'))
                    },
                    'title' : tr.eq(0).children('td').children('h2').children('a').text(), //td.eq(1).children('a').text(),
                    'url' : root_url+tr.eq(0).children('td').children('h2').children('a').attr('href'),
                    'size' : calculateSize(tr.eq(3).children('td').children('span').text()),
                    'dl' : root_url+tr.eq(3).children('td').children('span').children('a').eq(1).attr('href'),
                    'seeds' : (tr.eq(3).children('td').children('span').children('span.seedmed').text()).split('	')[0],
                    'leechs' : (tr.eq(3).children('td').children('span').children('span.leechmed').text()).split('	')[0],
                    'time' : calculateTime((tr.eq(1).children('td').text()).split(' @ ')[1]) //calculateTime(td.eq(3).text())
                }
            }
            return arr;
        }
        var encode = function (sValue) {
            var    text = "", Ucode, ExitValue, s;
            for (var i = 0; i < sValue.length; i++) {
                s = sValue.charAt(i);
                Ucode = s.charCodeAt(0);
                var Acode = Ucode;
                if (Ucode > 1039 && Ucode < 1104) {
                    Acode -= 848;
                    ExitValue = "%" + Acode.toString(16);
                }
                else if (Ucode == 1025) {
                    Acode = 168;
                    ExitValue = "%" + Acode.toString(16);
                }
                else if (Ucode == 1105) {
                    Acode = 184;
                    ExitValue = "%" + Acode.toString(16);          
                } 
                else if (Ucode == 32) {
                    Acode = 32;
                    ExitValue = "%" + Acode.toString(16);          
                } 
                else if (Ucode == 10){
                    Acode = 10;
                    ExitValue = "%0A";
                }
                else {
                    ExitValue = s;          
                }
                text = text + ExitValue; 
            }      
            return text; 
        }
        var loadPage = function (text) {
            var t = text;
            if (xhr != null)
                xhr.abort();
            xhr = $.ajax({
                type: 'GET',
                url: url+'?q='+encode(text),
                cache : false,
                success: function(data) {
                    view.result(id,readCode(data),t);
                },
                error:function (xhr, ajaxOptions, thrownError){
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
        filename : filename
    }
}();
engine.ModuleLoaded(tmp_num);