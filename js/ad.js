var ad = function () {
    var ad_arr = [["images/ad6.jpg","http://c.cpa1.ru/3k3c"],//небеса
                  ["images/ad-7.jpg","http://c.cpa1.ru/3uqa"],//Белки
                  ["images/ad-rq.jpg","http://c.cpa1.ru/3ycq"]//Royal Quest
              ]
    var getRandomArbitary = function (min, max, e)
    {
        var i = 0
        do {
            i = Math.floor(Math.random() * (max - min + 1)) + min;
        } while ( i == e );
        return i
    }
    var insert = function (e) {
        if (e == null) {
            $('#ad').empty().append('<p>'+_lang.ad+'</p>');
        }
        var i = getRandomArbitary(0,ad_arr.length-1,e);
        $('#ad').append('<div><a href="'+ad_arr[i][1]+'" target="_blank" rel="nofollow"><img src="'+ad_arr[i][0]+'" /></a></div>');
        return i
    }
    return {
        insert : function () {
            return insert(insert());
        }
    }
}();
$(window).load(function () {
    ad.insert();
});
$(window).bind('hashchange', function() {
    ad.insert();
});