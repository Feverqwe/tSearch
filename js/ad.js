var ad = function() {
    var $ad;
    $(function(){
        $ad = $('div.ad');
        insert(insert());
    });
    var ad_arr = [
        ["images/4usv.jpg", "http://c.cpa6.ru/4usv"], //Танки On-line
        ['images/57EA.jpg','http://c.cpl1.ru/57EA'], //War Thunder
        ['images/57EC.jpg','http://c.cpl1.ru/57EC'] //Forsaken World
    ];
    var getRandomArbitary = function(min, max, e)
    {
        var i = 0;
        do {
            i = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (i === e);
        return i;
    };
    var insert = function(e) {
        if (e === undefined) {
            $ad.empty().append($('<p>', {text: _lang.ad}));
        }
        var i = getRandomArbitary(0, ad_arr.length - 1, e);
        $ad.append(
            $('<div>').append(
                $('<a>', {href: ad_arr[i][1], target: '_blank', rel: 'nofollow'}).append(
                    $('<img>', {src: ad_arr[i][0]}).css({'max-width': '170px'}).on('error', function(){
                        $(this).closest('div').remove();
                    })
                )
            )
        );
        return i;
    };
    return {
        insert: function() {
            return insert(insert());
        }
    };
}();
$(window).on('hashchange', function() {
    ad.insert();
});