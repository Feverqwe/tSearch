#!/bin/sh
find . -name ".DS_Store" -exec rm {} \;
rm -r ./build
rm -r ./build_opera
rm -r ./build_firefox
rm -r ./build_chrome_ext
mkdir ./build
mkdir ./build_opera
mkdir ./build_firefox
mkdir ./build_chrome_ext
cp -r ./_locales ./build/.
cp -r ./js ./build/.
cp -r ./images ./build/.
cp -r ./css ./build/.
cp -r ./tracker ./build/.
cp *.html ./build/.
cp *.json ./build/.

java -jar yuicompressor-2.4.7.jar ./css/stylesheet.css -o ./build/css/stylesheet.css
java -jar yuicompressor-2.4.7.jar ./css/options.css -o ./build/css/options.css
java -jar yuicompressor-2.4.7.jar ./css/history.css -o ./build/css/history.css

mkdir ./build_firefox/chrome
cp -r ./build ./build_firefox/chrome/content

java -jar compiler.jar --js ./tracker/tfile.js --js_output_file ./build/tracker/tfile.js
java -jar compiler.jar --js ./tracker/rutracker.js --js_output_file ./build/tracker/rutracker.js
java -jar compiler.jar --js ./tracker/rutor.js --js_output_file ./build/tracker/rutor.js
java -jar compiler.jar --js ./tracker/opensharing.js --js_output_file ./build/tracker/opensharing.js
java -jar compiler.jar --js ./tracker/nnm-club.js --js_output_file ./build/tracker/nnm-club.js
java -jar compiler.jar --js ./tracker/megashara.js --js_output_file ./build/tracker/megashara.js
java -jar compiler.jar --js ./tracker/kinozal.js --js_output_file ./build/tracker/kinozal.js
java -jar compiler.jar --js ./tracker/torrents.local.js --js_output_file ./build/tracker/torrents.local.js
java -jar compiler.jar --js ./tracker/pornolab.js --js_output_file ./build/tracker/pornolab.js
java -jar compiler.jar --js ./tracker/torrents.freedom.js --js_output_file ./build/tracker/torrents.freedom.js
java -jar compiler.jar --js ./tracker/thepiratebay.js --js_output_file ./build/tracker/thepiratebay.js
java -jar compiler.jar --js ./tracker/thepiratebay2.js --js_output_file ./build/tracker/thepiratebay2.js
java -jar compiler.jar --js ./tracker/rustorka.js --js_output_file ./build/tracker/rustorka.js
java -jar compiler.jar --js ./tracker/inmac.js --js_output_file ./build/tracker/inmac.js
java -jar compiler.jar --js ./tracker/kickass.js --js_output_file ./build/tracker/kickass.js
java -jar compiler.jar --js ./tracker/fast-torrent.js --js_output_file ./build/tracker/fast-torrent.js
java -jar compiler.jar --js ./tracker/anidub.js --js_output_file ./build/tracker/anidub.js
java -jar compiler.jar --js ./tracker/bitsnoop.js --js_output_file ./build/tracker/bitsnoop.js
java -jar compiler.jar --js ./tracker/extratorrent.js --js_output_file ./build/tracker/extratorrent.js
java -jar compiler.jar --js ./tracker/isohunt.js --js_output_file ./build/tracker/isohunt.js
java -jar compiler.jar --js ./tracker/fenopy.js --js_output_file ./build/tracker/fenopy.js
java -jar compiler.jar --js ./tracker/torrentz.js --js_output_file ./build/tracker/torrentz.js
java -jar compiler.jar --js ./tracker/torrentino.js --js_output_file ./build/tracker/torrentino.js
java -jar compiler.jar --js ./tracker/mininova.js --js_output_file ./build/tracker/mininova.js
java -jar compiler.jar --js ./tracker/filebase.js --js_output_file ./build/tracker/filebase.js
java -jar compiler.jar --js ./tracker/free-torrents.js --js_output_file ./build/tracker/free-torrents.js
java -jar compiler.jar --js ./tracker/my-hit.js --js_output_file ./build/tracker/my-hit.js
java -jar compiler.jar --js ./tracker/evrl.js --js_output_file ./build/tracker/evrl.js
java -jar compiler.jar --js ./tracker/rgfootball.js --js_output_file ./build/tracker/rgfootball.js
java -jar compiler.jar --js ./tracker/mmatracker.js --js_output_file ./build/tracker/mmatracker.js
java -jar compiler.jar --js ./tracker/x-torrents.js --js_output_file ./build/tracker/x-torrents.js
java -jar compiler.jar --js ./tracker/opentorrent.js --js_output_file ./build/tracker/opentorrent.js
java -jar compiler.jar --js ./tracker/youtracker.js --js_output_file ./build/tracker/youtracker.js

java -jar compiler.jar --js ./js/lang.js --js_output_file ./build/js/lang.js
java -jar compiler.jar --js ./js/background.js --js_output_file ./build/js/background.js
java -jar compiler.jar --js ./js/engine.js --js_output_file ./build/js/engine.js
java -jar compiler.jar --js ./js/view.js --js_output_file ./build/js/view.js
java -jar compiler.jar --js ./js/storage.js --js_output_file ./build/js/storage.js
java -jar compiler.jar --js ./js/explore.js --js_output_file ./build/js/explore.js
java -jar compiler.jar --js ./js/history.js --js_output_file ./build/js/history.js
java -jar compiler.jar --js ./js/options.js --js_output_file ./build/js/options.js
java -jar compiler.jar --js ./js/jquery.tablesorter.js --js_output_file ./build/js/jquery.tablesorter.js
java -jar compiler.jar --js ./js/ad.js --js_output_file ./build/js/ad.js


cp -r ./build/ ./build_chrome_ext/.
cp -r ./ff_o/chrome_ext/ ./build_chrome_ext/.
java -jar yuicompressor-2.4.7.jar ./ff_o/chrome_ext/css/popup.css -o ./build_chrome_ext/css/popup.css
java -jar compiler.jar --js ./ff_o/chrome_ext/js/btn.js --js_output_file ./build_chrome_ext/js/btn.js
java -jar compiler.jar --js ./ff_o/chrome_ext/js/popup.js --js_output_file ./build_chrome_ext/js/popup.js

cp -r ./ff_o/firefox/* ./build_firefox/.
rm -r ./build_firefox/chrome/content/_locales
rm ./build_firefox/chrome/content/manifest.json
rm ./build_firefox/chrome/content/js/background.js

cp -r ./build ./build_opera/.
rm ./build_opera/build/manifest.json
rm ./build_opera/build/js/background.js
rm -r ./build_opera/build/_locales
cp -r ./ff_o/opera/* ./build_opera/.

#rm ./build_firefox/chrome/content/js/storage.js
#rm ./build_firefox/chrome/content/js/ad.js
#java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/storage.js --js_output_file ./build_firefox/chrome/content/js/storage.js
#java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/ad.js --js_output_file ./build_firefox/chrome/content/js/ad.js

rm ./build_chrome.zip
rm ./build_firefox.xpi
rm ./build_opera.oex
rm ./build_chrome_ext.zip
cd ./build/
zip -9 -r ../build_chrome.zip ./
cd ../build_firefox/
zip -9 -r ../build_firefox.xpi ./
cd ../build_opera/
zip -9 -r ../build_opera.oex ./
cd ../build_chrome_ext/
zip -9 -r ../build_chrome_ext.zip ./