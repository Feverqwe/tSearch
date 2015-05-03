/**
 * Created by Anton on 28.02.2015.
 */
var engine = {
    defaultSettings: {
        hidePeerColumn: 1,
        hideSeedColumn: 0,
        hideTrackerIcons: 0,
        subCategoryFilter: 1,
        hideZeroSeed: 0,
        enableTeaserFilter: 1,
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
        noBlankPageOnDownloadClick: 0,
        trackerListHeight: 200,
        profileListSync: 0,
        proxyURL: 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?url={url}&container=pos',
        proxyHost: '3s3s.org',
        proxyUrlFixSpaces: 1,
        proxyHostLinks: 0,
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
            var tracker = engine.trackerLib[item];
            if (tracker === undefined) continue;
            trackerList.push(exKit.prepareTracker(tracker));
        }
        cb(trackerList);
    },

    getProfileList: function(storage, cb) {
        "use strict";
        if (storage.profileListSync) {
            mono.storage.sync.get('profileList', cb);
        } else {
            cb(storage);
        }
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

    loadSettings: function(cb) {
        "use strict";
        var defaultSettings = this.defaultSettings;

        var optionsList = [];
        for (var item in defaultSettings) {
            optionsList.push(item);
        }

        optionsList.push('customTorrentList');
        optionsList.push('profileList');
        optionsList.push('searchHistory');
        optionsList.push('currentProfile');
        optionsList.push('explorerOptions');
        optionsList.push('topList');

        mono.storage.get(optionsList, function(storage) {
            var settings = {};
            for (var item in defaultSettings) {
                settings[item] = storage.hasOwnProperty(item) ? storage[item] : defaultSettings[item];
            }
            this.settings = settings;

            !settings.doNotSendStatistics && this.initCounter();

            if (Array.isArray(storage.searchHistory)) {
                this.history = storage.searchHistory;
            }

            if (Array.isArray(storage.explorerOptions)) {
                this.explorerOptions = storage.explorerOptions;
            } else {
                this.explorerOptions = mono.cloneObj(this.defaultExplorerOptions);
            }

            if (typeof storage.customTorrentList === 'object') {
                for (var id in storage.customTorrentList) {
                    exKit.prepareCustomTracker(storage.customTorrentList[id]);
                }
            }

            if (typeof storage.topList === 'object') {
                this.topList = storage.topList;
            }

            mono.getLanguage(function() {
                this.defaultPrepare(mono.language.langCode);

                this.getProfileList(storage, function(syncStorage) {
                    this.prepareProfileList(storage.currentProfile, syncStorage);

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

    trackerLib: {}
};