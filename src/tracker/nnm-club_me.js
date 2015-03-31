/**
 * Created by Anton on 28.03.2015.
 */
engine.trackerLib['nnm-club'] = {
    id: 'nnm-club',
    title: 'NoNaMe',
    icon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEACABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAQAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAAg0k9AHweEwCYQh4AAIAAAIB1fgAAAIAAwL26AOPi3gDv6OEAsX1xAPPz7wD7lycA+MAmAAD/AAD79u0AAAD/APv48AD9+/AAs6GQAPv37QD08OgA+/jxAN/c1gDa3doA/vz2AP789AD/++8A3sq9AABilgAASnMAADJQAP///QD68+gA9PPzAO7p4AD89u8A///6AABV/wAASdwAAD25AAAxlgAAJXMAABlQAO/q4QD07+UAopWVAP/++gD9+O8AJSX/AAAA/wAAANwAAAC5AAAAlgAAAHMAAABQAPn37wD//vwA+fbzAPTx6AD//vgA/vjsAFUA/wBJANwAPQC5ADEAlgAlAHMAGQBQAPPu5gD38+YA//7xAM7HxAD/+vAA//70AP767wD58OUA/fnuAGIAlgBKAHMAMgBQAP///wD79+4A//30AP369AD8/PoA+vXqAP778QD++e8Aua6hAJeHiAB3bG8AblpaAP/+9gDu590A+vTqAPnz6gC7qaYA39W9AOrIogDDmXkAsZB5AJ5oUwCUPCEAUjk/APbx6QD38ugA9/f1ALWSiwD2ZiAA96wrAMx4WADMWyQApVMuAKVEKgB4LyoAYRoPAN/a0wDx7eIA7ejgAL5+YADHhlkA4JovAOKILgDaNBkAxmQkAJQ3FwBuHhEAUAAAAOHc1AD++fAA+/XrANKIZwDSciUA+n8eANN+JADNYCYAsEAvAIcsJgCDLBkAWhYMAOrl3ADv6OAA8e3lAPjy6ADosCwAyoAnAPS1LQDZmEEAum8oAKNUGwCfPBcAbi4jAP788gD8+fEA/frwAP//8QD8+O8A9r4wAPzJLwDpoS0AzqoyAMSGQQB1SyQAsU8kAPjz6gD///wA9vPnAPn47wDuqDcA760qAP/kMwDspisAvoMqANONHwDGah0AMlAAAOLd1gD///4A/PfuANbNwwDiujkA+848AP/mMADyyjIA/q0eAO+QLwDabCYAGVAAANrZ1AD9+vUAzMjEAPa+OQD+yDAA9MkxAAD/AAAA3AAAALkAAACWAAAAcwAAAFAAAPbx6gD+/PAA/PjwAO7o4QD89usA///4AP/88wAA3EkA0qlTAPO4MgDUmygAAFAZAPv17AD++O8A9fDmAOzo3gDm4toA//vwAP/67gDgzLkAALl6ALyWYQDCbj8AAFAyAP//+wD//vkA//73AP//+QD7+/UA+fTqAP/67wD27+QA6becAACWlgCRe2cAAFBQAPby6wDl4doA3drQAOHc0gDcwLcA2bSlAOfc1ACon6AAm5mfAK+HcQCrfEwAnHNsAHtgXACJUEgAkkU5AHpFPACNNB0AfUUwABkJGwAODg4ApaWlpaWl2xylpaWlpaWlpaWlpaWlWNHS3uilpaWlpaWlpaWlpeq2wbq556WlpaWlpaWlpaVbt7/A0GFipaWlpbP9AQUYWXqqtN21uGOlpaVkrams+2ejrmZvq20MbmDYZYZ5qJ6i/pd+i3P8fGx7WncCfZ8NA/QXRy74+aF4a77y9fagnXClpaWlpaWlpaWlpfFxkJL6paWlpaWlpaWlpaWDlpGE96WlpeDg4OBQ46Wl8IqUh/OlpaXg4ODgUKWlpaVylZMIpaWl4ODgsVClpaWliIUTjaWlpeHg4CBQpaWlpYkKpaWlpaWlpVBQUKUgpaUHpaWlpaWlpaWlpaWlUAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8%3D',
    desc: 'Торрент-трекер NNM-Club.me. Игры, фильмы, музыка mp3 и lossless, программы, отечественные и зарубежные сериалы, книги, мультфильмы и аниме. Рекомендации, обсуждение, рецензии и рейтинги.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1,
        allowProxy: 1
    },
    categoryList: [
        /*Serials*/[],
        /*Music  */[],
        /*Games  */[],
        /*Films  */[],
        /*Cartoon*/[],
        /*Books  */[],
        /*Soft   */[],
        /*Anime  */[],
        /*Documen*/[],
        /*Sport  */[],
        /*XXX    */[],
        /*Humor  */[]
    ],
    search: {
        searchUrl: 'http://nnm-club.me/forum/tracker.php',
        baseUrl: 'http://nnm-club.me/forum/',
        requestType: 'GET',
        requestData: 'nm=%search%&f=-1',
        requestMimeType: 'text/html; charset=windows-1251',
        onGetRequest: 'encodeURIComponent',
        listItemSelector: 'table.forumline.tablesorter>tbody>tr',
        torrentSelector: {
            categoryTitle: 'td:eq(1)>a',
            categoryUrl: {selector: 'td:eq(1)>a', attr: 'href'},
            categoryId: {selector: 'td:eq(1)>a', attr: 'href'},
            title: 'td.genmed>a',
            url: {selector: 'td.genmed>a', attr: 'href'},
            size: 'td.gensmall:eq(0)>u',
            downloadUrl: {selector: 'td:eq(4)>a', attr: 'href'},
            seed: 'td.seedmed',
            peer: 'td.leechmed',
            date: 'td.gensmall:eq(2)>u'
        },
        onGetValue: {
            categoryId: {exec: 'idInCategoryListInt', args: [{arg: 0}, {regexp: 'f=([0-9]+)'}]}
        }
    }
};