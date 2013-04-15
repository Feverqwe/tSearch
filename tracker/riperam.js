(function load_tracker(tmp_num) {
tracker[tmp_num] = function () {
    var name = 'riper.am';
    var filename = 'riperam';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAGABoAwAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AAAD///////////////////////////////////////////////////////8AAAAAAAD///8BAp0BAp0BAp0BAp0BAp0BAp0BAp0BAp0BAp0BAp0BAp0BAp3///8AAAAAAAD///8EBaAFBqBub8v////r7PUEBaAEBaBub8v////x8fYEBZ8FBZ////8AAAAAAAD///8ICaMJCaQICqQJCaP///8ICaRub8v////r7PUJCaQICaQICaT///8AAAAAAAD///8OD6gODqgND6gODqj///8ND6jx8fZub8sND6gND6gOD6gODqj///8AAAAAAAD///8TFa0TFK4TFa0UFK3////////x8fb///////8UFK0TFK0TFK3///8AAAAAAAD///8ZGrIZG7IZG7IZG7P///8ZGrMaGrMaGrLr7PX///8aG7MaG7P///8AAAAAAAD///8gIbgfIbgfILggILj///8gIbgfILcgIbgfILj///8gILgfIbj///8AAAAAAAD///8lJr0lJr0lJr1ub8v///8lJr0lJr0lJr3r7PX///8lJr0lJ73///8AAAAAAAD///8rK8IqK8H////////////////x8fb///////8rK8ErLMIqLML///8AAAAAAAD///8uMMUvMMUvMMVub8svMMYvL8UvMMUvMMUvMMUvMMUvMMYuMMX///8AAAAAAAD///8yM8gyM8gyM8gyM8gyM8gNx9ENx9ENx9EyM8gyM8gyM8gyM8j///8AAAAAAAD///8yM8gyM8gyM8gyM8gNx9EyM8gNx9EyM8gNx9EyM8gyM8gyM8j///8AAAAAAAD///////////////////////////////////////////////////////8AAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPCEtLQokKCdib2R5JykuZXEoMCkuY3NzKCd3aWR0aCcpCi0tPgo%3D';
    var login_url = 'http://riper.am/ucp.php?mode=login';
    var url = 'http://riper.am/search.php';
    var root_url = 'http://riper.am/';
    var about = 'Riper.AM - Торрент трекер. Смотреть онлайн. Фильмы, сериалы, музыка, игры , софт, книги все новинки только для вас';
    /*
     * a = требует авторизации
     * l = русскоязычный или нет
     * rs= поддержка русского языка
    */
    var flags = {
        a : 1,
        l : 1,
        rs: 1
    }
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
            /* Сериалы */[240,19,216,363,118,153,217,632,319,183,178,364,267,365,353,266,268,160,274,20,210,550,601,639,48,555,631,501,509,131,376,152,628,563,562,354,640,598,641,644,213,372,272,551,645,635,507,558,225,359,552,630,226,117,358,642,355,445,273,505,565,373,360,646,500],
            /* Музыка */[243,26,96,70,97,72,71,73,98,74,99,75,100,76,101,78,77,79,102,80,103,87,86,85,84,83,82,81],
            /* Игры */[298,299,302,320,300,312,303,308,304,305,307,306,311,310,309,338,313,301,314,315,316,321,317,339,318],
            /* Фильмы */[238,368,425,50,52,424,51,371,251,349,350,351,352,239,420,12,13,422,15,14],
            /* Мультфтльмы */[423,16,17,18,21,185,463,633,606,162,151,22,198],
            /* Книги */[],
            /* ПО */[382,383,384,385,386,387,389,390,395,396,397,398,391,405,406,407,408,392,409,410,411,412,413,414,399,400,401,402,404,403,393,394],
            /* Анимэ */[232,245,246,592,594,591,595,596,597,242,164,167,165,166],
            /* Док. и юмор */[241,23,446,366,553,229,491,516,577,478,534,528,540,471,593,538,561,526,605,344,459,191,519,527,460,190,477,255,256,634,574,637,33,270,450,514,209,530,475,517,548,456,469,479,480,189,541,560,447,529,525,522,472,533,484,511,531,638,269,524,228,559,636,493,545,537,547,468,588,348,539,490,536,544,457,520,518,489,495,271,496,515,449,492,535,521,470,451,497,188,494,543,448,59,279,281,280,542,575,576,578,579,589,580,581,582,583,584,585,586,587,24,194,69,88,379,68,65,89,643,532,63,590,498,614,252,452,323,599,333,334,332,335,331,327,324,329,336,328,325,337,330,326,199],
            /* Спорт */[25,616,201,146,127,145,211,192,622,346],
            /* xxx */[46]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(f),groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        }
        var calculateSize = function (s) {
            var type = '';
            var size = s.replace(' ','');
            var t = size.replace('КБ','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024);
            }
            t = size.replace('МБ','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024);
            }
            t = size.replace('ГБ','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024);
            }
            t = size.replace('ТБ','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024*1024);
            }
            return 0;
        }
        var calculateTime = function (t) {
            var t = t.replace(',','').replace(/\s/g,':').replace('янв','1').replace('фев','2').replace('мар','3')
            .replace('апр','4').replace('май','5').replace('июн','6')
            .replace('июл','7').replace('авг','8').replace('сен','9')
            .replace('окт','10').replace('ноя','11').replace('дек','12');
            var dd = t.split(':');
            return Math.round((new Date(parseInt(dd[2]),parseInt(dd[1])-1,parseInt(dd[0]),parseInt(dd[3]),parseInt(dd[4]))).getTime() / 1000);
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = view.load_in_sandbox(id,c);
            if (t.find('#message > div.inner').length > 0 && t.find('#message > div.inner > p').text().indexOf('попробуйте чуть позже') > 0) {
                view.auth(0,id);
                return [];
            } else 
                view.auth(1,id);
            t = t.find('div.inner').children('ul.topiclist.topics').children('li');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var dl = t.eq(i).children('dl').children();
                var obj_dl_0 = dl.eq(0)
                var obj_dl_0_a = obj_dl_0.children('a')
                var corr = 0;
                if (obj_dl_0_a.eq(0).children('img') != null && obj_dl_0_a.eq(0).children('img').attr('width') == 11) {
                    corr += 1
                }
                var dl_link = dl.eq(0+corr).children('a').eq(0).attr('href');
                if (dl_link == undefined || dl_link.indexOf('download/file') < 0)
                    continue;
                var obj_dl_1_span = dl.eq(1).children('span')
                var attrs = obj_dl_0.text().replace(/.*»(.*)\n.*: (.*),.*/,"%split%$1%split%$2%split%").split('%split%');
                var dt_atr_c = obj_dl_0_a.length;
                arr[arr.length] = {
                    'title' : obj_dl_0_a.eq(1+corr).text(),
                    'url' : obj_dl_0_a.eq(1+corr).attr('href'),
                    'dl' : root_url+dl_link,
                    'time' : calculateTime(attrs[1].trim()),
                    'size' : calculateSize(attrs[2].trim()),
                    'category' : {
                        'title' : obj_dl_0_a.eq(dt_atr_c-1).text(),
                        'url': obj_dl_0_a.eq(dt_atr_c-1).attr('href'),
                        'id': -1
                    },
                    'seeds' : obj_dl_1_span.eq(0).text(),
                    'leechs' : obj_dl_1_span.eq(1).text()
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
                url: url,
                cache : false,
                data: {
                    'keywords': text,
                    'sr': 'topics',
                    'sf': 'titleonly',
                    'fp': '1',
                    'tracker_search': 'torrent'
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
        login_url : login_url,
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