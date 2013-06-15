var AutoComplite_opt = (GetSettings('AutoComplite_opt') !== undefined) ? parseInt(GetSettings('AutoComplite_opt')) : true;
var xhr_autocomplite = null;
var AddAutocomplete = function() {
    if (AutoComplite_opt == 0) {
        var AutocompleteArr = [];
        var order = function(a, b) {
            if (a.count > b.count)
                return -1;
            if (a.count == b.count)
                return 0;
            return 1;
        }
        var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
        if (search_history != null) {
            search_history.sort(order);
            var count = search_history.length;
            for (var i = 0; i < count; i++) {
                AutocompleteArr[AutocompleteArr.length] = search_history[i].title;
            }
        }
    }
    var inp = $('input[type="text"][name="s"]');
    if (inp.attr('autocomplete') != null) {
        inp.autocomplete("destroy");
    }
    inp.autocomplete({
        source: (AutoComplite_opt == 0) ? AutocompleteArr : function(a, response) {
            if ($.trim(a.term).length == 0 || AutoComplite_opt == 0) {
                var AutocompleteArr = [];
                var order = function(a, b) {
                    if (a.count > b.count)
                        return -1;
                    if (a.count == b.count)
                        return 0;
                    return 1;
                }
                var search_history = (GetSettings('search_history') !== undefined) ? JSON.parse(GetSettings('search_history')) : null;
                if (search_history != null) {
                    search_history.sort(order);
                    var count = search_history.length;
                    for (var i = 0; i < count; i++) {
                        AutocompleteArr[AutocompleteArr.length] = search_history[i].title;
                    }
                }
                response(AutocompleteArr);
            } else {
                if (xhr_autocomplite != null)
                    xhr_autocomplite.abort();
                xhr_autocomplite = $.getJSON('http://suggestqueries.google.com/complete/search?client=firefox&q=' + a.term).success(function(data) {
                    var arr = data[1];
                    response(arr);
                });
            }
        },
        minLength: 0,
        select: function(event, ui) {
            chrome.tabs.create({
                url: 'index.html#s=' + ui.item.value
            });
        },
        position: {
            at: "bottom",
            collision: "bottom"
        }
    });
    inp.autocomplete("close");
}

$(function() {
    AddAutocomplete();
    $('input.sbutton').val(_lang['btn_form']);
    $('form[name="search"]').submit(function(event) {
        event.preventDefault();
        chrome.tabs.create({
            url: 'index.html#s=' + $(this).children('input[type="text"]').val()
        });
    });
});