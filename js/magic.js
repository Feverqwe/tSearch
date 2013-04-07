var magic = function() {
    var xhr = null;
    var contentFilter = function(c) {
        var c = c.replace(/script/img, 'noscript').replace(/display[: ]*none/img, '#blockdisp#');
        return c;
    }
    var open_page = function(url) {
        var iframe = $('iframe');
        if (xhr != null)
            xhr.abort();
        xhr = $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                var iframedoc = iframe[0].contentDocument || iframe[0].contentWindow.document;
                iframedoc.body.innerHTML = contentFilter(data)+'<style>* {color:#000;background-color:#fff;border:1px dashed #fff;} input {border:2px solid #099;}</style>';
            }
        });
    }
    return {
        begin: function() {
            $('input[name=open]').on('click', function() {
                var url = $(this).parent().children('input[name=url]').val();
                open_page(url);
            })
            $($('iframe')[0].contentDocument).on('mouseenter', '*', function() {
                $(this).css({'background-color': '#FFCC33'}).parents().css({'background-color': ''});
            }).on("mouseleave", '*', function() {
                $(this).css({'background-color': '#fff'});
            }).on("click",'*',function (e) {
                e.preventDefault();
            });
        }
    }
}();
$(function() {
    magic.begin();
});