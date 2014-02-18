rd /S /Q .\build
rd /S /Q .\build_opera
rd /S /Q .\build_firefox
rd /S /Q .\build_chrome_ext
mkdir .\build_opera
mkdir .\build_firefox
mkdir .\build_chrome_ext
mkdir .\build

xcopy .\_locales .\build\_locales\ /E
xcopy .\js .\build\js\ /E
xcopy .\images .\build\images\ /E
xcopy .\css .\build\css\ /E
copy .\*.html .\build\.
copy .\*.json .\build\.

java -jar compiler.jar --js .\js\torrent_lib.js^
 --js .\tracker\anidub.js --js .\tracker\katushka.js --js .\tracker\rustorka.js --js .\tracker\bestrepack.js^
 --js .\tracker\kickass.js --js .\tracker\rutor.js --js .\tracker\bigfangroup.js --js .\tracker\kinozal.js^
 --js .\tracker\rutracker.js --js .\tracker\bitsnoop.js --js .\tracker\libertorrent.js --js .\tracker\tapochek.js^
 --js .\tracker\brodim.js --js .\tracker\megashara.js --js .\tracker\tfile.js --js .\tracker\btdigg.js^
 --js .\tracker\mininova.js --js .\tracker\thepiratebay.js --js .\tracker\evrl.js --js .\tracker\extratorrent.js^
 --js .\tracker\fast-torrent.js --js .\tracker\nnm-club.js --js .\tracker\torrentmac.js --js .\tracker\fenopy.js^
 --js .\tracker\opensharing.js --js .\tracker\torrents.freedom.js --js .\tracker\filebase.js^
 --js .\tracker\opentorrent.js --js .\tracker\torrents.local.js --js .\tracker\free-torrents.js^
 --js .\tracker\piratbit.js --js .\tracker\torrentz.js --js .\tracker\hdclub.js --js .\tracker\piratca.js^
 --js .\tracker\underverse.js --js .\tracker\hurtom.js --js .\tracker\x-torrents.js --js .\tracker\inmac.js^
 --js .\tracker\rgfootball.js --js .\tracker\riperam.js --js .\tracker\ru-board.js^
 --js_output_file .\build\js\torrent_lib.js

java -jar compiler.jar --js .\js\storage.js --js_output_file .\build\js\storage.js
java -jar compiler.jar --js .\js\lang.js --js_output_file .\build\js\lang.js
java -jar compiler.jar --js .\js\history.js --js_output_file .\build\js\history.js
java -jar compiler.jar --js .\js\background.js --js_output_file .\build\js\background.js
java -jar compiler.jar --js .\js\engine.js --js_output_file .\build\js\engine.js
java -jar compiler.jar --js .\js\view.js --js_output_file .\build\js\view.js
java -jar compiler.jar --js .\js\explore.js --js_output_file .\build\js\explore.js
java -jar compiler.jar --js .\js\ad.js --js_output_file .\build\js\ad.js
java -jar compiler.jar --js .\js\counter.js --js_output_file .\build\js\counter.js
java -jar compiler.jar --js .\js\magic.js --js_output_file .\build\js\magic.js
java -jar compiler.jar --js .\js\options.js --js_output_file .\build\js\options.js

java -jar yuicompressor-2.4.8.jar .\css\stylesheet.css -o .\build\css\stylesheet.css
java -jar yuicompressor-2.4.8.jar .\css\explore.css -o    .\build\css\explore.css
java -jar yuicompressor-2.4.8.jar .\css\options.css -o    .\build\css\options.css
java -jar yuicompressor-2.4.8.jar .\css\history.css -o    .\build\css\history.css
java -jar yuicompressor-2.4.8.jar .\css\magic.css -o      .\build\css\magic.css

java -jar htmlcompressor-1.5.3.jar -t html .\history.html -o .\build\history.html
java -jar htmlcompressor-1.5.3.jar -t html .\index.html   -o .\build\index.html
java -jar htmlcompressor-1.5.3.jar -t html .\magic.html   -o .\build\magic.html
java -jar htmlcompressor-1.5.3.jar -t html .\options.html -o .\build\options.html

:: ff

mkdir .\build_firefox\chrome
xcopy .\build .\build_firefox\chrome\content\ /E

xcopy .\ff_o\firefox\* .\build_firefox\. /E /Y

java -jar yuicompressor-2.4.8.jar .\ff_o\firefox\chrome\content\css\popup.css -o .\build_firefox\chrome\content\css\popup.css

java -jar compiler.jar --js .\ff_o\firefox\chrome\content\js\storage.js --js_output_file .\build_firefox\chrome\content\js\storage.js
java -jar compiler.jar --js .\ff_o\firefox\chrome\content\js\popup.js --js_output_file .\build_firefox\chrome\content\js\popup.js
java -jar compiler.jar --js .\ff_o\firefox\chrome\content\js\counter.js --js_output_file .\build_firefox\chrome\content\js\counter.js
java -jar compiler.jar --js .\ff_o\firefox\chrome\content\js\buttons.js --js_output_file .\build_firefox\chrome\content\js\buttons.js

java -jar htmlcompressor-1.5.3.jar -t html .\ff_o\firefox\chrome\content\popup.html -o .\build_firefox\chrome\content\popup.html

rd /S /Q .\build_firefox\chrome\content\_locales
del .\build_firefox\chrome\content\manifest.json
del .\build_firefox\chrome\content\js\background.js

:: ff


:: opera

xcopy .\build .\build_opera\build\ /E
del .\build_opera\build\manifest.json
del .\build_opera\build\js\background.js
rd /S /Q .\build_opera\build\_locales
xcopy .\ff_o\opera\* .\build_opera\. /E

java -jar compiler.jar --js .\ff_o\opera\build\js\storage.js --js_output_file .\build_opera\build\js\storage.js
java -jar compiler.jar --js .\ff_o\opera\build\js\counter.js --js_output_file .\build_opera\build\js\counter.js

:: opera

:: chrome ext

xcopy .\build .\build_chrome_ext\ /E
xcopy .\ff_o\chrome_ext\* .\build_chrome_ext\. /E /Y

java -jar yuicompressor-2.4.8.jar .\ff_o\chrome_ext\css\popup.css -o .\build_chrome_ext\css\popup.css

java -jar compiler.jar --js .\ff_o\chrome_ext\js\popup.js --js_output_file .\build_chrome_ext\js\popup.js
java -jar compiler.jar --js .\ff_o\chrome_ext\js\btn.js --js_output_file .\build_chrome_ext\js\btn.js

java -jar htmlcompressor-1.5.3.jar -t html .\build_chrome_ext\popup.html -o .\build_chrome_ext\popup.html

:: chrome ext

del .\build_chrome.zip
del .\build_firefox.xpi
del .\build_opera.oex
del .\build_chrome_ext.zip
del .\build_chrome_ext_cens.zip
del .\build_chrome_cens.zip

7za a -tzip .\build_chrome.zip .\build\*
7za a -tzip .\build_firefox.xpi .\build_firefox\*
7za a -tzip .\build_opera.oex .\build_opera\*
7za a -tzip .\build_chrome_ext.zip .\build_chrome_ext\*

copy .\build_chrome_ext.zip .\build_opera_nex.nex