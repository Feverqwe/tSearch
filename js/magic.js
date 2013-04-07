var magic = function() {
    var xhr = null;
    var contentFilter = function(c) {
        var c = c.replace(/\/\//img, '#blockurl#').replace(/script/img, '#blockscr#').replace(/display[: ]*none/img, '#blockdisp#');
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
                iframedoc.body.innerHTML = contentFilter(data);
                $($('iframe')[0].contentDocument).find('*').css({'color':'#000','background': '#fff','border':'1px dashed #fff'});
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
                $(this).css({'background': '#FFCC33','border':'1px #FF0033 dashed'}).parents().css({'background': '#fff','border':'1px #fff dashed'});
            }).on("mouseleave", '*', function() {
                $(this).css({'background': '#fff','border':'1px #fff dashed'});
            }).on("click",'*',function (e) {
                e.preventDefault();
            });
        }
    }
}();
$(function() {
    magic.begin();
});