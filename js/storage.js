var allow_favorites_sync = 0;
var SetSettings = function (key,value) {
    if (key == "favoritesList" && allow_favorites_sync && chrome.storage) {
        var obj = {}
        obj[key] = value;
        chrome.storage.sync.set(obj);
        localStorage[key] = value;
    } else {
        localStorage[key] = value;
    }
    return value;
}
var GetSettings = function (key) {
    if (key == "favoritesList" && allow_favorites_sync && chrome.storage) {
        chrome.storage.sync.get(key, 
            function(val) {
                if (val.favoritesList === undefined || val.favoritesList == '')
                    return;
                localStorage[key] = val.favoritesList;
                explore.updFav(localStorage[key]);
            }
            );
        if (localStorage[key] !== undefined) {
            return localStorage[key];
        } else {
            return undefined;
        }
    } else {
        if (localStorage[key] === undefined)
            return undefined;
        else
            return localStorage[key];
    }
}
allow_favorites_sync = (GetSettings('allow_favorites_sync') !== undefined) ? parseInt(GetSettings('allow_favorites_sync')) : false;
