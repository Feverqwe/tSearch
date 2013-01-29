var _type_ext = 1;
chrome.browserAction.onClicked.addListener(function() {
    var search_popup = (GetSettings('search_popup') !== undefined) ? parseInt(GetSettings('search_popup')) : true;
    if (!search_popup) {
        chrome.tabs.create({
            url : 'index.html#s='
        });
    }
});
var update_btn = function () {
    var search_popup = (GetSettings('search_popup') !== undefined) ? parseInt(GetSettings('search_popup')) : true;
    if (search_popup) {
        chrome.browserAction.setPopup({
            popup : 'popup.html'
        });
    } else {
        chrome.browserAction.setPopup({
            popup : ''
        });
    }
};
update_btn();