var view = function() {
    /**
     * @namespace $
     */
    var var_cache = {
        year: (new Date()).getFullYear(),
        syntaxCache: {},
        quality_regexp: new RegExp("Blu-ray|Blu-Ray|BD-Remux|BDRemux|2160p|2160i|1080p|1080i|BDRip-AVC|BD-Rip|BDRip|CAMRip|" +
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
        found_parenthetical: new RegExp('(\\[[^\\]]*\\]|\\([^\\)]*\\)|\\{[^\\}]*\\})','g'),
        text2safe_regexp_text: new RegExp('([{})(\\][\\\\\\.^$\\|\\?\\+])','g'),
        rm_retry: new RegExp('<\\/span>(.?)<span class="sub_name">|<\\/b>(.?)<b>', 'g'),
        rm_spaces: new RegExp('\\s+','g'),
        long_string: new RegExp('[^\\s]{100,}'),
        split_long_string: new RegExp('.{0,100}', 'g'),
        teaser_regexp: new RegExp('Трейлер|Тизер|Teaser|Trailer','i'),
        rn: new RegExp('[\\r\\n]+','g'),
        getYear: new RegExp('[1-2]{1}[0-9]{3}'),

        serachBBold: new RegExp('\\&lt;(/?)b\\&gt;','gm'),
        serachBreketsL: new RegExp('<','gm'),
        serachBreketsR: new RegExp('>','gm'),

        // массив содержащий всю информацию и dom элемент торрентов
        table_dom: [],
        // сортировка по возрастанию или убыванию
        table_sort_by: 0,
        // столбец для сортировки
        table_sort_colum: 'quality',
        // массив содержащий текущий порядок списка
        table_sort_pos: [],
        // фильтр времени
        timeFilter: undefined,
        // фильтр по размеру
        sizeFilter: undefined,
        // фильтр по словам
        keywordFilter: undefined,
        // фильтр по сидам
        seedFilter: undefined,
        // фильтр по пирам
        peerFilter: undefined,
        // таймер до наступления фильтрации списка
        filterTimer: undefined,
        // Время таймера фильтрации
        filterTimerValue: 250,
        // список трекеров профиля
        trackers: {},
        // текущий запрос
        currentRequest: undefined,
        // массив с выделенными трекерами
        currentTrackerList: [],
        // текущая категория
        currentCategory: undefined,
        // кэш категорий
        categorys: {},
        // фильтр стиль
        filter_string: '0,0,0,0,0',
        // счетчик
        counter: {},
        // таймер при скроле
        window_scroll_timer: undefined,
        // xhr для автозаполнения
        suggest_xhr: undefined,
        // режим Home - 0 или Search - 1 , -1 undefined
        pageMode: -1,
        // стутус таблицы очищина или нет
        tableIsEmpty: 1,
        // испория переходов
        click_history: {},
        // кэш location, fix bug with popstate, when script don't loaded.
        oldlocationHash: '',
        // bg mode switch
        backgroundMode: undefined,
        time_cache: undefined,
        click_history_limit: 10,
        click_history_item_limit: 20,
        // сдвиг списка трекеров сверху
        tracker_ui_offset_top: undefined
    };
    var settings = {};
    var dom_cache = {};
    var table_colums = [];
    var options = {
        single_filter_mode: true
    };

    var currentProfile = undefined;

    var writeTrackerList = function(_currentProfile) {
        currentProfile = _currentProfile;
        dom_cache.profileList.children('option[value="'+_currentProfile+'"]').prop('selected', true);
        var_cache.trackers = {};
        dom_cache.tracker_list.empty();
        dom_cache.body.children('style.tracker_icons').remove();
        var items = [];
        var style = '';

        engine.profileList[_currentProfile].forEach(function(trackerName) {
            var torrent = torrent_lib[trackerName];
            if (!torrent) {
                console.log('torrent not found!', trackerName);
                return 1;
            }
            if (!torrent.class_name) {
                torrent.class_name = trackerName.replace(/[^A-Za-z0-9]/g, '_');
            }
            var icon = $('<div>', {'class': 'tracker_icon '+torrent.class_name});
            var i = $('<i>', {text: 0});
            var link = $('<a>', {href: '#', text: torrent.name}).data('tracker', trackerName);
            var li = $('<li>').append(icon, link, i);
            var_cache.trackers[trackerName] = {icon: 1, link: link, i: i, count: 0, count_val: 0, tracker: torrent, li: li, auth: 1};
            items.push( li );
            var icon_style;
            if (!torrent.icon) {
                icon_style = 'background-color:#ddd;border-radius: 8px;';
            } else
            if (torrent.icon[0] === '#') {
                icon_style = 'background-color:'+torrent.icon+';border-radius: 8px;';
            } else {
                icon_style = 'background-image:url('+torrent.icon+');';
            }
            style += 'div.tracker_icon.'+torrent.class_name+'{'+icon_style+'}';
        });
        dom_cache.tracker_list.append(items);
        dom_cache.body.append($('<style>', {'class':'tracker_icons', text: style}));
        mono.storage.set({currentProfile: _currentProfile});
    };

    var writeProfileList = function(profileList) {
        dom_cache.profileList.empty();
        var optionList = [];
        $.each(profileList, function(key) {
            optionList.push( $('<option>', {text: key, value: key}) );
        });
        dom_cache.profileList.append( optionList );
        dom_cache.profileList.append( $('<option>', {'data-service': 'new', text: _lang.word_add}) );
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
            var $auth_ul = $('<ul>').append( $('<li>').append(
                $('<div>',{'class': 'tracker_icon login'}),
                $('<a>', {href: gui.tracker.login_url, target: '_blank', text: _lang.btn_login})
            ) );
            gui.li.append( $auth_ul );
            if (engine.settings.torrentListHeight === 1) {
                scrool_to($auth_ul);
            }
        } else {
            var_cache.trackers[id].li.children('ul').remove();
        }
        gui.auth = state;
    };
    var scrool_to = function(el) {
        /*
         * Скролит до конкретного элемента.
         */
        if (el.offset() === undefined) {
            return;
        }
        dom_cache.tracker_list.scrollTop(el.offset().top + dom_cache.tracker_list.scrollTop() - (dom_cache.tracker_list.height() / 2) - var_cache.tracker_ui_offset_top);
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
            dom_cache.body.append( $('<style>', {'class': 'icon_'+gui.tracker.class_name, text: 'ul.trackers>li>div.tracker_icon.'+gui.tracker.class_name+'{background:url(images/error.png) no-repeat center center #fff;}'}) );
        } else if (state === 0) {
            dom_cache.body.append( $('<style>', {'class': 'icon_'+gui.tracker.class_name, text: 'ul.trackers>li>div.tracker_icon.'+gui.tracker.class_name+'{background:url(images/loading.gif) no-repeat center center #fff;}'}) );
        }
        gui.icon = state;
    };
    var clear_table = function() {
        /*
         * очищает результаты поиска, сбрасывает все в ноль
         */
        if (var_cache.tableIsEmpty === 1) {
            return;
        }
        var_cache.tableIsEmpty = 1;
        dom_cache.result_table_body.get(0).textContent = '';
        dom_cache.request_desc_container.get(0).textContent = '';
        var_cache.table_dom = [];
        var_cache.table_sort_pos = [];
        var_cache.counter = {};
        updateCounts();
        clear_filters();
    };
    var homeMode = function() {
        if (var_cache.pageMode === 0) {
            return;
        }
        var_cache.pageMode = 0;
        dom_cache.result_container.hide();
        clear_table();
        var_cache.currentRequest = undefined;
        dom_cache.search_input.val('').trigger('keyup');
        engine.stop();
        explore.show();
    };
    var searchMode = function() {
        if (var_cache.pageMode === 1) {
            return;
        }
        var_cache.pageMode = 1;
        explore.hide();
        dom_cache.result_container.show();
    };
    var search = function(request) {
        if (var_cache.backgroundMode !== undefined) {
            var_cache.backgroundMode = undefined;
            var_cache.time_cache = undefined;
            var_cache.tableIsEmpty = 0;
        }
        clear_table();
        if (engine.settings.allowGetDescription === 1) {
            explore.getDescription(request);
        }
        var_cache.tableIsEmpty = 0;
        searchMode();
        syntaxCacheRequest(request);
        dom_cache.search_input.autocomplete( "close" );
        dom_cache.search_input.autocomplete( "disable" );
        engine.stop();
        var trackerList = var_cache.currentTrackerList.slice(0);
        if (trackerList.length === 0) {
            for (var key in var_cache.trackers) {
                trackerList.push(key);
            }
        }
        engine.search(request, trackerList);
        var_cache.currentRequest = request;
        setPage(request);
        setTimeout(function() {
            dom_cache.search_input.autocomplete( "enable" );
        }, 1000);
    };
    var getQuality = function(request, type, index) {
        var_cache.backgroundMode = {type: type, index: index};
        var_cache.time_cache = undefined;
        var_cache.table_dom = [];
        var_cache.counter = {};
        updateCounts();
        syntaxCacheRequest(request);
        var trackerList = [];
        if (trackerList.length === 0) {
            for (var key in var_cache.trackers) {
                trackerList.push(key);
            }
        }
        engine.stop();
        engine.search(request, trackerList, 1);
        var_cache.currentRequest = request;
        ga('send', 'event', 'Quality', 'keyword', request);
    };
    var blankPage = function(noClearTrackerFilters){
        homeMode();
        clear_filters();
        if (noClearTrackerFilters === undefined) {
            clear_tracker_filter();
        }
        dom_cache.search_input.focus();
        setPage(undefined);
    };
    var itemCheck = function(item, er) {
        /*
         * Проверка тестов
         */
        if (typeof (item.title) !== 'string' || typeof (item.url) !== 'string' || item.title.length === 0 || item.url.length === 0) {
            return 0;
        } else {
            if (item.title.indexOf('\n') !== -1) {
                item.title = item.title.replace(var_cache.rn, ' ');
            }
            if (item.url.indexOf('#block') !== -1) {
                item.url = engine.contentUnFilter(item.url);
            }
            if (item.title.indexOf('#block') !== -1) {
                item.title = engine.contentUnFilter(item.title);
            }
            var isLongTitle = var_cache.long_string.test(item.title);
            if (isLongTitle === true) {
                item.title = item.title.match(var_cache.split_long_string).join(' ');
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
        } else {
            if (item.category.title.indexOf('\n') !== -1) {
                item.category.title = item.category.title.replace(var_cache.rn, ' ');
            }
            if (item.category.title.indexOf('#block') !== -1) {
                item.category.title = engine.contentUnFilter(item.category.title);
            }
            var isLongTitle = var_cache.long_string.test(item.category.title);
            if (isLongTitle === true) {
                item.category.title = item.category.title.match(var_cache.split_long_string).join(' ');
            }
        }
        if (typeof item.category.url !== 'string' || item.category.url.length === 0) {
            item.category.url = undefined;
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
        if (Math.max.apply(null,er) === 0) {
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
        return ((var_cache.teaser_regexp).test(title)) ? 1 : 0;
    };
    var checkRate = function(quality, v) {
        /*
         * Расчет качетсва по сидам
         * Перерасчет соотношения качества видео и размера раздачи
         */

        //(v.seeds > 50) ? 70 : (v.seeds > 30) ? 50 : (v.seeds > 20) ? 40 : (v.seeds > 10) ? 30 :
        quality.seed = (v.seeds > 0) ? 50 : 0;
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
                        dom_cache.result_table_body.append(item.node);
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
            colum = var_cache.table_sort_colum;
        }
        if (by === undefined) {
            by = var_cache.table_sort_by;
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
            if (engine.settings.subCategoryFilter && item.category !== undefined) {
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
        if (engine.settings.hideSeedColumn === 0 && var_cache.seedFilter !== undefined) {
            if (calcSeedFilter(item.seeds)) {
                filter[3] = 1;
            }
        }
        if (engine.settings.hidePeerColumn === 0 && var_cache.peerFilter !== undefined) {
            if (calcPeerFilter(item.leechs)) {
                filter[4] = 1;
            }
        }
        return filter;
    };
    var arraySortBy = function(arr, by) {
        arr.sort(function(a,b){
            if (a[by] === b[by]) {
                return 0;
            } else
            if (a[by] > b[by]) {
                return -1;
            }
            return 1;
        });
        return arr;
    };
    var sendTop5 = function(){
        var_cache.table_dom = arraySortBy(var_cache.table_dom, 'time');
        var_cache.table_dom = arraySortBy(var_cache.table_dom, 'quality');
        var items = [];
        var count = 0;
        var min_name_rate = 210;
        for (var i = 0, item; item = var_cache.table_dom[i]; i++) {
            if (count > 4) {
                break;
            }
            if (item.quality_obj.name < min_name_rate) {
                continue;
            }
            items.push(item);
            count++;
        }
        items = $.extend(true,[],items);
        for (var i = 0, item; item = items[i]; i++) {
            item.hlTitle += ', '+item.sizeText;
            delete item.time;
            delete item.category_id;
            delete item.quality_obj;
            delete item.sizeText;
        }
        explore.setQuality(var_cache.backgroundMode.type, var_cache.backgroundMode.index, items, var_cache.currentRequest);
    };
    var bgReadResult = function(id, result, request) {
        var tracker = var_cache.trackers[id].tracker;
        if (tracker === undefined) {
            return;
        }
        var errors = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        var tr_count = 0;
        if (var_cache.time_cache === undefined) {
            var now_data = (new Date);
            var current_time = now_data.getTime() / 1000;
            var_cache.time_cache = {};
            var_cache.time_cache.year = now_data.getFullYear();
            var_cache.time_cache.year_ago = current_time - 365*24*60*60;
            var_cache.time_cache.half_year_ago = current_time - 180*24*60*60;
            var_cache.time_cache.month_ago = current_time - 30*24*60*60;
            var_cache.time_cache.week_ago = current_time - 7*24*60*60;
        }
        for (var i = 0, item; item = result[i]; i++) {
            if (itemCheck(item, errors) === 0) {
                console.error('Item in tracker ' + tracker.name + ' have critical problem! Torrent skipped!', item);
                continue;
            }
            if (teaserFilter(item.title + item.category.title) === 1) {
                continue;
            }
            item.title = $.trim(item.title);
            if (item.category.title !== undefined) {
                item.category.title = $.trim(item.category.title);
            }
            var title_highLight = titleHighLight(item.title);
            var rate = title_highLight.rate;
            rate.music = 0;
            var quality = checkRate(rate, item);

            if (var_cache.syntaxCache.year === undefined) {
                if (item.time > var_cache.time_cache.week_ago) {
                    quality.value += 60;
                } else if (item.time > var_cache.time_cache.month_ago) {
                    quality.value += 30;
                } else if (item.time > var_cache.time_cache.half_year_ago) {
                    quality.value += 10;
                } else if (item.time > var_cache.time_cache.year_ago) {
                    quality.value += 0;
                }
            }
            title_highLight = title_highLight.hl_name;
            if (item.category.id < 0 && item.category.title !== undefined) {
                item.category.id = autosetCategory(quality, item.category.title);
            }
            var table_dom_item = {qualityBox: quality.qbox, time: item.time, quality_obj: quality, quality: quality.value, url: item.url, hlTitle: title_highLight, sizeText: bytesToSize(item.size), category_id: item.category.id};
            var_cache.table_dom.push(table_dom_item);
            if (var_cache.counter[id][item.category.id] === undefined) {
                var_cache.counter[id][item.category.id] = 0;
            }
            var_cache.counter[id][item.category.id]++;
            tr_count++;
        }
        var_cache.counter[id].count = tr_count;
        log_errors(tracker, errors);
        updateCounts();
        sendTop5();
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
            var_cache.counter[id] = {};
        }
        if (var_cache.backgroundMode !== undefined) {
            bgReadResult(id, result, request);
            return;
        }
        var tr_count = 0;
        for (var i = 0, item; item = result[i]; i++) {
            if (itemCheck(item, errors) === 0) {
                console.error('Item in tracker ' + tracker.name + ' have critical problem! Torrent skipped!', item);
                continue;
            }
            if (engine.settings.hideZeroSeed === 1 && item.seeds === 0) {
                continue;
            }
            if (engine.settings.enableTeaserFilter === 1 && teaserFilter(item.title + item.category.title) === 1) {
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
            if (engine.settings.defineCategory === 1 && item.category.id < 0 && item.category.title !== undefined) {
                item.category.id = autosetCategory(quality, item.category.title);
            }
            var item_id = var_cache.table_dom.length;
            var table_dom_item = {id: item_id, tracker: id, time: item.time, quality: quality.value, title: item.title, category: item.category.title, category_id: item.category.id, size: item.size, seeds: item.seeds, leechs: item.leechs};
            var filter = itemFilter(table_dom_item);
            table_dom_item.filter = filter.join(',');
            var td_icon = '';
            if (engine.settings.hideTrackerIcons === 0) {
                td_icon = $('<div>', {'class': 'tracker_icon ' + tracker.class_name, title: tracker.name});
            }
            var td_category = '';
            if (item.category.title !== undefined) {
                if (item.category.url === undefined) {
                    td_category = $('<div>', {'class': 'category', text: item.category.title}).append(td_icon);
                } else {
                    td_category = $('<div>', {'class': 'category'}).append(
                        $('<a>', {href: item.category.url, target: "_blank", text: item.category.title}),
                        td_icon
                    );
                }
            }
            var td_download;
            if (item.dl !== undefined) {
                var isBlank = engine.settings.noBlankPageOnDownloadClick !== 1;//(item.dl.substr(0, 7).toLowerCase() !== 'magnet:');
                td_download = $('<td>', {'class': 'size'}).append(
                    $('<div>').append( $('<a>', {href: item.dl, target: (isBlank === true)?'_blank':'', text: bytesToSize(item.size) + ' ↓'}) )
                );
            } else {
                td_download = $('<td>', {'class': 'size'}).append( $('<div>', {text: bytesToSize(item.size)}) );
            }
            table_dom_item.node = $('<tr>', {'data-filter': table_dom_item.filter, 'data-tracker': tracker.class_name, 'data-category': item.category.id}).data('id', item_id).append(
                $('<td>', {'class': 'time', title: u2ddmmyyyy_title(item.time)}).append( $('<div>', {text: u2timeago(item.time)}) ),
                $('<td>', {'class': 'quality'/*, 'data-value': quality.value, 'data-qgame': quality.game, 'data-qseed': quality.seed, 'data-qname': quality.name, 'data-qvideo': quality.video, 'data-qmusic': quality.music, 'data-qbook': quality.book*/}).append(
                    $('<div>', {'class': 'progress'}).append(
                        $('<div>').css('width', parseInt(quality.value / 15) + 'px').append(
                            $('<span>', {title: quality.value, text: quality.value})
                        )
                    )
                ),
                $('<td>', {'class': 'title'}).append(
                    $('<div>', {'class': 'title'}).append(
                        $('<span>').append(
                            $('<a>', {href: item.url, target: "_blank"}).append(title_highLight)
                        ), (item.category.title === undefined) ? td_icon : ''
                    ), td_category
                ),
                td_download,
                (engine.settings.hideSeedColumn === 1) ? '' : $('<td>', {'class': 'seeds'}).append( $('<div>', {text: item.seeds}) ),
                (engine.settings.hidePeerColumn === 1) ? '' : $('<td>', {'class': 'leechs'}).append( $('<div>', {text: item.leechs}) )
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
    var checkForSymbol = function(_char) {
        var code = _char.charCodeAt(0);
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
        if (code === 171 || code === 187) {
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
            if (word === "hd-dvd") {
                rate.video += 68;
                rate.block.push("video");
                rate.qbox = "DVD";
            } else
            if (word === "2xdvd9") {
                rate.video += 65;
                rate.block.push("video");
                rate.qbox = "DVD";
            } else
            if (word === "dvd9" || word === "dvd-9") {
                rate.video += 62;
                rate.block.push("video");
                rate.qbox = "DVD";
            } else
            if (word === "dvd" || word === "dvd5") {
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
        if (word === "2160p" || word === "2160i") {
            rate.video += 20;
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
    var angleSelect = function(name) {
        "use strict";
        if (name.indexOf('&lt;') === -1 || name.indexOf('&gt;') === -1) {
            return name;
        }
        var charStart = undefined;
        var charEnd = undefined;
        for (var i = 35; i < 48; i++) {
            var specChar = String.fromCharCode(i);
            if (name.indexOf( specChar ) === -1) {
                if (charStart === undefined) {
                    charStart = specChar;
                } else
                if (charEnd === undefined) {
                    charEnd = specChar;
                } else {
                    break;
                }
            }
        }
        if (charStart === undefined || charEnd === undefined) {
            return name;
        }
        name = name.replace(/&lt;/g, charStart);
        name = name.replace(/&gt;/g, charEnd);
        var cacheName = 'sebSelectAngleCache_'+charStart+'_'+charEnd;
        if (var_cache[cacheName] === undefined) {
            var_cache[cacheName] = new RegExp('(\\' + charStart + '[^\\' + charEnd + ']*\\' + charEnd + ')', 'g');
        }
        if (var_cache[cacheName+'AngleStart'] === undefined) {
            var_cache[cacheName+'AngleStart'] = new RegExp('\\' + charStart, 'g');
        }
        if (var_cache[cacheName+'AngleEnd'] === undefined) {
            var_cache[cacheName+'AngleEnd'] = new RegExp('\\' + charEnd, 'g');
        }
        name = name.replace(var_cache[cacheName], '<span class="sub_name">$1</span>');
        name = name.replace(var_cache[cacheName+'AngleStart'], '&lt;');
        name = name.replace(var_cache[cacheName+'AngleEnd'], '&gt;');
        return name;
    };
    var sub_select = function(name) {
        //выделяет то, что в скобках
        name = name.replace(var_cache.rm_retry,'$1$2');

        name = name.replace(var_cache.serachBreketsL, '&lt;');
        name = name.replace(var_cache.serachBreketsR, '&gt;');
        name = name.replace(var_cache.serachBBold, '<$1b>');

        if (engine.settings.enableHighlight === 0) {
            return name;
        }
        name = angleSelect(name);
        name = name.replace(var_cache.found_parenthetical, '<span class="sub_name">$1</span>');
        return name.replace(var_cache.rm_retry,'$1$2');
    };
    var syntaxCacheRequest = function(request) {
        var year = request.match(var_cache.getYear);
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
        var_cache.syntaxCache.normalize_request = $.trim(request).replace(var_cache.rm_spaces, " ");
        var_cache.syntaxCache.normalize_request_len = var_cache.syntaxCache.normalize_request.length;
        var safe_regexp = var_cache.syntaxCache.normalize_request.replace(var_cache.text2safe_regexp_text,"\\$1");
        var_cache.syntaxCache.words = safe_regexp.toLowerCase().split(' ');
        var_cache.syntaxCache.normalize_request_low = var_cache.syntaxCache.normalize_request.toLowerCase();
        var_cache.syntaxCache.normalize_request_low_len = var_cache.syntaxCache.normalize_request_low.length;
        var_cache.syntaxCache.words_len = var_cache.syntaxCache.words.length;
        var_cache.syntaxCache.words_is_regexp = new RegExp(var_cache.syntaxCache.words.join('|'), "ig");
        if (year !== null) {
            var_cache.syntaxCache.year = year;
            var_cache.syntaxCache.normalize_request_no_year = $.trim(var_cache.syntaxCache.normalize_request.replace(new RegExp('\\s?'+year+'\\s?','g'),' ').replace(var_cache.rm_spaces, " "));
            var_cache.syntaxCache.normalize_request_no_year_len = var_cache.syntaxCache.normalize_request_no_year.length;
            var_cache.syntaxCache.normalize_request_no_year_low = var_cache.syntaxCache.normalize_request_no_year.toLowerCase();
            var_cache.syntaxCache.normalize_request_no_year_low_len = var_cache.syntaxCache.normalize_request_no_year_low.length;
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
        var bonus = 0;
        var words_len = var_cache.syntaxCache.words_len;
        var word_rate = var_cache.syntaxCache.word_rate;
        var bonus_value = Math.round(word_rate / 2);
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
        var symbol;
        var has_fullName = -1;
        if (year !== undefined) {
            has_fullName = name.indexOf(var_cache.syntaxCache.normalize_request_no_year);
            if (has_fullName !== -1) {
                if (checkLeftRightSymbol(var_cache.syntaxCache.normalize_request_no_year, has_fullName, name) === false) {
                    has_fullName = -1;
                }
            }
            if (has_fullName !== -1) {
                symbol = name[has_fullName+var_cache.syntaxCache.normalize_request_no_year_len+1];
                if ( symbol === '/' || symbol === '(' || symbol === '|') {
                    bonus += bonus_value;
                }
            }
        } else {
            has_fullName = name.indexOf(var_cache.syntaxCache.normalize_request);
            if (has_fullName !== -1) {
                if (checkLeftRightSymbol(var_cache.syntaxCache.normalize_request, has_fullName, name) === false) {
                    has_fullName = -1;
                }
            }
            if (has_fullName !== -1) {
                symbol = name[has_fullName+var_cache.syntaxCache.normalize_request_len+1];
                if ( symbol === '/' || symbol === '(' || symbol === '|') {
                    bonus += bonus_value;
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
                if (has_fullLowName !== -1) {
                    symbol = name_low[has_fullLowName+var_cache.syntaxCache.normalize_request_no_year_low_len+1];
                    if ( symbol === '/' || symbol === '(' || symbol === '|') {
                        bonus += bonus_value;
                    }
                }
            } else {
                has_fullLowName = name_low.indexOf(var_cache.syntaxCache.normalize_request_low);
                if (has_fullLowName !== -1) {
                    if (checkLeftRightSymbol(var_cache.syntaxCache.normalize_request_low, has_fullLowName, name) === false) {
                        has_fullLowName = -1;
                    }
                }
                if (has_fullLowName !== -1) {
                    symbol = name_low[has_fullLowName+var_cache.syntaxCache.normalize_request_low_len+1];
                    if ( symbol === '/' || symbol === '(' || symbol === '|') {
                        bonus += bonus_value;
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
                rate.name = (words_len - 1) * word_rate + first_word_rate + bonus;
                rateSet = true;
            } else
            if (has_fullName !== -1 || has_fullLowName !== -1) {
                rate.name = words_len * word_rate + bonus;
                rateSet = true;
            }
        } else {
            if (has_fullName === 0 || has_fullLowName === 0) {
                rate.name = (words_len - 1) * word_rate + first_word_rate - ((exists_year)?word_rate:0) + bonus;
                rateSet = true;
            } else
            if (has_fullName !== -1 || has_fullLowName !== -1) {
                rate.name = words_len * word_rate - ((exists_year)?word_rate:0) + bonus;
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
        if (nan === undefined)
            nan = 'n/a';
        if (bytes <= 0)
            return nan;
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i === 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + _lang['size_list_'+i];
        }
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + _lang['size_list_'+i];
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
    var u2timeago = function(utime) {
        //выписывает отсчет времени из unixtime
        var now_time = Math.round(Date.now() / 1000);
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
        var str_day = ' ' + ((day < 5) ? (day < 2) ? (day < 1) ? _lang.time_day1 : _lang.time_day2 : _lang.time_day3 : _lang.time_day4);
        var str_hour = ' ' + ((hour < 5) ? (hour < 2) ? (hour < 1) ? _lang.time_hour1 : _lang.time_hour2 : _lang.time_hour3 : _lang.time_hour4);
        var str_minutes = ' ' + _lang.time_min;
        var str_seconds = ' ' + _lang.time_sec;
        var d_te = (new Date()).getDate();
        var t_te = (new Date(utime * 1000)).getDate();
        if (day === 0 && d_te !== t_te) {
            day = 1;
        }
        if (day > 0) {
            if (day === 1) {
                return _lang.time_yest + ' ' + u2hhmm(utime);
            } else {
                return day + str_day + ' ' + _lang.time_old;
            }
        }
        if (hour > 0) {
            if (hour > 1) {
                return _lang.time_today + ' ' + u2hhmm(utime);
            } else {
                return hour + str_hour + ' ' + _lang.time_old;
            }
        }
        if (minutes > 0) {
            return minutes + str_minutes + ' ' + _lang.time_old;
        }
        if (seconds > 0) {
            return seconds + str_seconds + ' ' + _lang.time_old;
        }
        return u2ddmmyyyy(utime);
    };
    var startFiltering = function() {
        if (var_cache.backgroundMode !== undefined) {
            return;
        }
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
            item.filter = filter.join(',');
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
        var categoryList = [
            [3, _lang.categoryFilms],
            [0, _lang.categorySerials],
            [7, _lang.categoryAnime],
            [8, _lang.categoryDocHum],
            [1, _lang.categoryMusic],
            [2, _lang.categoryGames],
            [5, _lang.categoryBooks],
            [4, _lang.categoryCartoons],
            [6, _lang.categorySoft],
            [9, _lang.categorySport],
            [10, _lang.categoryXXX],
            [-1, _lang.categoryOther]
        ];
        var content = [];
        var counter;
        var li;
        for (var i = 0, item; item = categoryList[i]; i++) {
            var id = item[0];
            counter = $('<i>', {text: 0});
            li = $('<li>', {'class': 'hide'}).data('id', id).append($('<a>',{text: item[1], href: '#'}), counter);
            var_cache.categorys[id] = { i: counter, li: li, count: 0, hide: 1 };
            content.push( li );
        }
        counter = $('<i>', {text: 0});
        li = $('<li>', {'class':'selected'}).append($('<a>',{text: _lang.categoryAll, href: '#'}), counter);
        var_cache.categorys[undefined] = { i: counter, li: li, count: 0, hide: 0 };
        content.unshift( li );
        dom_cache.result_category_container.append(content);
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
    var setColumSort = function (el) {
        dom_cache.result_table_head.find('th.' + var_cache.table_sort_colum).removeClass('sortDown').removeClass('sortUp');
        var colum = el.data('type');
        var by = var_cache.table_sort_by;
        if (var_cache.table_sort_colum === colum) {
            by = (by === 1) ? 0 : 1;
        }
        if (by === 0) {
            el.removeClass('sortDown').addClass('sortUp');
        } else {
            el.removeClass('sortUp').addClass('sortDown');
        }
        table_sort(colum, by);
        var_cache.table_sort_colum = colum;
        var_cache.table_sort_by = by;
        mono.storage.set({table_sort_colum: colum});
        mono.storage.set({table_sort_by: by});
    };
    var initResizeble = function() {
        dom_cache.tracker_list_container.resizable({
            minHeight: 40,
            resize: function(e, ui) {
                var ul = dom_cache.tracker_list;
                var top = ul.position().top;
                ul.css('height', ui.size.height - top + 'px');
            },
            stop: function(e, ui) {
                mono.storage.set({torrent_list_h: ui.size.height});
                options.trListHeight = ui.size.height;
            },
            create: function(e, ui) {
                if (options.trListHeight !== undefined) {
                    dom_cache.tracker_list_container.css('height', options.trListHeight).attr('aria-disabled', 'false');
                    dom_cache.tracker_list.css('height', options.trListHeight - dom_cache.tracker_list.position().top);
                }
            }
        });
    };
    var addAutocomplete = function() {
        var getHistory = function () {
            /*
             * Отдает массив поисковых запросов из истории
             */
            var history = engine.history.slice(0);
            history.sort(function(a,b){
                if (a.count === b.count) {
                    return 0;
                } else if (a.count < b.count) {
                    return 1;
                } else {
                    return -1;
                }
            });
            var list = [];
            for (var i = 0, item; item = history[i]; i++) {
                list.push(item.title);
            }
            return list;
        };
        dom_cache.search_input.autocomplete({
            source: function(a, response) {
                if (a.term.length === 0 || engine.settings.autoComplite === 0) {
                    response(getHistory());
                } else {
                    if (var_cache.suggest_xhr !== undefined) {
                        var_cache.suggest_xhr.abort();
                    }
                    var_cache.suggest_xhr = engine.ajax({
                        url: 'http://suggestqueries.google.com/complete/search?client=firefox&q=' + encodeURIComponent(a.term),
                        dataType: 'JSON',
                        success: function(data) {
                            response(data[1]);
                        }
                    });
                }
            },
            minLength: 0,
            select: function(event, ui) {
                this.value = ui.item.value;
                $(this).trigger('keyup');
                dom_cache.search_btn.trigger('click');
            },
            position: {
                collision: "bottom"
            },
            create: function() {
                var ul = document.querySelector('ul.ui-autocomplete');
                ul.addEventListener('wheel', function(e) {
                    if (e.wheelDeltaY > 0 && this.scrollTop === 0) {
                        e.preventDefault();
                    } else
                    if (e.wheelDeltaY < 0 && this.scrollHeight - (this.offsetHeight + this.scrollTop) <= 0) {
                        e.preventDefault();
                    }
                });
                var hasTopShadow = false;
                ul.addEventListener('scroll', function(e) {
                    if (this.scrollTop !== 0) {
                        if (hasTopShadow) {
                            return;
                        }
                        hasTopShadow = true;
                        this.style.boxShadow = 'rgba(0, 0, 0, 0.40) -2px 1px 2px 0px inset';
                    } else {
                        if (!hasTopShadow) {
                            return;
                        }
                        hasTopShadow = false;
                        this.style.boxShadow = '';
                    }
                });
            }
        });
    };
    var writeTableHead = function() {
        var tr = $('<tr>');
        var style = '';
        var sortBy = (var_cache.table_sort_by === 0)?'sortUp':'sortDown';
        for (var i = 0, item; item = table_colums[i]; i++) {
            if ((item.type === 'seeds' && engine.settings.hideSeedColumn === 1) || item.type === 'leechs' && engine.settings.hidePeerColumn === 1) {
                continue;
            }
            tr.append( $('<th>', {'class': item.type+((var_cache.table_sort_colum === item.type)?' '+sortBy:''), title: item.title})
                .data('type', item.type)
                .append( $('<span>', {text: item.text}) )
            );
            if (item.size !== undefined) {
                style += 'thead>tr>th.'+item.type+'{width:'+item.size+'px;}';
            }
        }
        dom_cache.result_table_head.append(tr);
        dom_cache.body.append( $('<style>', {'class': 'thead_size', text: style}) );
    };
    var updateTitle = function() {
        var title;
        if (var_cache.currentRequest === undefined || var_cache.currentRequest.length === 0) {
            title = 'Torrents MultiSearch';
            document.title = title;
            return title;
        }
        var tracker = '';
        if (var_cache.currentTrackerList.length > 0) {
            var_cache.currentTrackerList.forEach(function(item) {
                tracker += var_cache.trackers[item].tracker.name+' ';
            });
            tracker += ':: ';
        }
        title = var_cache.currentRequest + ' :: '+tracker+'TMS';
        document.title = title;
        return title;
    };
    var setPage = function(request) {
        var url = 'index.html';
        var hash = '';
        if (request !== undefined) {
            var trackers;
            if (var_cache.currentTrackerList.length > 0) {
                trackers = JSON.stringify(var_cache.currentTrackerList);
            }
            hash = '#?search='+request+((trackers !== undefined)?'&tracker='+trackers:'');
        }
        if (var_cache.oldlocationHash === hash) {
            return;
        }
        if (request !== undefined) {
            ga('send', 'event', 'Search', 'keyword', request);
        }
        var title = updateTitle();
        ga('send', 'pageview', {
            page: url+hash,
            title: title
        });
        var_cache.oldlocationHash = hash;
        if (!window.history.state) {
            window.history.replaceState({
                hash: hash
            }, title, url+hash);
        } else if (window.history.state.hash !== hash) {
            window.history.pushState({hash: hash}, title, url+hash);
        }
        if (window.location.hash !== var_cache.oldlocationHash) {
            var_cache.oldlocationHash = window.location.hash;
        }
    };
    var selectCurrentTrackerList = function() {
        dom_cache.tracker_list.find('a.selected').removeClass('selected');
        for (var i = 0, item; item = var_cache.currentTrackerList[i]; i++) {
            var_cache.trackers[item].link.addClass('selected');
        }
        startFilterByTracker();
    };
    var readHash = function(hash) {
        var params = {};
        if (hash.length === 0) {
            return params;
        }
        hash = hash.substr(hash.indexOf('?')+1);
        var args = hash.split('&');
        var item, i;
        for (i = 0; item = args[i]; i++) {
            var pos = item.indexOf('=');
            var key = item.substr(0, pos);
            if (key === 'search' || key === 'tracker') {
                params[key] = item.substr(pos+1);
            } else if (params.search !== undefined) {
                params.search += '&' + item;
            }
        }
        if (params.search !== undefined) {
            params.search = decodeURIComponent(params.search);
            if (params.search.length === 0) {
                delete params.search;
            }
        }
        try {
            if (params.tracker !== undefined) {
                params.tracker = JSON.parse(decodeURIComponent(params.tracker));
            }
        } catch (error) {
            delete params.tracker;
        }
        if (params.tracker !== undefined) {
            var_cache.currentTrackerList = [];
            for (i = 0; item = params.tracker[i]; i++) {
                if (var_cache.trackers[item] !== undefined) {
                    var_cache.currentTrackerList.push(item);
                }
            }
            selectCurrentTrackerList();
        } else {
            clear_tracker_filter();
        }
        return params;
    };
    var readUrl = function() {
        var hash = window.location.hash;
        if (hash.substr(0, 3) === '#s=') {
            hash = '#?search='+hash.substr(3);
        }
        var params = readHash(hash);
        if (params.search !== undefined) {
            dom_cache.search_input.val(params.search).trigger('keyup');
            search(params.search);
        } else {
            if (params.tracker !== undefined) {
                blankPage(1);
            } else {
                blankPage();
            }
        }
    };
    var clear_tracker_filter = function() {
        var_cache.currentTrackerList = [];
        dom_cache.tracker_list.find('a.selected').removeClass('selected');
        startFilterByTracker();
    };
    var clear_filters = function() {
        var_cache.keywordFilter = undefined;
        var_cache.timeFilter = undefined;
        var_cache.sizeFilter = undefined;
        var_cache.seedFilter = undefined;
        var_cache.peerFilter = undefined;
        var_cache.currentCategory = undefined;

        dom_cache.word_filter_input.val('');
        dom_cache.word_filter_clear_btn.hide();
        dom_cache.size_filter_container.find('input').val('');
        dom_cache.time_filter_select.children().eq(0).prop('selected', true);
        dom_cache.time_filter_container.find('input').val('');
        dom_cache.seed_filter_container.find('input').val('');
        dom_cache.peer_filter_container.find('input').val('');

        startFiltering();
        startFilterByCategory();
    };
    var addInClickHistory = function(request, title, href) {
        if (request === undefined) {
            request = '';
        }
        if (title.length === 0 || href.length === 0) {
            return;
        }
        request = $.trim(request.toLocaleLowerCase());
        if (var_cache.click_history[request] === undefined) {
            var_cache.click_history[request] = [];
        }
        var click_history = var_cache.click_history[request];
        var found = false;
        var oldest_time;
        var oldest_item;
        for (var i = 0, item; item = click_history[i]; i++) {
            if (found === false && item.href === href) {
                item.count += 1;
                item.time = parseInt(Date.now() / 1000);
                item.title = title;
                found = true;
            }
            if (oldest_time === undefined || oldest_time > item.time) {
                oldest_time = item.time;
                oldest_item = i;
            }
        }
        if (found === false) {
            click_history.push({
                title: title,
                href: href,
                count: 1,
                time: parseInt(Date.now() / 1000)
            });
        }
        if (click_history.length > var_cache.click_history_item_limit) {
            click_history.splice(oldest_item, 1);
        }
        var new_obj = {};
        new_obj[request] = click_history;
        var n = 0;
        $.each(var_cache.click_history, function(key, value) {
            if (n > var_cache.click_history_limit) {
                return 0;
            }
            n++;
            if (key !== request) {
                new_obj[key] = value;
            }
        });
        var_cache.click_history = new_obj;
        mono.storage.set({click_history: JSON.stringify( new_obj ) });
    };
    var write_language = function(body) {
        var elList = (body || document).querySelectorAll('[data-lang]');
        for (var i = 0, el; el = elList[i]; i++) {
            var langList = el.dataset.lang.split('|');
            for (var m = 0, lang; lang = langList[m]; m++) {
                var args = lang.split(',');
                var locale = _lang[args.shift()];
                if (locale === undefined) {
                    console.log('Lang not found!', el.dataset.lang);
                    continue;
                }
                if (args.length !== 0) {
                    args.forEach(function (item) {
                        if (item === 'text') {
                            el.textContent = locale;
                            return 1;
                        }
                        if (item === 'html') {
                            el.innerHTML = locale;
                            return 1;
                        }
                        el.setAttribute(item, locale);
                    });
                } else if (el.tagName === 'DIV') {
                    el.setAttribute('title', locale);
                } else if (['A', 'LEGEND', 'SPAN', 'LI', 'TH', 'P', 'OPTION'].indexOf(el.tagName) !== -1) {
                    el.textContent = locale;
                } else if (el.tagName === 'INPUT') {
                    el.value = locale;
                } else {
                    console.log('Tag name not found!', el.tagName);
                }
            }
        }
    };
    var setDescription = function(content) {
        dom_cache.request_desc_container.append(content);
    };

    var trackerListManager = function() {
        var trackerListManager = $( document.getElementById('trackerListManager') );
        var trackerList = trackerListManager.find('.mgr_tracker_list');
        var filterContainer = trackerListManager.find('.mgr_tracker_list_filter');
        var filterStyle = undefined;
        var wordFilterStyle = undefined;
        var advancedStyle = undefined;
        var filterInput = filterContainer.children('input');
        var footerCounter = trackerListManager.find('.mgr_footer > span');
        var title = trackerListManager.find('.mgr_header .title');
        var closeBtn = trackerListManager.find('.mgr_header > a.close');
        var removeListBtn = trackerListManager.find('.mgr_sub_header > a.remove_list');
        var advancedView = trackerListManager.find('.mgr_footer > input.advanced');
        var saveBtn = trackerListManager.find('.mgr_footer > input.save');
        var listName = trackerListManager.find('.mgr_sub_header > input');
        var addCustomTracker = trackerListManager.find('.mgr_custom_tools > .add_custom_tracker');

        var selfCurrentProfile = '';
        var onHideCb = undefined;
        var descCache = {};
        var editMode = 1;

        closeBtn.on('click', function(e) {
            e.preventDefault();
            onHide(1);
        });
        advancedView.on('click', function() {
            if (advancedStyle !== undefined) {
                advancedStyle.remove();
            }
            if (this.classList.contains('checked')) {
                this.classList.remove('checked');
                return;
            }
            this.classList.add('checked');
            dom_cache.body.append( advancedStyle = $('<style>', {text: '#trackerListManager '
                + '.mgr_tracker_list .options {'
                + 'display: block;'
                + '}'
            }) );
        });
        removeListBtn.on('click', function(e) {
            e.preventDefault();
            if (editMode) {
                delete engine.profileList[selfCurrentProfile];

                var changes = {};
                changes.profileList = JSON.stringify(engine.profileList);
                mono.storage.set(changes);

                if (engine.settings.profileListSync === 1) {
                    mono.storage.sync.set({profileList: JSON.stringify(engine.profileList)});
                }
            }
            onHide(2);
        });
        saveBtn.on('click', function(e) {
            e.preventDefault();

            var elList = trackerList.children('.selected');
            var list = [];
            for (var i = 0, el; el = elList[i]; i++) {
                var id = el.dataset.id;
                list.push(id);
            }

            var proxyList = [];
            elList = trackerList.find('input.use_proxy:checked');
            for (var i = 0, el; el = elList[i]; i++) {
                id = el.dataset.tracker;
                proxyList.push(id);
            }

            var newListName = listName.val();
            if (!newListName) {
                listName.addClass('error');
                setTimeout(function() {
                    listName.removeClass('error');
                }, 1500);
                return;
            }

            if (selfCurrentProfile !== newListName) {
                delete engine.profileList[selfCurrentProfile];
                selfCurrentProfile = newListName;
            }
            engine.profileList[selfCurrentProfile] = list;
            engine.proxyList.splice(0);
            Array.prototype.push.apply(engine.proxyList, proxyList);

            var changes = {};
            changes.profileList = JSON.stringify(engine.profileList);
            changes.proxyList = proxyList;
            mono.storage.set(changes);

            if (engine.settings.profileListSync === 1) {
                mono.storage.sync.set({profileList: JSON.stringify(engine.profileList)});
            }

            onHide(selfCurrentProfile);
        });

        var numbersUpdate = function() {
            var selectCount = trackerList.children('.selected').length;
            if (!selectCount) {
                footerCounter.text(_lang.mgrNothingSelected);
            } else {
                footerCounter.text(_lang.mgrSelectedN+' '+selectCount);
            }

            var links = filterContainer.children('a');
            for (var i = 0, el; el = links[i]; i++) {
                var type = el.dataset.type;
                var numContainer = el.querySelectorAll('span')[1];
                if (type === 'all') {
                    numContainer.textContent = trackerList.children().length;
                } else
                if (type === 'selected') {
                    numContainer.textContent = selectCount;
                } else
                if (type === 'unused') {
                    numContainer.textContent = trackerList.children('[data-used="false"]').length;
                } else
                if (type === 'custom') {
                    numContainer.textContent = trackerList.children('.custom').length;
                }
            }
        };

        var filterListBy = function(type) {
            var_cache.mgrFilterBy = type;
            trackerListManager.removeClass('show_tools');
            if (filterStyle !== undefined) {
                filterStyle.remove();
            }
            if (type === 'all') {
                filterStyle = undefined;
            } else
            if (type === 'selected') {
                dom_cache.body.append(
                    filterStyle = $('<style>', {text: '#trackerListManager '
                        + '.mgr_tracker_list > div:not(.selected) {'
                        + 'display: none;'
                        + '}'
                        + '#trackerListManager '
                        + '.mgr_tracker_list > div.tmp_selected {'
                        + 'display: block;'
                        + '}'
                    })
                );
            } else
            if (type === 'unused') {
                dom_cache.body.append(
                    filterStyle = $('<style>', {text: '#trackerListManager '
                        + '.mgr_tracker_list > div[data-used="true"] {'
                        + 'display: none;'
                        + '}'
                        + '#trackerListManager '
                        + '.mgr_tracker_list > div.tmp_used[data-used="true"] {'
                        + 'display: block;'
                        + '}'
                    })
                );
            } else
            if (type === 'custom') {
                dom_cache.body.append(
                    filterStyle = $('<style>', {text: '#trackerListManager '
                        + '.mgr_tracker_list > div:not(.custom) {'
                        + 'display: none;'
                        + '}'
                    })
                );
                trackerListManager.addClass('show_tools');
            }
        };

        filterInput.on('input', function() {
            var elList;
            if (wordFilterStyle !== undefined) {
                wordFilterStyle.remove();
                elList = trackerList.children('div[data-filtered="true"]');
                for (var i = 0, el; el = elList[i]; i++) {
                    el.dataset.filtered = false;
                }
            }
            var request = this.value.toLowerCase();
            if (!request) {
                return;
            }
            if (var_cache.mgrFilterBy === 'selected') {
                filterContainer.children('a.selected').removeClass('selected');
                filterContainer.children('a:eq(0)').addClass('selected');
                filterListBy(filterContainer.children('a.selected').data('type'));
            }
            elList = trackerList.children('div').filter(function(index, el) {
                var id = el.dataset.id;
                var text = descCache[id];
                var url = el.childNodes[1].firstChild.getAttribute('href') || '';
                if (text === undefined) {
                    text = el.childNodes[1].textContent.toLowerCase();
                    text += ' ' + url.toLowerCase();
                    text += ' ' + el.childNodes[2].firstChild.textContent.toLowerCase();
                    descCache[id] = text;
                }
                return text.indexOf(request) !== -1;
            });
            for (var i = 0, el; el = elList[i]; i++) {
                el.dataset.filtered = true;
            }
            dom_cache.body.append(wordFilterStyle = $('<style>', {text: '#trackerListManager '
                + '.mgr_tracker_list > div:not([data-filtered="true"]) {'
                + 'display: none;'
                + '}'
            }) );
        });
        filterInput.on('dblclick', function() {
            filterInput.val('').trigger('input');
        });


        filterContainer.on('click', 'a', function(e) {
            e.preventDefault();
            filterContainer.children('a.selected').removeClass('selected');
            this.classList.add('selected');
            orderTrackerList(1);
            filterListBy(this.dataset.type);
            filterInput.val('').trigger('input');
            trackerList.scrollTop(0);
        });

        trackerList.on('click', 'div.tracker_item', function(e) {
            var $this = $(this);
            var checkbox = $this.find('input.tracker_state');
            if (['INPUT', 'LABEL', 'A'].indexOf(e.target.tagName) !== -1) {
                return;
            }
            checkbox[0].checked = !checkbox[0].checked;
            checkbox.trigger('change');
        });

        var hasTopShadow = false;
        trackerList[0].addEventListener('wheel', function(e) {
            if (e.wheelDeltaY > 0 && this.scrollTop === 0) {
                e.preventDefault();
            } else
            if (e.wheelDeltaY < 0 && this.scrollHeight - (this.offsetHeight + this.scrollTop) <= 0) {
                e.preventDefault();
            }
        });
        trackerList[0].addEventListener('scroll', function(e) {
            if (this.scrollTop !== 0) {
                if (hasTopShadow) {
                    return;
                }
                hasTopShadow = true;
                this.style.boxShadow = 'rgba(0, 0, 0, 0.40) -2px 1px 2px 0px inset';
            } else {
                if (!hasTopShadow) {
                    return;
                }
                hasTopShadow = false;
                this.style.boxShadow = '';
            }
        });

        var onCustomTorrentChange = function() {
            trackerList.empty();

            filterInput.val('');
            if (wordFilterStyle !== undefined) {
                wordFilterStyle.remove();
            }
            wordFilterStyle = undefined;

            writeTrackerList();
            orderTrackerList();
            filterListBy(var_cache.mgrFilterBy);
            numbersUpdate();
        };

        var add_custom_tracker = function(e) {
            e.preventDefault();
            notify([{type: 'textarea', text: _lang.enter_tracker_code}], _lang.apprise_btns0, _lang.apprise_btns1,
                function(arr) {
                    if (!arr || !arr[0]) {
                        return;
                    }
                    var code = undefined;
                    try {
                        code = JSON.parse(arr[0]);
                    } catch (e) {
                        alert(_lang.settings[55] + "\n" + e);
                        return;
                    }
                    if (code.uid === undefined) {
                        alert(_lang.settings[56]);
                        return;
                    }
                    mono.storage.get('customTorrentList', function(storage) {
                        var customTorrentList = storage.customTorrentList || {};
                        if (customTorrentList['ct_'+code.uid] !== undefined) {
                            alert(_lang.settings[54]);
                            return;
                        }
                        customTorrentList['ct_'+code.uid] = code;
                        mono.storage.set({customTorrentList: customTorrentList}, function() {
                            engine.reloadCustomTorrentList(onCustomTorrentChange);
                        });
                    });
                }
            );
        };
        addCustomTracker.on('click', add_custom_tracker);

        var edit_custom_tracker = function(e) {
            e.preventDefault();
            var id = this.dataset.id;
            var uid = id.substr(3);
            mono.storage.get('customTorrentList', function(storage) {
                var customTorrentList = storage.customTorrentList;
                var code = JSON.stringify(customTorrentList[id]);
                notify([{type: 'textarea', value: code, text: _lang.enter_tracker_code}], _lang.apprise_btns0, _lang.apprise_btns1,
                    function(arr) {
                        if (!arr || !arr[0]) {
                            return;
                        }
                        var code = undefined;
                        try {
                            code = JSON.parse(arr[0]);
                        } catch (e) {
                            alert(_lang.settings[55] + "\n" + e);
                            return;
                        }
                        if (uid !== code.uid) {
                            code.uid = parseInt(uid);
                        }
                        customTorrentList['ct_' + code.uid] = code;
                        mono.storage.set({customTorrentList: customTorrentList}, function() {
                            engine.reloadCustomTorrentList(onCustomTorrentChange);
                        });
                    }
                );
            });
        };

        var remove_custom_tracker = function(e) {
            e.preventDefault();
            var id = this.dataset.id;
            mono.storage.get('customTorrentList', function(storage) {
                var customTorrentList = storage.customTorrentList;
                delete customTorrentList[id];
                delete torrent_lib[id];
                mono.storage.set({customTorrentList: customTorrentList}, function() {
                    engine.reloadCustomTorrentList(onCustomTorrentChange);
                });
            });
        };

        var getTrackerDom = function( id, tracker, tracker_icon, options ) {
            var link = undefined;
            if (tracker === undefined) {
                var uid = (id.substr(0, 3) === 'ct_')?id.substr(3):undefined;
                tracker = {
                    name: id,
                    about: _lang.trackerNotFound,
                    notFound: 1
                };
                if (uid !== undefined) {
                    link = [' ',$('<a>', {href: 'http://code-tms.blogspot.ru/search?q=' + uid, text: _lang.findNotFound, target: "_blank"})];
                }
            }
            if (tracker_icon === undefined) {
                tracker_icon = $('<div>', {'class': 'tracker_icon'}).css({'background-color': ( (tracker.notFound !== undefined) ?'rgb(253, 0, 0)':'#ccc' ), 'border-radius': '8px'});
            }
            var isCustom = tracker.uid !== undefined;
            var customActionList = undefined;
            if (isCustom) {
                customActionList = $('<div>', {class: 'actionList'}).append(
                    $('<a>', {class: 'custom_tracker_edit', 'data-id': id, href: '#', title: _lang.custom_tracker_edit}).on('click', edit_custom_tracker),
                    $('<a>', {class: 'custom_tracker_remove', 'data-id': id, href: '#', title: _lang.custom_tracker_remove}).on('click', remove_custom_tracker)
                )
            }

            var useState = false;
            for (var profile in engine.profileList) {
                if (engine.profileList[profile].indexOf(id) !== -1) {
                    useState = true;
                    break;
                }
            }

            var selected = false;
            if (editMode) {
                if (engine.profileList[selfCurrentProfile].indexOf(id) !== -1) {
                    selected = true;
                }
            } else {
                var defList = engine.defaultProfileTorrentList();
                if (defList.indexOf(id) !== -1) {
                    selected = true;
                }
            }

            var $item = undefined;
            return $item = $('<div>',{'data-used': useState, 'data-id': id, 'class':'tracker_item'+(selected?' selected':'')+( isCustom?' custom':((tracker.notFound !== undefined)?' not_found custom': '') )}).append(
                $('<div>').append(tracker_icon.attr('title', tracker.name)),
                $('<div>', {class: 'title', title: tracker.name}).append(
                    $('<a>', {href: tracker.url, target: '_blank', text: tracker.name})
                ),
                $('<div>', {'class': 'infoContainer'}).append(
                    $('<div>', {class: 'description', title: tracker.about, text: tracker.about}).append(link),
                    customActionList,
                    $('<div>', {class: 'options'}).append(options)
                ),
                $('<div>', {'class': 'status'}).append(
                    $('<input>', {type: 'checkbox', class: "tracker_state", checked: selected}).on('change', function() {
                        if (this.checked) {
                            $item.addClass('selected');
                            $item.removeClass('tmp_selected');
                            $item[0].dataset.used = true;
                            $item.addClass('tmp_used');
                        } else {
                            $item.removeClass('selected');
                            $item.addClass('tmp_selected');
                            $item.removeClass('tmp_used');
                            $item[0].dataset.used = false;
                        }
                        numbersUpdate();
                    })
                )
            )
        };

        var orderTrackerList = function(custom) {
            var tmp_list = trackerList.children('div');
            for (var i = 0, el; el = tmp_list[i]; i++) {
                el.classList.remove('tmp_selected');
                el.classList.remove('tmp_used');
            }

            var list = [];
            if (!custom && editMode === 1) {
                engine.profileList[selfCurrentProfile].forEach(function (id) {
                    var el = trackerList.children('div[data-id="' + id + '"]');
                    if (el.length === 0) {
                        trackerList.append(
                            el = getTrackerDom( id )
                        );
                    }
                    list.push(el);
                });
            } else {
                list = trackerList.children('.selected');
            }
            trackerList.prepend(list);
        };

        var writeTrackerList = function() {
            var list = [];
            $.each(torrent_lib, function(id, tracker) {
                var flags = [];
                if (!tracker.flags.rs) {
                    flags.push($('<div>', {'class': 'cirilic', title: _lang.flag_cirilic}));
                }
                if (tracker.flags.a) {
                    flags.push($('<div>', {'class': 'auth', title: _lang.flag_auth}));
                }
                if (tracker.flags.l) {
                    flags.push($('<div>', {'class': 'rus', title: _lang.flag_rus}));
                }
                if (flags.length > 0) {
                    flags = $('<div>', {'class': 'icons'}).append(flags);
                }
                var useProxy = undefined;
                if (tracker.flags.proxy) {
                    useProxy = $('<label>', {text: _lang.mgrUseProxy, class: 'useProxy'}).prepend(
                        $('<input>', {
                            type: "checkbox",
                            class: "use_proxy",
                            'data-tracker': id,
                            checked: engine.proxyList.indexOf(id) !== -1
                        })
                    );
                }
                var tracker_icon = $('<div>', {'class': 'tracker_icon'});
                if (tracker.icon.length === 0) {
                    tracker_icon.css({'background-color': '#ccc', 'border-radius': '8px'});
                } else
                if (tracker.icon[0] === '#') {
                    tracker_icon.css({'background-color': tracker.icon, 'border-radius': '8px'});
                } else {
                    tracker_icon.css('background-image', 'url(' + tracker.icon + ')');
                }
                list.push( getTrackerDom( id, tracker, tracker_icon, [flags, useProxy] ) );
            });
            trackerList.append(list);
        };

        var onHide = function(state) {
            if (typeof state === 'number') {
                state += editMode?5:0;
            }
            onHideCb && onHideCb(state);
            onHideCb = undefined;

            filterInput.val('');

            selfCurrentProfile = '-';

            document.body.removeEventListener('click', selfHide);

            trackerList.empty();
            if (filterStyle !== undefined) {
                filterStyle.remove();
            }
            if (wordFilterStyle !== undefined) {
                wordFilterStyle.remove();
            }
            filterStyle = undefined;
            wordFilterStyle = undefined;

            filterContainer.children('a.selected').removeClass('selected');
            filterContainer.children('a:eq(3)').addClass('selected');
            filterListBy(filterContainer.children('a.selected').data('type'));

            numbersUpdate();

            trackerListManager.hide();
        };

        var selfHide = function(e) {
            document.body.removeEventListener('click', selfHide);
            onHide(1);
        };

        return {
            show: function(isEditMode, cb) {
                if (trackerListManager[0].style.display === 'block') {
                    return;
                }

                onHideCb = cb;
                editMode = isEditMode;
                if (!editMode) {
                    selfCurrentProfile = undefined;
                    title.text(_lang.mgrTitleNew);
                    removeListBtn.hide();
                    listName.val('');
                } else {
                    selfCurrentProfile = currentProfile;
                    title.text(_lang.mgrTitleEdit);
                    var n = 0;
                    for (var item in engine.profileList) {
                        n++;
                        if (n > 1) {
                            break;
                        }
                    }
                    if (n > 1) {
                        removeListBtn.show();
                    } else {
                        removeListBtn.hide();
                    }
                    listName.val(selfCurrentProfile);
                }


                writeTrackerList();
                orderTrackerList();
                numbersUpdate();

                filterListBy(filterContainer.children('a.selected').data('type'));

                trackerList.sortable({placeholder: "ui-state-highlight"});

                trackerListManager[0].addEventListener('click', function(e) {
                    e.stopPropagation();
                });

                document.body.removeEventListener('click', selfHide);
                setTimeout(function() {
                    document.body.addEventListener('click', selfHide);
                }, 100);

                trackerListManager.show();

                if (mono.isOpera) {
                    trackerListManager.css('left', ((dom_cache.body.width() - trackerListManager.width()) / 2) + 'px' );
                }
            }
        }
    };

    var onTrackerListChange = function(profileName) {
        dom_cache.profileList.children('option:selected').prop('selected', false);
        if (profileName === 1 || profileName === 6) {
            // windows closed
            dom_cache.profileList.children('option[value="' + currentProfile + '"]').prop('selected', true);
            dom_cache.profileList.trigger('change');
            return;
        }
        writeProfileList(engine.profileList);
        if (profileName === 7) {
            // was removed
            // update list
            for (var name in engine.profileList) {
                profileName = name;
                break;
            }
        }
        dom_cache.profileList.children('option[value="' + profileName + '"]').prop('selected', true);
        dom_cache.profileList.trigger('change');
    };

    var showExtensionInfo = function() {
        "use strict";
        var closeBtn = undefined;
        var popup = undefined;
        dom_cache.body.append( popup = $('<div>', {class: 'extInfoContainer'}).append(
            $('<a>', {title: _lang.extPopupInstall, href: 'https://chrome.google.com/webstore/detail/ngcldkkokhibdmeamidppdknbhegmhdh', target: '_blank'}).append(
                $('<img>', {src: 'images/extAd_'+_lang.lang+'.png'})
            ).on('click', function() {
                closeBtn.trigger('click');
            }),
            $('<div>', {class: 'info_head'}).append(
                $('<span>', {class: 'text', text: _lang.extPopupInfo}).append(
                    ' ', $('<a>', {text: _lang.extPopupInstall, href: 'https://chrome.google.com/webstore/detail/ngcldkkokhibdmeamidppdknbhegmhdh', target: '_blank'})
                ).on('click', function() {
                    closeBtn.trigger('click');
                }),
                closeBtn = $('<a>', {class: 'close', href: '#', text: _lang.word_close}).on('click', function(e) {
                    e.preventDefault();
                    mono.storage.set({extensionPopup: 1});
                    popup.css('opacity', 0);
                    setTimeout(function() {
                        popup.remove();
                    }, 1000);
                })
            )
        ) );
        setTimeout(function() {
            popup.css('opacity', 1);
        }, 500);
    };

    return {
        result: writeResult,
        auth: writeTrackerAuth,
        loadingStatus: setTrackerLoadingState,
        getQuality: getQuality,
        setDescription: setDescription,
        addInClickHistory: addInClickHistory,
        begin: function() {
            dom_cache.window = $(window);
            dom_cache.body = $(document.body);
            dom_cache.tracker_list_container = $( document.getElementById('tracker_list_container') );
            dom_cache.tracker_list = $( document.getElementById('tracker_list') );
            dom_cache.search_btn = $( document.getElementById('search_btn') );
            dom_cache.search_input = $( document.getElementById('search_input') );
            dom_cache.search_clear_btn = $( document.getElementById('search_clear_btn') );
            dom_cache.result_container = $( document.getElementById('result_container') );
            dom_cache.request_desc_container = $( document.getElementById('request_desc_container') );
            dom_cache.result_table = $( document.getElementById('result_table') );
            dom_cache.result_table_head = $( document.getElementById('result_table_head') );
            dom_cache.result_table_body = $( document.getElementById('result_table_body') );
            dom_cache.time_filter_container = $( document.getElementById('time_filter_container') );
            dom_cache.time_filter_select = $( document.getElementById('time_filter_select') );
            dom_cache.word_filter_input = $( document.getElementById('word_filter_input') );
            dom_cache.word_filter_clear_btn = $( document.getElementById('word_filter_clear_btn') );
            dom_cache.result_category_container = $( document.getElementById('result_category_container') );
            dom_cache.scroll_to_top_btn = $( document.getElementById('scroll_to_top_btn') );
            dom_cache.size_filter_container = $( document.getElementById('size_filter_container') );
            dom_cache.seed_filter_container = $( document.getElementById('seed_filter_container') );
            dom_cache.peer_filter_container = $( document.getElementById('peer_filter_container') );
            dom_cache.editTrackerList = $( document.getElementById('editTrackerList') );
            dom_cache.time_filter_range_container = $('.time_filter').children('.range');
            dom_cache.profileList = $( document.getElementById('profileList') );

            dom_cache.search_input.focus();

            write_language();

            if (engine.settings.hideSeedColumn === 1) {
                dom_cache.seed_filter_container.hide();
            }

            if (engine.settings.hidePeerColumn === 1) {
                dom_cache.peer_filter_container.hide();
            }

            writeTableHead();
            writeCategory();

            writeProfileList(engine.profileList);

            writeTrackerList(currentProfile);

            var_cache.tracker_ui_offset_top = dom_cache.tracker_list.offset().top;
            if (engine.settings.rightPanel === 0) {
                $( document.getElementById('options_column') ).css({
                    "float": "left",
                    "padding-left": "5px",
                    "padding-right": '0'
                });
                $( document.getElementById('search_result_column') ).css({
                    "margin-left": "180px",
                    "margin-right": "0"
                });
                dom_cache.scroll_to_top_btn.css({"right": "auto"});
            }
            dom_cache.result_table_body.on('mousedown', 'div.title > span > a', function() {
                var title = this.innerHTML;
                var href = this.getAttribute('href');
                addInClickHistory(var_cache.currentRequest, title, href);
            });
            dom_cache.search_input.on('keypress', function(e) {
                if (e.keyCode !== 13) {
                    return;
                }
                search(this.value);
            });
            dom_cache.search_btn.on('click', function(e){
                e.preventDefault();
                search(dom_cache.search_input.val());
            });
            $( document.getElementById('go_home_btn') ).on("click", function(e) {
                e.preventDefault();
                blankPage();
            });
            document.getElementById('history_btn').addEventListener("click", function(e) {
                e.preventDefault();
                window.location = 'history.html';
            });
            document.getElementById('settings_btn').addEventListener("click", function(e) {
                e.preventDefault();
                window.location = 'options.html';
            });
            window.addEventListener('popstate', function(){
                if (window.location.hash === var_cache.oldlocationHash){
                    return;
                }
                readUrl();
            }, false);
            if (mono.isOpera) {
                dom_cache.window.on('hashchange', function() {
                    if (window.location.hash === var_cache.oldlocationHash){
                        return;
                    }
                    readUrl();
                });
            }

            dom_cache.search_clear_btn.on("click", function(event) {
                event.preventDefault();
                this.style.display = 'none';
                dom_cache.search_input.val('').trigger('keyup').focus();
            });
            dom_cache.search_input.on('input', function() {
                if (this.value.length > 0) {
                    dom_cache.search_clear_btn.show();
                } else {
                    dom_cache.search_clear_btn.hide();
                }
            });
            addAutocomplete();

            dom_cache.editTrackerList.on('click', function(e) {
                e.preventDefault();
                if (!trackerListManager.show) {
                    trackerListManager = trackerListManager();
                }
                trackerListManager.show(1, onTrackerListChange);
            });
            dom_cache.profileList.on('change', function() {
                clear_tracker_filter();
                engine.stop();
                var option = dom_cache.profileList.children('option:selected');
                if (option[0].dataset.service === 'new') {
                    if (!trackerListManager.show) {
                        trackerListManager = trackerListManager();
                    }
                    trackerListManager.show(0, onTrackerListChange);
                    return;
                }
                writeTrackerList(this.value);
            });
            dom_cache.result_table_head.on('click', 'th', function(e) {
                e.preventDefault();
                setColumSort($(this));
            });
            dom_cache.window.on('scroll',function() {
                clearTimeout(var_cache.window_scroll_timer);
                var_cache.window_scroll_timer = setTimeout(function() {
                    if (dom_cache.window.scrollTop() > 100) {
                        dom_cache.scroll_to_top_btn.fadeIn('fast');
                    } else {
                        dom_cache.scroll_to_top_btn.fadeOut('fast');
                    }
                }, 250);
            });
            dom_cache.scroll_to_top_btn.on("click", function(e) {
                e.preventDefault();
                window.scrollTo(window.scrollX, 200);
                $('html, body').animate({
                    scrollTop: 0
                }, 200);
            });
            dom_cache.result_category_container.on('click', 'li', function(e) {
                e.preventDefault();
                var $this = $(this);
                var category = $this.data('id');
                if (var_cache.currentCategory === category) {
                    return;
                }
                dom_cache.result_category_container.find('li.selected').removeClass('selected');
                $this.addClass('selected');
                var_cache.currentCategory = category;
                startFilterByCategory();
            });
            dom_cache.tracker_list_container.on('click', 'ul.trackers>li>a', function(e) {
                e.preventDefault();
                var $this = $(this);
                var type = $this.data('tracker');
                var hasClass = $this.hasClass('selected');
                if (options.single_filter_mode) {
                    dom_cache.tracker_list.find('a.selected').removeClass('selected');
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
            dom_cache.tracker_list_container.on('dblclick', function(e) {
                if (e.target.tagName === "A" || e.target.tagName === "SELECT") {
                    return;
                }
                if (engine.settings.torrentListHeight === 1) {
                    engine.settings.torrentListHeight = 0;
                    dom_cache.tracker_list_container.resizable("disable");
                    dom_cache.tracker_list_container.css('height', 'auto');
                    dom_cache.tracker_list.css('height', 'auto');
                    dom_cache.tracker_list_container.children("div.ui-resizable-s").hide();
                } else {
                    engine.settings.torrentListHeight = 1;
                    if (dom_cache.tracker_list_container.hasClass('ui-resizable') === false) {
                        initResizeble();
                    } else {
                        dom_cache.tracker_list.css('height', options.trListHeight - dom_cache.tracker_list.position().top);
                        dom_cache.tracker_list_container.children("div.ui-resizable-s").show();
                        dom_cache.tracker_list_container.resizable("enable");
                    }
                }
                mono.storage.set({torrentListHeight: engine.settings.torrentListHeight});
            });
            dom_cache.word_filter_input.on('keyup', function() {
                var value = this.value;
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
                dom_cache.word_filter_clear_btn.addClass('loading');
                if (value_len > 0) {
                    dom_cache.word_filter_clear_btn.show();
                } else {
                    dom_cache.word_filter_clear_btn.hide();
                }
                var exc = [];
                var inc = [];
                value = value.split((engine.settings.advFiltration === 0)?',':' ');
                var safe_item;
                for (var i = 0, item; item = value[i]; i++) {
                    if (item.length === 0) {
                        continue;
                    }
                    if (item.substr(0,1) === '-') {
                        safe_item = item.substr(1).replace(var_cache.text2safe_regexp_text,"\\$1");
                        if (safe_item.length > 0) {
                            exc.push(safe_item);
                        }
                    } else {
                        safe_item = item.replace(var_cache.text2safe_regexp_text,"\\$1");
                        inc.push(safe_item);
                    }
                }
                if (exc.length > 0) {
                    var_cache.keywordFilter.exclude = new RegExp(exc.join('|'), 'ig');
                } else {
                    var_cache.keywordFilter.exclude = undefined;
                }
                if (inc.length > 0) {
                    var_cache.keywordFilter.include =  new RegExp(inc.join('|'), 'ig');
                } else {
                    var_cache.keywordFilter.include = undefined;
                }
                if (engine.settings.advFiltration === 1) {
                    var_cache.keywordFilter.inc_len = 1;
                }
                if (engine.settings.advFiltration === 2) {
                    var_cache.keywordFilter.inc_len = inc.length;
                }
                if (inc.length === 0 && exc.length === 0) {
                    var_cache.keywordFilter = undefined;
                }
                clearTimeout(var_cache.filterTimer);
                var_cache.filterTimer = setTimeout(function() {
                    dom_cache.word_filter_clear_btn.removeClass('loading');
                    startFiltering();
                }, var_cache.filterTimerValue);
            });
            dom_cache.word_filter_clear_btn.on("click", function() {
                dom_cache.word_filter_input.val('').trigger('keyup').focus();
            });
            dom_cache.size_filter_container.on('keyup', 'input', function() {
                if (var_cache.sizeFilter === undefined) {
                    var_cache.sizeFilter = {
                        from: 0,
                        to: 0
                    };
                }
                var value = parseFloat( this.value );
                if (isNaN(value) || value < 0) {
                    value = 0;
                }
                value = value * 1024 * 1024 * 1024;
                var type = 1;
                if (this.getAttribute('name') === "f_v") {
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
            }).on('dblclick', 'input', function() {
                $(this).val('').trigger('keyup');
            });
            dom_cache.time_filter_container.find('input').datepicker({
                defaultDate: "0",
                changeMonth: true,
                numberOfMonths: 1,
                prevText: "",
                nextText: "",
                monthNamesShort: (function() {
                    var arr = [];
                    for (var i = 0; i < 12; i++) {
                        arr.push(_lang['time_f_m_'+i]);
                    }
                    return arr;
                })(),
                dayNamesMin: (function() {
                    var arr = [];
                    for (var i = 0; i < 7; i++) {
                        arr.push(_lang['time_f_d_'+i]);
                    }
                    return arr;
                })(),
                firstDay: 1,
                maxDate: "+1d",
                hideIfNoPrevNext: true,
                dateFormat: "dd/mm/yy",
                onClose: function(date, b) {
                    if (b.input[0].getAttribute("name") === "start") {
                        dom_cache.time_filter_container.find('input[name=end]').datepicker("option", "minDate", date);
                    } else {
                        dom_cache.time_filter_container.find('input[name=start]').datepicker("option", "maxDate", date);
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
            });
            dom_cache.time_filter_container.on('dblclick', 'input', function() {
                this.value = '';
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
                    dom_cache.time_filter_range_container.show();
                } else {
                    dom_cache.time_filter_range_container.hide();
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
            dom_cache.seed_filter_container.on('keyup', 'input', function() {
                if (engine.settings.hideSeedColumn) {
                    return;
                }
                if (var_cache.seedFilter === undefined) {
                    var_cache.seedFilter = {
                        from: -1,
                        to: -1
                    };
                }
                var value = parseInt( this.value );
                if (isNaN(value) || value < 0) {
                    value = -1;
                }
                var type = 1;
                if ( this.getAttribute('name') === "start") {
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
            }).on('dblclick', 'input', function() {
                $(this).val('').trigger('keyup');
            });
            dom_cache.peer_filter_container.on('keyup', 'input', function() {
                if (engine.settings.hidePeerColumn) {
                    return;
                }
                if (var_cache.peerFilter === undefined) {
                    var_cache.peerFilter = {
                        from: -1,
                        to: -1
                    };
                }
                var value = parseInt( this.value );
                if (isNaN(value) || value < 0) {
                    value = -1;
                }
                var type = 1;
                if ( this.getAttribute('name') === "start") {
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
            }).on('dblclick', 'input', function() {
                $(this).val('').trigger('keyup');
            });
            document.getElementById('main_container').classList.remove('loading');
            if (engine.settings.torrentListHeight === 1) {
                initResizeble();
            }
            if ( Math.random()<.5 ) {
                dom_cache.body.append(
                    $('<style>', {text: 'div.donate > div.logo {' +
                    '-moz-transform: scaleX(-1);' +
                    '-o-transform: scaleX(-1);' +
                    '-webkit-transform: scaleX(-1);' +
                    'transform: scaleX(-1);' +
                    '}'})
                );
            }
            window.history.replaceState({
                hash: window.location.hash
            }, document.title, window.location.href);
            readUrl();

            if (mono.isChrome && mono.isChromeWebApp) {
                mono.storage.get('extensionPopup', function(storage) {
                    "use strict";
                    if (storage.extensionPopup !== 1) {
                        showExtensionInfo();
                    }
                });
            }
        },
        boot: function() {
            if (mono.isChrome) {
                var_cache.click_history_limit = 20;
                var_cache.click_history_item_limit = 20;
            }
            engine.loadSettings(function(_settings) {
                settings = _settings;
                mono.storage.get(['table_sort_colum', 'table_sort_by', 'click_history', 'torrent_list_h', 'currentProfile'], function(storage) {

                    options.trListHeight = storage.torrent_list_h;
                    try {
                        var_cache.click_history = JSON.parse(storage.click_history || '{}');
                    } catch (e) {
                        var_cache.click_history = {};
                    }
                    currentProfile = storage.currentProfile || _lang.label_def_profile;

                    if (engine.profileList[currentProfile] === undefined) {
                        for (var item in engine.profileList) {
                            currentProfile = item;
                            break;
                        }
                    }

                    table_colums = [
                        {title: _lang.columnTime, text: _lang.columnTime, type: 'time', size: 125},
                        {title: _lang.columnQuality, text: _lang.columnQualityShort, type: 'quality', size: 31},
                        {title: _lang.columnTitle, text: _lang.columnTitle, type: 'title'},
                        {title: _lang.columnSize, text: _lang.columnSize, type: 'size', size: 80},
                        {title: _lang.columnSeeds, text: _lang.columnSeedsShort, type: 'seeds', size: 30},
                        {title: _lang.columnLeechs, text: _lang.columnLeechsShort, type: 'leechs', size: 30}
                    ];

                    var_cache.table_sort_colum = storage.table_sort_colum || var_cache.table_sort_colum;
                    var_cache.table_sort_by = storage.table_sort_by || var_cache.table_sort_by;

                    view.begin();
                });
            });
        }
    };
}();
mono.pageId = 'tab';
engine.boot(function() {
    explore.boot(function() {
        $(function() {
            view.boot();
        });
    });
});