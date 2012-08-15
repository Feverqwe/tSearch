function add_ad(url) {
    $.ajax({
        type: 'GET',
        url: url,
        success: function(data) {
            if (data.substr(0,16) != 'document.write("') return;
            var c = data.substr(16,data.length-16-2).replace(/\\\"/g,'"').replace(/\/\/static/g,'http://static');
            $('#ad').append(c);
        },
        error:function (xhr, ajaxOptions, thrownError){
            
        }
    });
}
$(function (){
    add_ad('http://www.ozon.ru/PartnerTwinerNew.aspx?revident=434fe015-f432-4a3b-a868-3965732de8cd');
    add_ad('http://www.ozon.ru/PartnerTwinerNew.aspx?revident=4d58bed8-b5c6-4424-bd04-4a2a06e6d98b');
    add_ad('http://www.ozon.ru/PartnerTwinerNew.aspx?revident=341081e5-b1d2-4bab-9621-f95725bd454a');
});