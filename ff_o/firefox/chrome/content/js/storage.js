var localStorage2 = function() {
    var url = "http://tms_ex";
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService);
    var ssm = Components.classes["@mozilla.org/scriptsecuritymanager;1"]
            .getService(Components.interfaces.nsIScriptSecurityManager);
    var dsm = Components.classes["@mozilla.org/dom/storagemanager;1"]
            .getService(Components.interfaces.nsIDOMStorageManager);
    var uri = ios.newURI(url, "", null);
    var principal = ssm.getCodebasePrincipal(uri);
    var storage = dsm.getLocalStorageForPrincipal(principal, "");
    return storage;
}();
var SetSettings = function(key, value) {
    if (value === undefined) {
        delete localStorage2[key];
        return value;
    }
    localStorage2[key] = value;
    return value;
};
var GetSettings = function(key) {
    return localStorage2[key];
};
var GetStorageSettings = function(key, cb) {
    var storage = {};
    if (typeof key === 'string') {
        storage[key] = localStorage2[key];
        if (cb !== undefined) {
            cb(storage);
        }
        return;
    }
    key.forEach(function(item) {
        storage[item] = localStorage2[item];
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
        localStorage2[key] = keys[key];
        if (cb !== undefined) {
            cb();
        }
    }
};