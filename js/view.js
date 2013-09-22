var view = function() {
    var trackerFilter = null;
    var keywordFilter = null;
    var sizeFilter = null;
    var categoryFilter = null;
    var categorys = [];
    var categorys_assoc = null;
    var lastFilterWord = '';
    var autoMove = null;
    var filter_timers = {
        word: null,
        size: null
    };
    var HideLeech = parseInt(GetSettings('HideLeech') || 1);
    var HideSeed = parseInt(GetSettings('HideSeed') || 0);
    var ShowIcons = parseInt(GetSettings('ShowIcons') || 1);
    var HideZeroSeed = parseInt(GetSettings('HideZeroSeed') || 0);
    var AdvFiltration = parseInt(GetSettings('AdvFiltration') || 2);
    var TeaserFilter = parseInt(GetSettings('TeaserFilter') || 1);
    var SubCategoryFilter = parseInt(GetSettings('SubCategoryFilter') || 0);
    var AutoComplite_opt = parseInt(GetSettings('AutoComplite_opt') || 1);
    var autoSetCat = parseInt(GetSettings('autoSetCat') || 1);
    var allow_get_description = parseInt(GetSettings('allow_get_description') || 1);
    var _sub_select_enable = parseInt(GetSettings('sub_select_enable') || 1);
    var update_table = {
        timer: null,
        time: null
    };
    var backgroundMode = false;
    var backgroundModeID = null;
    var keyword_filter_cache = {};
    var xhr_autocomplite = null;
    var tmp_var_qbox = 0;
    var tmp_vars = {};
    var auth = function(s, t) {
        //if (backgroundMode) return;
        $('ul.trackers').children('li[data-id="' + t + '"]').children('ul').remove();
        if (!s) {
            $('ul.trackers').children('li[data-id="' + t + '"]').append('<ul><li><a href="' + tracker[t].login_url + '" target="_blank">' + _lang['btn_login'] + '</a></li></ul>');
        }
    };
    var clear_table = function() {
        backgroundMode = false;
        $('div.about_panel').empty();
        $('#rez_table').children('tbody')[0].innerHTML = "";
        $('div.filter').children('input').val('');
        keywordFilter = null;
        lastFilterWord = '';
        keyword_filter_cache = {};
        $('div.filter div.btn').hide();
        $('div.size_filter').find('input').val('');
        sizeFilter = null;
        $('ul.trackers li a.selected').removeClass('selected');
        $('ul.trackers li').attr('data-count', 0);
        updateTrackerCount();
        trackerFilter = null;
        updateCategorys();
    };
    var loadingStatus = function(s, t) {
        //if (backgroundMode) return;
        var tracker_img = $('ul.trackers').children('li[data-id="' + t + '"]').children('div.tracker_icon');
        switch (s) {
            case 0:
                tracker_img.css('background', 'url(images/loading.gif) center center #fff');
                break;
            case 1:
                tracker_img.removeAttr('style');
                break;
            case 2:
                tracker_img.css('background', 'url(images/error.png) center center #fff');
                break;
        }
    };
    var addTrackerInList = function(i) {
        $('body').append('<style class="tr_icon">div.tracker_icon.num' + i + ' { ' + ((tracker[i].icon.length === 0 || tracker[i].icon[0] === '#') ? 'background-color: ' + ((tracker[i].icon.length !== 0) ? tracker[i].icon : '#ccc') + ';border-radius: 8px;' : 'background-image: url(' + tracker[i].icon + ');') + ' }</style>');
        $('<li data-id="' + i + '"/>').append($('<div class="tracker_icon num' + i + '" data-count="0"/>')).append($('<a href="#">' + tracker[i].name + '</a>').on("click", function(event) {
            event.preventDefault();
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
                trackerFilter = null;
            } else {
                $('ul.trackers li a.selected').removeClass('selected');
                $(this).addClass('selected');
                trackerFilter = $(this).parent('li').attr('data-id') || null;
            }
            updateCategorys();
            $('ul.categorys').children('li.selected').trigger('click');
        })).append('<i/>').appendTo($('ul.trackers'));
    };
    var ClearTrackerList = function() {
        $('ul.trackers').empty();
        $('style.tr_icon').remove();
    };
    function isInt(n) {
        if (n === undefined || n === null || n.length === 0)
            return false;
        return n % 1 === 0;
    }
    var quality_calc = function(quality, v) {
        quality.seed = (v.seeds > 50) ? 60 : (v.seeds > 30) ? 40 : (v.seeds > 20) ? 30 : (v.seeds > 10) ? 20 : (v.seeds > 0) ? 10 : 0;
        if (v.size < 524288000 && quality.video > 45)
            quality.video = Math.round(parseInt(quality.video) / 10);
        else
        if (v.size < 1363148800 && quality.video > 65)
            quality.video = Math.round(parseInt(quality.video) / 2);
        quality.value = quality.seed + quality.name + quality.video + quality.music + quality.game;
        return quality;
    };
    var autoset_Category = function(quality) {
        if (quality.book) {
            return 5;
        }
        if (quality.serial) {
            return 0;
        }
        if (quality.mult) {
            return 4;
        }
        if (quality.video > quality.music && quality.video > quality.game)
            return 3;
        if (quality.music > quality.video && quality.music > quality.game)
            return 1;
        if (quality.game > quality.music && quality.game > quality.video)
            return 2;
        return -1;
    };
    var torrent_check = function(v, t) {
        var tests = ('tests' in tracker[t]) ? tracker[t].tests : false;
        var er = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        if ('category' in v === false) {
            v['category'] = {
                title: null,
                url: null,
                id: -1
            };
            er[0] = 1;
            if (tests && tests[0] === 2) {
                er[0] = 0;
            }
        }
        if (v.category.title === undefined || v.category.title === null || v.category.title.length === 0) {
            v.category.title = null;
            er[1] = 1;
            if (tests && tests[1] !== 0) {
                er[1] = 0;
            }
        }
        if (v.category.url === undefined || v.category.url === null || v.category.url.length === 0) {
            v.category.url = null;
            er[2] = 1;
            if (tests && tests[2] !== 0) {
                er[2] = 0;
            }
        }
        if (v.category.id === undefined || v.category.id === null || v.category.id.length === 0) {
            v.category.id = -1;
            er[3] = 1;
            if (tests && tests[3] !== 0) {
                er[3] = 0;
            }
        }
        v.size = parseFloat(v.size);
        if (isNaN(parseFloat(v.size))) {
            v.size = 0;
            er[4] = 1;
            if (tests && tests[4] !== 0) {
                er[4] = 0;
            }
        }
        if (v.dl === undefined || v.dl === null || v.dl.length === 0) {
            v.dl = null;
            er[5] = 1;
            if (tests && tests[5] !== 0) {
                er[5] = 0;
            }
        }
        v.seeds = parseFloat(v.seeds);
        if (isNaN(parseFloat(v.seeds))) {
            v.seeds = 1;
            er[6] = 1;
            if (tests && tests[6] !== 0) {
                er[6] = 0;
            }
        }
        v.leechs = parseFloat(v.leechs);
        if (isNaN(parseFloat(v.leechs))) {
            v.leechs = 0;
            er[7] = 1;
            if (tests && tests[7] !== 0) {
                er[7] = 0;
            }
        }
        v.time = parseFloat(v.time);
        if (isNaN(parseFloat(v.time))) {
            v.time = 0;
            er[8] = 1;
            if (tests && tests[8] !== 0) {
                er[8] = 0;
            }
        }
        if (er.join(',') !== '0,0,0,0,0,0,0,0,0') {
            //tests syntax:
            //0 - category exist
            //1 - cotegory title
            //2 - cotegory url
            //3 - cotegory id
            //4 - file size
            //5 - dl link
            //6 - seeds
            //7 - leechs
            //8 - time
            console.log('Item in tracker ' + tracker[t].name + ' have problem! Tests: ' + er.join(','));
            if (er[0])
                console.log(er[0] + ' - cotegory exist fix!');
            if (er[1])
                console.log(er[1] + ' - cotegory title fix');
            if (er[2])
                console.log(er[1] + ' - cotegory url fix');
            if (er[3])
                console.log(er[1] + ' - cotegory id fix');
            if (er[4])
                console.log(er[4] + ' - file size fix');
            if (er[5])
                console.log(er[5] + ' - dl link fix');
            if (er[6])
                console.log(er[6] + ' - seeds fix');
            if (er[7])
                console.log(er[7] + ' - leechs fix');
            if (er[8])
                console.log(er[8] + ' - time fix');
        }
    };
    var teaser_filter = function(title) {
        return ((/Трейлер|Тизер|Teaser|Trailer/i).test(title)) ? 1 : 0;
    };
    var inBGMode = function(t, a, s) {
        if ("year" in keyword_filter_cache === false) {
            keyword_filter_cache["year"] = s.match(/[0-9]{4}/);
            if (keyword_filter_cache["year"]) {
                keyword_filter_cache["year"] = keyword_filter_cache["year"][0];
            }
            if (keyword_filter_cache["year"] === s) {
                keyword_filter_cache["year"] = null;
            }
        }
        if ("keyword" in keyword_filter_cache === false) {
            keyword_filter_cache["keyword"] = s.replace(/\s+/g, " ").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            keyword_filter_cache["keyword_lover"] = s.replace(/\s+/g, " ").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            keyword_filter_cache["keyword_regexp"] = keyword_filter_cache.keyword.replace(/([.?*+^$[\]\\{}|-])/g, "\\$1");
            keyword_filter_cache["keyword_regexp_lover"] = keyword_filter_cache["keyword_regexp"].toLowerCase();
        }
        if (keyword_filter_cache["year"] !== null && "keyword_no_year" in keyword_filter_cache === false) {
            keyword_filter_cache["keyword_no_year"] = keyword_filter_cache["keyword"].replace(" " + keyword_filter_cache["year"], "");
            keyword_filter_cache["keyword_no_year_regexp"] = keyword_filter_cache.keyword_no_year.replace(/([.?*+^$[\]\\{}|-])/g, "\\$1");
            keyword_filter_cache["keyword_no_year_regexp_lover"] = keyword_filter_cache["keyword_no_year_regexp"].toLowerCase();
        }
        var sum = 0;
        $.each(a, function(k, v) {
            if (typeof(v.title) !== 'string' || typeof(v.url) !== 'string' || v.title.length === 0 || v.url.length === 0) {
                console.log('Item in tracker ' + tracker[t].name + ' have critical problem! Torrent skipped!', v);
                return true;
            }
            torrent_check(v, t);
            if (HideZeroSeed && v.seeds === 0) {
                if (tmp_var_qbox === 0) {
                    explore.setQuality({id: backgroundModeID.id, section: backgroundModeID.section});
                }
                return true;
            }
            if (teaser_filter(v.title + v.category.title) === 1) {
                if (tmp_var_qbox === 0) {
                    explore.setQuality({id: backgroundModeID.id, section: backgroundModeID.section});
                }
                return true;
            }

            var title = syntax_highlighting(v.title);
            var quality = quality_calc(title.r, v);
            if (quality.name === 0 || quality.name < 100) {
                if (tmp_var_qbox === 0) {
                    explore.setQuality({id: backgroundModeID.id, section: backgroundModeID.section});
                }
                return true;
            }
            sum++;
            title = title.n;
            if (v.category.id < 0) {
                v.category.id = autoset_Category(quality);
            }
            if ("count" in backgroundModeID === false) {
                backgroundModeID = {count: 0, section: backgroundModeID.section, id: backgroundModeID.id, cat_c: {}, year: {}};
            }
            backgroundModeID.count++;
            if (backgroundModeID.cat_c[v.category.id] === undefined) {
                backgroundModeID.cat_c[v.category.id] = 0;
            }
            backgroundModeID.cat_c[v.category.id]++;
            if (backgroundModeID.year[quality.year] === undefined) {
                backgroundModeID.year[quality.year] = {};
            }
            if (backgroundModeID.year[quality.year][v.category.id] === undefined) {
                backgroundModeID.year[quality.year][v.category.id] = {
                    count: 0,
                    name: "",
                    link: "",
                    size: 0,
                    name_quality: 0,
                    quality: 0,
                    m: []
                };
            }
            backgroundModeID.year[quality.year][v.category.id].count++;
            var item = backgroundModeID.year[quality.year][v.category.id];
            if (item.name.length === 0) {
                item.name = title;
                item.link = v.url;
                item.size = bytesToSize(v.size);
                item.name_quality = quality.name;
                item.quality = quality.value;
                item.m = quality.qbox;
            } else
            if (item.name_quality >= quality.name && item.quality < quality.value) {
                item.name = title;
                item.link = v.url;
                item.size = bytesToSize(v.size);
                item.name_quality = quality.name;
                item.quality = quality.value;
                item.m = quality.qbox;
            }
        });
        updateTrackerResultCount(t, sum);
        loadingStatus(1, t);
        tmp_var_qbox = 1;
        explore.setQuality(backgroundModeID, keyword_filter_cache["year"]);
    };
    var write_result = function(t, a, s, p) {
        if (backgroundMode) {
            return inBGMode(t, a, s);
        }
        //var dbg_start = (new Date()).getTime();
        var c = '';
        if (p === undefined) {
            $('#rez_table tbody').children('tr[data-tracker="' + t + '"]').remove();
        }
        if ("year" in keyword_filter_cache === false) {
            keyword_filter_cache["year"] = s.match(/[0-9]{4}/);
            if (keyword_filter_cache["year"]) {
                keyword_filter_cache["year"] = keyword_filter_cache["year"][0];
            }
            if (keyword_filter_cache["year"] === s) {
                keyword_filter_cache["year"] = null;
            }
        }
        if ("keyword" in keyword_filter_cache === false) {
            keyword_filter_cache["keyword"] = s.replace(/\s+/g, " ").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            keyword_filter_cache["keyword_regexp"] = keyword_filter_cache.keyword.replace(/([.?*+^$[\]\\{}|-])/g, "\\$1");
            keyword_filter_cache["keyword_regexp_lover"] = keyword_filter_cache["keyword_regexp"].toLowerCase();
        }
        if ("keyword_no_year" in keyword_filter_cache === false && keyword_filter_cache["year"]) {
            keyword_filter_cache["keyword_no_year"] = keyword_filter_cache["keyword"].replace(" " + keyword_filter_cache["year"], "");
            keyword_filter_cache["keyword_no_year_regexp"] = keyword_filter_cache.keyword_no_year.replace(/([.?*+^$[\]\\{}|-])/g, "\\$1");
            keyword_filter_cache["keyword_no_year_regexp_lover"] = keyword_filter_cache["keyword_no_year_regexp"].toLowerCase();
        }
        var sum = 0;
        $.each(a, function(k, v) {
            if (typeof(v.title) !== 'string' || typeof(v.url) !== 'string' || v.title.length === 0 || v.url.length === 0) {
                console.log('Tracker ' + tracker[t].name + ' have critical problem! Torrent skipped!', v);
                return true;
            }
            torrent_check(v, t);
            if (HideZeroSeed && v.seeds === 0) {
                return true;
            }
            if (teaser_filter(v.title + v.category.title) === 1) {
                return true;
            }
            if ((/^[\s|\t]+/).test(v.title)) {
                v.title = $.trim(v.title);
            }
            if ((/^[\s|\t]+/).test(v.category.title)) {
                v.category.title = $.trim(v.category.title);
            }
            if (v.category.title !== null && v.category.title.length === 0) {
                v.category.title = null;
            }
            if (v.title.length === 0) {
                console.log('Item in tracker ' + tracker[t].name + ' have critical problem! Torrent skipped!', v);
                return true;
            }
            var title = syntax_highlighting(v.title);
            sum++;
            var quality = quality_calc(title.r, v);
            title = title.n;
            if (autoSetCat & v.category.id < 0) {
                v.category.id = autoset_Category(quality);
            }
            var filter = '';
            var fk = 0;
            if (trackerFilter !== null && trackerFilter !== String(t)) {
                filter = 'style="display: none;"';
            }
            if (categoryFilter !== null && categoryFilter !== String(v.category.id)) {
                filter = 'style="display: none;"';
            }
            if (keywordFilter !== null) {
                var keyword = $.trim($('div.filter').children('input').val()).replace(/\s+/g, " ");
                if (title === filterTextCheck(keyword, title))
                    filter = 'style="display: none;"';
                else
                    fk = 1;
            }
            var fs = 0;
            if (sizeFilter !== null) {
                if (v.size > sizeFilter.from && ((sizeFilter.to > 0 && v.size < sizeFilter.to) || (sizeFilter.to <= 0))) {
                    fs = 1;
                } else {
                    filter = 'style="display: none;"';
                }
            }
            c = c + '<tr ' + filter + ' data-fs="' + fs + '" data-kf="' + fk + '" data-tracker="' + t + '" data-c="' + v.category.id + '">'
                    + '<td class="time" data-value="' + v.time + '" title="' + unixintimetitle(v.time) + '">' + unixintime(v.time) + '</td>'
                    + '<td class="quality" data-value="' + quality.value + '" data-qgame="' + quality.game + '" data-qseed="' + quality.seed + '" data-qname="' + quality.name + '" data-qvideo="' + quality.video + '" data-qmusic="' + quality.music + '" data-qbook="' + quality.book + '"><div class="progress"><div style="width:' + (quality.value / 15) + 'px"></div><span title="' + quality.value + '">' + quality.value + '</span></div></td>'
                    + '<td class="name"><div class="title"><a href="' + v.url + '" target="_blank">' + title + '</a>'
                    + ((v.category.title === null && ShowIcons) ? '<div class="tracker_icon num' + t + '" title="' + tracker[t].name + '"></div>' : '')
                    + '</div>'
                    + ((v.category.title !== null) ? '<ul><li class="category">' + ((v.category.url === null) ? v.category.title : '<a href="' + v.category.url + '" target="blank">' + v.category.title + '</a>') + ((ShowIcons) ? '<div class="tracker_icon num' + t + '" title="' + tracker[t].name + '"></div></li>' : '</li>') + '</ul>' : '')
                    + '</td>'
                    + '<td class="size" data-value="' + v.size + '">' + ((v.dl !== null) ? '<a href="' + v.dl + '" target="_blank">' + bytesToSize(v.size) + ' ↓</a>' : bytesToSize(v.size)) + '</td>'
                    + ((!HideSeed) ? '  <td class="seeds" data-value="' + v.seeds + '">' + v.seeds + '</td>' : '')
                    + ((!HideLeech) ? '  <td class="leechs" data-value="' + v.leechs + '">' + v.leechs + '</td>' : '')
                    + '</tr>';
        });
        if (p !== undefined) {
            sum = p;
        }
        updateTrackerResultCount(t, sum);
        loadingStatus(1, t);
        if (sum > 0) {
            $('#rez_table tbody').append(contentUnFilter(c));
            table_update_timer(1);
        }
    };
    var table_update_timer = function(a) {
        var time = new Date().getTime();
        if (a === undefined) {
            //выполнятеся от таймера
            if (time - update_table.time > 200) {
                //обновление сортровки
                $('#rez_table').trigger("update");
                //обновление категории
                updateCategorys();
                update_table.timer = null;
            } else {
                clearTimeout(update_table.timer);
                update_table.timer = setTimeout(table_update_timer, 200);
            }
        } else {
            //выполнфется тригером
            if (update_table.time === null)
                updateCategorys();
            update_table.time = time;
            clearTimeout(update_table.timer);
            update_table.timer = setTimeout(table_update_timer, 200);
        }
    };
    var bytesToSize = function(bytes, nan) {
        //переводит байты в строчки
        var sizes = _lang['size_list'];
        if (nan === undefined)
            nan = 'n/a';
        if (bytes <= 0)
            return nan;
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i === 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        }
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    };
    var utiemonstr = function(shtamp) {
        //преврящает TimeShtamp в строчку
        var dt = new Date(shtamp * 1000);
        var m = dt.getMonth() + 1;
        if (m.toString().length === 1)
            m = '0' + m.toString();
        var d = dt.getDate();
        if (d.toString().length === 1)
            d = '0' + d.toString();
        var h = dt.getHours();
        if (h.toString().length === 1)
            h = '0' + h.toString();
        var mi = dt.getMinutes();
        if (mi.toString().length === 1)
            mi = '0' + mi.toString();
        var sec = dt.getSeconds();
        if (sec.toString().length === 1)
            sec = '0' + sec.toString();
        //var time = '';
        //if (h!='00' && mi!='00' && sec != '00')
        //    time = ' '+h+':'+mi+':'+sec;
        var t = d + '-' + m + '-' + dt.getFullYear();//+time;
        return t;
    };
    var unixintimetitle = function(i) {
        if (i <= 0)
            return '∞';
        else
            return utiemonstr(i);
    };
    var round_day_unixtime = function(i) {
        var dt = new Date(i * 1000);
        return Math.round(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime() / 1000);
    };
    var getHandM_unixtime = function(i) {
        var dt = new Date(i * 1000);
        return addZero(dt.getHours()) + ':' + addZero(dt.getMinutes());
    };
    var addZero = function(i) {
        if (i < 10)
            return '0' + i;
        return i;
    };
    var unixintime = function(utime)
    {
        //выписывает отсчет времени из unixtime
        var now_time = Math.round((new Date()).getTime() / 1000);
        var theDate = utiemonstr(utime);
        if (utime <= 0)
            return '∞';
        var i = now_time - utime;
        if (i < 0)
            return theDate;
        var day = Math.floor(i / 60 / 60 / 24);
        var week = Math.floor(day / 7);
        //var month = Math.floor(day/30);
        //week = Math.floor((day-30*month)/7);
        var day_sec = day * 60 * 60 * 24;
        var hour = Math.floor((i - day_sec) / 60 / 60);
        var minutes = Math.floor((i - day_sec - hour * 60 * 60) / 60);
        var seconds = Math.floor((i - day_sec - hour * 60 * 60 - minutes * 60));
        day = Math.floor(day - 7 * week);
        if (week > 0)
            return theDate;
        //var str_month = (month<5)?(month<2)?                    ' месяц':   ' месяца':  ' месяцев';
        //var str_week = ' ' + ((week < 5) ? (week < 2) ? (week < 1) ? _lang.times.week1 : _lang.times.week2 : _lang.times.week3 : _lang.times.week4);
        var str_day = ' ' + ((day < 5) ? (day < 2) ? (day < 1) ? _lang.times.day1 : _lang.times.day2 : _lang.times.day3 : _lang.times.day4);
        var str_hour = ' ' + ((hour < 5) ? (hour < 2) ? (hour < 1) ? _lang.times.hour1 : _lang.times.hour2 : _lang.times.hour3 : _lang.times.hour4);
        var str_minutes = ' ' + _lang.times.min;
        var str_seconds = ' ' + _lang.times.sec;
        //if (month>0)
        //    return month + str_month+((week>0)?' и '+week+str_week:'')+' назад';
        //if (week>0)
        //    return week + str_week+' назад';
        var d_te = (new Date()).getDate();
        var t_te = (new Date(utime * 1000)).getDate();
        if (day === 0 && d_te !== t_te)
            day = 1;
        if (day > 0)
            if (day === 1)
                return _lang.times.yest + ' ' + getHandM_unixtime(utime);
            else
                return day + str_day + ' ' + _lang.times.old;
        if (hour > 0)
            if (hour > 1)
                return _lang.times.today + ' ' + getHandM_unixtime(utime);
            else
                return hour + str_hour + ' ' + _lang.times.old;
        if (minutes > 0)
            return minutes + str_minutes + ' ' + _lang.times.old;
        if (seconds > 0)
            return seconds + str_seconds + ' ' + _lang.times.old;
        return theDate;
    };
    var updateTrackerResultCount = function(t, c, l) {
        if (l === undefined && c === undefined) {
            c = $('ul.trackers li[data-id="' + t + '"]').attr('data-count');
            if (c === undefined)
                c = 0;
            $('ul.trackers li[data-id="' + t + '"]').children('i').html('(' + c + ')');
        } else
        if (l === undefined) {
            $('ul.trackers li[data-id="' + t + '"]').attr('data-count', c).children('i').html('(' + c + ')');
        } else {
            if (l === 1)
                $('ul.trackers li[data-id="' + t + '"]').children('i').html('(' + c + ')');
        }
    };
    var contentFilter = function(c) {
        var c = c.replace(/\/\//img, '#blockurl#').replace(/ src=(['"]{0,1})/img, ' src=$11.png#blockrurl#');
        return c;
    };
    var contentUnFilter = function(c) {
        var c = c.replace(/1.png#blockrurl#/img, '').replace(/#blockrurl#/img, '').replace(/#blockurl#/img, '//');
        return c;
    };
    var syntax_highlighting = function(t) {
        var words = keyword_filter_cache.keyword_regexp.split(' ');
        var word_rate = Math.round(200 / words.length);
        var first_rate = Math.round(word_rate + word_rate / 2);
        var name = t;
        var name_lover = name.toLowerCase();


        var rate = {name: 0, video: 0, game: 0, music: 0, serial: 0, book: 0, mult: 0, m: [], seed: 0, value: 0, year: 0, block: [], qbox: "+"};
        var word_hl = 0;
        var year_hl = 0;
        var cal_rate = function(a, b, c) {
            if ($.inArray(a, rate.m) === -1) {
                rate.m.push(a);
            } else {
                return '';
            }
            a = a.toLowerCase();
            var sub_l = c[b - 1];
            var sub_r = c[b + a.length];
            if (sub_r === undefined)
                sub_r = '';
            if (sub_l === undefined)
                sub_l = '';
            if ((/\w/).test(sub_l + sub_r)) {
                return '';
            }
            if ($.inArray("video_type", rate.block) === -1) {
                if (a === "blu-ray") {
                    rate.video += 100;
                    rate.block.push("video_type");
                    rate.qbox = "Blu-ray";
                } else
                if (a === "bd-remux" || a === "bdremux") {
                    rate.video += 90;
                    rate.block.push("video_type");
                    rate.qbox = "Remux";
                } else
                if (a === "bd-rip" || a === "bdrip" || a === "bdrip-avc") {
                    rate.video += 80;
                    rate.block.push("video_type");
                    rate.qbox = "BDRip";
                } else
                if (a === "camrip" || a === "camrip-avc") {
                    rate.video += 10;
                    rate.block.push("video_type");
                    rate.qbox = "CAMRip";
                } else
                if (a === "hdtv-rip" || a === "hdtvrip") {
                    rate.video += 70;
                    rate.block.push("video_type");
                    rate.qbox = "HDTV-Rip";
                } else
                if (a === "dtheater-rip") {
                    rate.video += 70;
                    rate.block.push("video_type");
                    rate.qbox = "DTheater-Rip";
                } else
                if (a === "lowhdrip") {
                    rate.video += 10;
                    rate.block.push("video_type");
                    rate.qbox = "LowHDRip";
                } else
                if (a === "hdtv") {
                    rate.video += 60;
                    rate.block.push("video_type");
                    rate.qbox = "HDTV";
                } else
                if (a === "hdrip" || a === "hdrip-avc") {
                    rate.video += 60;
                    rate.block.push("video_type");
                    rate.qbox = "HDRip";
                } else
                if (a === "dvdrip" || a === "dvd-rip" || a === "dvdrip-avc") {
                    rate.video += 60;
                    rate.block.push("video_type");
                    rate.qbox = "DVD-Rip";
                } else
                if (a === "dvd" || a === "dvd5" || a === "2xdvd9" || a === "dvd9" || a === "dvd-9" || a === "hd-dvd") {
                    rate.video += 50;
                    rate.block.push("video_type");
                    rate.qbox = "DVD";
                } else
                if (a === "hqsatrip" || a === "hqrip" || a === "hqrip-avc") {
                    rate.video += 44;
                    rate.block.push("video_type");
                    rate.qbox = "HDrip";
                } else
                if (a === "tvrip" || a === "iptvrip") {
                    rate.video += 40;
                    rate.block.push("video_type");
                    rate.qbox = "TV-Rip";
                } else
                if (a === "webrip") {
                    rate.video += 40;
                    rate.block.push("video_type");
                    rate.qbox = "WebRip";
                } else
                if (a === "web-dlrip-avc" || a === "webdl-rip" || a === "web-dlrip" || a === "web-dl") {
                    rate.video += 40;
                    rate.block.push("video_type");
                    rate.qbox = "WEB-DL";
                } else
                if (a === "satrip") {
                    rate.video += 40;
                    rate.block.push("video_type");
                    rate.qbox = "SAT-Rip";
                } else
                if (a === "dvb") {
                    rate.video += 40;
                    rate.block.push("video_type");
                    rate.qbox = "DVB";
                } else
                if (a === "telesynch" || a === "ts") {
                    rate.video += 20;
                    rate.block.push("video_type");
                    rate.qbox = "Telesync";
                }
                if (a === "dvdscr" || a === "dvdscreener") {
                    rate.video += 20;
                    rate.block.push("video_type");
                    rate.qbox = "DVD-Screener";
                }
                if (a === "flac" || a === "alac" || a === "lossless") {
                    rate.music += 100;
                    rate.block.push("video_type");
                    rate.qbox = "lossless";
                } else
                if (a === "mp3") {
                    rate.music += 80;
                    rate.qbox = "MP3";
                } else
                if (a === "ps3") {
                    rate.game += 80;
                    rate.block.push("video_type");
                    rate.qbox = "PS3";
                } else
                if (a === "xbox") {
                    rate.game += 80;
                    rate.block.push("video_type");
                    rate.qbox = "XBox";
                } else
                if (a === "(ps2)") {
                    rate.game += 80;
                    rate.block.push("video_type");
                    rate.qbox = "PS2";
                } else
                if (a === "[p]" || a === "{p}" || a === "(p)") {
                    rate.game += 20;
                    rate.block.push("video_type");
                    rate.qbox = "P";
                } else
                if (a === "repack" || a === "lossless repack" || a === "steam-rip" || a === "(lossy rip)" || a === "reloaded") {
                    rate.game += 60;
                    rate.block.push("video_type");
                    rate.qbox = "RePack";
                } else
                if (a === "[native]") {
                    rate.game += 100;
                    rate.block.push("video_type");
                    rate.qbox = "Native";
                } else
                if (a === "[rip]" || a === "{rip}" || a === "(rip)") {
                    rate.game += 80;
                    rate.block.push("video_type");
                    rate.qbox = "Rip";
                } else
                if (a === "[l]" || a === "{l}" || a === "(l)") {
                    rate.game += 100;
                    rate.block.push("video_type");
                    rate.qbox = "L";
                } else
                if (a === "лицензия") {
                    rate.game += 100;
                    rate.block.push("video_type");
                    rate.qbox = "L";
                } else
                if (a === "fb2" || a === "pdf" || a === "dejvu" || a === "rtf" || a === "epub") {
                    rate.book += 100;
                    rate.block.push("video_type");
                    rate.qbox = a;
                }
            }
            if (a === "h.264" || a === "h264" || a === "mp4" || a === "m4v") {
                rate.video += 2;
            } else
            if (a === "1080p" || a === "1080i") {
                rate.video += 20;
            } else
            if (a === "720p") {
                rate.video += 10;
            } else
            if (a === "звук с ts") {
                rate.video -= 50;
            } else
            if (a === "ст" || a === "sub" || a === "subs") {
                rate.video += 1;
            } else
            if (a === "dub" || a === "пд" || a === "по" || a === "дб" || a === "2xdub") {
                rate.video += 3;
            } else
            if (a === "пм") {
                rate.video += 2;
            } else
            if (a === "ап" || a === "ло" || a === "лд" || a === "vo") {
                rate.video += 1;
            } else
            if (a === "pc (windows)") {
                rate.game += 5;
            } else
            if (a === "сезон" || a === "season") {
                rate.serial++;
            } else
            if (a === "cue") {
                rate.music += 20;
            } else
            if (a === "soundtrack") {
                rate.music++;
            } else
            if ($.inArray("mp3", rate.m) !== -1 && a === "32") {
                rate.music -= 2;
            } else
            if ($.inArray("mp3", rate.m) !== -1 && a === "64") {
                rate.music += 0;
            } else
            if ($.inArray("mp3", rate.m) !== -1 && a === "96") {
                rate.music += 2;
            } else
            if ($.inArray("mp3", rate.m) !== -1 && a === "128") {
                rate.music += 5;
            } else
            if ($.inArray("mp3", rate.m) !== -1 && a === "192") {
                rate.music += 10;
            } else
            if ($.inArray("mp3", rate.m) !== -1 && a === "320") {
                rate.music += 15;
            } else
            if (a === "мультфильм") {
                rate.mult++;
            }
            return '';
        };
        var sub_select = function(name) {
            if (!_sub_select_enable)
                return name;
            return name.replace(/(\[[^\]]*\]|\([^\)]*\))/g, '<span class="sub_name">$1</span>');
        };
        var quality = "Blu-ray|Blu-Ray|BD-Remux|BDRemux|1080p|1080i|BDRip-AVC|BD-Rip|BDRip|CAMRip|CamRip-AVC|CamRip|HDTV-Rip|HQRip-AVC|HDTVrip|HDTVRip|DTheater-Rip|720p|LowHDRip|HDTV|HDRip-AVC|HDRip|DVD-Rip|DVDRip-AVC|DVDRip|DVD5|2xDVD9|DVD9|DVD-9|DVDScr|DVDScreener|HD-DVD|NoDVD|DVD|SatRip|HQSATRip|HQRip|TVRip|WEBRip|WEB-DLRip-AV​C|WebDL-Rip|AVC|WEB-DLRip|WEB-DL|SATRip|DVB|IPTVRip|TeleSynch|[Зз]{1}вук с TS|TS|АП|ЛО|ЛД|AVO|MVO|VO|DUB|2xDub|Dub|ДБ|ПМ|ПД|ПО|СТ|[Ss]{1}ubs|SUB|[sS]{1}ub|FLAC|flac|ALAC|alac|[lL]{1}oss[lL]{1}ess(?! repack)|\\(PS2\\)|PS3|Xbox|XBOX|Repack|RePack|\\[Native\\]|Lossless Repack|Steam-Rip|\\(Lossy Rip\/|{Rip}|[лЛ]{1}ицензия|RELOADED|\\[Rip\\]|\\[RiP\\]|\\{L\\}|\\(L\\)|\\[L\\]|[Ss]{1}eason(?=[s|:]?)|[Сс]{1}езон(?=[ы|:]?)|CUE|(?=\.)cue|MP3|128|192|320|\\(P\\)|\\[P\\]|PC \\(Windows\\)|Soundtrack|soundtrack|H\.264|mp4|MP4|M4V|FB2|PDF|RTF|EPUB|fb2|DJVU|djvu|epub|pdf|rtf|[мМ]{1}ультфильм";
        rate.year = name.match(/[0-9]{4}/);
        if (rate.year) {
            rate.year = parseInt(rate.year[0]);
            if (rate.year < 1970 || rate.year > (new Date()).getFullYear() + 1)
            {
                rate.year = 0;
            }
        } else {
            rate.year = 0;
        }
        name.replace(new RegExp(quality, "g"), cal_rate);
        if (keyword_filter_cache.keyword.length === 0) {
            hl_name = sub_select(name);
            return {
                n: hl_name,
                r: rate
            };
        }
        var cal_word_rate = function(a, b, c) {
            var sub_l = c[b - 1];
            var sub_r = c[b + a.length];
            if (sub_r === undefined) {
                sub_r = '';
            }
            if (sub_l === undefined) {
                sub_l = '';
            }
            if ((/[\wа-яА-Я]/).test(sub_l + sub_r)) {
                return a;
            }
            if (word_hl < words.length) {
                if (year_hl === 1 && a === keyword_filter_cache.year) {
                    return '<b>' + a + '</b>';
                }
                if (a === keyword_filter_cache.year) {
                    year_hl = 1;
                }
                if (b === 0) {
                    rate.name += first_rate;
                } else {
                    rate.name += word_rate;
                }
            }
            word_hl++;
            return '<b>' + a + '</b>';
        };
        if (keyword_filter_cache["year"]) {
            if (new RegExp('^' + keyword_filter_cache.keyword_regexp_lover + ' [/|(]{1} .*' + keyword_filter_cache.year + '.*').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lover + '|' + keyword_filter_cache.year + ')', "ig"), "<b>$1</b>");
                rate.name = (words.length - 1) * word_rate + first_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            //проверка по маске ([.*]) Name / .*year.*
            if (new RegExp('^[\\(\\[]{1}.*[\\)\\]]{1} ' + keyword_filter_cache.keyword_regexp_lover + ' [/|(]{1} .*' + keyword_filter_cache.year + '.*').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lover + '|' + keyword_filter_cache.year + ')', "ig"), "<b>$1</b>");
                rate.name = words.length * word_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            if (new RegExp('.* ' + keyword_filter_cache.keyword_no_year_regexp + ' [/|(]{1} .*' + keyword_filter_cache.year + '.*').test(name)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_no_year_regexp + '|' + keyword_filter_cache.year + ')', "g"), "<b>$1</b>");
                rate.name = words.length * word_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            if (new RegExp('^' + keyword_filter_cache.keyword_no_year_regexp + ' .*' + keyword_filter_cache.year + '.*').test(name)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_no_year_regexp + '|' + keyword_filter_cache.year + ')', "g"), "<b>$1</b>");
                rate.name = (words.length - 1) * word_rate + first_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            if (new RegExp('.* ' + keyword_filter_cache.keyword_no_year_regexp + ' .*' + keyword_filter_cache.year + '.*').test(name)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_no_year_regexp + '|' + keyword_filter_cache.year + ')', "g"), "<b>$1</b>");
                rate.name = words.length * word_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
        } else {
            if (new RegExp('^' + keyword_filter_cache.keyword_regexp_lover + '$').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lover + ')', "ig"), "<b>$1</b>");
                rate.name = (words.length - 1) * word_rate + first_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            if (new RegExp('^' + keyword_filter_cache.keyword_regexp_lover + ' [/|(]{1} ').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lover + ')', "ig"), "<b>$1</b>");
                rate.name = (words.length - 1) * word_rate + first_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            //проверка по маске ([.*]) Name / .*year.*
            if (new RegExp('^[([]{1}.*[)]]{1} ' + keyword_filter_cache.keyword_regexp_lover + ' [/|(]{1} ').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lover + ')', "ig"), "<b>$1</b>");
                rate.name = words.length * word_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate //95
                };
            }
            if (new RegExp(keyword_filter_cache.keyword_regexp_lover + ' [/|(]{1} ').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lover + ')', "ig"), "<b>$1</b>");
                rate.name = words.length * word_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate //86
                };
            }
            if (new RegExp('^' + keyword_filter_cache.keyword_regexp_lover + '[-/(\s.]{1}').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lover + ')', "ig"), "<b>$1</b>");
                rate.name = (words.length - 1) * word_rate + first_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate //80
                };
            }
        }
        var hl_name = name.replace(new RegExp(words.join('|'), "ig"), cal_word_rate);
        hl_name = sub_select(hl_name);
        if (year_hl && word_hl === 1) {
            rate.name = 0;
        }
        return {
            n: hl_name,
            r: rate
        };
    };
    var filterTextCheck = function(s, t) {
        if (s.length === 0)
            return 'a';
        var r = t;
        if (AdvFiltration === 1) {
            var tmp = s.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1").split(" ");
            if ((new RegExp(tmp.join('|'), "i")).test(t))
                r = 'a';
        } else
        if (AdvFiltration === 2) {
            var tmp = s.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1").split(" ");
            var tmp_l = tmp.length;
            var trgr = true;
            for (var i = 0; i < tmp_l; i++) {
                if (!(new RegExp(tmp[i], "i")).test(t)) {
                    trgr = false;
                    break;
                }
            }
            if (trgr)
                r = 'a';
        }
        else {
            var tmp = s.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1").split(",");
            var tmp_l = tmp.length;
            var trgr = true;
            for (var i = 0; i < tmp_l; i++) {
                if (!(new RegExp(tmp[i], "i")).test(t)) {
                    trgr = false;
                    break;
                }
            }
            if (trgr)
                r = 'a';
        }
        return r;
    };
    var updateTrackerCount = function() {
        var li = $('ul.trackers').children('li');
        var t_c = li.length;
        for (var i = 0; i < t_c; i++) {
            var id = li.eq(i).attr('data-id');
            if (keywordFilter === null && sizeFilter === null)
                updateTrackerResultCount(id);
            else {
                var filter = '';
                if (keywordFilter !== null) {
                    filter += '[data-kf=1]';
                }
                if (sizeFilter !== null) {
                    filter += '[data-fs=1]';
                }
                var count = $('#rez_table tbody').children('tr[data-tracker="' + id + '"]' + filter).length;
                updateTrackerResultCount(id, count, 1);
            }
        }
    };
    var updateCategorys = function() {
        var sum = 0;
        var count_c = categorys.length;
        for (var i = 0; i < count_c; i++) {
            var filter = '[data-c="' + categorys[i] + '"]';
            if (trackerFilter !== null)
                filter += '[data-tracker="' + trackerFilter + '"]';
            if (keywordFilter !== null) {
                filter += '[data-kf="1"]';
            }
            if (sizeFilter !== null) {
                filter += '[data-fs="1"]';
            }
            var count = $('#rez_table').children('tbody').children('tr' + filter).length;
            if (count > 0) {
                $('ul.categorys li[data-id="' + categorys[i] + '"]').css('display', 'inline-block').children('i').html('(' + count + ')');
                sum += count;
            } else {
                $('ul.categorys li[data-id="' + categorys[i] + '"]').css('display', 'none');
            }
        }
        $('ul.categorys li').eq(0).children('i').html('(' + sum + ')');
        if (autoMove !== null) {
            var item = $('ul.categorys li[data-id="' + autoMove + '"]');
            if (item.css('display') === 'inline-block') {
                $('ul.categorys li.selected').removeClass('selected');
                item.addClass('selected');
                item.trigger('click');
                autoMove = null;
            }
        }
        if ($('ul.categorys li.selected').css('display') === 'none') {
            var category = $('ul.categorys').children('li.selected').attr('data-id');
            $('ul.categorys li.selected').removeClass('selected');
            $('ul.categorys li').eq(0).addClass('selected');
            $('ul.categorys li.selected').trigger('click');
            autoMove = (category === undefined) ? null : category;
        }
    };
    var tableFilter = function(keyword) {
        if (keyword !== $('div.filter').children('input').val())
            return;
        $('div.filter div.btn').css('background-image', 'url(images/loading.gif)');
        keyword = $.trim(keyword).replace(/\s+/g, " ");
        if (keyword.length === 0) {
            $('div.filter').children('input').val('');
            keywordFilter = null;
            $('ul.categorys li.selected').trigger('click');
            updateCategorys();
            updateTrackerCount();
            $('div.filter div.btn').hide();
            return;
        }
        keywordFilter = keyword;
        if (keywordFilter !== lastFilterWord) {
            //lastFilterCache = null;
            lastFilterWord = keyword;
            //поиск и фильтрация контента
            var tr = $('#rez_table tbody').children('tr');
            var tr_count = tr.length;
            for (var i = 0; i < tr_count; i++) {
                var tr_eq = tr.eq(i);
                if (SubCategoryFilter) {
                    var name = tr_eq.children('td.name').text();
                } else {
                    var name = tr_eq.children('td.name').children('div.title').children('a').text();
                }
                var f_name = filterTextCheck(keyword, name);
                if (name !== f_name)
                    tr_eq.attr('data-kf', 1);
                else
                    tr_eq.attr('data-kf', 0);
            }
        }
        $('ul.categorys li.selected').trigger('click');
        updateCategorys();
        updateTrackerCount();
        $('div.filter div.btn').css('background-image', 'url(images/clear.png)');
    };
    tableSizeFilter = function(sizeFilter) {
        var tr = $('#rez_table tbody').children('tr');
        var tr_count = tr.length;
        for (var i = 0; i < tr_count; i++) {
            var tr_eq = tr.eq(i);
            var size = parseInt(tr_eq.children('td.size').attr('data-value'));
            if (size > sizeFilter.from && ((sizeFilter.to > 0 && size < sizeFilter.to) || (sizeFilter.to <= 0))) {
                tr_eq.attr('data-fs', 1);
            } else {
                tr_eq.attr('data-fs', 0);
            }
        }
        $('ul.categorys li.selected').trigger('click');
        updateCategorys();
        updateTrackerCount();
        //$('div.filter div.btn').css('background-image', 'url(images/clear.png)');
    };
    var triggerBlank = function() {
        $('body,html').scrollTop();
        $('div.result_panel').css('display', 'none');
        $('div.explore').css('display', 'block');
        clear_table();
        $('form[name="search"]').children('input[type=text]').val('');
        var old_title = document.title;
        document.title = 'Torrents MultiSearch';
        window.location = '#s=';
        global_wl_hash = location.hash;
        $('form[name="search"]').children('input[type="text"]').val('').focus();
        $('form[name="search"]').children('input[type="text"]').trigger("keyup");
        explore.getLoad();
        if (old_title !== document.title) {
            _gaq.push(['_trackPageview', 'index.html']);
        }
    };
    var triggerSearch = function(keyword) {
        if (keyword === "#") {
            return false;
        }
        keyword = $.trim(keyword);
        $('body,html').scrollTop();
        $('div.result_panel').css('display', 'block');
        $('div.explore').css('display', 'none');
        $('form input[type=text]').blur();
        var sel_tr = $('ul.trackers li a.selected').parent().data('id');
        if (sel_tr === undefined)
            sel_tr = null;
        clear_table();
        if (sel_tr !== null)
            $('ul.trackers li[data-id=' + sel_tr + ']').children('a').addClass('selected');
        keyword = $.trim(keyword);
        if ($('form[name="search"]').children('input[type="text"]').val() !== keyword) {
            $('form[name="search"]').children('input[type="text"]').val(keyword);
            $('form[name="search"]').children('input[type="text"]').trigger("keyup");
        }
        document.title = keyword + ' :: ' + 'TMS';
        window.location = '#s=' + keyword;
        global_wl_hash = location.hash;
        engine.search(keyword, sel_tr);
        if (allow_get_description) {
            explore.getAbout(keyword);
        }
        _gaq.push(['_trackPageview', 'index.html#s=' + keyword]);
        _gaq.push(['_trackEvent', 'Search', 'keyword', keyword]);
        return false;
    };
    var getQuality = function(keyword, id, section) {
        //flush for bg mode
        keyword_filter_cache = {};
        backgroundMode = true;
        backgroundModeID = {"section": section, "id": id};
        tmp_var_qbox = 0;
        engine.search(keyword, null, 1);
        _gaq.push(['_trackEvent', 'Quality', 'keyword', keyword]);
    };
    var load_category = function(c) {
        $('ul.categorys').empty();
        var count = c.length;
        categorys = [];
        categorys_assoc = [];
        for (var i = 0; i < count; i++) {
            categorys.push(c[i][0]);
            categorys_assoc[c[i][0]] = c[i][1];
            $('ul.categorys').append('<li data-id="' + c[i][0] + '">' + c[i][1] + '<i></i></li>');
        }
        $('ul.categorys').prepend('<li class="selected">' + _lang['cat_all'] + ' <i></i></li>');
    };
    var AddAutocomplete = function() {
        if (AutoComplite_opt === 0) {
            var AutocompleteArr = [];
            var order = function(a, b) {
                if (a.count > b.count)
                    return -1;
                if (a.count === b.count)
                    return 0;
                return 1;
            };
            var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
            if (search_history !== null) {
                search_history.sort(order);
                var count = search_history.length;
                for (var i = 0; i < count; i++) {
                    AutocompleteArr.push(search_history[i].title);
                }
            }
        }
        var inp = $('input[type="text"][name="s"]');
        if (inp.attr('autocomplete') !== undefined) {
            inp.autocomplete("destroy");
        }
        inp.autocomplete({
            source: (AutoComplite_opt === 0) ? AutocompleteArr : function(a, response) {
                if ($.trim(a.term).length === 0 || AutoComplite_opt === 0) {
                    var AutocompleteArr = [];
                    var order = function(a, b) {
                        if (a.count > b.count)
                            return -1;
                        if (a.count === b.count)
                            return 0;
                        return 1;
                    };
                    var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
                    if (search_history !== null) {
                        search_history.sort(order);
                        var count = search_history.length;
                        for (var i = 0; i < count; i++) {
                            AutocompleteArr.push(search_history[i].title);
                        }
                    }
                    response(AutocompleteArr);
                } else {
                    if (xhr_autocomplite !== null)
                        xhr_autocomplite.abort();
                    xhr_autocomplite = $.getJSON('http://suggestqueries.google.com/complete/search?client=firefox&q=' + a.term).success(function(data) {
                        var arr = data[1];
                        response(arr);
                    });
                }
            },
            minLength: 0,
            select: function(event, ui) {
                triggerSearch(ui.item.value);
            },
            position: {
                at: "bottom",
                collision: "bottom"
            }
        });
        inp.autocomplete("close");
    };
    var LoadProfiles = function() {
        var defProfile = parseInt(GetSettings('defProfile') || 0);
        var arr = engine.getProfileList();
        if (arr.length <= 1)
            return;
        var sel = $('<select title="' + _lang.label_profile + '">').on('change', function() {
            engine.loadProfile($(this).val());
        });
        $.each(arr, function(k, v) {
            sel.append('<option value="' + k + '" ' + ((k === defProfile) ? 'selected' : '') + '>' + v + '</option>');
        });
        sel = $('<div class="profile">').append(sel);
        $('div.tracker_list .setup').after(sel);
    };
    var load_in_sandbox = function(id, c) {
        var t = $($.parseHTML(c));
        return t;
    };
    var init_resizeble = function() {
        tmp_vars.torrent_list.resizable({
            minHeight: 40,
            resize: function(e, ui) {
                var ul = tmp_vars.torrent_list_ul;
                var top = ul.position().top;
                ul.css('height', ui.size.height - top + 'px');
            },
            stop: function(e, ui) {
                SetSettings('torrent_list_h', ui.size.height);
            }
        });
        var torrent_list_h = GetSettings('torrent_list_h');
        if (torrent_list_h !== undefined) {
            var ul = tmp_vars.torrent_list_ul;
            tmp_vars.torrent_list.css('height', torrent_list_h);
            ul.css('height', torrent_list_h - ul.position().top);
        }
    };
    return {
        result: function(t, a, s, p) {
            return write_result(t, a, s, p);
        },
        contentFilter: function(a) {
            return contentFilter(a);
        },
        contentUnFilter: function(a) {
            return contentUnFilter(a);
        },
        clear_table: function() {
            clear_table();
        },
        auth: function(s, id) {
            auth(s, id);
        },
        addTrackerInList: function(a) {
            addTrackerInList(a);
        },
        loadingStatus: function(a, b) {
            loadingStatus(a, b);
        },
        triggerSearch: function(a) {
            triggerSearch(a);
        },
        triggerBlank: function() {
            triggerBlank();
        },
        trackerFilter: function() {
            return trackerFilter;
        },
        setCatFilter: function(a) {
            categoryFilter = a;
        },
        SetAutoMove: function(a) {
            autoMove = a;
        },
        AddAutocomplete: function() {
            AddAutocomplete();
        },
        ClearTrackerList: function() {
            ClearTrackerList();
        },
        LoadProfiles: function() {
            LoadProfiles();
        },
        getQuality: function(a, b, c) {
            getQuality(a, b, c);
        },
        getAssocCategorys: function(a) {
            return categorys_assoc[a];
        },
        load_in_sandbox: function(a, b) {
            return load_in_sandbox(a, b);
        },
        begin: function() {
            $('form[name=search]').children('.sbutton').val(_lang['btn_form']);
            $('div.right').children('.main').attr('title', _lang['btn_main']);
            $('div.right').children('.history').attr('title', _lang['btn_history']);
            $('div.tracker_list').children('p').text(_lang['btn_tracker_list']);
            $('div.tracker_list').children('p').eq(0).text(_lang['tracker_list']);
            $('div.tracker_list').children('.setup').attr('title', _lang['btn_tracker_list']);
            $('div.filter').children('p').eq(0).text(_lang['filter']);
            $('div.filter').children('div.btn').attr('title', _lang['btn_filter']);
            $('div.size_filter').children('p').eq(0).text(_lang['size_filter']);
            $('div.size_filter').find('span.from').eq(0).text(_lang['size_filter_f']);
            $('div.size_filter').find('span.to').eq(0).text(_lang['size_filter_t']);
            $('div.size_filter').find('span.g').eq(0).text(_lang['size_filter_g']);
            $('div.search_panel').find('div.btn.clear').attr('title', _lang['btn_filter']);
            $('#rez_table').find('th.time').text(_lang['table'].time);
            $('#rez_table').find('th.quality').text(_lang['table'].quality[0]);
            $('#rez_table').find('th.quality').attr('title', _lang['table'].quality[1]);
            $('#rez_table').find('th.name').text(_lang['table'].title);
            $('#rez_table').find('th.size').text(_lang['table'].size);
            $('#rez_table').find('th.seeds').text(_lang['table'].seeds[0]);
            $('#rez_table').find('th.seeds').attr('title', _lang['table'].seeds[1]);
            $('#rez_table').find('th.leechs').text(_lang['table'].leechs[0]);
            $('#rez_table').find('th.leechs').attr('title', _lang['table'].leechs[1]);
            $('div.topbtn').attr('title', _lang['btn_up']);
            $('div.explore > div.source').children("span").text(_lang['exp_source']);
            $('div.explore > div.source').children("a").eq(0).text(_lang['exp_s_a_f']);
            $('div.explore > div.source').children("a").eq(1).text(_lang['exp_s_a_g']);
            load_category(engine.categorys);
            LoadProfiles();
            if (HideLeech) {
                $('th.leechs').remove();
            }
            if (HideSeed) {
                $('th.seeds').remove();
            }
            $('form[name="search"]').submit(function(event) {
                event.preventDefault();
                triggerSearch($(this).children('input[type="text"]').val());
                return false;
            });
            $('ul.categorys').on('click', 'li', function(event) {
                if (event.isTrigger !== true)
                    autoMove = null;
                var id = $(this).attr('data-id');
                categoryFilter = id || null;
                $('ul.categorys').children('li.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#rez_table').children('tbody').children('tr').css('display', 'none');
                var filter = '';
                if (id !== undefined) {
                    filter += '[data-c="' + id + '"]';
                }
                if (trackerFilter !== null) {
                    filter += '[data-tracker="' + trackerFilter + '"]';
                }
                if (keywordFilter !== null) {
                    filter += '[data-kf="1"]';
                }
                if (sizeFilter !== null) {
                    filter += '[data-fs="1"]';
                }
                $('#rez_table').children('tbody').children('tr' + filter).css('display', 'table-row');
                $('#rez_table').trigger("update");
            });
            $('ul.categorys').children('li').css('display', 'none').eq(0).css('display', 'inline-block');
            try {
                $('#rez_table').tablesorter({
                    textExtraction: function(node)
                    {
                        if ($(node).attr('data-value') !== undefined) {
                            if ($(node).attr('data-qname') !== undefined) {
                                var c = categoryFilter;
                                var val = parseInt($(node).attr('data-value'));
                                if (c === null)
                                    return val;
                                c = parseInt(c);
                                if (c === 3 || c === 0 || c === 7 || c === 8 || c === 4) {
                                    val = val - parseInt($(node).attr('data-qgame')) - parseInt($(node).attr('data-qmusic')) - parseInt($(node).attr('data-qbook'));
                                } else
                                if (c === 1) {
                                    val = val - parseInt($(node).attr('data-qgame')) - parseInt($(node).attr('data-qvideo')) - parseInt($(node).attr('data-qbook'));
                                } else
                                if (c === 2) {
                                    val = val - parseInt($(node).attr('data-qmusic')) - parseInt($(node).attr('data-qvideo')) - parseInt($(node).attr('data-qbook'));
                                } else
                                if (c === 5) {
                                    val = val - parseInt($(node).attr('data-qgame')) - parseInt($(node).attr('data-qvideo'));
                                }
                                return val;
                            } else
                                return $(node).attr('data-value');
                        }
                        if ($(node).children('div.title') !== undefined)
                            return $(node).children('div.title').text();
                        return $(node).html();
                    },
                    widgets: ['zebra'],
                    sortList: (GetSettings('Order') !== undefined) ? JSON.parse(GetSettings('Order')) : [[1, 1]],
                    onsort: function(s) {
                        SetSettings('Order', JSON.stringify(s));
                    },
                    selectorHeaders: '#rez_table > thead th'
                });
            } catch (err) {
            }
            $('form[name="search"]').children('input').eq(0).focus();
            $('form[name="search"]').children('div.btn.clear').on("click", function() {
                event.preventDefault();
                $(this).hide();
                $('form[name="search"]').children('input').eq(0).val("").focus();
            });
            $('form[name="search"]').children('input').eq(0).on('keyup', function() {
                if (this.value.length > 0) {
                    $(this).parent().children('div.btn.clear').show();
                } else {
                    $(this).parent().children('div.btn.clear').hide();
                }
            });
            $('div.filter input').keyup(function() {
                var t = $(this).val();
                $('div.filter div.btn').css('background-image', 'url(images/loading.gif)');
                if (t.length > 0) {
                    $('div.filter div.btn').show();
                }
                clearTimeout(filter_timers.word);
                filter_timers.word = setTimeout(function() {
                    tableFilter(t);
                }, 500);
            });
            $('div.filter div.btn').on("click", function() {
                $('div.filter input').val('');
                tableFilter('');
            });
            $('div.size_filter').find('input').keyup(function() {
                var t = parseFloat($(this).val());
                if (isNaN(t) || t < 0 || (t < 0 === false && t > 0 === false)) {
                    t = 0;
                }
                t = t * 1024 * 1024 * 1024;
                var type = 1;
                if ($(this).attr('name') === "f_v") {
                    type = 0;
                }
                if (sizeFilter === null) {
                    sizeFilter = {
                        from: 0,
                        to: 0
                    };
                }
                if (type === 1) {
                    sizeFilter.to = t;
                } else {
                    sizeFilter.from = t;
                }
                //$('div.filter div.btn').css('background-image', 'url(images/loading.gif)');
                //if (t.length > 0) {
                //    $('div.filter div.btn').show();
                //}
                clearTimeout(filter_timers.size);
                filter_timers.size = setTimeout(function() {
                    tableSizeFilter(sizeFilter);
                }, 500);
            });
            var s = (document.URL).replace(/(.*)index.html/, '').replace(/#s=(.*)/, '$1');
            if (s.length > 0) {
                $('form[name="search"]').children('input[type="text"]').val(s);
                $('form[name="search"]').children('input[type="text"]').trigger("keyup");
            }
            $('div.tracker_list .setup').on("click", function(e) {
                e.preventDefault();
                window.location = 'options.html#back=' + $.trim($('form[name="search"]').children('input[type="text"]').val());
            });
            $('input.sbutton.main').on("click", function() {
                triggerBlank();
            });
            $('input.sbutton.history').on("click", function() {
                window.location = 'history.html';
            });
            AddAutocomplete();
            $('div.topbtn').hide();
            $(window).scroll(function() {
                if ($(this).scrollTop() > 100) {
                    $('div.topbtn').fadeIn('fast');
                } else {
                    $('div.topbtn').fadeOut('fast');
                }
            });
            $('div.topbtn').on("click", function(event) {
                event.preventDefault();
                $('body,html').animate({
                    scrollTop: 0
                }, 200);
                return false;
            });
            tmp_vars.torrent_list = $('div.tracker_list');
            tmp_vars.torrent_list_ul = $('div.tracker_list').children('ul').eq(0);
            if (GetSettings('torrent_list_r') === "1") {
                init_resizeble();
            } else {
                tmp_vars.torrent_list_ul.css({'border-color': '#fff', 'overflow': 'hidden'});
            }
            tmp_vars.torrent_list.on('dblclick', function(e) {
                if (e.target.tagName === "A" || e.target.tagName === "SELECT") {
                    return;
                }
                var resize_enable = GetSettings('torrent_list_r');
                if (resize_enable === "1") {
                    SetSettings('torrent_list_r', 0);
                    $('div.tracker_list').resizable("disable");
                    tmp_vars.torrent_list.css('height', 'auto');
                    tmp_vars.torrent_list_ul.attr("style", "").css({'border-color': '#fff', 'height': 'auto', 'overflow': 'hidden'});
                    tmp_vars.torrent_list.children(".ui-resizable-s").hide();
                } else {
                    SetSettings('torrent_list_r', 1);
                    var torrent_list_h = GetSettings('torrent_list_h');
                    var ul = tmp_vars.torrent_list_ul;
                    if (tmp_vars.torrent_list.hasClass('ui-resizable') === false) {
                        init_resizeble();
                    }
                    $('div.tracker_list').resizable("enable");
                    tmp_vars.torrent_list_ul.attr("style", "").css({'height': torrent_list_h});
                    ul.css('height', torrent_list_h - ul.position().top);
                    tmp_vars.torrent_list.children(".ui-resizable-s").show();
                }
            });
            $(document).on('keyup', function(e) {
                if (e.target.tagName === "INPUT") {
                    return;
                }
                if ($('div.explore').is(":visible")) {
                    return;
                }
                if (e.keyCode === 27) {
                    triggerBlank();
                }
            });
        }
    };
}();
$(function() {
    view.begin();
});
$(window).load(function() {
    var s = (document.URL).replace(/.*index.html/, '').replace(/^#s=(.*)/, '$1');
    if (s.length > 0) {
        if (navigator.userAgent.search(/Chrome/) === -1) {
            var trigger = function() {
                view.triggerSearch(decodeURIComponent(s));
            };
            setTimeout(trigger, 200);
        } else
            view.triggerSearch(decodeURIComponent(s));
    } else {
        view.triggerBlank();
    }
});
var global_wl_hash = location.hash;
$(window).on('hashchange', function() {
    if (location.hash !== global_wl_hash)
    {
        $(window).trigger('load');
        global_wl_hash = location.hash;
    }
});