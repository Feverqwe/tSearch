var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'Кинозал';
    var filename = 'kinozal';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/wAAAAAAAAAAgEc7/4BHO//8+/n/gEc7/4BHO/+ARzv/9/Tt//Xy6v/08Ob/gEc7/4BHO/+ARzv/7efX/4BHO/+ARzv/AAAAAIBHO//8+/n/+/r3//r49P/59vH/9/Tu//by6v/08Of/8u7j//Hs3//v6dv/7efY/+vk1P/q4tD/gEc7/wAAAAAAAAAAgEc7//r49P/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/q4tD/gEc7/wAAAAAAAAAAAAAAAIBHO//59/H/AACA/wAAgP8AAID/AACA/87v/f8AAID/AACA/wAAgP8AAID/6ODM/4BHO/8AAAAAAAAAAAAAAACARzv/9/Xu/87v/f8AAID/AACA/87v/f/O7/3/zu/9/wAAgP8AAID/zu/9/+beyf+ARzv/AAAAAAAAAACARzv/+PXv//bz6//O7/3/AACA/wAAgP/O7/3/zu/9/wAAgP8AAID/zu/9/87v/f/l3MX/49nB/4BHO/8AAAAAgEc7//bz6//18ej/zu/9/wAAgP8AAID/AACA/wAAgP/O7/3/zu/9/87v/f/O7/3/49nC/+HXvv+ARzv/AAAAAIBHO//18ej/8+/l/87v/f8AAID/AACA/wAAgP8AAID/zu/9/87v/f/O7/3/zu/9/+LXvv/g1bv/gEc7/wAAAACARzv/gEc7//Ht4f/O7/3/AACA/wAAgP/O7/3/zu/9/wAAgP/O7/3/zu/9/87v/f/g1bv/gEc7/4BHO/8AAAAAAAAAAIBHO//w6t7/zu/9/wAAgP8AAID/zu/9/87v/f/O7/3/AACA/87v/f/O7/3/39O4/4BHO/8AAAAAAAAAAAAAAACARzv/7uja/wAAgP8AAID/AACA/wAAgP/O7/3/zu/9/wAAgP8AAID/AACA/93Stf+ARzv/AAAAAAAAAAAAAAAAgEc7//r49P/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/O7/3/zu/9/87v/f/q4tD/gEc7/wAAAAAAAAAAgEc7//z7+f/7+vf/+vj0//n28f/39O7/9vLq//Tw5//y7uP/8ezf/+/p2//t59j/6+TU/+ri0P+ARzv/AAAAAIBHO/+ARzv//Pv5/4BHO/+ARzv/gEc7//f07f/18ur/9PDm/4BHO/+ARzv/gEc7/+3n1/+ARzv/gEc7/wAAAAAAAAAAgEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/4BHO/8AAAAAAAAAAAAAAACARzv/gEc7/wAAAAAAAAAAnHMAAAABAAAAAQAAgAMAAIADAACAAwAAAAEAAAABAAAAAQAAAAEAAIADAACAAwAAgAMAAAABAAAAAQAAnHMAAA%3D%3D';
    var url = 'http://kinozal.tv/browse.php';
    var root_url = 'http://kinozal.tv';
    var about = 'Торрент трекер Кинозал.ТВ - фильмы, новинки кино, скачать фильмы, афиша кино';
    var flags = {
        a : 1,
        l : 1,
        rs: 1
    }
    var xhr = null;
    var web = function () {
        var calculateSize = function (s) {
            var size = s.replace(' ','');
            var t = size.replace('КБ','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024);
            }
            var t = size.replace('МБ','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024);
            }
            var t = size.replace('ГБ','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024);
            }
            var t = size.replace('ТБ','');
            if (t!= size) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024*1024);
            }
            return 0;
        }
        var calculateCategory = function (n) {
            var n = n.replace(/.*c=([0-9]*)$/i,"$1");
            var groups_arr = [
            /* Сериалы */[45,46], //serials
            /* Музыка */[3,4,42], //music  
            /* Игры */[23], //games  
            /* Фильмы */[8,6,15,17,35,39,13,14,24,11,10,9,47,12,7,48,49,50,38,16], //films  
            /* Мультфтльмы */[21,22], //cartoon
            /* Книги */[2,41], //books
            /* ПО */[32,40], //prog 
            /* Анимэ */[20], //anime
            /* Док. и юмор */[18],
            /* Спорт */[37]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(n),groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        }
        var calculateCategoryName = function (n) {
            var n = calculateCategory(n);
            if (n > 9) return null;
            else if (n == 0) return 'Сериалы';
            else if (n == 1) return 'Музыка';
            else if (n == 2) return 'Игры';
            else if (n == 3) return 'Фильмы';
            else if (n == 4) return 'Мультфильмы';
            else if (n == 5) return 'Книги';
            else if (n == 6) return 'ПО';
            else if (n == 7) return 'Анимэ';
            else if (n == 8) return 'Док. и юмор';
            else if (n == 9) return 'Спорт';
        }
        var calculateTime = function (t) {
            if ((/сейчас/).test(t)) {
                return Math.round((new Date()).getTime() / 1000);
            }
            t = t.replace('в ','').replace('января','1').replace('февраля','2').replace('марта','3')
            .replace('апреля','4').replace('мая','5').replace('июня','6')
            .replace('июля','7').replace('августа','8').replace('сентября','9')
            .replace('октября','10').replace('ноября','11').replace('декабря','12').replace(':',' ');
            var tt = new Date();
            var today = tt.getDate()+' '+(tt.getMonth()+1)+' '+tt.getFullYear()+' ';
            var tt = new Date((Math.round(tt.getTime()/1000)-24*60*60)*1000);
            var yesterday = tt.getDate()+' '+(tt.getMonth()+1)+' '+tt.getFullYear()+' ';
            t = t.replace('сегодня ',today).replace('вчера ',yesterday);
            var dd = t.replace(/\./g, ' ').split(' ');
            return Math.round((new Date(parseInt(dd[2]),parseInt(dd[1])-1,parseInt('1'+dd[0])-100,parseInt('1'+dd[3])-100,parseInt('1'+dd[4])-100)).getTime() / 1000);
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var ver = 1;
            var t = $(c).find('table.mn2').eq($(c).find('table.mn2').length-1).children('tbody').children('tr');
            if (t.length == 0) {
                ver = 2;
                var t = $(c).find('table.t_peer.w100p').children('tbody').children('tr');
            }
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 1;i<l;i++) {
                var td = t.eq(i).children('td');
                if (ver == 1) {
                    arr[arr.length] = {
                        'category' : {
                            'title' : calculateCategoryName(td.eq(0).children('a').eq(0).attr('href')),
                            'url' : root_url+td.eq(0).children('a').eq(0).attr('href'),
                            'id': calculateCategory(td.eq(0).children('a').eq(0).attr('href'))
                        },
                        'title' : td.eq(1).children('a').text(),
                        'url' : root_url+td.eq(1).children('a').attr('href'),
                        'size' : calculateSize(td.eq(4).text()),
                        'seeds' : td.eq(6).text(),
                        'leechs' : td.eq(7).text(),
                        'time' : calculateTime(td.eq(3).text())
                    }
                } else if (ver == 2) {
                    arr[arr.length] = {
                        'category' : {
                            'title' : calculateCategoryName(td.eq(0).children('img').attr('src').replace(/.*\/([0-9]*)\.gif$/,'$1')),
                            'id': calculateCategory(td.eq(0).children('img').attr('src').replace(/.*\/([0-9]*)\.gif$/,'$1'))
                        },
                        'title' : td.eq(1).children('a').text(),
                        'url' : root_url+td.eq(1).children('a').attr('href'),
                        'size' : calculateSize(td.eq(3).text()),
                        'seeds' : td.eq(5).text(),
                        'leechs' : td.eq(6).text(),
                        'time' : calculateTime(td.eq(7).text())
                    }
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
                url: url+'?s='+encode(text),
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
        about : about,
        url : root_url,
        filename : filename,
        flags : flags
    }
}();
engine.ModuleLoaded(tmp_num);