var SetSettings = function(key, value) {
    localStorage[key] = value;
    return value;
};
var GetSettings = function(key) {
    return localStorage[key];
};