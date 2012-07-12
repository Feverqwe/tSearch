$(function (){
    $('input.sbutton.main').click(function (){
        var s = (document.URL).replace(/(.*)history.html/,'');
        if (s!= '')
            var s = s.replace(/#back=(.*)/,'$1');
        window.location = '/index.html#s='+s;
    });
    $('div.rm_btn').click(function (){
        $(this).parents().eq(1).hide('fast', function () {
            var id = $(this).parents().eq(1).data('id');
        });
    });
});