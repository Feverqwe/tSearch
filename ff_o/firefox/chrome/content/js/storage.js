var localStorage = function() {
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
        delete localStorage[key];
        return value;
    }
    localStorage[key] = value;
    return value;
};
var GetSettings = function(key) {
    return localStorage[key];
};