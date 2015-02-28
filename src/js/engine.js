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
        langCode: undefined
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
    history: [],

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

    onGetProfileList: function(currentProfile, storage) {
        "use strict";
        var profileList = engine.profileList = storage.profileList || {};
        if (mono.isEmptyObject(profileList)) {
            profileList[currentProfile = '%defaultProfileName%'] = engine.getDefaultProfileList();
        }
        if (!profileList.hasOwnProperty(currentProfile)) {
            for (var item in profileList) {
                currentProfile = item;
                break;
            }
        }
        engine.currentProfile = currentProfile;
    },

    getProfileList: function(storage) {
        "use strict";
        var onGetProfileList = engine.onGetProfileList.bind(null, storage.currentProfile);
        if (storage.profileListSync) {
            mono.storage.sync.get('profileList', onGetProfileList);
        } else {
            onGetProfileList(storage);
        }
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
        optionsList.push('history');
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

            mono.loadLanguage(function() {
                engine.getProfileList(storage);

                return cb();
            }, settings.langCode);
        });
    },

    init: function(cb) {
        "use strict";
        engine.loadSettings(function() {
            cb && cb();
        });
    }
};