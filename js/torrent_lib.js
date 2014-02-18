window.torrent_lib = {};
(function(){
    if (window.torrent_lib_min === 1) {
        return;
    }
    var trackers = ['anidub', 'bestrepack', 'bigfangroup', 'bitsnoop', 'brodim', 'btdigg', 'evrl', 'extratorrent',
        'fast-torrent', 'fenopy', 'filebase', 'free-torrents', 'hdclub', 'hurtom', 'inmac', 'katushka', 'kickass',
        'kinozal', 'libertorrent', 'megashara', 'mininova', 'nnm-club', 'opensharing', 'opentorrent', 'piratbit',
        'piratca', 'rgfootball', 'riperam', 'ru-board', 'rustorka', 'rutor', 'rutracker', 'tapochek', 'tfile',
        'thepiratebay', 'torrentmac', 'torrents.freedom', 'torrents.local', 'torrentz', 'underverse', 'x-torrents'];
    var s = document.getElementsByTagName('script')[0];
    trackers.forEach(function (src) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'tracker/' + src + '.js';
        s.parentNode.insertBefore(script, s);
    });
})();