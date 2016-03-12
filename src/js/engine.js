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
        calcSeedCount: 1,
        langCode: undefined,
        sortColumn: 'quality',
        sortOrder: 0,
        invertIcon: 0
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
    profileArr: [],
    currentProfile: undefined,
    history: [],
    topList: {},

    webAppSupportTrackerList: [
        'nnm-club', 'kinozal', 'hdclub', 'rutor', 'tfile', 'fast-torrent', 'btdigg',
        'bitsnoop', 'extratorrent', 'torrentz', 'thepiratebay', 'kickass'
    ],

    getDefaultProfileList: function() {
        "use strict";
        var list;
        if (mono.language.langCode === 'ru') {
            list = ['nnm-club', 'rutracker', 'kinozal', 'rutor', 'hdclub', 'tfile', 'fast-torrent', 'opentorrent', 'btdigg'];
            if (mono.isWebApp) {
                list.splice(list.indexOf('rutracker'), 1);
                list.splice(list.indexOf('rutor'), 1);
            }
        } else {
            list = ['bitsnoop', 'extratorrent', 'torrentz', 'thepiratebay', 'kickass'];
            if (mono.isWebApp) {
                list.splice(list.indexOf('thepiratebay'), 1);
            }
        }
        return list.map(function(item) {
            return {id: item};
        });
    },

    updProfileArr: function() {
        "use strict";
        engine.profileArr.splice(0);
        for (var key in engine.profileList) {
            engine.profileArr.push({name: key, trackerList: engine.profileList[key]});
        }
    },

    prepareProfileList: function(currentProfile, storage) {
        "use strict";
        var profileObj = {};
        var profileArr = [];
        if (typeof storage.profileList === "object") {
            if (!Array.isArray(storage.profileList)) {
                profileObj = storage.profileList;
                for (var key in profileObj) {
                    profileArr.push({name: key, trackerList: profileObj[key]});
                }
            } else {
                profileArr = storage.profileList;
                for (var i = 0, item; item = profileArr[i]; i++) {
                    profileObj[item.name] = item.trackerList;
                }
            }
        }
        engine.profileList = profileObj;
        engine.profileArr = profileArr;
        if (profileArr.length === 0) {
            profileObj['%defaultProfileName%'] = engine.getDefaultProfileList();
            profileArr.push({name: '%defaultProfileName%', trackerList: profileObj['%defaultProfileName%']});
        }
        if (!profileObj.hasOwnProperty(currentProfile)) {
            currentProfile = profileArr[0].name;
        }
        engine.currentProfile = currentProfile;
    },

    prepareTrackerList: function(profileName, cb) {
        "use strict";
        var trackerList = [];
        var _trackerList = engine.profileList[profileName];
        for (var i = 0, item; item = _trackerList[i]; i++) {
            var trackerId = item;
            if (typeof trackerId === 'object') {
                trackerId = item.id;
            }
            var tracker = engine.trackerLib[trackerId];
            if (!tracker) {
                continue;
            }
            var trackerObj = exKit.prepareTracker(tracker);

            trackerList.push(trackerObj);
        }
        return cb(trackerList);
    },

    setProfileList: function(storage, cb) {
        "use strict";
        mono.storage.set(storage, function() {
            if (engine.settings.profileListSync) {
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
        var _this = this;
        var browserLocale = String(navigator.language).substr(0, 2).toLowerCase();

        var defaultSettings = _this.defaultSettings;

        if (browserLocale !== 'ru') {
            defaultSettings.hideTopSearch = 1;
            _this.defaultExplorerOptions[1].enable = 0;
            _this.defaultExplorerOptions[2].enable = 0;
            _this.defaultExplorerOptions[3].enable = 0;
            _this.defaultExplorerOptions[4].enable = 0;
        } else {
            _this.defaultExplorerOptions[5].enable = 0;
            _this.defaultExplorerOptions[6].enable = 0;
            _this.defaultExplorerOptions[4].enable = 0;
        }

        if (mono.isWebApp) {
            defaultSettings.allowGetDescription = 0;
        }

        var optionsList = Object.keys(defaultSettings).concat([
            'profileList',
            'customTorrentList',
            'searchHistory',
            'currentProfile',
            'explorerOptions',
            'topList',
            'explorerQualityList',
            'qualityObj'
        ]);

        var cacheList = [];
        for (var i = 0, item; item = _this.defaultExplorerOptions[i]; i++) {
            var itemKey = 'expCache_' + item.type;
            optionsList.push(itemKey);
            cacheList.push(itemKey);
        }

        mono.storage.get(optionsList, function(storage) {
            storage = storage || {};
            mono.storage.sync.get(optionsList, function(syncStorage) {
                syncStorage = syncStorage || {};
                var settings = _this.settings = {};
                ['enableFavoriteSync', 'profileListSync'].forEach(function(key) {
                    if (storage.hasOwnProperty(key)) {
                        settings[key] = storage[key];
                    } else {
                        settings[key] = defaultSettings[key];
                    }
                });

                if (!settings.enableFavoriteSync) {
                    delete syncStorage.expCache_favorites;
                }

                if (!settings.profileListSync) {
                    delete syncStorage.profileList;
                }

                Object.keys(syncStorage).forEach(function(key) {
                    storage[key] = syncStorage[key];
                });

                Object.keys(defaultSettings).forEach(function(key) {
                    if (storage.hasOwnProperty(key)) {
                        settings[key] = storage[key];
                    } else {
                        settings[key] = defaultSettings[key];
                    }
                });

                !settings.doNotSendStatistics && _this.initCounter();

                if (Array.isArray(storage.searchHistory)) {
                    _this.history = storage.searchHistory;
                }

                if (Array.isArray(storage.qualityObj)) {
                    rate.qualityList = storage.qualityObj;
                }

                if (Array.isArray(storage.explorerOptions)) {
                    _this.explorerOptions = storage.explorerOptions;
                } else {
                    _this.explorerOptions = mono.cloneObj(_this.defaultExplorerOptions);
                }
                _this.prepareExploreOptionsObj();

                if (typeof storage.explorerQualityList === 'object') {
                    _this.explorerQualityList = storage.explorerQualityList;
                }

                if (typeof storage.customTorrentList === 'object') {
                    for (var id in storage.customTorrentList) {
                        exKit.prepareCustomTracker(storage.customTorrentList[id]);
                    }
                }

                if (typeof storage.topList === 'object') {
                    _this.topList = storage.topList;
                }

                cacheList.forEach(function(key) {
                    if (typeof storage[key] !== 'object') {
                        storage[key] = {};
                    }

                    _this.exploreCache[key] = storage[key];
                });

                mono.getLanguage(function() {
                    _this.defaultPrepare(mono.language.langCode);

                    _this.prepareProfileList(storage.currentProfile, storage);

                    return cb();
                }, settings.langCode);
            });
        });
    },

    ping: function(cb) {
        "use strict";
        if (!mono.isFF) {
            return cb();
        }
        var dune = false;
        var limit = 10;
        (function ping() {
            if (dune) {
                return;
            }

            limit--;
            if (limit === 0) {
                return document.location.reload();
            }

            mono.sendMessage({action: 'ping'}, function() {
                if (dune) {
                    return;
                }
                dune = true;
                cb();
            });

            setTimeout(function() {
                ping();
            }, 100);
        })();
    },

    init: function(cb) {
        "use strict";
        var _this = this;
        mono.onReady(function() {
            _this.ping(function() {
                _this.loadSettings(function() {
                    cb && cb();
                });
            });
        });
    },

    exploreCache: {},
    explorerQualityList: {},

    trackerLib: {}
};