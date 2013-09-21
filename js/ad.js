var ad = function () {
    var ad_arr = [
                    ["images/4358.jpg","http://c.cpa6.ru/4358"],//Panzar
                    ["images/3ycq.jpg","http://c.cpa6.ru/3ycq"],//Royal Quest
                    ["images/3k3c.jpg","http://c.cpa6.ru/3k3c"],//Небеса
                    ["images/4359.jpg","http://c.cpa6.ru/4359"],//Dragona
                    ["images/4usv.jpg","http://c.cpa6.ru/4usv"],//Танки On-line
                    ["images/4usK.jpg","http://c.cpa6.ru/4usK"] //Heroes of Newerth
              ];
    var getRandomArbitary = function (min, max, e)
    {
        var i = 0;
        do {
            i = Math.floor(Math.random() * (max - min + 1)) + min;
        } while ( i === e );
        return i;
    };
    var insert = function (e) {
        if (e === undefined) {
            $('#ad').empty().append('<p>'+_lang.ad+'</p>');
        };
        var i = getRandomArbitary(0,ad_arr.length-1,e);
        $('#ad').append('<div><a href="'+ad_arr[i][1]+'" target="_blank" rel="nofollow"><img src="'+ad_arr[i][0]+'" style="max-width:170px" /></a></div>');
        return i;
    };
    return {
        insert : function () {
            return insert(insert());
        }
    };
}();
$(window).load(function () {
    ad.insert();
});
$(window).bind('hashchange', function() {
    ad.insert();
});