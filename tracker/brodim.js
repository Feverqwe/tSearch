(function load_tracker(tmp_num) {
tracker[tmp_num] = function () {
    var name = 'Brodim';
    var filename = 'brodim';
    var id = null;
    var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowREM0RTY3OTY3NjIxMUUyQjdFMkUxQkNDQ0M3Njk0MiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowREM0RTY3QTY3NjIxMUUyQjdFMkUxQkNDQ0M3Njk0MiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBEQzRFNjc3Njc2MjExRTJCN0UyRTFCQ0NDQzc2OTQyIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjBEQzRFNjc4Njc2MjExRTJCN0UyRTFCQ0NDQzc2OTQyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+9Qf5pAAAAoBJREFUeNqUk21IU2EUx/93u+mqYa6MlimKEtEYSPhhMHsRgoSRQn5QmoVCJRRBECFpC1cQ9UGEnFESyZzc0oLCkvWhV8yF+yBpNWdzOrNk84Xt6kAhb512n6XML6EHLuec5z73f8753efhiAjMxt4QFuYB/TEO6zFZgCbdlGBYz6NgKrwKGGyD9Vo93N0OWk8DcYHgJ3jTirFFCqG94Sz2Gw0kSRKVlBQzX1VVSTFxCoVCNDAwIBdg7+IC4igL9n6ogFKdyfTq6q7A5/PBYrkKnuc5u72NS05Swev1Qq/XQxRFNDXZ/jGI+In6moicNfTb84pqS3NWOASDwVVMEnNBEFgcByh+J+qqIMl2iDyttWsCGQgEKA5RWgIifmDmK5S5BgxOz/4XWqx9NnJ2djb73QrOmYxm4QnqdzvZBnOSGZxjmBx3LAxg4sdlZWWk6ZzAidKDbH18fDzm7w2S6dkIFWYoCM09jAEaeihf+EJymy8etayMFI1GSeaAxnf08NYZqq4oIh4LYTidb/HepEahSoOj5su4KWrQPxHEyzk/zs2kQy7HtXymQFFKvPVtIpkXzwNaT4zBRjWwJx+FuxyxAUMIKzYBs2EgeQOEdjsyMrPg/ugiRKag1WrjsyxJcKIRF48YoLifw8OUuxPbb59EqzEHM+IvIDU1RkeFynITtjYeh8FYwEGzA3dvXECnrZowOoKsAzV4PDkPZfpmWDvUOhweewrM/UR/3ml4psNo47txyp+O0HM7o12Vtmg1RXQIpBRAyPsDl6sX+8Rh4PqlcvJ9G6bXXR3U5+qlB0Iry2Voyz7xIP2YCq9a45av89DQEAt0Op1ckXFby2X6K8AAyU62p3DB1uoAAAAASUVORK5CYII%3D';
    var url = 'http://brodim.com/tracker.php';
    var root_url = 'http://brodim.com/';
    var about = 'Бесплатные и условно-бесплатные программы, антивирусы, игры, программирование, программы для КПК, свежие новости и последние новинки от разработчиков. Полезные статьи и советы, тесты и конкурсы';
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
            /* Сериалы */[12,135,136,137,138,139,140,123,122,121,13,512,513,514,504,503,502,501,134,133,132,131,127,128,130,129,126,125,124,144,143,142,141],
            /* Музыка */[50,356,355,71,73,74,75,49,77,76,357,48,79,78,358,47,83,82,81,80,46,85,84,43,362,361,359,360,6,11,221,222,223,224,86,7,44,45,366,365,397,364,398,363,384,396,395,394,393,392,391,390,389,388,386,385,374],
            /* Игры */[256,425,424,250,431,430,258,251,428,426,429,427,253,254,259,252,255,367,257,434,432,400,433,505,506,507,508,509,246,248,247,245],
            /* Фильмы */[53,516,67,64,65,66,483,54,70,68,69,484,55,57,421,59,419,423,422,56,58,420,60,417,418,416,415,458,490,489,488,487,486,61,90,89,88,87,98,103,104,97,100,105,101,102,99],
            /* Мультфтльмы */[62,93,91,94,96,95,63,120,119,118,117,116,115,114,113,112,111,110,109],
            /* Книги */[4,161,160,159,158,157,156,155,492,154,153,152,151,150,149,467,5,175,174,173,172,171,170,169,168,166,167,164,165,163,162,8,220,219,218,217,216,215,214,213,212,211,210,209,208,16,188,187,186,185,184,183,182,181,180,179,178,177,176,146,194,193,192,191,190,189,147,198,197,196,195,148,207,206,205,204,203,202,201,200,199,406],
            /* ПО */[2,21,372,22,23,24,25,26,27,3,28,29,30,31,38,37,36,35,34,33,32,260,302,301,300,299,298,297,296,261,294,293,292,290,289,287,286,284,283,282,281,280,279,278,277,262,275,274,273,272,271,270,269,268,263,314,313,312,414,311,310,309,308,307,306,305,303,264,325,324,323,322,321,320,319,318,317,316,265,266,336,331,327,332,330,333,335,328,329,334,267,344,510],
            /* Анимэ */[],
            /* Док. и юмор */[375,382,381,383,379,380,378,377,376,52,108,107,106],
            /* Спорт */[373,465,464,463,461,460,462,466,459]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(f),groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = view.load_in_sandbox(id,c);
            t = t.find('#tor-tbl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td = t.eq(i).children('td');
                if (td.eq(3).find('a').attr('href') == null) continue;
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(2).find('a').text(), 
                        'url': root_url+td.eq(2).find('a').attr('href'),
                        'id': calculateCategory(td.eq(2).find('a').attr('href').replace(/.*f=([0-9]*).*$/i,"$1"))
                    },
                    'title' : td.eq(3).find('a').text(),
                    'url' : root_url+td.eq(3).find('a').attr('href'),
                    'size' : td.eq(5).children('u').text(),
                    'dl' : root_url+td.eq(5).children('a').attr('href'),
                    'seeds' : td.eq(6).text(),
                    'leechs' : td.eq(7).text(),
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