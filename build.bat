rd /S /Q .\build
rd /S /Q .\build_chrome_ext
rd /S /Q .\build_opera
rd /S /Q .\build_firefox_sdk
rd /S /Q .\build_maxthon
mkdir .\build
mkdir .\build_chrome_ext
mkdir .\build_opera
mkdir .\build_firefox_sdk
mkdir .\build_maxthon

xcopy .\_locales .\build\_locales\ /E
xcopy .\js .\build\js\ /E
xcopy .\images .\build\images\ /E
xcopy .\css .\build\css\ /E
copy .\*.html .\build\.
copy .\*.json .\build\.

:: firefox addon sdk
:: need create folder symbol link to addon-sdk\bin and run cfx xpi

mkdir .\build_firefox_sdk\data
xcopy .\build .\build_firefox_sdk\data\ /E
del .\build_firefox_sdk\data\manifest.json
xcopy .\ff_o\firefox\* .\build_firefox_sdk\. /E /Y
xcopy .\js\background.js .\build_firefox_sdk\lib\. /E
del .\build_firefox_sdk\data\js\background.js
del .\build_firefox_sdk\data\js\torrent_lib.js

del .\build_firefox_sdk\data\js\magic.js
del .\build_firefox_sdk\data\magic.html

:: maxthon

xcopy .\build .\build_maxthon\ /E
del .\build_maxthon\manifest.json
xcopy .\ff_o\maxthon\* .\build_maxthon\. /E /Y
del .\maxthon\js\torrent_lib.js
del .\maxthon\data\js\background.js

del .\maxthon\data\js\popup.js
del .\maxthon\data\popup.html

:: base

java -jar compiler.jar --jscomp_warning=const --js .\js\background.js --js_output_file .\build\js\background.js
java -jar compiler.jar --js .\js\counter.js --js_output_file .\build\js\counter.js
java -jar compiler.jar --js .\js\engine.js --js_output_file .\build\js\engine.js
java -jar compiler.jar --js .\js\ex_kit.js --js_output_file .\build\js\ex_kit.js
java -jar compiler.jar --js .\js\explore.js --js_output_file .\build\js\explore.js
java -jar compiler.jar --js .\js\history.js --js_output_file .\build\js\history.js
java -jar compiler.jar --js .\js\lz-string-1.3.3.js --js_output_file .\build\js\lz-string-1.3.3.js
java -jar compiler.jar --js .\js\magic.js --js_output_file .\build\js\magic.js
java -jar compiler.jar --js .\js\mono.js --js_output_file .\build\js\mono.js
java -jar compiler.jar --js .\js\notifer.js --js_output_file .\build\js\notifer.js
java -jar compiler.jar --js .\js\options.js --js_output_file .\build\js\options.js
java -jar compiler.jar --js .\js\popup.js --js_output_file .\build\js\popup.js
del .\build\js\torrent_lib.js
java -jar compiler.jar --js .\js\torrent_lib.min.js --js_output_file .\build\js\torrent_lib.min.js
java -jar compiler.jar --js .\js\view.js --js_output_file .\build\js\view.js
java -jar compiler.jar --js .\js\rate.js --js_output_file .\build\js\rate.js

:: opera

xcopy .\build .\build_opera\build\ /E
del .\build_opera\build\manifest.json
del .\build_opera\build\js\background.js
xcopy .\ff_o\opera\* .\build_opera\. /E

:: chrome extension, opera next

xcopy .\build .\build_chrome_ext\ /E
xcopy .\ff_o\chrome_ext\* .\build_chrome_ext\. /E /Y

:: chrome app

del .\build\js\popup.js
del .\build\popup.html

:: building

del .\build_chrome.zip
del .\build_opera.oex
del .\build_chrome_ext.zip

7za a -tzip .\build_chrome.zip .\build\*
7za a -tzip .\build_opera.oex .\build_opera\*
7za a -tzip .\build_chrome_ext.zip .\build_chrome_ext\*

pause

copy .\build_firefox_sdk\torrents_multisearch.xpi build_firefox.xpi