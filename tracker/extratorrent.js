var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'ExtraTorrent';
    var filename = 'extratorrent';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAADIvb7/xry9/8e8vf/Ivb7/yL2+/8i9vv/Ivb7/yL2+/8i9vv/Ivb7/yL2+/8i9vv/Ivb7/x7y9/8a8vf/Ivb7/xry9//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7/xry9/8e8vf/8/Pz//Pz8/5OTkv9qSRj/akkY/2tKGf9rShn/a0oZ/2tKGP9qSRj/Tzoc/4iEff/8/Pz//Pz8/8e8vf/HvL3/+/v7//v7+/+Hf3P/4bd0/+G3dP/ht3T/4bd0/+G3dP/ht3T/4bd0/3hgOv9xbmr/+/v7//v7+//HvL3/x7y9//f4+P/3+Pj/hHxx/+zAfP/swHz/7MB8/3xzaP9yal3/cmpd/3JqXf98c2b/xcPB//f4+P/3+Pj/x7y9/8e8vf/29vb/9vb2/4V9cf/txYX/7cWF/2RSNv/Nz8//zs/R/87P0P/Mzs7/29va//f39//29vb/9vb2/8e8vf/HvL3/8/Pz//Pz8/+IgHP/78yU/+/MlP94YDr/8vLy//Ly8v/y8vL/8vLy//Ly8v/09PT/8/T0//Lz8//HvL3/x7y9//Ly8v/y8vL/h4F5/+/Pnf/vz53/kHdP/3hgOv94YDr/eWE7/3hgOv9USDf/5eLd//Ly8v/y8vL/x7y9/8e8vf/w8PD/8PDw/4eBef/t0Kf/7dCn/+3Qp//t0Kf/7dCn/+3Qp//t0Kf/VEg3/9vb2v/w7+//8PDw/8e8vf/HvL3/7u3u/+7t7v+Gg33/7dm8/+3ZvP/Txa7/cW5r/3Fua/9xbmv/d3Rv/62rqf/o5+f/7u3u/+7t7v/HvL3/x7y9/+vr6//r6+v/h4F4/+/l0P/v5dD/XFVM/8XHx//Fx8f/xcfH/8TGxv/r7Ov/6+vr/+vr6//r6+v/x7y9/8e8vf/p6un/6erp/4eAeP/58+b/+fPm/4iEff93dG7/fXl0/356df99eXT/bGlj/5OTkf/p6un/6erp/8e8vf/HvL3/6Ofn/+fn5/+GgHj/5uPd/+bj3f/m493/5uPd/+bj3f/m493/5uPd/3Z2df9vb2//6Ofn/+fn5//HvL3/x7y9/+fn5//n5+f/raqo/3Z2df94eHj/d3d2/3h4ef95eXn/eHh4/3h4eP94eHj/ramo/+fn5//n5+f/x7y9/8a8vf/l5eX/5eXl/+Xl5f/l5eX/5eXl/+Xl5f/l5eX/5eXl/+Xl5f/l5eX/5eXl/+Xl5f/l5eX/5eXl/8a8vf/Ivb7/xry9/8e8vf/Ivb7/yL2+/8i9vv/Ivb7/yL2+/8i9vv/Ivb7/yL2+/8i9vv/Ivb7/x7y9/8a8vf/Ivb7/AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//w%3D%3D';
    var url = 'http://extratorrent.com/search/';
    var root_url = 'http://extratorrent.com';
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
            /* Док. и юмор */[],
            /* Спорт */[],
            /* XXX */[]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(f,groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
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
        var calculateTime = function (t) {
            if ($.trim(t.substr(0, 1)) == '') return 0;
            if ((/today/).test(t)) {
                return Math.round((new Date().getTime() / 1000)/(60*60*24))*(60*60*24);
            } else
            if ((/yesterday/).test(t)) {
                return (Math.round((new Date().getTime() / 1000)/(60*60*24))*(60*60*24))-(60*60*24);
            } else
            if ((/ old/).test(t)) {
                var time = parseInt(t.replace(/([0-9]*).*/,'$1'));
                var nowTime = Math.round(new Date().getTime() / 1000);
                if ((/second/).test(t)) {
                    return nowTime - time;
                } else
                if ((/minute/).test(t)) {
                    return nowTime - time*60;
                } else
                if ((/hour/).test(t)) {
                    return nowTime - time*60*60;
                } else
                if ((/day/).test(t)) {
                    return nowTime - time*60*60*24;
                } else
                if ((/week/).test(t)) {
                    return nowTime - time*60*60*24*7;
                } else
                if ((/month/).test(t)) {
                    return nowTime - time*60*60*24*7*30;
                } else
                if ((/year/).test(t)) {
                    return nowTime - time*60*60*24*7*365;
                }
            }
            return 0;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c);//.contents();
            t = t.find('table.tl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td = t.eq(i).children('td');
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(2).children('span.c_tor').children('a').text(), 
                        'url': root_url+td.eq(1).children('a').attr('href'),
                        'id': calculateCategory(td.eq(1).children('a').attr('href').replace(/\/.*\/([0-9]*)\//,'$1'))
                    },
                    'title' : td.eq(2).children('a').text(),
                    'url' : root_url+td.eq(2).children('a').attr('href'),
                    'size' : calculateSize(td.eq(3).text()),
                    'dl' : root_url+td.eq(0).children('a').attr('href'),
                    'seeds' : td.eq(4).text(),
                    'leechs' : td.eq(5).text(),
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