#!/bin/sh
rm ./build.zip
rm -r ./build
rm -r ./build_kango
mkdir ./build
cp -r ./_locales ./build/.
cp -r ./js ./build/.
cp -r ./images ./build/.
cp -r ./css ./build/.
cp -r ./tracker ./build/.
cp *.html ./build/.
cp *.json ./build/.
rm ./build/js/explore.js
rm ./build/js/history.js
rm ./build/js/engine.js
rm ./build/js/jquery.tablesorter.js
rm ./build/js/options.js
rm ./build/js/view.js
rm ./build/js/storage.js
rm ./build/css/options.css
rm ./build/css/history.css
rm ./build/css/stylesheet.css
rm ./build/tracker/*.js
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
java -jar compiler.jar --js ./js/engine.js --js_output_file ./build/js/engine.js
java -jar compiler.jar --js ./js/view.js --js_output_file ./build/js/view.js
java -jar compiler.jar --js ./js/storage.js --js_output_file ./build/js/storage.js
java -jar compiler.jar --js ./js/explore.js --js_output_file ./build/js/explore.js
java -jar compiler.jar --js ./js/history.js --js_output_file ./build/js/history.js
java -jar compiler.jar --js ./js/options.js --js_output_file ./build/js/options.js
java -jar compiler.jar --js ./js/jquery.tablesorter.js --js_output_file ./build/js/jquery.tablesorter.js
java -jar yuicompressor-2.4.7.jar ./css/stylesheet.css -o ./build/css/stylesheet.css
java -jar yuicompressor-2.4.7.jar ./css/options.css -o ./build/css/options.css
java -jar yuicompressor-2.4.7.jar ./css/history.css -o ./build/css/history.css
mkdir ./build_kango
cp -r ./build ./build_kango/.
cp ./kango/main.js ./build_kango/.
cp ./kango/extension_info.json ./build_kango/.
cp ./kango/storage.js ./build_kango/build/js/storage.js
rm ./build_kango/build/js/storage.js
rm ./build_kango/build/manifest.json
rm -r ./build_kango/build/_locales
java -jar compiler.jar --js ./kango/storage.js --js_output_file ./build_kango/build/js/storage.js
cd ./build/
zip -r ../build.zip ./