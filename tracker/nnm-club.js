var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'NoNaMe';
    var filename = 'nnm-club';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEACABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAQAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAAg0k9AHweEwCYQh4AAIAAAIB1fgAAAIAAwL26AOPi3gDv6OEAsX1xAPPz7wD7lycA+MAmAAD/AAD79u0AAAD/APv48AD9+/AAs6GQAPv37QD08OgA+/jxAN/c1gDa3doA/vz2AP789AD/++8A3sq9AABilgAASnMAADJQAP///QD68+gA9PPzAO7p4AD89u8A///6AABV/wAASdwAAD25AAAxlgAAJXMAABlQAO/q4QD07+UAopWVAP/++gD9+O8AJSX/AAAA/wAAANwAAAC5AAAAlgAAAHMAAABQAPn37wD//vwA+fbzAPTx6AD//vgA/vjsAFUA/wBJANwAPQC5ADEAlgAlAHMAGQBQAPPu5gD38+YA//7xAM7HxAD/+vAA//70AP767wD58OUA/fnuAGIAlgBKAHMAMgBQAP///wD79+4A//30AP369AD8/PoA+vXqAP778QD++e8Aua6hAJeHiAB3bG8AblpaAP/+9gDu590A+vTqAPnz6gC7qaYA39W9AOrIogDDmXkAsZB5AJ5oUwCUPCEAUjk/APbx6QD38ugA9/f1ALWSiwD2ZiAA96wrAMx4WADMWyQApVMuAKVEKgB4LyoAYRoPAN/a0wDx7eIA7ejgAL5+YADHhlkA4JovAOKILgDaNBkAxmQkAJQ3FwBuHhEAUAAAAOHc1AD++fAA+/XrANKIZwDSciUA+n8eANN+JADNYCYAsEAvAIcsJgCDLBkAWhYMAOrl3ADv6OAA8e3lAPjy6ADosCwAyoAnAPS1LQDZmEEAum8oAKNUGwCfPBcAbi4jAP788gD8+fEA/frwAP//8QD8+O8A9r4wAPzJLwDpoS0AzqoyAMSGQQB1SyQAsU8kAPjz6gD///wA9vPnAPn47wDuqDcA760qAP/kMwDspisAvoMqANONHwDGah0AMlAAAOLd1gD///4A/PfuANbNwwDiujkA+848AP/mMADyyjIA/q0eAO+QLwDabCYAGVAAANrZ1AD9+vUAzMjEAPa+OQD+yDAA9MkxAAD/AAAA3AAAALkAAACWAAAAcwAAAFAAAPbx6gD+/PAA/PjwAO7o4QD89usA///4AP/88wAA3EkA0qlTAPO4MgDUmygAAFAZAPv17AD++O8A9fDmAOzo3gDm4toA//vwAP/67gDgzLkAALl6ALyWYQDCbj8AAFAyAP//+wD//vkA//73AP//+QD7+/UA+fTqAP/67wD27+QA6becAACWlgCRe2cAAFBQAPby6wDl4doA3drQAOHc0gDcwLcA2bSlAOfc1ACon6AAm5mfAK+HcQCrfEwAnHNsAHtgXACJUEgAkkU5AHpFPACNNB0AfUUwABkJGwAODg4ApaWlpaWl2xylpaWlpaWlpaWlpaWlWNHS3uilpaWlpaWlpaWlpeq2wbq556WlpaWlpaWlpaVbt7/A0GFipaWlpbP9AQUYWXqqtN21uGOlpaVkrams+2ejrmZvq20MbmDYZYZ5qJ6i/pd+i3P8fGx7WncCfZ8NA/QXRy74+aF4a77y9fagnXClpaWlpaWlpaWlpfFxkJL6paWlpaWlpaWlpaWDlpGE96WlpeDg4OBQ46Wl8IqUh/OlpaXg4ODgUKWlpaVylZMIpaWl4ODgsVClpaWliIUTjaWlpeHg4CBQpaWlpYkKpaWlpaWlpVBQUKUgpaUHpaWlpaWlpaWlpaWlUAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8%3D';
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
            /* Док. и юмор */[5],
            /* Спорт */[]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(n),groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
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