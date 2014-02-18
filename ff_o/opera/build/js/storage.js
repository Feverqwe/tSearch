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