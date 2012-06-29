var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'Торрент (уфанет)';
    var filename = 'torrents.local';
    var id = null;
    var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAAAh0lEQVQ4T6XTIQvCQByG8SsrNpt1ddm6ajWurVj2uUQQBoJhsDAYDBnsWz2WwQn3hvcw/OI9f3jhAhD+ER9vHeTYD8fAeoMcSeDTQo4k8LvF0oAi9tIDzldQ7MB0AcUOjDUodmA4g2IH3hUoduBVgmIH+hModuB5BMUOPA6g2IF7AYodyPjiX1qi+gcxhCCwAAAAAElFTkSuQmCC';
    var login_url = 'http://torrents.local/forum/pauth.php';
    var url = 'http://torrents.local/forum/tracker.php';
    var root_url = 'http://torrents.local/forum/';
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
            /* Сериалы */[14,862,454,115,194,734,153,558,379,790,114,162,818,90,86,126,81,279,380,134,164,112,61,121,560,125,91,433,92,220,130,245,201,213,641,653,127,521,191,196,431,62,424,387,193,751,165,159,192,197,381,195,64,198,386,406,128,63,583,432,129,167,943,875,98,88,122,166,385,752,101,190,738,163,144,246,161,150,124,669,113,200,440,123,597,13,188,137,815,189,559,221,422,661,138,135,584,651,136],
            /* Музыка */[216,83,401,598,617,616,615,637,22,606,686,733,23,607,27,608,553,24,470,599,950,469,600,951,471,25,925,880,410,411,420,235,611,921,234,612,922,409,412,26,484,579,485,580,735,156,676,677,678,239,241,240,376,375,549,30,267,562,368,563,369,564,266,565,364,370,566,365,567,366,568,367,569,29,254,498,253,499,252,500,251,501,250,502,249,503,895,909,247,504,28,260,505,258,506,444,507,256,508,257,509,259,510,255,511,99,336,512,338,513,335,514,333,515,334,516,31,360,517,361,518,362,519,141,526,85,527,32,374,238,573,237,574,571,572,373,400,3,429,430,874,533,428,534,658,34,438,535,435,536,659,398,436,396,35,416,540,415,543,417,544,419,545,418,546,660,36,538,402,84,539,630,242,244,243,377],
            /* Игры */[40,65,75,457,900,901,902,102,456,822,68,464,73,463,270,823,624,548,67,458,442,66,657,77,69,461,76,455,908,271,787,74,71,72,70,459,903,904,905,496,497,906,38,961,78,117,483,788,486,487,825,482,948,44,868,56,337,45,339,399,447,42],
            /* Фильмы */[8,6,592,472,160,591,590,589,588,945,813,479,7,227,888,670,212,146,100,105,690,689,832,834,833,835,837,836,838,269,839,840,841,869,842,876,845,844,843,870,846,848,847,849,851,850],
            /* Мультфтльмы */[11,383,889,933,143,168,758,934,46,935,133,652,936,937,938,132,421,184,405,142,687,384,158,382,939,434,131,10,759,475],
            /* Книги */[15,20,852,358,354,359,97,942,356,116,352,816,446,946,756,355,353,357,94,93,640,16,344,346,348,351,341,347,343,342,349,345,350,17,941,940,468,853,95,96,854,19,629,596,439,575,642,522,426,595,744,577,219,811,217,593,654,218,747,576,474,743,82],
            /* ПО */[918,50,319,316,315,317,318,332,594,582,746,552,581,47,284,280,282,378,944,281,732,51,324,325,330,328,118,331,623,329,327,326,322,321,323,48,291,300,289,287,296,290,295,292,299,297,285,301,288,298,286,54,622,52,55,586,684,683,681,585,680,789,737,303,313,305,312,314,308,307,311,306,310,309,89,631,427,495],
            /* Анимэ */[12,473,214,685,371,932,119,561,149,148,215,202],
            /* Прочие */[],
            /* Док. и юмор */[57,155,186,570,634,403,824,855,856,443,635,929,554,830,867,633,531,185,965,866,523,949,425,109,890,736,625,891,626,899,927,919,898,920,627,926,892,893,894,628,58,154,551,877,878,145,858,632,621,857,930,372,791,793,794,795,792,797,60,490,491,492,489,649,488,493,829,204,450,449,451,636,452,203,662,760,666,664,663,665,763,897,766,814,772,764,928,765,767,768,770,896,769,879],
            /* Спорт */[59,208,750,229,528,206,828,205,207,210,407,817,404,209,673]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(f),groups_arr[i]) > -1) {
                    return i;
                }
            return 8;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c);//.contents();
            if (t.find('input[name=login_username]').html() != null) {
                view.auth(0,id);
                return [];
            } else 
                view.auth(1,id);
            t = t.find('#main_content_wrap').children('#tor-tbl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td = t.eq(i).children('td');
                if (td.eq(5).children('a').attr('href') == null) continue;
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(2).children('a').text(), 
                        'url': root_url+td.eq(2).children('a').attr('href'),
                        'id': calculateCategory(td.eq(2).children('a').attr('href').replace(/(.*)f=([0-9*])/i,"$2"))
                    },
                    'title' : td.eq(3).children('a').text(),
                    'url' : root_url+td.eq(3).children('a').attr('href'),
                    'size' : td.eq(5).children('u').text(),
                    'dl' : root_url+td.eq(5).children('a').attr('href'),
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
                    'max' : 1,
                    'to' : 1,
                    'nm' : text
                },
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
        login_url : login_url,
        name : name,
        icon : icon,
        filename : filename
    }
}();
engine.ModuleLoaded(tmp_num);