var ad = function () {
    var ad_arr = [
                    ["images/ad4.jpg","http://c.cpa1.ru/3H57"],//Буквоед
                    ["images/ad3.jpg","http://c.cpa1.ru/3H59"],//Купоника
                    ["images/ad2.jpg","http://c.cpa1.ru/3H5a"],//BS
                    ["images/ad1.jpg","http://c.cpa1.ru/3H5b"] //sotmarket
              ];
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
        $('#ad').append('<div><a href="'+ad_arr[i][1]+'" target="_blank" rel="nofollow"><img src="'+ad_arr[i][0]+'" style="max-width:170px" /></a></div>');
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