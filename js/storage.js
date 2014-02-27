(function(){
    var allow_favorites_sync = 1;
    window.SetSettings = function(key, value) {
        if (value === undefined) {
            delete localStorage[key];
            return value;
        }
        localStorage[key] = value;
        return value;
    };
    window.GetSettings = function(key) {
        return localStorage[key];
    };
    window.SetStorageSettings = function(keys, cb) {
        var type = 'local';
        if (allow_favorites_sync && keys.exp_cache_favorites !== undefined) {
            type = 'sync';
        }
        chrome.storage[type].set(keys, cb);
    };
    window.GetStorageSettings = function(keys, cb) {
        var type = 'local';
        if (allow_favorites_sync && keys === 'exp_cache_favorites') {
            type = 'sync';
        }
        chrome.storage[type].get(keys, cb);
    };
    allow_favorites_sync = parseInt(GetSettings('allow_favorites_sync') || 1);
})();