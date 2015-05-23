/**
 * Created by Anton on 23.05.2015.
 */
engine.trackerLib['anidub'] = {
    id: 'anidub',
    title: 'AniDUB',
    icon: 'data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAABNmlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjarY6xSsNQFEDPi6LiUCsEcXB4kygotupgxqQtRRCs1SHJ1qShSmkSXl7VfoSjWwcXd7/AyVFwUPwC/0Bx6uAQIYODCJ7p3MPlcsGo2HWnYZRhEGvVbjrS9Xw5+8QMUwDQCbPUbrUOAOIkjvjB5ysC4HnTrjsN/sZ8mCoNTIDtbpSFICpA/0KnGsQYMIN+qkHcAaY6addAPAClXu4vQCnI/Q0oKdfzQXwAZs/1fDDmADPIfQUwdXSpAWpJOlJnvVMtq5ZlSbubBJE8HmU6GmRyPw4TlSaqo6MukP8HwGK+2G46cq1qWXvr/DOu58vc3o8QgFh6LFpBOFTn3yqMnd/n4sZ4GQ5vYXpStN0ruNmAheuirVahvAX34y/Axk/96FpPYgAAACBjSFJNAAB6JQAAgIMAAPn/AACA6AAAUggAARVYAAA6lwAAF2/XWh+QAAABkklEQVR42tTTPWiTURTG8d99E021CRW1LQVBSBxsHRSk0FJwUEERwUkdxM1BcBEH6eBiBzdB3CqIg6Otgy7i4iCiiEqF4qJTrUIURBBjP/Le6+AbSMWtk2c5Xw9/nsvlhJSS9URmnbFuQDh09OSawZIgMDBdbu7bHVYefEnlxUBACS28wg28+aeDzdKRT6k8fy+vLWTiXEYDdezEMM7iNSahVN+1Zw0g8XhTSDvmVb6PheUzjWz5eEvpc+Jj4Af6C+lhvP3bwTHUe0WrXLmc9zfepZ7RgbAyWhPH2sIIxtEs9Ne7HWzAE9SSoE/UTOWJ+6l266eSemirinJhsXAxgazbwQUMdZpcMBjy/T3igav5Ni9Sjy2h3VnHIrc7gF5MFfUqbv+BkAuzB8OvylhY0kolGMSpQvu1A5hCragf4hyeFpDtlZDGq+JwZA4fil+BaxlGcKnrKZNFvglbRS9j5c5MrNarob03CtViP427GS7iGxYwg/eFYBbPsdAnDj2KvZVm2niiKj7DaZyH8P8f0+8BAI2EedpUNIv0AAAAAElFTkSuQmCC',
    desc: 'Аниме торрент-трекер Anidub.',
    flags: {
        auth: 1,
        language: 'ru',
        cyrillic: 1
    },
    categoryList: [
        /*Serials*/[],
        /*Music  */['ost'],
        /*Games  */[],
        /*Films  */['anime_movie'],
        /*Cartoon*/[],
        /*Books  */[],
        /*Soft   */[],
        /*Anime  */['anime_ova', 'dorama', 'manga', 'anime_tv'],
        /*Documen*/[],
        /*Sport  */[],
        /*XXX    */[],
        /*Humor  */[]
    ],
    search: {
        searchUrl: 'http://tr.anidub.com/index.php?do=search',
        baseUrl: 'http://tr.anidub.com/',
        requestType: 'POST',
        requestData: 'do=search&subaction=search&showposts=1&story=%search%',
        onGetRequest: 'encodeURIComponent',
        listItemSelector: '#dle-content>div.dpad.searchitem',
        torrentSelector: {
            categoryTitle: 'a:eq(1)',
            categoryUrl: {selector: 'a:eq(1)', attr: 'href'},
            categoryId: {selector: 'a:eq(1)', attr: 'href'},
            title: 'h3>a',
            url: {selector: 'h3>a', attr: 'href'},
            date: 'b'
        },
        onGetValue: {
            categoryId: {exec: 'idInCategoryListStr', args: [{arg: 0}, {regexp: '\\/([^\\/]+)\\/$'}]},
            date: {exec: 'dateFormat', args: [1, {arg: 0}]}
        }
    }
};