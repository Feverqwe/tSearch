del .\build.zip
del /Q .\build
mkdir .\build
mkdir .\build\js
mkdir .\build\_locales
mkdir .\build\_locales\en
mkdir .\build\_locales\ru
mkdir .\build\tracker
mkdir .\build\images
mkdir .\build\css
copy  .\_locales\ru\* .\build\_locales\ru\
copy  .\_locales\en\* .\build\_locales\en\
copy .\js\* .\build\js\
copy .\images\* .\build\images\
copy .\css\* .\build\css\
copy .\tracker\* .\build\tracker\
copy .\*.html .\build\
copy .\*.json .\build\

del .\build\js\explore.js
del .\build\js\history.js
del .\build\js\engine.js
del .\build\js\jquery.tablesorter.js
del .\build\js\options.js
del .\build\js\view.js
del .\build\css\options.css
del .\build\css\history.css
del .\build\css\stylesheet.css

java -jar compiler.jar --js .\js\engine.js --js_output_file .\build\js\engine.js
java -jar compiler.jar --js .\js\view.js --js_output_file .\build\js\view.js
java -jar compiler.jar --js .\js\explore.js --js_output_file .\build\js\explore.js
java -jar compiler.jar --js .\js\history.js --js_output_file .\build\js\history.js
java -jar compiler.jar --js .\js\options.js --js_output_file .\build\js\options.js
java -jar compiler.jar --js .\js\jquery.tablesorter.js --js_output_file .\build\js\jquery.tablesorter.js

java -jar yuicompressor-2.4.7.jar .\css\stylesheet.css -o .\build\css\stylesheet.css
java -jar yuicompressor-2.4.7.jar .\css\options.css -o .\build\css\options.css
java -jar yuicompressor-2.4.7.jar .\css\history.css -o .\build\css\history.css

start "7zip" "C:\Program Files\7-Zip\7z.exe" a D:\tSearch\build.zip D:\tSearch\build\*