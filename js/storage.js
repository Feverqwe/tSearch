var allow_favorites_sync = 1;
var SetSettings = function(key, value) {
    if (value === undefined) {
        delete localStorage[key];
        return value;
    }
    if (key === "exp_cache_favorites" && allow_favorites_sync && chrome.storage) {
        var data = {};
        data[key] = value;
        chrome.storage.sync.set(data);
    }
    localStorage[key] = value;
    return value;
};
var GetSettings = function(key) {
    if (key === "exp_cache_favorites" && allow_favorites_sync && chrome.storage) {
        chrome.storage.sync.get(key, function(data) {
            if (data.exp_cache_favorites === undefined) {
                return;
            }
            localStorage[key] = data.exp_cache_favorites;
            explore.updateFavorites(data.exp_cache_favorites);
        });
    }
    return localStorage[key];
};
allow_favorites_sync = parseInt(GetSettings('allow_favorites_sync') || 1);