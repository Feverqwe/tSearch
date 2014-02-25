var ad = {
    $this : undefined,
    list : [
        ["images/4usv.jpg", "http://c.cpa6.ru/4usv"], //Танки On-line
        ['images/57EA.jpg','http://c.cpl1.ru/57EA'], //War Thunder
        ['images/57EC.jpg','http://c.cpl1.ru/57EC'] //Forsaken World
    ],
    getRandomArbitary : function(min, max, e) {
        var i = 0;
        do {
            i = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (i === e);
        return i;
    },
    insert : function(e) {
        if (e === undefined) {
            ad.$this.empty().append($('<p>', {text: _lang.ad}));
        }
        var i = ad.getRandomArbitary(0, ad.list.length - 1, e);
        ad.$this.append(
            $('<div>').append(
                $('<a>', {href: ad.list[i][1], target: '_blank', rel: 'nofollow'}).append(
                    $('<img>', {src: ad.list[i][0]}).css({'max-width': '170px'}).on('error', function(){
                        $(this).closest('div').remove();
                    })
                )
            )
        );
        return i;
    },
    update: function() {
        ad.insert(ad.insert());
    }
};
$(function(){
    ad.$this = $('div.ad');
    ad.update();
});
$(window).on('hashchange', function() {
    ad.update();
});