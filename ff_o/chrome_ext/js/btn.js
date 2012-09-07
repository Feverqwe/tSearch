var _type_ext = 1;
var update_btn = function () {
    var search_popup = (GetSettings('search_popup') !== undefined) ? parseInt(GetSettings('search_popup')) : false;
    if (search_popup) {
        chrome.browserAction.setPopup({
            popup : 'popup.html'
        });
    } else {
        chrome.browserAction.setPopup({
            popup : ''
        });
        chrome.browserAction.onClicked.addListener(function() {
            chrome.tabs.create({
                url : 'index.html#s='
            });
        });
    }
};
update_btn();