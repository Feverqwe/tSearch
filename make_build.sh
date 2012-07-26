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
cp -r ./kango/icons ./build_kango/.
cp -r ./build ./build_kango/.
cp ./kango/main.js ./build_kango/.
cp ./kango/extension_info.json ./build_kango/.
cp ./kango/storage.js ./build_kango/build/js/storage.js
cd ./build/
zip -r ../build.zip ./