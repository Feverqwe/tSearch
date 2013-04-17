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
cp *.html ./build/.
cp *.json ./build/.
cp *.png ./build/.

#>chrome comression
cp ./compressed/history.html ./build/.
cp ./compressed/index.html ./build/.
cp ./compressed/magic.html ./build/.
cp ./compressed/options.html ./build/.
cp ./compressed/manifest.json ./build/.


rm ./build/css/*.css

rm ./build/js/ad.js
rm ./build/js/apprise-1.5.js
rm ./build/js/counter.js
rm ./build/js/explore.js
rm ./build/js/jqcloud-1.0.2.min.js
rm ./build/js/jquery.tablesorter.js
rm ./build/js/lang.js
rm ./build/js/storage.js
#>tr compression
java -jar compiler.jar --js ./compressed/torrent_lib.js --js ./tracker/anidub.js --js ./tracker/katushka.js --js ./tracker/rustorka.js --js ./tracker/bestrepack.js --js ./tracker/kickass.js --js ./tracker/rutor.js --js ./tracker/bigfangroup.js --js ./tracker/kinozal.js --js ./tracker/rutracker.js --js ./tracker/bitsnoop.js --js ./tracker/libertorrent.js --js ./tracker/tapochek.js --js ./tracker/brodim.js --js ./tracker/megashara.js --js ./tracker/tfile.js --js ./tracker/btdigg.js --js ./tracker/mininova.js --js ./tracker/thepiratebay.js --js ./tracker/evrl.js --js ./tracker/mmatracker.js --js ./tracker/thepiratebay2.js --js ./tracker/extratorrent.js --js ./tracker/my-hit.js --js ./tracker/torrentino.js --js ./tracker/fast-torrent.js --js ./tracker/nnm-club.js --js ./tracker/torrentmac.js --js ./tracker/fenopy.js --js ./tracker/opensharing.js --js ./tracker/torrents.freedom.js --js ./tracker/filebase.js --js ./tracker/opentorrent.js --js ./tracker/torrents.local.js --js ./tracker/free-torrents.js --js ./tracker/piratbit.js --js ./tracker/torrentz.js --js ./tracker/hdclub.js --js ./tracker/piratca.js --js ./tracker/underverse.js --js ./tracker/hurtom.js --js ./tracker/pornolab.js --js ./tracker/x-torrents.js --js ./tracker/inmac.js --js ./tracker/rgfootball.js --js ./tracker/youtracker.js --js ./tracker/isohunt.js --js ./tracker/riperam.js --js_output_file ./build/js/torrent_lib.js
#<tr compression
java -jar compiler.jar --js ./js/storage.js --js ./js/lang.js --js ./js/background.js --js_output_file ./build/js/background.js
java -jar compiler.jar --js ./js/storage.js --js ./js/lang.js --js ./js/history.js --js_output_file ./build/js/history.js
java -jar compiler.jar --js ./js/jquery.tablesorter.js --js ./js/jqcloud-1.0.2.min.js --js ./js/apprise-1.5.js --js ./js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/view.js --js ./js/explore.js --js ./js/ad.js --js ./js/counter.js --js_output_file ./build/js/view.js
java -jar compiler.jar --js ./js/storage.js --js ./js/lang.js --js ./js/magic.js --js_output_file ./build/js/magic.js
java -jar compiler.jar --js ./js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/options.js --js_output_file ./build/js/options.js

cp ./css/stylesheet.css ./build/css/stylesheet.css
cat  ./css/jqcloud.css >> ./build/css/stylesheet.css
cat ./css/apprise.css >> ./build/css/stylesheet.css

java -jar yuicompressor-2.4.7.jar  ./build/css/stylesheet.css -o ./build/css/stylesheet.css
java -jar yuicompressor-2.4.7.jar ./css/options.css -o ./build/css/options.css
java -jar yuicompressor-2.4.7.jar ./css/history.css -o ./build/css/history.css
java -jar yuicompressor-2.4.7.jar ./css/magic.css -o ./build/css/magic.css
#<chrome comression



#firefox
mkdir ./build_firefox/chrome
cp -r ./build ./build_firefox/chrome/content

cp -r ./ff_o/firefox/* ./build_firefox/.

java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/storage.js --js ./js/lang.js --js ./js/history.js --js_output_file ./build_firefox/chrome/content/js/history.js
java -jar compiler.jar --js ./js/jquery.tablesorter.js --js ./js/jqcloud-1.0.2.min.js --js ./js/apprise-1.5.js --js ./ff_o/firefox/chrome/content/js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/view.js --js ./js/explore.js --js ./js/ad.js --js ./ff_o/firefox/chrome/content/js/counter.js --js_output_file ./build_firefox/chrome/content/js/view.js
java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/storage.js --js ./js/lang.js --js ./js/magic.js --js_output_file ./build_firefox/chrome/content/js/magic.js
java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/options.js --js_output_file ./build_firefox/chrome/content/js/options.js

rm ./build_firefox/chrome/content/js/storage.js
rm ./build_firefox/chrome/content/js/counter.js
rm -r ./build_firefox/chrome/content/_locales
rm ./build_firefox/chrome/content/manifest.json
rm ./build_firefox/chrome/content/js/background.js
#<firefox

#orera

cp -r ./build ./build_opera/.
rm ./build_opera/build/manifest.json
rm ./build_opera/build/js/background.js
rm -r ./build_opera/build/_locales
cp -r ./ff_o/opera/* ./build_opera/.

java -jar compiler.jar --js ./ff_o/opera/build/js/storage.js --js ./js/lang.js --js ./js/history.js --js_output_file ./build_opera/build/js/history.js
java -jar compiler.jar --js ./js/jquery.tablesorter.js --js ./js/jqcloud-1.0.2.min.js --js ./js/apprise-1.5.js --js ./ff_o/opera/build/js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/view.js --js ./js/explore.js --js ./js/ad.js --js ./ff_o/opera/build/js/counter.js --js_output_file ./build_opera/build/js/view.js
java -jar compiler.jar --js ./ff_o/opera/build/js/storage.js --js ./js/lang.js --js ./js/magic.js --js_output_file ./build_opera/build/js/magic.js
java -jar compiler.jar --js ./ff_o/opera/build/js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/options.js --js_output_file ./build_opera/build/js/options.js

cp ./js/lang.js ./build_opera/build/js/.
rm ./build_opera/build/js/counter.js

#<opera

#chrome ext
cp -r ./build/ ./build_chrome_ext/.
cp -r ./ff_o/chrome_ext/ ./build_chrome_ext/.
cp  ./compressed/ext/popup.html ./build_chrome_ext/.
java -jar yuicompressor-2.4.7.jar ./ff_o/chrome_ext/css/popup.css -o ./build_chrome_ext/css/popup.css
java -jar compiler.jar --js ./js/storage.js --js ./js/lang.js --js ./ff_o/chrome_ext/js/popup.js --js_output_file ./build_chrome_ext/js/popup.js

cp ./compressed/ext/manifest.json ./build_chrome_ext/.
java -jar compiler.jar --js ./js/storage.js --js ./js/lang.js --js ./ff_o/chrome_ext/js/btn.js --js ./js/background.js --js_output_file ./build_chrome_ext/js/background.js
rm ./build_chrome_ext/js/btn.js

#<chr_ext

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