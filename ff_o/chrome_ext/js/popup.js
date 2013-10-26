var AutoComplite_opt = parseInt(GetSettings('AutoComplite_opt') || 1);
var xhr_autocomplite = null;
var AddAutocomplete = function() {
    /*
     * добавляет автозавершение для поисковой строки
     */
    function getStaticArray() {
        /*
         * Отдает массив поисковых запросов из истории
         */
        var AutocompleteArr = [];
        var order = function(a, b) {
            /*
             * сортирует по кол-ву попаданий
             */
            if (a.count > b.count)
                return -1;
            if (a.count === b.count)
                return 0;
            return 1;
        };
        var search_history = JSON.parse(GetSettings('search_history') || "[]");
        if (search_history.length > 0) {
            search_history.sort(order);
            var count = search_history.length;
            for (var i = 0; i < count; i++) {
                AutocompleteArr.push(search_history[i].title);
            }
        }
        return AutocompleteArr;
    }
    var inp = $('input[type="text"][name="s"]');
    if (inp.attr('autocomplete') !== undefined) {
        if (AutoComplite_opt === 0) {
            inp.autocomplete({source: getStaticArray()});
        }
        return;
    }
    inp.autocomplete({
        source: (AutoComplite_opt === 0) ? getStaticArray() : function(a, response) {
            if ($.trim(a.term).length === 0 || AutoComplite_opt === 0) {
                response(getStaticArray());
            } else {
                if (xhr_autocomplite !== null) {
                    xhr_autocomplite.abort();
                }
                xhr_autocomplite = $.getJSON('http://suggestqueries.google.com/complete/search?client=firefox&q=' + a.term).success(function(data) {
                    var arr = data[1];
                    response(arr);
                });
            }
        },
        /*
         * unstable api
         messages: {
         noResults: '',
         results: function() {}
         },
         */
        minLength: 0,
        select: function(event, ui) {
            chrome.tabs.create({
                url: 'index.html#s=' + ui.item.value
            });
        },
        position: {
            collision: "bottom"
        }
    });
};

$(function() {
    AddAutocomplete();
    $('input.sbutton').val(_lang['btn_form']);
    $('div.search_panel').find('div.btn.clear').attr('title', _lang['btn_filter']);
    $('form[name="search"]').submit(function(event) {
        event.preventDefault();
        chrome.tabs.create({
            url: 'index.html#s=' + $(this).children('input[type="text"]').val()
        });
    });
    $('form[name="search"]').children('div.btn.clear').on("click", function(event) {
        event.preventDefault();
        $(this).hide();
        $('form[name="search"]').children('input').eq(0).val("").focus();
    });
    $('form[name="search"]').children('input').eq(0).on('keyup', function() {
        if (this.value.length > 0) {
            $(this).parent().children('div.btn.clear').show();
        } else {
            $(this).parent().children('div.btn.clear').hide();
        }
    });
});