var SetSettings = function (key,value) {
    localStorage[key] = value;
    return value;
}
var GetSettings = function (key) {
    if (localStorage[key] === undefined)
        return undefined;
    else
        return localStorage[key];
}