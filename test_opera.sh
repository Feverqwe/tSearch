#!/bin/sh
find . -name ".DS_Store" -exec rm {} \;

rm -r ./build
mkdir ./build

rm -r ./build_opera
mkdir ./build_opera

cp -r ./_locales ./build/.
cp -r ./js ./build/.
cp -r ./images ./build/.
cp -r ./css ./build/.
cp -r ./tracker ./build/.
cp *.html ./build/.
cp *.json ./build/.

cp -r ./build ./build_opera/.
rm ./build_opera/build/manifest.json
rm ./build_opera/build/js/background.js
rm -r ./build_opera/build/_locales
cp -r ./ff_o/opera/* ./build_opera/.
rm ./build_opera.oex
cd ./build_opera/
zip -9 -r ../build_opera.oex ./