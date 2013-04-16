(function (tmp_num) {
torrent_lib[tmp_num] = function () {
    var name = 'ExtraTorrent';
    var filename = 'extratorrent';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAADIvb7/xry9/8e8vf/Ivb7/yL2+/8i9vv/Ivb7/yL2+/8i9vv/Ivb7/yL2+/8i9vv/Ivb7/x7y9/8a8vf/Ivb7/xry9//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7/xry9/8e8vf/8/Pz//Pz8/5OTkv9qSRj/akkY/2tKGf9rShn/a0oZ/2tKGP9qSRj/Tzoc/4iEff/8/Pz//Pz8/8e8vf/HvL3/+/v7//v7+/+Hf3P/4bd0/+G3dP/ht3T/4bd0/+G3dP/ht3T/4bd0/3hgOv9xbmr/+/v7//v7+//HvL3/x7y9//f4+P/3+Pj/hHxx/+zAfP/swHz/7MB8/3xzaP9yal3/cmpd/3JqXf98c2b/xcPB//f4+P/3+Pj/x7y9/8e8vf/29vb/9vb2/4V9cf/txYX/7cWF/2RSNv/Nz8//zs/R/87P0P/Mzs7/29va//f39//29vb/9vb2/8e8vf/HvL3/8/Pz//Pz8/+IgHP/78yU/+/MlP94YDr/8vLy//Ly8v/y8vL/8vLy//Ly8v/09PT/8/T0//Lz8//HvL3/x7y9//Ly8v/y8vL/h4F5/+/Pnf/vz53/kHdP/3hgOv94YDr/eWE7/3hgOv9USDf/5eLd//Ly8v/y8vL/x7y9/8e8vf/w8PD/8PDw/4eBef/t0Kf/7dCn/+3Qp//t0Kf/7dCn/+3Qp//t0Kf/VEg3/9vb2v/w7+//8PDw/8e8vf/HvL3/7u3u/+7t7v+Gg33/7dm8/+3ZvP/Txa7/cW5r/3Fua/9xbmv/d3Rv/62rqf/o5+f/7u3u/+7t7v/HvL3/x7y9/+vr6//r6+v/h4F4/+/l0P/v5dD/XFVM/8XHx//Fx8f/xcfH/8TGxv/r7Ov/6+vr/+vr6//r6+v/x7y9/8e8vf/p6un/6erp/4eAeP/58+b/+fPm/4iEff93dG7/fXl0/356df99eXT/bGlj/5OTkf/p6un/6erp/8e8vf/HvL3/6Ofn/+fn5/+GgHj/5uPd/+bj3f/m493/5uPd/+bj3f/m493/5uPd/3Z2df9vb2//6Ofn/+fn5//HvL3/x7y9/+fn5//n5+f/raqo/3Z2df94eHj/d3d2/3h4ef95eXn/eHh4/3h4eP94eHj/ramo/+fn5//n5+f/x7y9/8a8vf/l5eX/5eXl/+Xl5f/l5eX/5eXl/+Xl5f/l5eX/5eXl/+Xl5f/l5eX/5eXl/+Xl5f/l5eX/5eXl/8a8vf/Ivb7/xry9/8e8vf/Ivb7/yL2+/8i9vv/Ivb7/yL2+/8i9vv/Ivb7/yL2+/8i9vv/Ivb7/x7y9/8a8vf/Ivb7/AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//w%3D%3D';
    var url = 'http://extratorrent.com/search/';
    var root_url = 'http://extratorrent.com';
    var about = 'ExtraTorrent.com is the biggest bittorrent system. Our goal is to provide an easy-to-use directory and search engine for all kind of torrent files. Visitors of ExtraTorrent.com can upload torrents to this site, tracked by any BitTorrent tracker.';
    var flags = {
        a : 0,
        l : 0,
        rs: 1
    }
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
            /* Сериалы */[8,273,581,795,435,169,561,153,812,274,309,580,758,310,673,311,573,821,118,771,818,234,634,674,675,312,170,659,275,171,837,165,460,802,163,794,172,782,276,584,669,647,173,666,774,174,315,717,781,754,709,767,175,269,799,235,676,817,707,176,277,560,147,677,316,619,148,719,661,128,658,236,317,846,177,278,759,141,279,657,319,320,133,776,321,112,629,178,322,179,670,729,651,598,280,323,324,108,325,678,739,798,180,652,181,679,680,182,797,642,281,183,585,644,122,167,237,606,839,326,327,328,732,184,282,820,615,329,185,283,788,186,738,187,270,765,330,238,588,840,828,188,576,331,332,672,753,831,333,334,335,336,140,612,681,728,337,574,704,571,338,284,682,189,339,599,285,819,340,813,769,683,190,789,713,832,341,773,712,727,411,191,342,556,343,736,192,755,684,344,286,287,568,266,288,132,345,756,637,590,346,685,347,239,240,289,166,772,290,763,110,196,686,412,349,197,741,350,351,790,348,241,198,199,570,242,130,843,200,115,591,243,578,638,656,618,650,353,716,244,504,665,354,111,314,726,503,687,157,705,826,355,667,357,662,358,291,617,688,645,633,579,359,825,783,246,313,842,632,245,201,361,247,356,292,792,362,202,193,203,636,120,841,363,722,293,710,294,689,703,833,364,424,113,365,248,646,723,249,757,640,778,613,250,414,690,785,366,204,427,691,784,734,229,692,368,663,205,803,251,252,714,594,822,369,206,117,370,253,254,207,295,208,760,768,604,693,209,255,694,695,807,372,555,605,373,696,844,138,715,210,296,708,375,737,211,697,376,256,137,830,649,569,815,212,718,257,297,631,845,607,131,159,378,379,563,139,144,380,123,124,562,258,213,614,381,528,838,761,214,298,299,382,215,847,217,731,764,119,168,300,383,301,582,384,583,829,572,410,608,775,711,586,218,272,219,510,114,220,386,702,610,639,835,834,635,816,766,259,740,648,655,221,595,387,827,388,271,609,808,222,152,643,630,109,308,392,390,698,302,567,260,597,664,393,786,668,735,223,125,423,823,699,611,810,721,654,725,720,394,116,577,425,268,796,396,216,399,616,224,762,836,596,398,225,733,303,565,261,400,401,793,814,559,155,791,706,777,730,129,226,824,262,566,121,402,227,263,593,304,264,404,405,575,406,135,408,194,800,127,228,770,409,787,265,801,587],
            /* Музыка */[5,54,160,55,56,809,57,58,59,515,60,61,519,62,233,63,78,512,724,306,64,511,65,66,67,521,68,526,79,69,522,507,70,71,72,73,74,75,527,514,230,505,77,161,420,76],
            /* Игры */[3,136,422,26,231,627,11,700,12,158,13,15,14,701,421,10,16],
            /* Фильмы */[4,419,28,30,32,628,558,33,34,600,35,37,742,36,149,38,39,602,40,41,150,42,44,805,43,603,45,46,47,48,779,49,671,307,601],
            /* Мультфтльмы */[29],
            /* Книги */[2,625,51,848,624,623,50,621,622,465,626],
            /* ПО */[7,532,17,27,232,18,19,20,25,21,22,23,24],
            /* Анимэ */[1,99,86,87,267,88,89,142,151,90,91,156,92,93,95,94,620,145,96,524,97,98,101,508,100,523,102,146,103,104,105,107,106,525],
            /* Док. и юмор */[],
            /* Спорт */[],
            /* XXX */[533,811,553,536,535,552,804,806]
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
            var t = size.replace('KB','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024);
            }
            t = size.replace('MB','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024);
            }
            t = size.replace('GB','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024);
            }
            t = size.replace('TB','');
            if (t.length!= size.length) {
                t = parseFloat(t);
                return Math.round(t*1024*1024*1024*1024);
            }
            return 0;
        }
        function is_int(input){
            return typeof(input)=='number'&&parseInt(input)==input;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = view.load_in_sandbox(id,c);
            t = t.find('table.tl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td = t.eq(i).children('td');
                var ss =  td.eq(4).text();
                var ls = td.eq(5).text();
                if (ls == '---') ls = 0;
                if (ss == '---') ss = 0;
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(2).children('span.c_tor').children('a').text(), 
                        'url': root_url+td.eq(1).children('a').attr('href'),
                        'id': calculateCategory(td.eq(1).children('a').attr('href').replace(/\/.*\/([0-9]*)\/$/,'$1'))
                    },
                    'title' : td.eq(2).children('a').text(),
                    'url' : root_url+td.eq(2).children('a').attr('href'),
                    'size' : calculateSize(td.eq(3).text()),
                    'dl' : root_url+td.eq(0).children('a').attr('href'),
                    'seeds' : ss,
                    'leechs' : ls,
                    'time' : 0
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
                    'search' : text
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
if ('compression' in window == false || window.compression == 0) {
    engine.ModuleLoaded(tmp_num);
}
}(torrent_lib.length));