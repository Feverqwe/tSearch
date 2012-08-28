/*
function parseHTML(doc, html, allowStyle, baseURI, isXML) {
    if (isXML == null) isXML = false;
    PARSER_UTILS = "@mozilla.org/parserutils;1";
    if (PARSER_UTILS in Components.classes) {
        var parser = Components.classes[PARSER_UTILS]
        .getService(Components.interfaces.nsIParserUtils);
        if ("parseFragment" in parser)
            return parser.parseFragment(html, allowStyle ? parser.SanitizerAllowStyle : 0,
                isXML, baseURI, doc.documentElement);
    }
 
    return Components.classes["@mozilla.org/feed-unescapehtml;1"]
    .getService(Components.interfaces.nsIScriptableUnescapeHTML)
    .parseFragment(html, isXML, baseURI, doc.documentElement);
}
var ad = function () {
    var last_ad_id = 0;
    var add_ad = function(url) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function() {
            var data = xhr.responseText;
            if (data.substr(0,16) != 'document.write("') return;
            var c = JSON.parse('{"data": "'+data.substr(16,data.length-16-2).replace(/[\r\n\t]/g,'')+'"}');
            c = c.data;
            c = parseHTML(document,c,true,xhr.channel.URI);
            $('#ad').empty().append( '<link rel="Stylesheet" type="text/css" href="http://www.ozon.ru/styles/charger/style.css"><link rel="Stylesheet" type="text/css" href="http://www.ozon.ru/styles/charger/00.css">' );
            $('#ad').append( c );            
        }
        xhr.send(null);
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