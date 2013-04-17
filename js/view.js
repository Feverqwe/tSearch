var view = function() {
    var trackerFilter = null;
    var keywordFilter = null;
    var categoryFilter = null;
    var categorys = null;
    var categorys_assoc = null;
    var lastFilterWord = '';
    var autoMove = null;
    var HideLeech = (GetSettings('HideLeech') !== undefined) ? parseInt(GetSettings('HideLeech')) : true;
    var HideSeed = (GetSettings('HideSeed') !== undefined) ? parseInt(GetSettings('HideSeed')) : false;
    var ShowIcons = (GetSettings('ShowIcons') !== undefined) ? parseInt(GetSettings('ShowIcons')) : true;
    var HideZeroSeed = (GetSettings('HideZeroSeed') !== undefined) ? parseInt(GetSettings('HideZeroSeed')) : false;
    var AdvFiltration = (GetSettings('AdvFiltration') !== undefined) ? parseInt(GetSettings('AdvFiltration')) : 2;
    var TeaserFilter = (GetSettings('TeaserFilter') !== undefined) ? parseInt(GetSettings('TeaserFilter')) : false;
    var SubCategoryFilter = (GetSettings('SubCategoryFilter') !== undefined) ? parseInt(GetSettings('SubCategoryFilter')) : false;
    var AutoComplite_opt = (GetSettings('AutoComplite_opt') !== undefined) ? parseInt(GetSettings('AutoComplite_opt')) : true;
    var autoSetCat = (GetSettings('autoSetCat') !== undefined) ? parseInt(GetSettings('autoSetCat')) : true;
    var allow_get_description = (GetSettings('allow_get_description') !== undefined) ? parseInt(GetSettings('allow_get_description')) : true;
    var update_table = {
        timer: null,
        time: null
    };
    var backgroundMode = false;
    var bgYear = null;
    var backgroundModeID = null;
    var keyword_filter_cache = {
        text: null,
        kw: null,
        kw_arr: null,
        name: null,
        name_regexp: null,
        name_regexp_lover: null,
        year: null
    }
    var xhr_autocomplite = null;
    var auth = function(s, t) {
        //if (backgroundMode) return;
        $('ul.trackers').children('li[data-id="' + t + '"]').children('ul').remove();
        if (!s)
            $('ul.trackers').children('li[data-id="' + t + '"]').append('<ul><li><a href="' + tracker[t].login_url + '" target="_blank">' + _lang['btn_login'] + '</a></li></ul>');
    }
    var clear_table = function() {
        backgroundMode = false;
        $('div.about_panel').empty();
        $('#rez_table').children('tbody').empty();
        $('div.filter').children('input').val('');
        keywordFilter = null;
        lastFilterWord = '';
        keyword_filter_cache = {
            text: null,
            kw: null,
            kw_arr: null,
            name: null,
            name_regexp: null,
            name_regexp_lover: null,
            year: null
        }
        $('div.filter div.btn').hide();
        $('ul.trackers li a.selected').removeClass('selected');
        $('ul.trackers li').attr('data-count', 0);
        updateTrackerCount();
        trackerFilter = null;
        updateCategorys();
    }
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
    }
    var addTrackerInList = function(i) {
        $('body').append('<style class="tr_icon">div.tracker_icon.num' + i + ' { ' + ((tracker[i].icon.length == 0 || tracker[i].icon[0] == '#') ? 'background-color: ' + ((tracker[i].icon.length != 0) ? tracker[i].icon : '#ccc') + ';border-radius: 8px;' : 'background-image: url(' + tracker[i].icon + ');') + ' }</style>');
        $('<li data-id="' + i + '"/>').append($('<div class="tracker_icon num' + i + '" data-count="0"/>')).append($('<a href="#">' + tracker[i].name + '</a>').on("click", function(event) {
            event.preventDefault();
            if ($(this).attr('class') == 'selected') {
                $(this).removeClass('selected');
                trackerFilter = null;
            }
            else {
                $('ul.trackers li a.selected').removeClass('selected');
                $(this).addClass('selected');
                trackerFilter = $(this).parent('li').attr('data-id');
            }
            updateCategorys();
            $('ul.categorys').children('li.selected').trigger('click');
        })).append('<i/>').appendTo($('ul.trackers'));
    }
    var ClearTrackerList = function() {
        $('ul.trackers').empty();
        $('style.tr_icon').remove();
    }
    function isInt(n) {
        if (n == undefined || n === undefined)
            return false;
        return n % 1 === 0;
    }
    var quality_calc = function(quality, title, v) {
        quality.seed = (v.seeds > 0) ? 100 : 0;//(v.seeds>50)?5:(v.seeds>10)?4:(v.seeds>0)?3:0;
        quality.video =
                ((/Blu-ray|Blu-Ray/).test(title)) ? 100 :
                ((/BD-Remux|BDRemux|1080p|1080i/).test(title)) ? 90 :
                ((/BD-Rip|BDRip/).test(title)) ? 80 :
                ((/CAMRip|CamRip/).test(title)) ? 10 :
                ((/HDTV-Rip|HDTVRip|DTheater-Rip|HDTVRip|720p/).test(title)) ? 70 :
                ((/LowHDRip/).test(title)) ? 30 :
                ((/HDTV|HDRip|DVDRip/).test(title)) ? 60 :
                ((/[^o]DVD/).test(title)) ? 50 :
                ((/HQSATRip|HQRip/).test(title)) ? 44 :
                ((/TVRip|WEBRip|WEB-DLRip|WEB-DL|SATRip|DVB|IPTVRip/).test(title)) ? 40 :
                ((/TeleSynch|DVDScr/).test(title)) ? 20 :
                ((/TS/).test(title)) ? 20 :
                0;
        if (v.size < 524288000 && quality.video > 45)
            quality.video = Math.round(parseInt(quality.video) / 10);
        else
        if (v.size < 1363148800 && quality.video > 65)
            quality.video = Math.round(parseInt(quality.video) / 2);
        quality.video += ((/5\.1/).test(title)) ? 3 : 0;
        quality.video += ((/original/i).test(title)) ? 2 : 0;
        quality.video += ((/rus sub|Sub|subs/).test(title)) ? 1 : 0;
        quality.music =
                ((/flac|alac|lossless(?! repack)/i).test(title)) ? 90 :
                ((/320.?kbps/i).test(title)) ? 80 :
                ((/256.?kbps/i).test(title)) ? 60 :
                ((/192.?kbps/i).test(title)) ? 50 :
                ((/128.?kbps/i).test(title)) ? 40 :
                ((/AAC/).test(title)) ? 30 :
                ((/mp3/i).test(title)) ? 20 :
                0;
        quality.game = ((/PS3/).test(title)) ? 40 : ((/Repack/i).test(title)) ? 50 : ((/\[Native\]/i).test(title)) ? 80 : ((/\[RiP\]/).test(title)) ? 90 : ((/\[L\]/).test(title)) ? 100 : 0;
        quality.value = quality.seed + quality.name + quality.video + quality.music + quality.game;
        return quality
    }
    var autoset_Category = function(quality) {
        if (quality.video > quality.music && quality.video > quality.game)
            return 3;
        if (quality.music > quality.video && quality.music > quality.game)
            return 1;
        if (quality.game > quality.music && quality.game > quality.video)
            return 2;
        return -1;
    }
    var inBGMode = function(t, a, s) {
        if (bgYear == null) {
            bgYear = s.replace(/.* ([0-9]{4})$/, "$1")
            if (bgYear == s)
                bgYear = 0;
        }
        if (keyword_filter_cache.text == null) {
            keyword_filter_cache.text = contentFilter(s.replace(/\s+/g, " ").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        }
        var s_s = keyword_filter_cache.text;
        var sum = 0;
        $.each(a, function(k, v) {
            if (typeof(v.title) != 'string' || v.title.length == 0 || !isInt(v.size) || !isInt(v.seeds)
                    || !isInt(v.leechs) || !isInt(v.time) || !isInt(v.category.id)
                    || ('title' in v.category && (typeof(v.category.title) != 'string' && v.category.title != null))
                    || ('url' in v.category && typeof(v.category.url) != 'string')
                    || ('dl' in v && (typeof(v.dl) != 'string' && v.dl != null) )
                    ) {
                console.log('Tracker ' + tracker[t].name + ' have problem!');
                console.log('#debug start');
                console.log(v);
                console.log('#debug end');
                return true;
            }
            if ((/\s/).test(v.title.substr(0, 1))) {
                tracker[t].name = $.trim(tracker[t].name)
            }
            if (HideZeroSeed && v.seeds == 0)
                return true;
            if (isInt(v.category.id)) {
                if (backgroundModeID.categorys[v.category.id] == null) {
                    backgroundModeID.categorys[v.category.id] = {
                        counter: 1, //счетчтк ппаданий
                        quality_full: 0, //общее качество раздачи
                        quality_name: 0, //качество имени
                        label: '', //Название качества
                        link: '', //ссылка на раздачу
                        size: 0, //размер
                        year: (bgYear == 0) ? false : true//учитывание текущего года
                    }
                }
                var bgID = backgroundModeID.categorys[v.category.id];
                bgID.counter++;
                backgroundModeID.categorys[v.category.id] = bgID;
            }
            var title = filterText(s_s, v.title);
            if (bgID.year == false && title.r >= 80 && ((v.title).indexOf(new Date().getFullYear())) >= 0) {
                bgID.quality_full = 0;
                bgID.quality_name = 0;
                bgID.label = '';
                bgID.link = '';
                bgID.year = true;
                bgID.size = 0;
                backgroundModeID.categorys[v.category.id] = bgID;
            }
            var Teaser = ((/Трейлер/i).test(title.n)) ? 1 :
                    ((/Тизер/i).test(title.n)) ? 1 :
                    ((/Teaser/i).test(title.n)) ? 1 :
                    ((/Trailer/i).test(title.n)) ? 1 :
                    (v.category.title != null) ?
                    ((/Трейлер/i).test(v.category.title)) ? 1 :
                    ((/Тизер/i).test(v.category.title)) ? 1 :
                    ((/Teaser/i).test(v.category.title)) ? 1 :
                    ((/Trailer/i).test(v.category.title)) ? 1 : 0 :
                    0;
            if (Teaser == 1)
                return true;
            sum++;
            var quality = {
                seed: 0,
                name: 0,
                video: 0,
                music: 0,
                game: 0,
                value: 0
            };
            quality.name = title.r;
            title = title.n;
            quality = quality_calc(quality, title, v);
            var costume_category = v.category.id;
            if (costume_category == 4)
                costume_category = 3
            if (v.category.id < 0) {
                costume_category = autoset_Category(quality);
                //============
                if (backgroundModeID.categorys[costume_category] == null)
                    backgroundModeID.categorys[costume_category] = {
                        counter: 0, //счетчтк ппаданий
                        quality_full: 0, //общее качество раздачи
                        quality_name: 0, //качество имени
                        label: '', //Название качества
                        link: '', //ссылка на раздачу
                        size: 0, //размер
                        year: backgroundModeID.categorys[v.category.id].year//учитывание текущего года
                    }
                if (v.category.id != costume_category)
                    backgroundModeID.categorys[v.category.id].counter--;
                bgID = backgroundModeID.categorys[costume_category];
                bgID.counter++;
                backgroundModeID.categorys[costume_category] = bgID;
            }
            //получаем качество по категории (взято из сортировки)
            var self_quality = quality.value;
            if (costume_category == 3 || costume_category == 0 || costume_category == 7 || costume_category == 8 || costume_category == 4) {
                self_quality = self_quality - quality.game - quality.music;
            } else
            if (costume_category == 1) {
                self_quality = self_quality - quality.game - quality.video
            } else
            if (costume_category == 2) {
                self_quality = self_quality - quality.music - quality.video
            }
            if (quality.name < 80 ||
                    bgID.quality_full > self_quality ||
                    (costume_category != 1 && bgID.quality_name > quality.name)
                    )
                return true;
            if (bgID.year && (v.title).indexOf((bgYear == 0) ? new Date().getFullYear() : bgYear) < 0) {
                return true;
            }
            var tmp_label = '';
            if (costume_category != 1 && costume_category != 2) {
                tmp_label = ((/Blu-ray|Blu-Ray/).test(title)) ? 'Blu-Ray' :
                        ((/BD-Remux|BDRemux/).test(title)) ? 'BDRemux' :
                        ((/1080p|1080i/).test(title)) ? '1080p' :
                        ((/BD-Rip|BDRip/).test(title)) ? 'BDRip' :
                        ((/HDTV-Rip|HDTVRip/).test(title)) ? 'HDTVRip' :
                        ((/DTheater-Rip/).test(title)) ? 'DTheater' :
                        ((/CAMRip|CamRip/).test(title)) ? 'CAMRip' :
                        ((/720p/).test(title)) ? '720p' :
                        ((/LowHDRip/).test(title)) ? 'LowHDRip' :
                        ((/HDTV/).test(title)) ? 'HDTV' :
                        ((/HDRip/).test(title)) ? 'HDRip' :
                        ((/DVDRip/).test(title)) ? 'DVDRip' :
                        ((/DVDScr/).test(title)) ? 'DVDScr' :
                        ((/TVRip/).test(title)) ? 'TVRip' :
                        ((/WEBRip|WEB-DLRip/).test(title)) ? 'WEBRip' :
                        ((/WEB-DL/).test(title)) ? 'WEB-DL' :
                        ((/HQSATRip/).test(title)) ? 'HQSATRip' :
                        ((/SATRip/).test(title)) ? 'SATRip' :
                        ((/HQRip/).test(title)) ? 'HQRip' :
                        ((/DVB/).test(title)) ? 'DVB' :
                        ((/IPTVRip/).test(title)) ? 'IPTVRip' :
                        ((/TeleSynch/).test(title)) ? 'TS' :
                        ((/[^o]DVD/).test(title)) ? 'DVD' :
                        ((/NTSC/).test(title)) ? '' :
                        ((/TS/).test(title)) ? 'TS' : '';
            }
            if (costume_category == 1) {
                tmp_label = ((/flac/i).test(title)) ? 'FLAC' :
                        ((/alac/i).test(title)) ? 'ALAC' :
                        ((/lossless/i).test(title)) ? 'LossLess' :
                        ((/mp3/i).test(title)) ? 'MP3' :
                        ((/AAC/).test(title)) ? 'AAC' : ''
            }
            if (costume_category == 2) {
                tmp_label = ((/Repack/i).test(title)) ? 'Repack' :
                        ((/\[Native\]/i).test(title)) ? 'Native' :
                        ((/\[RiP]/i).test(title)) ? 'RiP' :
                        ((/PS3/).test(title)) ? 'PS3' :
                        ((/\[L\]/).test(title)) ? 'L' : ''
            }
            if (tmp_label != '' && bgID.size < v.size) {
                bgID.quality_full = self_quality;
                bgID.quality_name = quality.name;
                if (bgID.size != 0 || (bgID.label != tmp_label && bgID.quality_full < self_quality)) {
                    bgID.size = v.size - (v.size / 10);
                } else
                    bgID.size = (v.size - bgID.size) / 2 + bgID.size;
                bgID.label = tmp_label;
                bgID.link = v.url;
                backgroundModeID.categorys[costume_category] = bgID;
            } else
                return true;

        });
        updateTrackerResultCount(t, sum);
        loadingStatus(1, t);
        explore.setQuality(backgroundModeID);
    }
    var write_result = function(t, a, s, p) {
        load_in_sandbox(t, null);
        if (backgroundMode)
            return inBGMode(t, a, s);
        //var dbg_start = (new Date()).getTime();
        var c = '';
        if (p == null) {
            $('#rez_table tbody').children('tr[data-tracker="' + t + '"]').remove();
        }
        if (keyword_filter_cache.text == null) {
            keyword_filter_cache.text = contentFilter(s.replace(/\s+/g, " ").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        }
        var s_s = keyword_filter_cache.text;
        var sum = 0;
        $.each(a, function(k, v) {
            if (typeof(v.title) != 'string' || v.title.length == 0 || !isInt(v.size) || !isInt(v.seeds)
                    || !isInt(v.leechs) || !isInt(v.time) || !isInt(v.category.id)
                    || ('title' in v.category && (typeof(v.category.title) != 'string' && v.category.title != null))
                    || ('url' in v.category && typeof(v.category.url) != 'string')
                    || ('dl' in v && (typeof(v.dl) != 'string' && v.dl != null) )
                    ) {
                console.log('Tracker ' + tracker[t].name + ' have problem!');
                console.log('#debug start');
                console.log(v);
                console.log('#debug end');
                return true;
            }
            var quality = {
                seed: 0,
                name: 0,
                video: 0,
                music: 0,
                game: 0,
                value: 0
            };
            if ((/\s/).test(v.title.substr(0, 1))) {
                tracker[t].name = $.trim(tracker[t].name)
            }
            if (HideZeroSeed && v.seeds == 0)
                return true;
            var title = filterText(s_s, v.title);
            if (TeaserFilter) {
                var Teaser = ((/Трейлер/i).test(title.n)) ? 1 :
                        ((/Тизер/i).test(title.n)) ? 1 :
                        ((/Teaser/i).test(title.n)) ? 1 :
                        ((/Trailer/i).test(title.n)) ? 1 :
                        (v.category.title != null) ?
                        ((/Трейлер/i).test(v.category.title)) ? 1 :
                        ((/Тизер/i).test(v.category.title)) ? 1 :
                        ((/Teaser/i).test(v.category.title)) ? 1 :
                        ((/Trailer/i).test(v.category.title)) ? 1 : 0 :
                        0;
                if (Teaser == 1)
                    return true;
            }
            sum++;
            quality.name = title.r;
            title = title.n;

            quality = quality_calc(quality, title, v);
            if (autoSetCat & v.category.id < 0)
                v.category.id = autoset_Category(quality);

            var filter = '';
            var fk = 0;
            if (trackerFilter != null && trackerFilter != t)
                filter = 'style="display: none;"';
            if (categoryFilter != null && categoryFilter != v.category.id)
                filter = 'style="display: none;"';
            if (keywordFilter != null) {
                var keyword = $.trim($('div.filter').children('input').val()).replace(/\s+/g, " ");
                if (title == filterTextCheck(keyword, title))
                    filter = 'style="display: none;"';
                else
                    fk = 1;
            }
            c = c + '<tr ' + filter + ' data-kf="' + fk + '" data-tracker="' + t + '" data-c="' + v.category.id + '">'
                    + '<td class="time" data-value="' + v.time + '" title="' + unixintimetitle(v.time) + '">' + unixintime(v.time) + '</td>'
                    + '<td class="quality" data-value="' + quality.value + '" data-qgame="' + quality.game + '" data-qseed="' + quality.seed + '" data-qname="' + quality.name + '" data-qvideo="' + quality.video + '" data-qmusic="' + quality.music + '"><div class="progress"><div style="width:' + (quality.value / 10) + 'px"></div><span title="' + quality.value + '">' + quality.value + '</span></div></td>'
                    + '<td class="name"><div class="title"><a href="' + v.url + '" target="_blank">' + title + '</a>' +
                    ((v.category.title == null && ShowIcons) ? '<div class="tracker_icon num' + t + '" title="' + tracker[t].name + '"></div>' : '')
                    + '</div>'
                    + ((v.category.title != null) ? '<ul><li class="category">' + ((v.category.url == null) ? v.category.title : '<a href="' + v.category.url + '" target="blank">' + v.category.title + '</a>') + '</li>' + ((ShowIcons) ? '<li><div class="tracker_icon num' + t + '" title="' + tracker[t].name + '"></div></li>' : '') + '</ul>' : '')
                    + '</td>'
                    + '<td class="size" data-value="' + v.size + '">' + ((v.dl != null) ? '<a href="' + v.dl + '" target="_blank">' + bytesToSize(v.size) + ' ↓</a>' : bytesToSize(v.size)) + '</td>'
                    + ((!HideSeed) ? '  <td class="seeds" data-value="' + v.seeds + '">' + v.seeds + '</td>' : '')
                    + ((!HideLeech) ? '  <td class="leechs" data-value="' + v.leechs + '">' + v.leechs + '</td>' : '')
                    + '</tr>';

        });
        if (p != null) {
            sum = p;
        }
        updateTrackerResultCount(t, sum);
        loadingStatus(1, t);
        if (sum > 0) {
            $('#rez_table tbody').append(contentUnFilter(c));
            table_update_timer(1);
        }
        //var dbg_stop = (new Date()).getTime();
        //console.log('Tracker '+tracker[t].name+': '+(dbg_stop-dbg_start)+'ms count:'+sum);
    }
    var table_update_timer = function(a) {
        var time = new Date().getTime();
        if (a == undefined) {
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
            if (update_table.time == null)
                updateCategorys();
            update_table.time = time;
            clearTimeout(update_table.timer);
            update_table.timer = setTimeout(table_update_timer, 200);
        }
    }
    var bytesToSize = function(bytes, nan) {
        //переводит байты в строчки
        var sizes = _lang['size_list'];
        if (nan == null)
            nan = 'n/a';
        if (bytes == 0)
            return nan;
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i == 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        }
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
    var utiemonstr = function(shtamp) {
        //преврящает TimeShtamp в строчку
        var dt = new Date(shtamp * 1000);
        var m = dt.getMonth() + 1;
        if (m.toString().length == 1)
            m = '0' + m.toString();
        var d = dt.getDate();
        if (d.toString().length == 1)
            d = '0' + d.toString();
        var h = dt.getHours();
        if (h.toString().length == 1)
            h = '0' + h.toString();
        var mi = dt.getMinutes();
        if (mi.toString().length == 1)
            mi = '0' + mi.toString();
        var sec = dt.getSeconds();
        if (sec.toString().length == 1)
            sec = '0' + sec.toString();
        //var time = '';
        //if (h!='00' && mi!='00' && sec != '00')
        //    time = ' '+h+':'+mi+':'+sec;
        var t = d + '-' + m + '-' + dt.getFullYear();//+time;
        return t;
    }
    var unixintimetitle = function(i) {
        if (i == 0)
            return '∞';
        else
            return utiemonstr(i);
    }
    var round_day_unixtime = function(i) {
        var dt = new Date(i * 1000);
        return Math.round(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime() / 1000);
    }
    var getHandM_unixtime = function(i) {
        var dt = new Date(i * 1000);
        return addZero(dt.getHours()) + ':' + addZero(dt.getMinutes());
    }
    var addZero = function(i) {
        if (i < 10)
            return '0' + i;
        return i;
    }
    var unixintime = function(utime)
    {
        //выписывает отсчет времени из unixtime
        var now_time = Math.round((new Date()).getTime() / 1000);
        var theDate = utiemonstr(utime);
        if (utime == 0)
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
        var str_week = ' ' + ((week < 5) ? (week < 2) ? (week < 1) ? _lang.times.week1 : _lang.times.week2 : _lang.times.week3 : _lang.times.week4);
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
        if (day == 0 && d_te != t_te)
            day = 1;
        if (day > 0)
            if (day == 1)
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
    }
    var updateTrackerResultCount = function(t, c, l) {
        if (l == null && c == null) {
            var c = $('ul.trackers li[data-id="' + t + '"]').attr('data-count');
            if (c == null)
                c = 0;
            $('ul.trackers li[data-id="' + t + '"]').children('i').html('(' + c + ')');
        } else
        if (l == null) {
            $('ul.trackers li[data-id="' + t + '"]').attr('data-count', c).children('i').html('(' + c + ')');
        } else {
            if (l == 1)
                $('ul.trackers li[data-id="' + t + '"]').children('i').html('(' + c + ')');
        }
    }
    var contentFilter = function(c) {
        var c = c.replace(/\/\//img, '#blockurl#').replace(/ src=(['"]{0,1})/img, ' src=$11.png#blockrurl#');
        return c;
    }
    var contentUnFilter = function(c) {
        var c = c.replace(/1.png#blockrurl#/img, '').replace(/#blockrurl#/img, '').replace(/#blockurl#/img, '//');
        return c;
    }
    var filterText = function(keyword, t) {
        var top_coeff = 1;
        //s - searching text (keyword)
        //t - title from torrent
        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
        if (keyword_filter_cache.kw == null) {
            keyword_filter_cache.kw = $.trim(keyword).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\(.*([0-9]{4})\)$/g, "$1");
            //удаляем из запроса год если он есть
            keyword_filter_cache.name = $.trim(keyword_filter_cache.kw.replace(/([0-9]{4})$/g, ""));
            //экронируем для regexp
            keyword_filter_cache.name_regexp = keyword_filter_cache.name.replace(/([.?*+^$[\]\\{}|-])/g, "\\$1");
            //экронируем для regexp
            keyword_filter_cache.name_regexp_lover = keyword_filter_cache.name.replace(/([.?*+^$[\]\\{}|-])/g, "\\$1").toLowerCase();
            //вырываем год, если он есть
            keyword_filter_cache.year = keyword_filter_cache.kw.replace(/.*([0-9]{4})$/g, "$1");
            if (keyword_filter_cache.year == '' || !isNumber(keyword_filter_cache.year))
                keyword_filter_cache.year = null;
        }
        if (keyword_filter_cache.kw.length == 0) {
            return {
                n: t,
                r: 0
            };
        }
        var title = t.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var title_lower = title.toLowerCase();
        if (keyword_filter_cache.year != null) {
            //если есь год, то 
            //проверка по маске Name / .*year.*
            if (new RegExp('^' + keyword_filter_cache.name_regexp_lover + ' / .*' + keyword_filter_cache.year + '.*').test(title_lower)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp_lover + '|' + keyword_filter_cache.year + ')', "ig"), "<b>$1</b>"),
                    r: 100 * top_coeff
                };
            }
            //проверка по маске ([.*]) Name / .*year.*
            if (new RegExp('^[([]{1}.*[)]]{1} ' + keyword_filter_cache.name_regexp_lover + ' / .*' + keyword_filter_cache.year + '.*').test(title_lower)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp_lover + '|' + keyword_filter_cache.year + ')', "ig"), "<b>$1</b>"),
                    r: 100 * top_coeff
                };
            }
            if (new RegExp('.* ' + keyword_filter_cache.name_regexp + ' / .*' + keyword_filter_cache.year + '.*').test(title)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp + '|' + keyword_filter_cache.year + ')', "g"), "<b>$1</b>"),
                    r: 89 * top_coeff
                };
            }
            if (new RegExp('^' + keyword_filter_cache.name_regexp + ' .*' + keyword_filter_cache.year + '.*').test(title)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp + '|' + keyword_filter_cache.year + ')', "g"), "<b>$1</b>"),
                    r: 92 * top_coeff
                };
            }
            if (new RegExp('.* ' + keyword_filter_cache.name_regexp + ' .*' + keyword_filter_cache.year + '.*').test(title)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp + '|' + keyword_filter_cache.year + ')', "g"), "<b>$1</b>"),
                    r: 86 * top_coeff
                };
            }
        } else {
            //если нету года, то 
            //проверка по маске Name / .*
            if (new RegExp('^' + keyword_filter_cache.name_regexp_lover + '$').test(title_lower)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp + ')', "ig"), "<b>$1</b>"),
                    r: 100 * top_coeff
                };
            }
            if (new RegExp('^' + keyword_filter_cache.name_regexp_lover + ' / .*').test(title_lower)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp_lover + ')', "ig"), "<b>$1</b>"),
                    r: 100 * top_coeff
                };
            }
            //проверка по маске ([.*]) Name / .*year.*
            if (new RegExp('^[([]{1}.*[)]]{1} ' + keyword_filter_cache.name_regexp_lover + ' / .*').test(title_lower)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp_lover + ')', "ig"), "<b>$1</b>"),
                    r: 95 * top_coeff
                };
            }
            if (new RegExp('.* ' + keyword_filter_cache.name_regexp_lover + ' / .*').test(title_lower)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp + ')', "ig"), "<b>$1</b>"),
                    r: 86 * top_coeff
                };
            }
            if (new RegExp('^' + keyword_filter_cache.name_regexp_lover + ' .*').test(title_lower)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp + ')', "ig"), "<b>$1</b>"),
                    r: 86 * top_coeff
                };
            }
            if (new RegExp('.* ' + keyword_filter_cache.name_regexp + '$').test(title)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp + ')', "g"), "<b>$1</b>"),
                    r: 83 * top_coeff
                };
            }
            if (new RegExp('^' + keyword_filter_cache.name_regexp_lover + '[-/()\ ./]{1}.*').test(title_lower)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp_lover + ')', "ig"), "<b>$1</b>"),
                    r: 80 * top_coeff
                };
            }
            if (new RegExp('.* ' + keyword_filter_cache.name_regexp + ' .*').test(title)) {
                return {
                    n: t.replace(new RegExp('(' + keyword_filter_cache.name_regexp + ')', "g"), "<b>$1</b>"),
                    r: 80 * top_coeff
                };
            }
        }
        var str_arr = keyword_filter_cache.kw.split(' ');
        var str_cou = str_arr.length;
        var ex_count = 0;
        var left = 0;
        for (var i = 0; i < str_cou; i++) {
            if (i == 0) {
                left = title_lower.indexOf(str_arr[i].toLowerCase());
                if ((new RegExp(str_arr[i] + '[^\b\wA-Za-zА-Яа-я0-9]{1}', 'i')).test(title))
                    ex_count += 1;
            } else
            if ((new RegExp('[^\b\wA-Za-zА-Яа-я0-9]{1}' + str_arr[i] + '[^\b\wA-Za-zА-Яа-я0-9]{1}', 'i')).test(title))
                ex_count += 1;
        }
        var rate = Math.round((85 / (str_cou)) * ex_count);
        if (left < 0 && rate > 30)
            rate = -100;
        else
        if (left > 70)
            rate = 30;
        else
            rate -= left;
        var order = function(a, b) {
            if (a.length > b.length)
                return -1;
            if (a.length == b.length)
                return 0;
            return 1;
        }
        if (keyword_filter_cache.kw_arr == null) {
            keyword_filter_cache.kw_arr = keyword.replace(/([.?*+^$[\]\\{}|-])/g, "\\$1").replace(/\s+/, ' ').split(' ').sort(order);
        }
        var new_kw_arr = keyword_filter_cache.kw_arr;
        var bolder_title = t.replace(new RegExp('(' + new_kw_arr.join('|') + ')', "ig"), "<b>$1</b>");
        return {
            n: bolder_title,
            r: rate * top_coeff
        };
    }
    /*
     var filterText = function (s,t) {
     var s = $.trim(s).replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
     var new_name = t.replace(/</g,"&lt;").replace(/>/g,"&gt;");
     var rate = 0;
     var new_name2 = new_name;
     if (new_name.length > s.length+1)
     rate = ((new RegExp(s+' ',"i")).test(new_name))?100:0;
     else
     rate = ((new RegExp(s,"i")).test(new_name))?100:0;
     var left = 0;
     if (s.length > 0) {
     var tmp = s.split(" ");
     new_name = new_name.replace(new RegExp('('+tmp.join('|')+')',"ig"),"<b>$1</b>");
     left = new_name2.toLowerCase().indexOf(tmp[0].toLowerCase()+' ');
     if (left > 0 && new_name2.substr(left-1, 1) != ' ') left = 71;
     }
     if (new_name2 != new_name) {
     if (rate == 0)
     rate = 80;
     
     if (left < 0)
     rate = 30;
     else
     if (left > 70)
     rate = 30;
     else 
     rate -= left;
     }
     return {
     n:new_name,
     r:rate
     };
     }*/
    var filterTextCheck = function(s, t) {
        if (s.length == 0)
            return 'a';
        var r = t;
        if (AdvFiltration == 1) {
            var tmp = s.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1").split(" ");
            if ((new RegExp(tmp.join('|'), "i")).test(t))
                r = 'a';
        } else
        if (AdvFiltration == 2) {
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
    }
    var updateTrackerCount = function() {
        var li = $('ul.trackers').children('li');
        var t_c = li.length;
        for (var i = 0; i < t_c; i++) {
            var id = li.eq(i).attr('data-id');
            if (keywordFilter == null)
                updateTrackerResultCount(id);
            else
            if (keywordFilter != null) {
                var count = $('#rez_table tbody').children('tr[data-tracker="' + id + '"][data-kf="1"]').length;
                updateTrackerResultCount(id, count, 1);
            }
        }
    }
    var updateCategorys = function() {
        var sum = 0;
        var count_c = categorys.length;
        for (var i = 0; i < count_c; i++) {
            var filter = '[data-c="' + categorys[i] + '"]';
            if (trackerFilter != null)
                filter += '[data-tracker="' + trackerFilter + '"]';
            if (keywordFilter != null)
                filter += '[data-kf="1"]';
            var count = $('#rez_table').children('tbody').children('tr' + filter).length;
            if (count > 0) {
                $('ul.categorys li[data-id="' + categorys[i] + '"]').css('display', 'inline-block').children('i').html('(' + count + ')');
                sum += count;
            } else {
                $('ul.categorys li[data-id="' + categorys[i] + '"]').css('display', 'none');
            }
        }
        $('ul.categorys li').eq(0).children('i').html('(' + sum + ')');
        if (autoMove != null) {
            var item = $('ul.categorys li[data-id="' + autoMove + '"]');
            if (item.css('display') == 'inline-block') {
                $('ul.categorys li.selected').removeClass('selected');
                item.addClass('selected');
                item.trigger('click');
                autoMove = null;
            }
        }
        if ($('ul.categorys li.selected').css('display') == 'none') {
            var category = $('ul.categorys').children('li.selected').attr('data-id');
            $('ul.categorys li.selected').removeClass('selected');
            $('ul.categorys li').eq(0).addClass('selected');
            $('ul.categorys li.selected').trigger('click');
            autoMove = (category == null) ? null : category;
        }
    }
    var tableFilter = function(keyword) {
        if (keyword != $('div.filter').children('input').val())
            return;
        $('div.filter div.btn').css('background-image', 'url(images/loading.gif)');
        keyword = $.trim(keyword).replace(/\s+/g, " ");
        if (keyword.length == 0) {
            $('div.filter').children('input').val('');
            keywordFilter = null;
            $('ul.categorys li.selected').trigger('click');
            updateCategorys();
            updateTrackerCount();
            $('div.filter div.btn').hide();
            return;
        }
        keywordFilter = keyword;
        if (keywordFilter != lastFilterWord) {
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
                if (name != f_name)
                    tr_eq.attr('data-kf', 1);
                else
                    tr_eq.attr('data-kf', 0);
            }
        }
        $('ul.categorys li.selected').trigger('click');
        updateCategorys();
        updateTrackerCount();
        $('div.filter div.btn').css('background-image', 'url(images/clear.png)');
    }
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
        explore.getLoad();
        if (old_title != document.title) {
            _gaq.push(['_trackPageview', 'index.html']);
        }
    }
    var triggerSearch = function(keyword) {
        if (keyword == "#") {
            return false;
        }
        $('body,html').scrollTop();
        $('div.result_panel').css('display', 'block');
        $('div.explore').css('display', 'none');
        var sel_tr = $('ul.trackers li a.selected').parent().data('id');
        if (sel_tr == null || sel_tr == undefined)
            sel_tr = null;
        clear_table();
        if (sel_tr != null)
            $('ul.trackers li[data-id=' + sel_tr + ']').children('a').addClass('selected');
        keyword = $.trim(keyword);
        if ($('form[name="search"]').children('input[type="text"]').val() != keyword)
            $('form[name="search"]').children('input[type="text"]').val(keyword);
        document.title = keyword + ' :: ' + 'TMS';
        window.location = '#s=' + keyword;
        global_wl_hash = location.hash;
        engine.search(keyword, sel_tr);
        if (allow_get_description)
            explore.getAbout(keyword);
        _gaq.push(['_trackPageview', 'index.html#s=' + keyword]);
        _gaq.push(['_trackEvent', 'Search', 'keyword', keyword]);
        return false;
    }
    var getQuality = function(keyword, id, section) {
        //flush for bg mode
        bgYear = null;
        keyword_filter_cache = {
            text: null,
            kw: null,
            kw_arr: null,
            name: null,
            name_regexp: null,
            name_regexp_lover: null,
            year: null
        }
        backgroundMode = true;
        backgroundModeID = {
            'id': id,
            categorys: [],
            'section': section
        };
        engine.search(keyword, null, 1);
        _gaq.push(['_trackEvent', 'Quality', 'keyword', keyword]);
    }
    var load_category = function(c) {
        $('ul.categorys').empty()
        var count = c.length;
        categorys = [];
        categorys_assoc = [];
        for (var i = 0; i < count; i++) {
            categorys[categorys.length] = c[i][0];
            categorys_assoc[c[i][0]] = c[i][1];
            $('ul.categorys').append('<li data-id="' + c[i][0] + '">' + c[i][1] + '<i></i></li>');
        }
        $('ul.categorys').prepend('<li class="selected">' + _lang['cat_all'] + ' <i></i></li>');
    }
    var AddAutocomplete = function() {
        if (AutoComplite_opt == 0) {
            var AutocompleteArr = [];
            var order = function(a, b) {
                if (a.count > b.count)
                    return -1;
                if (a.count == b.count)
                    return 0;
                return 1;
            }
            var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
            if (search_history != null) {
                search_history.sort(order);
                var count = search_history.length;
                for (var i = 0; i < count; i++) {
                    AutocompleteArr[AutocompleteArr.length] = search_history[i].title;
                }
            }
        }
        var inp = $('input[type="text"][name="s"]');
        if (inp.attr('autocomplete') != null) {
            inp.autocomplete("destroy");
        }
        inp.autocomplete({
            source: (AutoComplite_opt == 0) ? AutocompleteArr : function(a, response) {
                if ($.trim(a.term).length == 0 || AutoComplite_opt == 0) {
                    var AutocompleteArr = [];
                    var order = function(a, b) {
                        if (a.count > b.count)
                            return -1;
                        if (a.count == b.count)
                            return 0;
                        return 1;
                    }
                    var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
                    if (search_history != null) {
                        search_history.sort(order);
                        var count = search_history.length;
                        for (var i = 0; i < count; i++) {
                            AutocompleteArr[AutocompleteArr.length] = search_history[i].title;
                        }
                    }
                    response(AutocompleteArr);
                } else {
                    if (xhr_autocomplite != null)
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
    }
    var LoadProfiles = function() {
        var defProfile = (GetSettings('defProfile') !== undefined) ? GetSettings('defProfile') : 0;
        var arr = engine.getProfileList();
        if (arr.length <= 1)
            return;
        var sel = $('<select title="' + _lang.label_profile + '">').change(function() {
            engine.loadProfile($(this).val());
        });
        $.each(arr, function(k, v) {
            sel.append('<option value="' + k + '" ' + ((k == defProfile) ? 'selected' : '') + '>' + v + '</option>')
        });
        sel = $('<div class="profile">').append(sel);
        $('div.tracker_list div.setup').after(sel);
    }
    var load_in_sandbox = function(id, c) {
        var t = $($.parseHTML(c));
        return t
    }
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
            clear_table()
        },
        auth: function(s, id) {
            auth(s, id)
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
            ClearTrackerList()
        },
        LoadProfiles: function() {
            LoadProfiles()
        },
        getQuality: function(a, b, c) {
            getQuality(a, b, c)
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
            $('div.tracker_list').children('div.setup').attr('title', _lang['btn_tracker_list']);
            $('div.filter').children('p').eq(0).text(_lang['filter']);
            $('div.filter').children('div.btn').attr('title', _lang['btn_filter']);
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
                if (event.isTrigger != true)
                    autoMove = null;
                var id = $(this).attr('data-id');
                categoryFilter = id;
                $('ul.categorys').children('li.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#rez_table').children('tbody').children('tr').css('display', 'none');
                var filter = '';
                if (id != null)
                    filter += '[data-c="' + id + '"]';
                if (trackerFilter != null)
                    filter += '[data-tracker="' + trackerFilter + '"]';
                if (keywordFilter != null)
                    filter += '[data-kf="1"]';
                $('#rez_table').children('tbody').children('tr' + filter).css('display', 'table-row');
                $('#rez_table').trigger("update");
            });
            $('ul.categorys').children('li').css('display', 'none').eq(0).css('display', 'inline-block');
            try {
                $('#rez_table').tablesorter({
                    textExtraction: function(node)
                    {
                        if ($(node).attr('data-value') != null) {
                            if ($(node).attr('data-qname') != null) {
                                var c = categoryFilter;
                                var val = parseInt($(node).attr('data-value'));
                                if (c == null)
                                    return val;
                                if (c == 3 || c == 0 || c == 7 || c == 8 || c == 4) {
                                    val = val - parseInt($(node).attr('data-qgame')) - parseInt($(node).attr('data-qmusic'));
                                } else
                                if (c == 1) {
                                    val = val - parseInt($(node).attr('data-qgame')) - parseInt($(node).attr('data-qvideo'));
                                } else
                                if (c == 2) {
                                    val = val - parseInt($(node).attr('data-qmusic')) - parseInt($(node).attr('data-qvideo'));
                                }
                                return val;
                            } else
                                return $(node).attr('data-value');
                        }
                        if ($(node).children('div.title') != null)
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
            $('div.filter input').keyup(function() {
                var t = $(this).val();
                $('div.filter div.btn').css('background-image', 'url(images/loading.gif)');
                if (t.length > 0) {
                    $('div.filter div.btn').show();
                }
                window.setTimeout(function() {
                    tableFilter(t);
                }, 1000);
            });
            $('div.filter div.btn').on("click", function() {
                $('div.filter input').val('');
                tableFilter('');
            });
            var s = (document.URL).replace(/(.*)index.html/, '').replace(/#s=(.*)/, '$1');
            if (s.length > 0) {
                $('form[name="search"]').children('input[type="text"]').val(s);
            }
            $('div.tracker_list div.setup').on("click", function() {
                window.location = 'options.html#back=' + $.trim($('form[name="search"]').children('input[type="text"]').val());
            });
            $('input.sbutton.main').on("click", function() {
                triggerBlank();
            });
            $('input.sbutton.history').on("click", function() {
                window.location = 'history.html';//'#back='+$.trim($('form[name=search]').children('input[type=text]').val());
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

        }
    }
}();
$(function() {
    view.begin();
});
$(window).load(function() {
    var s = (document.URL).replace(/.*index.html/, '').replace(/^#s=(.*)/, '$1');
    if (s.length > 0) {
        if (navigator.userAgent.search(/Chrome/) == -1) {
            var trigger = function() {
                view.triggerSearch(decodeURIComponent(s));
            }
            setTimeout(trigger, 200);
        } else
            view.triggerSearch(decodeURIComponent(s));
    } else {
        view.triggerBlank();
    }
});
var global_wl_hash = location.hash;
$(window).on('hashchange', function() {
    if (location.hash != global_wl_hash)
    {
        $(window).trigger('load');
        global_wl_hash = location.hash;
    }
});