window.torrent_lib = {};
window.torrent_lib_min = 0;
(function(){
    if (window.torrent_lib_min === 1) {
        return;
    }
    var trackers = ['anidub', 'bestrepack', 'bigfangroup', 'bitsnoop', 'brodim', 'btdigg', 'evrl', 'extratorrent', 'fast-torrent', 'fenopy', 'filebase', 'free-torrents', 'hdclub', 'hurtom', 'inmac', 'katushka', 'kickass', 'kinozal', 'libertorrent', 'megashara', 'mininova', 'nnm-club', 'opensharing', 'opentorrent', 'piratbit', 'piratca', 'rgfootball', 'riperam', 'ru-board', 'rustorka', 'rutor', 'rutracker', 'tapochek', 'tfile', 'thepiratebay', 'torrentmac', 'torrents.freedom', 'torrents.local', 'torrentz', 'underverse', 'x-torrents'];
    /*
    var loading_timer = 10;
    var check_count = 0;
    var trackers_loading = function () {
        var dune = torrent_lib.length !== trackers.length;
        if (!dune) {
            if (check_count < 10) {
                check_count++;
            } else if (check_count === 10) {
                loading_timer = 1000;
            }
            setTimeout(function () {
                trackers_loading();
            }, loading_timer);
        } else {
            engine.torrentLibReady();
        }
    };
    */
    var s = document.getElementsByTagName('script')[0];
    trackers.forEach(function (src) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'tracker/' + src + '.js';
        s.parentNode.insertBefore(script, s);
    });
    //trackers_loading();
})();