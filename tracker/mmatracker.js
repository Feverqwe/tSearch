var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'mmatracker';
    var filename = 'mmatracker';
    var id = null;
    var icon = 'data:image/vnd.microsoft.icon;base64,AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAODg4APr59wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAREBERISEREBEQEREiIREQERARESEhERAREBERIiEREBEQEREREREQESAhESEhESAhICEhISEhIBIgIhIhIhIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAAAAAAAMzMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzMwAAAAAAAD//wAA';
    var url = 'http://mmatracker.ru/browse.php';
    var root_url = 'http://mmatracker.ru/';
    var about = 'MMAtracker - открытый общедоступный спортивный трекер. Качай и смотри бои без правил.';
    var flags = {
        a : 1,
        l : 1,
        rs: 1
    }
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
            /* Сериалы */[],
            /* Музыка */[],
            /* Игры */[],
            /* Фильмы */[],
            /* Мультфтльмы */[],
            /* Книги */[],
            /* ПО */[],
            /* Анимэ */[],
            /* Док. и юмор */[19],
            /* Спорт */[18,21,24,20,23]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(f),groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        }
        var calculateTime = function (time) {
            time = $.trim(time).split(" ");
            var date = time[0].split('-');
            time = time[1].split(':');
            return Math.round((new Date(parseInt(date[0]),parseInt(1+date[1])-101,parseInt('1'+date[2])-100,parseInt('1'+time[0])-100,parseInt('1'+time[1])-100)).getTime() / 1000);
        }
        var calculateSize = function (s) {
            var type = '';
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
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c).find('table.embedded').children('tbody');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 1;i<l-2;i++) {
                var tr = t.eq(i).children('tr');
                arr[arr.length] = {
                    'category' : {
                        'title' : tr.eq(1).children('td').eq(0).children('a').children('img').attr('alt'), 
                        'url': root_url+tr.eq(1).children('td').eq(0).children('a').attr('href'),
                        'id': calculateCategory(tr.eq(1).children('td').eq(0).children('a').attr('href').replace(/(.*)cat=([0-9]*)/i,"$2"))
                    },
                    'title' : $.trim(tr.eq(1).children('td').eq(1).children('a').eq(0).text()),
                    'url' : root_url+tr.eq(1).children('td').eq(1).children('a').eq(0).attr('href'),
                    'dl'  : root_url+tr.eq(1).children('td').eq(1).children('a').eq(2).attr('href'),
                    'size' : calculateSize(tr.eq(2).children('td').eq(3).text()),
                    'seeds' : $.trim(tr.eq(2).children('td').eq(4).text().split('|')[0]),
                    'leechs' : $.trim(tr.eq(2).children('td').eq(4).text().split('|')[1]),
                    'time' : calculateTime($.trim(tr.eq(2).children('td').eq(0).text()))
                }
            }
            return arr;
        }
        var loadPage = function (text) {
            var t = text;
            if (xhr != null)
                xhr.abort();
            xhr = $.ajax({
                type: 'GET',
                url: url+'?search='+encode(text),
                cache : false,
                success: function(data) {
                    view.result(id,readCode(data),t);
                },
                error:function (xhr, ajaxOptions, thrownError){
                    view.loadingStatus(2,id);
                }
            });
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