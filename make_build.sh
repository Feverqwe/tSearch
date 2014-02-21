#!/bin/sh
find . -name ".DS_Store" -exec rm {} \;
rm -r ./build
rm -r ./build_opera
rm -r ./build_firefox
rm -r ./build_chrome_ext
mkdir ./build_opera
mkdir ./build_firefox
mkdir ./build_chrome_ext
mkdir ./build

cp -r ./_locales ./build/.
cp -r ./js ./build/.
cp -r ./images ./build/.
cp -r ./css ./build/.
cp *.html ./build/.
cp *.json ./build/.

java -jar compiler.jar --js ./js/torrent_lib_build.js\
 --js ./tracker/anidub.js --js ./tracker/katushka.js --js ./tracker/rustorka.js --js ./tracker/bestrepack.js\
 --js ./tracker/kickass.js --js ./tracker/rutor.js --js ./tracker/bigfangroup.js --js ./tracker/kinozal.js\
 --js ./tracker/rutracker.js --js ./tracker/bitsnoop.js --js ./tracker/libertorrent.js --js ./tracker/tapochek.js\
 --js ./tracker/brodim.js --js ./tracker/megashara.js --js ./tracker/tfile.js --js ./tracker/btdigg.js\
 --js ./tracker/mininova.js --js ./tracker/thepiratebay.js --js ./tracker/evrl.js --js ./tracker/extratorrent.js\
 --js ./tracker/fast-torrent.js --js ./tracker/nnm-club.js --js ./tracker/torrentmac.js --js ./tracker/fenopy.js\
 --js ./tracker/opensharing.js --js ./tracker/torrents.freedom.js --js ./tracker/filebase.js\
 --js ./tracker/opentorrent.js --js ./tracker/torrents.local.js --js ./tracker/free-torrents.js\
 --js ./tracker/piratbit.js --js ./tracker/torrentz.js --js ./tracker/hdclub.js --js ./tracker/piratca.js\
 --js ./tracker/underverse.js --js ./tracker/hurtom.js --js ./tracker/x-torrents.js --js ./tracker/inmac.js\
 --js ./tracker/rgfootball.js --js ./tracker/riperam.js --js ./tracker/ru-board.js\
 --js_output_file ./build/js/torrent_lib.js

rm ./build/js/torrent_lib_build.js

java -jar compiler.jar --js ./js/lz-string-1.3.3.js --js_output_file ./build/js/lz-string-1.3.3.js
java -jar compiler.jar --js ./js/notifer.js --js_output_file ./build/js/notifer.js
java -jar compiler.jar --js ./js/ex_kit.js --js_output_file ./build/js/ex_kit.js
java -jar compiler.jar --js ./js/storage.js --js_output_file ./build/js/storage.js
java -jar compiler.jar --js ./js/lang.js --js_output_file ./build/js/lang.js
java -jar compiler.jar --js ./js/history.js --js_output_file ./build/js/history.js
java -jar compiler.jar --js ./js/background.js --js_output_file ./build/js/background.js
java -jar compiler.jar --js ./js/engine.js --js_output_file ./build/js/engine.js
java -jar compiler.jar --js ./js/view.js --js_output_file ./build/js/view.js
java -jar compiler.jar --js ./js/explore.js --js_output_file ./build/js/explore.js
java -jar compiler.jar --js ./js/ad.js --js_output_file ./build/js/ad.js
java -jar compiler.jar --js ./js/counter.js --js_output_file ./build/js/counter.js
java -jar compiler.jar --js ./js/magic.js --js_output_file ./build/js/magic.js
java -jar compiler.jar --js ./js/options.js --js_output_file ./build/js/options.js

java -jar yuicompressor-2.4.8.jar ./css/stylesheet.css -o ./build/css/stylesheet.css
java -jar yuicompressor-2.4.8.jar ./css/explore.css -o    ./build/css/explore.css
java -jar yuicompressor-2.4.8.jar ./css/options.css -o    ./build/css/options.css
java -jar yuicompressor-2.4.8.jar ./css/history.css -o    ./build/css/history.css
java -jar yuicompressor-2.4.8.jar ./css/magic.css -o      ./build/css/magic.css

java -jar htmlcompressor-1.5.3.jar -t html ./history.html -o ./build/history.html
java -jar htmlcompressor-1.5.3.jar -t html ./index.html   -o ./build/index.html
java -jar htmlcompressor-1.5.3.jar -t html ./magic.html   -o ./build/magic.html
java -jar htmlcompressor-1.5.3.jar -t html ./options.html -o ./build/options.html

# FF

mkdir ./build_firefox/chrome
cp -r ./build ./build_firefox/chrome/content
cp -r ./ff_o/firefox/* ./build_firefox/.

java -jar yuicompressor-2.4.8.jar ./ff_o/firefox/chrome/content/css/popup.css -o ./build_firefox/chrome/content/css/popup.css

java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/storage.js --js_output_file ./build_firefox/chrome/content/js/storage.js
java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/popup.js --js_output_file ./build_firefox/chrome/content/js/popup.js
java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/counter.js --js_output_file ./build_firefox/chrome/content/js/counter.js
java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/button.js --js_output_file ./build_firefox/chrome/content/js/button.js

java -jar htmlcompressor-1.5.3.jar -t html ./ff_o/firefox/chrome/content/popup.html -o ./build_firefox/chrome/content/popup.html

rm -r ./build_firefox/chrome/content/_locales
rm ./build_firefox/chrome/content/manifest.json
rm ./build_firefox/chrome/content/js/background.js
rm ./build_firefox/chrome/content/js/magic.js
rm ./build_firefox/chrome/content/css/magic.css
rm ./build_firefox/chrome/content/magic.html

# FF

# Opera

cp -r ./build ./build_opera/.
rm ./build_opera/build/manifest.json
rm ./build_opera/build/js/background.js
rm ./build_opera/build/js/counter.js
rm ./build_opera/build/js/storage.js
rm -r ./build_opera/build/_locales
cp -r ./ff_o/opera/* ./build_opera/.

java -jar compiler.jar --js ./ff_o/opera/build/js/storage.js --js_output_file ./build_opera/build/js/storage.js
java -jar compiler.jar --js ./ff_o/opera/build/js/counter.js --js_output_file ./build_opera/build/js/counter.js

# Opera

# Chrome extension

cp -r ./build/* ./build_chrome_ext/.
cp -r ./ff_o/chrome_ext/* ./build_chrome_ext/.

java -jar yuicompressor-2.4.8.jar ./ff_o/chrome_ext/css/popup.css -o ./build_chrome_ext/css/popup.css

java -jar compiler.jar --js ./ff_o/chrome_ext/js/popup.js --js_output_file ./build_chrome_ext/js/popup.js
java -jar compiler.jar --js ./ff_o/chrome_ext/js/btn.js --js_output_file ./build_chrome_ext/js/btn.js

java -jar htmlcompressor-1.5.3.jar -t html ./build_chrome_ext/popup.html -o ./build_chrome_ext/popup.html

# Chrome extension

rm ./build_chrome_ext.zip
rm ./build_firefox.zip
rm ./build_chrome.zip
rm ./build_opera.zip

cd ./build/
zip -9 -r ../build_chrome.zip ./
cd ../build_firefox/
zip -9 -r ../build_firefox.xpi ./
cd ../build_opera/
zip -9 -r ../build_opera.oex ./
cd ../build_chrome_ext/
zip -9 -r ../build_chrome_ext.zip ./
cd ..
cp ./build_chrome_ext.zip ./build_opera_nex.nex
