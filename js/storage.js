(function(){
    var sync_items = ['exp_cache_favorites'];
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
    window.SetStorageSettings = function(local, cb) {
        var sync = undefined;
        sync_items.forEach(function(item){
            if (local.hasOwnProperty(item)) {
                if (sync === undefined) {
                    sync = {};
                }
                sync[item] = local[item];
                delete local[item];
            }
        });
        chrome.storage.local.set(local, function(){
            if (sync !== undefined) {
                chrome.storage.sync.set(sync, cb);
            } else {
                cb();
            }
        });
    };
    window.GetStorageSettings = function(local, cb) {
        if (typeof local === 'string') {
            if ( sync_items.indexOf(local) !== -1 ) {
                chrome.storage.sync.get(local, cb);
            } else {
                chrome.storage.local.get(local, cb);
            }
            return;
        }
        var sync = undefined;
        sync_items.forEach(function(item){
            if ( sync_items.indexOf(item) !== -1 ) {
                if (sync === undefined) {
                    sync = [];
                }
                sync.push(item);
                local.splice(local.indexOf(item), 1);
            }
        });
        chrome.storage.local.get(local, function(obj) {
            if (sync !== undefined) {
                chrome.storage.sync.get(sync, function(sObj) {
                    sync_items.forEach(function(item) {
                        if (sObj.hasOwnProperty(item)) {
                            obj[item] = sObj[item];
                        }
                    });
                    cb(obj);
                });
                return;
            }
            cb(obj);
        });
    };
    if (parseInt(GetSettings('allow_favorites_sync') || 1) === 0) {
        sync_items.splice(sync_items.indexOf('exp_cache_favorites'), 1);
    }
})();