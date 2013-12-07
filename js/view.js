var view = function() {
    var trackerFilter = null;
    var keywordFilter = null;
    var sizeFilter = null;
    var timeFilter = null;
    var seedFilter = null;
    var peerFilter = null;
    var categoryFilter = null;
    var categorys = [];
    var categorys_assoc = null;
    var autoMove = undefined;
    var filter_timers = {
        word: null,
        size: null,
        seed: null,
        peer: null
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
    var filter_panel_to_left = parseInt(GetSettings('filter_panel_to_left') || 0);
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
    var isFF = "Application" in window && Application.name === "Firefox";
    var auth = function(s, t) {
        /*
         * отображает требование авторизоваться
         */
        //if (backgroundMode) return;
        tmp_vars.ul_trackers.children('li[data-id="' + t + '"]').children('ul').remove();
        if (!s) {
            tmp_vars.ul_trackers.children('li[data-id="' + t + '"]').append(
                    $('<ul>').append($('<li>').append($('<a>', {href: tracker[t].login_url, target: '_blank', text: _lang['btn_login']}))));
        }
    };
    var clear_table = function() {
        /*
         * очищает результаты поиска, сбрасывает все в ноль
         */
        backgroundMode = false;
        $('div.about_panel').empty();
        tmp_vars.rez_table_tbody.get(0).innerHTML = "";
        tmp_vars.rez_table.trigger("update");
        $('div.filter').children('input').val('');
        keywordFilter = null;
        keyword_filter_cache = {};
        $('div.filter div.btn').hide();
        $('div.size_filter').find('input').val('');
        sizeFilter = null;
        timeFilter = null;
        var time_filter = $('div.time_filter');
        time_filter.find('.range').hide();
        time_filter.find('input').val('').datepicker("option", {"maxDate": "+1d", "minDate": null});
        time_filter.find('option').removeAttr('selected');
        time_filter.find('option[value=all]').attr('selected', 'selected');
        tmp_vars.ul_trackers.find('a.selected').removeClass('selected');
        tmp_vars.ul_trackers.children('li').attr('data-count', 0);
        updateTrackerCount();
        trackerFilter = null;
        seedFilter = null;
        $('div.seed_filter').find('input').val('');
        peerFilter = null;
        $('div.peer_filter').find('input').val('');
        $('style.userFilter').remove();
        updateCategorys();
    };
    var loadingStatus = function(s, t) {
        /*
         * отображает иконку загрузки, ошибки итп
         */
        //if (backgroundMode) return;
        var tracker_img = tmp_vars.ul_trackers.children('li[data-id="' + t + '"]').children('div.tracker_icon');
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
        /*
         * динамическое ддобавление трекеров в список
         */
        $('body').append('<style class="tr_icon">div.tracker_icon.num' + i + ' { ' + ((tracker[i].icon.length === 0 || tracker[i].icon[0] === '#') ? 'background-color: ' + ((tracker[i].icon.length !== 0) ? tracker[i].icon : '#ccc') + ';border-radius: 8px;' : 'background-image: url(' + tracker[i].icon + ');') + ' }</style>');
        $('ul.trackers').append($('<li>', {'data-id': i}).append(
                $('<div>', {'class': 'tracker_icon num' + i, 'data-count': 0}),
        $('<a>', {href: '#', text: tracker[i].name}).on("click", function(event) {
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
            tmp_vars.ul_categorys.children('li.selected').trigger('click');
        }), $('<i>')));
    };
    var ClearTrackerList = function() {
        /*
         * тригер очистки списка трекеров
         */
        if (tmp_vars.ul_trackers === undefined) {
            init_tmp_vars();
        }
        tmp_vars.ul_trackers.empty();
        $('style.tr_icon').remove();
    };
    var quality_calc = function(quality, v) {
        /*
         * Расчет качетсва по сидам
         * Перерасчет соотношения качества видео и размера раздачи
         */
        quality.seed = (v.seeds > 50) ? 60 : (v.seeds > 30) ? 40 : (v.seeds > 20) ? 30 : (v.seeds > 10) ? 20 : (v.seeds > 0) ? 10 : 0;
        if (v.size < 524288000 && quality.video > 45)
            quality.video = Math.round(parseInt(quality.video) / 10);
        else
        if (v.size < 1363148800 && quality.video > 65)
            quality.video = Math.round(parseInt(quality.video) / 2);
        quality.value = quality.seed + quality.name + quality.video + quality.music + quality.game;
        return quality;
    };
    var autoset_Category = function(quality, category) {
        /*
         * Алгоритм определения категории
         */
        var rate = {films: 0, serials: 0, anime: 0, dochumor: 0, music: 0, games: 0, books: 0, cartoons: 0, software: 0, sport: 0, xxx: 0, other: 0, m: []};
        var cal_rate = function(a, b, c) {
            if ($.inArray(a, rate.m) === -1) {
                rate.m.push(a);
            } else {
                return '';
            }
            //проверяет что это не фрагмент слова (проверка слева)
            var sub = c[b - 1] || '';
            if (sub !== "" && sub !== " " && (/[\wА-Яа-я]/).test(sub)) {
                return '';
            }
            //
            if (a === "эрот" || a === "xxx" || a === "porn" || a === "порно" || a === "сайтр" || a === "фильмы без сюжета" || a === "hentai" || a === "хентай") {
                rate.xxx += 10;
            }
            if (a === "мультим") {
                rate.software += 2;
            }
            if (a === "мульт") {
                rate.cartoons += 2;
            }
            if (a === "сериа") {
                rate.serials += 2;
            }
            if (a === "книг" || a === "аудиокниги" || a === "литер" || a === "беллетр" || a === "журнал" || a === "book") {
                rate.books += 1;
            }
            if (a === "фильм") {
                rate.films += 1;
            }
            if (a === "soundtrack" || a === "музыка" || a === "саундтрек") {
                rate.music += 2;
            }
            if (a === "игр" || a === "psp" || a === "xbox" || a === "game") {
                rate.games += 1;
            }
            if (a === "аним" || a === "anim" || a === "manga") {
                rate.anime += 2;
            }
            if (a === "софт" || a === "soft" || a === "утилит") {
                rate.software += 1;
            }
            if (a === "комикс") {
                rate.other += 1;
            }
            if (a === "документальные") {
                rate.dochumor += 3;
            }
            if (a === "спорт") {
                rate.sport += 1;
            }
            if (a === "докумел" || a === "телеп" || a === "тв " || a === "тв" || a === "тв-" || a === "tv" || a === "tv ") {
                rate.dochumor += 2;
            }
            if (a === "юмор") {
                rate.dochumor += 1;
            }
            if (a === "видео для моб" || a === "видео для смарт" || a === "видео для устр" || a === "Мобильное" || a === "3gp") {
                rate.other += 1;
            }
            return '';
        };
        var reg_quality = "фильмы без сюжета|документальные|мультим|мульт|сериа|комикс|видео для [моб|смарт|устр]{1}|мобильное|аудиокниги|беллетр|книг|фильм|игр|3gp|soundtrack|саундтрек|anim|аним|докумел|литер|телеп|эрот|xxx|porn|порно|сайтр|тв[\-]{1}|тв$|музыка|hentai|хентай|psp|xbox|журнал|софт|soft|спорт|юмор|утилит|book|game|tv |tv$|manga";
        if (category.length > 0)
            category.toLowerCase().replace(new RegExp(reg_quality, "g"), cal_rate);

        var qual_cat = [];
        $.each(rate, function(k, v) {
            if (k !== 'm') {
                qual_cat.push([v, k]);
            }
        });
        qual_cat.sort(function(a, b) {
            if (a[0] > b[0]) {
                return -1;
            } else
            if (a[0] === b[0]) {
                return 0;
            } else
                return 1;
        });
        if (qual_cat[0][0] > 0) {
            if (qual_cat[0][1] === "films") {
                return 3;
            } else
            if (qual_cat[0][1] === "serials") {
                return 0;
            } else
            if (qual_cat[0][1] === "anime") {
                return 7;
            } else
            if (qual_cat[0][1] === "dochumor") {
                return 8;
            } else
            if (qual_cat[0][1] === "music") {
                return 1;
            } else
            if (qual_cat[0][1] === "games") {
                return 2;
            } else
            if (qual_cat[0][1] === "books") {
                return 5;
            } else
            if (qual_cat[0][1] === "cartoons") {
                return 4;
            } else
            if (qual_cat[0][1] === "software") {
                return 6;
            } else
            if (qual_cat[0][1] === "sport") {
                return 9;
            } else
            if (qual_cat[0][1] === "xxx") {
                return 10;
            } else
            if (qual_cat[0][1] === "other") {
                return -1;
            }
        }
        if (quality.book) {
            return 5;
        } else
        if (quality.serial) {
            return 0;
        } else
        if (quality.mult) {
            return 4;
        } else
        if (quality.video > quality.music && quality.video > quality.game) {
            return 3;
        } else
        if (quality.music > quality.video && quality.music > quality.game) {
            return 1;
        } else
        if (quality.game > quality.music && quality.game > quality.video) {
            return 2;
        }
        return -1;
    };
    var log_errors = function(t, er) {
        /*
         * Описывает ошибки трекера
         * t - id торрента
         * er - массив ошибок
         */
        if (er === undefined)
            return;
        var tests = ('tests' in tracker[t]) ? tracker[t].tests : false;
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
        var all_errors = er;
        if (tests) {
            for (var i = 0; i < tests.length; i++) {
                if (tests[i] !== 0) {
                    er[i] = 0;
                }
            }
        }
        if (er.join(',') === '0,0,0,0,0,0,0,0,0') {
            return;
        }
        var msg = 'Tracker ' + tracker[t].name + ' have problem!' + "\n" + 'Tests: ' + er.join(',') + "\n" + 'All tests: ' + all_errors.join(',');
        if (er[0])
            msg += "\n" + er[0] + ' - cotegory exist fixed!';
        if (er[1])
            msg += "\n" + er[1] + ' - cotegory title fixed!';
        if (er[2])
            msg += "\n" + er[1] + ' - cotegory url fixed!';
        if (er[3])
            msg += "\n" + er[1] + ' - cotegory id fixed!';
        if (er[4])
            msg += "\n" + er[4] + ' - file size fixed!';
        if (er[5])
            msg += "\n" + er[5] + ' - dl link fixed!';
        if (er[6])
            msg += "\n" + er[6] + ' - seeds fixed!';
        if (er[7])
            msg += "\n" + er[7] + ' - leechs fixed!';
        if (er[8])
            msg += "\n" + er[8] + ' - time fixed!';
        console.warn(msg);
    };
    var torrent_check = function(v, t, er) {
        /*
         * Проверка тестов
         */
        if (er === undefined) {
            er = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
        if ('category' in v === false) {
            v['category'] = {
                title: null,
                url: null,
                id: -1
            };
            er[0] += 1;
        }
        if (v.category.title === undefined || v.category.title === null || v.category.title.length === 0) {
            v.category.title = null;
            er[1] += 1;
        }
        if (v.category.url === undefined || v.category.url === null || v.category.url.length === 0) {
            v.category.url = null;
            er[2] += 1;
        }
        if (v.category.id === undefined || v.category.id === null || v.category.id.length === 0) {
            v.category.id = -1;
            er[3] += 1;
        }
        v.size = parseFloat(v.size);
        if (isNaN(v.size)) {
            v.size = 0;
            er[4] += 1;
        }
        if (v.dl === undefined || v.dl === null || v.dl.length === 0) {
            v.dl = null;
            er[5] += 1;
        }
        v.seeds = parseInt(v.seeds);
        if (isNaN(v.seeds)) {
            v.seeds = 1;
            er[6] += 1;
        }
        v.leechs = parseInt(v.leechs);
        if (isNaN(v.leechs)) {
            v.leechs = 0;
            er[7] += 1;
        }
        v.time = parseInt(v.time);
        if (isNaN(v.time)) {
            v.time = 0;
            er[8] += 1;
        }
        return er;
    };
    var teaser_filter = function(title) {
        /*
         * фильтр тизеров
         */
        return ((/Трейлер|Тизер|Teaser|Trailer/i).test(title)) ? 1 : 0;
    };
    var inBGMode = function(t, a, s) {
        /*
         * поиск в фоне - для определения качества чего либо
         */
        var sum = 0;
        var errors = undefined;
        $.each(a, function(k, v) {
            if (typeof (v.title) !== 'string' || typeof (v.url) !== 'string' || v.title.length === 0 || v.url.length === 0) {
                console.error('Item in tracker ' + tracker[t].name + ' have critical problem! Torrent skipped!', v);
                return true;
            }
            v.title = $('<span>', {text: v.title}).text();
            errors = torrent_check(v, t, errors);
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
                v.category.id = autoset_Category(quality, v.category.title || "");
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
        log_errors(t, errors);
        updateTrackerResultCount(t, sum);
        loadingStatus(1, t);
        tmp_var_qbox = 1;
        explore.setQuality(backgroundModeID, keyword_filter_cache.year);
    };
    var write_result = function(t, a, s, p) {
        /*
         * Обрабатывает полученный массив торрентов
         * t - id торрент трекера
         * a - массив записей
         * s - текст поиска
         * p - количество найденный торрентов, указывается принудительно если загрузка более 1 страницы. 
         */
        if (tracker[t] === undefined) {
            return;
        }
        if ("year" in keyword_filter_cache === false) {
            keyword_filter_cache.year = s.match(/[1-2]{1}[0-9]{3}/);
            if (keyword_filter_cache.year) {
                keyword_filter_cache.year = keyword_filter_cache.year[0];
            } else {
                keyword_filter_cache.year = null;
            }
        }
        if ("keyword" in keyword_filter_cache === false) {
            keyword_filter_cache.keyword = s.replace(/\s+/g, " ").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            keyword_filter_cache.keyword_regexp = keyword_filter_cache.keyword.replace(/([.?*+^$[\]\\{}|-])/g, "\\$1");
            keyword_filter_cache.keyword_regexp_lower = keyword_filter_cache["keyword_regexp"].toLowerCase();
        }
        if ("keyword_no_year" in keyword_filter_cache === false && keyword_filter_cache.year) {
            keyword_filter_cache.keyword_no_year = keyword_filter_cache.keyword.replace(keyword_filter_cache.year, "").trim();
            keyword_filter_cache.keyword_no_year_regexp = keyword_filter_cache.keyword_no_year.replace(/([.?*+^$[\]\\{}|-])/g, "\\$1");
            keyword_filter_cache.keyword_no_year_regexp_lower = keyword_filter_cache.keyword_no_year_regexp.toLowerCase();
        }

        if (backgroundMode) {
            return inBGMode(t, a, s);
        }
        //var dbg_start = (new Date()).getTime();
        var c = [];
        if (p === undefined) {
            tmp_vars.rez_table_tbody.children('tr[data-tracker="' + t + '"]').remove();
        }
        if ("result_filter_input" in keyword_filter_cache === false) {
            keyword_filter_cache.result_filter_input = $.trim($('div.filter').children('input').val()).replace(/\s+/g, " ");
            keyword_filter_cache.result_filter_input = keyword_filter_cache.result_filter_input.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        }
        var sum = 0;
        var errors = undefined;
        $.each(a, function(k, v) {
            if (typeof (v.title) !== 'string' || typeof (v.url) !== 'string' || v.title.length === 0 || v.url.length === 0) {
                console.error('Tracker ' + tracker[t].name + ' have critical problem! Torrent skipped!', v);
                return true;
            }
            v.title = $('<span>', {text: v.title}).text();
            errors = torrent_check(v, t, errors);
            if (HideZeroSeed && v.seeds === 0) {
                return true;
            }
            if (TeaserFilter === 1 && teaser_filter(v.title + v.category.title) === 1) {
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
                console.error('Item in tracker ' + tracker[t].name + ' have critical problem! Torrent skipped!', v);
                return true;
            }
            var title = syntax_highlighting(v.title);
            sum++;
            var quality = quality_calc(title.r, v);
            title = title.n;
            if (autoSetCat & v.category.id < 0) {
                v.category.id = autoset_Category(quality, v.category.title || "");
            }
            var advFilter = [0, 0, 0, 0, 0];
            if (keywordFilter !== null) {
                if (title !== calcKeywordFilter(keyword_filter_cache.result_filter_input, title))
                    advFilter[0] = 1;
            }
            if (sizeFilter !== null) {
                if (calcSizeFilter(v.size)) {
                    advFilter[1] = 1;
                }
            }
            if (timeFilter !== null) {
                if (calcTimeFilter(v.time)) {
                    advFilter[2] = 1;
                }
            }
            if (HideSeed === 0 && seedFilter !== null) {
                if (calcSeedFilter(v.seeds)) {
                    advFilter[3] = 1;
                }
            }
            if (HideLeech === 0 && peerFilter !== null) {
                if (calcPeerFilter(v.leechs)) {
                    advFilter[4] = 1;
                }
            }
            var t_category_section = '';
            if (v.category.title !== null) {
                var t_cat_icon = '';
                if (ShowIcons) {
                    t_cat_icon = $('<div>', {class: 'tracker_icon num' + t, title: tracker[t].name});
                }
                if (v.category.url === null) {
                    t_category_section = $('<ul>').append($('<li>', {class: 'category', text: v.category.title}).append(t_cat_icon));
                } else {
                    t_category_section = $('<ul>').append($('<li>', {class: 'category'}).append($('<a>', {href: contentUnFilter(v.category.url), target: "_blank", text: v.category.title}), t_cat_icon));
                }
            }

            c.push($('<tr>', {'data-filter': advFilter.join(','), 'data-tracker': t, 'data-c': v.category.id}).append(
                    $('<td>', {class: 'time', 'data-value': v.time, title: unixintimetitle(v.time), text: unixintime(v.time)}),
            $('<td>', {class: 'quality', 'data-value': quality.value, 'data-qgame': quality.game, 'data-qseed': quality.seed, 'data-qname': quality.name, 'data-qvideo': quality.video, 'data-qmusic': quality.music, 'data-qbook': quality.book})
                    .append($('<div>', {class: 'progress'}).append($('<div>').css('width', (quality.value / 15) + 'px'), $('<span>', {title: quality.value, text: quality.value}))),
                    $('<td>', {class: 'name'})
                    .append($('<div>', {class: 'title'})
                            .append($('<a>', {href: contentUnFilter(v.url), target: "_blank"}).append(title), (v.category.title === null && ShowIcons) ? $('<div>', {class: 'tracker_icon num' + t, title: tracker[t].name}) : ''), t_category_section),
                    (v.dl !== null) ? $('<td>', {class: 'size', 'data-value': v.size}).append($('<a>', {href: contentUnFilter(v.dl), target: '_blank', text: bytesToSize(v.size) + ' ↓'})) : $('<td>', {class: 'size', 'data-value': v.size, text: bytesToSize(v.size)}),
            (HideSeed) ? '' : $('<td>', {class: 'seeds', 'data-value': v.seeds, text: v.seeds}),
            (HideLeech) ? '' : $('<td>', {class: 'leechs', 'data-value': v.leechs, text: v.leechs})
                    ));
        });
        log_errors(t, errors);
        if (p !== undefined) {
            sum = p;
        }
        updateTrackerResultCount(t, sum);
        loadingStatus(1, t);
        if (sum > 0) {
            tmp_vars.rez_table_tbody.append(c);
            table_update_timer();
        }
    };
    var table_update_timer = function() {
        /*
         * таймер обновления таблицы
         */
        clearTimeout(update_table.timer);
        update_table.timer = setTimeout(function() {
            //обновление сортровки
            tmp_vars.rez_table.trigger("update");
            //обновление категории
            updateCategorys();
        }, 200);
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
        var m = addZero(dt.getMonth() + 1);
        var d = addZero(dt.getDate());
        //var h = addZero(dt.getHours());
        //var mi = addZero(dt.getMinutes());
        //var sec = addZero(dt.getSeconds());
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
            c = tmp_vars.ul_trackers.children('li[data-id="' + t + '"]').attr('data-count');
            if (c === undefined)
                c = 0;
            if (c > 0) {
                tmp_vars.ul_trackers.children('li[data-id="' + t + '"]').children('i').text(c);
            } else {
                tmp_vars.ul_trackers.children('li[data-id="' + t + '"]').children('i').empty();
            }
        } else
        if (l === undefined) {
            if (c > 0) {
                tmp_vars.ul_trackers.children('li[data-id="' + t + '"]').attr('data-count', c).children('i').text(c);
            } else {
                tmp_vars.ul_trackers.children('li[data-id="' + t + '"]').attr('data-count', c).children('i').empty();
            }
        } else {
            if (c > 0) {
                tmp_vars.ul_trackers.children('li[data-id="' + t + '"]').children('i').text(c);
            } else {
                tmp_vars.ul_trackers.children('li[data-id="' + t + '"]').children('i').empty();
            }
        }
    };
    var contentFilter = function(c) {
        c = c.replace(/\/\//img, '#blockurl#').replace(/ src=(['"]{0,1})/img, ' src=$11.png#blockrurl#');
        return c;
    };
    var contentUnFilter = function(c) {
        c = c.replace(/1.png#blockrurl#/img, '').replace(/#blockrurl#/img, '').replace(/#blockurl#/img, '//');
        return c;
    };
    var syntax_highlighting = function(t) {
        /*
         * Выставляет рейтинг заголовку раздачи
         * Подсвечивает найденный текст в заголовке
         */
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
            //проверяет что это не фрагмент слова (проверка слева и справа)
            var sub = (c[b - 1] || '') + (c[b + a.length] || '');
            if (sub !== "" && sub !== "  " && sub !== " " && (/[\wА-Яа-я]/).test(sub)) {
                return '';
            }
            //
            if (rate.block.length === 0) {
                if (a === "blu-ray") {
                    rate.video += 100;
                    rate.block.push("video");
                    rate.qbox = "Blu-ray";
                } else
                if (a === "bd-remux" || a === "bdremux") {
                    rate.video += 90;
                    rate.block.push("video");
                    rate.qbox = "Remux";
                } else
                if (a === "bd-rip" || a === "bdrip" || a === "bdrip-avc") {
                    rate.video += 80;
                    rate.block.push("video");
                    rate.qbox = "BDRip";
                } else
                if (a === "camrip" || a === "camrip-avc") {
                    rate.video += 10;
                    rate.block.push("video");
                    rate.qbox = "CAMRip";
                } else
                if (a === "hdtv-rip" || a === "hdtvrip") {
                    rate.video += 70;
                    rate.block.push("video");
                    rate.qbox = "HDTV-Rip";
                } else
                if (a === "dtheater-rip") {
                    rate.video += 70;
                    rate.block.push("video");
                    rate.qbox = "DTheater-Rip";
                } else
                if (a === "lowhdrip") {
                    rate.video += 10;
                    rate.block.push("video");
                    rate.qbox = "LowHDRip";
                } else
                if (a === "hdtv") {
                    rate.video += 60;
                    rate.block.push("video");
                    rate.qbox = "HDTV";
                } else
                if (a === "hdrip" || a === "hdrip-avc") {
                    rate.video += 60;
                    rate.block.push("video");
                    rate.qbox = "HDRip";
                } else
                if (a === "dvdrip" || a === "dvd-rip" || a === "dvdrip-avc") {
                    rate.video += 60;
                    rate.block.push("video");
                    rate.qbox = "DVD-Rip";
                } else
                if (a === "dvd" || a === "dvd5" || a === "2xdvd9" || a === "dvd9" || a === "dvd-9" || a === "hd-dvd") {
                    rate.video += 50;
                    rate.block.push("video");
                    rate.qbox = "DVD";
                } else
                if (a === "hqsatrip" || a === "hqrip" || a === "hqrip-avc") {
                    rate.video += 44;
                    rate.block.push("video");
                    rate.qbox = "HDrip";
                } else
                if (a === "tvrip" || a === "iptvrip") {
                    rate.video += 40;
                    rate.block.push("video");
                    rate.qbox = "TV-Rip";
                } else
                if (a === "webrip") {
                    rate.video += 40;
                    rate.block.push("video");
                    rate.qbox = "WebRip";
                } else
                if (a === "web-dlrip-avc" || a === "webdl-rip" || a === "web-dlrip" || a === "web-dl") {
                    rate.video += 40;
                    rate.block.push("video");
                    rate.qbox = "WEB-DL";
                } else
                if (a === "satrip") {
                    rate.video += 40;
                    rate.block.push("video");
                    rate.qbox = "SAT-Rip";
                } else
                if (a === "dvb") {
                    rate.video += 40;
                    rate.block.push("video");
                    rate.qbox = "DVB";
                } else
                if (a === "telesynch" || a === "ts") {
                    rate.video += 20;
                    rate.block.push("video");
                    rate.qbox = "Telesync";
                }
                if (a === "dvdscr" || a === "dvdscreener") {
                    rate.video += 20;
                    rate.block.push("video");
                    rate.qbox = "DVD-Screener";
                }
                if (a === "flac" || a === "alac" || a === "lossless") {
                    rate.music += 100;
                    rate.block.push("music");
                    rate.qbox = "lossless";
                } else
                if (a === "mp3") {
                    rate.music += 80;
                    rate.qbox = "MP3";
                } else
                if (a === "ps3") {
                    rate.game += 80;
                    rate.block.push("game");
                    rate.qbox = "PS3";
                } else
                if (a === "xbox") {
                    rate.game += 80;
                    rate.block.push("game");
                    rate.qbox = "XBox";
                } else
                if (a === "(ps2)") {
                    rate.game += 80;
                    rate.block.push("game");
                    rate.qbox = "PS2";
                } else
                if (a === "[p]" || a === "{p}" || a === "(p)") {
                    rate.game += 20;
                    rate.block.push("game");
                    rate.qbox = "P";
                } else
                if (a === "repack" || a === "lossless repack" || a === "steam-rip" || a === "(lossy rip)" || a === "reloaded") {
                    rate.game += 60;
                    rate.block.push("game");
                    rate.qbox = "RePack";
                } else
                if (a === "[native]") {
                    rate.game += 100;
                    rate.block.push("game");
                    rate.qbox = "Native";
                } else
                if (a === "[rip]" || a === "{rip}" || a === "(rip)") {
                    rate.game += 80;
                    rate.block.push("game");
                    rate.qbox = "Rip";
                } else
                if (a === "[l]" || a === "{l}" || a === "(l)") {
                    rate.game += 100;
                    rate.block.push("game");
                    rate.qbox = "L";
                } else
                if (a === "лицензия") {
                    rate.game += 100;
                    rate.block.push("game");
                    rate.qbox = "L";
                } else
                if (a === "fb2" || a === "pdf" || a === "dejvu" || a === "rtf" || a === "epub") {
                    rate.book += 100;
                    rate.block.push("book");
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
            if (a === "itunes russia") {
                rate.video += 10;
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
            //выделяет то, что в скобках
            if (!_sub_select_enable)
                return name;
            return name.replace(/(\[[^\]]*\]|\([^\)]*\))/g, '<span class="sub_name">$1</span>');
        };
        var quality = "Blu-ray|Blu-Ray|BD-Remux|BDRemux|1080p|1080i|BDRip-AVC|BD-Rip|BDRip|CAMRip|CamRip-AVC|CamRip|HDTV-Rip|HQRip-AVC|HDTVrip|HDTVRip|DTheater-Rip|720p|LowHDRip|HDTV|HDRip-AVC|HDRip|DVD-Rip|DVDRip-AVC|DVDRip|DVD5|2xDVD9|DVD9|DVD-9|DVDScr|DVDScreener|HD-DVD|NoDVD|DVD|SatRip|HQSATRip|HQRip|TVRip|WEBRip|WEB-DLRip-AV​C|WebDL-Rip|AVC|WEB-DLRip|WEB-DL|SATRip|DVB|IPTVRip|TeleSynch|[Зз]{1}вук с TS|TS|АП|ЛО|ЛД|AVO|MVO|VO|DUB|2xDub|Dub|ДБ|ПМ|ПД|ПО|СТ|[Ss]{1}ubs|SUB|[sS]{1}ub|FLAC|flac|ALAC|alac|[lL]{1}oss[lL]{1}ess(?! repack)|\\(PS2\\)|PS3|Xbox|XBOX|Repack|RePack|\\[Native\\]|Lossless Repack|Steam-Rip|\\(Lossy Rip\/|{Rip}|[лЛ]{1}ицензия|RELOADED|\\[Rip\\]|\\[RiP\\]|\\{L\\}|\\(L\\)|\\[L\\]|[Ss]{1}eason(?=[s|:]?)|[Сс]{1}езон(?=[ы|:]?)|CUE|(?=\.)cue|MP3|128|192|320|\\(P\\)|\\[P\\]|PC \\(Windows\\)|Soundtrack|soundtrack|H\.264|mp4|MP4|M4V|FB2|PDF|RTF|EPUB|fb2|DJVU|djvu|epub|pdf|rtf|[мМ]{1}ультфильм|iTunes Russia";
        rate.year = name.match(/[1-2]{1}[0-9]{3}/);
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
            //функ-я подсвечивает слова поиска в заголовке
            //word_hl - счетчик подсвеченных слов
            //year_hl - если 1 то значит год в названии найден
            var sub = (c[b - 1] || '') + (c[b + a.length] || '');
            if (sub !== "" && sub !== "  " && sub !== " " && (/[\wА-Яа-я]/).test(sub)) {
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
        if (keyword_filter_cache.year) {
            //проверка по маске Name-no-year-lowc /|( .*year.*
            if (new RegExp('^' + keyword_filter_cache.keyword_no_year_regexp_lower + ' [/|(]{1} .*' + keyword_filter_cache.year + '.*').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_no_year_regexp_lower + '|' + keyword_filter_cache.year + ')', "ig"), "<b>$1</b>");
                rate.name = (words.length - 1) * word_rate + first_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            //проверка по маске ([.*]) Name-no-year-lowc /|( .*year.*
            if (new RegExp('^[\\(\\[]{1}.*[\\)\\]]{1} ' + keyword_filter_cache.keyword_no_year_regexp_lower + ' [/|(]{1} .*' + keyword_filter_cache.year + '.*').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_no_year_regexp_lower + '|' + keyword_filter_cache.year + ')', "ig"), "<b>$1</b>");
                rate.name = words.length * word_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            //проверка по маске .* Name-no-year /|( .*year.*
            if (new RegExp('.* ' + keyword_filter_cache.keyword_no_year_regexp + ' [/|(]{1} .*' + keyword_filter_cache.year + '.*').test(name)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_no_year_regexp + '|' + keyword_filter_cache.year + ')', "g"), "<b>$1</b>");
                rate.name = words.length * word_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            //проверка по маске Name-no-year .*year.*
            if (new RegExp('^' + keyword_filter_cache.keyword_no_year_regexp + ' .*' + keyword_filter_cache.year + '.*').test(name)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_no_year_regexp + '|' + keyword_filter_cache.year + ')', "g"), "<b>$1</b>");
                rate.name = (words.length - 1) * word_rate + first_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            //проверка по маске .* Name-no-year .*year.*
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
            //проверка по маске Name-lowc
            if (new RegExp('^' + keyword_filter_cache.keyword_regexp_lower + '$').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lower + ')', "ig"), "<b>$1</b>");
                rate.name = (words.length - 1) * word_rate + first_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            //проверка по маске Name-lowc /|(
            if (new RegExp('^' + keyword_filter_cache.keyword_regexp_lower + ' [/|(]{1} ').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lower + ')', "ig"), "<b>$1</b>");
                rate.name = (words.length - 1) * word_rate + first_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate
                };
            }
            //проверка по маске ([.*]) Name-lowc /|(
            if (new RegExp('^[([]{1}.*[)]]{1} ' + keyword_filter_cache.keyword_regexp_lower + ' [/|(]{1} ').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lower + ')', "ig"), "<b>$1</b>");
                rate.name = words.length * word_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate //95
                };
            }
            //проверка по маске .* Name-lowc /|(
            if (new RegExp(keyword_filter_cache.keyword_regexp_lower + ' [/|(]{1} ').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lower + ')', "ig"), "<b>$1</b>");
                rate.name = words.length * word_rate;
                hl_name = sub_select(hl_name);
                return {
                    n: hl_name,
                    r: rate //86
                };
            }
            //проверка по маске Name-lowc -/(.
            if (new RegExp('^' + keyword_filter_cache.keyword_regexp_lower + '[-/(\s.]{1}').test(name_lover)) {
                var hl_name = name.replace(new RegExp('(' + keyword_filter_cache.keyword_regexp_lower + ')', "ig"), "<b>$1</b>");
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
    var calcKeywordFilter = function(s, t) {
        /*
         * фильтр по фразам в названии раздачи
         */
        if (s.length === 0) {
            return null;
        }
        var r = t;
        if (AdvFiltration === 1) {
            var tmp = s.split(" ");
            if ((new RegExp(tmp.join('|'), "i")).test(t))
                r = null;
        } else
        if (AdvFiltration === 2) {
            var tmp = s.split(" ");
            var tmp_l = tmp.length;
            var trgr = true;
            for (var i = 0; i < tmp_l; i++) {
                if (tmp[i].length > 2 && tmp[i].substr(0, 2) === "\\-") {
                    tmp[i] = tmp[i].substr(2);
                    if ((new RegExp(tmp[i], "i")).test(t)) {
                        trgr = false;
                        break;
                    }
                } else {
                    if (!(new RegExp(tmp[i], "i")).test(t)) {
                        trgr = false;
                        break;
                    }
                }
            }
            if (trgr)
                r = null;
        } else {
            var tmp = s.split(",");
            var tmp_l = tmp.length;
            var trgr = true;
            for (var i = 0; i < tmp_l; i++) {
                if (tmp[i].length > 2 && tmp[i].substr(0, 2) === "\\-") {
                    tmp[i] = tmp[i].substr(2);
                    if ((new RegExp(tmp[i], "i")).test(t)) {
                        trgr = false;
                        break;
                    }
                } else {
                    if (!(new RegExp(tmp[i], "i")).test(t)) {
                        trgr = false;
                        break;
                    }
                }
            }
            if (trgr)
                r = null;
        }
        return r;
    };
    var updateTrackerCount = function() {
        /*
         * Обновляет кол-во раздач в каждом трекере.
         */
        var li = tmp_vars.ul_trackers.children('li');
        var t_c = li.length;
        var advFilter = [0, 0, 0, 0, 0];
        var old_filter = advFilter.join(',');
        if (keywordFilter !== null) {
            advFilter[0] = 1;
        }
        if (sizeFilter !== null) {
            advFilter[1] = 1;
        }
        if (timeFilter !== null) {
            advFilter[2] = 1;
        }
        if (HideSeed === 0 && seedFilter !== null) {
            advFilter[3] = 1;
        }
        if (HideLeech === 0 && peerFilter !== null) {
            advFilter[4] = 1;
        }
        var filter = advFilter.join(',');
        if (filter === old_filter) {
            filter = 0;
        } else
        if (filter !== 0) {
            var el_arr = tmp_vars.rez_table_tbody.children('tr[data-filter="' + filter + '"]');
        }
        for (var i = 0; i < t_c; i++) {
            var id = li.eq(i).attr('data-id');
            if (filter === 0) {
                updateTrackerResultCount(id);
            } else {
                var count = el_arr.filter('[data-tracker="' + id + '"]').length;
                updateTrackerResultCount(id, count, 1);
            }
        }
    };
    var updateCategorys = function() {
        /*
         * обновляет счетчик раздач в категориях
         */
        var sum = 0;
        var count_c = categorys.length;
        var filter = '';
        if (trackerFilter !== null)
            filter += '[data-tracker="' + trackerFilter + '"]';
        var advFilter = [0, 0, 0, 0, 0];
        if (keywordFilter !== null) {
            advFilter[0] = 1;
        }
        if (sizeFilter !== null) {
            advFilter[1] = 1;
        }
        if (timeFilter !== null) {
            advFilter[2] = 1;
        }
        if (HideSeed === 0 && seedFilter !== null) {
            advFilter[3] = 1;
        }
        if (HideLeech === 0 && peerFilter !== null) {
            advFilter[4] = 1;
        }
        filter += '[data-filter="' + advFilter.join(',') + '"]';
        var el_err = tmp_vars.rez_table_tbody.children('tr' + filter);
        for (var i = 0; i < count_c; i++) {
            var count = el_err.filter('[data-c="' + categorys[i] + '"]').length;
            if (count > 0) {
                tmp_vars.ul_categorys.children('li[data-id="' + categorys[i] + '"]').css('display', 'inline-block').children('i').text(count);
                sum += count;
            } else {
                tmp_vars.ul_categorys.children('li[data-id="' + categorys[i] + '"]').css('display', 'none');
            }
        }
        tmp_vars.ul_categorys.children('li').eq(0).children('i').text(sum);
        if (autoMove !== undefined) {
            var item = tmp_vars.ul_categorys.children('li[data-id="' + autoMove + '"]');
            if (item.css('display') === 'inline-block') {
                tmp_vars.ul_categorys.children('li.selected').removeClass('selected');
                item.addClass('selected');
                item.trigger('click');
                autoMove = undefined;
            }
        }
        if (tmp_vars.ul_categorys.children('li.selected').css('display') === 'none') {
            var category1 = tmp_vars.ul_categorys.children('li.selected').attr('data-id');
            tmp_vars.ul_categorys.children('li.selected').removeClass('selected');
            tmp_vars.ul_categorys.children('li').eq(0).addClass('selected');
            tmp_vars.ul_categorys.children('li.selected').trigger('click');
            autoMove = category1;
        }
    };
    var tableKeywordFilter = function(keyword) {
        /*
         * фильтр по словам
         */
        var clear_btn = $('div.filter div.btn');
        clear_btn.css('background-image', 'url(images/loading.gif)');
        keyword = $.trim(keyword).replace(/\s+/g, " ");
        var keyword_checked = keyword.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        if ("result_filter_input" in keyword_filter_cache !== false) {
            keyword_filter_cache.result_filter_input = keyword_checked;
        }
        if (keyword.length === 0) {
            keywordFilter = null;
        } else {
            keywordFilter = keyword;
        }
        //поиск и фильтрация контента
        var tr = tmp_vars.rez_table_tbody.children('tr');
        var tr_count = tr.length;
        for (var i = 0; i < tr_count; i++) {
            var tr_eq = tr.eq(i);
            var advFilter = tr_eq.attr('data-filter').split(',');
            var oldVal = parseInt(advFilter[0]);
            if (keywordFilter === null) {
                if (oldVal !== 0) {
                    advFilter[0] = 0;
                    tr_eq.attr('data-filter', advFilter.join(','));
                }
                continue;
            }
            if (SubCategoryFilter) {
                var name = tr_eq.children('td.name').text();
            } else {
                var name = tr_eq.children('td.name').children('div.title').children('a').text();
            }
            if (name !== calcKeywordFilter(keyword_checked, name)) {
                advFilter[0] = 1;
            } else {
                advFilter[0] = 0;
            }
            if (oldVal !== advFilter[0]) {
                tr_eq.attr('data-filter', advFilter.join(','));
            }
        }
        doFiltering();
        updateCategorys();
        updateTrackerCount();
        if (keywordFilter === null) {
            clear_btn.hide();
        } else {
            clear_btn.css('background-image', 'url(images/clear.png)');
        }
    };
    calcSizeFilter = function(value) {
        return ((sizeFilter.from > 0 && value >= sizeFilter.from || sizeFilter.from <= 0) && ((sizeFilter.to > 0 && value <= sizeFilter.to) || (sizeFilter.to <= 0)));
    };
    tableSizeFilter = function() {
        /*
         * фильтр по размеру раздачи
         */
        var tr = tmp_vars.rez_table_tbody.children('tr');
        var tr_count = tr.length;
        for (var i = 0; i < tr_count; i++) {
            var tr_eq = tr.eq(i);
            var size = parseInt(tr_eq.children('td.size').attr('data-value'));
            var advFilter = tr_eq.attr('data-filter').split(',');
            var oldVal = parseInt(advFilter[1]);
            if (calcSizeFilter(size)) {
                advFilter[1] = 1;
            } else {
                advFilter[1] = 0;
            }
            if (oldVal !== advFilter[1]) {
                tr_eq.attr('data-filter', advFilter.join(','));
            }
        }
        doFiltering();
        updateCategorys();
        updateTrackerCount();
    };
    calcTimeFilter = function(value) {
        return ((timeFilter.from > 0 && value >= timeFilter.from || timeFilter.from <= 0) && ((timeFilter.to > 0 && value <= timeFilter.to) || (timeFilter.to <= 0)));
    };
    tableTimeFilter = function(from, to) {
        /*
         * фильтр по времени раздачи
         */
        timeFilter = {
            from: from || 0,
            to: to || 0
        };
        var tr = tmp_vars.rez_table_tbody.children('tr');
        var tr_count = tr.length;
        for (var i = 0; i < tr_count; i++) {
            var tr_eq = tr.eq(i);
            var date = parseInt(tr_eq.children('td.time').attr('data-value'));
            var advFilter = tr_eq.attr('data-filter').split(',');
            var oldVal = parseInt(advFilter[2]);
            if (calcTimeFilter(date)) {
                advFilter[2] = 1;
            } else {
                advFilter[2] = 0;
            }
            if (oldVal !== advFilter[2]) {
                tr_eq.attr('data-filter', advFilter.join(','));
            }
        }
        doFiltering();
        updateCategorys();
        updateTrackerCount();
    };
    calcSeedFilter = function(value) {
        return ((seedFilter.from > -1 && value >= seedFilter.from || seedFilter.from < 0) && ((seedFilter.to > -1 && value <= seedFilter.to) || (seedFilter.to < 0)));
    };
    tableSeedFilter = function() {
        /*
         * фильтр по сидам
         */
        var tr = tmp_vars.rez_table_tbody.children('tr');
        var tr_count = tr.length;
        for (var i = 0; i < tr_count; i++) {
            var tr_eq = tr.eq(i);
            var seed_count = parseInt(tr_eq.children('td.seeds').attr('data-value'));
            var advFilter = tr_eq.attr('data-filter').split(',');
            var oldVal = parseInt(advFilter[3]);
            if (calcSeedFilter(seed_count)) {
                advFilter[3] = 1;
            } else {
                advFilter[3] = 0;
            }
            if (oldVal !== advFilter[3]) {
                tr_eq.attr('data-filter', advFilter.join(','));
            }
        }
        doFiltering();
        updateCategorys();
        updateTrackerCount();
    };
    calcPeerFilter = function(value) {
        return ((peerFilter.from > -1 && value >= peerFilter.from || peerFilter.from < 0) && ((peerFilter.to > -1 && value <= peerFilter.to) || (peerFilter.to < 0)));
    };
    tablePeerFilter = function() {
        /*
         * фильтр по пирам
         */
        var tr = tmp_vars.rez_table_tbody.children('tr');
        var tr_count = tr.length;
        for (var i = 0; i < tr_count; i++) {
            var tr_eq = tr.eq(i);
            var peer_count = parseInt(tr_eq.children('td.leechs').attr('data-value'));
            var advFilter = tr_eq.attr('data-filter').split(',');
            var oldVal = parseInt(advFilter[4]);
            if (calcPeerFilter(peer_count)) {
                advFilter[4] = 1;
            } else {
                advFilter[4] = 0;
            }
            if (oldVal !== advFilter[4]) {
                tr_eq.attr('data-filter', advFilter.join(','));
            }
        }
        doFiltering();
        updateCategorys();
        updateTrackerCount();
    };
    var triggerBlank = function() {
        /*
         * рычаг очистки страницы - возврат на главную
         */
        $(window).scrollTop(0);
        $('div.result_panel').css('display', 'none');
        $('div.explore').css('display', 'block');
        clear_table();
        tmp_vars.search_input.val('');
        var old_title = document.title;
        document.title = 'Torrents MultiSearch';
        window.location = '#s=';
        global_wl_hash = location.hash;
        tmp_vars.search_input.focus().trigger("keyup");
        explore.getLoad();
        if (old_title !== document.title) {
            _gaq.push(['_trackPageview', 'index.html']);
        }
    };
    var triggerSearch = function(keyword) {
        /*
         * рычаг старта поиска
         */
        if (keyword === "#") {
            return false;
        }
        keyword = $.trim(keyword);
        $(window).scrollTop(0);
        $('div.result_panel').css('display', 'block');
        $('div.explore').css('display', 'none');
        tmp_vars.search_input.blur();
        var sel_tr = $('ul.trackers li a.selected').parent().data('id');
        if (sel_tr === undefined)
            sel_tr = null;
        clear_table();
        if (sel_tr !== null)
            $('ul.trackers li[data-id=' + sel_tr + ']').children('a').addClass('selected');
        keyword = $.trim(keyword);
        if (tmp_vars.search_input.val() !== keyword) {
            tmp_vars.search_input.val(keyword).trigger("keyup");
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
        /*
         * рычаг получения качества раздачи
         */
        //flush for bg mode
        keyword_filter_cache = {};
        backgroundMode = true;
        backgroundModeID = {"section": section, "id": id};
        tmp_var_qbox = 0;
        engine.search(keyword, null, 1);
        _gaq.push(['_trackEvent', 'Quality', 'keyword', keyword]);
    };
    var load_category = function(c) {
        /*
         * загрузка списка категорий
         */
        tmp_vars.ul_categorys.empty();
        var count = c.length;
        categorys = [];
        categorys_assoc = [];
        for (var i = 0; i < count; i++) {
            categorys.push(c[i][0]);
            categorys_assoc[c[i][0]] = c[i][1];
            tmp_vars.ul_categorys.append($('<li>', {'data-id': c[i][0], text: c[i][1]}).append(' ', $('<i>')));
        }
        tmp_vars.ul_categorys.prepend($('<li>', {'class': 'selected', text: _lang['cat_all']}).append(' ', $('<i>')));
    };
    var AddAutocomplete = function() {
        /*
         * добавляет автозавершение для поисковой строки
         */
        function getStaticArray() {
            /*
             * Отдает массив поисковых запросов из истории
             */
            var AutocompleteArr = [];
            var order = function(a, b) {
                /*
                 * сортирует по кол-ву попаданий
                 */
                if (a.count > b.count)
                    return -1;
                if (a.count === b.count)
                    return 0;
                return 1;
            };
            var search_history = JSON.parse(GetSettings('search_history') || "[]");
            if (search_history.length > 0) {
                search_history.sort(order);
                var count = search_history.length;
                for (var i = 0; i < count; i++) {
                    AutocompleteArr.push(search_history[i].title);
                }
            }
            return AutocompleteArr;
        }
        var inp = $('input[type="text"][name="s"]');
        if (inp.attr('autocomplete') !== undefined) {
            if (AutoComplite_opt === 0) {
                inp.autocomplete({source: getStaticArray()});
            }
            return;
        }
        inp.autocomplete({
            source: (AutoComplite_opt === 0) ? getStaticArray() : function(a, response) {
                if ($.trim(a.term).length === 0 || AutoComplite_opt === 0) {
                    response(getStaticArray());
                } else {
                    if (xhr_autocomplite !== null) {
                        xhr_autocomplite.abort();
                    }
                    xhr_autocomplite = $.getJSON('http://suggestqueries.google.com/complete/search?client=firefox&q=' + a.term).success(function(data) {
                        var arr = data[1];
                        response(arr);
                    });
                }
            },
            /*
             * unstable api
             messages: {
             noResults: '',
             results: function() {}
             },
             */
            minLength: 0,
            select: function(event, ui) {
                $(this).val(ui.item.value);
                $(this).closest('form').trigger('submit');
            },
            position: {
                collision: "bottom"
            }
        });
    };
    var LoadProfiles = function() {
        /*
         * загружает список профилей
         */
        var defProfile = parseInt(GetSettings('defProfile') || 0);
        var arr = engine.getProfileList();
        if (arr.length <= 1)
            return;
        var sel = $('<select>', {title: _lang.label_profile}).on('change', function() {
            engine.loadProfile($(this).val());
        });
        $.each(arr, function(k, v) {
            var opt = $('<option>', {value: k, text: v});
            if (k === defProfile) {
                opt.prop('selected', true);
            }
            sel.append(opt);
        });
        sel = $('<div>', {'class': "profile"}).append(sel);
        $('div.tracker_list .setup').after(sel);
    };
    if (isFF) {
        var parseHTML = function(doc, html, allowStyle, baseURI, isXML) {
            var PARSER_UTILS = "@mozilla.org/parserutils;1";

            // User the newer nsIParserUtils on versions that support it.
            if (PARSER_UTILS in Components.classes) {
                var parser = Components.classes[PARSER_UTILS]
                        .getService(Components.interfaces.nsIParserUtils);
                if ("parseFragment" in parser)
                    return parser.parseFragment(html, allowStyle ? parser.SanitizerAllowStyle : 0,
                            !!isXML, baseURI, doc.documentElement);
            }

            return Components.classes["@mozilla.org/feed-unescapehtml;1"]
                    .getService(Components.interfaces.nsIScriptableUnescapeHTML)
                    .parseFragment(html, !!isXML, baseURI, doc.documentElement);
        };
    }
    var load_in_sandbox = function(id, c) {
        if (isFF) {
            c = c.replace(/href=/g, "data-href=");
            var t = parseHTML(document, c);
            var t1 = $('<html></html>').append(t);
            var links = t1.find('a');
            var links_len = links.length;
            for (var n = 0; n < links_len; n++) {
                $(links[n]).attr('href', $(links[n]).attr('data-href')).removeAttr('data-href');
            }
            t = t1;
        } else {
            var t = $($.parseHTML(c));
        }
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
    var init_tmp_vars = function() {
        if (tmp_vars.ul_trackers === undefined) {
            tmp_vars.ul_trackers = $('ul.trackers');
        }
        if (tmp_vars.rez_table === undefined) {
            tmp_vars.rez_table = $('#rez_table');
        }
        if (tmp_vars.rez_table_tbody === undefined) {
            tmp_vars.rez_table_tbody = tmp_vars.rez_table.children('tbody');
        }
        if (tmp_vars.ul_categorys === undefined) {
            tmp_vars.ul_categorys = $('ul.categorys');
        }
        if (tmp_vars.form_search === undefined) {
            tmp_vars.form_search = $('form[name="search"]');
        }
        if (tmp_vars.search_input === undefined) {
            tmp_vars.search_input = tmp_vars.form_search.children('input[type="text"]');
        }
    };
    var doFiltering = function() {
        //All filtering hear!
        var showFilter = [];
        if (categoryFilter !== null) {
            showFilter.push('data-c="' + categoryFilter + '"');
        }
        if (trackerFilter !== null) {
            showFilter.push('data-tracker="' + trackerFilter + '"');
        }
        var advFilter = [0, 0, 0, 0, 0];
        if (keywordFilter !== null) {
            advFilter[0] = 1;
        }
        if (sizeFilter !== null) {
            advFilter[1] = 1;
        }
        if (timeFilter !== null) {
            advFilter[2] = 1;
        }
        if (HideSeed === 0 && seedFilter !== null) {
            advFilter[3] = 1;
        }
        if (HideLeech === 0 && peerFilter !== null) {
            advFilter[4] = 1;
        }
        if (advFilter.indexOf(1) !== -1) {
            showFilter.push('data-filter="' + advFilter.join(',') + '"');
        }
        var selector = '#rez_table>tbody>tr';
        var uF = $('style.userFilter');
        if (showFilter.length === 0) {
            uF.remove();
        } else {
            var filterStyle = selector + ':not([' + showFilter.join(']),' + selector + ':not([') + ']){display: none;}';
            //+ selector + '[' + showFilter.join('][') + ']{display:table-row;}';
            if (uF.length === 0) {
                $('body').append('<style class="userFilter">' + filterStyle + '</style>');
            } else {
                uF.html(filterStyle);
            }
        }
    };
    return {
        result: write_result,
        contentFilter: contentFilter,
        contentUnFilter: contentUnFilter,
        clear_table: clear_table,
        auth: auth,
        addTrackerInList: addTrackerInList,
        loadingStatus: loadingStatus,
        triggerSearch: triggerSearch,
        triggerBlank: triggerBlank,
        setCatFilter: function(a) {
            categoryFilter = a;
        },
        SetAutoMove: function(a) {
            autoMove = a;
        },
        AddAutocomplete: AddAutocomplete,
        ClearTrackerList: ClearTrackerList,
        LoadProfiles: LoadProfiles,
        getQuality: getQuality,
        getAssocCategorys: categorys_assoc,
        load_in_sandbox: load_in_sandbox,
        begin: function() {
            init_tmp_vars();
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
            tmp_vars.rez_table.find('th.time').text(_lang['table'].time);
            tmp_vars.rez_table.find('th.quality').text(_lang['table'].quality[0]);
            tmp_vars.rez_table.find('th.quality').attr('title', _lang['table'].quality[1]);
            tmp_vars.rez_table.find('th.name').text(_lang['table'].title);
            tmp_vars.rez_table.find('th.size').text(_lang['table'].size);
            tmp_vars.rez_table.find('th.seeds').text(_lang['table'].seeds[0]);
            tmp_vars.rez_table.find('th.seeds').attr('title', _lang['table'].seeds[1]);
            tmp_vars.rez_table.find('th.leechs').text(_lang['table'].leechs[0]);
            tmp_vars.rez_table.find('th.leechs').attr('title', _lang['table'].leechs[1]);
            $('div.topbtn').attr('title', _lang['btn_up']);
            $('div.explore > div.source').children("span").text(_lang['exp_source']);
            $('div.explore > div.source').children("a").eq(0).text(_lang['exp_s_a_f']);
            $('div.explore > div.source').children("a").eq(1).text(_lang['exp_s_a_g']);
            //$('div.time_filter').children('p').eq(0).text(_lang['time_filter']);
            var time_filter = $('.time_filter');
            var time_filter_select = time_filter.find('select');
            time_filter.children('p').eq(0).text(_lang['time_filter']);
            time_filter_select.children("option[value=all]").text(_lang.time_f_s[0]);
            time_filter_select.children("option[value=1h]").text(_lang.time_f_s[1]);
            time_filter_select.children("option[value=24h]").text(_lang.time_f_s[2]);
            time_filter_select.children("option[value=72h]").text(_lang.time_f_s[7]);
            time_filter_select.children("option[value=1w]").text(_lang.time_f_s[3]);
            time_filter_select.children("option[value=1m]").text(_lang.time_f_s[4]);
            time_filter_select.children("option[value=1y]").text(_lang.time_f_s[5]);
            time_filter_select.children("option[value=range]").text(_lang.time_f_s[6]);
            if (HideSeed) {
                $('div.seed_filter').hide();
            }
            if (HideLeech) {
                $('div.peer_filter').hide();
            }
            $('div.seed_filter').children('p').eq(0).text(_lang['seed_filter']);
            $('div.seed_filter').find('span.from').eq(0).text(_lang['size_filter_f']);
            $('div.seed_filter').find('span.to').eq(0).text(_lang['size_filter_t']);
            $('div.peer_filter').children('p').eq(0).text(_lang['peer_filter']);
            $('div.peer_filter').find('span.from').eq(0).text(_lang['size_filter_f']);
            $('div.peer_filter').find('span.to').eq(0).text(_lang['size_filter_t']);

            if (filter_panel_to_left) {
                $("div.content div.right").css({"float": "left", "padding-left": "5px"});
                $("div.content div.left").css({"margin-left": "180px", "margin-right": "0"});
                $("div.topbtn").css({"right": "auto"});
            }

            time_filter.find('input').datepicker({
                defaultDate: "0",
                changeMonth: true,
                numberOfMonths: 1,
                prevText: "",
                nextText: "",
                monthNamesShort: _lang.time_f_m,
                dayNamesMin: _lang.time_f_d,
                firstDay: 1,
                maxDate: "+1d",
                hideIfNoPrevNext: true,
                dateFormat: "dd/mm/yy",
                onClose: function(date, b) {
                    if ($(b.input[0]).attr("name") === "start") {
                        time_filter.find('input[name=end]').datepicker("option", "minDate", date);
                    } else {
                        time_filter.find('input[name=start]').datepicker("option", "maxDate", date);
                    }
                    var dateList = $('.time_filter').find('input');
                    var st = ex_kit.format_date(1, dateList.eq(0).val());
                    var en = ex_kit.format_date(1, dateList.eq(1).val());
                    if (en > 0) {
                        en += 60 * 60 * 24;
                    }
                    tableTimeFilter(st, en);
                }
            }).on('dblclick', function() {
                $(this).val('');
                var dateList = $('.time_filter').find('input');
                var st = ex_kit.format_date(1, dateList.eq(0).val());
                var en = ex_kit.format_date(1, dateList.eq(1).val());
                if (en > 0) {
                    en += 60 * 60 * 24;
                }
                tableTimeFilter(st, en);
            });
            time_filter_select.on('change', function() {
                var value = this.value;
                if (value === "range") {
                    $('.time_filter').children('.range').show();
                } else {
                    $('.time_filter').children('.range').hide();
                }
                var utime = 0;
                var date = ((new Date).getTime() / 1000);
                if (value === "all") {
                    utime = 0;
                } else
                if (value === "1h") {
                    utime = date - 60 * 60;
                } else
                if (value === "24h") {
                    utime = date - 60 * 60 * 24;
                } else
                if (value === "72h") {
                    utime = date - 60 * 60 * 24 * 3;
                } else
                if (value === "1w") {
                    utime = date - 60 * 60 * 24 * 7;
                } else
                if (value === "1m") {
                    utime = date - 60 * 60 * 24 * 30;
                } else
                if (value === "1y") {
                    utime = date - 60 * 60 * 24 * 365;
                }
                tableTimeFilter(utime);
            });

            load_category(_lang['categorys']);
            LoadProfiles();
            if (HideLeech) {
                $('th.leechs').remove();
            }
            if (HideSeed) {
                $('th.seeds').remove();
            }
            tmp_vars.form_search.submit(function(event) {
                event.preventDefault();
                triggerSearch(tmp_vars.search_input.val());
                return false;
            });
            tmp_vars.ul_categorys.on('click', 'li', function(event) {
                if (event.isTrigger !== true)
                    autoMove = undefined;
                var id = $(this).attr('data-id');
                categoryFilter = id || null;
                tmp_vars.ul_categorys.children('li.selected').removeClass('selected');
                $(this).addClass('selected');
                doFiltering();
            });
            tmp_vars.ul_categorys.children('li').css('display', 'none').eq(0).css('display', 'inline-block');
            tmp_vars.rez_table.tablesorter({
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
                    return $(node).text();
                },
                sortList: JSON.parse(GetSettings('Order') || '[["1", "1"]]'),
                onsort: function(s) {
                    SetSettings('Order', JSON.stringify(s));
                },
                selectorHeaders: '#rez_table > thead th'
            });
            tmp_vars.search_input.focus();
            tmp_vars.form_search.children('div.btn.clear').on("click", function(event) {
                event.preventDefault();
                $(this).hide();
                tmp_vars.search_input.val("").focus();
            });
            tmp_vars.search_input.on('keyup', function() {
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
                    tableKeywordFilter($('div.filter input').val());
                }, 500);
            });
            $('div.filter div.btn').on("click", function() {
                $('div.filter input').val('');
                tableKeywordFilter('');
            });
            $('div.size_filter').find('input').keyup(function() {
                var t = parseFloat($(this).val());
                if (isNaN(t) || t < 0) {
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
                clearTimeout(filter_timers.size);
                filter_timers.size = setTimeout(function() {
                    tableSizeFilter();
                }, 500);
            }).on('dblclick', function() {
                $(this).val('').trigger('keyup');
            });
            $('div.seed_filter').find('input').keyup(function() {
                if (HideSeed)
                    return;
                var t = parseInt($(this).val());
                if (isNaN(t) || t < 0) {
                    t = -1;
                }
                var type = 1;
                if ($(this).attr('name') === "start") {
                    type = 0;
                }
                if (seedFilter === null) {
                    seedFilter = {
                        from: -1,
                        to: -1
                    };
                }
                if (type === 1) {
                    seedFilter.to = t;
                } else {
                    seedFilter.from = t;
                }
                clearTimeout(filter_timers.seed);
                filter_timers.seed = setTimeout(function() {
                    tableSeedFilter();
                }, 500);
            }).on('dblclick', function() {
                $(this).val('').trigger('keyup');
            });
            $('div.peer_filter').find('input').keyup(function() {
                if (HideLeech)
                    return;
                var t = parseInt($(this).val());
                if (isNaN(t) || t < 0) {
                    t = -1;
                }
                var type = 1;
                if ($(this).attr('name') === "start") {
                    type = 0;
                }
                if (peerFilter === null) {
                    peerFilter = {
                        from: -1,
                        to: -1
                    };
                }
                if (type === 1) {
                    peerFilter.to = t;
                } else {
                    peerFilter.from = t;
                }
                clearTimeout(filter_timers.peer);
                filter_timers.peer = setTimeout(function() {
                    tablePeerFilter();
                }, 500);
            }).on('dblclick', function() {
                $(this).val('').trigger('keyup');
            });
            var s = (document.URL).replace(/(.*)index.html/, '').replace(/#s=(.*)/, '$1');
            if (s.length > 0) {
                tmp_vars.search_input.val(s).trigger("keyup");
            }
            $('div.tracker_list .setup').on("click", function(e) {
                e.preventDefault();
                window.location = 'options.html#back=' + $.trim(tmp_vars.search_input.val());
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
            $(window).on('hashchange', function() {
                if (location.hash !== global_wl_hash)
                {
                    $(window).trigger('load');
                    global_wl_hash = location.hash;
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
            if (window.censure) {
                $('div.explore').children("div.source").html("<div class=\"censure\">" + _lang.cens + "<a href=\"https://addons.opera.com/ru/extensions/details/torrents-multisearch/\">Opera</a></div>");
            }
        }
    };
}();
$(function() {
    $.ajaxSetup({
        jsonp: false
    });
    view.begin();
    engine.loadProfile();
});
$(window).load(function() {
    var s = (document.URL).replace(/.*index.html/, '').replace(/^#s=(.*)/, '$1');
    if (s.length > 0) {
        view.triggerSearch(decodeURIComponent(s));
    } else {
        view.triggerBlank();
    }
});
var global_wl_hash = location.hash;