#!/bin/sh
find . -name ".DS_Store" -exec rm {} \;
rm -r ./chrome_app
rm -r ./build
mkdir ./build
cp -r ./_locales ./build/.
cp -r ./js ./build/.
cp -r ./images ./build/.
cp -r ./css ./build/.
cp -r ./tracker ./build/.
cp *.html ./build/.
cp *.json ./build/.
cp -r ./ff_o/chrome_app/ ./build/.
mv ./build ./chrome_app