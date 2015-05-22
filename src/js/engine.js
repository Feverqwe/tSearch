/**
 * Created by Anton on 28.02.2015.
 */
var engine = {
    defaultSettings: {
        hidePeerColumn: 1,
        hideSeedColumn: 0,
        subCategoryFilter: 1,
        teaserFilter: 1,
        contextMenu: 1,
        searchPopup: 1,
        autoComplite: 1,
        useEnglishPosterName: 0,
        doNotSendStatistics: 0,
        defineCategory: 1,
        allowGetDescription: 1,
        enableFavoriteSync: 1,
        enableHighlight: 1,
        kinopoiskFolderId: '1',
        rightPanel: 0,
        hideTopSearch: 0,
        trackerListHeight: 200,
        profileListSync: 0,
        proxyList: [
            {label: 'Google user content', url: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?url={url}&container=pos', type: 0, fixSpaces: 1},
            {label: '3s3s.org', url: '3s3s.org', type: 1}
        ],
        calcSeedCount: 1,
        langCode: undefined,
        sortColumn: 'quality',
        sortOrder: 0
    },
    settings: {},
    defaultExplorerOptions: [
        {type: 'favorites',      enable: 1, show: 1, width: 100, lineCount: 1, lang: 'favoriteList'},     //0
        {type: 'kp_favorites',   enable: 1, show: 1, width: 100, lineCount: 1, lang: 'kpFavoriteList'},  //1
        {type: 'kp_in_cinema',   enable: 1, show: 1, width: 100, lineCount: 1, lang: 'kpInCinema'},  //2
        {type: 'kp_popular',     enable: 1, show: 1, width: 100, lineCount: 2, lang: 'kpPopular'},    //3
        {type: 'kp_serials',     enable: 1, show: 1, width: 100, lineCount: 1, lang: 'kpSerials'},    //4
        {type: 'imdb_in_cinema', enable: 1, show: 1, width: 100, lineCount: 1, lang: 'imdbInCinema'},//5
        {type: 'imdb_popular',   enable: 1, show: 1, width: 100, lineCount: 2, lang: 'imdbPopular'},  //6
        {type: 'imdb_serials',   enable: 1, show: 1, width: 100, lineCount: 1, lang: 'imdbSerials'},  //7
        {type: 'gg_games_top',   enable: 1, show: 1, width: 100, lineCount: 1, lang: 'ggGamesTop'},  //8
        {type: 'gg_games_new',   enable: 1, show: 1, width: 100, lineCount: 1, lang: 'ggGamesNew'}   //9
    ],
    explorerOptions: [],
    profileList: {},
    currentProfile: undefined,
    history: [],
    topList: {},

    getDefaultProfileList: function() {
        "use strict";
        var list;
        if (mono.language.langCode === 'ru') {
            list = ['nnm-club', 'rutracker', 'kinozal', 'rutor', 'hdclub', 'tfile', 'fast-torrent', 'opensharing', 'btdigg'];
        } else {
            list = ['bitsnoop', 'extratorrent', 'fenopy', 'torrentz', 'thepiratebay', 'kickass'];
        }
        return list;
    },

    prepareProfileList: function(currentProfile, storage) {
        "use strict";
        if (typeof storage.profileList !== "object") {
            storage.profileList = undefined;
        }
        var profileList = engine.profileList = storage.profileList || {};
        if (mono.isEmptyObject(profileList)) {
            profileList['%defaultProfileName%'] = engine.getDefaultProfileList();
        }
        if (!profileList.hasOwnProperty(currentProfile)) {
            for (var item in profileList) {
                currentProfile = item;
                break;
            }
        }
        engine.currentProfile = currentProfile;
    },

    prepareTrackerList: function(profileName, cb) {
        "use strict";
        var trackerList = [];
        var list = engine.profileList[profileName];
        for (var i = 0, item; item = list[i]; i++) {
            var trackerId = item;
            if (typeof trackerId === 'object') {
                trackerId = item.id;
            }
            var tracker = engine.trackerLib[trackerId];
            if (tracker === undefined) continue;
            var trackerObj = exKit.prepareTracker(tracker);

            trackerObj.proxyIndex = item.proxyIndex || 0;

            trackerList.push(trackerObj);
        }
        cb(trackerList);
    },

    setProfileList: function(storage, cb) {
        "use strict";
        mono.storage.set(storage, function() {
            if (storage.profileListSync) {
                return mono.storage.sync.set(storage, cb);
            }
            cb();
        });
    },

    defaultPrepare: function(langCode) {
        "use strict";
        var typeList;
        if (langCode === 'en') {
            typeList = ['imdb_in_cinema', 'imdb_popular', 'imdb_serials', 'kp_serials'];
        } else {
            typeList = ['favorites', 'kp_favorites', 'kp_popular', 'kp_serials'];
        }
        for (var type in typeList) {
            for (var i = 0, item; item = this.defaultExplorerOptions[i]; i++) {
                if (item.type === type) {
                    item.enable = 0;
                }
            }
        }
    },
    explorerOptionsObj: {},
    defaultExplorerOptionsObj: {},
    prepareExploreOptionsObj: function() {
        "use strict";
        for (var i = 0, item; item = engine.defaultExplorerOptions[i]; i++) {
            this.defaultExplorerOptionsObj[item.type] = item;
        }
        for (i = 0, item; item = engine.explorerOptions[i]; i++) {
            this.explorerOptionsObj[item.type] = item;
        }
    },
    loadSettings: function(cb) {
        "use strict";
        var defaultSettings = this.defaultSettings;

        var optionsList = [];
        for (var item in defaultSettings) {
            optionsList.push(item);
        }

        optionsList.push('profileList');
        optionsList.push('customTorrentList');
        optionsList.push('searchHistory');
        optionsList.push('currentProfile');
        optionsList.push('explorerOptions');
        optionsList.push('topList');
        optionsList.push('explorerQualityList');
        optionsList.push('qualityObj');

        var cacheList = [];
        for (var i = 0, item; item = this.defaultExplorerOptions[i]; i++) {
            var itemKey = 'expCache_' + item.type;
            optionsList.push(itemKey);
            cacheList.push(itemKey);
        }

        mono.storage.get(optionsList, function(storage) {
            var settings = {};
            for (var item in defaultSettings) {
                settings[item] = storage.hasOwnProperty(item) ? storage[item] : defaultSettings[item];
            }
            this.settings = settings;

            !settings.doNotSendStatistics && this.initCounter();

            var syncOptionsList = [];
            if (settings.profileListSync) {
                syncOptionsList.push('profileList');
                syncOptionsList.push('proxyList');
            }
            settings.enableFavoriteSync && syncOptionsList.push('expCache_' + 'favorites');

            if (Array.isArray(storage.searchHistory)) {
                this.history = storage.searchHistory;
            }

            if (Array.isArray(storage.qualityObj)) {
                rate.qualityList = storage.qualityObj;
            }

            if (Array.isArray(storage.explorerOptions)) {
                this.explorerOptions = storage.explorerOptions;
            } else {
                this.explorerOptions = mono.cloneObj(this.defaultExplorerOptions);
            }

            if (typeof storage.explorerQualityList === 'object') {
                this.explorerQualityList = storage.explorerQualityList;
            }

            this.prepareExploreOptionsObj();

            if (typeof storage.customTorrentList === 'object') {
                for (var id in storage.customTorrentList) {
                    exKit.prepareCustomTracker(storage.customTorrentList[id]);
                }
            }

            if (typeof storage.topList === 'object') {
                this.topList = storage.topList;
            }

            mono.getLanguage(function() {
                mono.storage.sync.get(syncOptionsList, function(syncStorage) {
                    for (var i = 0, item; item = syncOptionsList[i]; i++) {
                        storage[item] = syncStorage[item];
                    }

                    for (var i = 0, item; item = cacheList[i]; i++) {
                        if (!storage[item] || typeof storage[item] !== 'object') {
                            storage[item] = {};
                        }

                        this.exploreCache[item] = storage[item];
                    }

                    this.defaultPrepare(mono.language.langCode);

                    this.prepareProfileList(storage.currentProfile, storage);

                    return cb();
                }.bind(this));
            }.bind(this), settings.langCode);
        }.bind(this));
    },

    init: function(cb) {
        "use strict";
        this.loadSettings(function() {
            cb && cb();
        });
    },

    exploreCache: {},
    explorerQualityList: {},

    trackerLib: {}
};