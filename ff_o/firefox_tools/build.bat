set url="http://static.tms.mooo.com/firefox/update.rdf"
call activate
cd tSearch
call cfx xpi --templatedir=../template --update-url %url%
rename torrents_multisearch.xpi torrents_multisearch_no_store.xpi
call cfx xpi --templatedir=../template