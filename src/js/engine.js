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
        advFiltration: 2,
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
        torrentListHeight: 0,
        profileListSync: 0,
        proxyURL: 'http://www.gmodules.com/ig/proxy?url={url}',
        proxyHost: '3s3s.org',
        proxyUrlFixSpaces: 1,
        proxyHostLinks: 0,
        calcSeedCount: 1,
        langCode: undefined,
        sortColumn: 'quality',
        sortOrder: 1
    },
    settings: {},
    defaultExplorerOptions: {
        favorites: { e: 1, s: 1, w: 100, c: 1 },
        kp_favorites: { e: 1, s: 1, w: 100, c: 1 },
        kp_in_cinema: { e: 1, s: 1, w: 100, c: 1 },
        kp_popular: { e: 1, s: 1, w: 100, c: 2 },
        kp_serials: { e: 1, s: 1, w: 100, c: 1 },
        imdb_in_cinema: { e: 1, s: 1, w: 100, c: 1 },
        imdb_popular: { e: 1, s: 1, w: 100, c: 2 },
        imdb_serials: { e: 1, s: 1, w: 100, c: 1 },
        gg_games_top: { e: 1, s: 1, w: 100, c: 1 },
        gg_games_new: { e: 1, s: 1, w: 100, c: 1 }
    },
    varCache: {
        historyLimit: mono.isChrome ? 200 : 100
    },
    profileList: {},
    currentProfile: undefined,
    searchHistory: {},

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

    defaultPrepare: function(langCode) {
        "use strict";
        if ( langCode === 'en' ) {
            engine.defaultExplorerOptions.kp_favorites.e = 0;
            engine.defaultExplorerOptions.kp_in_cinema.e = 0;
            engine.defaultExplorerOptions.kp_popular.e = 0;
            engine.defaultExplorerOptions.kp_serials.e = 0;
        } else {
            engine.defaultExplorerOptions.imdb_in_cinema.e = 0;
            engine.defaultExplorerOptions.imdb_popular.e = 0;
            engine.defaultExplorerOptions.imdb_serials.e = 1;
            engine.defaultExplorerOptions.kp_serials.e = 0;
        }
    },

    setProxyList: function(proxyList) {
        "use strict";
        proxyList = proxyList || {};

        if (Array.isArray(proxyList)) {
            var newList = {};
            proxyList.forEach(function(item) {
                newList[item] = 1;
            });
            proxyList = newList;
        }

        var delList = [], item, i;
        for (item in proxyList) {
            if (newList[item] === undefined) {
                delList.push(item);
            }
        }
        for (item in newList) {
            proxyList[item] = newList[item];
        }
        for (i = 0, item; item = delList[i]; i++) {
            delete proxyList[item];
        }

        engine.proxyList = proxyList;
    },

    loadSettings: function(cb) {
        "use strict";
        var defaultSettings = engine.defaultSettings;

        var optionsList = [];
        for (var item in defaultSettings) {
            optionsList.push(item);
        }

        optionsList.push('customTorrentList');
        optionsList.push('profileList');
        optionsList.push('searchHistory');
        optionsList.push('doNotSendStatistics');
        optionsList.push('proxyList');
        optionsList.push('titleQualityList');
        optionsList.push('currentProfile');

        mono.storage.get(optionsList, function(storage) {
            var settings = {};
            for (var item in defaultSettings) {
                settings[item] = storage.hasOwnProperty(item) ? storage[item] : defaultSettings[item];
            }
            engine.settings = settings;

            engine.setProxyList(storage.proxyList);

            if (typeof storage.searchHistory === 'object') {
                engine.searchHistory = storage.searchHistory;
            }

            mono.getLanguage(function() {
                engine.defaultPrepare(mono.language.langCode);

                engine.getProfileList(storage, function(syncStorage) {
                    engine.prepareProfileList(storage.currentProfile, syncStorage);

                    return cb();
                });
            }, settings.langCode);
        });
    },

    init: function(cb) {
        "use strict";
        engine.loadSettings(function() {
            cb && cb();
        });
    },

    trackerLib: {}
};