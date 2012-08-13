#!/bin/sh
find . -name ".DS_Store" -exec rm {} \;
rm -r ./build_firefox
mkdir ./build_firefox
mkdir ./build_firefox/chrome
cp -r ./build ./build_firefox/chrome/content
cp -r ./ff_o/firefox/* ./build_firefox/.
rm ./build_firefox/chrome/content/js/storage.js
java -jar compiler.jar --js ./ff_o/firefox/chrome/content/js/storage.js --js_output_file ./build_firefox/chrome/content/js/storage.js
rm ./build_firefox/chrome/content/manifest.json
rm -r ./build_firefox/chrome/content/_locales
rm ./build_firefox.xpi
cd ./build_firefox/
zip -r ../build_firefox.xpi ./