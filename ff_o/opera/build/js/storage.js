var SetSettings = function(key, value) {
    if (value === undefined) {
        delete localStorage[key];
        return value;
    }
    localStorage[key] = value;
    return value;
};
var GetSettings = function(key) {
    return localStorage[key];
};
var GetStorageSettings = function(key, cb) {
    var storage = {};
    if (typeof key === 'string') {
        storage[key] = localStorage[key];
        if (cb !== undefined) {
            cb(storage);
        }
        return;
    }
    key.forEach(function(item) {
        storage[item] = localStorage[item];
    });
    if (cb !== undefined) {
        cb(storage);
    }
};
var SetStorageSettings = function(keys, cb) {
    for (var key in keys) {
        if (!keys.hasOwnProperty(key)) {
            continue;
        }
        localStorage[key] = keys[key];
        if (cb !== undefined) {
            cb();
        }
    }
};