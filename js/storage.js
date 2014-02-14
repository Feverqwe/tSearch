var allow_favorites_sync = 0;
var SetSettings = function(key, value) {
    if (value === undefined) {
        delete localStorage[key];
        return value;
    }
    if (key === "favoritesList" && allow_favorites_sync && chrome.storage) {
        var obj = {};
        obj[key] = value;
        chrome.storage.sync.set(obj);
    }
    localStorage[key] = value;
    return value;
};
var GetSettings = function(key) {
    if (key === "favoritesList" && allow_favorites_sync && chrome.storage) {
        chrome.storage.sync.get(key,
                function(val) {
                    if (val.favoritesList === undefined || val.favoritesList.length === 0)
                        return;
                    localStorage[key] = val.favoritesList;
                    explore.updFav(localStorage[key]);
                }
        );
    }
    return localStorage[key];
};
allow_favorites_sync = parseInt(GetSettings('allow_favorites_sync') || 0);