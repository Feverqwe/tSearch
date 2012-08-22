chrome.omnibox.onInputEntered.addListener(function(text) {
    chrome.tabs.create({"url":"index.html#s=" + text,"selected":true});
});
chrome.management.onInstalled.addListener(function() {
    SetSettings('explorerCache',JSON.stringify({}));
});