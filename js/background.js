chrome.omnibox.onInputEntered.addListener(function(text) {
    chrome.tabs.create({"url":"index.html#s=" + text,"selected":true});
});