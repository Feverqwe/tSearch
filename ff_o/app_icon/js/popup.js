var def_id = "pakhafflipopfhfmnbhoocpkcdjfpphc";
var ext_id = localStorage['id'];
function getExtId() {
    if (ext_id !== undefined && ext_id.length > 0) {
        return;
    }
    var def = ext_id;
    chrome.management.getAll(function(exts) {
        var len = exts.length;
        for (var i = 0; i < len; i++) {
            var item = exts[i];
            if (item.enabled !== true || item.type === "extension" || item.type === "theme") {
                continue;
            }
            if (item.id === def) {
                ext_id = item.id;
                return;
            }
        }
        for (var i = 0; i < len; i++) {
            var item = exts[i];
            if (item.enabled !== true || item.type === "extension" || item.type === "theme") {
                continue;
            }
            if (item.name === "TMS - Поиск торрентов" || item.name === "TMS - Torrent search") {
                ext_id = item.id;
                return;
            }
        }
        ext_id = def_id;
        return;
    });
}
getExtId();
var xhr_autocomplite = null;
var AddAutocomplete = function() {
    /*
     * добавляет автозавершение для поисковой строки
     */
    var inp = $('input[type="text"][name="s"]');
    if (inp.attr('autocomplete') !== undefined) {
        return;
    }
    inp.autocomplete({
        source: function(a, response) {
            if ($.trim(a.term).length === 0) {
                response([]);
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
            $(this).val(ui.item.value);
            $(this).closest('form').trigger('submit');
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
            url: 'chrome-extension://' + ext_id + '/index.html#s=' + $(this).children('input[type="text"]').val()
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