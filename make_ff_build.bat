rd /S /Q .\build
rd /S /Q .\build_for_firefox
mkdir .\build
mkdir .\build_for_firefox

xcopy .\js .\build\js\ /E
xcopy .\images .\build\images\ /E
xcopy .\css .\build\css\ /E
copy .\*.html .\build\.

type .\js\torrent_lib_build.js^
 .\tracker\anidub.js .\tracker\katushka.js .\tracker\bestrepack.js^
 .\tracker\kickass.js .\tracker\rutor.js .\tracker\bigfangroup.js .\tracker\kinozal.js^
 .\tracker\rutracker.js .\tracker\bitsnoop.js .\tracker\libertorrent.js .\tracker\tapochek.js^
 .\tracker\brodim.js .\tracker\megashara.js .\tracker\tfile.js .\tracker\btdigg.js^
 .\tracker\mininova.js .\tracker\thepiratebay.js .\tracker\evrl.js .\tracker\extratorrent.js^
 .\tracker\fast-torrent.js .\tracker\nnm-club.js .\tracker\torrentmac.js .\tracker\fenopy.js^
 .\tracker\opensharing.js .\tracker\torrents.freedom.js .\tracker\filebase.js^
 .\tracker\opentorrent.js .\tracker\torrents.local.js .\tracker\free-torrents.js^
 .\tracker\piratbit.js .\tracker\torrentz.js .\tracker\hdclub.js .\tracker\piratca.js^
 .\tracker\underverse.js .\tracker\hurtom.js .\tracker\x-torrents.js .\tracker\inmac.js^
 .\tracker\rgfootball.js .\tracker\riperam.js .\tracker\ru-board.js^
 > .\build\js\torrent_lib.js

del .\build\js\torrent_lib_build.js

mkdir .\build_for_firefox\chrome
xcopy .\build .\build_for_firefox\chrome\content\ /E
xcopy .\ff_o\firefox\* .\build_for_firefox\. /E /Y

del .\build_for_firefox\chrome\content\js\background.js
del .\build_for_firefox\chrome\content\js\magic.js
del .\build_for_firefox\chrome\content\css\magic.css
del .\build_for_firefox\chrome\content\magic.html

del .\build_for_firefox.zip

7za a -tzip .\build_for_firefox.xpi .\build_for_firefox\*
