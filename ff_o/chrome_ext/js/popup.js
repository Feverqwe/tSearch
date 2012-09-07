$(function () {
    $('form[name="search"]').submit(function (event) {
        event.preventDefault();
        chrome.tabs.create({
            url : 'index.html#s='+$(this).children('input[type="text"]').val()
        });
    });
});