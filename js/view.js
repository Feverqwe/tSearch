var view = function() {
    /**
     * @namespace $
     */
    var var_cache = {
        year: (new Date()).getFullYear(),
        syntaxCache: {},
        quality_regexp: new RegExp("Blu-ray|Blu-Ray|BD-Remux|BDRemux|1080p|1080i|BDRip-AVC|BD-Rip|BDRip|CAMRip|" +
            "CamRip-AVC|CamRip|HDTV-Rip|HQRip-AVC|HDTVrip|HDTVRip|DTheater-Rip|720p|LowHDRip|HDTV|HDRip-AVC|HDRip|" +
            "DVD-Rip|DVDRip-AVC|DVDRip|DVD5|2xDVD9|DVD9|DVD-9|DVDScr|DVDScreener|HD-DVD|NoDVD|DVD|SatRip|HQSATRip|" +
            "HQRip|TVRip|WEBRip|WEB-DLRip-AV​C|WebDL-Rip|AVC|WEB-DLRip|WEB-DL|SATRip|DVB|IPTVRip|TeleSynch|" +
            "[Зз]{1}вук с TS|TS|АП|ЛО|ЛД|AVO|MVO|VO|DUB|2xDub|Dub|ДБ|ПМ|ПД|ПО|СТ|[Ss]{1}ubs|SUB|[sS]{1}ub|FLAC|flac|" +
            "ALAC|alac|[lL]{1}oss[lL]{1}ess(?! repack)|\\(PS2\\)|PS3|Xbox|XBOX|Repack|RePack|\\[Native\\]|" +
            "Lossless Repack|Steam-Rip|\\(Lossy Rip\/|{Rip}|[лЛ]{1}ицензия|RELOADED|\\[Rip\\]|\\[RiP\\]|\\{L\\}|" +
            "\\(L\\)|\\[L\\]|[Ss]{1}eason(?=[s|:]?)|[Сс]{1}езон(?=[ы|:]?)|CUE|(?=\.)cue|MP3|128|192|320|\\(P\\)|" +
            "\\[P\\]|PC \\(Windows\\)|Soundtrack|soundtrack|H\\\.?264|mp4|MP4|M4V|FB2|PDF|RTF|EPUB|fb2|DJVU|djvu|" +
            "epub|pdf|rtf|[мМ]{1}ультфильм|iTunes Russia", 'g'),
        cat_regexp: new RegExp("фильмы без сюжета|документальные|мультим|мульт|сериа|комикс|видео для [моб|смарт|" +
            "устр]{1}|мобильное|аудиокниги|беллетр|книг|фильм|игр|3gp|soundtrack|саундтрек|anim|аним|докумел|литер|" +
            "телеп|эрот|xxx|porn|порно|сайтр|тв[\-]{1}|тв$|музыка|hentai|хентай|psp|xbox|журнал|софт|soft|спорт|юмор|" +
            "утилит|book|game|tv |tv$|manga", "g"),
        rm_pre_tag_regexp: new RegExp("\\(.*\\)|\\[.*\\]", 'g'),
        //массив содержащий всю информацию и dom элемент торрентов
        table_dom: [],
        //сортировка по возрастанию или убыванию
        table_sort_by: 0,
        //столбец для сортировки
        table_sort_colum: 'quality',
        //массив содержащий текущий порядок списка
        table_sort_pos: [],
        //фильтр времени
        timeFilter: undefined,
        //фильтр по размеру
        sizeFilter: undefined,
        //фильтр по словам
        keywordFilter: undefined,
        //фильтр по сидам
        seedFilter: undefined,
        //фильтр по пирам
        peerFilter: undefined,
        //таймер до наступления фильтрации списка
        filterTimer: undefined,
        //Время таймера фильтрации
        filterTimerValue: 250,
        //список трекеров профиля
        trackers: {},
        //текущий запрос
        currentRequest: undefined,
        //массив с выделенными трекерами
        currentTrackerList: [],
        //текущая категория
        currentCategory: undefined,
        //кэш категорий
        categorys: {},
        //фильтр стиль
        filter_string: '0,0,0,0,0',
        //счетчик
        counter: {}
    };
    var dom_cache = {};

    var HideLeech = parseInt(GetSettings('HideLeech') || 1);
    var HideSeed = parseInt(GetSettings('HideSeed') || 0);
    var ShowIcons = parseInt(GetSettings('ShowIcons') || 1);
    var HideZeroSeed = parseInt(GetSettings('HideZeroSeed') || 0);
    var AdvFiltration = parseInt(GetSettings('AdvFiltration') || 2);
    var TeaserFilter = parseInt(GetSettings('TeaserFilter') || 1);
    var SubCategoryFilter = parseInt(GetSettings('SubCategoryFilter') || 0);

    var options = {
        single_filter_mode: true
    };
    var writeTrackerList = function(trList) {
        var_cache.trackers = {};
        dom_cache.trackers_ul.empty();
        dom_cache.body.children('style.tracker_icons').remove();
        var items = [];
        var style = '';
        $.each(trList, function(key, item) {
            item.class_name = key.replace(/[^A-Za-z0-9]/g,'_');
            var icon = $('<div>', {'class': 'tracker_icon '+item.class_name});
            var i = $('<i>', {text: 0});
            var link = $('<a>', {text: item.name, href: '#'}).data('tracker', key);
            var li = $('<li>').append(icon, link, i);
            var_cache.trackers[key] = {icon: 1, link: link, i: i, count: 0, count_val: 0, tracker: item, li: li, auth: 1};
            items.push( li );
            style += 'div.tracker_icon.'+item.class_name+'{background-image:url('+item.icon+');}';
        });
        dom_cache.trackers_ul.append(items);
        dom_cache.body.append($('<style>', {'class':'tracker_icons', text: style}));
    };
    var writeProfileList = function(profileList) {
        var $select = $('<select>', {'title': _lang.label_profile});
        var count = 0;
        $.each(profileList, function(key) {
            $select.append( $('<option>', {text: key}) );
            count++;
        });
        if (count < 2) {
            return;
        }
        dom_cache.trackers_ul.before($('<div>', {'class': 'profile'}).append($select));
    };
    var writeTrackerAuth = function(state, id) {
        /**
         * @namespace gui.li
         * @namespace gui.tracker
         * @namespace gui.auth
         */
        var gui = var_cache.trackers[id];
        if (gui === undefined) {
            return;
        }
        if (gui.auth === state) {
            return;
        }
        if (state === 0) {
            gui.li.append( $('<ul>').append( $('<li>').append( $('<a>', {href: gui.tracker.login_url, target: '_blank', text: _lang.btn_login}) ) ) );
        } else {
            var_cache.trackers[id].li.children('ul').remove();
        }
        gui.auth = state;
    };
    var setTrackerLoadingState = function(state, id) {
        var gui = var_cache.trackers[id];
        if (gui === undefined) {
            return;
        }
        if (gui.icon === state) {
            return;
        }
        dom_cache.body.children('style.icon_'+gui.tracker.class_name).remove();
        if (state === 2) {
            dom_cache.body.append( $('<style>', {'class': 'icon_'+gui.tracker.class_name, text: 'ul.trackers>li>div.tracker_icon.'+gui.tracker.class_name+'{background:url(images/error.png) center center #fff;}'}) );
        } else if (state === 1) {
            return;
        } else if (state === 0) {
            dom_cache.body.append( $('<style>', {'class': 'icon_'+gui.tracker.class_name, text: 'ul.trackers>li>div.tracker_icon.'+gui.tracker.class_name+'{background:url(images/loading.gif) center center #fff;}'}) );
        }
        gui.icon = state;
    };
    var clear_table = function() {
        /*
         * очищает результаты поиска, сбрасывает все в ноль
         */
        dom_cache.result.get(0).textContent = "";
        dom_cache.about_panel.empty();
        var_cache.table_dom = [];
        var_cache.table_sort_pos = [];
        var_cache.counter = {};
        updateCounts();
    };
    var homeMode = function(){
        dom_cache.explore.show();
        dom_cache.result_panel.hide();
        clear_table();
    };
    var searchMode = function() {
        dom_cache.explore.hide();
        dom_cache.result_panel.show();
    };
    var search = function(request) {
        clear_table();
        searchMode();
        syntaxCacheRequest(request);
        engine.search(request, var_cache.currentTrackerList);
        var_cache.currentRequest = request;
    };
    var home = function(){
        homeMode();
        engine.stop();
    };
    var itemCheck = function(item, er) {
        /*
         * Проверка тестов
         */
        if (typeof (item.title) !== 'string' || typeof (item.url) !== 'string' || item.title.length === 0 || item.url.length === 0) {
            return 0;
        } else {
            if (item.url.indexOf('#block') !== -1) {
                item.url = engine.contentUnFilter(item.url);
            }
            if (item.title.indexOf('#block') !== -1) {
                item.title = engine.contentUnFilter(item.title);
            }
        }
        if (item.category === undefined) {
            item.category = {
                title: undefined,
                url: undefined,
                id: -1
            };
            er[0] += 1;
        }
        if (typeof item.category.title !== 'string' || item.category.title.length === 0) {
            item.category.title = undefined;
            er[1] += 1;
        }
        if (typeof item.category.url !== 'string' || item.category.url.length === 0) {
            item.category.url = null;
            er[2] += 1;
        } else {
            if (item.category.url.indexOf('#block') !== -1) {
                item.category.url = engine.contentUnFilter(item.category.url);
            }
        }
        if (item.category.id === undefined) {
            item.category.id = -1;
            er[3] += 1;
        }
        if (typeof item.category.id !== 'number') {
            item.category.id = parseInt(item.category.id);
            if (isNaN(item.category.id)) {
                item.category.id = -1;
                er[3] += 1;
            }
        }
        if (typeof item.size !== 'number') {
            item.size = parseInt(item.size);
            if (isNaN(item.size)) {
                item.size = 0;
                er[4] += 1;
            }
        }
        if (typeof item.dl !== 'string' || item.dl.length === 0) {
            item.dl = undefined;
            er[5] += 1;
        } else {
            if (item.dl.indexOf('#block') !== -1) {
                item.dl = engine.contentUnFilter(item.dl);
            }
        }
        if (typeof item.seeds !== 'number') {
            item.seeds = parseInt(item.seeds);
            if (isNaN(item.seeds)) {
                item.seeds = 1;
                er[6] += 1;
            }
        }
        if (typeof item.leechs !== 'number') {
            item.leechs = parseInt(item.leechs);
            if (isNaN(item.leechs)) {
                item.leechs = 0;
                er[7] += 1;
            }
        }
        if (typeof item.time !== 'number') {
            item.time = parseInt(item.time);
            if (isNaN(item.time)) {
                item.time = 0;
                er[8] += 1;
            }
        }
        return 1;
    };
    var log_errors = function(tracker, er) {
        /*
         * Описывает ошибки трекера
         * t - id торрента
         * er - массив ошибок
         */
        var tests = (tracker.tests !== undefined) ? tracker.tests : false;
        /*tests:
            0 - category exist
            1 - cotegory title
            2 - cotegory url
            3 - cotegory id
            4 - file size
            5 - dl link
            6 - seeds
            7 - leechs
            8 - time
        */
        var all_errors = er.slice(0);
        if (tests !== false) {
            for (var i = 0, len = tests.length; i < len; i++) {
                if (tests[i] !== 0) {
                    er[i] = 0;
                }
            }
        }
        if (er.join(',') === '0,0,0,0,0,0,0,0,0') {
            return;
        }
        var msg = 'Tracker ' + tracker.name + ' have problem!' + "\n" + 'Tests: ' + er.join(',') + "\n" + 'All tests: ' + all_errors.join(',');
        if (er[0] !== 0) {
            msg += "\n" + er[0] + ' - cotegory exist fixed!';
        }
        if (er[1] !== 0) {
            msg += "\n" + er[1] + ' - cotegory title fixed!';
        }
        if (er[2] !== 0) {
            msg += "\n" + er[2] + ' - cotegory url fixed!';
        }
        if (er[3] !== 0) {
            msg += "\n" + er[3] + ' - cotegory id fixed!';
        }
        if (er[4] !== 0) {
            msg += "\n" + er[4] + ' - file size fixed!';
        }
        if (er[5] !== 0) {
            msg += "\n" + er[5] + ' - dl link fixed!';
        }
        if (er[6] !== 0) {
            msg += "\n" + er[6] + ' - seeds fixed!';
        }
        if (er[7] !== 0) {
            msg += "\n" + er[7] + ' - leechs fixed!';
        }
        if (er[8] !== 0) {
            msg += "\n" + er[8] + ' - time fixed!';
        }
        console.warn(msg);
    };
    var teaserFilter = function(title) {
        /*
         * фильтр тизеров
         */
        return ((/Трейлер|Тизер|Teaser|Trailer/i).test(title)) ? 1 : 0;
    };
    var checkRate = function(quality, v) {
        /*
         * Расчет качетсва по сидам
         * Перерасчет соотношения качества видео и размера раздачи
         */
        quality.seed = (v.seeds > 50) ? 70 : (v.seeds > 30) ? 50 : (v.seeds > 20) ? 40 : (v.seeds > 10) ? 30 : (v.seeds > 0) ? 10 : 0;
        if (v.size < 524288000 && quality.video > 45)
            quality.video = Math.round(parseInt(quality.video) / 10);
        else
        if (v.size < 1363148800 && quality.video > 65)
            quality.video = Math.round(parseInt(quality.video) / 2);
        quality.value = quality.seed + quality.name + quality.video + quality.music + quality.game;
        return quality;
    };
    var cal_cat_rate = function(word, position, string) {
        var rate = var_cache.catRate;
        if (rate.m.indexOf(word) === -1) {
            rate.m.push(word);
        } else {
            return '';
        }
        if (checkForSymbol(string[position - 1] || '') === 0) {
            return '';
        }
        if (word === "эрот" || word === "xxx" || word === "porn" || word === "порно" || word === "фильмы без сюжета" || word === "hentai" || word === "хентай") {
            rate.xxx += 10;
        }
        if (word === "мультим") {
            rate.software += 2;
        }
        if (word === "мульт") {
            rate.cartoons += 2;
        }
        if (word === "сериа") {
            rate.serials += 2;
        }
        if (word === "книг" || word === "аудиокниги" || word === "литер" || word === "беллетр" || word === "журнал" || word === "book") {
            rate.books += 1;
        }
        if (word === "фильм") {
            rate.films += 1;
        }
        if (word === "soundtrack" || word === "музыка" || word === "саундтрек") {
            rate.music += 2;
        }
        if (word === "игр" || word === "psp" || word === "xbox" || word === "game") {
            rate.games += 1;
        }
        if (word === "аним" || word === "anim" || word === "manga") {
            rate.anime += 2;
        }
        if (word === "софт" || word === "soft" || word === "утилит") {
            rate.software += 1;
        }
        if (word === "комикс") {
            rate.other += 1;
        }
        if (word === "документальные") {
            rate.dochumor += 3;
        }
        if (word === "спорт") {
            rate.sport += 1;
        }
        if (word === "докумел" || word === "телеп" || word === "тв " || word === "тв" || word === "тв-" || word === "tv" || word === "tv ") {
            rate.dochumor += 2;
        }
        if (word === "юмор") {
            rate.dochumor += 1;
        }
        if (word === "видео для моб" || word === "видео для смарт" || word === "видео для устр" || word === "Мобильное" || word === "3gp") {
            rate.other += 1;
        }
        return '';
    };
    var autosetCategory = function(quality, category) {
        /*
         * Алгоритм определения категории
         */
        var rate = var_cache.catRate = {films: 0, serials: 0, anime: 0, dochumor: 0, music: 0, games: 0, books: 0, cartoons: 0, software: 0, sport: 0, xxx: 0, other: 0, m: []};
        category.toLowerCase().replace(var_cache.cat_regexp, cal_cat_rate);
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
            var pos = ['serials', 'music', 'games', 'films', 'cartoons', 'books', 'software', 'anime', 'dochumor', 'sport', 'xxx', 'other'].indexOf(qual_cat[0][1]);
            if (pos === 11) {
                return -1;
            } else {
                return pos;
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
    var table_sort_insert_in_list = function(list) {
        var list_len = list.length;
        var indexs = var_cache.table_sort_pos.slice(0);
        var dune = false;
        var break_index = 0;
        for (var n = 0; n < list_len; n++) {
            if (dune === true) {
                break;
            }
            for (var i = break_index, item; item = list[i]; i++) {
                var id = item.id;
                var _id = indexs[i];
                if (_id === undefined) {
                    indexs.splice(i,0,id);
                    if (i === 0) {
                        dom_cache.result.append(item.node);
                    } else {
                        list[i-1].node.after(item.node);
                    }
                    _id = id;
                }
                if (id !== _id) {
                    var_cache.table_dom[_id].node.before(var_cache.table_dom[id].node);
                    indexs.splice(indexs.indexOf(id), 1);
                    indexs.splice(i, 0, id);
                    break_index = i;
                    break;
                }
                if (i === list_len - 1) {
                    dune = true;
                }
            }
        }
        var_cache.table_sort_pos = indexs;
    };
    var table_onsort = function (v_a, v_b) {
        var by = var_cache.table_sort_by;
        var a = v_a[var_cache.table_sort_colum];
        var b = v_b[var_cache.table_sort_colum];
        if (a === b) {
            return 0;
        } else if (a < b) {
            return  (by === 1) ? -1 : 1;
        } else {
            return (by === 1) ? 1 : -1;
        }
    };
    var table_sort = function(colum, by) {
        if (colum === undefined) {
            colum = 'quality';
        }
        if (by === undefined) {
            by = 0;
        }
        var_cache.table_sort_by = by;
        var_cache.table_sort_colum = colum;

        var sorted_list = var_cache.table_dom.slice(0);
        sorted_list.sort(table_onsort);
        table_sort_insert_in_list(sorted_list);
    };
    var arrUnique = function (value, index, self) {
        return self.indexOf(value) === index;
    };
    var calcKeywordFilter = function(title) {
        /*
         * фильтр по фразам в названии раздачи
         */
        //false - исключает отображение, true - включает
        if (var_cache.keywordFilter.exclude !== undefined) {
            var exc = title.match(var_cache.keywordFilter.exclude);
            if (exc !== null) {
                return false;
            }
        }
        if (var_cache.keywordFilter.include === undefined) {
            return true;
        }
        var inc = title.toLowerCase().match(var_cache.keywordFilter.include);
        if (inc === null) {
            return false;
        }
        return (inc.filter(arrUnique).length >= var_cache.keywordFilter.inc_len);
    };
    var calcSizeFilter = function(value) {
        var sizeFilter = var_cache.sizeFilter;
        return ((sizeFilter.from > 0 && value >= sizeFilter.from || sizeFilter.from <= 0) && ((sizeFilter.to > 0 && value <= sizeFilter.to) || (sizeFilter.to <= 0)));
    };
    var calcTimeFilter = function(value) {
        var timeFilter = var_cache.timeFilter;
        return ((timeFilter.from > 0 && value >= timeFilter.from || timeFilter.from <= 0) && ((timeFilter.to > 0 && value <= timeFilter.to) || (timeFilter.to <= 0)));
    };
    var calcSeedFilter = function(value) {
        var seedFilter = var_cache.seedFilter;
        return ((seedFilter.from > -1 && value >= seedFilter.from || seedFilter.from < 0) && ((seedFilter.to > -1 && value <= seedFilter.to) || (seedFilter.to < 0)));
    };
    var calcPeerFilter = function(value) {
        var peerFilter = var_cache.peerFilter;
        return ((peerFilter.from > -1 && value >= peerFilter.from || peerFilter.from < 0) && ((peerFilter.to > -1 && value <= peerFilter.to) || (peerFilter.to < 0)));
    };
    var itemFilter = function(item) {
        var filter = [0, 0, 0, 0, 0];
        if (var_cache.keywordFilter !== undefined) {
            var title = item.title;
            if (SubCategoryFilter && item.category !== undefined) {
                title += ' ' + item.category;
            }
            if (calcKeywordFilter(title)) {
                filter[0] = 1;
            }
        }
        if (var_cache.sizeFilter !== undefined) {
            if (calcSizeFilter(item.size)) {
                filter[1] = 1;
            }
        }
        if (var_cache.timeFilter !== undefined) {
            if (calcTimeFilter(item.time)) {
                filter[2] = 1;
            }
        }
        if (HideSeed === 0 && var_cache.seedFilter !== undefined) {
            if (calcSeedFilter(item.seeds)) {
                filter[3] = 1;
            }
        }
        if (HideLeech === 0 && var_cache.peerFilter !== undefined) {
            if (calcPeerFilter(item.leechs)) {
                filter[4] = 1;
            }
        }
        return filter;
    };
    var writeResult = function(id, result, request) {
        setTrackerLoadingState(1, id);
        var tracker = var_cache.trackers[id].tracker;
        if (tracker === undefined) {
            return;
        }
        if (request !== var_cache.currentRequest) {
            return;
        }
        var errors = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (var_cache.counter[id] === undefined) {
            var_cache.counter[id] = {}
        }
        var tr_count = 0;
        for (var i = 0, item; item = result[i]; i++) {
            if (itemCheck(item, errors) === 0) {
                console.error('Item in tracker ' + tracker.name + ' have critical problem! Torrent skipped!', item);
                continue;
            }
            if (HideZeroSeed === 1 && item.seeds === 0) {
                continue;
            }
            if (TeaserFilter === 1 && teaserFilter(item.title + item.category.title) === 1) {
                continue;
            }
            item.title = $.trim(item.title);
            if (item.category.title !== undefined) {
                item.category.title = $.trim(item.category.title);
            }
            var title_highLight = titleHighLight(item.title);
            var rate = title_highLight.rate;
            var quality = checkRate(rate, item);
            title_highLight = title_highLight.hl_name;
            if (item.category.id < 0 && item.category.title !== undefined) {
                item.category.id = autosetCategory(quality, item.category.title);
            }
            var item_id = var_cache.table_dom.length;
            var table_dom_item = {id: item_id, tracker: id, time: item.time, quality: quality.value, title: item.title, category: item.category.title, category_id: item.category.id, size: item.size, seeds: item.seeds, leechs: item.leechs};
            var filter = itemFilter(table_dom_item);
            table_dom_item.filter = filter.join(',');
            var td_icon = '';
            if (ShowIcons === 1) {
                td_icon = $('<div>', {'class': 'tracker_icon ' + tracker.class_name, title: tracker.name});
            }
            var td_category = '';
            if (item.category.title !== undefined) {
                if (item.category.url === undefined) {
                    td_category = $('<ul>').append(
                        $('<li>', {'class': 'category', text: item.category.title}).append(td_icon)
                    );
                } else {
                    td_category = $('<ul>').append(
                        $('<li>', {'class': 'category'}).append(
                            $('<a>', {href: item.category.url, target: "_blank", text: item.category.title}),
                            td_icon
                        )
                    );
                }
            }
            var td_download;
            if (item.dl !== undefined) {
                td_download = $('<td>', {'class': 'size'}).append(
                    $('<a>', {href: item.dl, target: '_blank', text: bytesToSize(item.size) + ' ↓'})
                );
            } else {
                td_download = $('<td>', {'class': 'size', text: bytesToSize(item.size)});
            }
            table_dom_item.node = $('<tr>', {'data-filter': table_dom_item.filter, 'data-tracker': tracker.class_name, 'data-category': item.category.id}).data('id', item_id).append(
                $('<td>', {'class': 'time', title: u2ddmmyyyy_title(item.time), text: u2timeago(item.time)}),
                $('<td>', {'class': 'quality'/*, 'data-value': quality.value, 'data-qgame': quality.game, 'data-qseed': quality.seed, 'data-qname': quality.name, 'data-qvideo': quality.video, 'data-qmusic': quality.music, 'data-qbook': quality.book*/}).append(
                    $('<div>', {'class': 'progress'}).append(
                        $('<div>').css('width', parseInt(quality.value / 15) + 'px'),
                        $('<span>', {title: quality.value, text: quality.value})
                    )
                ),
                $('<td>', {'class': 'name'}).append(
                    $('<div>', {'class': 'title'}).append(
                        $('<a>', {href: item.url, target: "_blank"}).append(title_highLight),
                        (item.category.title === undefined) ? td_icon : ''
                    ), td_category
                ),
                td_download,
                (HideSeed === 1) ? '' : $('<td>', {'class': 'seeds', text: item.seeds}),
                (HideLeech === 1) ? '' : $('<td>', {'class': 'leechs', text: item.leechs})
            );
            var_cache.table_dom.push(table_dom_item);
            if (var_cache.counter[id][item.category.id] === undefined) {
                var_cache.counter[id][item.category.id] = 0;
            }
            var_cache.counter[id][item.category.id]++;
            tr_count++;
        }
        var_cache.counter[id].count = tr_count;
        log_errors(tracker, errors);
        table_sort();
        updateCounts();
    };
    var checkForSymbol = function(char) {
        var code = char.charCodeAt(0);
        if (isNaN(code)) {
            return 1;
        }
        if (code > 126 || code < 31) {
            return 0;
        }
        if (code > 31 && code < 48) {
            return 1;
        }
        if (code > 57 && code < 65) {
            return 1;
        }
        if (code > 90 && code < 97) {
            return 1;
        }
        if (code > 122 && code < 127) {
            return 1;
        }
        return 0;
    };
    var cal_rate = function(word, position, string) {
        var rate = var_cache.syntax_rate;
        word = word.toLowerCase();
        //проверяет что это не фрагмент слова (проверка слева и справа)
        if (rate.m.indexOf(word) !== -1 || checkLeftRightSymbol(word, position, string) === false) {
            return '';
        }
        rate.m.push(word);
        if (rate.block.length === 0) {
            if (word === "blu-ray") {
                rate.video += 100;
                rate.block.push("video");
                rate.qbox = "Blu-ray";
            } else
            if (word === "bd-remux" || word === "bdremux") {
                rate.video += 90;
                rate.block.push("video");
                rate.qbox = "Remux";
            } else
            if (word === "bd-rip" || word === "bdrip" || word === "bdrip-avc") {
                rate.video += 80;
                rate.block.push("video");
                rate.qbox = "BDRip";
            } else
            if (word === "camrip" || word === "camrip-avc") {
                rate.video += 10;
                rate.block.push("video");
                rate.qbox = "CAMRip";
            } else
            if (word === "hdtv-rip" || word === "hdtvrip") {
                rate.video += 70;
                rate.block.push("video");
                rate.qbox = "HDTV-Rip";
            } else
            if (word === "dtheater-rip") {
                rate.video += 70;
                rate.block.push("video");
                rate.qbox = "DTheater-Rip";
            } else
            if (word === "lowhdrip") {
                rate.video += 10;
                rate.block.push("video");
                rate.qbox = "LowHDRip";
            } else
            if (word === "hdtv") {
                rate.video += 60;
                rate.block.push("video");
                rate.qbox = "HDTV";
            } else
            if (word === "hdrip" || word === "hdrip-avc") {
                rate.video += 60;
                rate.block.push("video");
                rate.qbox = "HDRip";
            } else
            if (word === "dvdrip" || word === "dvd-rip" || word === "dvdrip-avc") {
                rate.video += 60;
                rate.block.push("video");
                rate.qbox = "DVD-Rip";
            } else
            if (word === "dvd" || word === "dvd5" || word === "2xdvd9" || word === "dvd9" || word === "dvd-9" || word === "hd-dvd") {
                rate.video += 50;
                rate.block.push("video");
                rate.qbox = "DVD";
            } else
            if (word === "hqsatrip" || word === "hqrip" || word === "hqrip-avc") {
                rate.video += 44;
                rate.block.push("video");
                rate.qbox = "HDrip";
            } else
            if (word === "tvrip" || word === "iptvrip") {
                rate.video += 40;
                rate.block.push("video");
                rate.qbox = "TV-Rip";
            } else
            if (word === "webrip") {
                rate.video += 40;
                rate.block.push("video");
                rate.qbox = "WebRip";
            } else
            if (word === "web-dlrip-avc" || word === "webdl-rip" || word === "web-dlrip" || word === "web-dl") {
                rate.video += 40;
                rate.block.push("video");
                rate.qbox = "WEB-DL";
            } else
            if (word === "satrip") {
                rate.video += 40;
                rate.block.push("video");
                rate.qbox = "SAT-Rip";
            } else
            if (word === "dvb") {
                rate.video += 40;
                rate.block.push("video");
                rate.qbox = "DVB";
            } else
            if (word === "telesynch" || word === "ts") {
                rate.video += 20;
                rate.block.push("video");
                rate.qbox = "Telesync";
            }
            if (word === "dvdscr" || word === "dvdscreener") {
                rate.video += 20;
                rate.block.push("video");
                rate.qbox = "DVD-Screener";
            }
            if (word === "flac" || word === "alac" || word === "lossless") {
                rate.music += 100;
                rate.block.push("music");
                rate.qbox = "lossless";
            } else
            if (word === "mp3") {
                rate.music += 80;
                rate.qbox = "MP3";
            } else
            if (word === "ps3") {
                rate.game += 80;
                rate.block.push("game");
                rate.qbox = "PS3";
            } else
            if (word === "xbox") {
                rate.game += 80;
                rate.block.push("game");
                rate.qbox = "XBox";
            } else
            if (word === "(ps2)") {
                rate.game += 80;
                rate.block.push("game");
                rate.qbox = "PS2";
            } else
            if (word === "[p]" || word === "{p}" || word === "(p)") {
                rate.game += 20;
                rate.block.push("game");
                rate.qbox = "P";
            } else
            if (word === "repack" || word === "lossless repack" || word === "steam-rip" || word === "(lossy rip)" || word === "reloaded") {
                rate.game += 60;
                rate.block.push("game");
                rate.qbox = "RePack";
            } else
            if (word === "[native]") {
                rate.game += 100;
                rate.block.push("game");
                rate.qbox = "Native";
            } else
            if (word === "[rip]" || word === "{rip}" || word === "(rip)") {
                rate.game += 80;
                rate.block.push("game");
                rate.qbox = "Rip";
            } else
            if (word === "[l]" || word === "{l}" || word === "(l)") {
                rate.game += 100;
                rate.block.push("game");
                rate.qbox = "L";
            } else
            if (word === "лицензия") {
                rate.game += 100;
                rate.block.push("game");
                rate.qbox = "L";
            } else
            if (word === "fb2" || word === "pdf" || word === "dejvu" || word === "rtf" || word === "epub") {
                rate.book += 100;
                rate.block.push("book");
                rate.qbox = word;
            }
        }
        if (word === "h.264" || word === "h264" || word === "mp4" || word === "m4v") {
            rate.video += 2;
        } else
        if (word === "1080p" || word === "1080i") {
            rate.video += 20;
        } else
        if (word === "720p") {
            rate.video += 10;
        } else
        if (word === "звук с ts") {
            rate.video -= 50;
        } else
        if (word === "ст" || word === "sub" || word === "subs") {
            rate.video += 1;
        } else
        if (word === "itunes russia") {
            rate.video += 10;
        } else
        if (word === "dub" || word === "пд" || word === "по" || word === "дб" || word === "2xdub") {
            rate.video += 3;
        } else
        if (word === "пм") {
            rate.video += 2;
        } else
        if (word === "ап" || word === "ло" || word === "лд" || word === "vo") {
            rate.video += 1;
        } else
        if (word === "pc (windows)") {
            rate.game += 5;
        } else
        if (word === "сезон" || word === "season") {
            rate.serial++;
        } else
        if (word === "cue") {
            rate.music += 20;
        } else
        if (word === "soundtrack") {
            rate.music++;
        } else
        if (word === "32" && rate.m.indexOf('mp3') !== -1) {
            rate.music -= 2;
        } else
        if (word === "64" && rate.m.indexOf('mp3') !== -1) {
            rate.music += 0;
        } else
        if (word === "96" && rate.m.indexOf('mp3') !== -1) {
            rate.music += 2;
        } else
        if (word === "128" && rate.m.indexOf('mp3') !== -1) {
            rate.music += 5;
        } else
        if (word === "192" && rate.m.indexOf('mp3') !== -1) {
            rate.music += 10;
        } else
        if (word === "320" && rate.m.indexOf('mp3') !== -1) {
            rate.music += 15;
        } else
        if (word === "мультфильм") {
            rate.mult++;
        }
        return '';
    };
    var sub_select = function(name) {
        //выделяет то, что в скобках
        /*
         if (!_sub_select_enable) {
         return name;
         }
         */
        return name.replace(/(\[[^\]]*\]|\([^\)]*\))/g, '<span class="sub_name">$1</span>');
    };
    var syntaxCacheRequest = function(request) {
        var year = request.match(/[1-2]{1}[0-9]{3}/);
        if (year !== null) {
            year = Math.max.apply(Math, year);
            if (year > var_cache.year + 5) {
                year = null;
            }
            if (year < 1900) {
                year = null;
            }
        }
        var_cache.syntaxCache = {};
        var_cache.syntaxCache.normalize_request = $.trim(request).replace(/\s+/g, " ");
        var safe_regexp = var_cache.syntaxCache.normalize_request.replace(/([{})(\][\\\.^$\|\?\+])/g,"\\$1");
        var_cache.syntaxCache.words = safe_regexp.toLowerCase().split(' ');
        var_cache.syntaxCache.normalize_request_low = var_cache.syntaxCache.normalize_request.toLowerCase();
        var_cache.syntaxCache.words_len = var_cache.syntaxCache.words.length;
        var_cache.syntaxCache.words_is_regexp = new RegExp(var_cache.syntaxCache.words.join('|'), "ig");
        if (year !== null) {
            var_cache.syntaxCache.year = year;
            var_cache.syntaxCache.normalize_request_no_year = $.trim(var_cache.syntaxCache.normalize_request.replace(new RegExp('\\s?'+year+'\\s?','g'),' ').replace(/\s+/g, " "));
            var_cache.syntaxCache.normalize_request_no_year_low = var_cache.syntaxCache.normalize_request_no_year.toLowerCase();
        }
        var_cache.syntaxCache.word_rate = Math.round(200 / var_cache.syntaxCache.words_len);
        var_cache.syntaxCache.first_word_rate = Math.round( var_cache.syntaxCache.word_rate*1.25 );
    };
    var checkLeftRightSymbol = function(word, pos, string) {
        return (checkForSymbol(string[pos - 1] || '') !== 0 && checkForSymbol(string[pos + word.length] || '') !== 0);
    };
    var titleHighLight = function(name) {
        /*
         * Выставляет рейтинг заголовку раздачи
         * Подсвечивает найденный текст в заголовке
         */
        var words_len = var_cache.syntaxCache.words_len;
        var word_rate = var_cache.syntaxCache.word_rate;
        var first_word_rate = var_cache.syntaxCache.first_word_rate;
        var year = var_cache.syntaxCache.year;
        var rate = var_cache.syntax_rate = {name: 0, video: 0, game: 0, music: 0, serial: 0, book: 0, mult: 0, m: [], seed: 0, value: 0, year: 0, block: [], qbox: "+"};
        var name_low = name.toLowerCase();
        name.replace(var_cache.quality_regexp, cal_rate);
        if (var_cache.syntaxCache.normalize_request.length === 0) {
            return {
                hl_name: sub_select(name),
                rate: rate
            };
        }
        var exists_year = year !== undefined;
        var has_year = false;
        if (exists_year) {
            var year_pos = name.indexOf(year);
            if (year_pos !== -1) {
                has_year = checkLeftRightSymbol(year, year_pos, name);
            }
        }
        var has_fullName = -1;
        if (year !== undefined) {
            has_fullName = name.indexOf(var_cache.syntaxCache.normalize_request_no_year);
            if (has_fullName !== -1) {
                if (checkLeftRightSymbol(var_cache.syntaxCache.normalize_request_no_year, has_fullName, name) === false) {
                    has_fullName = -1;
                }
            }
        } else {
            has_fullName = name.indexOf(var_cache.syntaxCache.normalize_request);
            if (has_fullName !== -1) {
                if (checkLeftRightSymbol(var_cache.syntaxCache.normalize_request, has_fullName, name) === false) {
                    has_fullName = -1;
                }
            }
        }
        var pre_word;
        if (has_fullName > 0) {
            pre_word = $.trim(name.substr(0, has_fullName).replace(var_cache.rm_pre_tag_regexp, ''));
            if (pre_word.length === 0){
                has_fullName = 0;
            }
        }
        var has_fullLowName = -1;
        if (has_fullName === -1) {
            if (year !== undefined) {
                has_fullLowName = name_low.indexOf(var_cache.syntaxCache.normalize_request_no_year_low);
                if (has_fullLowName !== -1) {
                    if (checkLeftRightSymbol(var_cache.syntaxCache.normalize_request_no_year_low, has_fullLowName, name) === false) {
                        has_fullLowName = -1;
                    }
                }
            } else {
                has_fullLowName = name_low.indexOf(var_cache.syntaxCache.normalize_request_low);
                if (has_fullLowName !== -1) {
                    if (checkLeftRightSymbol(var_cache.syntaxCache.normalize_request_low, has_fullLowName, name) === false) {
                        has_fullLowName = -1;
                    }
                }
            }
            if (has_fullLowName > 0) {
                pre_word = $.trim(name_low.substr(0, has_fullLowName).replace(var_cache.rm_pre_tag_regexp, ''));
                if (pre_word.length === 0){
                    has_fullLowName = 0;
                }
            }
        }
        var rateSet = false;
        if (has_year === true) {
            if (has_fullName === 0 || has_fullLowName === 0) {
                rate.name = (words_len - 1) * word_rate + first_word_rate;
                rateSet = true;
            } else
            if (has_fullName !== -1 || has_fullLowName !== -1) {
                rate.name = words_len * word_rate;
                rateSet = true;
            }
        } else {
            if (has_fullName === 0 || has_fullLowName === 0) {
                rate.name = (words_len - 1) * word_rate + first_word_rate - ((exists_year)?word_rate:0);
                rateSet = true;
            } else
            if (has_fullName !== -1 || has_fullLowName !== -1) {
                rate.name = words_len * word_rate - ((exists_year)?word_rate:0);
                rateSet = true;
            }
        }
        var hl_name;
        if (rateSet) {
            hl_name = name.replace(var_cache.syntaxCache.words_is_regexp, function(word, position, string){
                if (checkLeftRightSymbol(word, position, string) === false) {
                    return word;
                }
                return '<b>'+word+'</b>';
            });
            return {
                hl_name: sub_select(hl_name),
                rate: rate
            };
        }
        var hl_word_count = 0;
        var year_found = 0;
        if (has_year) {
            hl_word_count += 1;
            rate.name += word_rate;
        }
        var cal_word_rate = function(word, position, string) {
            //функ-я подсвечивает слова поиска в заголовке
            //hl_word_count - счетчик подсвеченных слов
            //year_found - если 1 то значит год в названии найден
            if (checkLeftRightSymbol(word, position, string) === false) {
                return word;
            }
            if (hl_word_count < words_len) {
                if (year === word) {
                    year_found = 1;
                    return '<b>' + word + '</b>';
                }
                if (position === 0 && word.toLowerCase() === var_cache.syntaxCache.words[0]) {
                    rate.name += first_word_rate;
                } else {
                    rate.name += word_rate;
                }
            }
            hl_word_count++;
            return '<b>' + word + '</b>';
        };
        hl_name = name.replace(var_cache.syntaxCache.words_is_regexp, cal_word_rate);
        if (has_year && year_found === 0) {
            hl_name = hl_name.replace(new RegExp(year,'g'), cal_word_rate);
        }
        if (year_found === 1 && hl_word_count === 1) {
            rate.name = 0;
        }
        return {
            hl_name: sub_select(hl_name),
            rate: rate
        };
    };
    var bytesToSize = function(bytes, nan) {
        //переводит байты в строчки
        var sizes = _lang.size_list;
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
    var u2ddmmyyyy = function(shtamp) {
        //преврящает TimeShtamp в строчку
        var time = new Date(shtamp * 1000);
        var month = time.getMonth() + 1;
        if (month < 10) {
            month = '0'+month;
        }
        var date = time.getDate();
        if (date < 10) {
            date = '0'+date;
        }
        return date + '-' + month + '-' + time.getFullYear();
    };
    var u2ddmmyyyy_title = function(i) {
        if (i <= 0)
            return '∞';
        else
            return u2ddmmyyyy(i);
    };
    var u2hhmm = function(i) {
        var time = new Date(i * 1000);
        var hour = time.getHours();
        if (hour < 10) {
            hour = '0'+hour;
        }
        var minutes = time.getMinutes();
        if (minutes < 10) {
            minutes = '0'+minutes;
        }
        return hour + ':' + minutes;
    };
    var u2timeago = function(utime)
    {
        //выписывает отсчет времени из unixtime
        var now_time = Math.round((new Date()).getTime() / 1000);
        if (utime <= 0) {
            return '∞';
        }
        var i = now_time - utime;
        if (i < 0) {
            return u2ddmmyyyy(utime);
        }
        var day = Math.floor(i / 60 / 60 / 24);
        var week = Math.floor(day / 7);
        if (week > 0) {
            return u2ddmmyyyy(utime);
        }
        var day_sec = day * 60 * 60 * 24;
        var hour = Math.floor((i - day_sec) / 60 / 60);
        var minutes = Math.floor((i - day_sec - hour * 60 * 60) / 60);
        var seconds = Math.floor((i - day_sec - hour * 60 * 60 - minutes * 60));
        day = Math.floor(day - 7 * week);
        var str_day = ' ' + ((day < 5) ? (day < 2) ? (day < 1) ? _lang.times.day1 : _lang.times.day2 : _lang.times.day3 : _lang.times.day4);
        var str_hour = ' ' + ((hour < 5) ? (hour < 2) ? (hour < 1) ? _lang.times.hour1 : _lang.times.hour2 : _lang.times.hour3 : _lang.times.hour4);
        var str_minutes = ' ' + _lang.times.min;
        var str_seconds = ' ' + _lang.times.sec;
        var d_te = (new Date()).getDate();
        var t_te = (new Date(utime * 1000)).getDate();
        if (day === 0 && d_te !== t_te) {
            day = 1;
        }
        if (day > 0) {
            if (day === 1) {
                return _lang.times.yest + ' ' + u2hhmm(utime);
            } else {
                return day + str_day + ' ' + _lang.times.old;
            }
        }
        if (hour > 0) {
            if (hour > 1) {
                return _lang.times.today + ' ' + u2hhmm(utime);
            } else {
                return hour + str_hour + ' ' + _lang.times.old;
            }
        }
        if (minutes > 0) {
            return minutes + str_minutes + ' ' + _lang.times.old;
        }
        if (seconds > 0) {
            return seconds + str_seconds + ' ' + _lang.times.old;
        }
        return u2ddmmyyyy(utime);
    };
    var startFiltering = function() {
        var _filter = [0,0,0,0,0];
        var isEmpty = true;
        if (var_cache.keywordFilter !== undefined) {
            _filter[0] = 1;
            isEmpty = false;
        }
        if (var_cache.sizeFilter !== undefined) {
            _filter[1] = 1;
            isEmpty = false;
        }
        if (var_cache.timeFilter !== undefined) {
            _filter[2] = 1;
            isEmpty = false;
        }
        if (var_cache.seedFilter !== undefined) {
            _filter[3] = 1;
            isEmpty = false;
        }
        if (var_cache.peerFilter !== undefined) {
            _filter[4] = 1;
            isEmpty = false;
        }
        var _filter_string = var_cache.filter_string = _filter.join(',');
        for (var i = 0, item; item = var_cache.table_dom[i]; i++) {
            var filter = itemFilter(item);
            var filter_string = filter.join(',');
            item.filter = filter_string;
            item.node.attr('data-filter',item.filter);
        }
        dom_cache.body.children('style.filter').remove();
        if (isEmpty) {
            updateCounts();
            return;
        }
        dom_cache.body.append( $('<style>', {'class': 'filter', text: 'div.result_panel>table>tbody>tr:not([data-filter="'+_filter_string+'"]){display: none;}'}) );
        updateCounts();
    };
    var startFilterByCategory = function() {
        dom_cache.body.children('style.categoryFilter').remove();
        if (var_cache.currentCategory === undefined) {
            return;
        }
        dom_cache.body.append( $('<style>', {'class': 'categoryFilter', text: 'div.result_panel>table>tbody>tr:not([data-category="'+var_cache.currentCategory+'"]){display: none;}'}) );
    };
    var startFilterByTracker = function() {
        dom_cache.body.children('style.trackerFilter').remove();
        if (var_cache.currentTrackerList.length === 0) {
            updateCounts();
            return;
        }
        var classTrList = [];
        var_cache.currentTrackerList.forEach(function(key) {
            var className = var_cache.trackers[key].tracker.class_name;
            classTrList.push( ':not([data-tracker="'+className+'"])' );
        });
        dom_cache.body.append( $('<style>', {'class': 'trackerFilter', text: 'div.result_panel>table>tbody>tr'+classTrList.join('')+'{display: none;}'}) );
        updateCounts();
    };
    var writeCategory = function() {
        /*
         * загрузка списка категорий
         */
        var_cache.categorys = {};
        var categoryList = _lang.categorys;
        var content = [];
        var counter;
        var li;
        for (var i = 0, item; item = categoryList[i]; i++) {
            var id = item[0];
            counter = $('<i>', {text: 0});
            li = $('<li>', {text: item[1], 'class': 'hide'}).data('id', id).append(counter);
            var_cache.categorys[id] = { i: counter, li: li, count: 0, hide: 1 };
            content.push( li );
        }
        counter = $('<i>', {text: 0});
        li = $('<li>', {'class':'selected', text: _lang['cat_all']}).append(counter);
        var_cache.categorys[undefined] = { i: counter, li: li, count: 0, hide: 0 };
        content.unshift( li );
        dom_cache.categorys.append(content);
    };
    var updateCounts = function() {
        var filter = false;
        var tracker_filter = false;
        if (var_cache.filter_string !== '0,0,0,0,0') {
            filter = true;
        }
        if (var_cache.currentTrackerList.length !== 0) {
            tracker_filter = true;
        }
        var count_tr = {};
        var count_cat = {};
        if (tracker_filter === false && filter === false) {
            $.each(var_cache.counter, function(key, value) {
                count_tr[key] = value.count;
                $.each(value, function(category, count) {
                    if (count_cat[category] === undefined) {
                        count_cat[category] = 0;
                    }
                    count_cat[category] += count;
                });
            });
        } else {
            for (var i = 0, item; item = var_cache.table_dom[i]; i++) {
                if (filter === true && item.filter !== var_cache.filter_string) {
                    continue;
                }
                if (count_tr[item.tracker] === undefined) {
                    count_tr[item.tracker] = 0;
                }
                count_tr[item.tracker] += 1;
                if (tracker_filter === true && var_cache.currentTrackerList.indexOf(item.tracker) === -1) {
                    continue;
                }
                if (count_cat[item.category_id] === undefined) {
                    count_cat[item.category_id] = 0;
                }
                count_cat[item.category_id] += 1;
            }
        }
        $.each(var_cache.trackers, function(key, value) {
            if (count_tr[key] === undefined) {
                count_tr[key] = 0;
            }
            if (value.count !== count_tr[key]) {
                value.count = count_tr[key];
                value.i.text(count_tr[key]);
            }
        });
        var sum = 0;
        var swith = false;
        $.each(var_cache.categorys, function(key, value) {
            if (key === 'undefined') {
                return 1;
            }
            if (count_cat[key] === undefined) {
                count_cat[key] = 0;
            }
            sum += count_cat[key];
            if (value.count !== count_cat[key]) {
                value.count = count_cat[key];
                if (value.count === 0 && value.hide === 0) {
                    value.hide = 1;
                    value.li.addClass('hide');
                    if (value.li.hasClass('selected')) {
                        swith = true;
                    }
                } else if (value.count !== 0 && value.hide === 1) {
                    value.hide = 0;
                    value.li.removeClass('hide');
                }
                value.i.text(count_cat[key]);
            }
        });
        if (var_cache.categorys[undefined].count !== sum) {
            var_cache.categorys[undefined].count = sum;
            var_cache.categorys[undefined].i.text(sum);
        }
        if (swith === true) {
            var_cache.categorys[undefined].li.trigger('click');
        }
    };
    return {
        result: writeResult,
        auth: writeTrackerAuth,
        loadingStatus: setTrackerLoadingState,
        begin: function() {
            dom_cache.body = $('body');
            dom_cache.trackers_ul = $('ul.trackers');
            dom_cache.form_search = $('form[name="search"]');
            dom_cache.search_input = dom_cache.form_search.children('input[type="text"]');
            dom_cache.explore = $('div.explore');
            dom_cache.result_panel = $('div.result_panel');
            dom_cache.about_panel = dom_cache.result_panel.children('div.about_panel');
            dom_cache.result = dom_cache.result_panel.children('table').children('tbody');
            dom_cache.time_filter = $('.time_filter');
            dom_cache.time_filter_select = dom_cache.time_filter.find('select');
            dom_cache.word_filter = $('div.word_filter input');
            dom_cache.word_filter_btn = $('div.word_filter div.btn');
            dom_cache.categorys = $('ul.categorys');
            writeCategory();
            writeProfileList(engine.getProfileList());
            engine.loadProfile(undefined, writeTrackerList);
            dom_cache.categorys.on('click', 'li', function(e){
                e.preventDefault();
                var $this = $(this);
                var category = $this.data('id');
                if (var_cache.currentCategory === category) {
                    return;
                }
                dom_cache.categorys.find('li.selected').removeClass('selected');
                $this.addClass('selected');
                var_cache.currentCategory = category;
                startFilterByCategory();
            });
            dom_cache.trackers_ul.on('click','a', function(e) {
                e.preventDefault();
                var $this = $(this);
                var type = $this.data('tracker');
                var hasClass = $this.hasClass('selected');
                if (options.single_filter_mode) {
                    dom_cache.trackers_ul.find('a.selected').removeClass('selected');
                    var_cache.currentTrackerList = [];
                }
                if (hasClass) {
                    var_cache.currentTrackerList.splice(var_cache.currentTrackerList.indexOf(type), 1);
                    $this.removeClass('selected');
                } else {
                    var_cache.currentTrackerList.push(type);
                    $this.addClass('selected');
                }
                startFilterByTracker();
            });
            dom_cache.form_search.on('submit', function(e){
                e.preventDefault();
                search(dom_cache.search_input.val());
            });


            dom_cache.word_filter.keyup(function() {
                var value = $(this).val();
                var value_len = value.length;
                if (var_cache.keywordFilter === undefined) {
                    if (value_len === 0) {
                        return;
                    }
                    var_cache.keywordFilter = {
                        inc_len: 0,
                        include: undefined,
                        exclude: undefined
                    };
                }
                dom_cache.word_filter_btn.addClass('loading');
                if (value_len > 0) {
                    dom_cache.word_filter_btn.show();
                } else {
                    dom_cache.word_filter_btn.hide();
                }
                var exc = [];
                var inc = [];
                value = value.split((AdvFiltration === 0)?',':' ');
                var safe_item;
                for (var i = 0, item; item = value[i]; i++) {
                    if (item.length === 0) {
                        continue;
                    }
                    if (item.substr(0,1) === '-') {
                        safe_item = item.substr(1).replace(/([{})(\][\\\.^$\|\?\+])/g,"\\$1");
                        exc.push(safe_item);
                    } else {
                        safe_item = item.replace(/([{})(\][\\\.^$\|\?\+])/g,"\\$1");
                        inc.push(safe_item);
                    }
                }
                if (exc.length > 0) {
                    var_cache.keywordFilter.exclude = new RegExp(exc.join('|'), 'ig');
                }
                if (inc.length > 0) {
                    var_cache.keywordFilter.include =  new RegExp(inc.join('|'), 'ig');
                }
                if (AdvFiltration === 1) {
                    var_cache.keywordFilter.inc_len = 1;
                }
                if (AdvFiltration === 2) {
                    var_cache.keywordFilter.inc_len = inc.length;
                }
                if (inc.length === 0 && exc.length === 0) {
                    var_cache.keywordFilter = undefined;
                }
                clearTimeout(var_cache.filterTimer);
                var_cache.filterTimer = setTimeout(function() {
                    dom_cache.word_filter_btn.removeClass('loading');
                    startFiltering();
                }, var_cache.filterTimerValue);
            });
            dom_cache.word_filter_btn.on("click", function() {
                dom_cache.word_filter.val('').trigger('keyup');
            });
            $('div.size_filter').find('input').keyup(function() {
                if (var_cache.sizeFilter === undefined) {
                    var_cache.sizeFilter = {
                        from: 0,
                        to: 0
                    };
                }
                var value = parseFloat($(this).val());
                if (isNaN(value) || value < 0) {
                    value = 0;
                }
                value = value * 1024 * 1024 * 1024;
                var type = 1;
                if ($(this).attr('name') === "f_v") {
                    type = 0;
                }
                if (type === 1) {
                    var_cache.sizeFilter.to = value;
                } else {
                    var_cache.sizeFilter.from = value;
                }
                if ( var_cache.sizeFilter.from === 0 && var_cache.sizeFilter.to === 0) {
                    var_cache.sizeFilter = undefined;
                }
                clearTimeout(var_cache.filterTimer);
                var_cache.filterTimer = setTimeout(function() {
                    startFiltering();
                }, var_cache.filterTimerValue);
            }).on('dblclick', function() {
                $(this).val('').trigger('keyup');
            });
            dom_cache.time_filter.find('input').datepicker({
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
                        dom_cache.time_filter.find('input[name=end]').datepicker("option", "minDate", date);
                    } else {
                        dom_cache.time_filter.find('input[name=start]').datepicker("option", "maxDate", date);
                    }
                    var dateList = $('.time_filter').find('input');
                    var st = ex_kit.format_date(1, dateList.eq(0).val());
                    var en = ex_kit.format_date(1, dateList.eq(1).val());
                    if (en > 0) {
                        en += 60 * 60 * 24;
                    }
                    if (var_cache.timeFilter === undefined) {
                        var_cache.timeFilter = {
                            from: 0,
                            to: 0
                        };
                    }
                    var_cache.timeFilter.from = st;
                    var_cache.timeFilter.to = en;
                    if ( var_cache.timeFilter.from === 0 && var_cache.timeFilter.to === 0) {
                        var_cache.timeFilter = undefined;
                    }
                    startFiltering();
                }
            }).on('dblclick', function() {
                $(this).val('');
                var dateList = $('.time_filter').find('input');
                var st = ex_kit.format_date(1, dateList.eq(0).val());
                var en = ex_kit.format_date(1, dateList.eq(1).val());
                if (en > 0) {
                    en += 60 * 60 * 24;
                }
                if (var_cache.timeFilter === undefined) {
                    var_cache.timeFilter = {
                        from: 0,
                        to: 0
                    };
                }
                var_cache.timeFilter.from = st;
                var_cache.timeFilter.to = en;
                if ( var_cache.timeFilter.from === 0 && var_cache.timeFilter.to === 0) {
                    var_cache.timeFilter = undefined;
                }
                startFiltering();
            });
            dom_cache.time_filter_select.on('change', function() {
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
                if (var_cache.timeFilter === undefined) {
                    var_cache.timeFilter = {
                        from: 0,
                        to: 0
                    };
                }
                var_cache.timeFilter.from = utime;
                var_cache.timeFilter.to = 0;
                if ( var_cache.timeFilter.from === 0 && var_cache.timeFilter.to === 0) {
                    var_cache.timeFilter = undefined;
                }
                startFiltering();
            });
            $('div.seed_filter').find('input').keyup(function() {
                if (HideSeed) {
                    return;
                }
                if (var_cache.seedFilter === undefined) {
                    var_cache.seedFilter = {
                        from: -1,
                        to: -1
                    };
                }
                var value = parseInt($(this).val());
                if (isNaN(value) || value < 0) {
                    value = -1;
                }
                var type = 1;
                if ($(this).attr('name') === "start") {
                    type = 0;
                }
                if (type === 1) {
                    var_cache.seedFilter.to = value;
                } else {
                    var_cache.seedFilter.from = value;
                }
                if (var_cache.seedFilter.from === -1 && var_cache.seedFilter.to === -1) {
                    var_cache.seedFilter = undefined;
                }
                clearTimeout(var_cache.filterTimer);
                var_cache.filterTimer = setTimeout(function() {
                    startFiltering();
                }, var_cache.filterTimerValue);
            }).on('dblclick', function() {
                $(this).val('').trigger('keyup');
            });
            $('div.peer_filter').find('input').keyup(function() {
                if (HideLeech) {
                    return;
                }
                if (var_cache.peerFilter === undefined) {
                    var_cache.peerFilter = {
                        from: -1,
                        to: -1
                    };
                }
                var value = parseInt($(this).val());
                if (isNaN(value) || value < 0) {
                    value = -1;
                }
                var type = 1;
                if ($(this).attr('name') === "start") {
                    type = 0;
                }
                if (type === 1) {
                    var_cache.peerFilter.to = value;
                } else {
                    var_cache.peerFilter.from = value;
                }
                if (var_cache.peerFilter.from === -1 && var_cache.peerFilter.to === -1) {
                    var_cache.peerFilter = undefined;
                }
                clearTimeout(var_cache.filterTimer);
                var_cache.filterTimer = setTimeout(function() {
                    startFiltering();
                }, var_cache.filterTimerValue);
            }).on('dblclick', function() {
                $(this).val('').trigger('keyup');
            });
            $('input.sbutton.main').on("click", function() {
                home();
            });
            $('input.sbutton.history').on("click", function() {
                window.location = 'history.html';
            });
        }
    }
}();
$(function(){
    if (torrent_lib_min === 0) {
        setTimeout(function(){
            view.begin();
        }, 100);
    } else {
        view.begin();
    }
});