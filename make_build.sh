#!/bin/sh
find . -name ".DS_Store" -exec rm {} \;
rm -r ./build
rm -r ./build_opera
rm -r ./build_firefox
rm -r ./build_chrome_ext
rm -r ./build_chrome_ext_cens
rm -r ./build_chrome_cens
mkdir ./build
mkdir ./build_opera
mkdir ./build_firefox
mkdir ./build_chrome_ext
mkdir ./build_chrome_ext_cens
mkdir ./build_chrome_cens
cp -r ./_locales ./build/.
cp -r ./js ./build/.
cp -r ./images ./build/.
cp -r ./css ./build/.
cp *.html ./build/.
cp *.json ./build/.
cp *.png ./build/.

#>chrome comression
cd ./build/
patch history.html < ../history.patch
patch index.html < ../index.patch
patch magic.html < ../magic.patch
patch options.html < ../options.patch
patch manifest.json < ../manifest.patch
cd ./js/
patch torrent_lib.js < ../../js/torrent_lib.patch
cp torrent_lib.js torrent_lib_patched.js 
cd ../../

rm ./build/js/*.patch
rm ./build/css/*.css

rm ./build/js/ad.js
rm ./build/js/apprise-1.5.js
rm ./build/js/counter.js
rm ./build/js/explore.js
rm ./build/js/jquery.tablesorter.js
rm ./build/js/lang.js
rm ./build/js/storage.js
rm ./build/js/engine.js
rm ./build/js/lz-string-1.3.3.js

#>tr compression
java -jar compiler.jar --js ./build/js/torrent_lib_patched.js --js ./tracker/anidub.js --js ./tracker/katushka.js --js ./tracker/rustorka.js --js ./tracker/bestrepack.js --js ./tracker/kickass.js --js ./tracker/rutor.js --js ./tracker/bigfangroup.js --js ./tracker/kinozal.js --js ./tracker/rutracker.js --js ./tracker/bitsnoop.js --js ./tracker/libertorrent.js --js ./tracker/tapochek.js --js ./tracker/brodim.js --js ./tracker/megashara.js --js ./tracker/tfile.js --js ./tracker/btdigg.js --js ./tracker/mininova.js --js ./tracker/thepiratebay.js --js ./tracker/evrl.js --js ./tracker/thepiratebay2.js --js ./tracker/extratorrent.js --js ./tracker/fast-torrent.js --js ./tracker/nnm-club.js --js ./tracker/torrentmac.js --js ./tracker/fenopy.js --js ./tracker/opensharing.js --js ./tracker/torrents.freedom.js --js ./tracker/filebase.js --js ./tracker/opentorrent.js --js ./tracker/torrents.local.js --js ./tracker/free-torrents.js --js ./tracker/piratbit.js --js ./tracker/torrentz.js --js ./tracker/hdclub.js --js ./tracker/piratca.js --js ./tracker/underverse.js --js ./tracker/hurtom.js --js ./tracker/x-torrents.js --js ./tracker/inmac.js --js ./tracker/rgfootball.js --js ./tracker/youtracker.js --js ./tracker/isohunt.js --js ./tracker/riperam.js --js_output_file ./build/js/torrent_lib.js
rm ./build/js/torrent_lib_patched.js
#<tr compression
java -jar compiler.jar --js ./js/storage.js --js ./js/lang.js --js ./js/background.js --js_output_file ./build/js/background.js
java -jar compiler.jar --js ./js/storage.js --js ./js/lang.js --js ./js/history.js --js_output_file ./build/js/history.js
java -jar compiler.jar --js ./js/jquery.tablesorter.js --js ./js/apprise-1.5.js --js ./js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/view.js --js ./js/explore.js --js ./js/ad.js --js ./js/counter.js --js_output_file ./build/js/view.js
java -jar compiler.jar --js ./js/storage.js --js ./js/lang.js --js ./js/magic.js --js_output_file ./build/js/magic.js
java -jar compiler.jar --js ./js/lz-string-1.3.3.js --js ./js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/options.js --js_output_file ./build/js/options.js

cp ./css/stylesheet.css ./build/css/stylesheet.css
cat ./css/apprise.css >> ./build/css/stylesheet.css

java -jar yuicompressor-2.4.8.jar  ./build/css/stylesheet.css -o ./build/css/stylesheet.css
java -jar yuicompressor-2.4.8.jar ./css/options.css -o ./build/css/options.css
java -jar yuicompressor-2.4.8.jar ./css/history.css -o ./build/css/history.css
java -jar yuicompressor-2.4.8.jar ./css/magic.css -o ./build/css/magic.css

java -jar htmlcompressor-1.5.3.jar -t html ./build/history.html -o ./build/history.html
java -jar htmlcompressor-1.5.3.jar -t html ./build/index.html -o ./build/index.html
java -jar htmlcompressor-1.5.3.jar -t html ./build/magic.html -o ./build/magic.html
java -jar htmlcompressor-1.5.3.jar -t html ./build/options.html -o ./build/options.html
#<chrome comression

#>chrome censure
cp -r ./build/ ./build_chrome_cens/.
java -jar compiler.jar --js ./js/jquery.tablesorter.js --js ./js/apprise-1.5.js --js ./js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/view.js --js ./ff_o/censure/js/explore.js --js ./js/ad.js --js ./js/counter.js --js_output_file ./build_chrome_cens/js/view.js
echo "var censure = true;" >> ./build_chrome_cens/js/torrent_lib.js
#<chrome censure

#firefox
mkdir ./build_firefox/chrome
cp -r ./build ./build_firefox/chrome/content

cp -r ./ff_o/firefox/* ./build_firefox/.

java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/storage.js --js ./js/lang.js --js ./js/history.js --js_output_file ./build_firefox/chrome/content/js/history.js
java -jar compiler.jar --js ./js/jquery.tablesorter.js --js ./js/apprise-1.5.js --js ./ff_o/firefox/chrome/content/js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/view.js --js ./js/explore.js --js ./js/ad.js --js ./ff_o/firefox/chrome/content/js/counter.js --js_output_file ./build_firefox/chrome/content/js/view.js
java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/storage.js --js ./js/lang.js --js ./js/magic.js --js_output_file ./build_firefox/chrome/content/js/magic.js
java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/storage.js --js ./js/lz-string-1.3.3.js --js ./js/lang.js --js ./js/engine.js --js ./js/options.js --js_output_file ./build_firefox/chrome/content/js/options.js

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
java -jar compiler.jar --js ./js/jquery.tablesorter.js --js ./js/apprise-1.5.js --js ./ff_o/opera/build/js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/view.js --js ./js/explore.js --js ./js/ad.js --js ./ff_o/opera/build/js/counter.js --js_output_file ./build_opera/build/js/view.js
java -jar compiler.jar --js ./ff_o/opera/build/js/storage.js --js ./js/lang.js --js ./js/magic.js --js_output_file ./build_opera/build/js/magic.js
java -jar compiler.jar --js ./ff_o/opera/build/js/storage.js --js ./js/lz-string-1.3.3.js --js ./js/lang.js --js ./js/engine.js --js ./js/options.js --js_output_file ./build_opera/build/js/options.js

cp ./js/lang.js ./build_opera/build/js/.
rm ./build_opera/build/js/counter.js

#<opera

#chrome ext
cp -r ./build/ ./build_chrome_ext/.
cp -r ./ff_o/chrome_ext/ ./build_chrome_ext/.
cd ./build_chrome_ext/
patch popup.html < ../ff_o/chrome_ext/popup.patch
patch manifest.json < ../ff_o/chrome_ext/manifest.patch
cd ../

rm ./build_chrome_ext/*.patch

java -jar yuicompressor-2.4.8.jar ./ff_o/chrome_ext/css/popup.css -o ./build_chrome_ext/css/popup.css
java -jar compiler.jar --js ./js/storage.js --js ./js/lang.js --js ./ff_o/chrome_ext/js/popup.js --js_output_file ./build_chrome_ext/js/popup.js
java -jar compiler.jar --js ./js/storage.js --js ./js/lang.js --js ./ff_o/chrome_ext/js/btn.js --js ./js/background.js --js_output_file ./build_chrome_ext/js/background.js

rm ./build_chrome_ext/js/btn.js

java -jar htmlcompressor-1.5.3.jar -t html ./build_chrome_ext/popup.html -o ./build_chrome_ext/popup.html
#<chr_ext

#censure extension
cp -r ./build_chrome_ext/ ./build_chrome_ext_cens/.
java -jar compiler.jar --js ./js/jquery.tablesorter.js --js ./js/apprise-1.5.js --js ./js/storage.js --js ./js/lang.js --js ./js/engine.js --js ./js/view.js --js ./ff_o/censure/js/explore.js --js ./js/ad.js --js ./js/counter.js --js_output_file ./build_chrome_ext_cens/js/view.js
echo "var censure = true;" >> ./build_chrome_ext_cens/js/torrent_lib.js
#<censure

rm ./build_chrome.zip
rm ./build_firefox.xpi
rm ./build_opera.oex
rm ./build_chrome_cens.zip
rm ./build_chrome_ext.zip
rm ./build_chrome_ext_cens.zip
cd ./build/
zip -9 -r ../build_chrome.zip ./
cd ../build_firefox/
zip -9 -r ../build_firefox.xpi ./
cd ../build_opera/
zip -9 -r ../build_opera.oex ./
cd ../build_chrome_ext/
zip -9 -r ../build_chrome_ext.zip ./
cd ../build_chrome_ext_cens/
zip -9 -r ../build_chrome_ext_cens.zip ./
cd ../build_chrome_cens/
zip -9 -r ../build_chrome_cens.zip ./
cd ..
cp ./build_chrome_ext.zip ./build_opera_nex.nex