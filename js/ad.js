/*
var ad = function () {
    var last_ad_id = 0;
    var add_ad = function(url) {
        $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                if (data.substr(0,16) != 'document.write("') return;
                var c = JSON.parse('{"data": "'+data.substr(16,data.length-16-2).replace(/[\r\n\t]/g,'')+'"}');
                c = c.data.replace(/src\=\"\/\//g,'src="http://').replace(/script/img,'#blockscr#');
                $('#ad').empty().append(c);
            },
            error:function (xhr, ajaxOptions, thrownError){
            
            }
        });
    }
    var getRandomArbitary = function (min, max)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    var insert = function () {
        var i = getRandomArbitary(1,4);
        if (last_ad_id == i) return;
        else {
            last_ad_id = i;
            if (i == 1)
                add_ad('http://www.ozon.ru/PartnerTwinerNew.aspx?revident=4d58bed8-b5c6-4424-bd04-4a2a06e6d98b');
            else if (i == 2)
                add_ad('http://www.ozon.ru/PartnerTwinerNew.aspx?revident=369828f4-0fc9-4262-b20c-07449a5c0bc0');
            else if (i == 3)
                add_ad('http://www.ozon.ru/PartnerTwinerNew.aspx?revident=5ac92f2d-1ca1-4e47-bc0d-adc7182824b4');
            else
                add_ad('http://www.ozon.ru/PartnerTwinerNew.aspx?revident=1d7850fe-0d87-44cb-ba2a-5bf1a1d887cb');
        }
    }
    return {
        insert : function () {
            return insert();
        }
    }
}();
$(window).load(function () {
    ad.insert();
});
$(window).bind('hashchange', function() {
    ad.insert();
});
*/