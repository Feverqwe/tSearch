var SetSettings = function (key,value) {
    chrome.storage[key] = value;
    return value;
}
var GetSettings = function (key) {
    if (chrome.storage[key] === undefined)
        return undefined;
    else
        return chrome.storage[key];
}